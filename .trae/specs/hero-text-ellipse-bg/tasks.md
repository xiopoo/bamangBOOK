# Tasks

- [x] Task 1: 为 .hero-content 添加 ::before 椭圆背景伪元素
  - [x] 1.1 在 index.html 的 CSS 中添加 `.hero-content::before` 规则
  - [x] 1.2 使用 `radial-gradient(ellipse at center, rgba(171,25,66,0.65) 0%, rgba(171,25,66,0.40) 50%, transparent 80%)`
  - [x] 1.3 设置 `z-index: -1` 确保在文字之后
  - [x] 1.4 设置 `pointer-events: none` 不干扰点击
  - [x] 1.5 调整 `top/left/right/bottom` 负值使椭圆覆盖文字区域

- [x] Task 2: 部署与验证
  - [x] 2.1 git add + commit + push
  - [x] 2.2 Vercel 部署后验证椭圆背景显示正常
  - [x] 2.3 验证文字在所有轮播图片上清晰可读

# Task Dependencies
- Task 2 依赖 Task 1
