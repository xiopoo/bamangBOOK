"""SQLite 存储层：原始信号 / 日报 / 收藏 / 采集运行记录。"""
from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime
from typing import Any, Dict, Iterable, List, Optional

from .config import DB_PATH, ensure_dirs

SCHEMA = """
CREATE TABLE IF NOT EXISTS signals (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    fingerprint   TEXT UNIQUE NOT NULL,
    source_id     TEXT NOT NULL,
    source_name   TEXT NOT NULL,
    category      TEXT NOT NULL,
    market        TEXT,
    lang          TEXT,
    company_key   TEXT,
    company_name  TEXT,
    company_code  TEXT,
    title         TEXT NOT NULL,
    url           TEXT,
    content       TEXT,
    published_at  TEXT,
    collected_at  TEXT NOT NULL,
    trade_date    TEXT NOT NULL,
    payload       TEXT
);
CREATE INDEX IF NOT EXISTS idx_signals_date ON signals(trade_date);
CREATE INDEX IF NOT EXISTS idx_signals_company ON signals(company_key);

CREATE TABLE IF NOT EXISTS reports (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    report_date   TEXT NOT NULL,
    session       TEXT NOT NULL,
    generated_at  TEXT NOT NULL,
    engine        TEXT NOT NULL,
    overview      TEXT,
    payload       TEXT NOT NULL,
    UNIQUE(report_date, session)
);
CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(report_date DESC);

CREATE TABLE IF NOT EXISTS favorites (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    item_key      TEXT UNIQUE NOT NULL,
    report_date   TEXT,
    session       TEXT,
    company_name  TEXT,
    company_code  TEXT,
    kind          TEXT,
    title         TEXT NOT NULL,
    summary       TEXT,
    url           TEXT,
    payload       TEXT,
    created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS runs (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at    TEXT NOT NULL,
    finished_at   TEXT,
    session       TEXT,
    status        TEXT,
    collected     INTEGER DEFAULT 0,
    matched       INTEGER DEFAULT 0,
    detail        TEXT
);
"""


@contextmanager
def connect():
    ensure_dirs()
    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with connect() as conn:
        conn.executescript(SCHEMA)


def _now() -> str:
    return datetime.now().isoformat(timespec="seconds")


# ---------------- signals ----------------

def save_signals(signals: Iterable[Dict[str, Any]]) -> int:
    rows = list(signals)
    if not rows:
        return 0
    inserted = 0
    with connect() as conn:
        for s in rows:
            payload = s.get("payload")
            payload_json = json.dumps(payload, ensure_ascii=False) if isinstance(payload, (dict, list)) else (payload or None)
            cur = conn.execute(
                """
                INSERT OR IGNORE INTO signals
                (fingerprint, source_id, source_name, category, market, lang,
                 company_key, company_name, company_code, title, url, content,
                 published_at, collected_at, trade_date, payload)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                """,
                (
                    s["fingerprint"], s["source_id"], s["source_name"], s["category"],
                    s.get("market"), s.get("lang"), s.get("company_key"),
                    s.get("company_name"), s.get("company_code"), s["title"],
                    s.get("url"), s.get("content"), s.get("published_at"),
                    s.get("collected_at") or _now(), s["trade_date"], payload_json,
                ),
            )
            inserted += cur.rowcount
    return inserted


def fetch_signals(trade_date: str, company_key: Optional[str] = None,
                  limit: int = 500) -> List[Dict[str, Any]]:
    sql = "SELECT * FROM signals WHERE trade_date = ?"
    args: List[Any] = [trade_date]
    if company_key:
        sql += " AND company_key = ?"
        args.append(company_key)
    sql += " ORDER BY id DESC LIMIT ?"
    args.append(limit)
    with connect() as conn:
        return [dict(r) for r in conn.execute(sql, args)]


def recent_signals(limit: int = 200) -> List[Dict[str, Any]]:
    with connect() as conn:
        return [dict(r) for r in conn.execute(
            "SELECT * FROM signals ORDER BY id DESC LIMIT ?", (limit,))]


