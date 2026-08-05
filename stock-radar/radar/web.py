"""Web 服务：日报浏览、筛选、收藏、导出、配置管理、手动触发采集。"""
from __future__ import annotations

import hashlib
import json
import logging
import threading
from datetime import datetime
from typing import Any, Dict, List, Optional

from flask import Flask, Response, jsonify, render_template, request

from . import store
from .collectors import registered_types
from .config import (BASE_DIR, Company, Source, load_companies, load_focus,
                     load_settings, load_sources, save_companies, save_focus,
                     save_sources)
from .exporter import favorites_to_markdown, to_markdown, to_print_html
from .report import generate_report, run_full, session_of

log = logging.getLogger("radar.web")

app = Flask(__name__,
            template_folder=str(BASE_DIR / "templates"),
            static_folder=str(BASE_DIR / "static"))
app.config["JSON_AS_ASCII"] = False

_run_lock = threading.Lock()
_run_state: Dict[str, Any] = {"running": False, "message": "", "finished_at": None}


def item_key(item: Dict[str, Any]) -> str:
    raw = f"{item.get('company_code', '')}|{item.get('title', '')}|{item.get('url', '')}"
    return hashlib.sha1(raw.encode("utf-8")).hexdigest()[:16]


def _decorate(items: List[Dict[str, Any]], fav_keys: set) -> List[Dict[str, Any]]:
    out = []
    for item in items:
        key = item_key(item)
        out.append({**item, "item_key": key, "favorited": key in fav_keys})
    return out


def _filter_items(items: List[Dict[str, Any]], company: str, keyword: str) -> List[Dict[str, Any]]:
    if company:
        items = [i for i in items
                 if company in (i.get("company_name") or "")
                 or company == (i.get("company_code") or "")]
    if keyword:
        kw = keyword.lower()
        items = [i for i in items if kw in
                 f"{i.get('title', '')}{i.get('summary_cn', '')}{i.get('content', '')}".lower()]
    return items


def _filter_fundamentals(items: List[Dict[str, Any]], company: str, keyword: str) -> List[Dict[str, Any]]:
    if company:
        items = [i for i in items
                 if company in (i.get("company_name") or "")
                 or company == (i.get("company_code") or "")]
    if keyword:
        kw = keyword.lower()
        items = [i for i in items if kw in
                 f"{i.get('company_name', '')}{i.get('content', '')}".lower()]
    return items


# ---------------- 页面 ----------------

@app.route("/")
def index():
    date = request.args.get("date")
    session = request.args.get("session")
    company = (request.args.get("company") or "").strip()
    keyword = (request.args.get("q") or "").strip()

    store.init_db()
    reports = store.list_reports(120)
    if not date:
        date = reports[0]["report_date"] if reports else datetime.now().strftime("%Y-%m-%d")

    report = store.get_report(date, session)
    payload = report["payload"] if report else {}
    fav_keys = set(store.favorite_keys())

    sections = {}
    for name in ("highlights", "opportunities", "risks", "others"):
        items = _decorate(payload.get(name, []), fav_keys)
        sections[name] = _filter_items(items, company, keyword)

    # 基本面快照：解析 payload 里的结构化 snapshot
    fundamentals_raw = payload.get("fundamentals", []) or []
    fundamentals = []
    for f in fundamentals_raw:
        snap = f.get("payload")
        if isinstance(snap, str):
            try:
                snap = json.loads(snap)
            except (ValueError, TypeError):
                snap = {}
        snapshot = (snap or {}).get("snapshot", {}) if isinstance(snap, dict) else {}
        fundamentals.append({
            "company_name": f.get("company_name"),
            "company_code": f.get("company_code"),
            "market": f.get("market"),
            "content": f.get("content"),
            "snapshot": snapshot,
        })
    fundamentals = _filter_fundamentals(fundamentals, company, keyword)

    companies = load_companies()
    settings = load_settings()

    timeline: Dict[str, List[Dict[str, Any]]] = {}
    for r in reports:
        timeline.setdefault(r["report_date"], []).append(r)

    return render_template(
        "index.html",
        report=report, payload=payload, sections=sections,
        fundamentals=fundamentals,
        current_date=date, current_session=session,
        timeline=timeline, companies=companies,
        filter_company=company, filter_keyword=keyword,
        llm_enabled=settings.llm_enabled, llm_model=settings.llm_model,
        fav_count=len(fav_keys),
    )


