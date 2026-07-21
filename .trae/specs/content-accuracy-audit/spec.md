# 网站内容准确性审计与差异对比

## Why
网站内容经过多次爬取、格式转换、重新分类等操作，可能存在原文与最终呈现版本之间的信息偏差。特别是"伯克希尔股东大会实录 2024"中包含对已故人物芒格的引用，需要核实是否被正确标注为纪念/档案素材而非现场出席。需要通过系统性的原文-发布版对比审计，识别并修正所有信息矛盾点。

## What Changes

### 1. 2024 年股东大会内容专项审计
- 严格核查文件中所有引用芒格（132 次提及）的上下文：
  - 区分哪些来自致敬影片（档案素材）vs 现场引用
  - 确认所有芒格发言都有恰当的年代背景标注
  - 检查是否有暗示芒格仍在世的表述
- 修正标题行"20242024"连写格式错误
- 确认全文时间线标注清晰（档案片段与现场内容分离）

### 2. 所有 Q&A 文件全面审查
- 逐篇审查 `content/qa/` 下所有 50 篇文件：
  - 2025 年股东大会（是否有对芒格安息/已故事实的处理）
  - 1986-2024 年股东大会（时间线、人物引用是否准确）
  - Wesco 股东大会系列（是否标注芒格去世后不再更新）
  - 其他 Q&A 格式内容
- 检查是否存在向读者揭示"芒格于 2023 年 11 月 28 日去世"的背景说明

### 3. 内容一致性检查（所有内容目录）
- 对比 `content/articles/`、`content/talks/`、`content/interviews/` 中的人物信息：
  - 巴菲特和芒格的生平关键数据是否一致
  - 同一事件在不同文章中的描述是否一致
  - 重要日期、金额、百分比等数据是否准确
- 检查 companies/ 目录中公司描述是否与现实一致
- 检查 people/ 目录中人物传记是否有已故人物未标注的情况

### 4. 格式与元数据审查
- 标题格式检查（如"20242024"连写）
- 索引 JSON 与文件内容的匹配度
- 文章分类（qa/article/talk/interview）与实际内容格式的匹配度

## Impact
- Affected code: 审计报告阶段仅分析不修改；后续修正阶段影响 `content/qa/`、`content/articles/`、`content/talks/`、`content/interviews/` 中的内容文件
- Deliverable: 差异对比报告（diff-report.md），包含每个问题的位置、错误内容、正确版本

## ADDED Requirements

### Requirement: 2024 年会芒格引用审计
The system SHALL verify all Munger references in the 2024 annual meeting transcript.

#### Scenario: 审计所有芒格引用
- **WHEN** 扫描 2024 年股东大会实录中所有 132 次芒格提及
- **THEN** 区分档案引用 vs 现场引用
- **THEN** 确认没有暗示芒格仍在世的错误表述
- **THEN** 记录所有需要补充背景说明的位置

### Requirement: 内容矛盾点识别
The system SHALL identify all factual inconsistencies across the content library.

#### Scenario: 交叉对比
- **WHEN** 对比同一人物/事件/数据在不同文章中的描述
- **THEN** 标记所有矛盾点
- **THEN** 对照原始材料（PDF、官方转录等）确定正确版本

### Requirement: 差异对比报告
The system SHALL produce a detailed diff report.

#### Scenario: 生成报告
- **WHEN** 审计完成
- **THEN** 输出格式化的差异报告（diff-report.md）
- **THEN** 每条差异包含：文件位置、行号、错误内容、正确版本、严重程度

## 验收标准
- 2024 年股东大会实录中所有芒格引用已完成审计，并标注了哪些来自档案素材
- 所有 Q&A 文件（50 篇）已完成审查
- 差异对比报告覆盖全部内容目录
- 报告中的每条记录格式完整（位置、错误、正确版本）
- 2024 年文件标题"20242024"格式错误已被记录
