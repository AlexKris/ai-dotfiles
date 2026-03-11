# 我的 Claude Code 配置分享

> 使用 960 次启动的配置沉淀，涵盖 CLAUDE.md、StatusLine、Hooks、Plugins 等全套设置。

---

## 1. 用户级 CLAUDE.md

文件位置：`~/.claude/CLAUDE.md`

```markdown
# Global Rules

## Interaction

- Respond in Chinese
- Be direct. Call out bad design immediately
- Concise output, no filler
- When intent is clear, execute. When ambiguous, ask first
- Give the optimal solution, not multiple options

## Workflow

- IMPORTANT: Non-trivial tasks (3+ steps) require plan mode before implementation
- When something goes wrong, stop and re-plan. Do not push forward blindly
- Read relevant files before modifying them. Never code based on assumptions
- Never delete or rewrite code you don't understand; ask about it instead
- Keep changes minimal. Do not over-engineer or add unrequested features
- Refactor at most once per task. If still unsatisfied, deliver first, iterate later
- Never make changes unrelated to the current task; document them as issues instead

## Verification

- Never mark a task complete without proving it works
- Run tests, check logs, verify output

## Self-Improvement

- After ANY correction: update the project CLAUDE.md so the same mistake never repeats
```

**中文版（可选）：**

```markdown
# 全局规则

## 交互

- 用中文回答
- 直接了当，发现烂设计立即指出
- 输出简洁，不说废话
- 意图明确就执行，模糊就先问
- 给最优方案，不列多选项

## 工作流

- 重要：3 步以上的任务必须先进 plan mode 再动手
- 出错时停下来重新规划，不要硬推
- 修改前先读相关文件，不凭假设写代码
- 不理解的代码不要删除或重写，先问清楚
- 保持最小变更，不过度工程化，不加没要求的功能
- 每个任务最多重构一次，不满意就先交付、后迭代
- 不做与当前任务无关的修改，记为 issue 留后处理

## 验证

- 没有证明可用的任务不算完成
- 跑测试、看日志、验证输出

## 自我改进

- 每次被纠正后：更新项目 CLAUDE.md，确保同样的错误不再犯
```

**设计理念：**

| 原则 | 说明 |
|------|------|
| 中文优先 | 所有交互使用中文 |
| 强制 Plan Mode | 3 步以上任务必须先规划再动手，避免盲目编码 |
| 最小变更 | 不过度工程化，不加无关功能 |
| 自我纠错 | 每次被纠正后更新 CLAUDE.md，形成永久记忆 |

---

## 2. Settings.json

文件位置：`~/.claude/settings.json`

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  },
  "includeCoAuthoredBy": false,
  "permissions": {
    "allow": [
      "Bash(curl:*)",
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(git branch:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(ls:*)",
      "Bash(mkdir:*)",
      "Bash(touch:*)",
      "mcp__plugin_context7_context7__resolve-library-id",
      "mcp__plugin_context7_context7__query-docs"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(curl * | bash)",
      "Bash(curl * | sh)",
      "Bash(wget * | bash)",
      "Bash(ssh *)",
      "Bash(scp *)",
      "Read(~/.ssh/*)",
      "Read(~/.aws/*)",
      "Read(**/.env*)",
      "Read(**/credentials*)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); const cmd=d.tool_input?.command||''; if(/^git\\s+push/.test(cmd)){console.error('[Hook] WARNING: About to git push. Verify branch and remote are correct.');}\""
          }
        ]
      },
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/scripts/hooks/doc-file-warning.js"
          }
        ]
      },
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/scripts/hooks/suggest-compact.js"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/scripts/hooks/post-edit-console-warn.js"
          }
        ]
      },
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/scripts/hooks/post-edit-console-warn.js"
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/scripts/hooks/context-refresh.js"
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/scripts/hooks/session-context.js"
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/scripts/hooks/check-console-log.js"
          }
        ]
      }
    ]
  },
  "statusLine": {
    "type": "command",
    "command": "sh ~/.claude/statusline-command.sh"
  },
  "enabledPlugins": {
    "commit-commands@claude-plugins-official": true,
    "code-simplifier@claude-plugins-official": true,
    "context7@claude-plugins-official": true,
    "frontend-design@claude-plugins-official": false,
    "feature-dev@claude-plugins-official": true,
    "plugin-dev@claude-plugins-official": false,
    "claude-code-setup@claude-plugins-official": true,
    "security-guidance@claude-plugins-official": true,
    "claude-md-management@claude-plugins-official": true,
    "skill-creator@claude-plugins-official": true,
    "superpowers@claude-plugins-official": true
  }
}
```

**亮点：**

- **安全权限白名单**：allow 只放行安全的 bash 命令和 git 操作
- **安全拒绝规则**：deny 阻止 `rm -rf`、`curl|bash` 管道执行、SSH/SCP 远程访问、读取 `.ssh`/`.aws`/`.env`/`credentials` 等敏感文件
- **5 类 Hooks**：SessionStart / UserPromptSubmit / PreToolUse / PostToolUse / Stop，覆盖完整生命周期
- **git push 内联警告**：PreToolUse(Bash) 拦截 git push 并提醒确认分支和远程
- **Agent Teams 实验特性**：通过环境变量开启多 agent 协作
- **去除 Co-authored-by**：commit 信息不带 Claude 署名

---

## 3. StatusLine 脚本

文件位置：`~/.claude/statusline-command.sh`

在终端底部实时显示当前工作状态：

```bash
#!/bin/sh
input=$(cat)

