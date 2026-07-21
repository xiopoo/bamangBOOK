const https = require('https');

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

async function main() {
  // Test simple search
  console.log('=== Simple search: partnership ===');
  const r1 = await apiRequest('openapi/wiki/v1/search_knowledge', {
    knowledge_base_id: 'InJJv1eOlJ6KyiCwklcZjp3Wwg37PPfGY56OeXHtw7c=',
    query: 'partnership',
    cursor: 0,
    limit: 50
  });
  console.log(`code=${r1.code}, msg=${r1.msg}`);
  if (r1.data && r1.data.items) {
    console.log(`items count: ${r1.data.items.length}`);
    r1.data.items.slice(0, 5).forEach((item, i) => {
      console.log(`  [${i}] ${item.title || ''} (${item.media_id?.substring(0, 30)}...)`);
    });
  } else {
    console.log('No items, full response:', JSON.stringify(r1).substring(0, 500));
  }
}

main().catch(e => console.error('Error:', e));
