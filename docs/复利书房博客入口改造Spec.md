# 复利书房博客入口改造 Spec

## 1. 文档信息

- **状态**：待评审、待执行
- **日期**：2026-08-14
- **核心判断**：不把全站改成普通博客，而是改成“博客做入口，档案做底盘”。
- **目标**：让新用户第一眼感到这是一个有人持续写作、持续整理、持续推荐的阅读网站；同时保留巴菲特、芒格、段永平原典档案、公司/概念/人物索引和长尾 SEO 价值。
- **不在本期范围**：删除原典档案、迁移 7000+ 页面 URL、重写全部文章、接入评论系统、做会员社区、做信息流推荐算法。

## 2. 产品方向

### 2.1 目标形态

复利书房从“资料档案站”升级为：

> 一个主理人持续写作的长期投资博客，背后有一座可检索、可引用、可回到原文的巴菲特、芒格、段永平档案馆。

用户进入网站后应理解：

1. 这里有人在持续写，不只是堆资料；
2. 每篇文章都能回到原典、公司、概念和人物；
3. 如果想深入查资料，档案馆仍然完整可用；
4. 首页不是栏目索引，而是今天值得读什么、最近写了什么、从哪个主题进入。

### 2.2 不采用“全站博客化”的原因

当前站点已有大量结构化资产：

- `/buffett`、`/munger`、`/duanyongping`：核心人物专题；
- `/letters`、`/partnership`、`/qa`、`/talks`、`/interviews`：原典资料；
- `/companies`、`/concepts`、`/people`、`/model`：实体和知识索引；
- `/business-history`、`/articles`、`/columns`、`/books`：研究和写作内容。

如果全部改成按时间倒序的博客流，会带来四个损失：

1. 原典资料不再容易按年份、人物和内容类型检索；
2. 公司、概念、人物页的长尾 SEO 被削弱；
3. 网站独特性下降，容易变成普通投资公众号归档站；
4. 后续新增内容会被时间流吞没，失去“档案馆”的长期结构。

因此本期采用混合架构：**首页博客化，内容入口博客化，底层档案不动。**

## 3. 信息架构

### 3.1 一级导航

建议改为五个一级入口：

```text
首页
博客
原典
研究
资料库
关于
```

如需控制导航宽度，可隐藏“首页”，Logo 默认回首页。

| 导航 | 作用 | 对应路径 |
|---|---|---|
| 博客 | 主理人文章、阅读札记、公司研究导读、专题文章流 | `/blog` |
| 原典 | 巴菲特、芒格、段永平的一手资料 | `/buffett`、`/munger`、`/duanyongping`、`/letters` 等 |
| 研究 | 公司研究、商业史、投资概念、思维模型 | `/business-history`、`/companies`、`/concepts`、`/model` |
| 资料库 | 全站搜索、人物索引、书籍、博主文章、中文文章 | `/search`、`/people`、`/books`、`/bloggers`、`/articles` |
| 关于 | 来源、编辑原则、修订记录、免责声明 | `/about` |

### 3.2 URL 策略

必须保留现有 URL，不做破坏性迁移。

新增博客层：

```text
/blog
/blog/[slug]
/blog/category/[category]
/blog/tag/[tag]
/blog/series/[series]
```

旧内容的处理：

- `/articles/[slug]` 继续可访问；
- `/columns/[slug]` 继续可访问；
- `/business-history/[slug]` 继续可访问；
- 新的 `/blog/[slug]` 可以聚合并链接到旧内容，也可以为精选文章建立 canonical；
- 不建议第一期把所有旧文章强行 redirect 到 `/blog`，避免 SEO 和内部链接震荡。

## 4. 内容模型

### 4.1 博客文章类型

统一建立 `BlogPost` 视图模型，不要求第一期立刻迁移所有 Markdown，只要求页面读取时能归一。

```ts
type BlogPostType =
  | 'note'            // 主理人短札
  | 'essay'           // 长文观点
  | 'reading-note'    // 原典导读/阅读笔记
  | 'company-study'   // 公司研究
  | 'concept-note'    // 概念解释
  | 'book-note'       // 拆书/读书笔记
  | 'archive-guide'   // 档案导览
```

统一字段：

```ts
interface BlogPost {
  slug: string
  title: string
  subtitle?: string
  summary: string
  type: BlogPostType
  date: string
  updatedAt?: string
  author: string
  tags: string[]
  series?: string
  entities: string[]
  sourcePath: string
  canonicalPath: string
  relatedArchiveLinks: Array<{ label: string; href: string; reason?: string }>
  readingMinutes: number
}
```

