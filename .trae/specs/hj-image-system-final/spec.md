# 灰金重组网站配图系统全面诊断与修复 Spec

## Why
经过多轮修复（Unsplash→本地迁移→Vercel缓存修复→`<img>` 标签化+三态兜底），灰金重组网站配图问题仍未彻底解决。用户当前反馈：首页首屏图片显示为"占位印记"（品牌色渐变背景可见，但真实图片未加载），且其他页面配图均无法显示。经全面诊断，存在以下系统性问题：

1. **全站 9 个页面未加载 `image-urls-v2.js`**：`cases.html`、`column.html`、`column-detail.html`、`diag.html`、`experts.html`、`intro.html`、`news.html`、`news-detail.html`、`404.html` 这 9 个页面完全没有加载图片 URL 配置，任何依赖 `window.__IMAGE_URLS` 的 JS 都会因为 `u` 为 `undefined` 而直接 `return`，导致这些页面的所有 JS 渲染图片逻辑完全不执行。

2. **首页首屏 Hero 图片不显示**：经 CSS 层叠上下文（stacking context）分析，`.hero-carousel{z-index:0}` 与 `.hero-decoration{z-index:0}` 在同一层叠等级，`.hero-decoration` 在 DOM 中位于 `.hero-carousel` 之后，会覆盖在 carousel 之上。虽然 decoration 元素仅有半透明装饰环，但 `.hero` 的 `::before` 和 `::after` 伪元素（也位于 `z-index:0`）与图像重叠，加上 `.hero` 本身有深色品牌色渐变背景，图片加载失败或未完成时，用户看到的是"占位印记"而非图片。

3. **图片加载三态机制不完善**：现有 `img.onerror` 兜底（`img-error` 类 `opacity:0!important`）在图片加载失败时直接将 img 完全隐藏，但 CSS `.case-image` 容器的背景渐变只在特定元素上设置，Hero 轮播的 `.hero-slide` 和 Service 卡片没有类似的背景兜底。

4. **缺少统一的部署前校验和浏览器端日志**：无法在发布前自动检查所有页面的图片配置完整性，也无法在浏览器端收集图片加载失败的日志。

## What Changes
- 将 `image-urls-v2.js` 添加到全站所有 13 个 HTML 页面（补充 9 个缺失页面）
- 修复首页 Hero 图片层叠上下文问题（提升 `.hero-carousel` 的 `z-index` 至 2）
- 完善全站图片加载一致性：所有配图位置的容器设置统一的品牌色渐变背景兜底
- 添加浏览器端图片加载诊断日志（`console.debug` 输出图片加载状态）
- 添加 npm/pre-commit 脚本自动校验所有 HTML 页面包含 `image-urls-v2.js` 引用
- **BREAKING**: 无

## Impact
- Affected specs: hj-website-image-system（本 spec 为其补充和修正）
- Affected code: `hj/public/` 下全部 13 个 HTML 文件, `hj/package.json`

## ADDED Requirements

### Requirement 1: 全站统一加载 image-urls-v2.js
系统 SHALL 确保每个 HTML 页面都加载 `js/image-urls-v2.js`，使 `window.__IMAGE_URLS` 全站可用。

#### Scenario: 补充缺失页面
- **WHEN** 用户访问以下任一页面：cases.html / column.html / column-detail.html / diag.html / experts.html / intro.html / news.html / news-detail.html / 404.html
- **THEN** 页面在 `<head>` 或 `<body>` 顶部必须包含 `<script src="js/image-urls-v2.js"></script>`
- **AND** `window.__IMAGE_URLS` 必须可访问

#### Scenario: 核验已有页面
- **WHEN** 检查 index.html / about.html / services.html / cases-detail.html
- **THEN** 确认已正确引用 `image-urls-v2.js`，无需重复添加

### Requirement 2: 修复首页 Hero 轮播图片层叠覆盖问题
系统 SHALL 确保 Hero 轮播中的 `<img>` 标签不会被同级的装饰元素或伪元素覆盖。

