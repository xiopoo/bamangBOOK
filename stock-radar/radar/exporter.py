"""导出：日报转 Markdown / 纯文本 / 可打印 HTML(PDF)。"""
from __future__ import annotations

from typing import Any, Dict, List

KIND_LABEL = {"opportunity": "机会", "risk": "风险", "neutral": "中性"}


def _fmt_items(items: List[Dict[str, Any]], with_reason: bool = True) -> str:
    lines = []
    for i, item in enumerate(items, 1):
        company = item.get("company_name") or "—"
        code = item.get("company_code") or ""
        suffix = f"({code})" if code else ""
        lines.append(f"{i}. **{company}{suffix}** [{item.get('score', 0)}分]")
        lines.append(f"   - 标题：{item.get('title', '')}")
        if item.get("summary_cn"):
            lines.append(f"   - 摘要：{item['summary_cn']}")
        if with_reason and item.get("reason"):
            lines.append(f"   - 理由：{item['reason']}")
        meta = f"   - 来源：{item.get('source_name', '')}"
        if item.get("published_at"):
            meta += f" | 时间：{item['published_at']}"
        lines.append(meta)
        if item.get("url"):
            lines.append(f"   - 链接：{item['url']}")
        lines.append("")
    return "\n".join(lines) if lines else "（无）\n"


def _fmt_fundamentals(funds: List[Dict[str, Any]]) -> str:
    if not funds:
        return ""
    lines = ["## 基本面快照", ""]
    for f in funds:
        name = f.get("company_name") or "—"
        code = f.get("company_code") or ""
        market = {"cn": "A股", "hk": "港股", "us": "美股"}.get(f.get("market", ""), "")
        head = f"### {name}{f'({code})' if code else ''}{' · ' + market if market else ''}"
        lines.append(head)
        snap = f.get("snapshot") or {}
        if snap:
            for k, v in snap.items():
                lines.append(f"- {k}：{v}")
        elif f.get("content"):
            lines.append(f"- {f['content']}")
        else:
            lines.append("- 暂无数据")
        lines.append("")
    return "\n".join(lines)


def to_markdown(report: Dict[str, Any]) -> str:
    payload = report.get("payload", report)
    date = report.get("report_date") or payload.get("report_date", "")
    label = payload.get("session_label", "")
    stats = payload.get("stats", {})

    parts = [
        f"# 股市雷达日报 · {date} {label}",
        "",
        f"> 生成引擎：{payload.get('engine', '-')} | "
        f"原始信号 {stats.get('total', 0)} 条 | 精选保留 {stats.get('kept', 0)} 条",
        "",
        "## 今日摘要",
        "",
        payload.get("overview", "—"),
        "",
        "## 重点关注",
        "",
        _fmt_items(payload.get("highlights", [])),
        "## 机会信号",
        "",
        _fmt_items(payload.get("opportunities", [])),
        "## 风险提示",
        "",
        _fmt_items(payload.get("risks", [])),
    ]
    others = payload.get("others", [])
    if others:
        parts += ["## 其他动态", "", _fmt_items(others, with_reason=False)]

    fund_md = _fmt_fundamentals(payload.get("fundamentals", []))
    if fund_md:
        parts.append(fund_md)

    by_company = stats.get("by_company") or {}
    if by_company:
        parts += ["## 公司信号分布", ""]
        for name, count in sorted(by_company.items(), key=lambda x: -x[1]):
            parts.append(f"- {name}：{count} 条")
        parts.append("")

    parts += ["---", "", "*本日报由股市雷达自动生成，仅供研究参考，不构成投资建议。*"]
    return "\n".join(parts)


def favorites_to_markdown(favorites: List[Dict[str, Any]]) -> str:
    if not favorites:
        return "# 我的收藏\n\n（暂无收藏）\n"
    lines = ["# 我的收藏", ""]
    for i, fav in enumerate(favorites, 1):
        company = fav.get("company_name") or "—"
        lines.append(f"## {i}. {company} · {fav.get('title', '')}")
        lines.append("")
        if fav.get("summary"):
            lines.append(fav["summary"])
            lines.append("")
        meta = []
        if fav.get("report_date"):
            meta.append(f"日报日期：{fav['report_date']}")
        if fav.get("kind"):
            meta.append(f"类型：{KIND_LABEL.get(fav['kind'], fav['kind'])}")
        if meta:
            lines.append("> " + " | ".join(meta))
            lines.append("")
        if fav.get("url"):
            lines.append(f"原文：{fav['url']}")
            lines.append("")
    return "\n".join(lines)