def signal_dates(limit: int = 60) -> List[str]:
    with connect() as conn:
        return [r[0] for r in conn.execute(
            "SELECT DISTINCT trade_date FROM signals ORDER BY trade_date DESC LIMIT ?",
            (limit,))]


# ---------------- reports ----------------

def save_report(report_date: str, session: str, engine: str,
                overview: str, payload: Dict[str, Any]) -> None:
    with connect() as conn:
        conn.execute(
            """
            INSERT INTO reports (report_date, session, generated_at, engine, overview, payload)
            VALUES (?,?,?,?,?,?)
            ON CONFLICT(report_date, session) DO UPDATE SET
                generated_at=excluded.generated_at,
                engine=excluded.engine,
                overview=excluded.overview,
                payload=excluded.payload
            """,
            (report_date, session, _now(), engine, overview,
             json.dumps(payload, ensure_ascii=False)),
        )


def get_report(report_date: str, session: Optional[str] = None) -> Optional[Dict[str, Any]]:
    sql = "SELECT * FROM reports WHERE report_date = ?"
    args: List[Any] = [report_date]
    if session:
        sql += " AND session = ?"
        args.append(session)
    sql += " ORDER BY generated_at DESC LIMIT 1"
    with connect() as conn:
        row = conn.execute(sql, args).fetchone()
    if not row:
        return None
    data = dict(row)
    data["payload"] = json.loads(data["payload"])
    return data


def list_reports(limit: int = 90) -> List[Dict[str, Any]]:
    with connect() as conn:
        rows = conn.execute(
            """
            SELECT report_date, session, generated_at, engine, overview
            FROM reports ORDER BY report_date DESC, generated_at DESC LIMIT ?
            """, (limit,)).fetchall()
    return [dict(r) for r in rows]


def latest_report_date() -> Optional[str]:
    with connect() as conn:
        row = conn.execute("SELECT report_date FROM reports ORDER BY report_date DESC LIMIT 1").fetchone()
    return row[0] if row else None


# ---------------- favorites ----------------

def add_favorite(item: Dict[str, Any]) -> bool:
    with connect() as conn:
        cur = conn.execute(
            """
            INSERT OR IGNORE INTO favorites
            (item_key, report_date, session, company_name, company_code,
             kind, title, summary, url, payload, created_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)
            """,
            (
                item["item_key"], item.get("report_date"), item.get("session"),
                item.get("company_name"), item.get("company_code"), item.get("kind"),
                item["title"], item.get("summary"), item.get("url"),
                json.dumps(item.get("payload") or {}, ensure_ascii=False), _now(),
            ),
        )
        return cur.rowcount > 0


def remove_favorite(item_key: str) -> bool:
    with connect() as conn:
        cur = conn.execute("DELETE FROM favorites WHERE item_key = ?", (item_key,))
        return cur.rowcount > 0


def list_favorites() -> List[Dict[str, Any]]:
    with connect() as conn:
        rows = conn.execute("SELECT * FROM favorites ORDER BY created_at DESC").fetchall()
    out = []
    for r in rows:
        d = dict(r)
        try:
            d["payload"] = json.loads(d.get("payload") or "{}")
        except json.JSONDecodeError:
            d["payload"] = {}
        out.append(d)
    return out


def favorite_keys() -> List[str]:
    with connect() as conn:
        return [r[0] for r in conn.execute("SELECT item_key FROM favorites")]


# ---------------- runs ----------------

def start_run(session: str) -> int:
    with connect() as conn:
        cur = conn.execute(
            "INSERT INTO runs (started_at, session, status) VALUES (?,?,?)",
            (_now(), session, "running"))
        return int(cur.lastrowid)


def finish_run(run_id: int, status: str, collected: int, matched: int, detail: str = "") -> None:
    with connect() as conn:
        conn.execute(
            """UPDATE runs SET finished_at=?, status=?, collected=?, matched=?, detail=?
               WHERE id=?""",
            (_now(), status, collected, matched, detail, run_id))


def list_runs(limit: int = 20) -> List[Dict[str, Any]]:
    with connect() as conn:
        return [dict(r) for r in conn.execute(
            "SELECT * FROM runs ORDER BY id DESC LIMIT ?", (limit,))]
