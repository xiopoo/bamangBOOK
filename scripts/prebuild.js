/**
 * Vercel 部署预构建脚本
 * 
 * 问题：content/bloggers/ 中有文章包含大量 base64 图片，目录总计 294MB，
 * 超过 Vercel Hobby 部署限制。
 * 
 * 方案：构建前清理 base64 图片，替换为 [图片] 占位符，大幅缩小体积。
 * 
 * 用法：在 build 命令之前自动执行
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BLOGGERS_DIR = path.join(__dirname, '..', 'content', 'bloggers');
const ORIGINAL_DIR = path.join(__dirname, '..', 'content', 'bloggers_original');

// 跳过 _inbox 目录
function getBloggerDirs() {
  return fs.readdirSync(BLOGGERS_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory() && !e.name.startsWith('_'))
    .map(e => e.name);
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
  
  // 检查是否已经处理过
  if (fs.existsSync(ORIGINAL_DIR)) {
    console.log('📭 已处理过，跳过（如需重新处理请先恢复：node scripts/prebuild.js --restore）');
    return;
  }
  
  console.log('🔧 Vercel 预构建：清理 base64 图片...\n');
  
  // 备份原始文件
  fs.renameSync(BLOGGERS_DIR, ORIGINAL_DIR);
  fs.mkdirSync(BLOGGERS_DIR, { recursive: true });
  
  const bloggers = getBloggerDirs();
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
      
      // 替换 base64 图片为占位符
      // 匹配: ![alt](data:image/png;base64,iVBOR...)
      const base64Pattern = /!\[([^\]]*)\]\(data:image\/[^;]+;base64,[a-zA-Z0-9+/=]+\)/g;
      let matchCount = 0;
      const cleaned = content.replace(base64Pattern, (match, alt) => {
        matchCount++;
        return `![${alt || '图片'}](https://mmbiz.qpic.cn/placeholder)`;
      });
      
      // 也处理普通 base64 链接（不带 ![] 的）
      const base64LinkPattern = /!?\[([^\]]*)\]\(data:image\/[^;]+;base64,[^)]+\)/g;
      const cleaned2 = cleaned.replace(base64LinkPattern, (match, alt) => {
        if (match.startsWith('!')) {
          matchCount++;
          return `![${alt || '图片'}](https://mmbiz.qpic.cn/placeholder)`;
        }
        return '';
      });
      
      const sizeAfter = Buffer.byteLength(cleaned2, 'utf-8');
      totalSizeAfter += sizeAfter;
      totalImagesStripped += matchCount;
      bloggerStripped += matchCount;
      
      fs.writeFileSync(path.join(destDir, file), cleaned2, 'utf-8');
    }
    
    const ratio = totalSizeBefore > 0 ? ((1 - totalSizeAfter / totalSizeBefore) * 100).toFixed(0) : 0;
    console.log(`  📂 ${name}: ${bloggerStripped} 张图片清理`);
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
  
  const sizeBeforeMB = (totalSizeBefore / 1024 / 1024).toFixed(1);
  const sizeAfterMB = (totalSizeAfter / 1024 / 1024).toFixed(1);
  console.log(`\n✅ 清理完成:`);
  console.log(`   ${totalImagesStripped} 张 base64 图片 → 占位符`);
  console.log(`   体积: ${sizeBeforeMB}MB → ${sizeAfterMB}MB`);
  console.log(`\n💡 构建完成后恢复原始文件:`);
  console.log(`   node scripts/prebuild.js --restore`);
}

main();
