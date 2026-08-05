"""基本面快照采集器：用 AkShare 拉取关注公司的核心财务指标与估值。

目标：为每日日报提供一份「基本面速览」，覆盖 A 股 / 港股 / 美股。
- A 股：个股指标（pe/pb/ps）、利润表/资产负债表核心科目
- 港股：个股指标（pe/pb/ps/股息率）
- 美股：个股指标（pe/pb/ps）

若运行环境无 akshare，则自动降级为「空结果」并打日志，不阻塞整条采集流水线。
"""
from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from .base import BaseCollector, Signal

log = logging.getLogger("radar.collector.fundamentals")

# 各市场默认拉取的指标字段（akshare 返回列名 -> 中文标签）
_CN_INDICATOR_FIELDS = {
    "市盈率(TTM)": "PE(TTM)",
    "市净率": "PB",
    "市销率(TTM)": "PS(TTM)",
    "股息率": "股息率(%)",
    "总市值": "总市值",
}
_HK_INDICATOR_FIELDS = {
    "市盈率": "PE",
    "市净率": "PB",
    "股息率": "股息率(%)",
    "总市值": "总市值",
}
_US_INDICATOR_FIELDS = {
    "市盈率": "PE",
    "市净率": "PB",
    "市销率": "PS",
}


def _to_float(value: Any) -> Optional[float]:
    if value in (None, "", "-"):
        return None
    try:
        return float(str(value).replace(",", "").replace("%", ""))
    except (ValueError, TypeError):
        return None


def _fmt(value: Optional[float], suffix: str = "") -> str:
    if value is None:
        return "—"
    return f"{value:,.2f}{suffix}"


class FundamentalsCollector(BaseCollector):
    """生成关注公司的基本面快照（估值 + 近期财务）。"""

    type_name = "fundamentals"

    def collect(self, trade_date: str, companies: List[Any]) -> List[Signal]:
        try:
            import akshare as ak  # noqa: F401
        except ImportError:
            log.warning("[fundamentals] 未安装 akshare，跳过基本面快照；"
                        "执行 `pip install akshare` 启用")
            return []

        signals: List[Signal] = []
        for c in companies:
            snap = self._snapshot_for(ak, c)
            if not snap:
                continue
            signals.append(self._to_signal(c, trade_date, snap))
        log.info("[fundamentals] 生成基本面快照 %d 条", len(signals))
        return signals

    # -------------------- 各市场实现 --------------------

    def _snapshot_for(self, ak, c: Any) -> Optional[Dict[str, Any]]:
        market = (c.market or "").lower()
        code = str(c.code or "").strip()
        if not code:
            return None
        try:
            if market == "cn":
                return self._cn(ak, code)
            if market == "hk":
                return self._hk(ak, code)
            if market == "us":
                return self._us(ak, code)
        except Exception as exc:  # 单只失败不影响其他
            log.warning("[fundamentals] %s(%s) 拉取失败: %s", c.name, code, exc)
        return None

    def _cn(self, ak, code: str) -> Dict[str, Any]:
        snap: Dict[str, Any] = {}
        # 估值指标
        try:
            df = ak.stock_a_indicator_lg(symbol=code)
            if df is not None and not df.empty:
                row = df.iloc[-1]
                for col, label in _CN_INDICATOR_FIELDS.items():
                    if col in row:
                        snap[label] = _to_float(row[col])
        except Exception as exc:
            log.debug("[fundamentals] cn indicator fail %s: %s", code, exc)
        # 利润表核心科目（营收、净利、增速）
        for fn, key, label in (
            ("stock_profit_sheet_by_report_em", "revenue", "营业收入(元)"),
            ("stock_profit_sheet_by_report_em", "net_profit", "净利润(元)"),
        ):
            try:
                df = getattr(ak, fn)(symbol=code)
                if df is not None and not df.empty:
                    row = df.iloc[0]
                    snap[key] = _to_float(row.get(label))
            except Exception:
                pass
        return snap

    def _hk(self, ak, code: str) -> Dict[str, Any]:
        snap: Dict[str, Any] = {}
        try:
            df = ak.stock_hk_indicators_eniu(symbol=code, indicator="市盈率")
            if df is not None and not df.empty:
                snap["PE"] = _to_float(df.iloc[-1].get("value"))
        except Exception:
            pass
        try:
            df = ak.stock_hk_indicators_eniu(symbol=code, indicator="市净率")
            if df is not None and not df.empty:
                snap["PB"] = _to_float(df.iloc[-1].get("value"))
        except Exception:
            pass
        try:
            df = ak.stock_hk_indicators_eniu(symbol=code, indicator="股息率")
            if df is not None and not df.empty:
                snap["股息率(%)"] = _to_float(df.iloc[-1].get("value"))
        except Exception:
            pass
        return snap

    def _us(self, ak, code: str) -> Dict[str, Any]:
        snap: Dict[str, Any] = {}
        try:
            df = ak.stock_us_fundamental_indicator(symbol=code, indicator="市盈率")
            if df is not None and not df.empty:
                snap["PE"] = _to_float(df.iloc[-1].get("value"))
        except Exception:
            pass
        try:
            df = ak.stock_us_fundamental_indicator(symbol=code, indicator="市净率")
            if df is not None and not df.empty:
                snap["PB"] = _to_float(df.iloc[-1].get("value"))
        except Exception:
            pass
        try:
            df = ak.stock_us_fundamental_indicator(symbol=code, indicator="市销率")
            if df is not None and not df.empty:
                snap["PS"] = _to_float(df.iloc[-1].get("value"))
        except Exception:
            pass
        return snap

    # -------------------- 组装 signal --------------------

    def _to_signal(self, c: Any, trade_date: str, snap: Dict[str, Any]) -> Signal:
        lines = []
        for k, v in snap.items():
            suffix = "%" if "率" in k else ""
            lines.append(f"{k}: {_fmt(v, suffix)}")
        summary = "；".join(lines) if lines else "暂无数据"
        return Signal(
            source_id="fundamentals",
            source_name="基本面快照",
            category="fundamentals",
            market=c.market,
            lang="zh",
            company_key=f"{c.market}:{c.code}",
            company_name=c.name,
            company_code=c.code,
            title=f"{c.name}（{c.code}）基本面快照",
            url="",
            content=summary,
            published_at=datetime.now().strftime("%Y-%m-%d"),
            trade_date=trade_date,
            fingerprint=f"fundamentals:{c.market}:{c.code}:{trade_date}",
            payload={"snapshot": snap},
        )
