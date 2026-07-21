# 文章内容类型分类审核与修正 - 任务列表

- [x] Task 1: 系统性审查 articles-index.json 中所有文章的内容类型
  - **Priority**: high
  - **Depends On**: None
  - **Description**:
    - 逐篇阅读 review articles-index.json 中 85 篇文章标题和开头内容，判断其实际内容类型
    - 重点关注标准：
      - 内容为 Q&A 问答格式 → 应归入 `qa` 类别
      - 内容为股东大会/发布会实录 → 应归入 `qa` 类别
      - 内容为独立研究文章、传记、分析 → 归入 `article` 类别
      - 内容为股东手册、公司手册 → 归入 `article` 类别
    - 特别审核对象：
      - "伯克希尔股东大会发布会 2009"（已知问题）
      - Wesco 股东大会系列（1996、2001、2002、2004、2005、2006、2008、2009、2011）
      - "伯克希尔股东手册 1996"
      - "伯克希尔 50 周年：过去、现在和未来"
      - "伯克希尔：集团企业的终极折让"
    - 输出一份分类审核报告，列出所有需要移动的文章及其理由
  - **Acceptance Criteria Addressed**: AC-文章内容类型审核
  - **Test Requirements**:
    - `human-judgement` TR-1.1: 输出报告包含每篇文章的审核结论
    - `programmatic` TR-1.2: 报告中列出所有待移动的文章

- [x] Task 2: 执行文章分类修正（2009发布会 → qa 等）
  - **Priority**: high
  - **Depends On**: Task 1
  - **Description**:
    - 根据审核报告，执行以下操作：
      1. 将 `content/articles/` 中需要移动到 `content/qa/` 的文件物理移动
      2. 从 `content/articles-index.json` 中移除相应条目
      3. 向 `content/qa-index.json` 添加新条目（保持 QA 的 JSON 格式，含 year 字段）
    - "伯克希尔股东大会发布会 2009" 的 qa-index 条目需要包含 year: 2009
  - **Acceptance Criteria Addressed**: AC-文章内容类型审核
  - **Test Requirements**:
    - `programmatic` TR-2.1: 文件物理移动到新目录
    - `programmatic` TR-2.2: articles-index.json 已移除条目
    - `programmatic` TR-2.3: qa-index.json 已添加条目

- [x] Task 3: 审核芒格主题内容，迁移涉及巴菲特的内容至巴菲特主题
  - **Priority**: high
  - **Depends On**: None
  - **Description**:
    - 审核芒格主题下"演讲"分类（5 篇芒格演讲：哈佛中学 1986、南加大 1994、斯坦福 1996、哈佛法学 1998、财务总监 1998）和"访谈"分类的文章
    - 识别标准：文章实质性内容是围绕巴菲特（而非芒格本人）展开的
    - 对于需迁移的文章：
      a) 在芒格主题原位置添加明确的迁移说明及跳转链接（修改 `reading-library.ts` 中的逻辑或在页面组件中添加说明）
      b) 更新 `content/talks-index.json` 或 `content/interviews-index.json` 中的 person 字段
      c) 更新 `reading-library.ts` 中的人物分类逻辑
    - 迁移前后文章数量需保持一致（无丢失）
  - **Acceptance Criteria Addressed**: AC-芒格-巴菲特内容迁移
  - **Test Requirements**:
    - `human-judgement` TR-3.1: 审核报告记录每篇文章的评估结论
    - `programmatic` TR-3.2: 需迁移的文章 person 字段已更新
    - `human-judgement` TR-3.3: 芒格主题原位置有迁移说明及跳转链接
    - `programmatic` TR-3.4: 迁移前后文章总数一致

- [x] Task 4: 更新阅读库索引和路由，确保正确反映分类
  - **Priority**: high
  - **Depends On**: Task 2, Task 3
  - **Description**:
    - 检查 `reading-library.ts` 的 `loadIndexedContent()` 函数，确认:
      - content/qa/ 目录中的文件会被归类为 `'qa'` 类别
      - content/talks/ 目录中的文件被正确归入 `'talk'` 类别，且 person 字段决定作者归属
    - 验证 `/qa/`、`/articles/`、`/munger`、`/buffett` 页面显示正确
    - 构建通过后启动开发服务器验证
  - **Acceptance Criteria Addressed**: AC-修正后的分类
  - **Test Requirements**:
    - `human-judgement` TR-4.1: `/qa/` 页面显示新添加的文章
    - `human-judgement` TR-4.2: `/articles/` 页面不再显示移走的文章
    - `human-judgement` TR-4.3: 芒格专区页面不再显示已迁移的文章或显示迁移说明
    - `human-judgement` TR-4.4: 巴菲特专区页面显示新加入的文章

- [x] Task 5: 构建验证与质量检查
  - **Priority**: high
  - **Depends On**: Task 4
  - **Description**:
    - 运行 `npm run build` 确保构建通过
    - 验证所有文章详情页可正常访问
    - 抽样检查迁移文章的链接可正常跳转
  - **Acceptance Criteria Addressed**: 全部
  - **Test Requirements**:
    - `programmatic` TR-5.1: `npm run build` 成功
    - `human-judgement` TR-5.2: 迁移文章的目标链接可正常访问

# Task Dependencies
- Task 1 无依赖
- Task 2 依赖 Task 1
- Task 3 无依赖（可与 Task 1 并行）
- Task 4 依赖 Task 2 和 Task 3
- Task 5 依赖 Task 4
