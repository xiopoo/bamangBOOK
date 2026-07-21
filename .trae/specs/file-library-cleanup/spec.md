# 文件库全面清理

## Why
项目经过长时间开发和内容建设，积累了大量与网站运行和公众号内容创作无关的冗余文件（历史审计报告、爬虫数据、处理脚本、临时文件、构建缓存等），影响项目可维护性和开发体验。

## What Changes

### 1. 保留的文件和目录（网站和公众号核心内容）
- **src/** — React/Next.js 应用源代码
- **content/** — 网站内容文件（articles、books、companies、concepts、graph、interviews、letters、partnership、pdf-documents-formatted、people、qa、talks 及所有 index.json 文件）
- **公众号HTML输出/** — 公众号排版输出文件
- **.trae/** — 项目规范文档和技能文件
- **项目配置文件** — next.config.js、package.json、package-lock.json、tsconfig.json、postcss.config.js、.eslintrc.json、.env.local、.gitignore、next-env.d.ts

### 2. 需要备份后删除的文件和目录
| 类别 | 路径 | 说明 |
|------|------|------|
| 构建缓存 | `.next/` | `npm run build` 可重新生成 |
| 审计报告 | `audit-reports/` | 历史审计日志和扫描结果 |
| 爬虫报告 | `crawl/`、`crawl_full/` | 网站爬取报告 |
| 分析数据 | `data/` | 概念分析数据 |
| 处理脚本 | `scripts/` | 数据清洗/下载/转换脚本，运行时不需要 |
| 临时内容 | `content/pdf-documents/` | 与主内容重复的文件 |
| 临时文件 | `content/pdf-analysis.txt`、`content/pdf-full.txt`、`content/temp_full_text.txt` | PDF 分析临时文件 |
| PDF 原件 | `content/1957-1970.pdf` | 内容已提取为 md，PDF 不再需要 |
| 备份文件 | `content/yearly-events.bak.md` | year corrections 备份 |
| IMA 数据 | `content/ima-classified.json`、`content/ima-list.json`、`content/my-kb-content.json`、`content/buffett-kb-list.json` | IMA 知识库同步数据，网站不直接使用 |
| 根目录扫描脚本 | `*.js`、`*.py`（如 scan_tables.py、extract_headings.py 等） | 一次性处理工具 |
| 扫描报告 | `scan_report.txt`、`scan_result.json`、`scan_result_v2.json` | 历史扫描结果 |
| 日志文件 | `build.log`、`dev.err.log`、`dev.log` | 构建和运行日志 |
| 其他报告 | `cross-links-report.json`、`IMA_SYNC_REPORT.md`、`SCAN_REPORT.md` | 分析报告 |
| 预览图片 | `preview-home.png` | 不再需要的资源 |
| 独立构建 | `.next/standalone/` | 独立部署产物 |

## Impact
- Affected code: 仅删除冗余文件，不修改任何源代码
- Restoring deleted files: 可通过备份目录恢复

## ADDED Requirements

### Requirement: 文件备份
The system SHALL back up all files to a designated backup location before deletion.

#### Scenario: 备份所有待删除文件
- **WHEN** 执行清理操作前
- **THEN** 将所有待删除文件复制到 `.trae/backups/file-library-cleanup/` 目录
- **THEN** 确保备份后文件数量与待删除文件一致

### Requirement: 精确保留核心文件
The system SHALL identify and retain only website and WeChat public account related files.

#### Scenario: 保留检查
- **WHEN** 扫描待删除列表中的每个文件
- **THEN** 确认该文件不被 `src/` 或 `content/` 中的代码引用
- **THEN** 确认该文件不是网站配置文件或公众号内容

### Requirement: 清理后验证
The system SHALL verify that the website builds and runs correctly after cleanup.

#### Scenario: 构建验证
- **WHEN** 所有文件删除完成
- **THEN** `npm run build` 构建成功
- **THEN** `npm run dev` 启动正常

## MODIFIED Requirements
无 — 不修改任何现有代码

## 验收标准
- 所有待删除文件已备份至 `.trae/backups/file-library-cleanup/`
- 已删除的文件不再出现在项目目录中
- 保留的文件（src/、content/、公众号HTML输出/、.trae/、配置文件）完整无损
- `npm run build` 构建通过
- `npm run dev` 启动正常，网站可访问
