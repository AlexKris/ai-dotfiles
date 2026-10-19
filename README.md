# ai-dotfiles

AI coding 工具的配置分享，涵盖日常使用中沉淀的规则、脚本和最佳实践。

## 目录

### claude-code/

Claude Code 全套配置，包括：

- **settings.json** — 权限白名单/黑名单、auto mode 受保护分支规则、环境变量、attribution、theme
- **provider-resume.zsh** — 官方订阅与备用 API provider 的同 transcript resume 函数
- **claude-code-config-share.md** — 全套配置说明（含用户级 CLAUDE.md、StatusLine、Plugins 推荐清单）

详见 [claude-code/claude-code-config-share.md](claude-code/claude-code-config-share.md)

### codex/

Codex 配置模板，包括：

- **templates/config.toml.template** — 可分享的基础配置模板
- **templates/openrouter.config.toml.template** — OpenRouter profile 模板
- **templates/aihubmix.config.toml.template** — AIHubMix profile 模板
- **codex-best-practices.md** — Codex 配置最佳实践

### 同 transcript 切换 provider

额度用完后不新开对话，而是退出 TUI 并用备用 provider 恢复同一个本地 transcript。

详见 [provider-resume-switching.md](provider-resume-switching.md)

## 快速使用

```bash
# settings.json 和 CLAUDE.md 请参考文档手动配置

# Claude Code provider-resume 函数
source /path/to/ai-dotfiles/claude-code/provider-resume.zsh
```

## License

MIT
