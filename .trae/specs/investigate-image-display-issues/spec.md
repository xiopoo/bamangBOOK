# 网站配图未正确显示 — 排查与修复 Spec

## Why
网站现有配图资源未能在前端正确显示，需系统性排查所有页面中图片加载失败的原因，确保每个配图在浏览器中正常渲染。

## 前期快速排查已发现的线索
1. **Unsplash 可访问性问题** — Unsplash CDN 在中国大陆可能被墙或加载极慢，导致所有通过 `image-urls.js` 引用的图片无法显示
2. **Pages 缺少 image-urls.js 引用** — 以下页面未加载 image-urls.js：
   - `diag.html` (Vue 3 页面，未引用且有 case 卡片需要配图)
   - `news.html`, `news-detail.html`, `column.html`, `column-detail.html`, `intro.html`, `cases.html`
3. **index.html case-card 背景图通过 JS 设置，但已有默认渐变背景** — JS 可能因 Unsplash 加载失败而未覆盖
4. **cases-detail.html 中 6 个 case-image 共用 3 个 URL** — 可能重复但也可能不符合预期
5. **case-image 在 index.html 使用 background-image，在 services.html 等使用 <img>** — 两种不同的渲染方式

## What Changes
- 排查所有页面配图加载链路，定位所有不显示的原因
- 修复所有发现的图片加载问题
- 确保 URL 可访问、文件存在、引用路径正确、JS 加载时机正确

## Impact
- Affected code: `hj/public/` 下所有 `.html` 文件和 `js/image-urls.js`
- 需要验证：Chrome / Firefox / Safari / Edge 及移动端

## ADDED Requirements

### Requirement 1: 排查 Unsplash URL 可访问性
- **WHEN** 从中国大陆网络环境访问 Unsplash URL
- **THEN** 确认是否可正常加载，或需要替换为国内可访问的图床

#### Scenario: Unsplash 被屏蔽
- **WHEN** Unsplash CDN 在中国大陆无法正常访问
- **THEN** 需要将所有图片源替换为国内 CDN（如又拍云、阿里云 OSS、或七牛云）

### Requirement 2: 补齐缺失 image-urls.js 的页面
- **WHEN** 页面被检查
- **THEN** 确认是否需要图片资源
- **AND** 如果需要，在 `<head>` 或 `<body>` 顶部添加 `<script src="js/image-urls.js"></script>`

### Requirement 3: 统一图片加载机制
- **WHEN** 同一页面中多个配图需要从 `__IMAGE_URLS` 加载
- **THEN** 统一使用 `<img>` 元素 + JS 动态创建的方式，避免 background-image 和 img 混用导致的不一致

### Requirement 4: 添加图片加载失败兜底
- **WHEN** Unsplash 图片加载失败
- **THEN** 显示默认的品牌色背景 + 文字占位，不要显示空白区域或裂图

## MODIFIED Requirements

### Requirement: image-urls.js 中的 URL 格式验证
**修改前**：仅包含 Unsplash 格式 URL
**修改后**：验证所有 URL 是否可访问，不可访问的替换为可用的图源

## REMOVED Requirements
无