@app.route("/signals")
def signals_page():
    date = request.args.get("date") or datetime.now().strftime("%Y-%m-%d")
    company = (request.args.get("company") or "").strip()
    store.init_db()
    rows = store.fetch_signals(date)
    if company:
        rows = [r for r in rows if company in (r.get("company_name") or "")
                or company == (r.get("company_code") or "")]
    grouped: Dict[str, List[Dict[str, Any]]] = {}
    for r in rows:
        grouped.setdefault(r["source_name"], []).append(r)
    return render_template("signals.html", grouped=grouped, current_date=date,
                           dates=store.signal_dates(), total=len(rows),
                           companies=load_companies(), filter_company=company)


@app.route("/favorites")
def favorites_page():
    store.init_db()
    return render_template("favorites.html", favorites=store.list_favorites())


@app.route("/settings")
def settings_page():
    settings = load_settings()
    return render_template(
        "settings.html",
        sources=load_sources(), companies=load_companies(), focus=load_focus(),
        source_types=registered_types(), runs=store.list_runs(10),
        settings=settings, run_state=_run_state,
    )


# ---------------- 采集 / 生成 ----------------

def _background_run(session: str) -> None:
    global _run_state
    try:
        result = run_full(session=session)
        c = result["collect"]
        r = result["report"]
        _run_state["message"] = (
            f"采集 {c.get('collected', 0)} 条，入库 {c.get('inserted', 0)} 条；"
            f"日报保留 {r.get('stats', {}).get('kept', 0)} 条（引擎 {r.get('engine')}）")
    except Exception as exc:
        log.exception("采集任务失败")
        _run_state["message"] = f"失败：{exc}"
    finally:
        _run_state["running"] = False
        _run_state["finished_at"] = datetime.now().isoformat(timespec="seconds")


@app.post("/api/run")
def api_run():
    global _run_state
    with _run_lock:
        if _run_state["running"]:
            return jsonify({"ok": False, "message": "已有采集任务在运行"}), 409
        _run_state = {"running": True, "message": "采集中…", "finished_at": None}
    session = request.json.get("session") if request.is_json else None
    threading.Thread(target=_background_run, args=(session or session_of(),), daemon=True).start()
    return jsonify({"ok": True, "message": "采集任务已启动"})


@app.get("/api/run/status")
def api_run_status():
    return jsonify(_run_state)


@app.post("/api/report/regenerate")
def api_regenerate():
    data = request.get_json(silent=True) or {}
    date = data.get("date") or datetime.now().strftime("%Y-%m-%d")
    session = data.get("session") or session_of()
    result = generate_report(date, session)
    return jsonify({"ok": True, "kept": result["stats"]["kept"], "engine": result["engine"]})


# ---------------- 收藏 ----------------

@app.post("/api/favorites")
def api_add_favorite():
    data = request.get_json(force=True)
    key = data.get("item_key") or item_key(data)
    added = store.add_favorite({
        "item_key": key,
        "report_date": data.get("report_date"),
        "session": data.get("session"),
        "company_name": data.get("company_name"),
        "company_code": data.get("company_code"),
        "kind": data.get("kind"),
        "title": data.get("title", ""),
        "summary": data.get("summary_cn") or data.get("summary"),
        "url": data.get("url"),
        "payload": data,
    })
    return jsonify({"ok": True, "added": added, "item_key": key})


@app.delete("/api/favorites/<key>")
def api_remove_favorite(key: str):
    return jsonify({"ok": store.remove_favorite(key)})


# ---------------- 导出 ----------------

