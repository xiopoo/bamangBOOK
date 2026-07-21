#!/bin/bash
# 每日 9:00 邮件检查脚本
# 检查收件箱新邮件并通过 macOS 通知提醒

PATH="/Users/lucas/.nvm/versions/node/v22.23.1/bin:$PATH"
export HOME="/Users/lucas/Documents/bamangB/bamangBOOK/.agently-cli-home"
STATE_FILE="$HOME/.agently-cli/last_check.txt"

# 获取当前邮件列表（仅收件箱，按时间倒序）
RESULT=$(agently-cli message +list --limit 20 2>/dev/null)

# 检查命令是否成功
OK=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print('true' if d.get('ok') else 'false')" 2>/dev/null)
if [ "$OK" != "true" ]; then
  exit 1
fi

# 读取上次检查时间
LAST_CHECK=""
if [ -f "$STATE_FILE" ]; then
  LAST_CHECK=$(cat "$STATE_FILE")
fi

# 获取最新邮件时间
LATEST_TIME=$(echo "$RESULT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
msgs = d.get('data', {}).get('data', [])
if msgs:
    print(msgs[0].get('created_at', ''))
" 2>/dev/null)

# 保存当前最新时间作为下次检查基准
if [ -n "$LATEST_TIME" ]; then
  echo "$LATEST_TIME" > "$STATE_FILE"
fi

# 如果没有上次记录（首次运行），直接退出
if [ -z "$LAST_CHECK" ]; then
  exit 0
fi

# 统计新邮件
NEW_COUNT=$(echo "$RESULT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
msgs = d.get('data', {}).get('data', [])
count = 0
for m in msgs:
    if m.get('created_at', '') > '$LAST_CHECK' and m.get('dir', {}).get('dir_name') == 'inbox':
        count += 1
print(count)
" 2>/dev/null)

if [ "$NEW_COUNT" -gt 0 ]; then
  # 生成摘要
  SUMMARY=$(echo "$RESULT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
msgs = d.get('data', {}).get('data', [])
lines = []
for m in msgs:
    if m.get('created_at', '') > '$LAST_CHECK' and m.get('dir', {}).get('dir_name') == 'inbox':
        subject = m.get('subject', '(无主题)')
        sender = m.get('from', {}).get('name', m.get('from', {}).get('email', ''))
        lines.append(f'├ {sender}: {subject}')
if len(lines) > 3:
    display = '\n'.join(lines[:3]) + f'\n└ ... 还有 {len(lines)-3} 封'
else:
    display = '\n'.join(lines)
print(display)
" 2>/dev/null)

  osascript -e "display notification \"共 $NEW_COUNT 封新邮件\n$SUMMARY\" with title \"📬 新邮件提醒\" subtitle \"lucasa@agent.qq.com\" sound name \"Ping\""
fi
