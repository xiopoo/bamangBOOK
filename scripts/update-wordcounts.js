const fs = require('fs');
const path = require('path');

// Count Chinese characters + English words
function countWords(text) {
  // Count Chinese characters
  const chineseChars = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;
  // Count English words (sequences of letters)
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  // Count numbers as words
  const numbers = (text.match(/\d+/g) || []).length;
  return chineseChars + englishWords + numbers;
}

function checkFormat(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];
  
  // Check first line starts with #
  const lines = content.split('\n');
  if (!lines[0].startsWith('# ')) {
    issues.push('Missing H1 title (# )');
  }
  
  // Check ends with 巴菲特署名 or similar
  const lastNonEmpty = [...lines].reverse().find(l => l.trim());
  if (lastNonEmpty && !lastNonEmpty.includes('巴菲特')) {
    issues.push('Ending may not have Buffett signature');
  }
  
  return issues;
}

async function main() {
  console.log('=== Format Check ===\n');
  
  // Check partnership files
  let totalIssues = 0;
  const partnerDir = 'content/partnership';
  const partnerFiles = fs.readdirSync(partnerDir).filter(f => f.endsWith('.md')).sort();
  
  console.log('--- Partnership Letters ---');
  for (const file of partnerFiles) {
    const issues = checkFormat(path.join(partnerDir, file));
    if (issues.length > 0) {
      console.log(`⚠️  ${file}: ${issues.join('; ')}`);
      totalIssues++;
    }
  }
  if (totalIssues === 0) console.log('✅ All partnership files look good');
  
  // Check letters files  
  totalIssues = 0;
  const lettersDir = 'content/letters';
  const letterFiles = fs.readdirSync(lettersDir).filter(f => f.endsWith('.md')).sort();
  
  console.log('\n--- Berkshire Letters ---');
  for (const file of letterFiles) {
    const issues = checkFormat(path.join(lettersDir, file));
    if (issues.length > 0) {
      console.log(`⚠️  ${file}: ${issues.join('; ')}`);
      totalIssues++;
    }
  }
  if (totalIssues === 0) console.log('✅ All letters files look good');
  
  // === Update wordCounts ===
  console.log('\n\n=== Updating Index wordCounts ===');
  
  // Partnership index
  console.log('\n--- Partnership Index ---');
  const partnerIndex = JSON.parse(fs.readFileSync('content/partnership-index.json', 'utf-8'));
  let updated = 0;
  for (const item of partnerIndex) {
    const filePath = `content/partnership/${item.fileName}`;
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const newCount = countWords(content);
      if (item.wordCount !== newCount) {
        console.log(`  ${item.fileName}: ${item.wordCount || 0} -> ${newCount}`);
        item.wordCount = newCount;
        updated++;
      }
    } else {
      console.log(`  ❌ File not found: ${filePath}`);
    }
  }
  fs.writeFileSync('content/partnership-index.json', JSON.stringify(partnerIndex, null, 2) + '\n', 'utf-8');
  console.log(`  Updated ${updated} entries`);
  
  // Letters index
  console.log('\n--- Letters Index ---');
  const lettersIndex = JSON.parse(fs.readFileSync('content/letters-index.json', 'utf-8'));
  updated = 0;
  for (const item of lettersIndex) {
    const filePath = `content/letters/${item.fileName}`;
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const newCount = countWords(content);
      if (item.wordCount !== newCount) {
        console.log(`  ${item.fileName}: ${item.wordCount || 0} -> ${newCount}`);
        item.wordCount = newCount;
        updated++;
      }
    } else {
      console.log(`  ❌ File not found: ${filePath}`);
    }
  }
  fs.writeFileSync('content/letters-index.json', JSON.stringify(lettersIndex, null, 2) + '\n', 'utf-8');
  console.log(`  Updated ${updated} entries`);
  
  console.log('\n=== Done ===');
}

main().catch(e => console.error('Error:', e));
