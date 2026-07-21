/**
 * 博主文章同步脚本
 * 
 * 工作流：
 * 1. 将新爬取的 MD 文件放入 content/bloggers/_inbox/
 * 2. 运行: node scripts/sync-bloggers.js
 * 3. 脚本按 frontmatter 中的 account 字段自动归类到对应博主目录
 * 4. 重新生成索引
 * 
 * 用法:
 *   node scripts/sync-bloggers.js              # 交互式同步
 *   node scripts/sync-bloggers.js --auto       # 自动同步，不询问
 *   node scripts/sync-bloggers.js --dry-run    # 预览，不实际移动文件
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const BLOGGERS_DIR = path.join(__dirname, '..', 'content', 'bloggers');
const INBOX_DIR = path.join(BLOGGERS_DIR, '_inbox');
const INDEX_FILE = path.join(BLOGGERS_DIR, 'bloggers-index.json');

// account 字段 → 博主目录名的映射（处理同一博主不同账号名的情况）
const ACCOUNT_MAP = {
  '在苍茫中传灯': '在苍茫中传灯',
  '方伟看十年': '方伟看十年',
  '方伟看10年': '方伟看十年',
  '梁孝永康': '梁孝永康',
  '唐僧的碎碎念': '唐僧的碎碎念',
};

function parseFrontmatter(content) {
  const lines = content.split('\n');
  if (lines[0]?.trim() !== '---') return {};
  const meta = {};
  for (let i = 1; i < lines.length; i++) {
    if (lines[i]?.trim() === '---') break;
    const match = lines[i]?.match(/^(\w+):\s*["']?(.+?)["']?\s*$/);
    if (match) {
      meta[match[1]] = match[2].replace(/["']/g, '');
    }
  }
  return meta;
}

function resolveBloggerDir(account) {
  if (ACCOUNT_MAP[account]) return ACCOUNT_MAP[account];
  // 未知的账号：用 account 值作为目录名
  return account;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getInboxFiles() {
  if (!fs.existsSync(INBOX_DIR)) return [];
  return fs.readdirSync(INBOX_DIR).filter(f => f.endsWith('.md'));
}

function question(rl, prompt) {
  return new Promise(resolve => {
    rl.question(prompt, answer => resolve(answer.trim()));
  });
}

async function main() {
  const args = process.argv.slice(2);
  const autoMode = args.includes('--auto');
  const dryRun = args.includes('--dry-run');

  console.log('📡 博主文章同步工具\n');

  // 确保 _inbox 存在
  ensureDir(INBOX_DIR);

  const inboxFiles = getInboxFiles();
  if (inboxFiles.length === 0) {
    console.log('📭 _inbox 中没有待同步的文件。');
    console.log(`   请将新的 MD 文件放入: ${INBOX_DIR}`);
    return;
  }

  console.log(`📥 _inbox 中发现 ${inboxFiles.length} 篇待同步文章:\n`);

  // 分析文件归属
  const grouped = {}; // bloggerDir -> [{file, title, date, account}]
  const unknowns = [];

  for (const file of inboxFiles) {
    const filePath = path.join(INBOX_DIR, file);
    let content;
    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch {
      console.warn(`  ⚠ 无法读取: ${file}`);
      continue;
    }
    const meta = parseFrontmatter(content);
    const account = meta.account || '';
    const bloggerDir = account ? resolveBloggerDir(account) : null;

    if (!bloggerDir || bloggerDir === account) {
      unknowns.push({ file, account, title: meta.title || file });
    } else {
      if (!grouped[bloggerDir]) grouped[bloggerDir] = [];
      grouped[bloggerDir].push({
        file,
        title: meta.title || file,
        date: meta.date || '',
        account,
      });
    }
  }

  // 显示归类结果
  const newBloggers = [];
  for (const [bloggerDir, files] of Object.entries(grouped)) {
    const exists = fs.existsSync(path.join(BLOGGERS_DIR, bloggerDir));
    const label = exists ? '📂' : '🆕';
    console.log(`  ${label} ${bloggerDir} (${files.length}篇)`);
    for (const f of files.slice(0, 3)) {
      console.log(`     - ${f.title}`);
    }
    if (files.length > 3) console.log(`     ... 还有 ${files.length - 3} 篇`);
    console.log();
    if (!exists) newBloggers.push(bloggerDir);
  }

  if (unknowns.length > 0) {
    console.log(`  ❓ 无法归类 (${unknowns.length}篇):`);
    for (const u of unknowns) {
      console.log(`     - ${u.file}  (account: "${u.account || '无'}")`);
    }
    console.log();
  }

  if (newBloggers.length > 0) {
    console.log(`🆕 新博主: ${newBloggers.join(', ')}`);
    if (!autoMode) {
      console.log('   将自动创建对应目录。');
    }
    console.log();
  }

  if (dryRun) {
    console.log('🔍 --dry-run 模式，未实际移动文件。');
    return;
  }

  // 确认
  if (!autoMode) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await question(rl, '确认同步以上文件？(y/n): ');
    rl.close();
    if (answer.toLowerCase() !== 'y') {
      console.log('❌ 已取消。');
      return;
    }
  }

  // 执行移动
  console.log('\n🚚 开始同步...');
  let movedCount = 0;
  let skippedCount = 0;

  for (const [bloggerDir, files] of Object.entries(grouped)) {
    const targetDir = path.join(BLOGGERS_DIR, bloggerDir);
    ensureDir(targetDir);

    for (const f of files) {
      const src = path.join(INBOX_DIR, f.file);
      const dest = path.join(targetDir, f.file);

      if (fs.existsSync(dest)) {
        console.log(`  ⏭ 跳过 (已存在): ${f.file}`);
        // 删除 inbox 中的源文件
        fs.unlinkSync(src);
        skippedCount++;
        continue;
      }

      fs.renameSync(src, dest);
      movedCount++;
    }
  }

  // 处理无法归类的文件
  for (const u of unknowns) {
    const src = path.join(INBOX_DIR, u.file);
    console.log(`  ⚠ 保留在 _inbox: ${u.file} (请在 ACCOUNT_MAP 中添加映射)`);
  }

  console.log(`\n✅ 同步完成: ${movedCount} 篇新增，${skippedCount} 篇跳过`);
  if (unknowns.length > 0) {
    console.log(`⚠ ${unknowns.length} 篇无法归类，已保留在 _inbox 中`);
  }

  // 重新生成索引
  console.log('\n🔄 重新生成索引...');
  const { execSync } = require('child_process');
  try {
    execSync('node scripts/generate-bloggers-index.js', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
    });
  } catch (e) {
    console.error('❌ 索引生成失败，请手动运行: node scripts/generate-bloggers-index.js');
  }

  console.log('\n💡 提示: 网站页面会自动加载新索引中的文章。');
}

main().catch(console.error);
