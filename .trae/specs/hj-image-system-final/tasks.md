# Tasks

- [x] Task 1: 添加 `image-urls-v2.js` 到缺失的 9 个页面
  - [x] 1.1 在 cases.html 的 `<head>` 中添加 `<script src="js/image-urls-v2.js"></script>`
  - [x] 1.2 在 column.html 的 `<head>` 中添加引用
  - [x] 1.3 在 column-detail.html 的 `<head>` 中添加引用
  - [x] 1.4 在 diag.html 的 `<head>` 中添加引用
  - [x] 1.5 在 experts.html 的 `<head>` 中添加引用
  - [x] 1.6 在 intro.html 的 `<head>` 中添加引用
  - [x] 1.7 在 news.html  ̄<head>` 中添加引用
  - [x] 1.8 在 news-detail.html 的 `<head>` 中添加引用
  - [x] 1.9 在 404.html 的 `<head>` 中添加引用

- [x] Task 2: 修复 index.html Hero 轮播 CSS z-index 层叠问题
  - [x] 2.1 将 `.hero-carousel` 的 `z-index:0` 改为 `z-index:2`
  - [x] 2.2 将 `.hero-slide` 添加 `background: linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%)` 兜底
  - [x] 2.3 将  .hero-slide-img` 添加 `position:relative;z-index:2`
  - [x] 2.4 验证 css 中 `.hero::before`、`.hero::after` 的 z-index 值不变

- [x] Task 3: 完善 index.html 图片加载 JS，添加诊断日志
  - [x] 3.1 在设置 `img.src` 之前添加 `console.debug('[Image] Setting src:', src)`
  - [x] 3.2 在 `onload` 回调中添加 `console.debug('[Image] Loaded:', this.src)`
  - [x] 3.3 在 `onerror` 回调中添加 `console.warn('[Image] FAILED:', this.src)`

- [x] Task 4: 完善 about/services/cases-detail 页面图片容器兜底背景
  - [x] 4.1 确认 about.html 的 `.about-banner img` 容器有渐变背景兜底
  - [x] 4.2 确认 services.html 的 `.service-image` 容器有渐变背景兜底
  - [x] 4.3 确认 cases-detail.html 的 `.case-image` 容器有渐变背景兜底

- [x] Task 5: 创建部署前校验脚本
  - [x] 5.1 创建 `scripts/check-image-config.js` 扫描所有 HTML 页面
  - [x] 5.2 在 `package.json` 中添加 `"check-images":"node scripts/check-image-config.js"` scripts 命令

- [x] Task 6: 全站部署与验证
  - [x] 6.1 运行校验脚本确认通过
  - [x] 6.2 提交并推送代码到 GitHub
  - [x] 6.3 Vercel 部署后 curl 验证所有页面引用
  - [x] 6.4 浏览器验证全站所有页面图片正常显示

# Task Dependencies
- Task 2 和 Task 3 可并行执行（同文件不同位置）
- Task 1 和 Task 4 可并行执行（不同文件）
- Task 5 可随时执行（独立文件）
- Task 6 依赖 Task 1-5 全部完成
