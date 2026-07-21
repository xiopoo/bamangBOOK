# 全站链接与响应式验证 Spec

## Why
网站目前已完成首页、股东信/合伙人信详情与列表页、概念/公司/人物详情页、知识图谱页、搜索页、阅读历史页等核心页面。随着页面数量增加，链接失效、指向错误以及不同屏幕尺寸下布局错乱的风险上升。需要在上线前进行一次系统性的全站链接有效性与响应式适配审计，形成可执行的问题清单。

## What Changes
- **新增** 全站链接扫描流程：基于 Next.js 路由表与页面内 `<a>`/`<Link>` 链接，自动检测 404、无效跳转、错误指向
- **新增** 响应式适配测试流程：在桌面端（1920×1080、1440×900）、平板端（768×1024）、移动端（375×667、390×844）视口下对关键页面进行截图与布局检查
- **新增** 问题报告：汇总错误链接（位置、类型、目标 URL、所在页面）与响应式问题（设备、视口、页面 URL、现象描述、截图）
- **修复** 审计中发现的 P0/P1 级问题（阻塞性 404、严重布局错乱）

## Impact
- Affected specs: `replicate-target-site`（Task 9: 全站功能验证）
- Affected code: 全站页面与组件，重点包括
  - `src/app/page.tsx`
  - `src/app/letters/page.tsx`、`src/app/letters/[year]/page.tsx`
  - `src/app/partnership/page.tsx`
  - `src/app/concepts/[name]/page.tsx`、`src/app/companies/[name]/page.tsx`、`src/app/people/[name]/page.tsx`
  - `src/app/graph/page.tsx`、`src/app/search/page.tsx`、`src/app/history/page.tsx`
  - `src/components/Nav.tsx`、`src/components/Footer.tsx`

## ADDED Requirements

### Requirement: 全站链接有效性检测
系统 SHALL 扫描网站所有可访问页面及页面内所有链接，识别并记录 404 页面、无效链接、链接指向错误。

#### Scenario: 扫描首页及导航
- **WHEN** 审计首页 `/` 与顶部导航 `Nav.tsx`
- **THEN** 报告中列出所有 `<Link>` 与 `<a>` 的目标 URL，并标记无法访问或返回非 200 状态码的链接

#### Scenario: 扫描内容详情页
- **WHEN** 审计概念、公司、人物详情页以及股东信/合伙人信详情页
- **THEN** 报告中记录由 `[[双括号链接]]`、Markdown 渲染链接、相关年份/相关实体链接导致的 404 或指向错误

#### Scenario: 扫描特殊页面
- **WHEN** 审计 `/graph`、`/search`、`/history`、`/reading`、`/talk` 等特殊页面
- **THEN** 报告这些页面中的链接与路由问题

### Requirement: 响应式适配测试
系统 SHALL 在多种设备视口下访问关键页面，检查是否存在布局错乱、元素重叠、内容截断或显示不全等问题。

#### Scenario: 桌面端测试
- **WHEN** 在 1920×1080 与 1440×900 视口下访问各页面
- **THEN** 页面内容居中、导航正常、无横向滚动、无元素重叠

#### Scenario: 平板端测试
- **WHEN** 在 768×1024 视口下访问各页面
- **THEN** 网格列数合理、文字大小可读、无内容截断

#### Scenario: 移动端测试
- **WHEN** 在 375×667 与 390×844 视口下访问各页面
- **THEN** 导航可点击、卡片不溢出、正文不超出屏幕、无横向滚动

### Requirement: 问题报告生成
系统 SHALL 生成一份结构化问题报告，包含错误链接与响应式问题两类，每类问题记录具体位置、类型、截图（响应式问题）及页面 URL。

## MODIFIED Requirements
无

## REMOVED Requirements
无