PRINT_CSS = """
* { box-sizing: border-box; }
body { font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
       max-width: 820px; margin: 0 auto; padding: 40px 32px; color: #1a1a1a; line-height: 1.75; }
h1 { font-size: 26px; border-bottom: 3px solid #c9302c; padding-bottom: 12px; margin-bottom: 8px; }
h2 { font-size: 19px; margin-top: 32px; padding-left: 10px; border-left: 4px solid #c9302c; }
.meta { color: #777; font-size: 13px; margin-bottom: 24px; }
.overview { background: #fbf6ef; border: 1px solid #e8dcc8; border-radius: 8px;
            padding: 16px 20px; margin: 16px 0 8px; }
.item { border-bottom: 1px dashed #ddd; padding: 12px 0; page-break-inside: avoid; }
.item:last-child { border-bottom: none; }
.item-head { font-weight: 600; font-size: 15px; margin-bottom: 6px; }
.badge { display: inline-block; font-size: 11px; padding: 2px 8px; border-radius: 10px;
         margin-right: 6px; vertical-align: middle; }
.badge-opp { background: #e8f5e9; color: #1b7a32; }
.badge-risk { background: #fdecea; color: #c0392b; }
.badge-neu { background: #eef2f7; color: #4a5568; }
.score { color: #c9302c; font-weight: 700; }
.summary { color: #333; font-size: 14px; margin: 4px 0; }
.reason { color: #666; font-size: 13px; font-style: italic; }
.src { color: #999; font-size: 12px; margin-top: 4px; }
.fund-tbl { border-collapse: collapse; width: 100%; margin-top: 6px; font-size: 13px; }
.fund-tbl td { border-bottom: 1px solid #eee; padding: 3px 6px; }
a { color: #2c6fb5; text-decoration: none; word-break: break-all; }
.empty { color: #aaa; font-style: italic; }
footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #eee;
         color: #999; font-size: 12px; text-align: center; }
@media print { body { padding: 0; } @page { margin: 18mm; } }
"""


def _html_items(items: List[Dict[str, Any]]) -> str:
    if not items:
        return '<p class="empty">（无）</p>'
    from html import escape
    blocks = []
    for item in items:
        kind = item.get("kind", "neutral")
        cls = {"opportunity": "badge-opp", "risk": "badge-risk"}.get(kind, "badge-neu")
        company = escape(str(item.get("company_name") or "—"))
        code = escape(str(item.get("company_code") or ""))
        url = escape(str(item.get("url") or ""))
        blocks.append(f"""
<div class="item">
  <div class="item-head">
    <span class="badge {cls}">{KIND_LABEL.get(kind, kind)}</span>
    {company}{f'({code})' if code else ''}
    <span class="score">{item.get('score', 0)}分</span>
  </div>
  <div class="summary">{escape(str(item.get('summary_cn') or item.get('title') or ''))}</div>
  {f'<div class="reason">{escape(str(item["reason"]))}</div>' if item.get('reason') else ''}
  <div class="src">{escape(str(item.get('source_name') or ''))}
    {escape(str(item.get('published_at') or ''))}
    {f'<br><a href="{url}">{url}</a>' if url else ''}</div>
</div>""")
    return "".join(blocks)


def _html_fundamentals(funds: List[Dict[str, Any]]) -> str:
    if not funds:
        return ""
    from html import escape
    try:
        import json as _json
    except ImportError:
        _json = None
    blocks = ['<h2>基本面快照</h2>']
    for f in funds:
        name = escape(str(f.get("company_name") or "—"))
        code = escape(str(f.get("company_code") or ""))
        market = {"cn": "A股", "hk": "港股", "us": "美股"}.get(f.get("market", ""), "")
        head = f"{name}{f'({code})' if code else ''}{' · ' + escape(market) if market else ''}"
        snap = f.get("snapshot")
        if snap is None:
            raw = f.get("payload")
            if isinstance(raw, str) and _json:
                try:
                    raw = _json.loads(raw)
                except (ValueError, TypeError):
                    raw = {}
            snap = (raw or {}).get("snapshot", {}) if isinstance(raw, dict) else {}
        if snap:
            rows = "".join(
                f"<tr><td>{escape(str(k))}</td><td style='text-align:right'>{escape(str(v))}</td></tr>"
                for k, v in snap.items()
            )
            blocks.append(
                f'<div class="item"><div class="item-head">{head}</div>'
                f'<table class="fund-tbl">{rows}</table></div>')
        else:
            content = escape(str(f.get("content") or "暂无数据"))
            blocks.append(f'<div class="item"><div class="item-head">{head}</div>{content}</div>')
    return "".join(blocks)


def to_print_html(report: Dict[str, Any]) -> str:
    from html import escape
    payload = report.get("payload", report)
    date = report.get("report_date") or payload.get("report_date", "")
    label = payload.get("session_label", "")
    stats = payload.get("stats", {})

    return f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8">
<title>股市雷达日报 {date} {label}</title>
<style>{PRINT_CSS}</style></head>
<body>
<h1>股市雷达日报 · {escape(str(date))} {escape(str(label))}</h1>
<div class="meta">生成引擎 {escape(str(payload.get('engine', '-')))} ·
 原始信号 {stats.get('total', 0)} 条 · 精选保留 {stats.get('kept', 0)} 条</div>

<h2>今日摘要</h2>
<div class="overview">{escape(str(payload.get('overview', '—')))}</div>

<h2>重点关注</h2>{_html_items(payload.get('highlights', []))}
<h2>机会信号</h2>{_html_items(payload.get('opportunities', []))}
<h2>风险提示</h2>{_html_items(payload.get('risks', []))}
{'<h2>其他动态</h2>' + _html_items(payload.get('others', [])) if payload.get('others') else ''}
{_html_fundamentals(payload.get('fundamentals', []))}

<footer>本日报由股市雷达自动生成，仅供研究参考，不构成投资建议。<br>
在浏览器中按 Cmd/Ctrl + P 可另存为 PDF。</footer>
<script>window.addEventListener('load', function(){{ if (location.hash === '#print') window.print(); }});</script>
</body></html>"""
