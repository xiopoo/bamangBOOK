# 巴菲特思想关键概念演变研究项目 - PRD

## Overview
- **Summary**: 对巴菲特历年股东信与合伙人信文本进行系统性分析，通过AI自动概念提取识别关键概念，追踪概念演变，构建完整的巴菲特思想知识图谱
- **Purpose**: 建立巴菲特投资思想的演变追踪体系，帮助用户深入理解巴菲特投资哲学的发展脉络
- **Target Users**: 价值投资者、金融研究者、巴菲特思想爱好者

## Goals
- 通过AI自动提取文本中所有概念，不局限于现有类型
- 对提取结果进行频率统计分析
- 根据统计数据重新界定核心概念、重要人物及相关投资公司
- 建立概念演变追踪机制，精确到年份/季度
- 开发概念专题页面，展示概念完整信息
- 实现股东信与概念页面的双向超链接
- 构建交互式知识图谱，呈现概念关联关系

## Non-Goals (Out of Scope)
- 不生成新的原创内容，仅整理和分析现有数据
- 不包含移动端独立App开发

## Background & Context
- 项目已拥有：62封股东信、35封合伙人信、31个核心概念、7位人物、61家公司
- 已有基础：index.json包含概念统计和共现数据，概念文件已有初步结构
- 技术栈：Next.js 14 + TypeScript + Tailwind CSS + D3.js

## Functional Requirements
- **FR-1**: AI自动概念提取 - 从所有文本中提取概念，覆盖人物、公司、思想概念等所有类型
- **FR-2**: 频率统计分析 - 对提取的概念进行频率统计，生成统计报告
- **FR-3**: 概念分类与界定 - 根据频率统计重新界定核心概念、重要人物、相关公司
- **FR-4**: 概念演变追踪 - 记录概念首次提出年份、原始表述、后续演变
- **FR-5**: 概念专题页面 - 创建独立页面展示概念详细信息
- **FR-6**: 双向超链接 - 股东信中概念链接至专题页面，专题页面引用链接回原文
- **FR-7**: 知识图谱 - 基于概念关联构建可视化图谱，支持交互式浏览

## Non-Functional Requirements
- **NFR-1**: 概念提取完整度≥95%
- **NFR-2**: 时间精度精确到年份，关键节点精确到季度
- **NFR-3**: 超链接有效性100%
- **NFR-4**: 知识图谱包含≥100个核心概念及≥300个关联关系

## Constraints
- **Technical**: Next.js 14 App Router，TypeScript，Tailwind CSS，D3.js
- **Dependencies**: 现有content目录下的Markdown文件和index.json数据

## Assumptions
- 现有概念标注可作为AI提取的参考基础
- 用户需要Web端交互式体验

## Acceptance Criteria

### AC-1: AI概念提取
- **Given**: 股东信和合伙人信文本
- **When**: 运行概念提取脚本
- **Then**: 提取出所有提及的概念，覆盖人物、公司、思想概念等类型
- **Verification**: human-judgment

### AC-2: 频率统计分析
- **Given**: 提取的概念列表
- **When**: 进行统计分析
- **Then**: 生成概念频率排名报告
- **Verification**: programmatic

### AC-3: 概念分类体系
- **Given**: 频率统计结果
- **When**: 系统处理后
- **Then**: 概念被准确分类为人物、公司、思想概念三类，并重新界定核心概念
- **Verification**: human-judgment

### AC-4: 概念演变时间线
- **Given**: 某一核心概念
- **When**: 用户查看概念页面
- **Then**: 显示概念首次提出年份及后续演变节点
- **Verification**: programmatic

### AC-5: 双向超链接
- **Given**: 股东信中提及概念
- **When**: 用户点击概念链接
- **Then**: 跳转至对应概念专题页面
- **Verification**: programmatic

### AC-6: 知识图谱可视化
- **Given**: 概念关联数据
- **When**: 用户访问图谱页面
- **Then**: 展示交互式图谱，支持节点点击和关系探索
- **Verification**: human-judgment

## Open Questions
- [ ] 是否需要导出Excel格式的概念清单？
- [ ] 知识图谱是否需要支持搜索功能？
