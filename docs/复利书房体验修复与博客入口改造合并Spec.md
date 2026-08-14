# 复利书房体验修复与博客入口改造合并 Spec

## 1. 文档信息

- **状态**：待评审、待执行
- **日期**：2026-08-14
- **核心判断**：不把全站改成普通博客，而是“博客做入口，档案做底盘”；同时把已实测发现、直接影响用户判断、搜索体验、构建稳定性和性能体感的细节问题修掉。
- **目标**：
  1. 让新用户第一眼感到这是一个有人持续写作、持续整理、持续推荐的阅读网站；
  2. 修复搜索页空态/结果态冲突、相关概念推荐失效、构建日志噪声、搜索索引过重、大图资源、生产域名回落、本地凭据等已暴露问题；
  3. 保留巴菲特、芒格、段永平原典档案、公司/概念/人物索引和长尾 SEO 价值，底层档案不动。
- **范围**：搜索页、相关概念推荐、构建日志、搜索索引、图片资源、生产环境配置、安全凭据治理、博客入口（信息架构、内容模型、首页、`/blog` 体系、导航）、档案页博客化、搜索角色标签、SEO 与 sitemap。
- **不在本期范围**：删除原典档案、迁移 7000+ 页面 URL、重写全部文章、接入评论系统、做会员社区、做信息流推荐算法、接入真实支付、全站视觉品牌重构、重构全部 CSS、引入复杂后端搜索服务。
  - **合并说明**：原“体验修复 Spec”曾将“重新设计首页”列为不在范围；因本合并文档同时包含“博客入口改造 Spec”，首页改造（博客化）已纳入本期范围，但仅限模块重构，不做品牌视觉级重设计。

## 2. 当前基线

本次审计确认站点底盘健康：

- `npm run lint` 通过，无 ESLint warning/error。
- `npm run build` 通过，生成 7132 个静态页面。
- 自带静态审计 `node scripts/audit-static-site.mjs` 通过：
  - HTML 页面：7128 个
  - 内部死链：0
  - undefined 链接：0
  - 缺 title / description / canonical：0
  - 缺图片 alt：0
  - canonical 冲突：0
- 浏览器抽查首页、芒格页、股东信、搜索页、购买页、段永平问答页，桌面和移动端均 200，无横向溢出，无控制台错误。
- 核心 28 个入口和静态资源均返回 200。

站点已有大量结构化资产：

- `/buffett`、`/munger`、`/duanyongping`：核心人物专题；
- `/letters`、`/partnership`、`/qa`、`/talks`、`/interviews`：原典资料；
- `/companies`、`/concepts`、`/people`、`/model`：实体和知识索引；
- `/business-history`、`/articles`、`/columns`、`/books`：研究和写作内容。

已实测确认的事实：

- `content/index.json` 的 `cooccurrence` 字段为空（`cooccurrence: 0`），`scripts/generate-static-data.js` 第 297 行读取 `index.cooccurrence` 用于生成图数据，但无生成共现的写入入口。
- `public/search-index.json` 约 3.59MB，`public/graph-nodes.json` 约 107KB。
- `next.config.js` 使用 `output: 'export'` 与 `images: { unoptimized: true }`。
- `src/lib/site.ts` 第 8 行在无 `NEXT_PUBLIC_SITE_URL` / Vercel URL 时回落 `http://localhost:3000`。
- `.gitignore` 第 5-6 行已覆盖 `.env.local` / `.env.*.local`；`.env.example` 只含空值与说明，无真实凭据。

因此本期不是“救火式重做”，而是把已暴露的体验毛刺和工程噪声修掉，并叠加上“博客做入口”的改造。

## 3. 产品方向

### 3.1 目标形态

复利书房从“资料档案站”升级为：

> 一个主理人持续写作的长期投资博客，背后有一座可检索、可引用、可回到原文的巴菲特、芒格、段永平档案馆。

用户进入网站后应理解：

1. 这里有人在持续写，不只是堆资料；
2. 每篇文章都能回到原典、公司、概念和人物；
3. 如果想深入查资料，档案馆仍然完整可用；
4. 首页不是栏目索引，而是今天值得读什么、最近写了什么、从哪个主题进入。

### 3.2 不采用“全站博客化”的原因

如果全部改成按时间倒序的博客流，会带来四个损失：

1. 原典资料不再容易按年份、人物和内容类型检索；
2. 公司、概念、人物页的长尾 SEO 被削弱；
3. 网站独特性下降，容易变成普通投资公众号归档站；
4. 后续新增内容会被时间流吞没，失去“档案馆”的长期结构。

