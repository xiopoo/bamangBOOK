#!/usr/bin/env python3
"""每日股市雷达采集入口（供 cron / GitHub Actions 调用）。

仅做基本面采集与日报生成，写入 stock-radar/data/radar.db。
fulilab 网站在构建时读取该库展示「信息日报」。

用法：
  python3 scripts/run_radar_daily.py            # 默认盘后(evening)一场
  python3 scripts/run_radar_daily.py --session morning
  python3 scripts/run_radar_daily.py --date 2026-08-05

退出码 0 表示成功；采集到的信号数会打印到 stderr。
"""
from __future__ import annotations

import argparse
import logging
import os
import sys

# 让脚本可 import stock-radar/radar 包
_HERE = os.path.dirname(os.path.abspath(__file__))
_RADAR_DIR = os.path.join(os.path.dirname(_HERE), "stock-radar")
if _RADAR_DIR not in sys.path:
    sys.path.insert(0, _RADAR_DIR)

from radar.report import run_full, SESSION_LABEL  # noqa: E402


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    parser = argparse.ArgumentParser(description="每日股市雷达基本面采集")
    parser.add_argument("--session", choices=["morning", "evening"], default=None,
                        help="场次：morning=盘前, evening=盘后（默认按当前时间推断）")
    parser.add_argument("--date", default=None, help="指定交易日 YYYY-MM-DD（默认今天）")
    args = parser.parse_args()

    session = args.session or ("morning" if __import__("datetime").datetime.now().hour < 12 else "evening")
    label = SESSION_LABEL.get(session, session)
    print(f"[run_radar_daily] 开始 {args.date or '今天'} {label} 基本面采集…", file=sys.stderr)

    result = run_full(session=session)
    collect = result.get("collect", {})
    report = result.get("report", {})
    print(f"[run_radar_daily] 采集原始 {collect.get('collected', 0)} 条，"
          f"去重 {collect.get('deduped', 0)} 条；"
          f"日报保留 {report.get('stats', {}).get('kept', 0)} 条 "
          f"(highlight {len(report.get('highlights', []))}, "
          f"opportunity {len(report.get('opportunities', []))}, "
          f"risk {len(report.get('risks', []))})", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
