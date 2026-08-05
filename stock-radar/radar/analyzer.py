"""AI 精选与摘要：把原始信号加工成日报。

两条路径：
  - 有 LLM Key：按 focus.yml 的关注方向让模型筛选、翻译、摘要、判定机会/风险
  - 无 Key：规则引擎降级（关键词权重打分），保证系统开箱即用
"""
from __future__ import annotations

import json
import logging
import re
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from .config import Settings, load_focus, load_settings
from .llm import LLMClient

log = logging.getLogger("radar.analyzer")

BATCH_SIZE = 25

# ---- 规则引擎词典（无 LLM 时使用）----
OPPORTUNITY_WORDS = {
    "中标": 22, "签约": 18, "大单": 20, "订单": 15, "超预期": 25, "预增": 24,
    "扭亏": 22, "回购": 18, "增持": 20, "分红": 12, "提价": 18, "涨价": 18,
    "获批": 20, "投产": 16, "扩产": 16, "新产品": 12, "突破": 14, "合作": 10,
    "并购": 18, "重组": 18, "补贴": 12, "评级上调": 22, "目标价": 10,
    "买入": 12, "增持评级": 14, "净利润增长": 20, "营收增长": 18,
}
RISK_WORDS = {
    "亏损": 24, "预减": 24, "下滑": 18, "减持": 22, "质押": 14, "诉讼": 20,
    "仲裁": 18, "处罚": 25, "违规": 25, "问询函": 22,
    "警示函": 24, "退市": 30, "停牌": 20, "商誉减值": 24, "计提": 18,
    "不及预期": 25, "下调": 20, "评级下调": 24, "召回": 22, "事故": 20,
    "调查": 22, "解禁": 14, "高管辞职": 16, "关税": 16, "制裁": 26,
    "禁令": 24, "反垄断": 22,
}
NOISE_PATTERNS = [
    r"^\s*(涨停|跌停|异动|快讯)\s*[:：]?\s*$",
    r"今日(涨|跌)幅",
    r"^\d+只个股",
    r"资金流向一览",
]

CATEGORY_BASE = {
    "announcement": 42,
    "report": 34,
    "news": 28,
    "discussion": 16,
}


def _is_noise(title: str) -> bool:
    return any(re.search(p, title) for p in NOISE_PATTERNS)


def _rule_score(signal: Dict[str, Any]) -> Tuple[int, str, List[str]]:
    """返回 (score, kind, hit_words)。kind ∈ opportunity/risk/neutral"""
    text = f"{signal.get('title', '')} {signal.get('content', '')}"
    score = CATEGORY_BASE.get(signal.get("category", "news"), 20)

    opp_hits = [w for w in OPPORTUNITY_WORDS if w in text]
    risk_hits = [w for w in RISK_WORDS if w in text and RISK_WORDS[w] > 0]

    opp_score = sum(OPPORTUNITY_WORDS[w] for w in opp_hits)
    risk_score = sum(RISK_WORDS[w] for w in risk_hits)
    score += min(opp_score + risk_score, 45)

    heat = signal.get("heat")
    if isinstance(heat, int) and heat > 1000:
        score += 5

    if _is_noise(signal.get("title", "")):
        score -= 30

    score = max(0, min(100, score))

    if risk_score > opp_score and risk_score > 0:
        return score, "risk", risk_hits[:4]
    if opp_score > 0:
        return score, "opportunity", opp_hits[:4]
    return score, "neutral", []


def _rule_analyze(signals: List[Dict[str, Any]], focus: Dict[str, Any]) -> List[Dict[str, Any]]:
    drop = focus["thresholds"].get("drop", 30)
    results = []
    for s in signals:
        score, kind, hits = _rule_score(s)
        if score < drop:
            continue
        content = (s.get("content") or "").strip()
        summary = content[:110] if content else s.get("title", "")[:110]
        reason_bits = []
        if hits:
            reason_bits.append("命中关键词：" + "、".join(hits))
        reason_bits.append(f"来源类型：{s.get('category')}")
        results.append({
            **s,
            "score": score,
            "kind": kind,
            "summary_cn": summary,
            "reason": "；".join(reason_bits),
            "dimension": "fundamental" if kind != "neutral" else "other",
        })
    results.sort(key=lambda x: x["score"], reverse=True)
    return results


