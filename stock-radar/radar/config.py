"""配置加载：数据源、关注公司、关注方向、运行时环境。"""
from __future__ import annotations

import os
import threading
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List

import yaml

BASE_DIR = Path(__file__).resolve().parent.parent
CONFIG_DIR = BASE_DIR / "config"
DATA_DIR = Path(os.environ.get("RADAR_DATA_DIR", BASE_DIR / "data"))
DB_PATH = DATA_DIR / "radar.db"

_lock = threading.Lock()


def _read_yaml(path: Path) -> Dict[str, Any]:
    if not path.exists():
        return {}
    with path.open("r", encoding="utf-8") as fh:
        return yaml.safe_load(fh) or {}


def _write_yaml(path: Path, payload: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    with tmp.open("w", encoding="utf-8") as fh:
        yaml.safe_dump(payload, fh, allow_unicode=True, sort_keys=False)
    tmp.replace(path)


@dataclass
class Source:
    id: str
    name: str
    type: str
    category: str = "news"
    market: str = "all"
    lang: str = "zh"
    enabled: bool = True
    weight: int = 5
    params: Dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, raw: Dict[str, Any]) -> "Source":
        return cls(
            id=raw["id"],
            name=raw.get("name", raw["id"]),
            type=raw["type"],
            category=raw.get("category", "news"),
            market=raw.get("market", "all"),
            lang=raw.get("lang", "zh"),
            enabled=bool(raw.get("enabled", True)),
            weight=int(raw.get("weight", 5)),
            params=raw.get("params") or {},
        )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "category": self.category,
            "market": self.market,
            "lang": self.lang,
            "enabled": self.enabled,
            "weight": self.weight,
            "params": self.params,
        }


@dataclass
class Company:
    name: str
    code: str
    market: str = "cn"
    aliases: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)

    @property
    def key(self) -> str:
        return f"{self.market}:{self.code}"

    @property
    def match_terms(self) -> List[str]:
        terms = {self.name, self.code}
        terms.update(self.aliases or [])
        return [t for t in terms if t]

    @classmethod
    def from_dict(cls, raw: Dict[str, Any]) -> "Company":
        return cls(
            name=raw["name"],
            code=str(raw["code"]),
            market=raw.get("market", "cn"),
            aliases=[str(a) for a in (raw.get("aliases") or [])],
            tags=[str(t) for t in (raw.get("tags") or [])],
        )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "code": self.code,
            "market": self.market,
            "aliases": self.aliases,
            "tags": self.tags,
        }


def load_sources(only_enabled: bool = False) -> List[Source]:
    raw = _read_yaml(CONFIG_DIR / "sources.yml")
    items = [Source.from_dict(s) for s in raw.get("sources", [])]
    return [s for s in items if s.enabled] if only_enabled else items


def save_sources(sources: List[Source]) -> None:
    with _lock:
        _write_yaml(CONFIG_DIR / "sources.yml", {"sources": [s.to_dict() for s in sources]})


def load_companies() -> List[Company]:
    raw = _read_yaml(CONFIG_DIR / "watchlist.yml")
    return [Company.from_dict(c) for c in raw.get("companies", [])]


def save_companies(companies: List[Company]) -> None:
    with _lock:
        _write_yaml(CONFIG_DIR / "watchlist.yml", {"companies": [c.to_dict() for c in companies]})


def load_focus() -> Dict[str, Any]:
    focus = _read_yaml(CONFIG_DIR / "focus.yml")
    focus.setdefault("persona", "我是一名基本面为主的中长线投资者。")
    focus.setdefault("dimensions", [])
    focus.setdefault("noise_filters", [])
    focus.setdefault("thresholds", {"highlight": 75, "include": 50, "drop": 30})
    focus.setdefault("limits", {"summary": 8, "opportunity": 10, "risk": 10})
    return focus


def save_focus(focus: Dict[str, Any]) -> None:
    with _lock:
        _write_yaml(CONFIG_DIR / "focus.yml", focus)


@dataclass
class Settings:
    llm_provider: str = os.environ.get("RADAR_LLM_PROVIDER", "deepseek")
    llm_api_key: str = os.environ.get("RADAR_LLM_API_KEY", "")
    llm_base_url: str = os.environ.get("RADAR_LLM_BASE_URL", "https://api.deepseek.com/v1")
    llm_model: str = os.environ.get("RADAR_LLM_MODEL", "deepseek-chat")
    host: str = os.environ.get("RADAR_HOST", "127.0.0.1")
    port: int = int(os.environ.get("RADAR_PORT", "5090"))
    request_timeout: int = int(os.environ.get("RADAR_HTTP_TIMEOUT", "20"))
    max_items_per_source: int = int(os.environ.get("RADAR_MAX_ITEMS_PER_SOURCE", "40"))

    @property
    def llm_enabled(self) -> bool:
        return bool(self.llm_api_key)


def load_settings() -> Settings:
    _load_dotenv()
    return Settings()


def _load_dotenv() -> None:
    env_path = BASE_DIR / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key, value = key.strip(), value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def ensure_dirs() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
