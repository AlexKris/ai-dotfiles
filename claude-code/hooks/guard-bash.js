#!/usr/bin/env node
// PreToolUse(Bash) 守卫。命中危险动作时 exit 2 阻断；其余 exit 0 静默放行。
//   - git force-push（--force / --force-with-lease / -f）
//   - git push 到保护分支 main/master（显式写出 OR 当前分支为 main/master 的裸 push）
//   - rm 指向 文件系统根 / 根下系统顶层目录 / 家目录
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');

function deny(reason) {
  process.stderr.write('[guard-bash] BLOCKED: ' + reason + '\n');
  process.exit(2); // exit 2 在权限规则之前中止调用，优先于 allow
}

let input;
try { input = JSON.parse(fs.readFileSync(0, 'utf8')); }
catch { process.exit(0); } // 解析失败不干预

const cmd = (input.tool_input && input.tool_input.command) || '';
const cwd = input.cwd || process.cwd();
const home = os.homedir();

// ---------- git push 守卫 ----------
if (/\bgit\s+push\b/.test(cmd)) {
  // force push：--force / --force-with-lease / -f（含 -uf 等组合短旗标）
  if (/--force\b/.test(cmd) || /(^|\s)-[A-Za-z]*f[A-Za-z]*(\s|$)/.test(cmd)) {
    deny('git force-push is not allowed.');
  }

  const after = cmd.replace(/^.*?\bgit\s+push\b/, '').trim();
  const tokens = after ? after.split(/\s+/) : [];
  const nonFlag = tokens.filter(t => !t.startsWith('-'));

  const isProtectedRef = t =>
    /^(main|master)$/.test(t) || /:(main|master)$/.test(t) || /^(main|master):/.test(t);

  // 显式推送到 main/master：origin main / HEAD:main / main:main / -u origin master ...
  if (nonFlag.some(isProtectedRef)) {
    deny('push to protected branch main/master is not allowed.');
  }

  // 裸 push（remote 之后无显式 refspec，或推 HEAD）→ 解析当前分支
  const refspecs = nonFlag.slice(1); // 丢掉第一个非旗标 token（remote）
  const pushesCurrent = refspecs.length === 0 || refspecs.some(t => /^HEAD$/.test(t));
  if (pushesCurrent) {
    let branch = '';
    try {
      branch = execSync('git -C ' + JSON.stringify(cwd) + ' symbolic-ref --quiet --short HEAD',
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch { /* 游离 HEAD / 非仓库 → 无法判断，放行 */ }
    if (branch === 'main' || branch === 'master') {
      deny('current branch is "' + branch + '"; pushing it is not allowed.');
    }
  }
}

// ---------- rm 守卫 ----------
if (/\brm\b/.test(cmd)) {
  const tokens = cmd.split(/\s+/).filter(t => t && !t.startsWith('-'));
  for (const raw of tokens) {
    let t = raw.replace(/\/+\*?$/, '') || '/';        // "/"→"/", "/*"→"/", "/etc/"→"/etc"
    t = t.replace(/^~(?=$|\/)/, home).replace(/^\$HOME(?=$|\/)/, home); // 展开 ~ / $HOME
    if (raw === '~' || raw === '$HOME') t = home;
    if (raw === '/' || raw === '/*' || t === '/') deny('refusing to delete filesystem root: ' + raw);
    if (t === home) deny('refusing to delete home directory: ' + raw);
    if (/^\/[^/]+$/.test(t)) deny('refusing to delete a root-level path: ' + raw); // /etc /usr /Users ...
  }
}

process.exit(0);
