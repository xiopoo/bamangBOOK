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

function toTargetFilename(title) {
  let name = title.replace(/\.md$/, '');
  
  if (name.startsWith('partnership_')) {
    let rest = name.replace('partnership_', '');
    const yearMatch = rest.match(/(\d{4})/);
    if (!yearMatch) return title;
    const year = yearMatch[1];
    let type = 'annual';
    if (rest.includes('年中') || rest.includes('中-') || rest.includes('interim')) type = 'interim';
    else if (rest.includes('清算') || rest.includes('12月26')) type = 'liquidation';
    else if (rest.includes('债券') || rest.includes('bond')) type = 'bond';
    return `partnership_${year}-${type}-巴菲特致合伙人信.md`;
  }
  
  if (name.startsWith('berkshire_')) {
    const yearMatch = name.match(/(\d{4})/);
    if (!yearMatch) return title;
    return `berkshire_${yearMatch[1]}-巴菲特致股东信.md`;
  }
  
  return title;
}

function decodeChinese(str) {
  try {
    if (/[\u4e00-\u9fa5]/.test(str)) return str;
    return Buffer.from(str, 'binary').toString('utf8');
  } catch { return str; }
}

async function searchAllItems(query, maxItems = 100) {
  let allItems = [];
  let cursor = 0;
  const limit = 100;
  
  while (allItems.length < maxItems) {
    const result = await apiRequest('openapi/wiki/v1/search_knowledge', {
      knowledge_base_id: 'InJJv1eOlJ6KyiCwklcZjp3Wwg37PPfGY56OeXHtw7c=',
      query,
      cursor,
      limit
    });
    
    if (result.code !== 0) {
      console.log(`API error: ${result.msg}`);
      break;
    }
    
    const items = result.data?.info_list || [];
    if (items.length === 0) break;
    
    allItems = allItems.concat(items);
    cursor = result.data?.cursor || 0;
    
    if (result.data?.is_end) break;
    await sleep(1000);
  }
  
  return allItems;
}

async function main() {
  console.log('=== Phase 1: Search for all letters ===');
  
  console.log('\n--- Searching partnership letters ---');
  const partners = await searchAllItems('partnership');
  console.log(`Found ${partners.length} partnership items`);
  
  console.log('\n--- Searching berkshire letters ---');
  const berkshires = await searchAllItems('berkshire');
  console.log(`Found ${berkshires.length} berkshire items`);
  
  // Deduplicate by media_id
  const seen = new Set();
  const allItems = [...partners, ...berkshires].filter(item => {
    const key = item.media_id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  console.log(`\nTotal items (after dedup): ${allItems.length}`);
  
  // Print mapping
  console.log('\n=== File Mapping ===');
  const mapping = [];
  
  for (const item of allItems) {
    const title = decodeChinese(item.title || '');
    const targetName = toTargetFilename(title);
    const category = title.startsWith('partnership') ? 'partnership' : 'letters';
    console.log(`[${category}] ${title} -> ${targetName}`);
    mapping.push({ mediaId: item.media_id, targetName, category, title });
  }
  
  // Download each file
  console.log('\n=== Phase 2: Download files ===');
  for (let i = 0; i < mapping.length; i++) {
    const m = mapping[i];
    try {
      console.log(`[${i+1}/${mapping.length}] ${m.title}...`);
      const info = await apiRequest('openapi/wiki/v1/get_media_info', { media_id: m.mediaId });
      
      if (info.data && (info.data.url || info.data.url_info?.url)) {
        const downloadUrlStr = info.data.url || info.data.url_info.url;
        const dest = m.category === 'partnership' 
          ? `upload/partnership/${m.targetName}`
          : `upload/letters/${m.targetName}`;
        await downloadUrl(downloadUrlStr, dest);
        console.log(`  ✅ ${dest}`);
      } else {
        console.log(`  ❌ No URL: ${JSON.stringify(info).substring(0, 200)}`);
      }
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
    }
    await sleep(1500);
  }
  
  console.log('\n=== Done ===');
}

main().catch(e => console.error('Error:', e));
