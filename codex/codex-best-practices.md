# Codex 配置最佳实践（分享版）

最后校验日期：2026-10-22（Asia/Shanghai，Codex CLI 0.163.0）

## 1. 目标与边界

本方案用于个人本地开发与团队内部复用，目标是：

- 保持高效：减少不必要确认，保留关键风险拦截。
- 保持安全：不在模板中暴露密钥、本机路径、个人信息。
- 保持可维护：采用官方支持字段，避免“平台不支持的伪配置”。

本方案不包含 hooks、状态栏、插件的定制配置。

## 2. 本机同步配置（脱敏版）

`templates/config.toml.template` 同步本机可迁移的运行设置和桌面偏好，并移除隐私与机器状态。模板值代表同步时的个人设置，不是 Codex 默认值。

### 2.1 运行配置

| 配置项 | 模板值 | 生效端 | 功能 | 说明 |
|---|---|---|---|---|
| `commit_attribution` | `""` | 仅桌面端 | 桌面端提交署名回退值 | 只作用于桌面端自己的提交按钮。署名开关以账户设置为准；桌面端读不到账户设置时才用此值，`""` 表示不加署名。CLI 不读取此项。 |
| `approval_policy` | `on-request` | 两端 | 审批触发策略 | 交互式开发的平衡默认，避免 `never` 带来的误操作风险。 |
| `approvals_reviewer` | `auto_review` | 两端 | 审批处理方式 | 由审查子代理收集上下文、评估风险后批准或拒绝；旧名 `guardian_subagent`（桌面端仍会写入）与之等价。 |
| `sandbox_mode` | `workspace-write` | 两端 | 执行沙箱级别 | 允许工作区写入，默认仍受沙箱边界约束。 |
| `model` | `gpt-6-astra` | 两端 | 默认模型 | 保留本机选择，使用前按账户可用模型调整；桌面端可按对话切换。 |
| `model_reasoning_effort` / `plan_mode_reasoning_effort` | `xhigh` / `ultra` | 两端 | 普通任务 / Plan 模式推理强度 | 保留本机偏好，按任务调整。 |
| `service_tier` | `priority` | CLI | 默认服务层级（Fast） | 桌面端用 `desktop.default-service-tier`。经自建 provider 时，响应里的 `service_tier` 始终是 `default`，不能据此判断，以输出速度为准。 |
| `model_provider` | 注释 | 两端 | 默认 provider | 使用自建 provider 时取消注释，并启用模板末尾的 provider 示例。 |
| `features.daemon_auto_start` | `false` | CLI | CLI 常驻服务自动启动 | 0.163.0 默认开启，这里显式关闭。 |

模型与推理强度属于可分享偏好，本次按同步要求保留；其他使用者应按自己的账户和任务调整。

### 2.2 工具与桌面设置

| 配置项 | 模板状态 | 生效端 | 用途 | 说明 |
|---|---|---|---|---|
| `mcp_servers.context7` | 已配置，官方远程服务 | 两端 | 实时文档检索 | key 存 macOS 钥匙串（service=`context7`），由 `http_headers_helper` 取出作为请求头，配置中不写明文。 |
| `mcp_servers.openaiDeveloperDocs` | 已配置 | 两端 | OpenAI 官方文档检索 | 保留公开 MCP 地址。 |
| `desktop` | 已同步 | 仅桌面端 | 桌面界面与任务偏好 | 包含主题、语言、队列和编辑器偏好；桌面服务层级保留为 `priority`。 |
| `[sandbox_workspace_write]` 细粒度字段 | 注释示例 | 两端 | 按需控制 tmp/network 行为 | 仅保留通用示例。 |
| `[projects."<ABS_PATH>"].trust_level` | 注释示例 | 两端 | 按需信任本机项目 | 仅保留占位示例，不复制真实路径。 |
| `[model_providers.<id>]` 及 `.auth` | 注释示例 | 两端 | 自建或第三方 provider，token 从 macOS 钥匙串读取 | 代替明文 `experimental_bearer_token`（官方不推荐）；桌面端读不到 shell 环境变量时也能用。存入或轮换 token：`security add-generic-password -U -s <KEYCHAIN_SERVICE> -a "$USER" -w`。 |

未同步项：自建 provider 地址与 token、本机通知脚本、真实项目路径、依赖本机安装路径的 MCP、插件与市场安装记录、模型提示状态、环境信任哈希及 hook 信任记录。其中 `tui.*` 只对 CLI 生效，其余（`notify`、`mcp_servers.node_repl`、`plugins`、`marketplaces`、`hooks.state`、`shell_environment_policy.set`）由桌面端自动写入、两端共用。已被当前 CLI 标记为移除的 `features.js_repl` 也不复制；本机该项保持原样。

## 3. AGENTS.md 最佳实践（用户级规则）

建议保持 `~/.codex/AGENTS.md` 为一份简洁的用户级规则文件。建议至少包含以下规则：

- 输出风格（direct + concise）。
- 只在全局文件中放通用规则；仓库特有要求放到项目自己的 `AGENTS.md`。
- 非 trivial 任务先规划再动手。
- 修改前必须先读相关文件，禁止凭假设改代码。
- 任务完成前必须有可验证证据（测试/输出/日志）。
- 提交信息使用 Conventional Commits，且不含 AI/Codex attribution。

