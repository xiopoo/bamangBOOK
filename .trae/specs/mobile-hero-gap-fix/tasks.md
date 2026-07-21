# Tasks

- [x] Task 1: 移动端 .hero-inner 添加背景和 z-index
  - [x] 1.1 在 `@media(max-width:767px)` 中添加 `.hero-inner{z-index:3;background:rgba(171,25,66,0.75);border-radius:16px;padding:24px 16px 0}`
  - [x] 1.2 确保此规则在桌面 `.hero-inner` 规则之后（移动端覆盖）

- [x] Task 2: 移动端隐藏 .hero-content::before（由 hero-inner 背景替代）
  - [x] 2.1 在 `@media(max-width:767px)` 中添加 `.hero-content::before{display:none}`

- [x] Task 3: 移动端消除 .stats-in-hero 顶部间隙
  - [x] 3.1 在 `@media(max-width:767px)` 中设置 `.stats-in-hero{margin-top:0;padding:8px 0}`

- [x] Task 4: 部署与验证
  - [x] 4.1 git add + commit + push
  - [x] 4.2 Vercel 部署后验证：
    - 文字面板与统计数据背景无缝衔接
    - 间隙区域无图片露出
    - 桌面端不受影响

# Task Dependencies
- Task 1, 2, 3 可并行执行
- Task 4 依赖 Task 1-3
