# Tasks

- [x] **Task 1**: 修复核心服务配图右侧留白
  - [x] 1.1 在 `.service-card-img` 中增加 `max-width:none`
  - [x] 1.2 验证图片左右边缘与卡片对齐

- [x] **Task 2**: 更新 `image-urls-v2.js` 新增专栏/新闻图片条目
  - [x] 2.1 新增 `column1` ~ `column4` 条目（复用 service-1/3, case-2/3）
  - [x] 2.2 新增 `news1`, `news2` 条目（复用 service-2, case-1）
  - [x] 2.3 版本号 v3 → v4

- [x] **Task 3**: 首页专栏精选添加配图（index.html）
  - [x] 3.1 3 个专栏 `<div class="case-image">` 中各插入 `<img class="article-card-img" data-column="N">`
  - [x] 3.2 新增 CSS `.article-card-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;max-width:none;z-index:0}`
  - [x] 3.3 新增 JS 注入逻辑：读取 `data-column` 从 `__IMAGE_URLS` 获取 `columnN` 并设置 src

- [x] **Task 4**: column.html 添加配图
  - [x] 4.1 Featured 文章区插入 `<img>` 配图
  - [x] 4.2 4 个文章卡片中各插入 `<img class="article-card-img" data-column="N">`
  - [x] 4.3 新增相关 CSS（与 Task 3.2 共享 `.article-card-img` 类）
  - [x] 4.4 新增 JS 注入逻辑

- [x] **Task 5**: column-detail.html 添加配图
  - [x] 5.1 文章详情页的 `.article-image-placeholder` 区插入配图
  - [x] 5.2 JS 根据 URL query `?id=N` 映射到对应图片

- [x] **Task 6**: news.html 添加配图（企业新闻）
  - [x] 6.1 CSS 新增 `.news-thumb-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;max-width:none;z-index:0}`
  - [x] 6.2 修改 JS 渲染逻辑：生成每个新闻卡片时插入 `<img class="news-thumb-img" data-news="(index%2)+1">`
  - [x] 6.3 新增新闻图片注入 JS 逻辑

- [x] **Task 7**: 全局 `img` 规则评估
  - [x] 7.1 评估是否需要将 `.service-card-img` 的 `max-width:none` 也应用到其他 `.case-image-img` 等有 `width:100%+margin` 模式的图片
  - [x] 7.2 确认无其他受 `max-width:100%` 影响的图片

- [x] **Task 8**: 部署与验证
  - [x] 8.1 git commit + push
  - [x] 8.2 Vercel 部署
  - [x] 8.3 浏览器验证桌面端效果
  - [ ] 8.4 浏览器验证移动端效果（需手动确认）

# Task Dependencies
- Task 2 依赖 Task 1（完成 max-width:none 后统一图片引用模式）
- Task 3/4/5/6 均依赖 Task 2（需要 `image-urls-v2.js` 中的新条目）
- Task 3/4/5/6 可并行执行（修改不同 HTML 文件）
- Task 7 可并行执行（只读分析）
- Task 8 依赖所有其他 Task
