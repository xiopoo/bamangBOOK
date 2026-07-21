# Tasks

- [ ] Task 1: 修复 .hero-inner 底部圆角产生的弧形缺口
  - [ ] 1.1 在 `@media(max-width:767px)` 中将 `.hero-inner{border-radius:16px}` 改为 `border-radius:16px 16px 0 0`

- [ ] Task 2: 隐藏 .stats-in-hero 顶部边框分隔线
  - [ ] 2.1 在 `@media(max-width:767px)` 中的 `.stats-in-hero` 添加 `border-top:none`

- [ ] Task 3: 部署与验证
  - [ ] 3.1 git add + commit + push
  - [ ] 3.2 Vercel 部署后验证移动端两个色块完全无缝衔接
  - [ ] 3.3 验证桌面端不受影响

# Task Dependencies
- Task 1 和 Task 2 可并行
- Task 3 依赖 Task 1-2
