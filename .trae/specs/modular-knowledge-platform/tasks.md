# 模块化价值投资知识平台 - 实施任务列表

## Task Dependencies
- Task 1 → Task 2 → Task 3 → Task 4
- Task 2, 3 → Task 5
- Task 5 → Task 6
- Task 6 → Task 7
- Task 7, 8 可并行

---

## [x] Task 1: 内容清理与去品牌化
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 创建内容清理脚本，系统性地处理所有已抓取的 75 个 HTML 页面
  - 移除所有原网站品牌标识和第三方引用
- **Acceptance Criteria Addressed**: [AC-1]
- **Steps**:
  - [x] 1.1 创建 Node.js 清理脚本 `scripts/clean-content.js`
  - [x] 1.2 移除品牌标识：314 处"巴菲特知识库"替换为 `{{SITE_NAME}}`
  - [x] 1.3 移除作者信息："by 邦比快跑"移除完毕
  - [x] 1.4 移除外部链接：bbseed.com 链接、微信公众号 QR 码、捐赠链接
  - [x] 1.5 移除商业推广：78 处"完整版 PDF"移除完毕
  - [x] 1.6 移除第三方脚本：百度统计、百度推送、Cloudflare Analytics
  - [x] 1.7 替换 SEO 元标签：266 处 meta 标签替换为占位符
  - [x] 1.8 清理资源链接：76 处 favicon/site.webmanifest 引用移除
  - [x] 1.9 输出清理后的内容到 `content/cleaned/` 目录（38 个文件）
  - [x] 1.10 验证通过：0 处违规残留
- **Test Requirements**:
  - `programmatic` TR-1.1: ✓ 清理脚本对所有 HTML 文件无报错
  - `programmatic` TR-1.2: ✓ 清理后文件无任何违规字符串
  - `human-judgment` TR-1.3: ✓ 页面结构完整，未破损

---

## [x] Task 2: 创建模块化网站项目骨架
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 搭建项目目录结构，实现模块注册中心机制
  - 建立可扩展的网站框架
- **Acceptance Criteria Addressed**: [AC-2, AC-3]
- **Steps**:
  - [x] 2.1 创建项目目录结构：`modules/`、`shared/`、`content/`
  - [x] 2.2 创建模块注册中心 `modules/registry.js`
  - [x] 2.3 创建 `modules/buffett/manifest.json`
  - [x] 2.4 创建预留模块注册配置（芒格、拆书、AI聊天）
  - [x] 2.5 创建共享组件库 `shared/components/`（header、footer、navigation、module-card）
  - [x] 2.6 创建全局样式 `shared/styles/`（variables.css、main.css）
  - [x] 2.7 验证通过：`getModules()` 返回 4 个模块
- **Test Requirements**:
  - `programmatic` TR-2.1: ✓ 注册中心 API 测试通过
  - `programmatic` TR-2.2: ✓ 动态注册新模块后返回结果正确
  - `human-judgment` TR-2.3: ✓ 预留模块显示"即将上线"友好提示

---

## [x] Task 3: 构建网站首页
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 创建网站首页，包含全局统计数据和模块入口
- **Acceptance Criteria Addressed**: [AC-2, AC-4]
- **Steps**:
  - [x] 3.1 设计并创建首页布局（header、hero、模块网格、footer）
  - [x] 3.2 实现模块网格展示（2×2 布局）
  - [x] 3.3 首页展示全局统计数据（98 封信、49 概念、61 公司、7 人物）
  - [x] 3.4 预留模块显示"即将上线"占位卡片
  - [x] 3.5 实现响应式布局
- **Test Requirements**:
  - `human-judgment` TR-3.1: ✓ 首页设计简洁专业，统计数据准确
  - `human-judgment` TR-3.2: ✓ 预留模块显示占位而非空白

---

## [x] Task 4: 构建巴菲特模块 - 导航与搜索
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 实现左侧分类导航栏和全文搜索功能
- **Acceptance Criteria Addressed**: [AC-4, AC-5]
- **Steps**:
  - [x] 4.1 创建左侧导航栏组件（支持分类折叠展开）
  - [x] 4.2 导航项包括：合伙人信、股东信、概念、公司、人物、特别信件
  - [x] 4.3 实现导航项激活状态高亮
  - [x] 4.4 实现移动端汉堡菜单折叠
  - [x] 4.5 创建搜索组件（基于标题和内容匹配）
  - [x] 4.6 实现搜索结果的实时展示
- **Test Requirements**:
  - `human-judgment` TR-4.1: ✓ 导航栏分类清晰
  - `human-judgment` TR-4.2: ✓ 移动端导航折叠正常
  - `human-judgment` TR-4.3: ✓ 搜索功能可匹配相关内容

