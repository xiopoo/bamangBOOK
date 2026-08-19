# 段永平网易博客 · 阅读体验优化设计

> 目标页面：`/duanyongping/blog`
> 问题：原页面一次性把 597 篇博文按年 `<details open>` 全展开，首屏 DOM 巨大、页面极长、定位困难。
> 方案：构建期预生成轻量索引 + 单篇全文碎片，客户端按「年份导航 + 搜索 + 日期筛选 + 无限滚动 + 按需展开全文」渲染。**保持按年区分的信息结构**，移动端与桌面端均易用。

---

## 一、整体信息架构

```
/duanyongping/blog
├── 年份导航（桌面：左侧 sticky 侧栏 / 移动：顶部横向标签页）
│    全部 | 2020(1) | 2018(7) | 2017(10) | 2016(19) | … | 2006(2)
├── 搜索 / 筛选栏
│    ├── 关键词搜索框（标题 + 摘要 + 日期）
│    ├── 排序：最新优先 / 最早优先
│    ├── 清除按钮（有筛选时显示）
│    └── 日期范围：起始 — 结束
├── 结果统计（共 N 篇 · 已显示 M 篇）
├── 博文卡片列表（无限滚动）
│    每卡片：年份/日期 + 标题 + 摘要 + [展开全文▼ / 收起▲] + [独立阅读页↗] + 段永平回复数
│    └── 展开后：按需 fetch 单篇全文碎片 → MarkdownContent 渲染
└── 无限滚动哨兵（自动加载下一页，并提供「加载更多」兜底按钮）
```

数据全部由构建期脚本预生成到 `public/duanyongping/`，**生产环境为静态导出（`output: 'export'`），无运行时 API**：

| 文件 | 作用 | 体积 |
| --- | --- | --- |
| `public/duanyongping/blog-index.json` | 轻量元数据 + 摘要 + 年份导航数据（597 条） | ~400 KB |
| `public/duanyongping/blog-content/<slug>.json` | 单篇全文（597 个，点击展开时按需取） | 每篇数 KB |

关键约束：`slug / year / 标题消歧` 逻辑在 `scripts/generate-blog-index.mjs` 中**复刻** `src/lib/duanyongping.ts`，确保列表标题、正文内链、`/duanyongping/blog/[slug]` 详情页三者完全一致。

---

## 二、页面结构（组件树）

```
src/app/duanyongping/blog/page.tsx        [服务端组件]
├─ 读取 public/duanyongping/blog-index.json → initialIndex（首屏直出，无需客户端再请求）
├─ <PageContainer maxWidth="7xl">
├─   <PageHeader title / subtitle / backHref />
├─   <BlogExplorer initialIndex={initialIndex} />   [客户端组件]
└─                                          └─ src/components/BlogExplorer.tsx

src/components/BlogExplorer.tsx            [use client]
├─ 年份导航（YearNav）：<aside> 桌面侧栏 sticky / 移动横向标签
├─ 搜索筛选栏：关键词 input + 排序 select + 日期起止 + 清除
├─ 结果统计行
├─ 卡片列表：filtered.slice(0, visible) 渲染 BlogCard
│     └─ BlogCard（年份/标题/摘要/展开按钮/独立页链接/回复数）
│           └─ 展开时 fetchBlogContent(slug) → <MarkdownContent content={...} />
└─ 无限滚动哨兵 <div ref={sentinelRef}> + 「加载更多」按钮
```

数据层：`src/lib/blog-index.ts`（类型 + 客户端 fetch 封装，零 Node 依赖，可安全被客户端引用）
- `fetchBlogIndex()` → `/duanyongping/blog-index.json`
- `fetchBlogContent(slug)` → `/duanyongping/blog-content/<slug>.json`

---

## 三、交互逻辑

### 1. 年份导航（对应需求①：避免一次性渲染全部年份）
- 顶部「全部」+ 各年份（含计数）作为导航。
- 点击年份 → 仅筛选该年博文进入列表，**DOM 只渲染当前年份结果**，不再把全部 597 篇塞进一页。
- 桌面端：`lg` 断点以上为左侧 `sticky` 侧栏，滚动阅读时年份常驻可见。
- 移动端：`lg` 以下为顶部横向可滑动标签，`overflow-x-auto`。

