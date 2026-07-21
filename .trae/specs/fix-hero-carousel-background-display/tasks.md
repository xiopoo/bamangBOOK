# Tasks

- [x] Task 1: 修复 `.hero-slide` 背景图尺寸和定位
  - [x] 1.1 在 `.hero-slide` CSS 规则中添加 `background-size:cover;background-position:center`
  - [x] 1.2 验证多背景（图片+渐变）的 `background-size` 兼容性

- [x] Task 2: 检查并修复移动端轮播显示兼容性
  - [x] 2.1 检查 `.hero{overflow:visible}` 对移动端轮播的影响
  - [x] 2.2 验证移动端 z-index 层级正常，轮播不被遮挡
  - [x] 2.3 如有必要恢复移动端 `overflow:hidden`

- [x] Task 3: 部署与验证
  - [x] 3.1 git add + commit + push
  - [x] 3.2 Vercel 部署后验证桌面端轮播
  - [x] 3.3 Vercel 部署后验证移动端轮播

# Task Dependencies
- Task 3 依赖 Task 1, Task 2
