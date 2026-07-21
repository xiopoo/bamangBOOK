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

// Missing years that need downloading
const missingYears = [1968, 1969, 1970, 1971, 1973, 1977, 1979, 1985, 2016];

async function main() {
  console.log('=== Downloading missing berkshire letters ===');
  console.log('Missing years:', missingYears.join(', '));
  
  for (const year of missingYears) {
    try {
      console.log(`\nSearching for berkshire_${year}...`);
      const result = await apiRequest('openapi/wiki/v1/search_knowledge', {
        knowledge_base_id: 'InJJv1eOlJ6KyiCwklcZjp3Wwg37PPfGY56OeXHtw7c=',
        query: `berkshire_${year}`,
        cursor: 0,
        limit: 5
      });
      
      if (result.data?.info_list?.length > 0) {
        const item = result.data.info_list[0];
        const mediaId = item.media_id;
        console.log(`  Found: ${item.title}`);
        
        await sleep(2000);
        
        const info = await apiRequest('openapi/wiki/v1/get_media_info', { media_id: mediaId });
        
        if (info.data?.url_info?.url) {
          const dest = `upload/letters/berkshire_${year}-巴菲特致股东信.md`;
          console.log(`  Downloading to ${dest}...`);
          await downloadUrl(info.data.url_info.url, dest);
          console.log(`  ✅ Done`);
        } else {
          console.log(`  ❌ No URL: ${JSON.stringify(info).substring(0, 200)}`);
        }
      } else {
        console.log(`  ❌ Not found in IMA`);
      }
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
    }
    
    await sleep(3000);
  }
  
  console.log('\n=== Missing letters download complete ===');
}

main().catch(e => console.error('Error:', e));
