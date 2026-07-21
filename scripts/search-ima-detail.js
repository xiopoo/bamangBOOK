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

async function getFolderContents(folderId, cursor = 0) {
  const result = await apiRequest('openapi/wiki/v1/get_knowledge_list', {
    knowledge_base_id: 'InJJv1eOlJ6KyiCwklcZjp3Wwg37PPfGY56OeXHtw7c=',
    parent_id: folderId,
    cursor,
    limit: 50
  });
  return result;
}

async function main() {
  // Check the 股东大会 folder structure first
  console.log('=== Checking root level of 股东大会 folder ===');
  const folder = await getFolderContents('folder_7473901059729416');
  console.log('Full response:', JSON.stringify(folder, null, 2));
  
  await sleep(2000);
  
  // Also check the 巴菲特知识库 folder root
  console.log('\n=== Checking root level of 巴菲特知识库 folder ===');
  const folder2 = await getFolderContents('folder_7473759380321344');
  console.log('Full response:', JSON.stringify(folder2, null, 2));
  
  await sleep(2000);
  
  // Try searching with different keywords
  console.log('\n=== Search: 股东信 ===');
  const r1 = await apiRequest('openapi/wiki/v1/search_knowledge_base', { query: '股东信', cursor: 0, limit: 10 });
  console.log(JSON.stringify(r1, null, 2).substring(0, 2000));
  
  await sleep(2000);
  
  console.log('\n=== Search: 致股东 ===');
  const r2 = await apiRequest('openapi/wiki/v1/search_knowledge_base', { query: '致股东', cursor: 0, limit: 10 });
  console.log(JSON.stringify(r2, null, 2).substring(0, 2000));
  
  await sleep(2000);
  
  console.log('\n=== Search: 巴菲特 股东 ===');
  const r3 = await apiRequest('openapi/wiki/v1/search_knowledge_base', { query: '巴菲特 股东', cursor: 0, limit: 10 });
  console.log(JSON.stringify(r3, null, 2).substring(0, 2000));
}

main().catch(e => console.error('Error:', e));