说明：AGENTS 用于“行为约束”，`config.toml` 用于“运行时开关”，两者应同时存在。`personality` 已废弃（`friendly` / `pragmatic` 不再选择风格），输出风格只靠 AGENTS.md 控制。

## 4. 从 Claude Code 迁移时的差异

Codex 已有对应能力，但配置格式不同，不能直接复制 Claude Code 的 JSON：

- Hooks：`[hooks]` 支持 `PreToolUse` / `PostToolUse` / `Stop` / `SessionStart` / `UserPromptSubmit` 等 12 个事件，结构同样是 `matcher` + `hooks` 列表，需改写成 TOML。
- 状态栏：`tui.status_line` 只能从内置条目中选择和排序，不能像 Claude Code 那样运行自定义命令。
- 插件：Codex 有自己的插件与 marketplace（`[plugins."<plugin>@<marketplace>"]`），Claude Code 插件不能直接安装。

流程约束仍建议写在 `AGENTS.md`，外部能力优先用 MCP 服务器接入。

## 5. 分享与脱敏规范

发布前，必须满足：

- 模板中不得包含真实 API Key、Token、密码。
- 模板中不得包含真实本机绝对路径（用户名路径）。
- 示例变量统一使用占位符（如 `<ABS_PATH_TO_REPO_1>`、`<PROVIDER_ID>`）；密钥一律存钥匙串，不进配置。
- 如历史曾暴露密钥，先轮换后再发布模板。

推荐扫描命令：

```bash
rg -n --hidden -S "(api[_-]?key|token|secret|password|ctx7sk-|sk-[A-Za-z0-9]{20,})" codex/
```

## 6. 快速复制与迁移清单

### 6.1 最小落地文件

只需要这 2 个文件即可落地：

1. `templates/config.toml.template`
2. `templates/AGENTS.en.md`

### 6.2 迁移步骤

#### A. 迁移前

- [ ] 备份现有文件：`~/.codex/config.toml`、`~/.codex/AGENTS.md`
- [ ] 轮换历史可能已暴露的 API Key（尤其是 MCP 相关 key）

#### B. 套用模板

- [ ] 将 `templates/config.toml.template` 中的设置合并到本机 `~/.codex/config.toml`，保留已有的本机专用配置
- [ ] 将 `templates/AGENTS.en.md` 复制为本机 `~/.codex/AGENTS.md`
- [ ] 按账户和任务检查模板中的模型、推理强度与服务层级
- [ ] 启用 context7 时，把 key 存入钥匙串：`security add-generic-password -U -s context7 -a "$USER" -w`
- [ ] 按本机环境替换占位符 `<ABS_PATH_TO_REPO_1>`（仅在启用 `projects.trust_level` 时需要）
- [ ] 如使用自建 provider，取消模板中 `model_provider` 和末尾 provider 示例的注释并填写；`base_url` 等私有地址不进仓库，从旧机器的 `~/.codex/config.toml` 复制，token 存入钥匙串，不在配置里写明文
- [ ] 不复制本机的 `notify`、`mcp_servers.node_repl`、`plugins`、`marketplaces`、`hooks.state` 和 `tui` 提示状态：ChatGPT 桌面端会自动写入；项目信任在首次打开项目时由 Codex 询问

#### C. 功能验证

- [ ] 打开 Codex 新会话，确认无解析错误
- [ ] TUI 里执行 `/mcp`，确认 context7 已连接
- [ ] 执行 `codex exec "say hi"`，确认 provider 与钥匙串 token 可用
- [ ] 验证 `AGENTS.md` 规则是否生效（如非 trivial 任务先给计划）
- [ ] 在工作区内做一次普通写操作，确认 `workspace-write` 行为符合预期
- [ ] 执行一次需审批的操作，确认 `on-request` 触发正确
- [ ] 让助手生成 commit message，确认无 attribution 尾注（署名由账户设置控制）

#### D. 分享前安全检查

- [ ] 确认模板中无真实密钥与真实路径
- [ ] 对分享目录执行敏感词扫描：

```bash
rg -n --hidden -S "(api[_-]?key|token|secret|password|ctx7sk-|sk-[A-Za-z0-9]{20,})" codex/
```

- [ ] 仅发布模板与文档，禁止发布本机真实 `~/.codex/config.toml`

## 7. 参考来源

官方（主来源）：

- Config basics: https://learn.chatgpt.com/docs/config-file/config-basic
- Config reference: https://learn.chatgpt.com/docs/config-file/config-reference
- Config schema: https://learn.chatgpt.com/docs/config-schema.json
- AGENTS.md guide: https://learn.chatgpt.com/docs/agent-configuration/agents-md
- Sample config: https://learn.chatgpt.com/docs/config-file/config-sample

社区（增强参考）：

- `fcakyon/claude-codex-settings`: https://github.com/fcakyon/claude-codex-settings
- `ComposioHQ/awesome-codex-skills`: https://github.com/ComposioHQ/awesome-codex-skills
- `openai/codex-action`: https://github.com/openai/codex-action
