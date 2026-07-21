# 网站文章排版标准化改进方案 Spec

## Why
当前网站文章在 Markdown 渲染为 HTML 后，存在段落标题层级不突出、表格跨平台显示不一致、整体排版与 PDF 原版差异较大的问题。需要制定并实施一套系统性的排版标准，使 MD 版本在视觉层级、表格呈现和整体阅读体验上接近 PDF 原版。

## What Changes
- **标题层级样式统一**：为 H1-H6 建立明确的字体大小、字重、颜色、上下间距规范，使标题与正文在视觉上清晰分离。
- **表格跨平台一致性修复**：调整表格单元格 padding、边框、间距，重点优化 macOS 下的列间隔和整体对齐，确保 Windows 与 macOS 显示一致。
- **PDF 排版还原映射**：建立 PDF 原版与 MD 渲染之间的字体、段落、列表、图片、特殊格式对应关系表，作为批量优化依据。
- **标准化模板与批量处理**：基于试点文章形成可复用的排版模板，并应用到全部文章渲染逻辑。
- **多浏览器验收**：确保优化后在 Chrome、Firefox、Safari、Edge 中显示一致。
- **删除巴菲特资料中的"每年的大事记"部分**：从巴菲特相关页面中移除 `YearlyEvents` 组件引用，清理相关数据文件和工具函数。
- **修正大事记年份与事件对应错误**：梳理 [content/yearly-events.md](file:///Users/lucas/Documents/bamangB/bamangBOOK/content/yearly-events.md) 中全部事件记录，确保每条事件准确关联到正确的年份。

## Impact
- Affected specs: 所有涉及文章渲染的历史 spec（enhance-section-headings、table-standardization、pdf-format-fix 等）
- Affected code:
  - [src/components/MarkdownContent.tsx](file:///Users/lucas/Documents/bamangB/bamangBOOK/src/components/MarkdownContent.tsx)
  - [src/app/globals.css](file:///Users/lucas/Documents/bamangB/bamangBOOK/src/app/globals.css)
  - 内容页面：[src/app/talks/​[id]/page.tsx](file:///Users/lucas/Documents/bamangB/bamangBOOK/src/app/talks/[id]/page.tsx)、[src/app/interviews/​[id]/page.tsx](file:///Users/lucas/Documents/bamangB/bamangBOOK/src/app/interviews/[id]/page.tsx)、[src/app/articles/​[id]/page.tsx](file:///Users/lucas/Documents/bamangB/bamangBOOK/src/app/articles/[id]/page.tsx) 等
  - 内容源文件：content/ 下全部 Markdown 文件

### Requirement: 删除巴菲特资料中的"每年的大事记"
The system SHALL remove the Yearly Events section from all Buffett-related pages.

#### Scenario: 浏览巴菲特相关文章
- **WHEN** 用户打开合伙人信或股东信详情页
- **THEN** 不再显示"年度大事记"补充栏目，且 `YearlyEvents` 组件、`yearly-events.ts` 工具函数、`yearly-events.md` 数据文件被清理或解耦

### Requirement: 修正大事记年份与事件对应关系
The system SHALL ensure all events in the yearly events data are correctly associated with their actual occurrence year.

#### Scenario: 审核事件年份准确性
- **WHEN** 审核 `content/yearly-events.md` 中的每条记录
- **THEN** 事件标题或描述中提及的年份与所属 `## YYYY年` 段落年份一致，不存在跨年份错位（如 2023 年段落中出现 1609 年、1973 年等事件）

## ADDED Requirements

### Requirement: 标题层级视觉分离
The system SHALL provide distinct visual hierarchy for H1-H6 headings rendered from Markdown.

#### Scenario: 正常文章渲染
- **WHEN** 用户打开任意文章详情页
- **THEN** 各级标题具备独立可辨的字体大小、字重、颜色、上下间距，并与正文段落形成明确分隔

### Requirement: 表格跨平台一致显示
The system SHALL render Markdown tables consistently across Windows and macOS.

#### Scenario: 跨系统浏览
- **WHEN** 用户在 Windows 或 macOS 的 Chrome/Firefox/Safari/Edge 中查看含表格的文章
- **THEN** 表格单元格 padding、边框、列间距保持一致，列与列之间有清晰视觉间隔

### Requirement: PDF 排版映射与还原
The system SHALL establish and apply a mapping table between PDF original layout and Markdown rendered output.

#### Scenario: 排版对比验收
- **WHEN** 将优化后的 MD 文章与对应 PDF 原版进行视觉对比
- **THEN** 字体样式、段落格式、标题层级、列表缩进、图片位置、特殊文本格式等关键要素匹配度达到 95% 以上

## MODIFIED Requirements

### Requirement: MarkdownContent 组件样式
[MarkdownContent.tsx](file:///Users/lucas/Documents/bamangB/bamangBOOK/src/components/MarkdownContent.tsx) 当前为 h2/h3 提供了自定义样式，但缺少 h4/h5/h6 处理。本 spec 将扩展组件以支持全部六级标题的统一渲染，并调整表格相关组件样式。

### Requirement: 全局 prose 样式
[globals.css](file:///Users/lucas/Documents/bamangB/bamangBOOK/src/app/globals.css) 已包含 prose 基础样式。本 spec 将细化标题与表格的 CSS 参数，确保跨平台兼容性。

## REMOVED Requirements
无移除项。