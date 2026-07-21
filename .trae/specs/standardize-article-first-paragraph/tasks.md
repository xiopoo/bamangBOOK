# Tasks

## Task 1: 审计扫描 — 识别所有文章首页标题重复问题

- [x] SubTask 1.1: 扫描 `content/articles/` 目录下所有文件，识别 H1 标题后第一段中的标题重复情况
- [x] SubTask 1.2: 扫描 `content/qa/` 目录下所有文件，识别首段标题重复情况
- [x] SubTask 1.3: 扫描 `content/talks/` 和 `content/interviews/` 目录下所有文件，识别首段标题重复情况
- [x] SubTask 1.4: 汇总所有存在标题重复的文件列表（共 105 个文件），标注重复模式（无空格/有空格）

## Task 2: 审计扫描 — 识别问答页面数量

- [x] SubTask 2.1: 确认 `content/qa/` 下所有问答文件的数量和文件名（51 个文件）
- [x] SubTask 2.2: 确认 `## 数字，` 格式的问题在每个文件中的行号和数量（共 559 个问题）

## Task 3: 首段标题去重处理

- [x] SubTask 3.1: 为 `content/articles/` 下 44 个存在标题重复的文件执行去重
- [x] SubTask 3.2: 为 `content/qa/` 下 45 个存在标题重复的文件执行去重
- [x] SubTask 3.3: 为 `content/talks/` 和 `content/interviews/` 下 16 个存在标题重复的文件执行去重
- [x] SubTask 3.4: 验证去重后的内容完整性和语义准确性

## Task 4: 问答问题样式增强

- [x] SubTask 4.1: 在 `src/components/MarkdownContent.tsx` 中添加 `isQA` prop 判断机制
- [x] SubTask 4.2: 修改 Markdown 渲染组件，为问答页面的 H2 问题标题添加 Q 标记和背景色
- [x] SubTask 4.3: 在 `src/app/qa/[id]/page.tsx` 中传递 `isQA={true}` 参数
- [x] SubTask 4.4: 验证普通文章页面的 H2 标题不受影响

## Task 5: 整体验证

- [x] SubTask 5.1: 启动开发服务器，检查 3-5 篇修改过首段的文章渲染效果（全部 200 OK）
- [x] SubTask 5.2: 检查 3-5 个问答页面的问题样式增强效果（Q 标记渲染正常）
- [x] SubTask 5.3: 检查 2-3 个演讲/访谈页面的渲染效果（全部 200 OK）
- [x] SubTask 5.4: 运行 `npm run build` 确认无编译错误（构建成功）

# Task Dependencies

- Task 1 和 Task 2 无依赖，可并行执行
- Task 3 依赖 Task 1
- Task 4 依赖 Task 2
- Task 5 依赖 Task 3 和 Task 4
