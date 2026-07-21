# 巴菲特股东信PDF格式修复 - 产品需求文档

## Overview
- **Summary**: 修复巴菲特股东信PDF文档提取脚本，确保文档按照PDF原始格式展示，包括表格识别和转换、目录条目过滤、同名文档处理等功能。
- **Purpose**: 解决用户反馈的"所有文章（包括表格）都没有按照巴菲特股东信 PDF 的编辑格式展示"的问题。
- **Target Users**: 巴菲特股东信网站的维护者和读者。

## Goals
- [x] 修复目录条目干扰提取的问题，确保只提取正文内容
- [x] 修复同名标题覆盖问题，为同名文档生成不同的文件名
- [x] 实现表格识别和转换功能，将PDF表格转换为Markdown表格
- [x] 确保"伯克希尔与标普 500 指数"表格正确转换
- [x] 确保"伯克希尔业务版图"表格被识别并转换

## Non-Goals (Out of Scope)
- 不修改网站前端展示逻辑
- 不处理所有可能的表格格式变体
- 不优化已转换表格的列对齐问题

## Background & Context
- 原始提取脚本存在目录条目干扰提取的问题
- 同名标题会生成相同的文件名，导致后面的文档覆盖前面的文档
- PDF中的表格数据没有被识别和转换为Markdown表格格式

## Functional Requirements
- **FR-1**: 正确识别并过滤目录条目，确保只提取正文内容
- **FR-2**: 为同名标题生成不同的文件名，避免覆盖问题
- **FR-3**: 识别PDF中的表格数据并转换为Markdown表格格式
- **FR-4**: 保留文档的分段格式，确保可读性

## Non-Functional Requirements
- **NFR-1**: 脚本执行时间不超过5分钟
- **NFR-2**: 生成的Markdown文件格式正确，可正常渲染

## Constraints
- **Technical**: 使用Node.js脚本，基于现有的PDF文本提取结果
- **Dependencies**: 依赖现有的`pdf-full.txt`文件

## Assumptions
- [x] PDF文本已经提取到`content/pdf-full.txt`文件中
- [x] 文档标题列表已经定义在脚本中

## Acceptance Criteria

### AC-1: 目录条目过滤
- **Given**: PDF文本中包含目录条目和正文内容
- **When**: 运行提取脚本
- **Then**: 目录条目被正确过滤，只提取正文内容
- **Verification**: `human-judgment`
- **Notes**: 通过检查"伯克希尔与标普 500 指数"文件内容来验证

### AC-2: 同名文档处理
- **Given**: PDF中存在多个同名文档
- **When**: 运行提取脚本
- **Then**: 为每个同名文档生成不同的文件名（如`_1.md`后缀）
- **Verification**: `programmatic`
- **Notes**: 检查输出目录中是否存在多个同名文件

### AC-3: 表格转换
- **Given**: PDF中包含表格数据
- **When**: 运行提取脚本
- **Then**: 表格数据被转换为Markdown表格格式
- **Verification**: `human-judgment`
- **Notes**: 通过检查"伯克希尔与标普 500 指数"和"伯克希尔业务版图"文件中的表格来验证

## Open Questions
- [ ] 是否需要进一步优化业务版图表格的公司名称识别？
- [ ] 是否需要处理其他类型的表格格式？