# ---------------- LLM 路径 ----------------

SYSTEM_PROMPT = """你是一名严谨的证券研究助理，负责从海量信息中筛选出对投资决策真正有价值的信号。

你的工作准则：
1. 只保留有信息增量的内容，无脑行情播报、情绪化喊单、标题党一律给低分
2. 英文内容必须翻译成中文再摘要
3. 摘要要具体，包含关键数字与事实，不要写"该公司有新动态"这类空话
4. 严格区分"机会信号"与"风险信号"，中性信息标记为 neutral
5. 严禁编造原文中不存在的信息，不确定就如实降低分数

只输出 JSON，不要任何额外说明文字。"""


def _build_user_prompt(signals: List[Dict[str, Any]], focus: Dict[str, Any]) -> str:
    dims = "\n".join(
        f"- {d['name']}(key={d['key']}, 权重{d.get('weight', 5)}): {d.get('description', '')}"
        for d in focus.get("dimensions", [])
    )
    noise = "\n".join(f"- {n}" for n in focus.get("noise_filters", []))
    payload = [
        {
            "id": i,
            "company": s.get("company_name"),
            "code": s.get("company_code"),
            "category": s.get("category"),
            "source": s.get("source_name"),
            "lang": s.get("lang"),
            "title": s.get("title"),
            "content": (s.get("content") or "")[:600],
        }
        for i, s in enumerate(signals)
    ]
    return f"""【我的投资定位】
{focus.get('persona', '')}

【我关注的方向】
{dims}

【需要过滤掉的噪音】
{noise}

【打分规则】
0-100 分。{focus['thresholds'].get('highlight', 75)} 分以上为需要重点关注的强信号；
{focus['thresholds'].get('include', 50)} 分以上进入日报正文；{focus['thresholds'].get('drop', 30)} 分以下会被丢弃。

【待分析信息】
{json.dumps(payload, ensure_ascii=False, indent=1)}

请对每条信息输出分析结果，返回 JSON 数组，每个元素结构：
{{
  "id": 对应输入的 id,
  "score": 0-100 的整数,
  "kind": "opportunity" | "risk" | "neutral",
  "dimension": 命中的关注方向 key,
  "summary_cn": "80字以内的中文摘要，含关键数字与事实",
  "reason": "40字以内说明为什么值得关注或为什么打低分"
}}"""


