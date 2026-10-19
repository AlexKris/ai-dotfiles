# 同一 transcript 切换 Provider

目标：官方 Claude Max / ChatGPT Pro 额度正常时走官方订阅；额度用完后退出当前 TUI，用备用 provider 恢复同一个本地 transcript。

这不是服务端热迁移。新 provider 会读取本地 transcript、历史消息和工具结果，但不会继承官方订阅侧的隐藏状态、prompt cache 或 provider 侧缓存。

## Claude Code

加载函数模板：

```bash
source /path/to/ai-dotfiles/claude-code/provider-resume.zsh
```

配置真实 key 时只放本机环境或密码管理器，不写入仓库：

```bash
export OPENROUTER_API_KEY="<your-openrouter-key>"
export AIHUBMIX_API_KEY="<your-aihubmix-key>"
```

官方订阅入口：

```bash
cc
```

备用 provider 继续最近会话：

```bash
ccor-c
ccah-c
```

备用 provider 恢复指定会话：

```bash
ccor-r <session-id-or-name>
ccah-r <session-id-or-name>
```

如需分支而不是污染原 transcript：

```bash
ccor-c --fork-session
ccah-c --fork-session
```

默认模型可覆盖：

```bash
export CC_OPENROUTER_MODEL="~anthropic/claude-sonnet-latest"
export CC_AIHUBMIX_MODEL="claude-sonnet-4-5"
```

恢复后先运行：

```text
/status
```

确认 auth token、base URL 和 model 已切到目标 provider。

## Codex

复制 profile 模板：

```bash
cp codex/templates/openrouter.config.toml.template ~/.codex/openrouter.config.toml
cp codex/templates/aihubmix.config.toml.template ~/.codex/aihubmix.config.toml
```

配置真实 key：

```bash
export OPENROUTER_API_KEY="<your-openrouter-key>"
export AIHUBMIX_API_KEY="<your-aihubmix-key>"
```

官方订阅入口保持不变：

```bash
codex
```

备用 provider 恢复最近 session：

```bash
codex resume --profile openrouter --last
codex resume --profile aihubmix --last
```

备用 provider 恢复指定 session：

```bash
codex resume --profile openrouter <SESSION_ID>
codex resume --profile aihubmix <SESSION_ID>
```

如需分支：

```bash
codex fork --profile openrouter --last
codex fork --profile aihubmix --last
```

恢复后先运行：

```text
/status
```

确认 active model、provider 和上下文容量。profile 文件里必须同时设置 `model_provider` 和目标 provider 可用的 `model`，否则恢复旧 transcript 时可能沿用旧模型名并触发 `model not found`。

## 注意事项

- 不要把 `ANTHROPIC_BASE_URL`、`ANTHROPIC_AUTH_TOKEN`、`ANTHROPIC_MODEL` 长期写入全局 shell 或 `~/.claude/settings.json`，否则官方订阅入口会被覆盖。
- OpenRouter 的 Claude Code base URL 使用 `https://openrouter.ai/api`；Codex provider base URL 使用 `https://openrouter.ai/api/v1`。
- ZenMux 可按同样模式接入，但必须先确认它支持 Claude Code 的 Anthropic Messages API 或 Codex 的 Responses API。
- 长会话跨 provider 恢复可能触发压缩，且不同 provider 的 tool calling、thinking、上下文窗口并不完全一致。
