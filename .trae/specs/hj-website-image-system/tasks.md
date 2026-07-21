# Tasks

- [x] Task 1: 统一 index.html 配图加载机制（`background-image` → `<img>`）
  - [x] 1.1 修改 Hero 轮播 HTML：在 `.hero-slide` 内添加 `<img>` 标签，保留 CSS 过渡逻辑
  - [x] 1.2 修改 Case 卡片 HTML：在 `.case-image` 内添加 `<img>` 标签，保留 `.case-image-text` 兜底文字
  - [x] 1.3 修改 Service 卡片 HTML：在 `.service-card` 内添加 `<img>` 标签
  - [x] 1.4 更新 index.html 底部 JS：`background-image` 设置逻辑改为设置 `<img>` 的 `src` 属性
  - [x] 1.5 更新相关 CSS：确保 `<img>` 使用 `object-fit: cover` 覆盖容器

- [x] Task 2: 实现图片加载三态机制
  - [x] 2.1 为所有配图 `<img>` 添加 `onload` 处理：图片加载成功后隐藏占位文字/背景
  - [x] 2.2 为所有配图 `<img>` 添加 `onerror` 处理：图片加载失败后显示品牌色渐变兜底 + 业务关键词
  - [x] 2.3 添加 CSS 骨架屏/加载中样式（可选，优先使用静态品牌色背景作为初始状态）
  - [x] 2.4 验证三态在 Chrome / Safari / 移动端的表现一致

- [x] Task 3: 标准化 vercel.json 缓存配置（确认上次修复已生效）
  - [x] 3.1 确认 JS 文件 `Cache-Control: public, max-age=0, must-revalidate`
  - [x] 3.2 确认图片文件 `Cache-Control: public, max-age=604800`（无 immutable）
  - [x] 3.3 确认 HTML 文件 `Cache-Control: public, max-age=0, must-revalidate`
  - [x] 3.4 确认 CSS 文件 `Cache-Control: public, max-age=3600`
  - [x] 3.5 部署后 curl 验证所有 Cache-Control 头正确

- [x] Task 4: 更新 image-urls-v2.js 配置完整性
  - [x] 4.1 确认所有 10 个配图键值指向正确的文件路径
  - [x] 4.2 确认 `?v=3` 版本参数在所有 URL 上生效
  - [x] 4.3 添加配置注释说明每个图片的主题和替换规范

- [x] Task 5: 全站图片完整性校验
  - [x] 5.1 验证 `public/images/` 下 10 张配图全部存在且为有效文件（`file` 命令检查魔数）
  - [x] 5.2 检查所有非 index.html 页面（services/about/cases-detail）的 `<img>` 创建逻辑
  - [x] 5.3 确认所有页面均引用 `js/image-urls-v2.js`
  - [x] 5.4 检查 logo、二维码等静态 `<img>` 标签的路径正确性

- [x] Task 6: 全站部署与验证
  - [x] 6.1 推送代码并等待 Vercel 部署完成
  - [x] 6.2 curl 验证所有图片 URL 返回 HTTP 200
  - [x] 6.3 浏览器验证首页 Hero/Case/Service 图片正常显示
  - [x] 6.4 浏览器验证 about/services/cases-detail 页面图片正常显示
  - [x] 6.5 模拟图片加载失败（断开网络），验证兜底状态正常显示

# Task Dependencies
- Task 2 依赖 Task 1（三态机制基于 `<img>` 标签）
- Task 3 独立可并行执行（仅涉及 vercel.json）
- Task 4 独立可并行执行（仅涉及 image-urls-v2.js）
- Task 5 依赖 Task 1、Task 2（完整性校验需要新的 HTML 结构）
- Task 6 依赖 Task 1-5 全部完成
