# Checklist

## z-index 值修正
- [x] `.hero-content` 的 `z-index` 从 1 改为 3
- [x] `.hero-cta` 的 `z-index` 从 2 改为 4
- [x] `.hero-carousel-dots` 的 `z-index` 保持 5 不变
- [x] `.hero-decoration` 的 `z-index` 保持 0 不变
- [x] `.hero::before` 和 `.hero::after` 的 `z-index` 保持 0 不变

## 注释规范
- [x] `.hero-carousel` 有注释 `/* z-index:2 — 轮播图片 */`
- [x] `.hero-content` 有注释 `/* 在图片之上 */`
- [x] `.hero-cta` 有注释 `/* 在文字之上，确保可点击 */`
- [x] `.hero-carousel-dots` 有注释 `/* z-index:5 — 指示点 */`
- [x] `.hero-decoration` 有注释 `/* z-index:0 — 装饰 */`
- [x] `.hero::before` 和 `.hero::after` 有注释

## 层叠顺序验证
- [x] Chrome DevTools Elements 面板验证 `.hero-content` 层叠在 `.hero-carousel` 之上
- [x] 首页标题文字清晰可见，未被图片遮挡
- [x] CTA 按钮在图片之上且可正常点击

## 部署验证
- [x] 代码已提交并推送至 GitHub
- [x] Vercel 部署成功
- [x] curl 验证线上 z-index 值正确
- [x] 浏览器打开首页确认文字显示正常
