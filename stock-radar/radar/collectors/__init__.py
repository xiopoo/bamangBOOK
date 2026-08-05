"""采集器包：导入即完成注册。"""
from .base import Collector, RawItem, get_collector, register, registered_types  # noqa: F401
from . import eastmoney  # noqa: F401
from . import cn_market  # noqa: F401
from . import generic  # noqa: F401
from . import fundamentals  # noqa: F401

__all__ = ["Collector", "RawItem", "get_collector", "register", "registered_types"]
