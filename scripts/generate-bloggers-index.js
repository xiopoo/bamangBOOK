/**
 * 扫描 content/bloggers/ 下所有 MD 文件，解析 frontmatter，
 * 生成 content/bloggers/bloggers-index.json 索引文件。
 * 
 * 用法:
 *   node scripts/generate-bloggers-index.js                  # 全量扫描
 *   node scripts/generate-bloggers-index.js --incremental    # 增量更新
 *   node scripts/generate-bloggers-index.js --blogger 方伟看十年  # 只更新指定博主
 */

const fs = require('fs');
const path = require('path');

const BLOGGERS_DIR = path.join(__dirname, '..', 'content', 'bloggers');
const OUTPUT_FILE = path.join(BLOGGERS_DIR, 'bloggers-index.json');

// 简单的前置元数据解析（不依赖 gray-matter）
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

// 分类标签系统 - 基于标题和内容关键词
function classifyArticle(title, content) {
  const tags = [];
  const text = (title + ' ' + content.slice(0, 2000)).toLowerCase();
  
  const rules = [
    // 投资理念
    { tag: '投资理念', kw: ['价值投资', '安全边际', '能力圈', '护城河', '市场先生', '长期持有', '复利', '内在价值', '所有者收益'] },
    // 公司分析
    { tag: '公司分析', kw: ['茅台', '腾讯', '拼多多', '美团', '阿里', '苹果', '英伟达', '特斯拉', '泡泡玛特', '格力', '美的', '万科', '招商银行', '富途', '分众', '可口可乐', '比亚迪', 'geico', '年报', '财报', '季报', '估值', '市盈率', 'roe', '单店模型'] },
    // 商业模式
    { tag: '商业模式', kw: ['商业模式', '护城河', '定价权', '提价权', '品牌', '垄断', '竞争优势', '差异化', '二曲线', '利润', '现金流'] },
    // 宏观经济
    { tag: '宏观经济', kw: ['宏观', '经济', '通胀', '利率', '泡沫', '熊市', '牛市', '危机', '贸易战', '指数', '大盘', 'a股', '美股', '港股'] },
    // 企业管理
    { tag: '企业管理', kw: ['管理', '企业文化', 'ceo', '团队', '组织', '战略', '创新', '领导力', '公司治理'] },
    // 个人成长
    { tag: '个人成长', kw: ['读书', '学习', '思考', '认知', '成长', '人生', '自由', '坚持', '耐心', '心态', '修行', '理想'] },
    // 产品思维
    { tag: '产品思维', kw: ['产品', '需求', '用户', '体验', '设计', '极致', '消费者'] },
    // 人物评述
    { tag: '人物评述', kw: ['巴菲特', '芒格', '段永平', '格雷厄姆', '李录', '王兴', '雷军', '曹德旺', '董明珠'] },
    // 行业分析
    { tag: '行业分析', kw: ['行业', '赛道', '零售', '消费', '科技', 'ai', '新能源', '汽车', '医疗', '金融', '互联网', '电商', 'saas'] },
    // 人生感悟
    { tag: '人生感悟', kw: ['散文', '游记', '骑行', '故乡', '家乡', '回忆', '朋友', '家人', '生活', '幸福', '快乐'] },
    // 科学/复杂性
    { tag: '科学/复杂性', kw: ['复杂', '混沌', '幂律', '幂次', '演化', '进化', '系统', '科学', '生物', '物理', '熵', '随机'] },
  ];
  
  for (const rule of rules) {
    for (const kw of rule.kw) {
      if (text.includes(kw)) {
        tags.push(rule.tag);
        break;
      }
    }
  }
  
  // 没有匹配到任何标签时给一个默认
  if (tags.length === 0) {
    tags.push('投资思考');
  }
  
  return [...new Set(tags)];
}

function getBloggers() {
  const entries = fs.readdirSync(BLOGGERS_DIR, { withFileTypes: true });
  return entries
    .filter(e => e.isDirectory() && !e.name.startsWith('_'))
    .map(e => e.name);
}

function processBlogger(bloggerName) {
  const dir = path.join(BLOGGERS_DIR, bloggerName);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  return processFiles(bloggerName, files);
}

