# Tasks

- [ ] Task 1: 排查 Unsplash URL 在中国大陆的可访问性，确认是否为主要原因
  - [ ] 使用 WebFetch 测试各 Unsplash URL 是否可返回图片
  - [ ] 确认是否需要替换图床

- [ ] Task 2: 排查所有 14 个 HTML 页面中 image-urls.js 的引用情况
  - [ ] 列出缺少引用的页面
  - [ ] 确认每个页面是否需要配图（有些页面可能确实不需要）
  - [ ] 为缺失的页面添加引用

- [ ] Task 3: 排查 index.html 中 case-card 配图加载机制
  - [ ] 检查 JS 设置 backgroundImage 的逻辑是否正确
  - [ ] 检查 CSS 中默认渐变背景是否遮盖了图片
  - [ ] 确认 6 个 case-card 是否全部正确分配 URL

- [ ] Task 4: 排查 services.html 中 service-image 加载机制
  - [ ] 检查 JS 动态创建 img 元素是否正确
  - [ ] 检查 img 元素的 CSS 样式是否正确

- [ ] Task 5: 排查 cases-detail.html 中 case-image 加载机制
  - [ ] 检查 6 个 case-image 的 data-case 属性与 URL 映射是否正确
  - [ ] 检查 img 创建代码是否执行

- [ ] Task 6: 排查 about.html 中 about-banner 图片加载
  - [ ] 检查 JS 创建 img 元素的逻辑
  - [ ] 确保 banner 容器存在且样式正确

- [ ] Task 7: 检查所有静态图片文件（images/ 目录）是否存在且路径正确
  - [ ] 检查 logo 图片
  - [ ] 检查 wechat-qrcode 图片
  - [ ] 检查 banner-footer 图片
  - [ ] 确认路径引用正确（相对路径 vs 绝对路径）

- [ ] Task 8: 统一图片加载机制，添加加载失败兜底处理
  - [ ] 统一使用 `<img>` + JS 创建的方式
  - [ ] 为每个图片添加 onerror 回退

- [ ] Task 9: 全站验证 — 确认所有配图在前端正常显示
  - [ ] Chrome 验证
  - [ ] Safari 验证
  - [ ] 移动端验证
  - [ ] 弱网环境验证

# Task Dependencies
- [Task 1] 影响所有后续任务（若 Unsplash 不可用，所有任务需切换图源后重新执行）
- [Task 2] 独立可并行执行
- [Task 3-6] 依赖于 Task 1 结论，但彼此独立可并行执行
- [Task 7] 独立可并行执行
- [Task 8] 依赖于 Task 3-6 的发现
- [Task 9] 依赖于所有修复完成