# 知识图谱与内容完善 Spec

## Why
目前网站存在以下问题：
1. 股东信之间的概念、人物没有相互链接，知识图谱不完整
2. 股东信内容不全（缺少部分年份）
3. 缺少股东大会Q&A内容
4. 阅读库内容未充分利用
5. Markdown页面可读性差，未学习对标站点的设计精华

## What Changes
- 在股东信详情页顶部添加概念索引（如对标站点）
- 补充更多股东信内容（从IMA知识库同步）
- 添加股东大会Q&A页面和内容
- 完善阅读库内容同步
- 优化Markdown渲染样式，提升可读性

## Impact
- Affected specs: 股东信阅读体验、知识图谱完整性、内容丰富度
- Affected code:
  - `src/app/letters/[year]/page.tsx` - 添加概念索引
  - `scripts/sync-ima.js` - 增强同步功能
  - `src/app/qa/` - 新增股东大会Q&A页面
  - `src/app/reading/` - 完善阅读库页面

## ADDED Requirements

### Requirement: 概念索引
系统 SHALL 在股东信详情页顶部显示该信件中出现的所有概念链接。

#### Scenario: 快速跳转到概念
- **WHEN** 用户打开股东信页面
- **THEN** 页面顶部显示概念标签云，点击可跳转到概念详情页

### Requirement: 股东大会Q&A
系统 SHALL 提供股东大会问答内容，按年份和场次分类。

#### Scenario: 查看股东大会问答
- **WHEN** 用户访问股东大会页面
- **THEN** 显示按年份组织的Q&A列表

### Requirement: 完整股东信
系统 SHALL 包含1956年至2025年的巴菲特股东信。

#### Scenario: 浏览所有股东信
- **WHEN** 用户访问股东信列表页
- **THEN** 显示完整的年份列表，无遗漏

## MODIFIED Requirements
无

## REMOVED Requirements
无