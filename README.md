# ai-dotfiles

AI coding 工具的配置分享，涵盖日常使用中沉淀的规则、脚本和最佳实践。

## 目录

### claude-code/

Claude Code 全套配置，包括：

- **CLAUDE.md** — 用户级规则
- **settings.json** — 权限白名单/黑名单、auto mode 受保护分支规则、模型与 effort、自动压缩窗口、环境变量、插件、attribution、theme
- **statusline.sh** — 状态栏：模型与 effort、目录与分支、距自动压缩进度、订阅用量
- **claude-code-config-share.md** — 全套配置说明

详见 [claude-code/claude-code-config-share.md](claude-code/claude-code-config-share.md)

### codex/

Codex 配置模板，包括：

- **templates/config.toml.template** — 可分享的基础配置模板
- **templates/AGENTS.en.md** — 用户级 AGENTS.md
- **codex-best-practices.md** — Codex 配置最佳实践

## 新机器恢复

以下命令在仓库根目录执行。

### Claude Code

```bash
mkdir -p ~/.claude
for f in CLAUDE.md settings.json statusline.sh; do [ -f ~/.claude/$f ] && cp ~/.claude/$f ~/.claude/$f.bak; done
cp claude-code/CLAUDE.md claude-code/settings.json claude-code/statusline.sh ~/.claude/
chmod +x ~/.claude/statusline.sh

# 插件不会自动安装：先添加 marketplace，再按 settings.json 的 enabledPlugins 安装
claude plugin marketplace add anthropics/claude-plugins-official
claude plugin marketplace add openai/codex-plugin-cc
jq -r '.enabledPlugins | keys[]' ~/.claude/settings.json | xargs -n1 claude plugin install
```

状态栏依赖 `jq`，`which jq` 找不到就先 `brew install jq`。

### Codex

```bash
mkdir -p ~/.codex
[ -f ~/.codex/AGENTS.md ] && cp ~/.codex/AGENTS.md ~/.codex/AGENTS.md.bak
cp codex/templates/AGENTS.en.md ~/.codex/AGENTS.md

# 没有旧配置时直接复制；已有配置则手动合并模板里的设置，保留 projects 和桌面端写入的段
[ -f ~/.codex/config.toml ] || cp codex/templates/config.toml.template ~/.codex/config.toml

# Context7 key 存 macOS 钥匙串（会提示输入，不回显）
security add-generic-password -U -s context7 -a "$USER" -w
```

自建 provider：取消模板示例 C 的注释并填写。`base_url` 是私有地址，不进仓库，从旧机器的 `~/.codex/config.toml` 复制；token 存入钥匙串：`security add-generic-password -U -s <KEYCHAIN_SERVICE> -a "$USER" -w`。

### 验证

- Claude Code：启动后底部显示状态栏，`claude plugin list` 列出全部插件
- Codex：TUI 里 `/mcp` 看到 context7 已连接；`codex exec "say hi"` 正常回复

## License

MIT
