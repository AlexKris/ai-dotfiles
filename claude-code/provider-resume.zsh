# Claude Code provider-resume helpers.
# Source this file from ~/.zshrc, then set the provider keys in your local shell
# or password manager. Do not commit real keys to this repository.

# Official subscription entry. Clears API routing variables so Claude Code uses
# your signed-in Claude subscription instead of a third-party provider.
cc() {
  env -u ANTHROPIC_BASE_URL \
      -u ANTHROPIC_AUTH_TOKEN \
      -u ANTHROPIC_API_KEY \
      -u ANTHROPIC_MODEL \
      -u ANTHROPIC_DEFAULT_OPUS_MODEL \
      -u ANTHROPIC_DEFAULT_SONNET_MODEL \
      -u ANTHROPIC_DEFAULT_HAIKU_MODEL \
      -u CLAUDE_CODE_SUBAGENT_MODEL \
      claude "$@"
}

# Resume a specific Claude Code session through OpenRouter:
# ccor-r <session-id-or-name>
ccor-r() {
  local model="${CC_OPENROUTER_MODEL:-anthropic/claude-fable-5}"
  local submodel="${CC_OPENROUTER_SUB_MODEL:-anthropic/claude-sonnet-5}"
  env -u ANTHROPIC_API_KEY \
      ANTHROPIC_BASE_URL="https://openrouter.ai/api" \
      ANTHROPIC_AUTH_TOKEN="$OPENROUTER_API_KEY" \
      ANTHROPIC_MODEL="$model" \
      CLAUDE_CODE_SUBAGENT_MODEL="$submodel" \
      claude --model "$model" --resume "$@"
}

# Resume a specific Claude Code session through AIHubMix:
# ccah-r <session-id-or-name>
ccah-r() {
  local model="${CC_AIHUBMIX_MODEL:-claude-fable-5}"
  local submodel="${CC_AIHUBMIX_SUB_MODEL:-claude-fable-5}"
  env -u ANTHROPIC_API_KEY \
      ANTHROPIC_BASE_URL="https://aihubmix.com" \
      ANTHROPIC_AUTH_TOKEN="$AIHUBMIX_API_KEY" \
      ANTHROPIC_MODEL="$model" \
      CLAUDE_CODE_SUBAGENT_MODEL="$submodel" \
      claude --model "$model" --resume "$@"
}

# Resume a specific Claude Code session through ZenMux:
# cczm-r <session-id-or-name>
cczm-r() {
  local model="${CC_ZENMUX_MODEL:-claude-fable-5}"
  local submodel="${CC_ZENMUX_SUB_MODEL:-claude-sonnet-5}"
  env -u ANTHROPIC_API_KEY \
      ANTHROPIC_BASE_URL="https://zenmux.ai/api/anthropic" \
      ANTHROPIC_AUTH_TOKEN="$ZENMUX_API_KEY" \
      ANTHROPIC_MODEL="$model" \
      CLAUDE_CODE_SUBAGENT_MODEL="$submodel" \
      claude --model "$model" --resume "$@"
}

# Resume a specific Claude Code session through AIHubMix:
# cchi-r <session-id-or-name>
cchi-r() {
  local model="${CC_HALO_MODEL:-claude-fable-5}"
  local submodel="${CC_HALO_SUB_MODEL:-claude-fable-5}"
  env -u ANTHROPIC_API_KEY \
      ANTHROPIC_BASE_URL="https://my.halocloud.net/ai/v1" \
      ANTHROPIC_AUTH_TOKEN="$HALO_API_KEY" \
      ANTHROPIC_MODEL="$model" \
      CLAUDE_CODE_SUBAGENT_MODEL="$submodel" \
      claude --model "$model" --resume "$@"
}
