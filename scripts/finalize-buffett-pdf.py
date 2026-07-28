from pathlib import Path
import re

from pypdf import PdfReader, PdfWriter


ROOT = Path.cwd()
EBOOK_DIR = ROOT / "output" / "ebook"
COVER = EBOOK_DIR / ".巴菲特文集_封面临时.pdf"
BODY = EBOOK_DIR / ".巴菲特文集_正文临时.pdf"
OUTPUT = EBOOK_DIR / "巴菲特文集_1956-2025.pdf"

VOLUMES = [
    ("卷一　人物、方法与商业判断", "VOLUME01"),
    ("卷二　合伙人时代", "VOLUME02"),
    ("卷三　伯克希尔股东信", "VOLUME03"),
    ("卷四　股东大会问答", "VOLUME04"),
    ("卷五　公开演讲", "VOLUME05"),
    ("卷六　访谈与对话", "VOLUME06"),
]


def normalized(text: str) -> str:
    return re.sub(r"\s+", "", text or "")


body_reader = PdfReader(str(BODY))
volume_pages = {}
target_index = 0

for page_index, page in enumerate(body_reader.pages):
    if target_index >= len(VOLUMES):
        break
    text = normalized(page.extract_text())
    label, needle = VOLUMES[target_index]
    if normalized(needle) in text:
        volume_pages[label] = page_index
        target_index += 1

writer = PdfWriter()
writer.append(str(COVER), import_outline=False)
writer.append(str(BODY), import_outline=False)
writer.add_metadata(
    {
        "/Title": "巴菲特文集：1956—2025",
        "/Author": "沃伦·巴菲特等",
        "/Subject": "合伙人信、伯克希尔股东信、股东大会、演讲、访谈与专题文章",
        "/Keywords": "巴菲特, 伯克希尔, 股东信, 价值投资, 资本配置",
        "/Creator": "巴芒书院资料库整理版",
    }
)

writer.add_outline_item("封面", 0)
writer.add_outline_item("扉页与目录", 1)
for label, _ in VOLUMES:
    if label in volume_pages:
        writer.add_outline_item(label, volume_pages[label] + 1)

with OUTPUT.open("wb") as stream:
    writer.write(stream)

print(
    {
        "output": str(OUTPUT),
        "pages": len(writer.pages),
        "volume_bookmarks": volume_pages,
        "bytes": OUTPUT.stat().st_size,
    }
)
