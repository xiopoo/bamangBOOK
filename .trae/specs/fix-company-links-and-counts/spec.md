# 修复公司引用数量与链接功能 Spec

## Why
首页公司引用数量显示为0，公司详情页的`[[双括号链接]]`无法点击，且公司页面缺少指向具体股东信的链接。这三个问题导致用户无法正常浏览公司相关内容。

## What Changes
- 修改 `scripts/rebuild-index.js`：添加公司关键词映射，统计66家公司在股东信中的引用次数和年份
- 修改 `src/app/companies/[name]/page.tsx`：使用 `MarkdownContent` 组件替代原生 `ReactMarkdown`，使 `[[双括号链接]]` 可点击
- 修改 `src/app/companies/[name]/page.tsx`：从公司Markdown内容中提取年份，生成指向 `/letters/{year}` 的股东信链接
- 重新运行索引重建脚本，更新 `content/index.json`

## Impact
- Affected code: `scripts/rebuild-index.js`, `src/app/companies/[name]/page.tsx`, `content/index.json`
- Affected pages: 首页（公司数量统计）、公司列表页、公司详情页

## ADDED Requirements
### Requirement: 公司引用统计
系统 SHALL 在索引重建时统计每家公司在股东信中的引用次数和出现年份，并写入 `index.json` 的 `companies` 数组。

#### Scenario: 首页显示正确的公司引用数量
- **WHEN** 用户访问首页
- **THEN** 公司统计卡片显示正确的公司总数（66家）
- **AND** 重要公司TOP15列表显示每家公司的引用次数

#### Scenario: 公司列表页显示引用次数
- **WHEN** 用户访问 `/companies` 页面
- **THEN** 每家公司卡片下方显示"提及 N 次"

### Requirement: 公司详情页双括号链接可点击
系统 SHALL 在公司详情页中将 `[[概念名]]` 转换为指向 `/concepts/{概念名}` 的可点击链接。

#### Scenario: 点击公司页面中的概念链接
- **WHEN** 用户在公司详情页点击 `[[护城河]]` 链接
- **THEN** 页面跳转到 `/concepts/护城河`

### Requirement: 股东信年份链接
系统 SHALL 在公司详情页中将提及的年份（如"1988年股东信"）转换为指向 `/letters/{year}` 的可点击链接。

#### Scenario: 点击股东信年份链接
- **WHEN** 用户在公司详情页点击"1988年"链接
- **THEN** 页面跳转到 `/letters/1988`
