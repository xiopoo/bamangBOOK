# 章节标题增强 - 产品需求文档

## Overview
- **Summary**: 为合伙信、股东信、文章等内容页面添加适当的层级章节标题，使用语义化 HTML 标题标签（h1-h6）组织内容，提升可读性和设计一致性。
- **Purpose**: 解决当前内容页面缺少结构化章节标题的问题，使内容组织更清晰、导航更便捷。
- **Target Users**: 所有访问复利书房内容页面的读者。

## Goals
- 为合伙信页面（/partnership/[id]）添加完整的层级章节标题
- 为股东信页面（/letters/[year]）添加完整的层级章节标题
- 为文章页面（/articles/[id]）添加完整的层级章节标题
- 确保所有页面的章节标题样式一致
- 使用语义化的 HTML 标题标签（h1-h6）遵循最佳实践

## Non-Goals (Out of Scope)
- 修改内容文件的实际文字内容（仅添加标题结构）
- 修改网站整体设计风格
- 添加新的页面功能或组件

## Background & Context
- 当前合伙信、股东信等内容页面的 markdown 文件中，部分章节缺少标题标签（如"复利的哀伤"、"关于分散"等段落）
- 现有页面使用 ArticleContent 或 LetterReader 组件渲染 markdown 内容
- markdown 内容中已有部分 h1/h2 标题，但缺少完整的层级结构
- 用户反馈页面内容缺乏清晰的组织和导航

## Functional Requirements
- **FR-1**: 在合伙信页面添加层级章节标题，包括：年度业绩、基金公司、投资情况进展、分散投资、其他事项等
- **FR-2**: 在股东信页面添加层级章节标题，保持与合伙信一致的结构
- **FR-3**: 在文章页面添加层级章节标题，根据文章内容自动生成
- **FR-4**: 章节标题应使用语义化的 HTML 标签（h2-h4），遵循层级结构
- **FR-5**: 所有页面的章节标题样式保持一致

## Non-Functional Requirements
- **NFR-1**: 章节标题应清晰、描述性强，符合内容主题
- **NFR-2**: 标题层级应合理，不跳过级别（如 h2 后直接 h4）
- **NFR-3**: 样式应与现有设计体系一致，保持视觉连贯性

## Constraints
- **Technical**: 必须在现有组件框架内实现，使用 TailwindCSS 进行样式设计
- **Dependencies**: 依赖现有的 ArticleContent、LetterReader、MarkdownContent 组件

## Assumptions
- 内容文件的 markdown 结构可以通过组件层进行增强，无需修改原始 markdown 文件
- 现有组件支持自定义渲染规则

## Acceptance Criteria

### AC-1: 合伙信页面章节标题
- **Given**: 用户访问 /partnership/[id] 页面
- **When**: 页面加载完成
- **Then**: 内容区域显示清晰的层级章节标题（h2-h4），包括年度业绩、基金公司、投资情况进展等主要部分
- **Verification**: `human-judgment`
- **Notes**: 标题应与内容主题对应，样式与页面其他元素协调

### AC-2: 股东信页面章节标题
- **Given**: 用户访问 /letters/[year] 页面
- **When**: 页面加载完成
- **Then**: 内容区域显示清晰的层级章节标题（h2-h4），结构与合伙信页面保持一致
- **Verification**: `human-judgment`

### AC-3: 文章页面章节标题
- **Given**: 用户访问 /articles/[id] 页面
- **When**: 页面加载完成
- **Then**: 内容区域显示清晰的层级章节标题（h2-h4），根据文章内容自动生成
- **Verification**: `human-judgment`

### AC-4: 标题样式一致性
- **Given**: 用户在不同内容页面间切换
- **When**: 查看各页面的章节标题
- **Then**: 所有页面的章节标题样式保持一致，包括字体大小、颜色、间距等
- **Verification**: `human-judgment`

## Open Questions
- [ ] 是否需要为所有 markdown 内容文件添加标题，还是仅在组件层处理？
- [ ] 章节标题是否需要添加锚点链接支持？
- [ ] 是否需要修改目录组件（ArticleTableOfContents）以支持新的标题结构？