@app.get("/export/report.md")
def export_md():
    date = request.args.get("date") or store.latest_report_date()
    report = store.get_report(date, request.args.get("session")) if date else None
    if not report:
        return Response("未找到日报", status=404)
    return Response(
        to_markdown(report), mimetype="text/markdown; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="radar-{date}.md"'})


@app.get("/export/report.txt")
def export_txt():
    """纯文本，供一键复制丢给其他 AI 分析。"""
    date = request.args.get("date") or store.latest_report_date()
    report = store.get_report(date, request.args.get("session")) if date else None
    if not report:
        return Response("未找到日报", status=404)
    return Response(to_markdown(report), mimetype="text/plain; charset=utf-8")


@app.get("/export/report.html")
def export_html():
    date = request.args.get("date") or store.latest_report_date()
    report = store.get_report(date, request.args.get("session")) if date else None
    if not report:
        return Response("未找到日报", status=404)
    return Response(to_print_html(report), mimetype="text/html; charset=utf-8")


@app.get("/export/favorites.md")
def export_favorites():
    return Response(
        favorites_to_markdown(store.list_favorites()),
        mimetype="text/markdown; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="radar-favorites.md"'})


# ---------------- 配置管理 ----------------

@app.get("/api/sources")
def api_list_sources():
    return jsonify([s.to_dict() for s in load_sources()])


@app.post("/api/sources")
def api_save_source():
    data = request.get_json(force=True)
    sources = load_sources()
    incoming = Source.from_dict(data)
    for i, s in enumerate(sources):
        if s.id == incoming.id:
            sources[i] = incoming
            break
    else:
        sources.append(incoming)
    save_sources(sources)
    return jsonify({"ok": True})


@app.delete("/api/sources/<source_id>")
def api_delete_source(source_id: str):
    sources = [s for s in load_sources() if s.id != source_id]
    save_sources(sources)
    return jsonify({"ok": True})


@app.post("/api/sources/<source_id>/toggle")
def api_toggle_source(source_id: str):
    sources = load_sources()
    for s in sources:
        if s.id == source_id:
            s.enabled = not s.enabled
            break
    save_sources(sources)
    return jsonify({"ok": True})


@app.get("/api/companies")
def api_list_companies():
    return jsonify([c.to_dict() for c in load_companies()])


@app.post("/api/companies")
def api_save_company():
    data = request.get_json(force=True)
    companies = load_companies()
    incoming = Company.from_dict(data)
    for i, c in enumerate(companies):
        if c.code == incoming.code and c.market == incoming.market:
            companies[i] = incoming
            break
    else:
        companies.append(incoming)
    save_companies(companies)
    return jsonify({"ok": True})


@app.delete("/api/companies/<market>/<code>")
def api_delete_company(market: str, code: str):
    companies = [c for c in load_companies()
                 if not (c.code == code and c.market == market)]
    save_companies(companies)
    return jsonify({"ok": True})


@app.post("/api/focus")
def api_save_focus():
    data = request.get_json(force=True)
    focus = load_focus()
    if "persona" in data:
        focus["persona"] = data["persona"]
    if "thresholds" in data:
        focus["thresholds"].update(data["thresholds"])
    if "dimensions" in data:
        focus["dimensions"] = data["dimensions"]
    if "noise_filters" in data:
        focus["noise_filters"] = data["noise_filters"]
    save_focus(focus)
    return jsonify({"ok": True})


@app.template_filter("kindlabel")
def kind_label(kind: str) -> str:
    return {"opportunity": "机会", "risk": "风险", "neutral": "中性"}.get(kind, kind)


def create_app() -> Flask:
    store.init_db()
    return app


def main() -> None:
    logging.basicConfig(level=logging.INFO,
                        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    settings = load_settings()
    store.init_db()
    print(f"\n  股市雷达日报  →  http://{settings.host}:{settings.port}\n")
    app.run(host=settings.host, port=settings.port, debug=False, threaded=True)


if __name__ == "__main__":
    main()