### 2. 搜索与筛选（对应需求③：按关键词 / 日期快速定位）
- **关键词**：实时匹配 `title + summary + date`（不区分大小写），597 条内存过滤开销可忽略，无需防抖。
- **日期范围**：两个 `type="date"` 输入（起始—结束），按 `YYYY-MM-DD` 字典序比较，与 `item.date` 格式一致。
- **排序**：最新优先 / 最早优先，切换即重排。
- 任一筛选项变化 → 列表回到第一页（`visible` 重置为 `PAGE_SIZE`）。
- 「清除」按钮在有任一筛选时显示，一键复位。

> 说明：因静态导出无后端检索，搜索范围为「标题 + 摘要 + 日期」。如需正文级全文检索，可后续扩展为构建期生成的倒排索引（见文末「可扩展项」）。

### 3. 按需加载全文（对应需求②：初始仅摘要，点开才加载）
- 卡片默认只渲染 **摘要**（构建期从正文截断生成，已剔除来源引用块、评论区、`#` 标题标记）。
- 点击「展开全文 ▼」：
  1. 将该 slug 加入 `expanded` 集合并触发 `fetchBlogContent(slug)`（带 `AbortController`，组件卸载时取消）。
  2. 加载中显示 spinner；加载失败显示错误提示；成功则 `<MarkdownContent>` 渲染正文。
  3. 再次点击「收起 ▲」折叠（正文已缓存于 `contents`，不重复请求）。
- 全文碎片内相对 `.md` 链接已在构建期改写为站内详情页 URL，无死链。

### 4. 分页 / 无限滚动（对应需求④：控制单页长度）
- 初始仅渲染 `PAGE_SIZE = 20` 篇。
- `IntersectionObserver` 监听列表底部哨兵（提前 400px 预加载），自动累加 `visible`。
- 同时提供「加载更多（剩余 N 篇）」按钮作为不支持 IO 或用户手动触发的兜底。
- 年份/搜索/日期筛选会把列表收敛到更小集合，翻页压力进一步降低。

### 5. 响应式与暗色（对应需求⑤）
- 复用项目既有 Tailwind 令牌：`rounded-card / border-primary / dark:bg-dark-card / dark:text-dark-text / dark:text-dark-muted` 等，自动适配亮/暗主题。
- 桌面双栏（侧栏 + 主区），移动单栏（标签页 + 卡片流）。卡片内信息在小屏下自然换行。
- 保留「按年区分」结构：年份既是导航维度，也是筛选维度，信息层级与原站点一致。

---

## 四、构建与数据流

```
content/duanyongping/blog/**/*.md
        │  scripts/generate-blog-index.mjs（复刻 slug/year/消歧逻辑）
        ▼
public/duanyongping/blog-index.json
public/duanyongping/blog-content/<slug>.json
        │  随 next build 拷贝进 out/，静态托管
        ▼
博客页首屏读取 blog-index.json（服务端直出 initialIndex）
        │  客户端交互
        ▼
用户点击展开 → fetch /duanyongping/blog-content/<slug>.json → MarkdownContent
```

接入点：
- `package.json` → `dev`：前置运行 `node scripts/generate-blog-index.mjs`。
- `scripts/prebuild.js` → `build`：在执行 `next build` 前调用同一脚本，保证产物最新。
- `.gitignore`：忽略 `public/duanyongping/blog-index.json` 与 `public/duanyongping/blog-content/`（纯派生物，禁止手改）。

---

## 五、关键文件清单

| 文件 | 角色 |
| --- | --- |
| `scripts/generate-blog-index.mjs` | 构建期生成索引 + 全文碎片（含 slug/年份/消歧/摘要/链接改写） |
| `src/lib/blog-index.ts` | 客户端类型 + `fetchBlogIndex` / `fetchBlogContent` 封装 |
| `src/components/BlogExplorer.tsx` | 年份导航 + 搜索 + 筛选 + 排序 + 无限滚动 + 按需展开 |
| `src/app/duanyongping/blog/page.tsx` | 服务端读取索引并直出 `initialIndex` |
| `docs/duanyongping-blog-ux.md` | 本设计文档 |

---

## 六、可扩展项（可选，非本次范围）
1. **正文级全文搜索**：构建期生成倒排索引 JSON，客户端二分/前缀匹配，使搜索纳入正文。
2. **虚拟滚动**：当前 20/页 + IO 已足够（单年最多 142 篇）；若未来单年破千，可换 `@tanstack/react-virtual`。
3. **URL 状态同步**：把 `year / query / from / to / sort` 写入 `?search=` 查询参数，支持分享与前进/后退。
4. **评论楼独立加载**：当前碎片含完整评论楼；如需进一步瘦身，可把评论楼拆为单独碎片异步加载。
