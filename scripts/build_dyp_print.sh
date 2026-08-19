#!/usr/bin/env bash
# 段永平打印版 PDF 一键生成（分块渲染，避免超大单文档 Chromium 打印崩溃）
set -e
cd "$(dirname "$0")/.."
BASE="$(pwd)"
OUT="$BASE/build_books/dyp_themed"

echo "=== [1/3] 生成打印版 Markdown（仅正式正文，剔除审计/分类/元信息）==="
python3 scripts/build_dyp_print.py

echo "=== [2/3] 确保 reportlab 可用（中文页码用）==="
python3 -c "import reportlab" 2>/dev/null || pip install -q reportlab

echo "=== [3/3] 分块渲染 + pypdf 合并 + 全局页码 ==="
python3 scripts/build_dyp_pdf_chunked.py

echo "=== 完成 ==="
ls -lh "$OUT/段永平文集_打印版.pdf"
