/**
 * Vercel 部署预构建脚本
 * 
 * 问题：content/bloggers/ 中有文章包含大量 base64 图片、微信专属图片链接，
 * 导致体积过大且图片无法在站外显示。
 * 
 * 方案：构建前删除所有图片、视频、微信外链，替换为文字占位符。
 * 
 * 用法：在 build 命令之前自动执行
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BLOGGERS_DIR = path.join(__dirname, '..', 'content', 'bloggers');
const ORIGINAL_DIR = path.join(__dirname, '..', 'content', 'bloggers_original');
const INDEX_FILE = 'bloggers-index.json';

/**
 * 清理文章内容：移除所有无法正常显示的图片、视频、微信外链，
 * 以及顶部原文链接、底部营销推广（扫码加群、知识星球、点赞转发等）
 */
function cleanContent(content) {
  let count = 0;
  
  // ===== 第一步：按行处理，删除营销内容 =====
  const lines = content.split('\n');
  const result = [];
  
  // 营销段起始标记 — 匹配到就截断后续所有内容
  const MARKETING_START = [
    /^—\s*扫码/,             // — 扫码下方微信加入...
    /^——\s*扫码/,            // ——扫码加入社群——
    /^##\s*本号寄语/,         // ## 本号寄语
    /^【版权归原作者/,        // 【版权归原作者所有...】
    /^原创不易，认可价值/,    // 原创不易，认可价值...
    /^这里有真实的生活/,      // 这里有真实的生活，不变的梦想
    /^需要《巴菲特致股东的信全集》/, // 需要《巴菲特致股东的信全集》...
    /^—\s*扫码下方微信加入/,  // — 扫码下方微信加入...
    /^—\s*扫码下面二维码/,    // — 扫码下面二维码加入...
    /^—\s*扫码下方微信加入线下/, // — 扫码下方微信加入线下交流群 —
    /^扫码\s*备注/,           // 扫码备注：...
  ];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // 删除顶部的原文链接行：> [原文链接](https://mp.weixin.qq.com/...)
    if (/^>\s*\[原文链接\]/.test(trimmed)) {
      count++;
      continue;
    }
    
    // 删除公众号信息行：> **公众号：xxx**
    if (/^>\s*\*\*公众号/.test(trimmed)) {
      count++;
      continue;
    }
    
    // 删除推广性链接行：[xxx](https://mp.weixin.qq.com/s?__biz=...)
    if (/^\[.*\]\(https?:\/\/mp\.weixin\.qq\.com\/s\?__biz=/.test(trimmed)) {
      count++;
      continue;
    }
    
    // 检测是否为营销段起始行 → 截断
    let isMarketingStart = false;
    for (const pattern of MARKETING_START) {
      if (pattern.test(trimmed)) {
        isMarketingStart = true;
        break;
      }
    }
    if (isMarketingStart) {
      count++;
      break;
    }
    
    // 删除独立的推广语：欢迎转载、点赞、关注、转发
    if (/欢迎转载.*点赞.*关注.*转发/.test(trimmed)) {
      count++;
      continue;
    }
    
    // 删除"请点赞或转发，以支持我继续创作"
    if (/请点赞.*转发.*支持.*创作/.test(trimmed)) {
      count++;
      continue;
    }
    
    // 删除"原创不易，认可价值，动手指点"
    if (/原创不易.*认可价值.*动手指点/.test(trimmed)) {
      count++;
      continue;
    }
    
    result.push(line);
  }
  
  content = result.join('\n');
  
  // ===== 第二步：正则清理图片、视频、外链 =====
  
  // 1. 删除 markdown 图片：![alt](url) → [图片]
  content = content.replace(/!\[([^\]]*)\]\([^)]+\)/g, (match, alt) => {
    count++;
    return alt && alt !== '图片' ? `[${alt}]` : '[图片]';
  });
  
  // 2. 删除 HTML img 标签 → [图片]
  content = content.replace(/<img[^>]*\/?>/gi, () => {
    count++;
    return '[图片]';
  });
  
  // 3. 删除 base64 数据 → [图片]
  content = content.replace(/data:image\/[^;]+;base64,[a-zA-Z0-9+/=]{100,}/g, () => {
    count++;
    return '[图片]';
  });
  
  // 4. 删除 HTML video 元素 → [视频]
  content = content.replace(/<video[\s\S]*?<\/video>/gi, () => {
    count++;
    return '[视频]';
  });
  
  // 5. 删除 iframe 嵌入 → [视频]
  content = content.replace(/<iframe[\s\S]*?<\/iframe>/gi, () => {
    count++;
    return '[视频]';
  });
  
  // 6. 删除 mp.weixin.qq.com 外链，保留链接文字
  content = content.replace(/\[([^\]]*)\]\((https?:\/\/mp\.weixin\.qq\.com[^)]*)\)/gi, '$1');
  
  // 7. 删除纯文本的微信链接
  content = content.replace(/https?:\/\/mp\.weixin\.qq\.com\/[^\s)]*/gi, '');
  
  return { content, count };
}

