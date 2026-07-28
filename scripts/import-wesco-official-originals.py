#!/usr/bin/env python3
import json
import re
import textwrap
import urllib.request
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
PDF_DIR = ROOT / "content" / "source-pdfs" / "wesco"
OUT_DIR = ROOT / "content" / "munger-originals"
INDEX_PATH = ROOT / "content" / "munger-originals-index.json"
BASE_URL = "https://www.berkshirehathaway.com/wesco"


def normalize_text(text: str) -> str:
    text = text.replace("\x00", "")
    text = text.replace("\u0002", "")
    text = text.replace("\ufb01", "fi").replace("\ufb02", "fl")
    text = re.sub(r"([a-z])-\n([a-z])", r"\1\2", text)
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def download_pdf(year: int) -> Path:
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    target = PDF_DIR / f"wesco-{year}.pdf"
    if target.exists() and target.stat().st_size > 0:
        return target
    url = f"{BASE_URL}/cm{year}.pdf"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as response:
        target.write_bytes(response.read())
    return target


def extract_pdf(path: Path) -> str:
    reader = PdfReader(str(path))
    pages = []
    for index, page in enumerate(reader.pages, start=1):
        page_text = page.extract_text() or ""
        pages.append(f"\n\n<!-- page {index} -->\n\n{page_text}")
    return normalize_text("\n".join(pages))


def markdown_for(year: int, source_url: str, text: str) -> str:
    title = f"Wesco Financial Corporation Letter to Shareholders {year}"
    frontmatter = textwrap.dedent(
        f"""\
        ---
        title: "{title}"
        year: {year}
        person: "munger"
        author: "Charles T. Munger"
        category: "wesco-shareholder-letter"
        source: "Berkshire Hathaway official Wesco archive"
        sourceUrl: "{source_url}"
        originalLanguage: "en"
        status: "original"
        ---

        # {title}

        > Source: Berkshire Hathaway official Wesco archive. This page preserves the original English text extracted from the official PDF for study.

        """
    )
    return frontmatter + text + "\n"


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    items = []
    for year in range(1997, 2010):
        source_url = f"{BASE_URL}/cm{year}.pdf"
        pdf_path = download_pdf(year)
        text = extract_pdf(pdf_path)
        slug = f"wesco-letter-{year}"
        md_path = OUT_DIR / f"{slug}.md"
        md_path.write_text(markdown_for(year, source_url, text), encoding="utf-8")
        items.append(
            {
                "id": slug,
                "title": f"Wesco Financial Corporation Letter to Shareholders {year}",
                "year": year,
                "author": "Charles T. Munger",
                "category": "Wesco Shareholder Letters",
                "fileName": f"{slug}.md",
                "sourceUrl": source_url,
                "wordCount": len(re.findall(r"\b\w+\b", text)),
            }
        )
        print(f"imported {year}: {md_path.relative_to(ROOT)}")
    INDEX_PATH.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {INDEX_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