因此本期采用混合架构：**首页博客化，内容入口博客化，底层档案不动。**

## 4. 优先级总览

| 优先级 | 编号 | 问题 | 用户影响 | 工程影响 |
|---|---|---|---|---|
| P0 | S-01 | 搜索页空态和结果态冲突 | 用户以为搜索坏了 | 小改动，高收益 |
| P0 | S-02 | 输入搜索时主结果区不随输入同步 | 上方有建议、下方说无结果 | 状态模型混乱 |
| P1 | R-01 | 相关概念共现数据为空 | 推荐模块空、探索断层 | 构建日志刷屏 |
| P1 | L-01 | 构建期 logger 噪声过大 | 无直接用户影响 | CI / Vercel 日志不可读 |
| P1 | P-01 | 搜索索引 3.4MB+ | 移动弱网首次搜索慢 | 静态资源偏重 |
| P1 | B-01 | 缺少博客内容模型与统一读取层 | 无法形成“持续写作”入口 | 新功能地基 |
| P1 | B-02 | 缺少 `/blog` 列表与详情路由 | 写作内容无处安放 | 新功能主体 |
| P2 | B-03 | 首页仍是档案目录式 | 新用户看不懂“这里在写什么” | 首页模块重构 |
| P2 | B-04 | 导航未突出博客 | 博客入口不显眼 | 导航/页脚调整 |
| P2 | B-05 | 档案页与博客未打通 | 文章回不到原典，档案引不到文章 | 双向往返链接 |
| P2 | B-06 | 搜索不区分内容角色 | 分不清主理人文章与归档资料 | 索引与结果改造 |
| P2 | P-02 | 图片优化关闭且存在大 PNG | 长页面加载慢 | 静态导出体积增长 |
| P2 | E-01 | 生产域名依赖环境变量 | 配错会伤 SEO | 部署可观测性不足 |
| P2 | SEC-01 | 本地 `.env.local` 有真实凭据 | 泄漏风险 | 需要治理规则 |

## 5. 工作流 A：体验修复

### A-1 P0：搜索体验修复

#### S-01：搜索页首次打开误显示“未找到相关结果”

**现象**

打开 `/search`，页面没有搜索词，却显示：

```text
未找到相关结果
抱歉，没有找到与「」相关的内容。
```

**原因**

`SearchResults` 先判断 `results.length === 0`，再判断 `!query`。空查询天然没有结果，因此会被误判为“搜索失败”。

**涉及文件**

- `src/components/SearchResults.tsx`

**修复要求**

1. 调整渲染分支顺序：
   - `isLoading` 优先。
   - `!query.trim()` 其次，显示引导空态。
   - `results.length === 0` 最后，显示真正无结果。
2. 无搜索词时不得出现“未找到相关结果”。
3. 无搜索词时不得展示空引号 `「」`。

**验收标准**

- 打开 `/search`：
  - 显示“搜索全部内容”的引导空态。
  - 不显示“未找到相关结果”。
- 打开 `/search?q=不存在的长字符串`：
  - 显示“未找到相关结果”。
  - 文案中正确展示用户输入的关键词。

#### S-02：输入搜索时主结果区与建议下拉状态冲突

**现象**

在 `/search` 输入“巴菲特”“可口可乐”“BNSF”：

- 搜索框下方建议结果已经出现；
- 页面主体仍显示旧空态或旧结果；
- 用户会看到“上面有结果，下面说没结果”的冲突界面。

**原因**

`SearchBar` 的输入变化只触发建议搜索；完整搜索只在回车或提交时触发。搜索页作为完整搜索页面，用户输入后应同步更新主体结果，至少不能显示矛盾状态。

**涉及文件**

- `src/app/search/page.tsx`
- `src/components/SearchBar.tsx`
- `src/components/SearchResults.tsx`
- `src/lib/static-search-client.ts`

**修复方案**

推荐采用“搜索页实时主结果”方案：

1. 给 `SearchBar` 增加可选回调 `onQueryChange?: (query: string) => void`。
2. 在 `/search` 页面传入 `onQueryChange`，复用 250ms 防抖节奏。
3. 当用户输入非空关键词时：
   - 更新 `query`；
   - 执行 `performSearch(query, selectedType)`；
   - 用 `history.replaceState` 更新 `?q=`，避免每个字都 push 历史记录。
