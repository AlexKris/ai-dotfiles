# Codex 配置最佳实践（分享版）

最后校验日期：2026-09-08（Asia/Shanghai，Codex CLI 0.153.4）

## 1. 目标与边界

本方案用于个人本地开发与团队内部复用，目标是：

- 保持高效：减少不必要确认，保留关键风险拦截。
- 保持安全：不在模板中暴露密钥、本机路径、个人信息。
- 保持可维护：采用官方支持字段，避免“平台不支持的伪配置”。

本方案不覆盖 Claude Code 专属能力（hooks/statusline/plugin lifecycle）。

## 2. 本机同步配置（脱敏版）

`templates/config.toml.template` 同步本机可迁移的运行设置和桌面偏好，并移除隐私与机器状态。模板值代表同步时的个人设置，不是 Codex 默认值。

### 2.1 运行配置

| 配置项 | 模板值 | 功能 | 说明 |
|---|---|---|---|
| `personality` | `pragmatic` | 默认输出风格 | 工程导向、少废话，适配代码协作。 |
| `commit_attribution` | `""` | 提交归属尾注 | 关闭自动 attribution，避免 commit message 出现 Codex/AI 尾注。 |
| `approval_policy` | `on-request` | 审批触发策略 | 交互式开发的平衡默认，避免 `never` 带来的误操作风险。 |
| `approvals_reviewer` | `auto_review` | 审批处理方式 | 与本机一致，由自动审查处理审批请求。 |
| `sandbox_mode` | `workspace-write` | 执行沙箱级别 | 允许工作区写入，默认仍受沙箱边界约束。 |
| `model` | `gpt-6-astra` | 默认模型 | 保留本机选择，使用前按账户可用模型调整。 |
| `model_reasoning_effort` / `plan_mode_reasoning_effort` | `max` | 普通任务 / Plan 模式推理强度 | 保留本机偏好，按任务调整。 |
| `service_tier` | `default` | 默认服务层级 | 保留本机 CLI 配置。 |
| `features.context_management.experimental_mode` | `true` | 实验性上下文管理 | 通过笔记和可搜索历史保留长任务细节；需要 ChatGPT Plus、Pro 或 Pro Lite 登录，新建任务生效。 |

模型与推理强度属于可分享偏好，本次按同步要求保留；其他使用者应按自己的账户和任务调整。

### 2.2 工具与桌面设置

| 配置项 | 模板状态 | 用途 | 说明 |
|---|---|---|---|
| `mcp_servers.context7` | 已配置，密钥为占位符 | 实时文档检索 | 使用前仅在本机替换 `<CONTEXT7_API_KEY>`。 |
| `mcp_servers.openaiDeveloperDocs` | 已配置 | OpenAI 官方文档检索 | 保留公开 MCP 地址。 |
| `desktop` | 已同步 | 桌面界面与任务偏好 | 包含主题、语言、队列和编辑器偏好；桌面服务层级保留为 `priority`。 |
| `[sandbox_workspace_write]` 细粒度字段 | 注释 | 按需控制 tmp/network 行为 | 仅保留通用示例。 |
| `[projects."<ABS_PATH>"].trust_level` | 注释 | 按需信任本机项目 | 仅保留占位示例，不复制真实路径。 |

未同步项：本机通知脚本、真实项目路径、依赖本机安装路径的 MCP、插件与市场安装记录、模型提示状态、环境信任哈希及 hook 信任记录。已被当前 CLI 标记为移除的 `features.js_repl` 也不复制；本机该项保持原样。

## 3. AGENTS.md 最佳实践（用户级规则）

建议保持 `~/.codex/AGENTS.md` 为一份简洁的用户级规则文件。团队分享时优先英文模板，个人使用可直接采用中文模板。建议至少包含以下规则：

- 响应语言偏好（如默认中文）与输出风格（direct + concise）。
- 只在全局文件中放通用规则；仓库特有要求放到项目自己的 `AGENTS.md`。
- 非 trivial 任务先规划再动手。
- 修改前必须先读相关文件，禁止凭假设改代码。
- 任务完成前必须有可验证证据（测试/输出/日志）。
- 提交信息使用 Conventional Commits，且不含 AI/Codex attribution。

