# Tasks

- [x] Task 1: 文件格式兼容性与完整性检查
  - [x] 检查 `public/images/` 下所有文件的格式（PNG/JPG）
  - [x] 读取每个文件的魔数（magic bytes）确认非损坏
  - [x] Unsplash 外部图片通过 curl 验证 Content-Type 确认格式正确

- [x] Task 2: 服务器配置检查
  - [x] 向已部署的 Vercel 站点请求本地图片，检查 Content-Type 和 Cache-Control
  - [x] 向 Unsplash CDN 请求图片，检查返回值
  - [x] 检查是否有 CORS / 安全策略阻止加载

- [ ] Task 3: 浏览器网络请求分析（需用户配合）
  - [ ] 列出所有需要检查的页面和对应图片
  - [ ] 指导用户打开浏览器 DevTools 检查每张图片的请求状态
  - [ ] 记录分析结果

- [x] Task 4: 配置 Vercel 404 重定向机制
  - [x] 验证现有 `public/404.html` 是否可用
  - [x] Vercel 自动使用 `404.html` 作为 404 页面

- [x] Task 5: 错误汇总报告
  - [x] 汇总所有发现的问题
  - [x] 提供完整的修复方案（图片迁移本地、失效 URL 替换）

- [x] Task 6: 全量验证与推送
  - [x] 推送代码更新（commit `a102745`）
  - [x] Vercel 部署验证（图片已正常响应 HTTP 200）