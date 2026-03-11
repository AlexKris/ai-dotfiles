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
# Keep at most last 2 path components
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
