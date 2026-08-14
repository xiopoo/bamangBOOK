# 复利书房体验细节修复 Spec

## 1. 文档信息

- **状态**：待执行
- **日期**：2026-08-14
- **目标**：修复当前站点中已经被实测发现、会直接影响用户判断、搜索体验、构建稳定性和性能体感的细节问题。
- **范围**：搜索页、相关概念推荐、构建日志、搜索索引、图片资源、生产环境配置、安全凭据治理。
- **不在本期范围**：重新设计首页、重写内容、接入真实支付、改品牌视觉、重构全部 CSS、引入复杂后端搜索服务。

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

因此本期不是“救火式重做”，而是把已经暴露的体验毛刺和工程噪声修掉。

## 3. 优先级总览

| 优先级 | 编号 | 问题 | 用户影响 | 工程影响 |
|---|---|---|---|---|
| P0 | S-01 | 搜索页空态和结果态冲突 | 用户以为搜索坏了 | 小改动，高收益 |
| P0 | S-02 | 输入搜索时主结果区不随输入同步 | 上方有建议、下方说无结果 | 状态模型混乱 |
| P1 | R-01 | 相关概念共现数据为空 | 推荐模块空、探索断层 | 构建日志刷屏 |
| P1 | L-01 | 构建期 logger 噪声过大 | 无直接用户影响 | CI / Vercel 日志不可读 |
| P1 | P-01 | 搜索索引 3.4MB | 移动弱网首次搜索慢 | 静态资源偏重 |
| P2 | P-02 | 图片优化关闭且存在大 PNG | 长页面加载慢 | 静态导出体积增长 |
| P2 | E-01 | 生产域名依赖环境变量 | 配错会伤 SEO | 部署可观测性不足 |
| P2 | SEC-01 | 本地 `.env.local` 有真实凭据 | 泄漏风险 | 需要治理规则 |

## 4. P0：搜索体验修复

### S-01：搜索页首次打开误显示“未找到相关结果”

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

### S-02：输入搜索时主结果区与建议下拉状态冲突

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

## 5. P1：相关概念推荐与构建日志

### R-01：`cooccurrence` 为空导致相关概念模块失效

**现象**

生产构建时大量出现：

```text
[warn] [recommendations:getRelatedConcepts] 未找到共现关联，返回空列表
{"cooccurrenceSize":0}
```

**原因判断**

`src/lib/recommendations.ts` 依赖 `content/index.json` 的 `cooccurrence` 字段，但当前数据为空。推荐模块不是没有调用，而是数据源没有生成可用共现关系。

**涉及文件**

- `src/lib/recommendations.ts`
- `content/index.json`
- 生成 `content/index.json` 的脚本，需用 `rg "cooccurrence|content/index.json" scripts src content` 定位

**修复要求**

1. 找到 `content/index.json` 的生成入口。
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

### L-01：构建期日志降噪

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

## 6. P1：搜索性能与静态资源体积

### P-01：搜索索引 3.4MB，首次搜索成本偏高

**现状**

```text
public/search-index.json 约 3.4MB
public/graph-nodes.json 约 108KB
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

- 首次进入 `/search` 不加载 3.4MB 全量索引。
- 输入“巴菲特”“可口可乐”“BNSF”仍能返回核心结果。
- 搜索索引生成脚本输出 lite / content 两类体积统计。

### P-02：大 PNG 和图片优化关闭

**现状**

`next.config.js` 使用：

```js
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

## 7. P2：环境配置与安全治理

### E-01：生产域名配置缺失时 SEO 会回落到 localhost

**现状**

`src/lib/site.ts` 在没有 `NEXT_PUBLIC_SITE_URL` 或 Vercel URL 时回落到：

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

### SEC-01：`.env.local` 凭据治理

**现状**

本地 `.env.local` 含真实 `IMA_CLIENT_ID` 和 `IMA_API_KEY`。当前未进入 git，但仍需治理。

**修复要求**

1. 确认 `.gitignore` 覆盖 `.env.local`。
2. 增加一个轻量凭据扫描脚本或 npm script：
   - 检查 staged 文件中是否包含 `IMA_API_KEY=`, `WECHAT_APP_SECRET=`, `STRIPE_SECRET`, `API_KEY=` 等模式。
3. `.env.example` 只保留空值和说明，不放真实值。
4. 如果本目录曾被压缩、同步、截图或发给外部，轮换相关凭据。

**验收标准**

- `git status --short` 不显示 `.env.local`。
- staged secret scan 可以在提交前运行。
- 文档明确“真实凭据只放本机或部署平台环境变量”。

## 8. 验证清单

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

浏览器验收点：

- 移动端 390px 无横向滚动。
- 搜索输入、清空、回车、点击建议均无矛盾空态。
- 控制台无 error。
- 搜索结果和 URL 参数一致。

构建日志验收点：

- 不出现成百上千行同类 `recommendations:getRelatedConcepts` warning。
- 构建失败时错误仍清晰可见。

资源验收点：

- `public/search-index*.json` 输出体积可见。
- 大图优化前后体积可比较。

## 9. 推荐执行顺序

1. **先修 S-01 / S-02**：这是用户最容易感知的 bug，改动小，收益大。
2. **再修 L-01**：先把日志降下来，后面看构建问题才不费眼。
3. **再修 R-01**：补齐相关概念数据，让推荐模块真正工作。
4. **再做 P-01**：搜索索引拆分会影响客户端搜索逻辑，需要单独验证。
5. **最后做 P-02 / E-01 / SEC-01**：它们更偏部署和长期治理，可以并行处理。

## 10. 完成定义

本 spec 视为完成，必须同时满足：

- 搜索页不再出现空态/结果态冲突。
- 相关概念模块有数据或优雅降级。
- 构建日志明显降噪。
- 搜索索引体积有拆分或明确压缩方案落地。
- 大图资源有预处理策略。
- 生产域名和凭据治理有明确校验。
- `lint`、`build`、`audit-static-site` 全部通过。
