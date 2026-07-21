# Markdown内容渲染优化 Spec

## Why
股东信和概念详情页直接显示原始Markdown文本，没有渲染标题、加粗、表格等格式，导致可读性极差。用户需要像对标站点那样，将Markdown正确渲染为HTML，提供良好的阅读体验。

## What Changes
- 股东信详情页：使用ReactMarkdown渲染Markdown内容
- 概念详情页：确保Markdown内容正确渲染
- 添加Markdown样式支持：标题层级、加粗、斜体、列表、表格、引用块、代码块
- 关键词链接：将 `[关键词]` 格式转换为可点击的内部链接

## Impact
- Affected specs: 股东信阅读体验、概念详情页阅读体验
- Affected code:
  - `src/app/letters/[year]/page.tsx` - 股东信详情页
  - `src/app/munger/concept/[name]/page.tsx` - 概念详情页
  - `src/app/globals.css` - 可能需要添加prose样式

## ADDED Requirements

### Requirement: Markdown渲染
系统 SHALL 将Markdown内容正确渲染为HTML，包括：
- 标题（h1-h6）显示为不同大小和样式
- 加粗文本（**text**）显示为粗体
- 斜体文本（*text*）显示为斜体
- 列表（- item 或 1. item）显示为有序/无序列表
- 表格显示为格式化的表格
- 引用块（> text）显示为引用样式
- 代码块显示为代码样式

#### Scenario: 用户阅读股东信
- **WHEN** 用户打开某年份股东信页面
- **THEN** 页面显示渲染后的HTML内容，标题清晰、段落分明、表格格式化

### Requirement: 关键词内部链接
系统 SHALL 将股东信中的 `[关键词]` 格式转换为可点击的内部链接，链接到对应的概念详情页。

#### Scenario: 用户点击关键词
- **WHEN** 用户在股东信中看到带链接的关键词（如 `[内在价值]`）
- **THEN** 点击后跳转到该概念的详情页

### Requirement: 表格渲染
系统 SHALL 正确渲染Markdown表格，包括表头、表格线、单元格对齐。

#### Scenario: 用户查看包含表格的股东信
- **WHEN** 股东信包含Markdown表格
- **THEN** 表格以清晰的格式显示，有表头分隔线、单元格边框

## MODIFIED Requirements
无

## REMOVED Requirements
无