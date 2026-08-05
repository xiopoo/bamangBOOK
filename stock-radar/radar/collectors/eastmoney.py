"""东方财富系列采集器：公告 / 个股资讯 / 研报 / 股吧讨论。"""
from __future__ import annotations

import json
import re
from typing import Any, Dict, List, Optional
from urllib.parse import quote

from ..config import Company
from .base import Collector, RawItem, register

_JSONP = re.compile(r"^[^(]*\((.*)\)[;\s]*$", re.S)


def _unwrap_jsonp(text: str) -> Optional[Dict[str, Any]]:
    text = (text or "").strip()
    if not text:
        return None
    m = _JSONP.match(text)
    payload = m.group(1) if m else text
    try:
        return json.loads(payload)
    except json.JSONDecodeError:
        return None


def _em_secid(company: Company) -> str:
    """东财 secid：沪市 1.xxxxxx，深市 0.xxxxxx。"""
    code = company.code
    if company.market != "cn":
        return code
    prefix = "1" if code.startswith(("6", "9", "5")) else "0"
    return f"{prefix}.{code}"


@register("eastmoney")
class EastmoneyCollector(Collector):
    """东方财富个股资讯 / 研报。

    params.channel = "report" 时抓研报，否则抓个股资讯。
    """

    NEWS_API = "https://search-api-web.eastmoney.com/search/jsonp"
    REPORT_API = "https://reportapi.eastmoney.com/report/list"

    def collect(self, companies: List[Company]) -> List[RawItem]:
        if self.source.params.get("channel") == "report":
            return self._collect_reports(self.target_companies(companies))
        return self._collect_news(self.target_companies(companies))

    def _collect_news(self, companies: List[Company]) -> List[RawItem]:
        items: List[RawItem] = []
        per_company = max(3, self.max_items // max(len(companies), 1))
        for company in companies:
            param = {
                "uid": "",
                "keyword": company.name,
                "type": ["cmsArticleWebOld"],
                "client": "web",
                "clientType": "web",
                "clientVersion": "curr",
                "param": {
                    "cmsArticleWebOld": {
                        "searchScope": "default",
                        "sort": "time",
                        "pageIndex": 1,
                        "pageSize": per_company,
                        "preTag": "<em>",
                        "postTag": "</em>",
                    }
                },
            }
            resp = self.get(
                self.NEWS_API,
                params={"cb": "cb", "param": json.dumps(param, ensure_ascii=False)},
                headers={"Referer": "https://so.eastmoney.com/"},
            )
            if resp is None:
                continue
            data = _unwrap_jsonp(resp.text)
            if not data:
                continue
            rows = (data.get("result") or {}).get("cmsArticleWebOld") or []
            for row in rows:
                title = re.sub(r"</?em>", "", row.get("title") or "")
                content = re.sub(r"</?em>", "", row.get("content") or "")
                if not title:
                    continue
                items.append(RawItem.make(
                    title=title,
                    url=row.get("url", ""),
                    content=content,
                    published_at=self.ts(row.get("date")),
                    company=company,
                    extra={"media": row.get("mediaName", "")},
                ))
        return items

    def _collect_reports(self, companies: List[Company]) -> List[RawItem]:
        by_code = {c.code: c for c in companies if c.market == "cn"}
        if not by_code:
            return []
        resp = self.get(
            self.REPORT_API,
            params={
                "cb": "cb", "industryCode": "*", "pageSize": 200, "industry": "*",
                "rating": "", "ratingChange": "", "pageNo": 1, "qType": 0,
            },
            headers={"Referer": "https://data.eastmoney.com/report/"},
        )
        if resp is None:
            return []
        data = _unwrap_jsonp(resp.text)
        if not data:
            return []

        items: List[RawItem] = []
        for row in data.get("data") or []:
            company = by_code.get(str(row.get("stockCode") or ""))
            if company is None:
                continue
            org = row.get("orgSName") or row.get("orgName") or ""
            info_code = row.get("infoCode") or ""
            detail = (f"https://data.eastmoney.com/report/zw_stock.jshtml?infocode={info_code}"
                      if info_code else "")
            bits = []
            for label, key in (("今年EPS", "predictThisYearEps"), ("今年PE", "predictThisYearPe"),
                               ("明年EPS", "predictNextYearEps"), ("明年PE", "predictNextYearPe")):
                if row.get(key):
                    bits.append(f"{label} {row[key]}")
            items.append(RawItem.make(
                title=f"{org}：{row.get('title', '')}",
                url=detail,
                content="；".join(bits),
                published_at=self.ts((row.get("publishDate") or "")[:19]),
                company=company,
                extra={"media": org},
            ))
        return items[: self.max_items]


@register("em_announcement")
class EastmoneyAnnouncementCollector(Collector):
    """东方财富公告接口（A股/港股均可覆盖，作为巨潮的稳定替代）。"""

    API = "https://np-anotice-stock.eastmoney.com/api/security/ann"

    def collect(self, companies: List[Company]) -> List[RawItem]:
        targets = self.target_companies(companies)
        items: List[RawItem] = []
        per_company = max(3, self.max_items // max(len(targets), 1))
        for company in targets:
            resp = self.get(self.API, params={
                "sr": -1, "page_size": per_company, "page_index": 1,
                "ann_type": "A" if company.market == "cn" else "SHK",
                "client_source": "web", "stock_list": company.code,
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
                columns = "/".join(c.get("column_name", "") for c in row.get("columns") or [])
                items.append(RawItem.make(
                    title=title,
                    url=f"https://data.eastmoney.com/notices/detail/{company.code}/{art}.html" if art else "",
                    content=f"公告类别：{columns}" if columns else "",
                    published_at=self.ts((row.get("notice_date") or "")[:19]),
                    company=company,
                    extra={"media": "交易所公告"},
                ))
        return items


@register("eastmoney_gb")
class EastmoneyGubaCollector(Collector):
    """东方财富股吧热帖。"""

    API = "https://gbapi.eastmoney.com/api/Guba/GetShareList"
    WEB = "https://guba.eastmoney.com/list,{code}_1.html"

    def collect(self, companies: List[Company]) -> List[RawItem]:
        targets = self.target_companies(companies)
        items: List[RawItem] = []
        for company in targets:
            resp = self.get(
                self.WEB.format(code=company.code),
                headers={"Referer": "https://guba.eastmoney.com/"},
            )
            if resp is None:
                continue
            items.extend(self._parse_web(resp.text, company))
        return items[: self.max_items]

    def _parse_web(self, html: str, company: Company) -> List[RawItem]:
        """股吧列表页内嵌 article_list JSON。"""
        m = re.search(r"var article_list\s*=\s*(\{.*?\});", html, re.S)
        if not m:
            return []
        try:
            data = json.loads(m.group(1))
        except json.JSONDecodeError:
            return []
        out: List[RawItem] = []
        for row in (data.get("re") or [])[:15]:
            title = row.get("post_title") or ""
            if not title:
                continue
            clicks = row.get("post_click_count") or 0
            comments = row.get("post_comment_count") or 0
            # 只保留有一定热度的帖子，过滤噪音
            if int(clicks or 0) < 500:
                continue
            pid = row.get("post_id")
            out.append(RawItem.make(
                title=title,
                url=f"https://guba.eastmoney.com/news,{company.code},{pid}.html" if pid else "",
                content=f"阅读 {clicks} / 评论 {comments}",
                published_at=self.ts(row.get("post_publish_time")),
                company=company,
                extra={"media": "东财股吧", "heat": int(clicks or 0)},
            ))
        return out