### 4.2 内容来源映射

第一期不新建复杂 CMS，直接从现有目录聚合：

| 来源目录 | 映射类型 | 是否进入 `/blog` 默认流 |
|---|---|---|
| `content/columns` | `essay` | 是 |
| `content/articles` | `essay` / `archive-guide` | 精选进入 |
| `content/business-history` | `company-study` | 是 |
| `content/books` | `book-note` | 是，权重低 |
| `content/wechat` | `note` / `essay` | 视质量进入 |
| `content/bloggers` | 外部/转载资料 | 不进入主博客流，只在资料库 |
| `content/letters` / `qa` / `talks` | 原典 | 不进入主博客流，只作为关联档案 |

### 4.3 Frontmatter 规范

新增或兼容以下字段：

```yaml
title:
subtitle:
date:
updated_at:
author: 金融街小胖
post_type: essay
tags:
  - 巴菲特
  - 公司研究
series:
entities:
  - 可口可乐
  - 品牌价值
related_archive:
  - href: /letters/1988
    label: 1988 年巴菲特致股东信
    reason: 巴菲特讨论可口可乐持仓
blog_featured: true
blog_hidden: false
```

兼容旧字段：

- `content_type` 可映射为 `post_type`；
- `year` 可作为原典年份，不等同于博客发布日期；
- 缺少 `date` 时，从文件名或 frontmatter 旧字段推断；无法推断则不进入默认博客流。

## 5. 首页改造

### 5.1 首页定位

首页从“档案目录首页”改为“主理人博客首页 + 档案入口”。

首屏目标：

1. 展示网站的人味和编辑判断；
2. 给用户一个明确的当前阅读起点；
3. 保留进入三大人物档案的明显入口。

### 5.2 首页模块

推荐顺序：

1. **Hero：主理人定位**

   ```text
   复利书房
   我在这里整理巴菲特、芒格、段永平的原典，也写下自己的阅读札记、公司研究和投资思考。
   ```

   首屏按钮：

   - `读最新文章` → `/blog`
   - `进入原典档案` → `/buffett` 或锚点

2. **最新文章**

   展示 5-8 篇博客文章，按 `date` 倒序。

   卡片字段：

   - 类型；
   - 日期；
   - 标题；
   - 摘要；
   - 关联实体，如“可口可乐 / 品牌价值 / 1988 股东信”。

3. **本周推荐阅读**

   人工维护 1-3 条，不能完全依赖发布时间。

   每条必须说明：

   - 为什么现在值得读；
   - 它连接到哪份原典或哪篇研究；
   - 适合谁读。

4. **从三个人开始**

   三个简洁入口：

   - 巴菲特：股东信、合伙人信、股东大会；
   - 芒格：演讲、Wesco、穷查理宝典；
   - 段永平：博客、雪球问答、演讲。

5. **专题入口**

   展示 4-6 个可持续专题：

   - 可口可乐与品牌价值；
   - 保险、浮存金与伯克希尔；
   - 能力圈；
   - 市场先生；
   - 资本配置；
   - 段永平问答精选。

6. **搜索和资料库入口**

   首页底部提供轻量搜索框和资料库入口，不再让首页承担完整目录功能。

### 5.3 首页不应出现的东西

- 不展示全部栏目；
- 不把 7000+ 页面规模当卖点堆出来；
- 不把商业购买入口压到首屏；
- 不出现过多“资料馆式”密集列表；
- 不把外部博主文章混入主理人最新文章。

## 6. `/blog` 列表页

### 6.1 页面目标

`/blog` 是“读我写了什么”的主入口，而不是资料库。

页面结构：

1. 页面标题和一句话说明；
2. 顶部筛选：
   - 全部；
   - 阅读札记；
   - 公司研究；
   - 原典导读；
   - 概念笔记；
   - 拆书；
3. 文章列表；
4. 侧栏或底部专题：
   - 热门标签；
   - 系列；
   - 从原典进入。

### 6.2 列表排序

默认排序：

1. `blog_featured` 置顶，最多 3 篇；
2. 其余按 `date` 倒序；
3. 无 `date` 内容默认不进入主列表，避免旧资料污染“最近写作”。

### 6.3 列表卡片

必须展示：

- 标题；
- 摘要；
- 日期；
- 类型；
- 阅读时间；
- 标签；
- 关联实体。