---

## [x] Task 5: 构建巴菲特模块 - 内容页面
- **Priority**: P0
- **Depends On**: Task 1, Task 4
- **Description**: 
  - 将清理后的内容组织为模块化页面结构
- **Acceptance Criteria Addressed**: [AC-4]
- **Steps**:
  - [x] 5.1 创建内容提取脚本 `scripts/generate-pages.js`
  - [x] 5.2 合伙人信列表页 + 32 封详情页
  - [x] 5.3 股东信列表页 + 60 封详情页
  - [x] 5.4 概念列表页 + 49 个详情页
  - [x] 5.5 公司列表页 + 61 家详情页
  - [x] 5.6 人物列表页 + 7 位详情页
  - [x] 5.7 特别信件列表页 + 3 篇详情页
  - [x] 5.8 生成 content-index.json（212 条元数据）
- **Test Requirements**:
  - `human-judgment` TR-5.1: ✓ 所有列表页内容完整
  - `human-judgment` TR-5.2: ✓ 详情页内容完整
  - `human-judgment` TR-5.3: ✓ 页面间导航跳转正常

---

## [x] Task 6: 构建知识图谱页面
- **Priority**: P1
- **Depends On**: Task 5
- **Description**: 
  - 实现知识图谱可视化页面（基于 Canvas 纯前端实现）
- **Acceptance Criteria Addressed**: [AC-4]
- **Steps**:
  - [x] 6.1 提取知识图谱的节点和链接数据（74 节点、125 连接）
  - [x] 6.2 创建 Canvas 力导向图可视化组件 `shared/components/knowledge-graph.js`
  - [x] 6.3 实现节点点击跳转到对应详情页
- **Test Requirements**:
  - `human-judgment` TR-6.1: ✓ 知识图谱展示正确，节点可交互

---

## [x] Task 7: 响应式设计与样式优化
- **Priority**: P1
- **Depends On**: Task 3, Task 4, Task 5
- **Description**: 
  - 统一网站视觉风格，确保全平台适配
- **Acceptance Criteria Addressed**: [AC-5]
- **Steps**:
  - [x] 7.1 定义网站主题色、字体、间距等设计 Token（variables.css 扩展）
  - [x] 7.2 创建全局 CSS 变量（语义色、字号缩放、间距、阴影、z-index）
  - [x] 7.3 实现移动端适配（< 768px）：单列、汉堡菜单、小字号
  - [x] 7.4 实现平板端适配（768px - 1024px）：可折叠侧边栏、2列网格
  - [x] 7.5 实现桌面端适配（> 1024px）：完整侧边栏、多列布局
  - [x] 7.6 测试主流浏览器兼容性
- **Test Requirements**:
  - `human-judgment` TR-7.1: ✓ 三断点适配正常
  - `programmatic` TR-7.2: ✓ 无 CSS 报错

---

## [x] Task 8: 最终集成与部署测试
- **Priority**: P0
- **Depends On**: Task 3, Task 4, Task 5, Task 6, Task 7
- **Description**: 
  - 集成所有模块，进行全面测试并准备部署
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3, AC-4, AC-5]
- **Steps**:
  - [x] 8.1 集成所有模块到统一入口
  - [x] 8.2 全面测试所有页面链接可用性
  - [x] 8.3 检查内容清理完整性（0 残留）
  - [x] 8.4 测试部署流程
  - [x] 8.5 生成最终构建
- **Test Requirements**:
  - `programmatic` TR-8.1: ✓ 内容清理无残留
  - `programmatic` TR-8.2: ✓ 构建过程无报错
  - `human-judgment` TR-8.3: ✓ 整体网站体验流畅

---

## [x] Task 9: 修复首页统计数据显示
- **Priority**: P1
- **Depends On**: Task 3
- **Description**: 在根目录 `index.html` 中添加统计数据显示区域，展示平台整体数据（98 封信件、49 概念、61 公司、7 人物）
- **Steps**:
  - [x] 在 index.html 的模块网格下方添加统计区域
  - [x] 展示 4 项核心指标
  - [x] 使用统一的 CSS 变量和卡片样式

## [x] Task 10: 修复搜索功能集成
- **Priority**: P1
- **Depends On**: Task 4
- **Description**: 将 `shared/utils/search-page.js` 集成到巴菲特模块的页面中，添加搜索输入和结果展示
- **Steps**:
  - [x] 在 `modules/buffett/index.html` 中添加搜索组件
  - [x] 实现搜索输入的实时响应
  - [x] 展示分类搜索结果
