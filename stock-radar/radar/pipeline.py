"""采集调度：并发跑所有启用的数据源，做去重与公司归属，落库。"""
from __future__ import annotations

import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from typing import Any, Dict, List, Tuple

from . import store
from .collectors import get_collector
from .collectors.base import fingerprint
from .config import Company, Settings, Source, load_companies, load_settings, load_sources

log = logging.getLogger("radar.pipeline")


def _collect_one(source: Source, companies: List[Company],
                 settings: Settings) -> Tuple[Source, List[Dict[str, Any]], str]:
    collector = get_collector(source, settings)
    if collector is None:
        return source, [], "未知类型"
    try:
        raw_items = collector.collect(companies)
    except Exception as exc:  # 单源失败不影响整体
        log.exception("[%s] 采集异常", source.id)
        return source, [], f"异常: {exc}"

    today = datetime.now().strftime("%Y-%m-%d")
    now = datetime.now().isoformat(timespec="seconds")
    normalized: List[Dict[str, Any]] = []
    for item in raw_items:
        company: Company = item.get("company")
        title = (item.get("title") or "").strip()
        if not title:
            continue
        normalized.append({
            "fingerprint": fingerprint(source.id, title, item.get("url", "")),
            "source_id": source.id,
            "source_name": source.name,
            "category": source.category,
            "market": company.market if company else source.market,
            "lang": source.lang,
            "company_key": company.key if company else None,
            "company_name": company.name if company else None,
            "company_code": company.code if company else None,
            "title": title,
            "url": item.get("url", ""),
            "content": item.get("content", ""),
            "published_at": item.get("published_at", ""),
            "collected_at": now,
            "trade_date": today,
        })
    return source, normalized, "ok"


def collect_all(session: str = "manual", max_workers: int = 6) -> Dict[str, Any]:
    """跑一轮全量采集，返回统计信息。"""
    settings = load_settings()
    sources = load_sources(only_enabled=True)
    companies = load_companies()

    store.init_db()
    run_id = store.start_run(session)

    if not sources or not companies:
        store.finish_run(run_id, "skipped", 0, 0, "无启用数据源或无关注公司")
        return {"collected": 0, "inserted": 0, "per_source": {}, "status": "skipped"}

    per_source: Dict[str, Any] = {}
    all_items: List[Dict[str, Any]] = []

    with ThreadPoolExecutor(max_workers=max_workers) as pool:
        futures = {pool.submit(_collect_one, s, companies, settings): s for s in sources}
        for fut in as_completed(futures):
            source, items, status = fut.result()
            per_source[source.id] = {"name": source.name, "count": len(items), "status": status}
            all_items.extend(items)
            log.info("[%s] %s 条 (%s)", source.id, len(items), status)

    # 内置基本面快照采集（不依赖 sources.yml，始终随日报生成）
    try:
        from .collectors.fundamentals import FundamentalsCollector
        fun = FundamentalsCollector.__new__(FundamentalsCollector)
        # 用最小构造避免依赖完整 Source/Settings
        fun.source = type("S", (), {"id": "fundamentals", "name": "基本面快照",
                                    "category": "fundamentals", "market": None,
                                    "lang": "zh"})()
        fun.settings = settings
        fun.max_items = 200
        fun.session = type("SE", (), {"headers": {}})()
        fun.session.headers = {}
        fun.trade_date = datetime.now().strftime("%Y-%m-%d")
        from .collectors.base import fingerprint as _fp
        snap_items = fun.collect(fun.trade_date, companies)
        norm = []
        now = datetime.now().isoformat(timespec="seconds")
        for it in snap_items:
            norm.append({
                "fingerprint": it.get("fingerprint")
                or _fp("fundamentals", it.get("title", ""), it.get("url", "")),
                "source_id": "fundamentals",
                "source_name": "基本面快照",
                "category": "fundamentals",
                "market": it.get("market"),
                "lang": "zh",
                "company_key": it.get("company_key"),
                "company_name": it.get("company_name"),
                "company_code": it.get("company_code"),
                "title": it.get("title", ""),
                "url": it.get("url", ""),
                "content": it.get("content", ""),
                "published_at": it.get("published_at", ""),
                "collected_at": now,
                "trade_date": fun.trade_date,
                "payload": it.get("payload", {}),
            })
        all_items.extend(norm)
        per_source["fundamentals"] = {"name": "基本面快照", "count": len(norm), "status": "ok"}
        log.info("[fundamentals] %s 条", len(norm))
    except Exception as exc:
        log.exception("[fundamentals] 采集失败，跳过基本面快照")

    # 跨源去重：同标题同公司只留权重最高的一条
    weight_of = {s.id: s.weight for s in sources}
    best: Dict[str, Dict[str, Any]] = {}
    for item in all_items:
        key = f"{item.get('company_key')}|{item['title'][:60]}"
        current = best.get(key)
        if current is None or weight_of.get(item["source_id"], 0) > weight_of.get(current["source_id"], 0):
            best[key] = item
    deduped = list(best.values())

    inserted = store.save_signals(deduped)
    store.finish_run(run_id, "ok", len(all_items), inserted,
                     f"{len(sources)} 个源，去重后 {len(deduped)} 条，新增 {inserted} 条")

    return {
        "collected": len(all_items),
        "deduped": len(deduped),
        "inserted": inserted,
        "per_source": per_source,
        "status": "ok",
    }