4. 当用户清空输入时：
   - 清空结果；
   - 清空筛选；
   - URL 删除 `q` 和 `type`；
   - 主体回到引导空态。
5. 保留回车行为，回车仍可立即执行搜索并关闭建议框。

**验收标准**

- `/search` 输入“巴菲特”后，主体区域在 500ms 内显示正式搜索结果。
- 输入“可口可乐”后，主体区域不再保留上一轮“巴菲特”的结果。
- 清空输入后，主体区域回到引导空态。
- 搜索建议下拉和主体结果允许同时存在，但文案不得互相矛盾。
- URL 使用 `replaceState` 更新，不制造一串浏览器历史记录。

### A-2 P1：相关概念推荐与构建日志

#### R-01：`cooccurrence` 为空导致相关概念模块失效

**现象**

生产构建时大量出现：

```text
[warn] [recommendations:getRelatedConcepts] 未找到共现关联，返回空列表
{"cooccurrenceSize":0}
```

**原因判断**

`src/lib/recommendations.ts` 依赖 `content/index.json` 的 `cooccurrence` 字段，但当前数据为空（实测 `cooccurrence: 0`）。推荐模块不是没有调用，而是数据源没有生成可用共现关系。`scripts/generate-static-data.js` 仅消费 `index.cooccurrence`，无生成入口。

**涉及文件**

- `src/lib/recommendations.ts`
- `content/index.json`（含 `content/indexes/index.json`）
- 生成 `content/index.json` 共现数据的脚本（本期新增或扩展；`scripts/` 下无现成写入入口，需先建立）

**修复要求**

1. 建立 `content/index.json` 共现数据的生成入口（可放在 `scripts/generate-static-data.js` 之前独立执行，或并入现有索引生成链）。
2. 生成概念共现数据：
   - 同一篇文档中同时出现的两个概念记为一次共现。
   - 记录字段保持当前类型契约：`{ concepts: [a, b], count, years }`。
   - 只纳入 `conceptIds` 中存在的规范概念。
3. 如果暂时无法生成共现数据，前端推荐模块必须有降级逻辑：
   - 用 `getTopConcepts()` 或同年高频概念兜底。
   - 不显示空白模块。
   - 构建期只输出一次汇总 warning。

**验收标准**

- 构建后 `content/index.json.cooccurrence.length > 0`。
- 打开任意概念页，相关概念区域有内容或明确隐藏，不出现空卡片。
- `npm run build` 不再为每个概念重复刷 `cooccurrenceSize:0`。

#### L-01：构建期日志降噪

**现象**

7132 个静态页面构建时，`logger.info` 和 `logger.warn` 会被每个页面/概念重复触发，淹没真正的构建错误。

**涉及文件**

- `src/lib/logger.ts`
- `src/lib/recommendations.ts`
- `src/components/ReadingHistory.tsx`
- `src/app/munger/MungerContent.tsx`

**修复要求**

1. `logger` 支持日志级别：
   - 默认：生产构建和生产运行只输出 `warn` / `error`，或者只输出 `error`。
   - 开发：允许 `info`。
   - 可通过环境变量 `NEXT_PUBLIC_LOG_LEVEL` 或 `LOG_LEVEL` 覆盖。
2. 对确定会在 SSG 中高频调用的路径，不输出逐项 info。
3. 对可预期的数据缺失，只输出一次汇总 warning，不逐页 warning。

**验收标准**

- `npm run build` 输出中不再出现上百行同类推荐日志。
- 真实异常仍能输出 `error`。
- 开发时可通过环境变量打开详细日志。

### A-3 P1/P2：搜索性能、静态资源、环境配置与安全治理

#### P-01：搜索索引 3.4MB+，首次搜索成本偏高

**现状**

```text
public/search-index.json 约 3.59MB
public/graph-nodes.json 约 107KB
```

**问题**

当前搜索页一旦需要搜索，客户端要加载较大的静态 JSON。内容规模继续增长后，移动端弱网和低端设备会明显变慢。

**涉及文件**

- `scripts/generate-static-data.js`
- `src/lib/static-search-client.ts`
- `public/search-index.json`

**修复方案**

第一阶段做轻量优化，不引入后端：

1. 将索引拆成两层：
   - `search-index-lite.json`：标题、类型、url、count、years、短 description。
   - `search-index-content.json` 或按类型拆分：正文片段和全文辅助字段。
2. 默认建议和普通搜索先使用 lite 索引。
3. 只有用户明确搜索正文或结果不足时，再懒加载重索引。
4. 保持 `content` 截断上限，避免把长文正文塞进首屏索引。

