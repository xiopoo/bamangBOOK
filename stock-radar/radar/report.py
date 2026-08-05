"""日报生成：读取当日信号 → AI 精选 → 落库。"""
from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Dict, Optional

from . import store
from .analyzer import analyze_signals
from .config import load_settings

log = logging.getLogger("radar.report")


def session_of(now: Optional[datetime] = None) -> str:
    """按当前时间推断场次：盘前 / 盘后。"""
    now = now or datetime.now()
    return "morning" if now.hour < 12 else "evening"


SESSION_LABEL = {"morning": "盘前", "evening": "盘后", "manual": "手动"}


def generate_report(report_date: Optional[str] = None,
                    session: Optional[str] = None) -> Dict[str, Any]:
    report_date = report_date or datetime.now().strftime("%Y-%m-%d")
    session = session or session_of()

    store.init_db()
    signals = store.fetch_signals(report_date)
    log.info("生成 %s %s 日报，原始信号 %s 条", report_date, session, len(signals))

    result = analyze_signals(signals, load_settings())
    result["report_date"] = report_date
    result["session"] = session
    result["session_label"] = SESSION_LABEL.get(session, session)

    store.save_report(report_date, session, result["engine"], result["overview"], result)
    return result


def run_full(session: Optional[str] = None) -> Dict[str, Any]:
    """完整流程：采集 + 生成日报。"""
    from .pipeline import collect_all

    session = session or session_of()
    collect_stats = collect_all(session=session)
    report = generate_report(session=session)
    return {"collect": collect_stats, "report": report}
