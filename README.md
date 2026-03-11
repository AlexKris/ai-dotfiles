# ai-dotfiles

AI coding 工具的配置分享，涵盖日常使用中沉淀的规则、脚本和最佳实践。

## 目录

### claude-code/

Claude Code 全套配置，包括：

- **CLAUDE.md** — 用户级全局规则（中文交互、强制 Plan Mode、最小变更、自我纠错）
- **settings.json** — 权限白名单/黑名单、5 类 Hooks、StatusLine、Plugins 配置
- **statusline-command.sh** — 终端底部状态栏（路径、分支、模型、上下文占用、token、费用）
- **scripts/hooks/** — 6 个生命周期钩子脚本（session 注入、compact 提醒、debug 语句检查等）
- **scripts/lib/utils.js** — 跨平台工具函数库

详见 [claude-code/claude-code-config-share.md](claude-code/claude-code-config-share.md)

## 快速使用

```bash
# 复制配置到 Claude Code 目录
cp claude-code/scripts/ ~/.claude/scripts/ -r
cp claude-code/statusline-command.sh ~/.claude/
# settings.json 和 CLAUDE.md 请参考文档手动配置
```

## License

MIT
