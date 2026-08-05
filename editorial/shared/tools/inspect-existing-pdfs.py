import json
from pathlib import Path
from pypdf import PdfReader

ROOT = Path.cwd()
paths = [
    ROOT / "output/ebook/巴菲特文集_1956-2025.pdf",
    ROOT / "output/ebook/芒格文集_1924-2023.pdf",
    ROOT / "output/pdf/巴菲特文集_1956-2025.pdf",
    ROOT / "output/pdf/芒格文集_1924-2023.pdf",
]

results = []
for path in paths:
    item = {"path": str(path.relative_to(ROOT)), "exists": path.exists()}
    if not path.exists():
        results.append(item)
        continue
    reader = PdfReader(str(path))
    counts = {
        "Link": 0,
        "URI": 0,
        "GoTo": 0,
        "GoToR": 0,
        "Launch": 0,
        "Named": 0,
        "OtherAction": 0,
    }
    fonts = {}
    for page in reader.pages:
        resources = page.get("/Resources", {})
        for name, font_ref in (resources.get("/Font", {}) or {}).items():
            font = font_ref.get_object()
            descriptor_ref = font.get("/FontDescriptor")
            if not descriptor_ref and font.get("/DescendantFonts"):
                descendant = font.get("/DescendantFonts")[0].get_object()
                descriptor_ref = descendant.get("/FontDescriptor")
            descriptor = descriptor_ref.get_object() if descriptor_ref else None
            embedded = bool(descriptor and any(descriptor.get(key) for key in ("/FontFile", "/FontFile2", "/FontFile3")))
            font_key = f"{name}:{font.get('/BaseFont', 'unknown')}"
            fonts[font_key] = {
                "subtype": str(font.get("/Subtype", "")),
                "embedded": embedded,
            }
        for annot_ref in page.get("/Annots", []):
            annot = annot_ref.get_object()
            if str(annot.get("/Subtype", "")) == "/Link":
                counts["Link"] += 1
            action = annot.get("/A")
            if action:
                kind = str(action.get("/S", "")).lstrip("/")
                if kind in counts:
                    counts[kind] += 1
                else:
                    counts["OtherAction"] += 1
    outlines = 0
    try:
        def count_outline(items):
            total = 0
            for entry in items:
                if isinstance(entry, list):
                    total += count_outline(entry)
                else:
                    total += 1
            return total
        outlines = count_outline(reader.outline)
    except Exception:
        outlines = -1
    item.update({
        "bytes": path.stat().st_size,
        "pages": len(reader.pages),
        "metadata": {str(k): str(v) for k, v in (reader.metadata or {}).items()},
        "outlines": outlines,
        "annotations": counts,
        "fonts": {
            "unique": len(fonts),
            "embedded": sum(1 for font in fonts.values() if font["embedded"]),
            "unembedded": [name for name, font in fonts.items() if not font["embedded"]],
        },
    })
    results.append(item)

out = ROOT / "editorial/shared/existing-pdf-inspection.json"
out.write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(results, ensure_ascii=False, indent=2))
