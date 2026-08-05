from pathlib import Path

from pypdf import PdfReader, PdfWriter


ROOT = Path.cwd()
EBOOK_DIR = ROOT / "output" / "ebook"
PDF_DIR = ROOT / "output" / "pdf"

BOOKS = [
    {
        "name": "巴菲特文集_1956-2025",
        "cover": EBOOK_DIR / ".巴菲特文集_封面临时.pdf",
        "body": EBOOK_DIR / ".巴菲特文集_正文临时.pdf",
        "current": PDF_DIR / "巴菲特文集_1956-2025.pdf",
    },
    {
        "name": "芒格文集_1924-2023",
        "cover": EBOOK_DIR / ".芒格文集_封面临时.pdf",
        "body": EBOOK_DIR / ".芒格文集_正文临时.pdf",
        "current": PDF_DIR / "芒格文集_1924-2023.pdf",
    },
]


def top_level_outline(reader: PdfReader):
    items = []
    for item in reader.outline:
        if isinstance(item, list):
            continue
        try:
            items.append((item.title, reader.get_destination_page_number(item)))
        except Exception:
            continue
    return items


for book in BOOKS:
    candidate = PDF_DIR / f".{book['name']}_优化候选.pdf"
    current_reader = PdfReader(str(book["current"]))
    outline = top_level_outline(current_reader)
    metadata = {
        key: str(value)
        for key, value in (current_reader.metadata or {}).items()
        if key.startswith("/") and value is not None
    }

    writer = PdfWriter()
    writer.append(str(book["cover"]), import_outline=False)
    writer.append(str(book["body"]), import_outline=False)
    writer.add_metadata(metadata)
    for title, page_number in outline:
        writer.add_outline_item(title, page_number)

    writer.compress_identical_objects(remove_duplicates=True, remove_unreferenced=True)
    with candidate.open("wb") as stream:
        writer.write(stream)

    print(
        {
            "candidate": str(candidate),
            "pages": len(writer.pages),
            "bookmarks": len(outline),
            "bytes": candidate.stat().st_size,
        }
    )
