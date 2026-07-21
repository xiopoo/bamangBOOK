const fs = require('fs');
const path = require('path');

const qaDir = path.join(__dirname, '..', 'content', 'qa');

// Files that need conversion (the 6 without H2 formatting)
// 2000 and 2006 use 、; 2018 and 2020 use ，; 2024 uses 问题 N：
const files = [
  '伯克希尔股东大会实录_2000.md',
  '伯克希尔股东大会实录_2006.md',
  '伯克希尔股东大会实录_2018.md',
  '伯克希尔股东大会实录_2020.md',
  '伯克希尔股东大会实录_2024.md',
];

function convertContent(content) {
  const lines = content.split('\n');
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trimEnd();
    
    // Check if line matches any of the 3 patterns for unformatted questions
    let match = null;
    let prefix = '';
    let number = '';
    let rest = '';

    // Pattern 1: 问题 N：（2024 format）
    const questionPattern = /^问题\s*(\d+)\s*[：:](.+)$/;
    
    // Pattern 2: 数字、 or 数字，（2000/2006 format uses 、; 2018/2020 format uses ，）
    const numberPattern = /^(\d+)[、，](.+)$/;
    
    const qMatch = trimmed.match(questionPattern);
    const nMatch = trimmed.match(numberPattern);
    
    if (qMatch) {
      // Convert: 问题 1：标题内容Speaker：answer
      // To: ## 1，标题内容Speaker
      // Then: answer on next paragraph
      number = qMatch[1];
      rest = qMatch[2];
      
      // Find the first ：in rest to split heading from answer
      const colonIdx = rest.indexOf('：');
      let heading = '';
      let answer = '';
      
      if (colonIdx >= 0) {
        heading = rest.substring(0, colonIdx);
        answer = rest.substring(colonIdx + 1);
      } else {
        heading = rest;
        answer = '';
      }
      
      result.push(`## ${number}，${heading}`);
      result.push('');
      if (answer.trim()) {
        result.push(answer.trimStart());
      }
    } else if (nMatch) {
      // Convert: 1，标题内容Speaker：answer
      // To: ## 1，标题内容Speaker
      // Then: answer
      number = nMatch[1];
      rest = nMatch[2];
      
      // Find the first ：in rest to split heading from answer
      const colonIdx = rest.indexOf('：');
      let heading = '';
      let answer = '';
      
      if (colonIdx >= 0) {
        heading = rest.substring(0, colonIdx);
        answer = rest.substring(colonIdx + 1);
      } else {
        heading = rest;
        answer = '';
      }
      
      result.push(`## ${number}，${heading}`);
      result.push('');
      if (answer.trim()) {
        result.push(answer.trimStart());
      }
    } else {
      result.push(line);
    }
    
    i++;
  }
  
  return result.join('\n');
}

for (const fileName of files) {
  const filePath = path.join(qaDir, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP: ${fileName} not found`);
    continue;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const converted = convertContent(content);
  fs.writeFileSync(filePath, converted, 'utf-8');
  
  // Count changes
  const originalQuestions = (content.match(/^[0-9]+[、，]/gm) || []).length + 
                           (content.match(/^问题 \d+/gm) || []).length;
  const newHeadings = (converted.match(/^## [0-9]+，/gm) || []).length;
  
  console.log(`OK: ${fileName} — ${originalQuestions} original → ${newHeadings} headings`);
}

console.log('\nDone!');
