#!/bin/bash
# Claude Code 状态栏：模型 effort │ 目录 分支 │ 自动压缩进度 │ 订阅用量
# 只用前景色并以 39m 复位，不用 0m，避免打断 Claude Code 给状态栏加的暗色样式

eval "$(jq -r --slurpfile s "$HOME/.claude/settings.json" '
  def pct: if . == null then "" else round end;
  (.model.id // "" | sub("\\[.*\\]$"; "")) as $id
  | ($s[0].modelSettings[$id].autoCompactWindow // $s[0].autoCompactWindow) as $acw
  | (.context_window.context_window_size // 0) as $size
  # 压缩触发点 = min(模型窗口, autoCompactWindow) - 20000 输出预留 - 13000 缓冲（取自 Claude Code 2.1.306 源码）
  | ((if ($acw | type) == "number" then [$size, $acw] | min else $size end) - 33000) as $limit
  | (.context_window.total_input_tokens // 0) as $used
  | @sh "model=\(.model.display_name // "")",
    @sh "effort=\(.effort.level // "")",
    @sh "fast=\(.fast_mode // false)",
    @sh "dir=\(.workspace.current_dir // .cwd // "")",
    @sh "ctx=\(if $used > 0 and $limit > 0 then [$used * 100 / $limit | round, 100] | min else "" end)",
    @sh "h5=\(.rate_limits.five_hour.used_percentage | pct)",
    @sh "d7=\(.rate_limits.seven_day.used_percentage | pct)"
')"

E=$'\e['
gray=${E}90m red=${E}31m green=${E}32m yellow=${E}33m blue=${E}34m magenta=${E}35m cyan=${E}36m off=${E}39m
sep=" ${gray}│${off} "

# 按占比上色：<60 绿，<85 黄，其余红
tone() { if (( $1 < 60 )); then tc=$green; elif (( $1 < 85 )); then tc=$yellow; else tc=$red; fi; }

# 模型与 effort
case $effort in
  high) ec=$yellow ;; xhigh) ec=$magenta ;; max) ec=$red ;; *) ec=$gray ;;
esac
out="${cyan}${model}${off}${effort:+ ${ec}${effort}${off}}"
[ "$fast" = true ] && out+=" ${yellow}fast${off}"

# 目录与 git 分支，* 表示有未提交改动
if [ -n "$dir" ]; then
  out+="${sep}${blue}${dir##*/}${off}"
  branch=$(git -C "$dir" branch --show-current 2>/dev/null)
  if [ -n "$branch" ]; then
    [ -n "$(git -C "$dir" --no-optional-locks status --porcelain 2>/dev/null | head -n1)" ] && dirty="${yellow}*${off}"
    out+=" ${green} ${branch}${off}${dirty}"
  fi
fi

# 自动压缩进度：8 格，满格即触发
if [ -n "$ctx" ]; then
  tone "$ctx"
  filled=$(( (ctx * 8 + 50) / 100 )) bar=""
  for ((i = 0; i < 8; i++)); do
    if (( i < filled )); then bar+="${tc}▰"; else bar+="${gray}▱"; fi
  done
  out+="${sep}${bar} ${tc}${ctx}%${off}"
fi

# 订阅用量（5 小时 / 7 天），非订阅账号不显示
rl=""
for w in "5h:$h5" "7d:$d7"; do
  v=${w#*:}; [ -n "$v" ] || continue
  tone "$v"
  rl+="${rl:+ ${gray}·${off} }${gray}${w%%:*}${off} ${tc}${v}%${off}"
done
[ -n "$rl" ] && out+="${sep}${rl}"

printf '%s\n' "$out"
