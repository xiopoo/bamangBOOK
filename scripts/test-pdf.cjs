const fs = require('fs');
const pdfParse = require('pdf-parse');

const buf = fs.readFileSync('content/巴菲特致股东信60年合集1950-2025（芒格书院精译）.pdf');
pdfParse(buf, { max: 3 }).then(data => {
  console.log('Total pages:', data.numpages);
  console.log('--- First 5000 chars ---');
  console.log(data.text.substring(0, 5000));
}).catch(err => console.error(err));
