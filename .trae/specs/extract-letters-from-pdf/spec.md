# 从PDF合集提取巴菲特股东信 Spec

## Overview
- **Summary**: 从巴菲特股东信PDF合集中提取文本内容，按年份拆分并按篇幅整理成结构化的Markdown文件
- **Purpose**: 将PDF格式的股东信合集转换为便于阅读、检索和管理的结构化文本文件，为网站内容提供高质量数据源
- **Target Users**: 网站内容维护者、研究人员、投资者

## Goals
- 将PDF合集中的股东信按年份拆分，生成独立的Markdown文件
- 提取每封信的篇幅信息（字数/页数），便于内容管理
- 保持原始内容完整性，同时优化格式便于阅读
- 生成内容摘要和索引文件

## Non-Goals (Out of Scope)
- 不修改原始PDF文件
- 不进行深度内容编辑（如添加注释、导读等），仅提取和格式化
- 不处理合伙人信（1956-1969），仅处理伯克希尔股东信

## Background & Context
- 项目已有 `content/巴菲特致股东信60年合集1950-2025（芒格书院精译）.pdf` 文件
- 已有部分年份的股东信MD文件，但可能存在缺失或不完整
- 参考编辑指南：[股东信编辑指南.md](../../股东信编辑指南.md)
- 现有MD文件格式：`content/letters/berkshire_YYYY-巴菲特致股东信.md`

## Functional Requirements
- **FR-1**: 从PDF文件中提取文本内容
- **FR-2**: 按年份识别并拆分信件边界
- **FR-3**: 计算每封信的篇幅（字数）
- **FR-4**: 生成按年份命名的Markdown文件
- **FR-5**: 生成内容索引文件，包含年份、篇幅、标题等元数据

## Non-Functional Requirements
- **NFR-1**: 提取的文本准确率 >= 95%
- **NFR-2**: 中文排版符合项目编辑指南
- **NFR-3**: 处理速度合理（PDF约60年内容，< 5分钟）

## Constraints
- **Technical**: 需要Python环境和PDF解析库（如PyPDF2或pdfplumber）
- **Dependencies**: 项目使用Node.js/Next.js，提取脚本可使用Python
- **Business**: 内容版权归原译者所有，仅用于内部使用

## Assumptions
- PDF文件包含完整的1965-2025年股东信内容
- PDF结构清晰，每封信有明确的年份标题分隔
- 中文文本可被正确提取

## Acceptance Criteria

### AC-1: PDF文本提取
- **Given**: 存在PDF文件 `content/巴菲特致股东信60年合集1950-2025（芒格书院精译）.pdf`
- **When**: 执行提取脚本
- **Then**: 成功提取PDF中的全部文本内容
- **Verification**: `programmatic`

### AC-2: 按年份拆分信件
- **Given**: 已提取PDF文本
- **When**: 运行年份识别算法
- **Then**: 正确识别1965-2025每封信的边界并拆分为独立文件
- **Verification**: `programmatic`

### AC-3: 篇幅信息计算
- **Given**: 已拆分的信件内容
- **When**: 计算每封信的字数
- **Then**: 生成包含篇幅信息的元数据
- **Verification**: `programmatic`

### AC-4: Markdown文件生成
- **Given**: 已拆分的信件内容
- **When**: 格式化输出
- **Then**: 生成符合项目格式的Markdown文件
- **Verification**: `human-judgment`

### AC-5: 内容索引生成
- **Given**: 所有信件已处理完成
- **When**: 生成索引文件
- **Then**: 索引文件包含所有年份、篇幅、标题信息
- **Verification**: `programmatic`

## Open Questions
- [ ] PDF文件的具体结构如何？是否有明确的年份分隔符？
- [ ] 是否需要处理1950-1964年的合伙人信？
- [ ] 现有MD文件与PDF内容是否一致？是否需要覆盖？