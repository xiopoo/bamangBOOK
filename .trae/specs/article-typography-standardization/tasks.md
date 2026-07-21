# 网站文章排版标准化改进 - 任务列表

- [ ] Task 1: 建立 PDF 与 MD 排版要素对应关系表
  - [ ] SubTask 1.1: 收集并整理 PDF 原版的字体、段落、标题、列表、表格、图片、特殊格式样本
  - [ ] SubTask 1.2: 在 spec 目录下创建 `pdf-to-md-mapping.md`，明确各排版属性的目标参数
  - [ ] SubTask 1.3: 定义标题 H1-H6 的目标字体大小、字重、颜色、上下间距
  - [ ] SubTask 1.4: 定义表格单元格 padding、边框、列间距、表头背景等目标参数

- [ ] Task 2: 制定统一标题样式规范并扩展 MarkdownContent 组件
  - [ ] SubTask 2.1: 在 MarkdownContent.tsx 中为 h4/h5/h6 添加统一渲染组件
  - [ ] SubTask 2.2: 调整 h2/h3 样式，确保各级标题大小、间距、颜色层级清晰
  - [ ] SubTask 2.3: 在 globals.css 中同步或覆盖 prose 标题样式，保证组件样式与全局样式一致
  - [ ] SubTask 2.4: 验证标题与正文段落之间有明确视觉分隔

- [ ] Task 3: 设计跨平台兼容的表格样式方案
  - [ ] SubTask 3.1: 调整 MarkdownContent.tsx 中 table/th/td 的 padding、边框、字体大小
  - [ ] SubTask 3.2: 在 globals.css 中为表格增加跨平台字体回退和间距兜底样式
  - [ ] SubTask 3.3: 针对 macOS 下表格列间隔问题进行重点优化（如增加边框对比度或单元格 padding）
  - [ ] SubTask 3.4: 在 Windows 和 macOS 环境下分别使用 Chrome、Firefox、Safari、Edge 进行显示对比

- [ ] Task 4: 选取典型文章样本进行排版优化试点
  - [ ] SubTask 4.1: 选择包含 H1-H6、表格、列表、图片、引用、加粗/斜体等元素的典型文章
  - [ ] SubTask 4.2: 根据 PDF 原版对试点 Markdown 文件进行格式优化（段落缩进、列表缩进、图片位置等）
  - [ ] SubTask 4.3: 使用试点文章验证 MarkdownContent 与 globals.css 的渲染效果
  - [ ] SubTask 4.4: 将试点文章渲染结果与 PDF 原版进行视觉对比，记录差异

- [ ] Task 5: 根据试点结果调整优化方案并形成标准化模板
  - [ ] SubTask 5.1: 汇总试点阶段发现的样式与格式问题
  - [ ] SubTask 5.2: 调整 MarkdownContent.tsx 和 globals.css 中的参数
  - [ ] SubTask 5.3: 在 spec 目录下创建 `typography-template.md`，包含 Markdown 编写与样式应用规范
  - [ ] SubTask 5.4: 定义可批量应用的 Markdown 格式规则（段落分隔、列表符号、图片语法等）

- [ ] Task 6: 批量应用标准化模板到全部文章
  - [ ] SubTask 6.1: 扫描 content/ 下所有 Markdown 文件，识别不符合模板规范的格式
  - [ ] SubTask 6.2: 编写并运行批量处理脚本，统一段落分隔、标题符号、列表缩进等
  - [ ] SubTask 6.3: 对包含表格的文章进行重点检查和手动修复
  - [ ] SubTask 6.4: 验证批量处理后的文件无 Markdown 语法错误

- [ ] Task 7: 建立排版效果验收标准并完成质量检查
  - [ ] SubTask 7.1: 制定验收检查表（标题层级、表格一致性、PDF 匹配度、浏览器一致性）
  - [ ] SubTask 7.2: 抽样检查不同分类（partnership、letters、articles、interviews、talks、qa）的文章
  - [ ] SubTask 7.3: 在 macOS 与 Windows 环境下进行浏览器显示一致性验证
  - [ ] SubTask 7.4: 汇总验收结果并修复未达标项

- [x] Task 8: 删除巴菲特资料中的"每年的大事记"部分
  - [x] SubTask 8.1: 从 [content/yearly-events.md](file:///Users/lucas/Documents/bamangB/bamangBOOK/content/yearly-events.md) 中提取并备份原始事件数据 → 已备份到 `yearly-events.bak.md`
  - [x] SubTask 8.2: 清空 [content/yearly-events.md](file:///Users/lucas/Documents/bamangB/bamangBOOK/content/yearly-events.md) → 已清空，替换为占位注释
  - [x] SubTask 8.3: 从页面中移除 YearlyEvents 组件引用 → 已移除
  - [x] SubTask 8.4: 从 [partnership/​[id]/page.tsx](file:///Users/lucas/Documents/bamangB/bamangBOOK/src/app/partnership/[id]/page.tsx) 和 [letters/​[year]/page.tsx](file:///Users/lucas/Documents/bamangB/bamangBOOK/src/app/letters/[year]/page.tsx) 中移除 `YearlyEvents` → 已完成

- [x] Task 9: 修正大事记中年份与事件对应错误
  - [x] SubTask 9.1: 全量扫描 [content/yearly-events.bak.md](file:///Users/lucas/Documents/bamangB/bamangBOOK/content/yearly-events.bak.md)，识别所有年份与事件不匹配的记录 → 识别出 17 条错位事件
  - [x] SubTask 9.2: 建立修正清单 → 已创建 [year-correction-manifest.md](file:///Users/lucas/Documents/bamangB/bamangBOOK/.trae/specs/article-typography-standardization/year-correction-manifest.md)
  - [x] SubTask 9.3: 将每条错位事件移动到正确的 `## YYYY年` 段落 → 17 条全部移动到位，新增 3 个年份段落（1609、1970、1974）
  - [x] SubTask 9.4: 验证修正后所有事件的年份归属正确无误 → 构建验证通过

# Task Dependencies
- Task 1 → Task 2, Task 3（排版参数是样式开发的基础）
- Task 2, Task 3 → Task 4（样式完成后才能试点）
- Task 4 → Task 5（试点结果驱动模板调整）
- Task 5 → Task 6（模板确定后才能批量处理）
- Task 6 → Task 7（全部文章处理完成后验收）
- Task 1, Task 7 → Task 8（了解整体数据结构后才能安全移除大事记）
- Task 8 → Task 9（移除大事记后，对保留的事件数据进行年份纠错，两者可互换顺序但推荐先删后改）