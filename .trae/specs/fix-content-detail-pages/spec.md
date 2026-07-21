# 内容详情页渲染修复 Spec

## Why
当前网站核心内容详情页存在严重的渲染缺陷：概念详情页（`concepts/[name]`）的 ReactMarkdown 自定义组件全部缺失 `{children}`，导致 Markdown 正文无法显示；人物详情页（`people/[name]`）完全没有读取 `content/people/` 下的 Markdown 文件，仅展示占位文案。这两个问题直接阻止用户访问网站的核心知识内容，属于最高优先级的功能阻塞缺陷。

## What Changes
- **修复** 概念详情页 ReactMarkdown 自定义组件缺少 `{children}` 的问题，恢复正文渲染
- **重构** 人物详情页，读取 `content/people/{name}.md` 并通过统一的 Markdown 组件渲染
- **优化** 公司详情页，应用与概念/人物/股东信一致的排版样式和 [[双括号链接]] 处理
- **提取** 公共 Markdown 渲染组件，减少 `concepts`、`companies`、`people` 三个页面的重复代码
- **统一** 内容详情页的视觉风格：标题、段落间距、引用块、列表、链接颜色

## Impact
- Affected specs: `replicate-target-site`（内容页面重构 Task 3/4/5）
- Affected code:
  - `src/app/concepts/[name]/page.tsx`
  - `src/app/companies/[name]/page.tsx`
  - `src/app/people/[name]/page.tsx`
  - `src/components/LetterReader.tsx`（已有正确渲染逻辑，可作为参考）
  - 新增 `src/components/MarkdownContent.tsx`（公共组件）

## ADDED Requirements

### Requirement: 内容详情页可正常阅读
每个内容详情页 SHALL 正确渲染对应 Markdown 文件的全部内容，包括标题、段落、引用块、列表、加粗、斜体、表格和 [[双括号链接]]。

#### Scenario: 概念详情页
- **WHEN** 用户访问 `/concepts/内在价值`
- **THEN** 页面展示概念 Markdown 文件的完整正文，而非空白或仅有统计卡片

#### Scenario: 人物详情页
- **WHEN** 用户访问 `/people/沃伦·巴菲特`
- **THEN** 页面读取 `content/people/沃伦·巴菲特.md` 并渲染完整内容；若文件不存在，则展示友好提示

#### Scenario: 公司详情页
- **WHEN** 用户访问 `/companies/可口可乐`
- **THEN** 页面使用统一的排版样式渲染 Markdown，链接、标题、段落视觉风格与概念/股东信页面一致

## MODIFIED Requirements

### Requirement: 概念详情页视觉样式
保留现有橙色主题统计卡片和相关年份区块，正文区域改用统一的 Markdown 渲染组件。

### Requirement: 人物详情页数据展示
在现有统计卡片和别名展示基础上，新增 Markdown 正文区域，保持人物页面的紫色主题。

### Requirement: 公司详情页数据展示
在现有蓝色主题统计卡片和相关年份区块基础上，正文区域改用统一的 Markdown 渲染组件。

## REMOVED Requirements
无
