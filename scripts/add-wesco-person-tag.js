const fs = require('fs');
const path = require('path');

// Read qa-index.json
const indexPath = path.join(__dirname, '..', 'content', 'qa-index.json');
const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

let modifiedCount = 0;

// Add "person": "munger" to all Wesco entries
const updatedIndex = index.map(entry => {
  if (entry.title.startsWith('Wesco')) {
    modifiedCount++;
    return { ...entry, person: 'munger' };
  }
  return entry;
});

fs.writeFileSync(indexPath, JSON.stringify(updatedIndex, null, 2), 'utf-8');
console.log(`Modified ${modifiedCount} Wesco entries in qa-index.json`);
console.log(`Total entries: ${updatedIndex.length}`);
