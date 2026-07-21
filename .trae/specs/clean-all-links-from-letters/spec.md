# 全面清除信件文件中的外部链接与出处信息 Spec

## Why
通过 IMA 知识库替换后的股东信（60 篇）和合伙人信（24 篇）文件中，存在大量来自 learnbuffett.com 的外部链接和出处信息，包括：
- 每篇文章第 3 行的 `> 来源：` 引用行
- 部分文章末尾的 `原文链接：` 行
- 散布在正文中的 6,500+ 个内联实体链接（如 `[伯克希尔·哈撒韦](https://learnbuffett.com/companies/伯克希尔哈撒韦.html)`）
- 表格数据脚注中的来源标注
- 分类标签（`股东信`/`合伙人信`）和 SEO 描述副标题等非正文元素

这些外部链接指向对标网站，存在版权与品牌关联风险；出处信息在文档独立发布场景下为冗余内容。需要彻底清除所有外部链接和出处标注，仅保留文档主体内容。

## What Changes
- **移除** 所有 84 篇文件中第 3 行的 `> 来源：https://learnbuffett.com/...` 引用行
- **移除** 所有文件末尾的 `原文链接：https://learnbuffett.com/...` 行（letters 中 27 篇、partnership 中 24 篇）
- **转换** 正文中所有 `[实体名](https://learnbuffett.com/...)` 格式的内联实体链接为纯文本 `实体名`（约 6,587 处）
- **移除** 正文中的数据来源脚注（如 `_数据来源：Best's Aggregates and Averages_`、`> (2) 来源：Moody's...` 等，约 15 处）
- **移除** 分类标签行（`股东信` / `合伙人信` 等独立行）
- **移除** SEO 描述副标题行（H1 与正文之间的大段描述性文字，如 `2024 巴菲特致股东信：94 岁巴菲特最后一封股东信...`）
- **不移除** 正文中合法的内部数据标注（如表格内的年份、百分比等非链接内容）
- **不修改** index.json、组件代码、配置文件等非 Markdown 内容文件

## Impact
- Affected specs: `replace-letters-with-standardized`（已完成的 IMA 文件替换）、`clean-external-link-and-internalize`（旧文件的链接清理，已独立完成）
- Affected code:
  - `content/letters/*.md`（60 个文件）
  - `content/partnership/*.md`（24 个文件）
- Not affected:
  - `content/concepts/*.md`、`content/companies/*.md`、`content/people/*.md`（不清洗）
  - `content/*.json`（索引文件不清洗）
  - `src/**`（组件代码不清洗）
  - 其他目录

## ADDED Requirements

### Requirement: 移除来源引用行
系统 SHALL 删除所有信件文件中第 3 行的 `> 来源：https://learnbuffett.com/...` 引用行。

#### Scenario: 股东信来源行
- **WHEN** 处理 `content/letters/berkshire_*.md`
- **THEN** 第 3 行的 `> 来源：https://learnbuffett.com/berkshire/{year}-巴菲特致股东信.html` 整行被删除

#### Scenario: 合伙人信来源行
- **WHEN** 处理 `content/partnership/partnership_*.md`
- **THEN** 第 3 行的 `> 来源：https://learnbuffett.com/partnership/{title}.html` 整行被删除

### Requirement: 移除原文链接行
系统 SHALL 删除所有信件文件末尾的 `原文链接：https://learnbuffett.com/...` 行。

#### Scenario: 股东信原文链接
- **WHEN** 处理 2000-2024 年的股东信文件
- **THEN** 末尾的 `原文链接：https://learnbuffett.com/berkshire/{year}-巴菲特致股东信.html` 整行被删除

#### Scenario: 合伙人信原文链接
- **WHEN** 处理所有 24 篇合伙人信文件
- **THEN** 末尾的 `原文链接：https://learnbuffett.com/partnership/{title}.html` 整行被删除

### Requirement: 转换内联实体链接为纯文本
系统 SHALL 将所有 `[文本](https://learnbuffett.com/{category}/{entity}.html)` 格式的内联链接转换为纯文本 `文本`。

#### Scenario: 公司实体链接
- **WHEN** 正文中出现 `[伯克希尔·哈撒韦](https://learnbuffett.com/companies/伯克希尔哈撒韦.html)`
- **THEN** 替换为纯文本 `伯克希尔·哈撒韦`

#### Scenario: 人物实体链接
- **WHEN** 正文中出现 `[芒格](https://learnbuffett.com/people/芒格.html)`
- **THEN** 替换为纯文本 `芒格`

#### Scenario: 概念实体链接
- **WHEN** 正文中出现 `[复利](https://learnbuffett.com/concepts/复利.html)`
- **THEN** 替换为纯文本 `复利`

### Requirement: 移除数据来源脚注
系统 SHALL 删除正文中所有数据来源/资料来源标注行。

#### Scenario: 股东信数据脚注
- **WHEN** 正文中出现 `_数据来源：Best's Aggregates and Averages_` 或 `_资料来源：A.M. Best Co._`
- **THEN** 整行被删除

#### Scenario: 合伙人信数据脚注
- **WHEN** 正文中出现 `> (2) 来源：{year} Moody's Bank & Finance Manual...`
- **THEN** 整行被删除

### Requirement: 移除分类标签和副标题
系统 SHALL 删除正文中非主体内容的分隔行，包括分类标签行和 SEO 描述副标题行。

#### Scenario: 分类标签行
- **WHEN** H1 标题后出现独立成行的 `股东信` 或 `合伙人信`
- **THEN** 该行被删除

#### Scenario: SEO 描述副标题
- **WHEN** H1 标题与正文之间出现大段描述性文字（如 `2024 巴菲特致股东信：94 岁巴菲特最后一封股东信...`）
- **THEN** 该行被删除

#### Scenario: HTML 标题残留
- **WHEN** 出现 `2019年巴菲特致股东的信（中文全文）— 巴菲特知识库` 等原始页面标题残留
- **THEN** 该行被删除

### Requirement: 清理后排版修复
系统 SHALL 确保删除行后不会产生多余空行或 Markdown 排版错误。

#### Scenario: 多余空行清理
- **WHEN** 删除来源行、原文链接行后产生连续空行
- **THEN** 压缩为单个空行，保持正文与 H1 标题之间合理的间距

## MODIFIED Requirements
无

## REMOVED Requirements
无
