import PyPDF2

pdf_path = 'content/巴菲特致股东信60年合集1950-2025（芒格书院精译）.pdf'

with open(pdf_path, 'rb') as f:
    reader = PyPDF2.PdfReader(f)
    reader.decrypt('')
    
    print(f"Total pages: {len(reader.pages)}")
    
    # Search for letter starting pattern
    for i in range(50, 300):
        page = reader.pages[i]
        text = page.extract_text()
        if not text:
            continue
        # Look for letter header patterns
        if '致股东的信' in text or '伯克希尔·哈撒韦公司' in text[:200]:
            print(f"\nPage {i+1}:")
            print(text[:500])
            print("---")
