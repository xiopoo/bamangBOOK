"""A股/港股相关采集器：巨潮公告、同花顺快讯、雪球讨论、港交所公告。"""
from __future__ import annotations

import json
import re
from datetime import datetime, timedelta
from typing import List

from ..config import Company
from .base import Collector, RawItem, register


@register("cninfo")
class CninfoCollector(Collector):
    """巨潮资讯网 A 股公告。

    接口偶有风控，失败时返回空列表，由东财公告源兜底。
    """

    API = "http://www.cninfo.com.cn/new/hisAnnouncement/query"

    def collect(self, companies: List[Company]) -> List[RawItem]:
        targets = [c for c in self.target_companies(companies) if c.market == "cn"]
        if not targets:
            return []
        end = datetime.now()
        start = end - timedelta(days=3)
        se_date = f"{start:%Y-%m-%d}~{end:%Y-%m-%d}"

        items: List[RawItem] = []
        for company in targets:
            column = "sse" if company.code.startswith(("6", "9")) else "szse"
            resp = self.post(
                self.API,
                data={
                    "pageNum": 1, "pageSize": 20, "column": column,
                    "tabName": "fulltext", "stock": "", "searchkey": "",
                    "secid": "", "plate": "", "category": "", "trade": "",
                    "seDate": se_date, "sortName": "", "sortType": "",
                    "isHLtitle": "true",
                },
                headers={
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "Referer": "http://www.cninfo.com.cn/new/commonUrl?url=disclosure/list/notice",
                    "X-Requested-With": "XMLHttpRequest",
                },
            )
            if resp is None:
                continue
            try:
                data = resp.json()
            except ValueError:
                continue
            for row in data.get("announcements") or []:
                sec_code = str(row.get("secCode") or "")
                if sec_code != company.code:
                    continue
                title = re.sub(r"</?em>", "", row.get("announcementTitle") or "")
                path = row.get("adjunctUrl") or ""
                items.append(RawItem.make(
                    title=title,
                    url=f"http://static.cninfo.com.cn/{path}" if path else "",
                    content=f"{row.get('secName', '')} 公告",
                    published_at=self.ts(row.get("announcementTime")),
                    company=company,
                    extra={"media": "巨潮资讯"},
                ))
        return items[: self.max_items]


@register("ths")
class TonghuashunCollector(Collector):
    """同花顺个股快讯。"""

    API = "https://basic.10jqka.com.cn/api/stockph/news/{code}/1/10.json"

    def collect(self, companies: List[Company]) -> List[RawItem]:
        targets = [c for c in self.target_companies(companies) if c.market == "cn"]
        items: List[RawItem] = []
        for company in targets:
            resp = self.get(
                self.API.format(code=company.code),
                headers={"Referer": f"https://basic.10jqka.com.cn/{company.code}/news.html"},
            )
            if resp is None:
                continue
            try:
                data = resp.json()
            except ValueError:
                continue
            rows = data if isinstance(data, list) else (data.get("list") or data.get("data") or [])
            if not isinstance(rows, list):
                continue
            for row in rows[:10]:
                if not isinstance(row, dict):
                    continue
                title = row.get("title") or row.get("name") or ""
                if not title:
                    continue
                items.append(RawItem.make(
                    title=title,
                    url=row.get("url") or row.get("link") or "",
                    content=row.get("digest") or row.get("summary") or "",
                    published_at=self.ts(row.get("ctime") or row.get("rtime") or row.get("date")),
                    company=company,
                    extra={"media": "同花顺"},
                ))
        return items[: self.max_items]


@register("xueqiu")
class XueqiuCollector(Collector):
    """雪球个股讨论。需要先访问首页拿 cookie。"""

    HOME = "https://xueqiu.com"
    API = "https://xueqiu.com/query/v1/symbol/search/status"

    def _symbol(self, company: Company) -> str:
        if company.market == "cn":
            return ("SH" if company.code.startswith(("6", "9", "5")) else "SZ") + company.code
        if company.market == "hk":
            return company.code.zfill(5)
        return company.code.upper()

    def collect(self, companies: List[Company]) -> List[RawItem]:
        targets = self.target_companies(companies)
        if not targets:
            return []
        # 预热 cookie
        self.get(self.HOME, headers={"Referer": self.HOME})

        items: List[RawItem] = []
        for company in targets:
            resp = self.get(
                self.API,
                params={"count": 10, "comment": 0, "symbol": self._symbol(company),
                        "hl": 0, "source": "all", "sort": "time", "page": 1},
                headers={"Referer": f"{self.HOME}/S/{self._symbol(company)}"},
            )
            if resp is None:
                continue
            try:
                data = resp.json()
            except ValueError:
                continue
            for row in data.get("list") or []:
                text = row.get("text") or row.get("description") or ""
                title = row.get("title") or ""
                body = re.sub(r"<[^>]+>", "", text)
                display = title or body[:80]
                if not display.strip():
                    continue
                likes = int(row.get("like_count") or 0)
                replies = int(row.get("reply_count") or 0)
                # 过滤零互动噪音
                if likes + replies < 3:
                    continue
                target = row.get("target") or ""
                items.append(RawItem.make(
                    title=display,
                    url=f"{self.HOME}{target}" if target.startswith("/") else target,
                    content=body,
                    published_at=self.ts(row.get("created_at")),
                    company=company,
                    extra={"media": "雪球", "heat": likes + replies},
                ))
        return items[: self.max_items]


@register("hkex")
class HkexCollector(Collector):
    """港交所披露易公告（经东财港股公告通道获取，稳定性更好）。"""

    API = "https://np-anotice-stock.eastmoney.com/api/security/ann"

    def collect(self, companies: List[Company]) -> List[RawItem]:
        targets = [c for c in self.target_companies(companies) if c.market == "hk"]
        items: List[RawItem] = []
        for company in targets:
            code = company.code.zfill(5)
            resp = self.get(self.API, params={
                "sr": -1, "page_size": 10, "page_index": 1, "ann_type": "SHK",
                "client_source": "web", "stock_list": code,
            })
            if resp is None:
                continue
            try:
                data = resp.json()
            except ValueError:
                continue
            for row in (data.get("data") or {}).get("list") or []:
                title = row.get("title_ch") or row.get("title") or ""
                if not title:
                    continue
                art = row.get("art_code") or ""
                items.append(RawItem.make(
                    title=title,
                    url=f"https://data.eastmoney.com/notices/detail/{code}/{art}.html" if art else "",
                    content="港股公告",
                    published_at=self.ts((row.get("notice_date") or "")[:19]),
                    company=company,
                    extra={"media": "港交所"},
                ))
        return items[: self.max_items]