function processFiles(bloggerName, files) {
  const dir = path.join(BLOGGERS_DIR, bloggerName);
  const articles = [];
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    let content;
    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch {
      console.warn(`  ⚠ 无法读取: ${file}`);
      continue;
    }
    
    const meta = parseFrontmatter(content);
    
    // 从文件名提取日期（备用）
    let dateFromName = '';
    const dateMatch = file.match(/^(\d{8})/);
    if (dateMatch) {
      const d = dateMatch[1];
      dateFromName = `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`;
    }
    
    const date = meta.date || dateFromName || '';
    const title = meta.title || file.replace(/^\d{8}[_-]/, '').replace('.md', '');
    const url = meta.url || '';
    const author = meta.author || bloggerName;
    const account = meta.account || bloggerName;
    
    const tags = classifyArticle(title, content);
    
    const wordCount = content.replace(/---[\s\S]*?---/, '').replace(/[#\>\-\*\n\r\s]/g, '').length;
    
    articles.push({
      title,
      date,
      year: date ? parseInt(date.slice(0, 4)) : null,
      fileName: file,
      url,
      author,
      account,
      tags,
      wordCount,
    });
  }
  
  // 按日期倒序排列
  articles.sort((a, b) => {
    if (a.date && b.date) return b.date.localeCompare(a.date);
    if (a.date) return -1;
    if (b.date) return 1;
    return b.fileName.localeCompare(a.fileName);
  });
  
  return articles;
}

function main() {
  const args = process.argv.slice(2);
  const incremental = args.includes('--incremental');
  const bloggerFlagIdx = args.indexOf('--blogger');
  const targetBlogger = bloggerFlagIdx >= 0 ? args[bloggerFlagIdx + 1] : null;
  
  console.log('🔍 扫描博主文章...\n');
  
  let bloggers = getBloggers();
  if (targetBlogger) {
    if (!bloggers.includes(targetBlogger)) {
      console.error(`❌ 找不到博主: ${targetBlogger}`);
      console.log(`   可用博主: ${bloggers.join(', ')}`);
      return;
    }
    bloggers = [targetBlogger];
  }
  
  // 增量模式：加载旧索引，只重新处理有变化的文件
  let existingData = null;
  if (incremental && fs.existsSync(OUTPUT_FILE)) {
    try {
      existingData = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
    } catch {}
  }
  
  const result = [];
  let totalArticles = 0;
  
  for (const blogger of bloggers) {
    let articles;
    
    if (incremental && existingData) {
      // 增量：获取已索引的文件名集合，检查是否有新文件
      const oldBlogger = existingData.find(b => b.name === blogger);
      if (oldBlogger) {
        const oldFileSet = new Set(oldBlogger.articles.map(a => a.fileName));
        const dir = path.join(BLOGGERS_DIR, blogger);
        const currentFiles = new Set(
          fs.readdirSync(dir).filter(f => f.endsWith('.md'))
        );
        
        if (oldFileSet.size === currentFiles.size && 
            [...oldFileSet].every(f => currentFiles.has(f))) {
          // 文件无变化，直接复用旧索引
          console.log(`  📂 ${blogger}: ${oldBlogger.articles.length} 篇 (无变化，跳过)`);
          result.push(oldBlogger);
          totalArticles += oldBlogger.articles.length;
          continue;
        }
        
        // 有变化：只处理新增的文件
        const newFiles = [...currentFiles].filter(f => !oldFileSet.has(f));
        if (newFiles.length > 0) {
          console.log(`  📂 ${blogger}: +${newFiles.length} 篇新增`);
          const newArticles = processFiles(blogger, newFiles);
          articles = [...oldBlogger.articles, ...newArticles]
            .sort((a, b) => {
              if (a.date && b.date) return b.date.localeCompare(a.date);
              if (a.date) return -1;
              if (b.date) return 1;
              return b.fileName.localeCompare(a.fileName);
            });
        } else {
          console.log(`  📂 ${blogger}: ${oldBlogger.articles.length} 篇 (无新增)`);
          result.push(oldBlogger);
          totalArticles += oldBlogger.articles.length;
          continue;
        }
      } else {
        articles = processBlogger(blogger);
        console.log(`  📂 ${blogger}: ${articles.length} 篇 (新博主)`);
      }
    } else {
      articles = processBlogger(blogger);
      console.log(`  📂 ${blogger}: ${articles.length} 篇`);
    }
    
    totalArticles += articles.length;
    
    // 统计标签分布
    const tagCounts = {};
    articles.forEach(a => a.tags.forEach(t => tagCounts[t] = (tagCounts[t] || 0) + 1));
    
    result.push({
      name: blogger,
      articles,
      stats: {
        total: articles.length,
        dateRange: articles.length > 0 
          ? `${articles[articles.length-1]?.date?.slice(0,4) || '?'} - ${articles[0]?.date?.slice(0,4) || '?'}`
          : '',
        tags: Object.entries(tagCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([tag, count]) => ({ tag, count })),
      }
    });
  }
  
  // 如果是指定博主增量更新，合并回完整索引
  if (targetBlogger && incremental && existingData) {
    for (const old of existingData) {
      if (!result.find(r => r.name === old.name)) {
        result.push(old);
        totalArticles += old.articles.length;
      }
    }
  }
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`\n✅ 索引已生成: ${OUTPUT_FILE}`);
  console.log(`📊 总计: ${result.length} 位博主, ${totalArticles} 篇文章`);
}

main();
