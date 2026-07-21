const https = require('https');
const fs = require('fs');

const clientId = '936162feb25c5cb9b8b1762324c54dea';
const apiKey = 'tjXYhdMZmn1iJQt4WD7h1QKbyxAMVxsfHP2+acNu0R9E96adgAakCIgiGp3OOXzRRGgayzmqmg==';

function apiRequest(apiPath, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'ima.qq.com',
      path: '/' + apiPath,
      method: 'POST',
      headers: {
        'ima-openapi-clientid': clientId,
        'ima-openapi-apikey': apiKey,
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(data),
      }
    };
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const result = Buffer.concat(chunks).toString('utf8');
        try { resolve(JSON.parse(result)); } catch { resolve({ raw: result }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function downloadUrl(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(true); });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

function decodeChineseFilename(str) {
  try {
    if (/[\u4e00-\u9fa5]/.test(str)) return str;
    return Buffer.from(str, 'binary').toString('utf8');
  } catch { return str; }
}

async function searchAll(query, limit = 100) {
  let allItems = [];
  let cursor = 0;
  let hasMore = true;
  
  while (hasMore) {
    const result = await apiRequest('openapi/wiki/v1/search_knowledge', {
      knowledge_base_id: 'InJJv1eOlJ6KyiCwklcZjp3Wwg37PPfGY56OeXHtw7c=',
      query,
      cursor,
      limit
    });
    
    if (result.data && result.data.items) {
      allItems = allItems.concat(result.data.items);
      if (result.data.items.length < limit) {
        hasMore = false;
      } else {
        cursor += limit;
        await sleep(1500);
      }
    } else {
      hasMore = false;
    }
  }
  return allItems;
}

async function getMediaInfo(mediaId) {
  return await apiRequest('openapi/wiki/v1/get_media_info', { media_id: mediaId });
}

function toSystemFileName(imaTitle) {
  // Remove .md extension
  let name = imaTitle.replace(/\.md$/, '');
  
  // Convert Chinese format to system format
  // e.g. "partnership_1969年10月-巴菲特致合伙人信" -> "partnership_1969-annual-巴菲特致合伙人信"
  // e.g. "berkshire_1965-巴菲特致股东信" -> "berkshire_1965-巴菲特致股东信"
  
  // Handle partnership letters
  if (name.startsWith('partnership_')) {
    let rest = name.replace('partnership_', '');
    // Extract year (first 4 digits)
    const yearMatch = rest.match(/(\d{4})/);
    if (!yearMatch) return imaTitle.replace('.md', '') + '.md';
    const year = yearMatch[1];
    
    // Determine type
    let type = 'annual';
    if (rest.includes('年中') || rest.includes('中-') || rest.includes(' interim') || rest.includes('interim')) {
      type = 'interim';
    } else if (rest.includes('清算') || rest.includes('liquidation') || rest.includes('12月26')) {
      type = 'liquidation';
    } else if (rest.includes('债券') || rest.includes('bond')) {
      type = 'bond';
    }
    
    return `partnership_${year}-${type}-巴菲特致合伙人信.md`;
  }
  
  // Handle berkshire letters
  if (name.startsWith('berkshire_')) {
    let rest = name.replace('berkshire_', '');
    const yearMatch = rest.match(/(\d{4})/);
    if (!yearMatch) return imaTitle.replace('.md', '') + '.md';
    const year = yearMatch[1];
    return `berkshire_${year}-巴菲特致股东信.md`;
  }
  
  return imaTitle;
}

async function main() {
  console.log('=== Searching for all letters ===');
  
  // Get partnership letters
  console.log('\n--- Partnership Letters ---');
  const partners = await searchAll('partnership_');
  console.log(`Found ${partners.length} partnership letters`);
  
  // Get berkshire shareholder letters  
  console.log('\n--- Berkshire Letters ---');
  const berkshires = await searchAll('berkshire_');
  console.log(`Found ${berkshires.length} berkshire letters`);
  
  // Map to target file names
  const mapping = [];
  
  for (const item of partners) {
    const title = decodeChineseFilename(item.title || '');
    const targetName = toSystemFileName(title);
    mapping.push({
      mediaId: item.media_id,
      sourceTitle: title,
      targetName,
      category: 'partnership'
    });
  }
  
  for (const item of berkshires) {
    const title = decodeChineseFilename(item.title || '');
    const targetName = toSystemFileName(title);
    mapping.push({
      mediaId: item.media_id,
      sourceTitle: title,
      targetName,
      category: 'letters'
    });
  }
  
  // Print mapping
  console.log('\n=== File Mapping ===');
  for (const m of mapping) {
    console.log(`[${m.category}] ${m.sourceTitle}  ->  upload/${m.category === 'partnership' ? 'partnership' : 'letters'}/${m.targetName}`);
  }
  
  // Download files
  console.log('\n=== Downloading files ===');
  for (let i = 0; i < mapping.length; i++) {
    const m = mapping[i];
    try {
      console.log(`[${i+1}/${mapping.length}] Getting URL for ${m.sourceTitle}...`);
      const info = await getMediaInfo(m.mediaId);
      await sleep(1000);
      
      if (info.data && info.data.url) {
        const url = info.data.url;
        const destDir = m.category === 'partnership' ? 'upload/partnership' : 'upload/letters';
        const destPath = `${destDir}/${m.targetName}`;
        console.log(`  Downloading to ${destPath}...`);
        await downloadUrl(url, destPath);
        console.log(`  ✅ Downloaded`);
      } else {
        console.log(`  ❌ No URL found: ${JSON.stringify(info).substring(0, 200)}`);
      }
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
    }
    await sleep(1500);
  }
  
  console.log('\n=== Done ===');
}

main().catch(e => console.error('Error:', e));
