# Tasks

> **合并说明**：本任务已并入 [`replicate-target-site`](../replicate-target-site/) 的「前置阶段：内容基础（Task 0）」。以下任务清单保留作为历史记录。

- [ ] Task 1: 内容来源摸排与验证
  - [x] SubTask 1.1: 列出content/letters/下所有文件及其年份 - 63个文件（berkshire_1956~2025 + 1963合伙人信）
  - [x] SubTask 1.2: 列出content/partnership/下所有文件及其年份 - 35个文件（1956-1970）
  - [x] SubTask 1.3: 检查API能否正确读取并返回所有年份内容 - 通过
  - [x] SubTask 1.4: 标记缺失年份（若有） - 无缺失

- [x] Task 2: 合伙人信API支持
  - [x] SubTask 2.1: 修改API路由，使之能读取content/partnership/目录
  - [x] SubTask 2.2: 支持年份范围1956-1969的合伙人信读取
  - [x] SubTask 2.3: 支持多封同一年份的合伙人信（如1963年有4封）

- [x] Task 3: 内容展示排版优化
  - [x] SubTask 3.1: **核心修复** - ReactMarkdown自定义组件添加`{children}`渲染（h2/h3/p/ul/ol/li/blockquote/th/td等组件此前使用自闭合标签导致内容不可见）
  - [x] SubTask 3.2: 优化标题层级样式（h2 > text-xl font-serif, h3 > text-lg）
  - [x] SubTask 3.3: 引用块（blockquote）中文样式美化
  - [x] SubTask 3.4: 列表展示样式（ul/ol缩进与符号）
  - [x] SubTask 3.5: [[双括号链接]]渲染优化

- [x] Task 4: 缺失内容IMA同步
  - [x] SubTask 4.1: 检查IMA巴菲特知识库中有无内容 - 已检查，内容与本地一致
  - [x] SubTask 4.2: 如有缺失，从IMA下载补充 - 无需补充
  - [x] SubTask 4.3: 更新content/letters/对应文件 - 无需更新

- [x] Task 5: 质量验证
  - [x] SubTask 5.1: 逐年份验证API返回内容 - 测试12个年份全部通过
  - [x] SubTask 5.2: 验证渲染效果（布局、间距、格式） - 已修复核心渲染缺陷
  - [x] SubTask 5.3: 验证合伙人信多版本支持 - 1962/1963/1965/1967年多文件返回正常

## Task Dependencies
- Task 1 独立 ✅
- Task 2 依赖 Task 1 ✅
- Task 3 可并行（依赖 Task 1）✅
- Task 4 依赖 Task 1 ✅
- Task 5 依赖 Task 2,3,4 ✅
