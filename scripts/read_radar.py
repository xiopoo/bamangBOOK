#!/usr/bin/env python3
"""供 fulilab 网站读取股市雷达日报数据的桥接脚本（纯标准库，零第三方依赖）。

为什么不用 radar 包：fulilab 以 Vercel 静态导出部署，构建环境不安装
stock-radar 的 Python 依赖。本脚本只用 sqlite3 + json，确保 `next build`
在任意环境都能读取 radar.db，无需 pyyaml 等依赖。

用法：
  python3 scripts/read_radar.py list [limit]
  python3 scripts/read_radar.py detail <date> [session]

输出 JSON 到 stdout（保证 UTF-8）。无数据时返回空结构，不抛错。
"""
from __future__ import annotations

import json
import os
import sqlite3
import sys
from typing import Any, Dict, List

# 与 radar/config.py 默认 DB_PATH 保持一致
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
_DB_PATH = os.path.join(_BASE_DIR, "..", "stock-radar", "data", "radar.db")


def _connect() -> sqlite3.Connection:
    path = os.path.abspath(_DB_PATH)
    conn = sqlite3.connect(path, timeout=30)
    conn.row_factory = sqlite3.Row
    return conn


def _emit(payload: Any) -> None:
    sys.stdout.reconfigure(encoding="utf-8")
    json.dump(payload, sys.stdout, ensure_ascii=False)


def _row_to_date(r: sqlite3.Row) -> Dict[str, Any]:
    return {
        "report_date": r["report_date"],
        "session": r["session"],
        "generated_at": r["generated_at"],
        "engine": r["engine"],
        "overview": (r["overview"] or "")[:120],
    }


def cmd_list(limit: int = 90) -> Dict[str, Any]:
    if not os.path.exists(os.path.abspath(_DB_PATH)):
        return {"ok": True, "dates": [], "by_date": {}}
    conn = _connect()
    try:
        rows = conn.execute(
            "SELECT report_date, session, generated_at, engine, overview "
            "FROM reports ORDER BY report_date DESC, generated_at DESC LIMIT ?",
            (limit,),
        ).fetchall()
    finally:
        conn.close()

    dates = [_row_to_date(r) for r in rows]
    by_date: Dict[str, list] = {}
    for d in dates:
        by_date.setdefault(d["report_date"], []).append(d)
    return {"ok": True, "dates": dates, "by_date": by_date}


def cmd_detail(date: str, session: str | None = None) -> Dict[str, Any]:
    if not os.path.exists(os.path.abspath(_DB_PATH)):
        return {"ok": True, "found": False, "report_date": date, "session": session}
    conn = _connect()
    try:
        sql = "SELECT * FROM reports WHERE report_date = ?"
        args: List[Any] = [date]
        if session:
            sql += " AND session = ?"
            args.append(session)
        sql += " ORDER BY generated_at DESC LIMIT 1"
        row = conn.execute(sql, args).fetchone()
        if not row:
            return {"ok": True, "found": False, "report_date": date, "session": session}
        payload = json.loads(row["payload"] or "{}")
    finally:
        conn.close()

    sections = {}
    for name in ("highlights", "opportunities", "risks", "others"):
        sections[name] = payload.get(name, [])
    return {
        "ok": True,
        "found": True,
        "report_date": row["report_date"],
        "session": row["session"],
        "session_label": payload.get("session_label", row["session"]),
        "engine": row["engine"],
        "generated_at": row["generated_at"],
        "overview": payload.get("overview", ""),
        "stats": payload.get("stats", {}),
        "sections": sections,
    }


def main() -> None:
    args = sys.argv[1:]
    if not args:
        _emit({"ok": False, "error": "missing command: list|detail"})
        return
    cmd = args[0]
    try:
        if cmd == "list":
            limit = int(args[1]) if len(args) > 1 else 90
            _emit(cmd_list(limit))
        elif cmd == "detail":
            if len(args) < 2:
                _emit({"ok": False, "error": "detail requires <date>"})
                return
            session = args[2] if len(args) > 2 else None
            _emit(cmd_detail(args[1], session))
        else:
            _emit({"ok": False, "error": f"unknown command: {cmd}"})
    except Exception as exc:  # noqa: BLE001
        _emit({"ok": False, "error": str(exc)})


if __name__ == "__main__":
    main()
