const fs = require('fs');
const path = require('path');

const editorialDir = path.join(__dirname, '..', 'editorial', 'munger');
const websiteDir = path.join(__dirname, '..', 'content', 'munger-archive', 'recordings');

const years = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022];

function cleanContent(text) {
  // Remove HTML comments and anchors
  text = text.replace(/\[\]{#[^}]+}/g, '');
  text = text.replace(/`<!--\?xml[\s\S]*?-->`\{=html\}/g, '');
  text = text.replace(/`<!--[\s\S]*?-->`\{=html\}/g, '');
  
  // Convert speaker labels
  const speakerPatterns = [
    /\[(股东[：:])\]{\.red}/g,
    /\[(芒格[：:])\]{\.red}/g,
    /\[(工作人员[：:])\]{\.red}/g,
    /\[(彼得·考夫曼[：:])\]{\.red}/g,
    /\[(盖瑞·萨尔兹曼[：:])\]{\.red}/g,
    /\[(贝基·奎克[：:])\]{\.red}/g,
  ];
  
  speakerPatterns.forEach(p => {
    text = text.replace(p, '**$1**');
  });
  
  // Convert remaining [text]{.red} - emphasized content, not speaker labels
  text = text.replace(/\[([^\]]+)\]\{\.red\}/g, '$1');
  
  // Remove CSS class markers
  text = text.replace(/\{\.italic\}/g, '');
  text = text.replace(/\{\.kaiti\}/g, '');
  text = text.replace(/\{\.bold\}/g, '');
  text = text.replace(/\{\.bgred\}/g, '');
  text = text.replace(/\{=[^}]+\}/g, '');
  
  // Clean up multiple blank lines
  text = text.replace(/\n{4,}/g, '\n\n\n');
  
  return text.trim();
}

function extractQaContent(editorialContent) {
  // Remove the title line
  let content = editorialContent.replace(/^# \[.*?\].*$/m, '').trim();
  // Clean the content
  content = cleanContent(content);
  return content;
}

for (const year of years) {
  const editorialFile = path.join(editorialDir, `${year}_每日期刊股东会讲话.md`);
  const websiteFile = path.join(websiteDir, `daily-journal-${year}.md`);
  
  if (!fs.existsSync(editorialFile)) {
    console.log(`SKIP: Editorial file for ${year} not found`);
    continue;
  }
  
  if (!fs.existsSync(websiteFile)) {
    console.log(`SKIP: Website file for ${year} not found`);
    continue;
  }
  
  const editorialContent = fs.readFileSync(editorialFile, 'utf-8');
  const websiteContent = fs.readFileSync(websiteFile, 'utf-8');
  
  // Extract Q&A content from editorial
  const qaContent = extractQaContent(editorialContent);
  
  // Find the header boundary: keep frontmatter + breadcrumbs + title + description + tags
  // The tags are markdown links like: [Daily Journal](https://.../recordings/?topic=...)
  const lines = websiteContent.split('\n');
  let headerEnd = 0;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('?topic=')) {
      // This is a tags line - track the last one
      headerEnd = i + 1;
    }
  }
  
  if (headerEnd > 0) {
    // Skip trailing blank lines after the last tags line
    while (headerEnd < lines.length && lines[headerEnd].trim() === '') {
      headerEnd++;
    }
  }
  
  // Build the header
  const header = lines.slice(0, headerEnd).join('\n');
  
  // Build the new content
  const newContent = `${header}

---

${qaContent}

---

### 对照阅读

[完整中文文字记录 · 芒格书院《芒格之道》](https://mungerarchive.com/zh/recordings/daily-journal-${year}/)

本站不拥有此内容；文字记录版权归芒格书院所有。
`;
  
  fs.writeFileSync(websiteFile, newContent);
  console.log(`DONE: daily-journal-${year}.md updated (header: ${headerEnd} lines)`);
}