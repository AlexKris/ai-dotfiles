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
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "env": {
    "CLAUDE_CODE_DISABLE_1M_CONTEXT": "1",
    "CLAUDE_CODE_DISABLE_AUTO_MEMORY": "1",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1",
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1",
    "CLAUDE_CODE_SUBAGENT_MODEL": "sonnet"
  },
  "attribution": {
    "commit": "",
    "pr": ""
  },
  "permissions": {
    "allow": [
      "Bash(cat:*)",
      "Bash(git:*)",
      "Bash(head:*)",
      "Bash(ls:*)",
      "Bash(mkdir:*)",
      "Bash(node:*)",
      "Bash(npm:*)",
      "Bash(npx:*)",
      "Bash(tail:*)",
      "Bash(touch:*)",
      "Bash(wc:*)",
      "Bash(which:*)",
      "mcp__plugin_context7_context7__query-docs",
      "mcp__plugin_context7_context7__resolve-library-id"
    ],
    "deny": [
      "Bash(curl * | bash)",
      "Bash(curl * | sh)",
      "Bash(git clean *)",
      "Bash(git reset --hard*)",
      "Bash(scp *)",
      "Bash(ssh *)",
      "Bash(wget * | bash)",
      "Read(**/.env*)",
      "Read(**/credentials*)",
      "Read(~/.aws/*)",
      "Read(~/.ssh/*)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node \"$HOME/.claude/hooks/guard-bash.js\""
          }
        ]
      }
    ]
  },
  "skipAutoPermissionPrompt": true,
  "theme": "dark"
}
```

**亮点：**

- **`$schema`**：启用 IDE 自动补全和配置校验
- **去除归因署名**：commit 和 PR 均不带 Claude 署名（使用新版 `attribution` 配置替代已弃用的 `includeCoAuthoredBy`）
- **安全权限白名单**：allow 放行 git、ls、node/npm 等安全命令，curl 需按需确认
- **安全拒绝规则**：deny 阻止 `curl|bash` 管道执行、SSH/SCP 远程访问、破坏性 git 操作（`reset --hard`/`clean`）、读取 `.ssh`/`.aws`/`.env`/`credentials` 等敏感文件
- **精准安全守卫（guard-bash hook）**：不再对 `git push`/`rm` 一刀切全禁，而是用 PreToolUse(Bash) 脚本 `guard-bash.js` 精准拦截真正危险的动作——force push、推送到 `main`/`master`、删除文件系统根/系统顶层目录/家目录（详见第 5 节）。普通 push、项目内 `rm` 正常放行
- **环境变量**：`DISABLE_NONESSENTIAL_TRAFFIC` 关闭遥测/错误报告/自动更新等非必要流量；`DISABLE_1M_CONTEXT`、`DISABLE_AUTO_MEMORY` 关闭按需特性；`SUBAGENT_MODEL=sonnet` 子 agent 用更省成本的模型；`EXPERIMENTAL_AGENT_TEAMS` 开启多 agent 协作
- **Key 按字母序排列**：遵循官方文档 Available settings 表格顺序

---

## 3. StatusLine（claude-hud 插件）

使用 [claude-hud](https://github.com/jarrodwatts/claude-hud) 插件替代自定义脚本，提供多行彩色 HUD 显示。

**安装：**

```bash
# 在 Claude Code 中执行
/plugin marketplace add jarrodwatts/claude-hud
/plugin install claude-hud
/claude-hud:setup
```

**显示内容：**

| 功能 | 说明 |
|------|------|
| 上下文进度条 | 彩色进度条（绿→黄→红），直观显示上下文健康度 |
| 速率限制 | 显示 API 速率限制状态 |
| 工具活动 | 显示正在运行/已完成的工具 |
| Agent 状态 | 显示子 agent 状态和 todo 进度 |
| 会话信息 | 会话时长、配置计数（CLAUDE.md、rules、MCPs） |
| 会话名称 | 显示会话 slug 或自定义标题 |

**可选配置**（`~/.claude/plugins/claude-hud/config.json`）：

```json
{
  "display": {
    "showTools": true,
    "showAgents": true,
    "showTodos": true,
    "showDuration": true,
    "showConfigCounts": true,
    "showSessionName": true
  }
}
```

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
claude-hud               ✅ 启用  — 多行彩色 StatusLine HUD（上下文、工具、agent、todo）
plugin-dev               ❌ 关闭  — 插件开发（按需开启）
```

---

## 5. Hooks

settings.json 配置了一个 **PreToolUse(Bash) 安全守卫钩子**，指向单个精简脚本 `hooks/guard-bash.js`，命中危险动作时 `exit 2` **硬阻断**（优先级高于 `allow` 规则）；未命中则静默放行，交回正常权限流程。

文件位置：`~/.claude/hooks/guard-bash.js`（仓库内：`claude-code/hooks/guard-bash.js`）

| 拦截项 | 触发条件 | 说明 |
|--------|----------|------|
| force push | `git push` 含 `--force` / `--force-with-lease` / `-f` | 普通 push 放行 |
| 推送保护分支 | `git push` 目标为 `main`/`master`（显式写出，或当前分支为 main/master 的裸 `git push`） | 推 feature 分支放行 |
| 危险删除 | `rm` 指向 文件系统根 `/`、根下系统顶层目录（`/etc`、`/usr`、`/Users` 等）、家目录（`~`/`$HOME`） | 项目内删除照常走确认 |

设计要点：脚本通用、无硬编码个人路径（家目录用 `os.homedir()` 动态获取）；用 `exit 2` 而非权限模式，因为 Bash 权限模式是前缀匹配、对「只拦 force / 只拦 main」这类参数级约束会失效（官方文档亦推荐参数级约束用 hook）。

> 早期曾用过 5 个外部 hook 脚本（session-context、context-refresh、suggest-compact、post-edit-console-warn、check-console-log），因维护成本高、收益有限而全部移除。如今只保留 `guard-bash.js` 这一个聚焦安全的守卫脚本——它做的是权限模式无法可靠表达的精准拦截，值得这点维护成本。

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
2. **`~/.claude/settings.json`** — 复制第 2 节内容（statusLine 通过 claude-hud 插件自动配置）
3. **`~/.claude/hooks/guard-bash.js`** — 安全守卫脚本（settings.json 的 hook 依赖它）：

```bash
mkdir -p ~/.claude/hooks
cp claude-code/hooks/guard-bash.js ~/.claude/hooks/
```

### Plugins 安装

```bash
# 在 Claude Code 中执行
/plugins
# 按需启用所需插件（context7 推荐必装，提供实时文档查询）
```

---

*最后更新：2026-06-08*
