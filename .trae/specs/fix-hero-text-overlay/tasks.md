# Tasks

- [x] Task 1: 修正 `.hero-content` 的 z-index
  - [x] 1.1 将 `.hero-content{position:relative;z-index:1}` 改为 `z-index:3`
  - [x] 1.2 在 CSS 中添加行注释 `/* 在图片之上 */`

- [x] Task 2: 修正 `.hero-cta` 的 z-index
  - [x] 2.1 将 `.hero-cta` 中的 `z-index:2` 改为 `z-index:4`
  - [x] 2.2 在 CSS 中添加行注释 `/* 在文字之上，确保可点击 */`

- [x] Task 3: 规范 Hero 区域 z-index 注释体系
  - [x] 3.1 在 `.hero-carousel` 行添加注释 `/* z-index:2 — 轮播图片 */`
  - [x] 3.2 在 `.hero-carousel-dots` 行添加注释 `/* z-index:5 — 指示点 */`
  - [x] 3.3 在 `.hero-decoration` 行添加注释 `/* z-index:0 — 装饰 */`
  - [x] 3.4 在 `.hero::before` 和 `.hero::after` 行添加注释 `/* z-index:0 — 装饰 */`

- [x] Task 4: 部署与验证
  - [x] 4.1 git add + commit + push
  - [x] 4.2 Vercel 部署后 curl 验证 z-index 值
  - [x] 4.3 Chrome DevTools 验证层叠顺序正确

# Task Dependencies
- Task 1、2、3 可并行执行（同一文件不同位置）
- Task 4 依赖 Task 1-3 完成
