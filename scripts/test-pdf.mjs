import fs from 'fs';
import pdfParse from 'pdf-parse';

const buf = fs.readFileSync('content/巴菲特致股东信60年合集1950-2025（芒格书院精译）.pdf');
const data = await pdfParse(buf, { max: 3 });
console.log('Total pages:', data.numpages);
console.log('--- First 5000 chars ---');
console.log(data.text.substring(0, 5000));
