# 网站内容准确性审计与差异对比 - 任务列表

- [x] Task 1: 2024 年股东大会实录芒格引用专项审计
  - **Priority**: high
  - **Depends On**: None
  - **Description**:
    - 逐行读取 `content/qa/伯克希尔股东大会实录_2024.md`，标记所有 132 次芒格引用
    - 分类三类引用：
      a) 致敬影片中的档案片段（1885-2022 年历史剪辑）
      b) 巴菲特现场对芒格的缅怀和提及
      c) 其他引用
    - 检查是否有任何行暗示芒格仍在世（如"芒格今天说"等现在时态）
    - 检查是否有对读者的背景说明（如"芒格于 2023 年 11 月 28 日去世，以下为致敬影片中的档案片段"）
    - 记录标题行"20242024"格式错误
    - 对比原始官方转录（如有），验证内容准确性
  - **Acceptance Criteria Addressed**: AC-2024 年会芒格引用审计
  - **Test Requirements**:
    - `programmatic` TR-1.1: 列出所有 132 次芒格提及的位置和上下文
    - `human-judgement` TR-1.2: 判断每次引用的分类（档案/现场/其他）
    - `programmatic` TR-1.3: 标题"20242024"格式错误已记录

- [ ] Task 2: 所有 Q&A 文件全面内容审查
  - **Priority**: high
  - **Depends On**: Task 1
  - **Description**:
    - 扫描 `content/qa/` 下所有 50 篇文件：
      - 1986-2025 年股东大会实录
      - Wesco 股东大会 1996/2001/2002/2004/2005/2006/2008/2009/2011
      - 股东大会发布会 2009
      - 慈善中国行 2010
    - 检查每篇文章中：
      - 是否有对已故人物的错误时态引用
      - 时间线标注是否清晰
      - 人物事实是否准确
    - 特别关注 2025 年股东大会（如果有），检查对芒格去世的处理
  - **Acceptance Criteria Addressed**: AC-内容矛盾点识别
  - **Test Requirements**:
    - `programmatic` TR-2.1: 列出所有 Q&A 文件中的人物引用问题
    - `human-judgement` TR-2.2: 评估每个问题的严重程度

- [ ] Task 3: 全站内容一致性交叉对比
  - **Priority**: medium
  - **Depends On**: None
  - **Description**:
    - 对比 `content/articles/`、`content/people/`、`content/talks/`、`content/interviews/` 中的人物信息一致性：
      - 巴菲特出生年份、教育背景、职业生涯节点
      - 芒格出生年份、去世年份、与巴菲特的合作历程
      - 伯克希尔关键事件日期（收购 BNSF、GEICO、苹果等）
    - 检查 people/ 目录中人物传记是否有已故人物未标注去世信息的情况
    - 检查 companies/ 目录中公司收购/出售状态是否已更新
  - **Acceptance Criteria Addressed**: AC-内容矛盾点识别
  - **Test Requirements**:
    - `programmatic` TR-3.1: 列出所有跨文件矛盾点
    - `human-judgement` TR-3.2: 对照权威来源确定正确版本

- [x] Task 4: 格式与元数据审查
  - **Priority**: medium
  - **Depends On**: None
  - **Description**:
    - 检查所有内容文件中的标题格式问题（如"20242024"连写）
    - 检查索引 JSON（qa-index.json、talks-index.json、interviews-index.json、articles-index.json）与文件内容的匹配度
    - 检查文件分类（article/qa/talk/interview）与实际内容格式是否一致
    - 检查文件内容中是否存在奇怪的格式问题（如空格、换行异常等）
  - **Acceptance Criteria Addressed**: AC-差异对比报告
  - **Test Requirements**:
    - `programmatic` TR-4.1: 列出所有格式问题
    - `programmatic` TR-4.2: 列出索引与文件不匹配的问题

- [x] Task 5: 生成差异对比报告
  - **Priority**: high
  - **Depends On**: Task 1, Task 2, Task 3, Task 4
  - **Description**:
    - 汇总所有任务发现的问题
    - 输出格式化报告到 `.trae/specs/content-accuracy-audit/diff-report.md`
    - 每条记录格式：
      ```markdown
      ## [严重程度] 问题标题
      - **位置**: content/qa/xxx.md#L123
      - **错误内容**: xxx
      - **正确版本**: xxx
      - **说明**: xxx
      ```
    - 严重程度分级：
      - **严重**: 事实错误（如错误日期、错误人物归属）
      - **中等**: 格式问题或缺失背景说明
      - **轻微**: 排版/标点/一致性微调
  - **Acceptance Criteria Addressed**: AC-差异对比报告
  - **Test Requirements**:
    - `programmatic` TR-5.1: 报告文件存在且格式完整
    - `programmatic` TR-5.2: 报告中每条记录包含位置、错误内容、正确版本

# Task Dependencies
- Task 1 无依赖
- Task 2 依赖 Task 1（可部分并行）
- Task 3 无依赖（可与 Task 1、2 并行）
- Task 4 无依赖（可与 Task 1、2、3 并行）
- Task 5 依赖 Task 1、2、3、4