**验收标准**

- 首次进入 `/search` 不加载 3.4MB+ 全量索引。
- 输入“巴菲特”“可口可乐”“BNSF”仍能返回核心结果。
- 搜索索引生成脚本输出 lite / content 两类体积统计。

#### P-02：大 PNG 和图片优化关闭

**现状**

`next.config.js` 使用：

```js
output: 'export',
images: {
  unoptimized: true,
}
```

内容目录中存在多张 2MB-4MB PNG 附件，集中在段永平 talks / milestones 附件。

**修复要求**

静态导出可以继续保留 `unoptimized: true`，但必须在资源生成阶段做优化：

1. 新增或扩展图片预处理脚本：
   - 对超过 800KB 的 PNG/JPEG 生成 WebP 版本。
   - 保留原图作为 source，不直接破坏内容归档。
   - 页面引用优先使用优化后的静态资源。
2. 对正文图片设置稳定宽高或容器约束，避免布局跳动。
3. 对二维码、封面、试读页等少量关键图，不盲目压缩到影响识别。

**验收标准**

- 构建产物中首屏和正文图片优先使用压缩版本。
- 超过 1MB 的线上正文图片数量显著减少。
- 二维码仍可识别，试读页文字仍清晰。

#### E-01：生产域名配置缺失时 SEO 会回落到 localhost

**现状**

`src/lib/site.ts` 第 8 行在没有 `NEXT_PUBLIC_SITE_URL` 或 Vercel URL 时回落到：

```text
http://localhost:3000
```

**修复要求**

1. 保留本地开发回落，但生产构建必须校验：
   - 当 `NODE_ENV=production` 且没有生产 URL 时，构建失败或输出高亮 error。
2. 在 `scripts/prebuild.js` 或独立校验脚本中增加环境检查。
3. 文档中明确部署必须配置：
   - `NEXT_PUBLIC_SITE_URL=https://fulilab.com`
   - `NEXT_PUBLIC_SITE_DOMAIN=fulilab.com`

**验收标准**

- 本地开发不受影响。
- 生产构建缺少 `NEXT_PUBLIC_SITE_URL` 时有明确报错。
- `robots.txt` 和 `sitemap.xml` 不会在线上生成 localhost URL。

#### SEC-01：`.env.local` 凭据治理

**现状**

本地 `.env.local` 含真实 `IMA_CLIENT_ID` 和 `IMA_API_KEY`。当前未进入 git（`.gitignore` 第 5-6 行已覆盖），但仍需治理。

**修复要求**

1. 确认 `.gitignore` 覆盖 `.env.local`（现状已覆盖，保持）。
2. 增加一个轻量凭据扫描脚本或 npm script：
   - 检查 staged 文件中是否包含 `IMA_API_KEY=`, `WECHAT_APP_SECRET=`, `STRIPE_SECRET`, `API_KEY=` 等模式。
3. `.env.example` 只保留空值和说明，不放真实值（现状已满足，保持）。
4. 如果本目录曾被压缩、同步、截图或发给外部，轮换相关凭据。

**验收标准**

- `git status --short` 不显示 `.env.local`。
- staged secret scan 可以在提交前运行。
- 文档明确“真实凭据只放本机或部署平台环境变量”。

## 6. 工作流 B：博客入口改造

### B-01 信息架构

#### 一级导航

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

#### URL 策略

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

### B-02 内容模型

#### 博客文章类型

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

#### 内容来源映射

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

#### Frontmatter 规范

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

### B-03 首页改造

#### 首页定位

首页从“档案目录首页”改为“主理人博客首页 + 档案入口”。

首屏目标：

1. 展示网站的人味和编辑判断；
2. 给用户一个明确的当前阅读起点；
3. 保留进入三大人物档案的明显入口。

#### 首页模块

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

#### 首页不应出现的东西

- 不展示全部栏目；
- 不把 7000+ 页面规模当卖点堆出来；
- 不把商业购买入口压到首屏；
- 不出现过多“资料馆式”密集列表；
- 不把外部博主文章混入主理人最新文章。

### B-04 `/blog` 列表页与详情页

#### `/blog` 列表页

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

列表排序：

1. `blog_featured` 置顶，最多 3 篇；
2. 其余按 `date` 倒序；
3. 无 `date` 内容默认不进入主列表，避免旧资料污染“最近写作”。

列表卡片必须展示：

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

#### `/blog/[slug]` 详情页

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

详情页模块推荐结构：

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

