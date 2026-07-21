# 标准化信件替换方案

## Why
现有股东信和合伙人信内容来源于多轮爬虫抓取、PDF 转换和手动编辑，存在格式不一致、段落缺失、排版错误等问题，用户对当前处理结果不满意。用户已通过 learnbuffett.com 等渠道积累了经过标准化整理的信件版本，希望直接用这些整理好的文件替换系统中的旧文件，确保内容准确性和格式统一性。

## 方案概述
由用户将整理好的标准化文件放入指定目录，系统检测到新文件后执行替换操作：将新文件自动复制到 `content/letters/` 和 `content/partnership/` 覆盖旧文件，并对文件名、编码格式、元数据头进行标准化校验，最后构建验证。

## 操作流程

1. **用户上传阶段**：用户将标准化整理的信件文件放入 `/Users/lucas/Documents/bamangB/bamangBOOK/upload/letters/` 和 `/Users/lucas/Documents/bamangB/bamangBOOK/upload/partnership/` 目录
2. **文件检测与校验**：系统扫描上传目录，识别文件名并匹配对应的旧文件
3. **替换执行**：新文件覆盖旧文件，同时统一文件名格式
4. **后处理与验证**：对替换后的文件执行统一的格式清洗，确保索引 JSON 依然有效，执行构建验证

## 文件命名映射规则

### 合伙人信（partnership）
| 上传文件名模式 | 对应系统文件 |
|--------------|------------|
| 1956 或 partnership_1956 | partnership_1956-巴菲特致合伙人信.md |
| 1957 或 partnership_1957 | partnership_1957-巴菲特致合伙人信.md |
| 1958 或 partnership_1958 | partnership_1958-巴菲特致合伙人信.md |
| ... | ... |
| 1969-liquidation | partnership_1969-liquidation-巴菲特致合伙人信.md |
| 1970-bond | partnership_1970-bond-巴菲特致合伙人信.md |

### 股东信（letters）
| 上传文件名模式 | 对应系统文件 |
|--------------|------------|
| 1965 或 berkshire_1965 | berkshire_1965-巴菲特致股东信.md |
| 1966 或 berkshire_1966 | berkshire_1966-巴菲特致股东信.md |
| ... | ... |
| 2024 或 berkshire_2024 | berkshire_2024-巴菲特致股东信.md |

## 文件格式标准化要求
替换后的文件需遵循以下格式标准：
- **编码**: UTF-8（无 BOM）
- **第一行**: `# 信件标题`（H1 标题）
- **第二行**: 空行
- **正文格式**: 标准 Markdown
- **段落间**: 一个空行分隔
- **结尾**: 以署名结束，无额外内容（执行 letter-ending-cleanup 的净化标准）

## 元数据
替换操作会影响 `content/letters-index.json` 和 `content/partnership-index.json` 中的 `wordCount` 字段，需在替换后重新计算并更新。

## What Changes
- 用户上传标准化文件到 `upload/` 目录
- 文件被复制到 `content/letters/` 和 `content/partnership/` 覆盖旧文件
- 文件名按约定统一规范化
- 索引 JSON 中的 wordCount 字段重新计算
- 构建验证确保网站功能正常

## Impact
- Affected specs: letter-ending-cleanup（信件结尾净化标准需保持）
- Affected files: `content/letters/*.md`（全部约 60 个文件）、`content/partnership/*.md`（全部约 24 个文件）
- Affected indexes: `content/letters-index.json`、`content/partnership-index.json`（wordCount 字段）
- 索引中的 title、year 字段保持不变

## ADDED Requirements

### Requirement: 文件上传检测
The system SHALL detect user-uploaded files in the `upload/` directory.

#### Scenario: 用户放置文件
- **WHEN** 用户将文件放入 `upload/letters/` 或 `upload/partnership/`
- **THEN** 系统读取文件列表，识别每个文件对应的年份
- **THEN** 系统校验文件编码为 UTF-8

### Requirement: 文件替换
The system SHALL replace existing files with uploaded files.

#### Scenario: 替换执行
- **WHEN** 上传文件完成校验
- **THEN** 原文件被备份到 `.trae/backups/`（可选，用户确认后执行）
- **THEN** 新文件覆盖旧文件

### Requirement: 格式统一处理
The system SHALL ensure all replaced files follow a consistent format.

#### Scenario: 格式标准化
- **WHEN** 替换完成后
- **THEN** 检查文件开头是否为 `# ` 标题
- **THEN** 确保 letter-ending-cleanup 标准仍然适用

### Requirement: 索引更新
The system SHALL update wordCount in index files.

#### Scenario: 索引同步
- **WHEN** 文件替换完成
- **THEN** 重新计算每个文件的 wordCount
- **THEN** 更新索引 JSON 中的对应字段

## 验收标准
- 所有上传文件成功替换对应的旧文件
- 替换后文件名格式统一
- `npm run build` 构建通过
- 信件详情页（letters/xxx 和 partnership/xxx）可正常访问
- 内容完整显示，无乱码

## 用户需配合的操作
1. 将整理好的股东信文件放入 `upload/letters/` 目录
2. 将整理好的合伙人信文件放入 `upload/partnership/` 目录
3. 通知我执行替换操作