function main() {
  const args = process.argv.slice(2);
  const restore = args.includes('--restore');
  
  if (restore) {
    // 恢复原始文件
    if (fs.existsSync(ORIGINAL_DIR)) {
      console.log('🔄 恢复原始文件...');
      fs.rmSync(BLOGGERS_DIR, { recursive: true, force: true });
      fs.renameSync(ORIGINAL_DIR, BLOGGERS_DIR);
      console.log('✅ 已恢复');
    } else {
      console.log('📭 无需恢复');
    }
    return;
  }
  
  // 清理上一次失败构建残留的 bloggers_original
  if (fs.existsSync(ORIGINAL_DIR)) {
    console.log('🧹 清理上次构建残留的 bloggers_original...');
    fs.rmSync(ORIGINAL_DIR, { recursive: true, force: true });
  }
  
  console.log('🔧 Vercel 预构建：清理图片/视频/微信外链/营销推广...\n');
  
  // 备份原始文件
  fs.renameSync(BLOGGERS_DIR, ORIGINAL_DIR);
  fs.mkdirSync(BLOGGERS_DIR, { recursive: true });
  
  let totalSizeBefore = 0;
  let totalSizeAfter = 0;
  let totalImagesStripped = 0;
  
  for (const bloggerDirName of fs.readdirSync(ORIGINAL_DIR, { withFileTypes: true })) {
    if (!bloggerDirName.isDirectory()) continue;
    const name = bloggerDirName.name;
    if (name.startsWith('_')) continue;
    
    const srcDir = path.join(ORIGINAL_DIR, name);
    const destDir = path.join(BLOGGERS_DIR, name);
    fs.mkdirSync(destDir, { recursive: true });
    
    const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.md'));
    let bloggerStripped = 0;
    
    for (const file of files) {
      const srcPath = path.join(srcDir, file);
      let content = fs.readFileSync(srcPath, 'utf-8');
      const sizeBefore = Buffer.byteLength(content, 'utf-8');
      totalSizeBefore += sizeBefore;
      
      const result = cleanContent(content);
      content = result.content;
      const matchCount = result.count;
      
      const sizeAfter = Buffer.byteLength(content, 'utf-8');
      totalSizeAfter += sizeAfter;
      totalImagesStripped += matchCount;
      bloggerStripped += matchCount;
      
      fs.writeFileSync(path.join(destDir, file), content, 'utf-8');
    }
    
    // 删除 assets 目录（图片已全部清理）
    const assetsDir = path.join(destDir, 'assets');
    if (fs.existsSync(assetsDir)) {
      fs.rmSync(assetsDir, { recursive: true, force: true });
    }
    
    const ratio = totalSizeBefore > 0 ? ((1 - totalSizeAfter / totalSizeBefore) * 100).toFixed(0) : 0;
    console.log(`  📂 ${name}: ${bloggerStripped} 个图片/视频/外链/营销内容清理`);
  }
  
  // 复制 _inbox 目录
  const inboxSrc = path.join(ORIGINAL_DIR, '_inbox');
  const inboxDest = path.join(BLOGGERS_DIR, '_inbox');
  if (fs.existsSync(inboxSrc)) {
    fs.mkdirSync(inboxDest, { recursive: true });
  }
  
  // 重新生成索引
  console.log('\n🔄 重新生成索引...');
  execSync('node scripts/generate-bloggers-index.js', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
  });
  
  // 同时把索引文件复制到 bloggers_original，防止 Next.js 输出文件追踪时报 ENOENT
  const srcIndex = path.join(BLOGGERS_DIR, INDEX_FILE);
  const destIndex = path.join(ORIGINAL_DIR, INDEX_FILE);
  if (fs.existsSync(srcIndex)) {
    fs.copyFileSync(srcIndex, destIndex);
    console.log('📋 索引已同步到 bloggers_original');
  }
  
  const sizeBeforeMB = (totalSizeBefore / 1024 / 1024).toFixed(1);
  const sizeAfterMB = (totalSizeAfter / 1024 / 1024).toFixed(1);
  console.log(`\n✅ 清理完成:`);
  console.log(`   ${totalImagesStripped} 个图片/视频/外链/营销内容 → 占位符`);
  console.log(`   体积: ${sizeBeforeMB}MB → ${sizeAfterMB}MB`);
  console.log(`\n💡 构建完成后恢复原始文件:`);
  console.log(`   node scripts/prebuild.js --restore`);
}

main();