#### Scenario: CSS z-index 修复
- **WHEN** 首页 Hero 轮播加载完成
- **THEN** `.hero-carousel` 的 `z-index` 应提升至 2（高于 `.hero-decoration` 的 0）
- **AND** `.hero-slide` 的 `z-index` 应为 1（确保图片在装饰环之上）
- **AND** `.hero-slide-img` 的 `z-index` 应为 2（确保图片在最上层）
- **AND** `.hero-decoration` 保持 `z-index:0`，`.hero-content` 保持 `z-index:1`

#### Scenario: 验证无覆盖
- **WHEN** 在 Chrome DevTools 中检查 `.hero-carousel` 区域的层级
- **THEN** `.hero-slide-img` 应位于层叠上下文的顶层
- **AND** 没有任何元素在视觉上遮挡图片

### Requirement 3: 完善全站图片容器的背景兜底
系统 SHALL 为所有配图容器设置统一的品牌色渐变背景，确保图片加载失败时有视觉反馈而非空白。

#### Scenario: Hero 轮播背景兜底
- **WHEN** `.hero-slide-img` 加载失败（`onerror` 触发）
- **THEN** `.hero-slide` 应显示品牌色渐变背景（`linear-gradient(135deg, #AB1942, #8B1435)`）
- **AND** `.hero-slide-img` 隐藏（`.img-error{opacity:0!important}`）

#### Scenario: 其他页面配图容器背景兜底
- **WHEN** 约/services/cases-detail 页面的 `.service-image` / `.case-image` 容器创建图片时
- **THEN** 容器本身应有 `background: linear-gradient(135deg, var(--brand), var(--brand-dark))` 兜底
- **AND** 图片加载失败后的行为与三态机制保持一致

### Requirement 4: 添加浏览器端图片加载诊断日志
系统 SHALL 在浏览器控制台输出图片加载状态信息，方便远程诊断。

#### Scenario: 图片加载日志
- **WHEN** 任何配图图片开始加载（JS 设置 `src` 时）
- **THEN** 在控制台输出 `[Image] Setting src: images/xxx.jpg?v=3`
- **AND** 图片加载成功时输出 `[Image] Loaded: images/xxx.jpg?v=3`
- **AND** 图片加载失败时输出 `[Image] FAILED: images/xxx.jpg?v=3`
- **AND** 日志级别使用 `console.debug` 不影响正常用户

### Requirement 5: 添加部署前完整性校验脚本
系统 SHALL 提供可运行的校验脚本，在部署前自动检查所有页面是否包含必要的 JS 引用。

#### Scenario: 校验脚本
- **WHEN** 运行 `node scripts/check-image-config.js`
- **THEN** 扫描 `public/*.html` 中所有包含 `src.*\.(jpg|png)` 或 `__IMAGE_URLS` 的页面
- **AND** 确认这些页面都包含 `<script src="js/image-urls-v2.js">` 引用
- **AND** 输出所有缺失引用的页面列表，以非零退出码结束

#### Scenario: 校验结果
- **WHEN** 所有页面均已正确引用
- **THEN** 脚本输出 `✅ All pages have image-urls-v2.js` 并以零退出码结束
- **WHEN** 有页面缺失引用
- **THEN** 脚本输出 `❌ Missing in: cases.html, column.html...` 并以非零退出码结束

## MODIFIED Requirements

### Requirement: index.html Hero 轮播 CSS（修改前）
**修改前**：
```css
.hero-carousel{position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;overflow:hidden}
.hero-slide{position:absolute;top:0;left:0;width:100%;height:100%;opacity:0;transition:opacity 1.2s ease}
.hero-slide-img{width:100%;height:100%;object-fit:cover;display:block}
```

**修改后**：
```css
.hero-carousel{position:absolute;top:0;left:0;width:100%;height:100%;z-index:2;overflow:hidden}
.hero-slide{position:absolute;top:0;left:0;width:100%;height:100%;opacity:0;transition:opacity 1.2s ease;background:linear-gradient(135deg,var(--brand) 0%,var(--brand-dark) 100%)}
.hero-slide.active{opacity:1}
.hero-slide-img{width:100%;height:100%;object-fit:cover;display:block;position:relative;z-index:2}
```

### Requirement: 图片加载 JS（修改前）
**修改前**：仅设置 `img.src` + `onerror` 和 `onload` 处理.

**修改后**：添加 `console.debug` 日志输出，便于浏览器端诊断。

## REMOVED Requirements
无。
