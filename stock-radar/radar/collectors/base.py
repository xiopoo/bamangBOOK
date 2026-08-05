"""采集器基类与注册表。

新增数据源只需：
  1. 在本目录新建模块，定义 Collector 子类并用 @register("类型名") 装饰
  2. 在 config/sources.yml 里增加一条 type 为该类型名的配置
"""
from __future__ import annotations

import hashlib
import logging
import re
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, Callable, Dict, List, Optional, Type

import requests

from ..config import Company, Settings, Source

log = logging.getLogger("radar.collect")

_REGISTRY: Dict[str, Type["Collector"]] = {}

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")


def register(type_name: str) -> Callable[[Type["Collector"]], Type["Collector"]]:
    def deco(cls: Type["Collector"]) -> Type["Collector"]:
        _REGISTRY[type_name] = cls
        cls.type_name = type_name
        return cls
    return deco


def get_collector(source: Source, settings: Settings) -> Optional["Collector"]:
    cls = _REGISTRY.get(source.type)
    if cls is None:
        log.warning("未知数据源类型: %s (source=%s)", source.type, source.id)
        return None
    return cls(source, settings)


def registered_types() -> List[str]:
    return sorted(_REGISTRY)


def fingerprint(*parts: str) -> str:
    raw = "|".join(p or "" for p in parts)
    return hashlib.sha1(raw.encode("utf-8")).hexdigest()


def clean_text(text: Optional[str], limit: int = 1200) -> str:
    if not text:
        return ""
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"&[a-zA-Z#0-9]+;", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:limit]


class RawItem(dict):
    """采集到的一条原始信息。"""

    @classmethod
    def make(cls, title: str, url: str = "", content: str = "",
             published_at: str = "", company: Optional[Company] = None,
             extra: Optional[Dict[str, Any]] = None) -> "RawItem":
        item = cls(
            title=clean_text(title, 300),
            url=url or "",
            content=clean_text(content),
            published_at=published_at or "",
            company=company,
        )
        if extra:
            item.update(extra)
        return item


class Collector(ABC):
    type_name: str = "base"

    def __init__(self, source: Source, settings: Settings) -> None:
        self.source = source
        self.settings = settings
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": UA, "Accept": "*/*"})

    # ---- 子类实现 ----
    @abstractmethod
    def collect(self, companies: List[Company]) -> List[RawItem]:
        """返回该数据源下与关注公司相关的原始条目。"""

    # ---- 工具方法 ----
    def get(self, url: str, **kwargs) -> Optional[requests.Response]:
        kwargs.setdefault("timeout", self.settings.request_timeout)
        try:
            resp = self.session.get(url, **kwargs)
            if resp.status_code != 200:
                log.warning("[%s] HTTP %s %s", self.source.id, resp.status_code, url)
                return None
            return resp
        except requests.RequestException as exc:
            log.warning("[%s] 请求失败 %s: %s", self.source.id, url, exc)
            return None

    def post(self, url: str, **kwargs) -> Optional[requests.Response]:
        kwargs.setdefault("timeout", self.settings.request_timeout)
        try:
            resp = self.session.post(url, **kwargs)
            if resp.status_code != 200:
                log.warning("[%s] HTTP %s %s", self.source.id, resp.status_code, url)
                return None
            return resp
        except requests.RequestException as exc:
            log.warning("[%s] 请求失败 %s: %s", self.source.id, url, exc)
            return None

    def target_companies(self, companies: List[Company]) -> List[Company]:
        if self.source.market in ("all", "", None):
            return companies
        return [c for c in companies if c.market == self.source.market]

    @property
    def max_items(self) -> int:
        return self.settings.max_items_per_source

    @staticmethod
    def ts(value: Any) -> str:
        """尽力把各种时间格式规整成 ISO 字符串。"""
        if not value:
            return ""
        if isinstance(value, (int, float)):
            try:
                seconds = value / 1000 if value > 1e11 else value
                return datetime.fromtimestamp(seconds).isoformat(timespec="seconds")
            except (ValueError, OSError):
                return ""
        text = str(value).strip()
        for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%Y-%m-%d",
                    "%Y/%m/%d %H:%M:%S", "%Y/%m/%d", "%Y%m%d"):
            try:
                return datetime.strptime(text, fmt).isoformat(timespec="seconds")
            except ValueError:
                continue
        return text
