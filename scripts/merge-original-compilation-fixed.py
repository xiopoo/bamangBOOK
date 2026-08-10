import io, sys
from pathlib import Path
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import white, HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

pdfmetrics.registerFont(TTFont('CJK', '/System/Library/Fonts/Supplemental/Songti.ttc'))

cover_path, copyright_path, body_path, output_path, title, person, years, total = sys.argv[1:]
total = int(total)
cover = PdfReader(cover_path)
copyright = PdfReader(copyright_path)
body = PdfReader(body_path)
writer = PdfWriter()

for page in cover.pages:
    writer.add_page(page)
for page in copyright.pages:
    writer.add_page(page)

W, H = A4
def overlay_for(physical_num):
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    # Cover the source document's relative header/footer, then draw corrected values.
    c.setFillColor(white)
    c.rect(0, H - 25 * 72 / 25.4, W, 25 * 72 / 25.4, fill=1, stroke=0)
    c.rect(0, 0, W, 24 * 72 / 25.4, fill=1, stroke=0)
    c.setFillColor(HexColor('#777777'))
    c.setFont('CJK', 7.5)
    c.drawString(18 * 72 / 25.4, H - 12 * 72 / 25.4, title)
    c.setFillColor(HexColor('#AB1942'))
    english = 'THE WARREN BUFFETT READER' if person == '巴菲特' else 'THE CHARLIE MUNGER READER'
    c.drawRightString(W - 18 * 72 / 25.4, H - 12 * 72 / 25.4, english)
    c.setFillColor(HexColor('#777777'))
    c.drawString(18 * 72 / 25.4, 10 * 72 / 25.4, years)
    c.drawRightString(W - 18 * 72 / 25.4, 10 * 72 / 25.4, f'{physical_num} / {total}')
    c.save()
    buf.seek(0)
    return PdfReader(buf).pages[0]

# Remove the old internal title page (body page 1); the agreed cover replaces it.
for idx, page in enumerate(body.pages[1:], start=3):
    page.merge_page(overlay_for(idx))
    writer.add_page(page)

writer.add_metadata({'/Title': '所有者的眼光' if person == '巴菲特' else '理性的格栅', '/Author': '华少（金家岭小胖）'})
with open(output_path, 'wb') as f:
    writer.write(f)
print(output_path)
