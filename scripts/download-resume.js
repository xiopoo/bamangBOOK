const https = require('https');
const fs = require('fs');

const clientId = '936162feb25c5cb9b8b1762324c54dea';
const apiKey = 'tjXYhdMZmn1iJQt4WD7h1QKbyxAMVxsfHP2+acNu0R9E96adgAakCIgiGp3OOXzRRGgayzmqmg==';
const kbId = 'InJJv1eOlJ6KyiCwklcZjp3Wwg37PPfGY56OeXHtw7c=';

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
      let totalSize = 0;
      res.on('data', chunk => { chunks.push(chunk); totalSize += chunk.length; });
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

async function retryApi(fn, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      if (result.code === 0) return result;
      if (result.msg && !result.msg.includes('频率')) return result;
      console.log(`  ⏳ Rate limited (attempt ${attempt}/${maxRetries}), waiting ${attempt * 5}s...`);
      await sleep(attempt * 5000);
    } catch (e) {
      console.log(`  ⏳ Error (attempt ${attempt}/${maxRetries}): ${e.message}, waiting...`);
      await sleep(attempt * 5000);
    }
  }
  throw new Error('Max retries exceeded');
}

async function main() {
  console.log('=== Step 1: Full search for berkshire_ ===');
  
  const result = await retryApi(() => apiRequest('openapi/wiki/v1/search_knowledge', {
    knowledge_base_id: kbId,
    query: 'berkshire_',
    cursor: 0,
    limit: 100
  }));
  
  const allItems = result.data?.info_list || [];
  console.log(`Found ${allItems.length} items`);
  
  // Build year -> media_id mapping
  const itemMap = {};
  for (const item of allItems) {
    const title = item.title || '';
    const match = title.match(/berkshire_(\d{4})/);
    if (match) {
      const year = parseInt(match[1]);
      if (!itemMap[year] || title.includes(String(year))) {
        itemMap[year] = { mediaId: item.media_id, title };
      }
    }
  }
  
  console.log(`Mapped ${Object.keys(itemMap).length} years`);
  
  // Check which files are already downloaded
  const existingFiles = {};
  const dir = 'upload/letters';
  fs.readdirSync(dir).forEach(file => {
    if (file.startsWith('berkshire_')) {
      const m = file.match(/berkshire_(\d{4})/);
      if (m) existingFiles[parseInt(m[1])] = file;
    }
  });
  console.log(`Already downloaded: ${Object.keys(existingFiles).length} files`);
  
  // Download missing ones
  const missingYears = Object.keys(itemMap).map(Number).sort((a,b) => a-b)
    .filter(y => !existingFiles[y]);
  
  console.log(`Missing: ${missingYears.join(', ')}`);
  
  let success = 0;
  for (const year of missingYears) {
    const item = itemMap[year];
    console.log(`\n[${year}] ${item.title}...`);
    
    try {
      const info = await retryApi(() => apiRequest('openapi/wiki/v1/get_media_info', { media_id: item.mediaId }));
      
      const url = info.data?.url_info?.url;
      if (url) {
        const dest = `upload/letters/berkshire_${year}-巴菲特致股东信.md`;
        await downloadUrl(url, dest);
        console.log(`  ✅ Downloaded`);
        success++;
      } else {
        console.log(`  ❌ No URL found`);
      }
    } catch (err) {
      console.log(`  ❌ ${err.message}`);
    }
    
    await sleep(3000);
  }
  
  console.log(`\n=== Done. Downloaded ${success}/${missingYears.length} missing files ===`);
}

main().catch(e => console.error('Error:', e));
