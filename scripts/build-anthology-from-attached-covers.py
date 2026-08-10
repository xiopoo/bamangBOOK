import io, sys
from pathlib import Path
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.lib.colors import white, HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

root = Path(__file__).resolve().parents[1]
pdfdir = root / 'output' / 'pdf'
tmp = root / 'tmp' / 'pdfs' / 'attached-cover-anthologies'
tmp.mkdir(parents=True, exist_ok=True)
pdfmetrics.registerFont(TTFont('CJK', '/System/Library/Fonts/Supplemental/Songti.ttc'))

def cover_pdf(image_path, out_path, title):
    c = canvas.Canvas(str(out_path), pagesize=A4)
    c.drawImage(ImageReader(str(image_path)), 0, 0, width=A4[0], height=A4[1], preserveAspectRatio=True, anchor='c')
    c.save()

def footer_overlay(title, person, years, n, total):
    buf = io.BytesIO(); c = canvas.Canvas(buf, pagesize=A4); W,H=A4
    c.setFillColor(white); c.rect(0,H-25*72/25.4,W,25*72/25.4,fill=1,stroke=0); c.rect(0,0,W,24*72/25.4,fill=1,stroke=0)
    c.setFillColor(HexColor('#777777')); c.setFont('CJK',7.5); c.drawString(18*72/25.4,H-12*72/25.4,title)
    c.setFillColor(HexColor('#AB1942')); c.setFont('Helvetica',7.5); c.drawRightString(W-18*72/25.4,H-12*72/25.4,'THE WARREN BUFFETT READER' if person=='巴菲特' else 'THE CHARLIE MUNGER READER')
    c.setFillColor(HexColor('#777777')); c.setFont('Helvetica',7.5); c.drawString(18*72/25.4,10*72/25.4,years); c.drawRightString(W-18*72/25.4,10*72/25.4,f'{n} / {total}')
    c.save(); buf.seek(0); return PdfReader(buf).pages[0]

def build(title, person, years, cover_img, copyright_pdf, body_pdf, out_pdf, total):
    cover_path=tmp/(title+'-cover.pdf'); cover_pdf(cover_img,cover_path,title)
    w=PdfWriter(); w.add_page(PdfReader(str(cover_path)).pages[0]); w.add_page(PdfReader(str(copyright_pdf)).pages[0])
    body=PdfReader(str(body_pdf))
    for n,page in enumerate(body.pages[1:], start=3):
        page.merge_page(footer_overlay(title,person,years,n,total)); w.add_page(page)
    w.add_metadata({'/Title':title,'/Author':'华少（金家岭小胖）'})
    with open(out_pdf,'wb') as f:w.write(f)

if __name__=='__main__':
    build('巴菲特文集','巴菲特','1956—2025',sys.argv[1],sys.argv[2],sys.argv[3],pdfdir/'巴菲特文集.pdf',4585)
    build('芒格文集','芒格','1924—2023',sys.argv[4],sys.argv[5],sys.argv[6],pdfdir/'芒格文集.pdf',1905)
