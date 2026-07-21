# Tasks

- [x] Task 1: 修改 `scripts/rebuild-index.js` 添加公司关键词统计
  - [x] SubTask 1.1: 添加 `companyKeywords` 映射，包含66家公司的中英文名称及别名
  - [x] SubTask 1.2: 在 `analyzeLetter` 函数中添加公司匹配逻辑
  - [x] SubTask 1.3: 在 `buildIndex` 函数中添加公司统计收集和排序
  - [x] SubTask 1.4: 运行脚本，验证 `index.json` 中 `companies` 数组非空且 `total.companies` 为68

- [x] Task 2: 修改 `src/app/companies/[name]/page.tsx` 使用 MarkdownContent 组件
  - [x] SubTask 2.1: 导入 `MarkdownContent` 组件替代原生 `ReactMarkdown`
  - [x] SubTask 2.2: 确认 `[[双括号链接]]` 被正确转换为可点击链接

- [x] Task 3: 在公司详情页添加股东信年份链接
  - [x] SubTask 3.1: 从公司Markdown内容中提取所有年份（如1988、1989等）
  - [x] SubTask 3.2: 在页面底部添加"相关股东信"区块，每个年份生成指向 `/letters/{year}` 的链接
  - [x] SubTask 3.3: 验证链接可正确跳转到对应年份的股东信页面

- [x] Task 4: 构建验证与测试
  - [x] SubTask 4.1: 运行 `npm run build` 确认无编译错误
  - [x] SubTask 4.2: 验证首页公司数量显示正确（68家）
  - [x] SubTask 4.3: 验证公司列表页显示引用次数
  - [x] SubTask 4.4: 验证公司详情页 `[[双括号链接]]` 可点击
  - [x] SubTask 4.5: 验证公司详情页股东信年份链接可点击

# Task Dependencies
- Task 2 和 Task 3 可并行（不依赖 Task 1）
- Task 4 依赖 Task 1、Task 2、Task 3
