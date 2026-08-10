#!/usr/bin/env python3
import sys
from pypdf import PdfReader, PdfWriter

cover, body, output = sys.argv[1:4]
writer = PdfWriter()
for page in PdfReader(cover).pages:
    writer.add_page(page)
for page in PdfReader(body).pages[1:]:
    writer.add_page(page)
with open(output, "wb") as fh:
    writer.write(fh)
print(output)
