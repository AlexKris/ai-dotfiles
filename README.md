# ai-dotfiles

AI coding 工具的配置分享，涵盖日常使用中沉淀的规则、脚本和最佳实践。

## 目录

### claude-code/

Claude Code 全套配置，包括：

- **settings.json** — 权限白名单/黑名单、安全守卫 Hook、环境变量、attribution、theme
- **hooks/guard-bash.js** — PreToolUse(Bash) 安全守卫脚本，精准拦截 force push、推送 main/master、删除根/系统顶层/家目录
- **claude-code-config-share.md** — 全套配置说明（含用户级 CLAUDE.md、StatusLine、Plugins 推荐清单）

详见 [claude-code/claude-code-config-share.md](claude-code/claude-code-config-share.md)

## 快速使用

```bash
# 安全守卫脚本（settings.json 的 hook 依赖它）
mkdir -p ~/.claude/hooks
cp claude-code/hooks/guard-bash.js ~/.claude/hooks/
# settings.json 和 CLAUDE.md 请参考文档手动配置
```

## License

MIT
