# 信件结尾清理与阅读库重构 - 任务列表

- [x] Task 1: 扫描全部合伙人信，识别并删除结尾非原始内容
  - **Priority**: high
  - **Depends On**: None
  - **Description**:
    - 逐文件扫描 `content/partnership/*.md` 全部 24 封信
    - 定位每封信中"沃伦·巴菲特"署名后的所有行
    - 识别非原始内容类型：大事记条目、人物简介、阅读推荐、英文引用、注释性内容
    - 删除所有非原始内容，保留"沃伦·巴菲特"署名
    - 需要特别注意处理有附录的信件（如 1961、1963 等），附录属于原始内容应保留，但附录后的额外内容需删除
    - 关键标准：以 1959 年信为模板——结尾只有"沃伦·巴菲特"，无任何附加内容
  - **Acceptance Criteria Addressed**: AC-信件结尾净化
  - **Test Requirements**:
    - `programmatic` TR-1.1: 所有 24 封信以"沃伦·巴菲特"结尾（或空白行后无实质性内容）
    - `human-judgement` TR-1.2: 1959 年信件末尾不变（标准模板）
    - `human-judgement` TR-1.3: 附录内容未被误删
  - **Notes**:
    - 已知包含非原始内容的信件：1959(芒格介绍)、1960(英文引用)、1961(大事记)、1962(阅读推荐+穆迪手册)、1963(博特尔对话)等
    - "附录"属于原始信件内容，应保留

- [x] Task 2: 删除 Sidebar 中的工具区导航栏
  - **Priority**: high
  - **Depends On**: None
  - **Description**:
    - 从 [src/components/Sidebar.tsx](file:///Users/lucas/Documents/bamangB/bamangBOOK/src/components/Sidebar.tsx) 中删除 `toolsSection` 定义（第 24-37 行）
    - 删除"工具区"标签（第 222-226 行）
    - 删除工具区菜单渲染代码块（第 228-280 行）
    - 这些功能页面仍然可通过直接 URL 访问，只是从导航中移除
  - **Acceptance Criteria Addressed**: AC-工具区导航删除
  - **Test Requirements**:
    - `programmatic` TR-2.1: `npm run build` 成功
    - `human-judgement` TR-2.2: 侧边栏不再显示"工具区"区域
    - `human-judgement` TR-2.3: 原工具区功能页面通过 URL 仍可正常访问

- [x] Task 3: 阅读库内容重组
  - **Priority**: medium
  - **Depends On**: None
  - **Description**:
    - 分析 `content/` 下所有 md 文件，按作者和文章类别分类
    - 作者分类：巴菲特（巴菲特致合伙人信、巴菲特致股东的信、巴菲特演讲/访谈）、芒格、施洛斯、其他
    - 文章类别：合伙人信、股东信、演讲、访谈、文章、公司分析、股东大会、其他
    - 创建新的按作者-类别组织的内容索引
    - 如果存在 `/reading` 页面，更新其数据源
  - **Acceptance Criteria Addressed**: AC-阅读库按作者分类
  - **Test Requirements**:
    - `human-judgement` TR-3.1: 阅读库按作者分类显示
    - `human-judgement` TR-3.2: 每个作者下按文章类别分类
    - `programmatic` TR-3.3: `npm run build` 成功

- [x] Task 4: 构建验证与质量检查
  - **Priority**: high
  - **Depends On**: Task 1, Task 2, Task 3
  - **Description**:
    - 运行 `npm run build` 确保构建通过
    - 随机抽样 5 封信件检查结尾清理效果
    - 验证阅读库页面功能正常
  - **Acceptance Criteria Addressed**: 全部
  - **Test Requirements**:
    - `programmatic` TR-4.1: `npm run build` 成功
    - `human-judgement` TR-4.2: 抽样检查信件结尾已清理干净
    - `human-judgement` TR-4.3: 阅读库页面正常显示

# Task Dependencies
- Task 1, 2, 3 无依赖关系，可并行执行
- Task 4 依赖 Task 1, 2, 3
