# 股东信内容填充与展示优化 Spec

> **合并说明**：本 Spec 的内容与成果已并入 [`replicate-target-site`](../replicate-target-site/) 统一任务中，作为其「前置阶段：内容基础」。后续相关开发、验证与跟踪请在 `replicate-target-site` Spec 下进行。

## Why
当前股东信页面仅展示年份列表，用户查看详情时需等待API请求。虽内容文件已存在，但需要：确保所有年份内容可获取、优化展示格式、提升阅读体验。

## What Changes
- **确保** 所有62封股东信(1965-2025)和35封合伙人信(1956-1970)内容可通过API获取
- **优化** ReactMarkdown配置，提升中文排版效果
- **强化** 格式渲染：段落间距、标题层级、引用块样式、列表展示
- **验证** 所有年份内容完整可读

## Impact
- Affected code:
  - `src/app/api/letter/[year]/route.ts` - 内容读取逻辑验证
  - `src/app/api/letter/[year]/route.ts` - 合伙人信支持
  - `src/app/letters/[year]/page.tsx` - 排版优化
  - `content/letters/` - 内容文件（已存在）

## ADDED Requirements

### Requirement: 合伙人信支持
系统 SHALL 支持从 content/partnership/ 目录读取合伙人信内容。

#### Scenario: 合伙人信访问
- **WHEN** 用户访问年份在1956-1969之间的信件
- **THEN** 系统自动从 partnership/ 目录加载内容

### Requirement: 内容渲染优化
系统 SHALL 将Markdown内容渲染为适合中文阅读的网页格式。

#### Scenario: 段落展示
- **WHEN** 渲染信件内容
- **THEN** 段落间距舒适，中文引用样式正确，标题层级清晰

### Requirement: 年份覆盖验证
系统 SHALL 确保1965-2025所有年份的股东信均可正确访问。

#### Scenario: 年份验证
- **WHEN** 用户访问任意年份
- **THEN** 系统返回该年信件内容（若无内容则显示友好提示）

## MODIFIED Requirements
### Requirement: 信件的API路由
API路由需同时支持 content/letters/ 和 content/partnership/ 两个目录。

## REMOVED Requirements
无