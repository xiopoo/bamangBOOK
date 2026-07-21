const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'content', 'letters', 'berkshire_2019-巴菲特致股东信.md');

let content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

// Keep: line 1 (H1), line 2 (blank line), and body lines 435-984 (letter content)
// Remove: lines 3-434 (sidebar nav) and lines 985-end (footer artifacts)
const cleanedLines = [
  lines[0], // # 2019 巴菲特致股东信
  '',       // blank line after H1
  ...lines.slice(434, 984)  // letter body (0-indexed: 434 = line 435)
];

let cleaned = cleanedLines.join('\n');

// Trim trailing whitespace
cleaned = cleaned.replace(/\n{3,}$/, '\n\n');

fs.writeFileSync(filePath, cleaned, 'utf-8');
console.log(`Fixed ${filePath}`);
console.log(`Original lines: ${lines.length}`);
console.log(`Cleaned lines: ${cleaned.split('\n').length}`);
