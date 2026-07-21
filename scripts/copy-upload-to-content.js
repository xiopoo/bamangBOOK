const fs = require('fs');
const path = require('path');

// Partnership file mapping: upload -> system filename
const PARTNERSHIP_MAP = {
  'partnership_1956-annual-巴菲特致合伙人信.md': 'partnership_1956-巴菲特致合伙人信.md',
  'partnership_1957-annual-巴菲特致合伙人信.md': 'partnership_1957-巴菲特致合伙人信.md',
  'partnership_1958-annual-巴菲特致合伙人信.md': 'partnership_1958-巴菲特致合伙人信.md',
  'partnership_1959-annual-巴菲特致合伙人信.md': 'partnership_1959-巴菲特致合伙人信.md',
  'partnership_1960-annual-巴菲特致合伙人信.md': 'partnership_1960-巴菲特致合伙人信.md',
  'partnership_1961-annual-巴菲特致合伙人信.md': 'partnership_1961-annual-巴菲特致合伙人信.md',
  'partnership_1961-interim-巴菲特致合伙人信.md': 'partnership_1961-interim-巴菲特致合伙人信.md',
  'partnership_1962-annual-巴菲特致合伙人信.md': 'partnership_1962-annual-巴菲特致合伙人信.md',
  'partnership_1962-interim-巴菲特致合伙人信.md': 'partnership_1962-interim-巴菲特致合伙人信.md',
  'partnership_1963-annual-巴菲特致合伙人信.md': 'partnership_1963-annual-巴菲特致合伙人信.md',
  'partnership_1963-interim-巴菲特致合伙人信.md': 'partnership_1963-interim-巴菲特致合伙人信.md',
  'partnership_1964-annual-巴菲特致合伙人信.md': 'partnership_1964-annual-巴菲特致合伙人信.md',
  'partnership_1964-interim-巴菲特致合伙人信.md': 'partnership_1964-interim-巴菲特致合伙人信.md',
  'partnership_1965-annual-巴菲特致合伙人信.md': 'partnership_1965-annual-巴菲特致合伙人信.md',
  'partnership_1965-interim-巴菲特致合伙人信.md': 'partnership_1965-interim-巴菲特致合伙人信.md',
  'partnership_1966-annual-巴菲特致合伙人信.md': 'partnership_1966-annual-巴菲特致合伙人信.md',
  'partnership_1966-interim-巴菲特致合伙人信.md': 'partnership_1966-interim-巴菲特致合伙人信.md',
  'partnership_1967-annual-巴菲特致合伙人信.md': 'partnership_1967-annual-巴菲特致合伙人信.md',
  'partnership_1967-interim-巴菲特致合伙人信.md': 'partnership_1967-interim-巴菲特致合伙人信.md',
  'partnership_1968-annual-巴菲特致合伙人信.md': 'partnership_1968-annual-巴菲特致合伙人信.md',
  'partnership_1968-interim-巴菲特致合伙人信.md': 'partnership_1968-interim-巴菲特致合伙人信.md',
  'partnership_1969-annual-巴菲特致合伙人信.md': 'partnership_1969-annual-巴菲特致合伙人信.md',
  'partnership_1969-liquidation-巴菲特致合伙人信.md': 'partnership_1969-liquidation-巴菲特致合伙人信.md',
  'partnership_1970-annual-巴菲特致合伙人信.md': 'partnership_1970-bond-巴菲特致合伙人信.md',
};

// Letters: upload name and system name are the same format
const lettersDir = 'upload/letters';
const contentLettersDir = 'content/letters';
const partnershipDir = 'upload/partnership';
const contentPartnershipDir = 'content/partnership';

// Counters
let copied = 0;
let errors = 0;

// Copy letters (same name)
console.log('=== Copying Letters ===');
const letterFiles = fs.readdirSync(lettersDir).filter(f => f.startsWith('berkshire_'));
for (const file of letterFiles) {
  const src = path.join(lettersDir, file);
  const dst = path.join(contentLettersDir, file);
  try {
    fs.copyFileSync(src, dst);
    console.log(`  ✅ ${file}`);
    copied++;
  } catch (err) {
    console.log(`  ❌ ${file}: ${err.message}`);
    errors++;
  }
}

// Copy partnership (with mapping)
console.log('\n=== Copying Partnership Letters ===');
const partnerFiles = fs.readdirSync(partnershipDir).filter(f => f.startsWith('partnership_'));
for (const file of partnerFiles) {
  const targetName = PARTNERSHIP_MAP[file];
  if (!targetName) {
    console.log(`  ❌ ${file}: No mapping found!`);
    errors++;
    continue;
  }
  const src = path.join(partnershipDir, file);
  const dst = path.join(contentPartnershipDir, targetName);
  try {
    fs.copyFileSync(src, dst);
    console.log(`  ${file} -> ${targetName} ✅`);
    copied++;
  } catch (err) {
    console.log(`  ❌ ${file}: ${err.message}`);
    errors++;
  }
}

// Also clean up upload directory after successful copy
if (errors === 0) {
  console.log(`\n=== All ${copied} files copied successfully. Cleaning up upload/ ===`);
  fs.rmSync('upload/letters', { recursive: true, force: true });
  fs.rmSync('upload/partnership', { recursive: true, force: true });
  fs.rmSync('upload', { recursive: true, force: true });
  console.log('upload/ directory cleaned up.');
} else {
  console.log(`\n=== Completed with ${errors} errors. ${copied} files copied. ===`);
  console.log('Upload directory NOT cleaned up - check errors above.');
}