说明：AGENTS 用于“行为约束”，`config.toml` 用于“运行时开关”，两者应同时存在。

## 4. 不应照搬的 Claude Code 配置

以下能力在 Codex 中不能 1:1 迁移：

- Claude hooks 生命周期：`PreToolUse` / `PostToolUse` / `Stop` / `SessionStart`
- Claude statusline 自定义命令
- Claude plugin 开关配置格式

等效做法：

- 用 `AGENTS.md` 固化流程约束。
- 用提交前检查脚本/命令作为手动 gate（如 debug 语句扫描）。
- 用 MCP 服务器替代插件能力扩展。

## 5. 分享与脱敏规范

发布前，必须满足：

- 模板中不得包含真实 API Key、Token、密码。
- 模板中不得包含真实本机绝对路径（用户名路径）。
- 示例变量统一使用占位符（如 `<CONTEXT7_API_KEY>`、`<ABS_PATH_TO_REPO_1>`）。
- 如历史曾暴露密钥，先轮换后再发布模板。

推荐扫描命令：

```bash
rg -n --hidden -S "(api[_-]?key|token|secret|password|ctx7sk-|sk-[A-Za-z0-9]{20,})" codex/
```

## 6. 快速复制与迁移清单

### 6.1 最小落地文件

只需要这 2 个文件即可落地：

1. `templates/config.toml.template`
2. `templates/AGENTS.en.md`（英文）或 `templates/AGENTS.zh-CN.md`（中文，二选一）

配置 `context7` 密钥时可参考：

3. `templates/.env.example`

### 6.2 迁移步骤

#### A. 迁移前

- [ ] 备份现有文件：`~/.codex/config.toml`、`~/.codex/AGENTS.md`
- [ ] 轮换历史可能已暴露的 API Key（尤其是 MCP 相关 key）
- [ ] 确认目标机器已安装所需运行时（如 `node`、`npx`）

#### B. 套用模板

- [ ] 将 `templates/config.toml.template` 中的设置合并到本机 `~/.codex/config.toml`，保留已有的本机专用配置
- [ ] 在 `templates/AGENTS.en.md` 与 `templates/AGENTS.zh-CN.md` 中二选一，复制为本机 `~/.codex/AGENTS.md`
- [ ] 按账户和任务检查模板中的模型、推理强度与服务层级
- [ ] 按本机环境替换占位符：
  - [ ] `<CONTEXT7_API_KEY>`（仅在启用 context7 时需要）
  - [ ] `<ABS_PATH_TO_REPO_1>`（仅在启用 `projects.trust_level` 时需要）

#### C. 功能验证

- [ ] 打开 Codex 新会话，确认无解析错误
- [ ] 确认 `features.context_management.experimental_mode = true`，并新建任务使用实验性上下文管理
- [ ] 验证风格是否生效（`personality`）
- [ ] 在工作区内做一次普通写操作，确认 `workspace-write` 行为符合预期
- [ ] 执行一次需审批的操作，确认 `on-request` 触发正确
- [ ] 让助手生成 commit message，确认无 attribution 尾注

#### D. 分享前安全检查

- [ ] 确认模板中无真实密钥与真实路径
- [ ] 对分享目录执行敏感词扫描：

```bash
rg -n --hidden -S "(api[_-]?key|token|secret|password|ctx7sk-|sk-[A-Za-z0-9]{20,})" codex/
```

- [ ] 仅发布模板与文档，禁止发布本机真实 `~/.codex/config.toml`

## 7. 参考来源

官方（主来源）：

- Config basics: https://developers.openai.com/codex/config-basic
- Config reference: https://developers.openai.com/codex/config-reference
- Config schema: https://developers.openai.com/codex/config-schema.json
- Experimental context management: https://learn.chatgpt.com/docs/models#experimental-context-management
- AGENTS.md guide: https://developers.openai.com/codex/guides/agents-md
- Sample config: https://developers.openai.com/codex/config-sample

社区（增强参考）：

- `fcakyon/claude-codex-settings`: https://github.com/fcakyon/claude-codex-settings
- `ComposioHQ/awesome-codex-skills`: https://github.com/ComposioHQ/awesome-codex-skills
- `openai/codex-action`: https://github.com/openai/codex-action
