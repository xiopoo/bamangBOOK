# 内容结构修复 - 实施计划（分解后的优先级任务列表）

## [ ] Task 1: 残缺表格修复（合伙人信 + 文章）
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修复 content/ 目录下所有"有表头分隔符但数据行为纯文本"的残缺表格
  - 涉及文件：
    - `content/partnership/partnership_1962-interim-巴菲特致合伙人信.md`（道指历史数据表，6列，约6行）
    - `content/partnership/partnership_1969-annual-巴菲特致合伙人信.md`（2个收购案例表格，6列，约3-4行）
    - `content/articles/「所有者收益」vs「自由现金流」.md`（资本支出表，3列，约11行）
    - `content/articles/我最看好的股票：人寿保险_1957.md`（保费增长表，2列，约6年）
  - 修复方法：根据表头列数和数据特征（年份开头、百分号结尾、数字模式），将纯文本数据拆分为标准 Markdown 表格行
  - 每个表格修复后需人工核对数据完整性
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-5, AC-7
- **Test Requirements**:
  - `programmatic` TR-1.1: 所有含 `|---|` 的表格，分隔符之后的所有数据行都以 `|` 开头
  - `programmatic` TR-1.2: 每个表格的表头行、分隔符行、数据行的列数（管道符数量）一致
  - `human-judgement` TR-1.3: 人工抽查每个修复表格的数据完整性，数字、文字与原文一致
- **Notes**: 这是 P0 级问题，表格数据无法正确显示严重影响阅读体验

## [ ] Task 2: 股东信高置信度标题提取
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 处理 content/letters/ 下 55 个文件中的 125 个高置信度内嵌标题
  - 提取规则：
    - 段落开头的 2-6 个汉字短语，后直接跟正文（无标点分隔）
    - 典型模式：`纺织业务...`、`保险业务...`、`银行业务...`、`喜诗糖果...`
  - 标题级别规则：
    - 业务板块级（如"纺织业务"、"保险业务"、"银行业务"）→ `## ` (h2)
    - 子板块或子主题（如"保险承保"、"浮存金"、"投资收益"）→ `### ` (h3)
  - 提取后格式：标题独立成行，前后有空行
- **Acceptance Criteria Addressed**: AC-3, AC-4, AC-6, AC-7
- **Test Requirements**:
  - `programmatic` TR-2.1: 高置信度标题列表中的文本 95% 以上出现在标题行（以 # 开头的行）
  - `human-judgement` TR-2.2: 人工抽查 10 篇股东信，标题提取准确无误判
  - `human-judgement` TR-2.3: 正文内容完整连续，无缺失或错乱
- **Notes**: 仅处理高置信度标题，中低置信度暂不处理以避免误判

## [ ] Task 3: 浏览器端渲染验证
- **Priority**: high
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 启动开发服务器，在浏览器中验证修复效果
  - 验证页面：
    - 合伙人信 1962 年中报（表格修复）
    - 合伙人信 1969 年报（表格修复）
    - 文章：「所有者收益」vs「自由现金流」（表格修复）
    - 股东信 1967 / 1968 / 1969（标题提取）
  - 验证维度：
    - 表格是否正确渲染（行列结构、数据对齐）
    - 标题是否正确显示（字号、字重、层级）
    - 暗色模式兼容
    - 移动端适配
- **Acceptance Criteria Addressed**: AC-5, AC-6, AC-7
- **Test Requirements**:
  - `human-judgement` TR-3.1: 桌面端表格渲染正确，行列对齐
  - `human-judgement` TR-3.2: 标题样式正确，层级分明
  - `human-judgement` TR-3.3: 暗色模式下表格和标题显示正常
  - `human-judgement` TR-3.4: 移动端表格可横向滚动，标题适配
- **Notes**: 重点验证数据完整性和格式正确性

## [ ] Task 4: TypeScript / ESLint 检查与收尾
- **Priority**: medium
- **Depends On**: Task 3
- **Description**: 
  - 运行 TypeScript 类型检查（npx tsc --noEmit）
  - 运行 ESLint 检查（npx eslint src --ext .ts,.tsx）
  - 确保无新增错误
  - 清理临时文件和调试信息
- **Acceptance Criteria Addressed**: NFR-4
- **Test Requirements**:
  - `programmatic` TR-4.1: TypeScript 检查 0 error
  - `programmatic` TR-4.2: ESLint 检查 0 error（warning 可接受，只要不是新增的）
- **Notes**: 本轮主要是内容文件修改，预计不会引入代码错误