可选展示：

- 是否更新；
- 属于哪个系列；
- 关联原典数量。

## 7. `/blog/[slug]` 详情页

### 7.1 阅读模板

博客文章详情页沿用当前成熟阅读系统：

- `ReadingArticleShell`
- `ArticleTableOfContents`
- `ReadingProgress`
- `FontSizeControlFixed`
- `RelatedArticles`

但视觉上应比原典页更像“作者文章”：

- 顶部显示作者、发布日期、更新时间；
- 明确区分“本文观点”和“引用资料”；
- 文章底部突出“回到原典继续读”。

### 7.2 详情页模块

推荐结构：

1. 面包屑：`首页 / 博客 / 分类`
2. 标题区：
   - 类型；
   - 日期；
   - 标题；
   - 摘要；
   - 标签；
3. 正文；
4. 关联档案：
   - 股东信；
   - 问答；
   - 演讲；
   - 公司页；
   - 概念页；
5. 延伸阅读：
   - 同系列文章；
   - 同实体文章；
   - 最新博客；
6. 免责声明：
   - 学习研究；
   - 不构成投资建议。

### 7.3 链接纪律

每篇博客必须至少满足一个条件：

- 关联 1 个公司、概念或人物；
- 关联 1 篇原典；
- 属于 1 个明确系列；
- 明确标记为短札 `note`。

避免产生“孤立博客文章”。

## 8. 档案页如何被博客化

### 8.1 人物页

`/buffett`、`/munger`、`/duanyongping` 不改成博客列表，但增加“相关文章”区：

- 最新与该人物相关的博客；
- 推荐导读；
- 该人物的原典入口。

### 8.2 公司页

`/companies/[name]` 增强为：

- 公司档案；
- 相关原典；
- 相关博客文章；
- 公司研究。

博客文章反向引用公司页，公司页也反向展示文章。

### 8.3 概念页

`/concepts/[name]` 增强为：

- 概念定义；
- 原典出处；
- 主理人解释；
- 相关博客；
- 相关公司/人物。

### 8.4 原典页

`/letters/[year]`、`/qa/[id]`、`/talks/[id]` 仍保持原典阅读体验，只在底部增加：

- “读这份原典的导读文章”；
- “这份原典提到的公司/概念”；
- “相关博客文章”。

## 9. 搜索策略

博客化后搜索结果需要区分内容角色。

搜索结果排序建议：

1. 标题完全命中的博客文章；
2. 公司/概念/人物实体；
3. 原典资料；
4. 研究文章；
5. 外部博主资料。

搜索结果标签必须明确：

- `博客`
- `原典`
- `公司`
- `概念`
- `人物`
- `外部资料`

不要让用户分不清“主理人写的文章”和“归档资料”。

## 10. SEO 和 canonical

### 10.1 保留旧 URL

第一期不大规模 redirect。

原因：

- 旧页面已经有静态审计和 sitemap；
- 大量中文 slug 和长尾页面有独立价值；
- 重定向会增加风险。

### 10.2 新博客 URL

新写内容优先走 `/blog/[slug]`。

旧内容如果被纳入博客流，有两种方式：

1. **聚合卡片直接链接旧 URL**：最稳，不改变 canonical；
2. **建立博客别名页**：只适合精选文章，需要设置 canonical 到主 URL，避免重复收录。

第一期推荐方案 1。

### 10.3 Sitemap

新增：

- `/blog`
- `/blog/category/[category]`
- `/blog/tag/[tag]`
- 新写的 `/blog/[slug]`

不把所有旧文章重复塞进 `/blog/[slug]`。

## 11. 工程实施方案

### 11.1 新增模块

建议新增：

```text
src/lib/blog.ts
src/app/blog/page.tsx
src/app/blog/[slug]/page.tsx
src/app/blog/category/[category]/page.tsx
src/app/blog/tag/[tag]/page.tsx
src/components/BlogPostCard.tsx
src/components/BlogPostMeta.tsx
src/components/BlogRelatedArchive.tsx
```

### 11.2 `src/lib/blog.ts` 职责

提供统一读取函数：

```ts
getAllBlogPosts()
getFeaturedBlogPosts(limit)
getRecentBlogPosts(limit)
getBlogPostBySlug(slug)
getBlogPostsByTag(tag)
getBlogPostsByCategory(category)
getBlogPostsByEntity(entityName)
```

第一期可以从以下现有函数组合：

