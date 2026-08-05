#!/usr/bin/env bash
# 股市雷达日报 · 本地定时入口（供 macOS launchd 调用）
#
# 功能：
#   1. 激活/创建项目 venv 并安装依赖（仅首次或 requirements 变更时）
#   2. 跑 run_radar_daily.py 采集 + 生成当日日报（含基本面快照）
#   3. 启动 web 服务（若未运行），便于本地浏览器查看
#
# 用法：launchd 每日调用；也可手动执行 ./daily.sh
set -euo pipefail

RADAR_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_DIR="$(cd "$RADAR_DIR/.." && pwd)"
VENV="$RADAR_DIR/.venv"
REQ="$RADAR_DIR/requirements.txt"
LOG="$RADAR_DIR/data/daily.log"

mkdir -p "$(dirname "$LOG")"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] daily.sh 启动" >> "$LOG"

# 0) 跳过非交易日（周六=5, 周日=6）
DOW=$(date +%u)
if [ "$DOW" -ge 6 ]; then
  echo "[$(date)] 非交易日（周末），跳过" >> "$LOG"
  exit 0
fi

# 1) 准备 venv 与依赖
if [ ! -d "$VENV" ]; then
  echo "[$(date)] 创建 venv: $VENV" >> "$LOG"
  python3 -m venv "$VENV"
fi
# 安装/更新依赖（requirements 变更会自动重装）
if [ ! -f "$VENV/.requirements-stamp" ] || [ "$REQ" -nt "$VENV/.requirements-stamp" ]; then
  echo "[$(date)] 安装依赖…" >> "$LOG"
  "$VENV/bin/pip" install -q --upgrade pip >> "$LOG" 2>&1
  "$VENV/bin/pip" install -q -r "$REQ" >> "$LOG" 2>&1
  touch "$VENV/.requirements-stamp"
fi

# 2) 跑每日采集（默认盘后一场；盘前由 launchd 的 morning 任务另起）
SESSION="${1:-evening}"
"$VENV/bin/python" "$REPO_DIR/scripts/run_radar_daily.py" --session "$SESSION" >> "$LOG" 2>&1 || \
  echo "[$(date)] run_radar_daily 失败，见 $LOG" >> "$LOG"

# 3) 确保 web 服务在跑（本地查看用，端口见 config/settings.yml）
if ! curl -s -o /dev/null "http://127.0.0.1:8800/" 2>/dev/null; then
  PORT="$("$VENV/bin/python" -c 'import sys; sys.path.insert(0,"'"$RADAR_DIR"'"); from radar.config import load_settings; print(load_settings().port)' 2>/dev/null || echo 8800)"
  echo "[$(date)] 启动 web 服务 :$PORT" >> "$LOG"
  nohup "$VENV/bin/python" -m radar.web >> "$LOG" 2>&1 &
fi

echo "[$(date)] daily.sh 完成" >> "$LOG"