# Parse fields
cwd=$(echo "$input" | jq -r '.workspace.current_dir // .cwd // ""')
model=$(echo "$input" | jq -r '.model.display_name // ""')
used=$(echo "$input" | jq -r '.context_window.used_percentage // empty')
cost=$(echo "$input" | jq -r '.cost.total_cost_usd // empty')
output_tokens=$(echo "$input" | jq -r '.context_window.total_output_tokens // empty')

# Short path: replace $HOME with ~, then keep last 2 components
home="$HOME"
short_cwd=$(echo "$cwd" | sed "s|^$home|~|")
short_cwd=$(echo "$short_cwd" | awk -F'/' '{
  n = NF
  if (n <= 3) print $0
  else print "…/" $(n-1) "/" $n
}')

# Git branch (skip optional lock to avoid blocking)
branch=$(git -C "$cwd" --no-optional-locks symbolic-ref --short HEAD 2>/dev/null)

# Build status parts
parts=""

# cwd
parts="${short_cwd}"

# git branch
if [ -n "$branch" ]; then
  parts="${parts}  ${branch}"
fi

# model
if [ -n "$model" ]; then
  parts="${parts}  ${model}"
fi

# context usage
if [ -n "$used" ]; then
  used_int=$(printf "%.0f" "$used")
  parts="${parts}  used:${used_int}%"

  # Write context usage to temp file for hooks to read
  session_id=$(echo "$input" | jq -r '.session_id // empty')
  if [ -n "$session_id" ]; then
    printf "%s" "$used_int" > "${TMPDIR:-/tmp}/claude-context-pct-${session_id}"
  fi
fi

# output tokens (format as k)
if [ -n "$output_tokens" ]; then
  out_k=$(awk "BEGIN{printf \"%.1f\", $output_tokens/1000}")
  parts="${parts}  out:${out_k}k"
fi

# cost
if [ -n "$cost" ]; then
  parts="${parts}  \$$(printf "%.2f" "$cost")"
fi