- `getAllArticles()`
- `getBooks()`
- `getColumns()`
- `getBusinessHistories()`

### 11.3 首页改造涉及文件

- `src/app/page.tsx`
- `src/app/home.css`
- `src/components/SiteHeader.tsx`
- `src/components/PageFooter.tsx`
- `src/lib/recent-updates.ts`
- 新增 `src/lib/blog.ts`

### 11.4 导航改造涉及文件

- `src/components/SiteHeader.tsx`
- `src/components/PageFooter.tsx`
- `src/app/sitemap.ts`

### 11.5 搜索改造涉及文件

- `src/lib/static-search-client.ts`
- `scripts/generate-static-data.js`
- `src/components/SearchResults.tsx`
- `src/app/search/page.tsx`

## 12. 数据迁移策略

### 第一阶段：不迁移 Markdown

只做读取层聚合：

- `content/columns` 进入博客；
- `content/business-history` 进入博客；
- `content/articles` 中 `blog_featured: true` 或满足规则的进入博客；
- `content/books` 进入低权重博客列表；
- 原典不进入博客列表。

### 第二阶段：新增 `content/blog`

当主理人开始持续写新文章时，新增：

```text
content/blog/YYYY-MM-DD-slug.md
```

新文章默认进入 `/blog/[slug]`。

### 第三阶段：精选旧文

给旧文逐步补 frontmatter：

```yaml
blog_featured: true
post_type:
date:
tags:
series:
entities:
related_archive:
```

不要一次性改全部旧文。

## 13. 验收标准

### 产品验收

- 首页第一屏能看出“有人在写”，不是纯资料目录。
- 首页仍能一眼进入巴菲特、芒格、段永平档案。
- `/blog` 能展示最近文章、分类和标签。
- 博客文章能回链到原典、公司、概念或人物。
- 原典和档案页仍保持当前阅读体验，不被博客流打散。

### 技术验收

必须通过：

```bash
npm run lint
npm run build
node scripts/audit-static-site.mjs
```

关键页面检查：

```text
/
/blog
/blog/[slug]
/buffett
/munger
/duanyongping
/letters/2023
/companies/可口可乐
/concepts/品牌价值
/search
```

浏览器验收：

- 桌面和 390px 移动端无横向滚动；
- 首页首屏按钮可点击；
- `/blog` 筛选可用；
- 博客详情页目录、进度条、字号控件正常；
- 原典页和人物页无明显回归。

### SEO 验收

- 旧 URL 继续 200；
- `/sitemap.xml` 包含新博客入口；
- 不产生重复 canonical；
- `/robots.txt` 正常；
- 博客文章 title / description 唯一。

## 14. 推荐执行顺序

1. **先建 `src/lib/blog.ts`**：统一内容视图，不动 UI。
2. **新增 `/blog` 列表页**：先让博客入口跑起来。
3. **新增 `/blog/[slug]` 详情页**：只支持新 `content/blog` 或精选旧文。
4. **改首页**：把博客内容放到首屏，保留档案入口。
5. **改导航和页脚**：突出博客，同时保留原典/研究/资料库。
6. **给人物、公司、概念页加相关文章**：打通博客和档案。
7. **更新搜索和 sitemap**：让新结构能被检索和收录。

## 15. 风险和边界

### 风险 1：博客化后首页失去资料站独特性

控制方式：

- 首页首屏有人味，但第二屏必须保留三大人物档案；
- 导航中保留“原典”；
- 博客文章必须回链档案。

### 风险 2：旧内容混入博客流导致质量不齐

控制方式：

- 默认只纳入 `columns`、`business-history` 和显式标记的 `articles`；
- `blog_hidden: true` 可排除；
- 外部博主文章不进入主博客。

### 风险 3：URL 和 canonical 混乱

控制方式：

- 第一期不重定向旧文；
- 新博客只链接旧内容，不复制旧内容；
- 需要别名页时单独评审。

### 风险 4：工程改造过大

控制方式：

- 第一阶段只新增 `/blog`，不动原典；
- 首页改造在 `/blog` 稳定后再做；
- 每一步都跑静态审计。

## 16. 完成定义

本改造完成后，网站应该呈现为：

- 首页像一个持续更新的投资阅读博客；
- `/blog` 是主理人写作入口；
- 原典档案仍然完整、稳定、可检索；
- 博客文章和档案之间有清晰双向链接；
- 新用户可以先读文章，老用户可以继续查资料；
- 技术上不破坏现有 7000+ 静态页面健康度。
