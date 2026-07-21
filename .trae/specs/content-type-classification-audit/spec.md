# 文章内容类型分类审核与修正

## Why
已有的文章分类体系基于文件所在目录决定内容类型（`content/articles/` → "专题文章"、`content/qa/` → "股东问答"），但存在部分文章的实际内容类型与当前分类不匹配的问题。此外，芒格主题下"演讲"和"访谈"分类中可能存在本应归属巴菲特的内容文章，需系统性审核并迁移。

## What Changes

### 1. 核心修正：将"伯克希尔股东大会发布会 2009"移至 qa
- 将 `content/articles/伯克希尔股东大会发布会_2009.md` 移动到 `content/qa/` 目录
- 从 `content/articles-index.json` 中移除该条目
- 添加到 `content/qa-index.json` 中

### 2. 系统性审查 articles-index.json 中所有条目
- 逐篇评估实际内容与当前分类的匹配度
- 特别关注以下类型文章的归属：
  - Wesco 股东大会系列（1996、2001、2002、2004、2005、2006、2008、2009、2011）
  - 伯克希尔股东手册（1996）
  - 涉及 Q&A 格式的文章

### 3. 芒格主题下内容迁移
- 审核芒格主题中"演讲"和"访谈"分类下的所有文章
- 识别其中内容实质涉及巴菲特（而非芒格）的文章
- 将识别出的文章迁移至巴菲特主题
- 在芒格主题原位置添加迁移说明及跳转链接
- 完成数据库关联关系的同步更新

### 4. 修正阅读库索引和路由
- 更新 `reading-library.ts` 中文章的分类映射逻辑
- 确保被移动的文件在阅读库中正确显示为目标类型
- 更新相关路由跳转

## Impact
- Affected code:
  - `content/articles-index.json` — 移除/更新条目
  - `content/qa-index.json` — 添加条目
  - `content/talks-index.json` — 可能更新 person 字段
  - `content/interviews-index.json` — 可能更新 person 字段
  - `content/articles/` — 文件迁移
  - `content/qa/` — 文件迁移
  - `src/lib/reading-library.ts` — 如有必要更新映射逻辑
  - 阅读库页面（`/qa/`、`/articles/`）受影响
  - 芒格专区页面（`/munger`）— 可能移除条目并添加迁移说明
  - 巴菲特专区页面（`/buffett`）— 可能添加条目

## ADDED Requirements

### Requirement: 文章内容类型审核
The system SHALL provide an audited article classification where each article's content type matches its actual content.

#### Scenario: 审核并修正分类
- **WHEN** 系统扫描索引文件中的每篇文章
- **THEN** 根据实际内容特征判断最合适的分类
- **WHEN** 发现内容为 Q&A 格式或股东大会相关
- **THEN** 移动到 `content/qa/` 目录并更新索引

### Requirement: 芒格-巴菲特内容迁移
The system SHALL move articles from Munger's talk/interview categories to Buffett's categories when the primary subject is Buffett.

#### Scenario: 审核并迁移
- **WHEN** 系统审核芒格主题下"演讲"和"访谈"分类的文章
- **THEN** 识别内容实质涉及巴菲特（而非芒格）的文章
- **WHEN** 确认需迁移的文章
- **THEN** 从芒格主题中移除，添加迁移说明和跳转链接
- **THEN** 迁移至巴菲特主题的对应分类
- **THEN** 更新所有索引文件和关联关系

## MODIFIED Requirements

### Requirement: 阅读库索引反映修正后的分类
- 更新 `reading-library.ts` 中的 `loadIndexedContent()` 函数
- 确保 `sourceDir` 为 `qa` 的文件正确归类为 `'qa'` 类别
- 确保 `sourceDir` 为 `articles` 的文件正确归类为 `'article'` 类别

## 验收标准
- "伯克希尔股东大会发布会 2009" 从 articles 移到 qa，在阅读库中显示在"股东大会"分类下
- 所有 Wesco 股东大会文章评估后决定保留在 articles 或移动到 qa
- 芒格主题"演讲"/"访谈"分类下涉及巴菲特的内容已迁移至巴菲特主题
- 迁移后芒格主题对应位置有明确的迁移说明及跳转链接
- 迁移前后文章总数一致（无丢失）
- `npm run build` 构建通过
- `/qa/` 页面正常显示新添加的文章
- `/articles/` 页面不再显示已移走的文章