def _llm_analyze(signals: List[Dict[str, Any]], focus: Dict[str, Any],
                 client: LLMClient) -> Optional[List[Dict[str, Any]]]:
    merged: List[Dict[str, Any]] = []
    drop = focus["thresholds"].get("drop", 30)

    for start in range(0, len(signals), BATCH_SIZE):
        batch = signals[start:start + BATCH_SIZE]
        result = client.chat_json(SYSTEM_PROMPT, _build_user_prompt(batch, focus))
        if result is None:
            log.warning("LLM 批次 %s 分析失败，该批降级为规则引擎", start // BATCH_SIZE)
            merged.extend(_rule_analyze(batch, focus))
            continue
        if isinstance(result, dict):
            result = result.get("results") or result.get("data") or []

        by_id = {}
        for row in result:
            if isinstance(row, dict) and "id" in row:
                try:
                    by_id[int(row["id"])] = row
                except (TypeError, ValueError):
                    continue

        for idx, signal in enumerate(batch):
            row = by_id.get(idx)
            if row is None:
                continue
            try:
                score = int(row.get("score", 0))
            except (TypeError, ValueError):
                score = 0
            if score < drop:
                continue
            kind = row.get("kind", "neutral")
            if kind not in ("opportunity", "risk", "neutral"):
                kind = "neutral"
            merged.append({
                **signal,
                "score": max(0, min(100, score)),
                "kind": kind,
                "dimension": row.get("dimension", "other"),
                "summary_cn": (row.get("summary_cn") or "").strip() or signal.get("title", ""),
                "reason": (row.get("reason") or "").strip(),
            })

    merged.sort(key=lambda x: x["score"], reverse=True)
    return merged


# ---------------- 日报组装 ----------------

def _build_overview(analyzed: List[Dict[str, Any]], focus: Dict[str, Any],
                    client: LLMClient) -> str:
    if not analyzed:
        return "今日无符合关注方向的有效信号。"

    top = analyzed[: focus["limits"].get("summary", 8)]
    if not client.available:
        opp = sum(1 for a in analyzed if a["kind"] == "opportunity")
        risk = sum(1 for a in analyzed if a["kind"] == "risk")
        companies = sorted({a.get("company_name") for a in top if a.get("company_name")})
        return (f"今日共筛出 {len(analyzed)} 条有效信号，其中机会信号 {opp} 条、"
                f"风险信号 {risk} 条。重点涉及：{'、'.join(companies) or '—'}。")

    brief = "\n".join(
        f"- [{a['kind']}|{a['score']}] {a.get('company_name', '')}：{a.get('summary_cn', '')}"
        for a in top
    )
    text = client.chat(
        "你是一名资深投资研究员，擅长把零散信息归纳成有洞察力的每日复盘。只输出正文，不要标题和客套话。",
        f"""我的投资定位：{focus.get('persona', '')}

今日筛选出的核心信号：
{brief}

请写一段 150 字以内的今日摘要，要求：
1. 点出今天最值得注意的 1-2 件事及其影响
2. 如果存在共性主题（如同一政策影响多家公司），要指出来
3. 客观克制，不做投资建议，不喊单""",
        temperature=0.4,
        max_tokens=600,
    )
    return (text or "").strip() or "今日信号已汇总，详见下方分类模块。"


def analyze_signals(signals: List[Dict[str, Any]],
                    settings: Optional[Settings] = None) -> Dict[str, Any]:
    """把原始信号加工成完整日报结构。"""
    settings = settings or load_settings()
    focus = load_focus()
    client = LLMClient(settings)

    if not signals:
        return {
            "engine": "empty",
            "overview": "今日未采集到任何信号，请检查数据源配置或网络。",
            "highlights": [], "opportunities": [], "risks": [], "others": [],
            "fundamentals": [],
            "stats": {"total": 0, "kept": 0},
        }

    if client.available:
        analyzed = _llm_analyze(signals, focus, client)
        engine = f"llm:{settings.llm_model}"
    else:
        analyzed = None
        engine = "rules"

    if analyzed is None:
        analyzed = _rule_analyze(signals, focus)
        engine = "rules"

    # 基本面快照单独成块：不参与机会/风险打分，仅做展示
    fundamentals = [s for s in signals if s.get("category") == "fundamentals"]
    analyzed_for_signals = [s for s in analyzed if s.get("category") != "fundamentals"]

    highlight_at = focus["thresholds"].get("highlight", 75)
    include_at = focus["thresholds"].get("include", 50)
    limits = focus["limits"]

    kept = [a for a in analyzed_for_signals if a["score"] >= include_at]
    highlights = [a for a in kept if a["score"] >= highlight_at][: limits.get("summary", 8)]
    opportunities = [a for a in kept if a["kind"] == "opportunity"][: limits.get("opportunity", 10)]
    risks = [a for a in kept if a["kind"] == "risk"][: limits.get("risk", 10)]
    others = [a for a in kept if a["kind"] == "neutral"][:20]

    overview = _build_overview(kept, focus, client)

    by_company: Dict[str, int] = {}
    for a in kept:
        name = a.get("company_name") or "未归类"
        by_company[name] = by_company.get(name, 0) + 1

    return {
        "engine": engine,
        "overview": overview,
        "highlights": highlights,
        "opportunities": opportunities,
        "risks": risks,
        "others": others,
        "fundamentals": fundamentals,
        "stats": {
            "total": len(signals),
            "kept": len(kept),
            "opportunity": len(opportunities),
            "risk": len(risks),
            "by_company": by_company,
        },
        "generated_at": datetime.now().isoformat(timespec="seconds"),
    }
