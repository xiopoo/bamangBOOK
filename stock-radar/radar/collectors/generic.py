"""通用采集器：RSS/Atom 与美股 SEC EDGAR。"""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Dict, List, Optional

import feedparser

from ..config import Company
from .base import Collector, RawItem, register


@register("rss")
class RssCollector(Collector):
    """通用 RSS/Atom 源。

    RSS 是全市场流，需要按关注公司别名做关键词匹配后才入库。
    """

    def collect(self, companies: List[Company]) -> List[RawItem]:
        url = self.source.params.get("url")
        if not url:
            return []
        resp = self.get(url)
        if resp is None:
            return []
        feed = feedparser.parse(resp.content)
        targets = self.target_companies(companies)

        items: List[RawItem] = []
        for entry in feed.entries[:200]:
            title = getattr(entry, "title", "") or ""
            summary = getattr(entry, "summary", "") or getattr(entry, "description", "") or ""
            blob = f"{title} {summary}"
            matched = self._match(blob, targets)
            if not matched:
                continue
            published = ""
            if getattr(entry, "published_parsed", None):
                published = datetime(*entry.published_parsed[:6]).isoformat(timespec="seconds")
            for company in matched:
                items.append(RawItem.make(
                    title=title,
                    url=getattr(entry, "link", ""),
                    content=summary,
                    published_at=published,
                    company=company,
                    extra={"media": self.source.name},
                ))
        return items[: self.max_items]

    @staticmethod
    def _match(text: str, companies: List[Company]) -> List[Company]:
        lowered = text.lower()
        hits = []
        for company in companies:
            for term in company.match_terms:
                t = term.lower()
                # 过短的纯代码用词边界要求更严，避免误命中
                if len(t) <= 2:
                    continue
                if t in lowered:
                    hits.append(company)
                    break
        return hits


@register("sec_edgar")
class SecEdgarCollector(Collector):
    """美股 SEC EDGAR 申报文件。"""

    TICKER_MAP = "https://www.sec.gov/files/company_tickers.json"
    SUBMISSIONS = "https://data.sec.gov/submissions/CIK{cik}.json"

    def __init__(self, source, settings) -> None:
        super().__init__(source, settings)
        # SEC 要求 UA 中带联系方式
        self.session.headers.update({
            "User-Agent": "StockRadar/1.0 (personal research; contact@example.com)",
            "Accept-Encoding": "gzip, deflate",
        })
        self._cik_cache: Optional[Dict[str, str]] = None

    def _cik_of(self, ticker: str) -> Optional[str]:
        if self._cik_cache is None:
            resp = self.get(self.TICKER_MAP)
            if resp is None:
                self._cik_cache = {}
            else:
                try:
                    raw = resp.json()
                    self._cik_cache = {
                        str(v["ticker"]).upper(): str(v["cik_str"]).zfill(10)
                        for v in raw.values()
                    }
                except (ValueError, KeyError):
                    self._cik_cache = {}
        return self._cik_cache.get(ticker.upper())

    def collect(self, companies: List[Company]) -> List[RawItem]:
        targets = [c for c in self.target_companies(companies) if c.market == "us"]
        wanted = set(self.source.params.get("form_types") or [])
        cutoff = datetime.now() - timedelta(days=7)

        items: List[RawItem] = []
        for company in targets:
            cik = self._cik_of(company.code)
            if not cik:
                continue
            resp = self.get(self.SUBMISSIONS.format(cik=cik))
            if resp is None:
                continue
            try:
                data = resp.json()
            except ValueError:
                continue
            recent = (data.get("filings") or {}).get("recent") or {}
            forms = recent.get("form") or []
            dates = recent.get("filingDate") or []
            accs = recent.get("accessionNumber") or []
            docs = recent.get("primaryDocument") or []
            descs = recent.get("primaryDocDescription") or []

            for i, form in enumerate(forms[:60]):
                if wanted and form not in wanted:
                    continue
                filed = dates[i] if i < len(dates) else ""
                try:
                    if filed and datetime.strptime(filed, "%Y-%m-%d") < cutoff:
                        continue
                except ValueError:
                    pass
                acc = (accs[i] if i < len(accs) else "").replace("-", "")
                doc = docs[i] if i < len(docs) else ""
                url = (f"https://www.sec.gov/Archives/edgar/data/{int(cik)}/{acc}/{doc}"
                       if acc and doc else "")
                desc = descs[i] if i < len(descs) else ""
                items.append(RawItem.make(
                    title=f"{company.code} 提交 {form}" + (f"：{desc}" if desc else ""),
                    url=url,
                    content=f"SEC filing form {form}, filed {filed}.",
                    published_at=self.ts(filed),
                    company=company,
                    extra={"media": "SEC EDGAR", "form": form},
                ))
        return items[: self.max_items]
