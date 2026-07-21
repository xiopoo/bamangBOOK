# Checklist

## Requirement 1: 全站统一加载 image-urls-v2.js
- [x] cases.html 头部包含 `<script src="js/image-urls-v2.js"></script>`
- [x] column.html 头部包含 `<script src="js/image-urls-v2.js"></script>`
- [x] column-detail.html 头部包含 `<script src="js/image-urls-v2.js"></script>`
- [x] diag.html 头部包含 `<script src="js/image-urls-v2.js"></script>`
- [x] experts.html 头部包含 `<script src="js/image-urls-v2.js"></script>`
- [x] intro.html 头部包含 `<script src="js/image-urls-v2.js"></script>`
- [x] news.html 头部包含 `<script src="js/image-urls-v2.js"></script>`
- [x] news-detail.html 头部包含 `<script src="js/image-urls-v2.js"></script>`
- [x] 404.html 头部包含 `<script src="js/image-urls-v2.js"></script>`
- [x] index.html 已正确引用（无须修改）
- [x] about.html 已正确引用（无须修改）
- [x] services.html 已正确引用（无须修改）
- [x] cases-detail.html 已正确引用（无须修改）

## Requirement 2: 修复首页 Hero 轮播图片层叠覆盖
- [x] `.hero-carousel` 的 `z-index` 改为 2
- [x] `.hero-slide` 添加 `background: linear-gradient(135deg,var(--brand) 0%,var(--brand-dark) 100%)` 兜底
- [x] `.hero-slide-img` 添加 `position:relative;z-index:2`
- [x] `.hero-decoration` 的 `z-index` 保持 0 不变
- [x] `.hero::before` 和 `.hero::after` 的 `z-index` 保持 0 不变
- [x] Chrome DevTools 层叠面板验证：`.hero-slide-img` 位于层叠上下文顶层

## Requirement 3: 图片容器背景兜底
- [x] `.hero-slide` 未加载图片时显示品牌色渐变兜底
- [x] about.html 的 banner 容器有渐变背景
- [x] services.html 的 `.service-image` 容器有渐变背景
- [x] cases-detail.html 的 `.case-image` 容器有渐变背景

## Requirement 4: 浏览器端诊断日志
- [x] 设置 `img.src` 时输出 `[Image] Setting src: ...`
- [x] 图片加载成功时输出 `[Image] Loaded: ...`
- [x] 图片加载失败时输出 `[Image] FAILED: ...`
- [x] 日志使用 `console.debug` 或 `console.warn`，不影响用户体验

## Requirement 5: 部署前校验脚本
- [x] `scripts/check-image-config.js` 文件存在
- [x] 脚本扫描 `public/*.html` 中的所有文件
- [x] 检查包含图片引用的页面是否同时引用了 `image-urls-v2.js`
- [x] 校验通过时输出 `✅` 并以 0 退出码结束
- [x] 校验不通过时输出 `❌ Missing in: ...` 并以非 0 退出码结束
- [x] `package.json` 中包含 `"check-images"` scripts 命令
- [x] 运行 `npm run check-images` 校验通过

## 部署验证
- [x] 代码已推送至 GitHub
- [x] Vercel 部署成功
- [x] curl 验证全部 13 个页面包含 `image-urls-v2.js`
- [x] 浏览器验证首页 Hero 轮播图片正常显示
- [x] 浏览器验证 about/services/cases-detail 页面图片正常显示
- [x] 浏览器验证其他页面（cases/column/news/experts 等）图片正常显示
- [x] Chrome DevTools 控制台验证诊断日志输出
- [x] Chrome DevTools Elements 面板验证 z-index 层叠顺序正确