printf "%s" "$parts"
```

**显示效果示例：**

```
~/project/myapp  main  Opus 4.6  used:42%  out:15.3k  $1.25
```

**显示内容：**

| 字段 | 说明 |
|------|------|
| 短路径 | `~` 替换 home，只保留最后 2 层目录 |
| Git 分支 | 当前分支名 |
| 模型名 | 当前使用的模型 |
| used% | 上下文窗口使用百分比 |
| out:Xk | 总输出 token 数（千） |
| $X.XX | 本次会话累计费用 |

**桥接机制**：StatusLine 同时将 `used_percentage` 写入临时文件 `$TMPDIR/claude-context-pct-${session_id}`，供 PreToolUse hook 读取。因为 PreToolUse 的 stdin 不包含 `context_window` 数据，需要通过 StatusLine 做桥接。

---

## 4. Plugins（已安装）

```
commit-commands          ✅ 启用  — /commit, /commit-push-pr, /clean_gone
code-simplifier          ✅ 启用  — /simplify 代码简化
context7                 ✅ 启用  — 实时查询最新库文档（替代 MCP Server）
frontend-design          ❌ 关闭  — 高质量前端界面生成（按需开启）
feature-dev              ✅ 启用  — 引导式功能开发（含 code-explorer, code-architect, code-reviewer）
claude-code-setup        ✅ 启用  — 分析项目推荐自动化配置
security-guidance        ✅ 启用  — 安全指导
claude-md-management     ✅ 启用  — CLAUDE.md 审计和改进
skill-creator            ✅ 启用  — 创建、修改和测试自定义 Skills
superpowers              ✅ 启用  — 增强工作流（brainstorming、plan、TDD、debugging 等）
plugin-dev               ❌ 关闭  — 插件开发（按需开启）
```

---

## 5. Hooks 脚本系统

目录结构：

```
~/.claude/scripts/
├── hooks/
│   ├── session-context.js        # SessionStart: 注入 git 状态和项目类型
│   ├── context-refresh.js        # UserPromptSubmit: 长会话周期性提醒
│   ├── doc-file-warning.js       # PreToolUse(Write): 拒绝创建非标准文档
│   ├── suggest-compact.js        # PreToolUse(*): 基于上下文使用率提醒 compact
│   ├── post-edit-console-warn.js # PostToolUse(Edit/Write): 检查 debug 语句
│   └── check-console-log.js      # Stop: 检查修改文件中的 debug 语句
└── lib/
    └── utils.js                  # 跨平台工具函数库
```

另外 settings.json 中有一个**内联 git push 警告钩子**（PreToolUse Bash），无需脚本文件。

### 钩子一览

| 钩子 | 触发点 | 用途 |
|------|--------|------|
| session-context.js | SessionStart | 注入当前分支、最近修改文件、项目语言类型（Go/Python/Node.js） |
| context-refresh.js | UserPromptSubmit | 第 10 次 prompt 后，每 15 次注入关键提醒（中文响应、简洁、先读后改） |
| doc-file-warning.js | PreToolUse(Write) | 拒绝创建非标准文档文件（仅允许 README/CLAUDE/AGENTS 等白名单或 docs/ 目录） |
| suggest-compact.js | PreToolUse(*) | 基于真实上下文使用率提醒：≥70% 建议阶段切换时 compact，≥80% 强烈建议立即 compact，同一阈值只提醒一次 |
| post-edit-console-warn.js | PostToolUse(Edit/Write) | 编辑后扫描文件中的 debug 语句（console.log/print/fmt.Print 等） |
| check-console-log.js | Stop | 停止时扫描所有 git 修改文件中的 debug 语句，提醒提交前清理 |
| *(内联)* git push 警告 | PreToolUse(Bash) | 拦截 `git push` 命令，提醒确认分支和远程是否正确 |

### 设计理念

- **手动 compact 优于自动**：自动 compact 在任意位置触发（约 84%），手动 compact 可以在任务逻辑边界处执行
- **基于真实上下文使用率提醒**：通过 StatusLine → 临时文件 → Hook 的桥接机制，读取真实的 `used_percentage` 而非计数工具调用次数（工具调用次数与上下文占用没有直接关系）
- **两级阈值提醒**：70% 温和提醒（阶段切换时 compact），80% 强烈提醒（立即 compact），同一阈值只提醒一次避免刷屏
- **debug 语句双重检查**：编辑时即时警告 + 停止时全量扫描，防止遗漏
- **文档文件管控**：防止随意创建 .md/.txt 文件造成项目文件膨胀

---

## 6. 实验性功能

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

开启 Agent Teams 协作模式，支持多个 agent 并行工作、任务分配、消息通信。

---

## 7. 快速复制指南

### 最小配置（3 个文件即可生效）

1. **`~/.claude/CLAUDE.md`** — 复制第 1 节内容
2. **`~/.claude/settings.json`** — 复制第 2 节内容
3. **`~/.claude/statusline-command.sh`** — 复制第 3 节内容

### Hooks 脚本部署

```bash
# 复制本仓库中的脚本到 Claude 配置目录
cp -r scripts/ ~/.claude/scripts/
```

> **注意**：settings.json 中的 `~/.claude/...` 路径在 macOS/Linux 下可直接使用，shell 会自动展开 `~`。如不生效，请替换为绝对路径（如 `/home/yourname/.claude/...`）。

### Plugins 安装

```bash
# 在 Claude Code 中执行
/plugins
# 按需启用所需插件（context7 推荐必装，提供实时文档查询）
```

---

*最后更新：2026-03-11*