链接纪律：每篇博客必须至少满足一个条件——

- 关联 1 个公司、概念或人物；
- 关联 1 篇原典；
- 属于 1 个明确系列；
- 明确标记为短札 `note`。

避免产生“孤立博客文章”。

### B-05 档案页博客化

#### 人物页

`/buffett`、`/munger`、`/duanyongping` 不改成博客列表，但增加“相关文章”区：

- 最新与该人物相关的博客；
- 推荐导读；
- 该人物的原典入口。

#### 公司页

`/companies/[name]` 增强为：

- 公司档案；
- 相关原典；
- 相关博客文章；
- 公司研究。

博客文章反向引用公司页，公司页也反向展示文章。

#### 概念页

`/concepts/[name]` 增强为：

- 概念定义；
- 原典出处；
- 主理人解释；
- 相关博客；
- 相关公司/人物。

#### 原典页

`/letters/[year]`、`/qa/[id]`、`/talks/[id]` 仍保持原典阅读体验，只在底部增加：

- “读这份原典的导读文章”；
- “这份原典提到的公司/概念”；
- “相关博客文章”。

### B-06 搜索策略

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

**与工作流 A 的协同**：B-06 与 S-02、P-01 共用 `src/lib/static-search-client.ts`、`scripts/generate-static-data.js`、`src/components/SearchResults.tsx`、`src/app/search/page.tsx`。执行时先落 S-02（实时主结果）与 P-01（lite 索引），再叠加 B-06 的角色标签与排序，避免重复返工。

### B-07 SEO 与 canonical

#### 保留旧 URL

第一期不大规模 redirect。原因：

- 旧页面已经有静态审计和 sitemap；
- 大量中文 slug 和长尾页面有独立价值；
- 重定向会增加风险。

#### 新博客 URL

新写内容优先走 `/blog/[slug]`。

旧内容如果被纳入博客流，有两种方式：

1. **聚合卡片直接链接旧 URL**：最稳，不改变 canonical；
2. **建立博客别名页**：只适合精选文章，需要设置 canonical 到主 URL，避免重复收录。

第一期推荐方案 1。

#### Sitemap

新增：

- `/blog`
- `/blog/category/[category]`
- `/blog/tag/[tag]`
- 新写的 `/blog/[slug]`

不把所有旧文章重复塞进 `/blog/[slug]`。

## 7. 工程实施方案（合并文件清单）

### 7.1 新增模块

```text
src/lib/blog.ts
src/app/blog/page.tsx
src/app/blog/[slug]/page.tsx
src/app/blog/category/[category]/page.tsx
src/app/blog/tag/[tag]/page.tsx
src/components/BlogPostCard.tsx
src/components/BlogPostMeta.tsx
src/components/BlogRelatedArchive.tsx
scripts/generate-cooccurrence.mjs   （或并入现有索引生成链，见 R-01）
scripts/optimize-images.mjs         （或扩展现有资源脚本，见 P-02）
scripts/scan-staged-secrets.mjs     （或等价 npm script，见 SEC-01）
```

### 7.2 `src/lib/blog.ts` 职责

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

### 7.3 按工作项归纳的涉及文件

| 工作项 | 涉及文件 |
|---|---|
| S-01 / S-02 / B-06（搜索） | `src/components/SearchResults.tsx`、`src/app/search/page.tsx`、`src/components/SearchBar.tsx`、`src/lib/static-search-client.ts` |
| P-01（索引拆分） | `scripts/generate-static-data.js`、`src/lib/static-search-client.ts`、`public/search-index.json` |
| R-01（共现数据） | `src/lib/recommendations.ts`、`content/index.json`、`content/indexes/index.json`、新增生成脚本 |
| L-01（日志降噪） | `src/lib/logger.ts`、`src/lib/recommendations.ts`、`src/components/ReadingHistory.tsx`、`src/app/munger/MungerContent.tsx` |
| P-02（图片优化） | `next.config.js`（保持 unoptimized）、新增图片预处理脚本、正文图片引用 |
| E-01（域名校验） | `src/lib/site.ts`、`scripts/prebuild.js`、`.env.example` |
| SEC-01（凭据扫描） | `.gitignore`、新增扫描脚本、`package.json`（npm script） |
| B-01 / B-04（导航与页脚） | `src/components/SiteHeader.tsx`、`src/components/PageFooter.tsx`、`src/app/sitemap.ts` |
| B-03（首页） | `src/app/page.tsx`、`src/app/home.css`、`src/lib/recent-updates.ts`、新增 `src/lib/blog.ts` |
| B-05（档案页打通） | 人物页、公司页、概念页、原典页模板组件 |

