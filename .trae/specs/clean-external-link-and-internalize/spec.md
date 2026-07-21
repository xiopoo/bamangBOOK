# 内链管理 Spec

## Why
网站内容中存在指向 `对标站点` / `对标站点` 等参考/抄袭来源网站的外部链接（包括作为内容来源标注的链接），导致内容版权与品牌关联风险。同时，文档中存在本应指向内部路由（概念/公司/人物/年份详情页）的链接因复制时未改写为内部路径而仍以外部 URL 形式存在。需要删除无效的外部参考链接，并将原本应指向内部页面的链接统一替换为内部路由。

## What Changes
- **删除** 内容文件、组件代码、配置文件等所有地方中 `对标站点`、`对标站点`、`对标站点` 等指向对标/参考网站的链接
- **替换** 内容文件（含 `content/letters/`、`content/partnership/`、`content/concepts/`、`content/companies/`、`content/people/` 等）以及 `content/index.json` 中本应指向内部页面（`/concepts/...`、`/companies/...`、`/people/...`、`/letters/...`、`/partnership/...`）的外部 URL，统一替换为内部路由
- **保留** 与该项目完全无关的合法外部引用（如伯克希尔哈撒韦年报、SEC 文档等官方来源）
- **修复** 删除/替换时可能破坏的 Markdown 语法（如 `[label](url)` 改写为 `[label](/internal/route)`）
- **新增** 验证步骤：检查全文件无残留 `对标站点` 字符串，并检查替换后的内部链接 200 状态

## Impact
- Affected specs: `replicate-target-site`（内容整理 Task）、`site-wide-link-responsive-audit`（链接审计已完成的修复）
- Affected code:
  - `content/letters/*.md`
  - `content/partnership/*.md`
  - `content/concepts/*.md`
  - `content/companies/*.md`
  - `content/people/*.md`
  - `content/index.json`
  - `src/app/letters/[year]/page.tsx`（如仍在渲染外部来源）
  - `src/components/LetterReader.tsx`（如渲染了外部来源链接）
  - `src/components/MarkdownContent.tsx`

## ADDED Requirements

### Requirement: 删除 对标站点 系外部链接
系统 SHALL 在所有内容文件、组件代码、配置文件中识别并完全移除任何形式的 `对标站点`、`对标站点`、`对标站点` 链接。

#### Scenario: 扫描内容文件
- **WHEN** 审计所有 `.md`、`.json`、`.ts`、`.tsx` 文件
- **THEN** 报告中列出所有命中目标域名的文件与行号，并确认删除后再次扫描无任何匹配

#### Scenario: 删除 "原文/来源" 标注
- **WHEN** 文档中 "原文" 或 "来源" 行包含 `对标站点`
- **THEN** 整行 "原文链接" / "来源链接" 段落被删除或被替换为 "复利书房内部收录" 之类的本地化标注

### Requirement: 统一内部链接规范
系统 SHALL 将内容中应当指向内部页面的外部 URL 替换为内部路由（`/concepts/...`、`/companies/...`、`/people/...`、`/letters/...`、`/partnership/...`）。

#### Scenario: 概念实体链接
- **WHEN** Markdown 中出现指向概念详情页的外部 URL（无论是否带锚文本）
- **THEN** 替换为 `/concepts/{name}` 内部链接，并保留原锚文本

#### Scenario: 公司实体链接
- **WHEN** Markdown 中出现指向公司详情页的外部 URL
- **THEN** 替换为 `/companies/{name}` 内部链接

#### Scenario: 人物实体链接
- **WHEN** Markdown 中出现指向人物详情页的外部 URL
- **THEN** 替换为 `/people/{name}` 内部链接

#### Scenario: 股东信/合伙人信年份链接
- **WHEN** Markdown 中出现指向具体年份信件的外部 URL
- **THEN** 替换为 `/letters/{year}` 内部链接

### Requirement: 链接替换后验证
系统 SHALL 对所有替换后的内部链接进行 HTTP 验证，确保目标页面返回 200。

## MODIFIED Requirements
无

## REMOVED Requirements
无
