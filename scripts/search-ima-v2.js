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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  // Try search_knowledge API instead (within a specific knowledge base)
  console.log('=== search_knowledge: 致股东信 ===');
  const r1 = await apiRequest('openapi/wiki/v1/search_knowledge', {
    knowledge_base_id: 'InJJv1eOlJ6KyiCwklcZjp3Wwg37PPfGY56OeXHtw7c=',
    query: '致股东信',
    cursor: 0,
    limit: 10
  });
  console.log(JSON.stringify(r1, null, 2));
  
  await sleep(2000);
  
  console.log('\n=== search_knowledge: 合伙人信 ===');
  const r2 = await apiRequest('openapi/wiki/v1/search_knowledge', {
    knowledge_base_id: 'InJJv1eOlJ6KyiCwklcZjp3Wwg37PPfGY56OeXHtw7c=',
    query: '合伙人信',
    cursor: 0,
    limit: 10
  });
  console.log(JSON.stringify(r2, null, 2));
  
  await sleep(2000);
  
  console.log('\n=== search_knowledge: partnership ===');
  const r3 = await apiRequest('openapi/wiki/v1/search_knowledge', {
    knowledge_base_id: 'InJJv1eOlJ6KyiCwklcZjp3Wwg37PPfGY56OeXHtw7c=',
    query: 'partnership',
    cursor: 0,
    limit: 10
  });
  console.log(JSON.stringify(r3, null, 2));
}

main().catch(e => console.error('Error:', e));