## 8. 数据迁移策略

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

## 9. 验证清单

每次修复提交前必须运行：

```bash
npm run lint
npm run build
node scripts/audit-static-site.mjs
```

搜索专项验证：

```text
/search
/search?q=巴菲特
/search?q=可口可乐
/search?q=BNSF
/search?q=不存在的长字符串
```

博客与关键页面检查：

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
```

浏览器验收点：

- 桌面和移动端 390px 无横向滚动；
- 搜索输入、清空、回车、点击建议均无矛盾空态；
- 控制台无 error；
- 搜索结果和 URL 参数一致；
- 首页首屏按钮可点击；
- `/blog` 筛选可用；
- 博客详情页目录、进度条、字号控件正常；
- 原典页和人物页无明显回归。

构建日志验收点：

- 不出现成百上千行同类 `recommendations:getRelatedConcepts` warning；
- 构建失败时错误仍清晰可见。

资源验收点：

- `public/search-index*.json` 输出体积可见；
- 大图优化前后体积可比较。

SEO 验收点：

- 旧 URL 继续 200；
- `/sitemap.xml` 包含新博客入口；
- 不产生重复 canonical；
- `/robots.txt` 正常（无 localhost URL）；
- 博客文章 title / description 唯一。

## 10. 推荐执行顺序

1. **先修 S-01 / S-02**：用户最容易感知的 bug，改动小，收益大。
2. **再修 L-01**：先把日志降下来，后面看构建问题才不费眼。
3. **再修 R-01**：补齐相关概念数据，让推荐模块真正工作。
4. **再做 P-01**：搜索索引拆分会影响客户端搜索逻辑，需要单独验证。
5. **再建博客地基 B-01 / B-02**：先建 `src/lib/blog.ts` 统一内容视图，不动 UI；再新增 `/blog` 列表页与 `/blog/[slug]` 详情页。
6. **再改首页 B-03、导航 B-04**：把博客内容放到首屏，突出博客入口，同时保留原典/研究/资料库。
7. **再打通档案页 B-05**：给人物、公司、概念页加相关文章，博客与档案双向链接。
8. **再更新搜索 B-06 与 sitemap B-07**：叠加内容角色标签与排序，让新结构能被检索和收录。
9. **最后做 P-02 / E-01 / SEC-01**：偏部署和长期治理，可并行处理。

## 11. 风险和边界

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

- 工作流 A 先落地，工作流 B 按“地基 → 列表 → 详情 → 首页 → 导航 → 档案 → 搜索”递进；
- 每一步都跑静态审计；
- 搜索相关改动（S-02 / P-01 / B-06）共享文件，先合并改动再验证，避免重复返工。

### 风险 5：搜索改造相互踩踏

控制方式：

- S-02（实时主结果）、P-01（lite 索引）、B-06（角色标签）共用 `static-search-client.ts` 与 `generate-static-data.js`，必须以一个完整改动集提交并单独验证，不允许拆散并行。

### 风险 6：凭据泄漏

控制方式：

- `.env.local` 不入 git（已覆盖，保持）；
- 提交前运行 staged secret scan；
- 若目录曾被压缩、同步、截图或外发，立即轮换 `IMA_CLIENT_ID` / `IMA_API_KEY` 等凭据。

## 12. 完成定义

本合并 spec 视为完成，必须同时满足：

- 搜索页不再出现空态/结果态冲突；输入、清空、回车、点击建议均无矛盾界面。
- 相关概念模块有数据或优雅降级；构建期不再逐概念刷 `cooccurrenceSize:0`。
- 构建日志明显降噪，真实异常仍输出 error。
- 搜索索引有 lite / content 拆分落地，首次进入 `/search` 不加载全量索引。
- 大图资源有预处理策略，线上正文大图数量显著减少。
- 生产域名缺失时有明确构建报错；`robots.txt` / `sitemap.xml` 不出现 localhost URL。
- `.env.local` 不入 git，staged secret scan 可运行，`.env.example` 无真实值。
- 首页第一屏能看出“有人在写”，同时能一眼进入巴菲特、芒格、段永平档案。
- `/blog` 能展示最近文章、分类和标签；博客文章能回链到原典、公司、概念或人物。
- 原典和档案页仍保持当前阅读体验，不被博客流打散；旧 URL 继续 200。
- `lint`、`build`、`audit-static-site` 全部通过。
