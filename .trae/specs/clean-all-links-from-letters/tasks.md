# Tasks

- [x] Task 1: 编写并执行链接清理脚本：编写一个 Node.js 脚本，对所有 84 篇信件文件执行以下清理操作：
  - [x] SubTask 1.1: 删除第 3 行的 `> 来源：https://learnbuffett.com/...` 引用行
  - [x] SubTask 1.2: 删除文件末尾的 `原文链接：https://learnbuffett.com/...` 行
  - [x] SubTask 1.3: 将 `[文本](https://learnbuffett.com/...)` 格式的内联链接转换为纯文本 `文本`（使用正则替换）
  - [x] SubTask 1.4: 删除数据来源脚注行（`_数据来源：`、`_资料来源：`、`> (2) 来源：` 等模式）
  - [x] SubTask 1.5: 删除分类标签行（独立成行的 `股东信` / `合伙人信`）
  - [x] SubTask 1.6: 删除 SEO 描述副标题行和 HTML 标题残留行
  - [x] SubTask 1.7: 压缩删除行后产生的连续空行，保持排版整洁

- [x] Task 2: 逐篇验证清理结果：对全部 84 篇文件进行自动化验证，确保无残留模式
  - [x] SubTask 2.1: 全量搜索 `learnbuffett.com` 确认结果为 0
  - [x] SubTask 2.2: 全量搜索 `^> 来源：` 确认结果为 0
  - [x] SubTask 2.3: 全量搜索 `^原文链接：` 确认结果为 0
  - [x] SubTask 2.4: 样本抽查 10 篇文件（5 篇股东信 + 5 篇合伙人信，覆盖不同年份），手动检查无异常

- [x] Task 3: 构建验证
  - [x] SubTask 3.1: 运行 `npm run build` 确认无编译错误
  - [x] SubTask 3.2: 确认索引文件中的 wordCount 字段值未受影响

# Task Dependencies
- Task 2 依赖 Task 1
- Task 3 依赖 Task 1、2
