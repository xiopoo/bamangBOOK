# 巴菲特大事记重要事件显要标记 - Product Requirement Document

## Overview
- **Summary**: 对巴菲特相关的年度大事记内容进行系统性梳理，识别具有里程碑意义、重大转折或标志性的事件，并通过视觉强化手段（加粗、变色、边框突出、特殊符号标注）进行显要标记，确保重要信息能够被快速识别和重点关注。
- **Purpose**: 当前大事记内容仅采用自然分段方式呈现，缺乏对关键事件的突出显示，需要提升内容的可读性和信息层次。
- **Target Users**: 浏览巴菲特信件和大事记的读者、投资者、研究人员

## Goals
- 识别并标记具有里程碑意义的重要事件
- 通过视觉强化手段（加粗、变色、边框、特殊符号）突出显示关键事件
- 保持原有内容的自然分段结构不变
- 提升大事记内容的可读性和信息层次

## Non-Goals (Out of Scope)
- 不修改原始信件内容
- 不改变大事记的提取逻辑和流程
- 不添加新的事件内容（仅标记已有内容）

## Background & Context
- 当前大事记内容存储在 `content/yearly-events.md` 文件中
- 当前展示组件为 `src/components/YearlyEvents.tsx`
- 当前数据模型为简单的字符串数组，无事件重要性标记

## Functional Requirements
- **FR-1**: 更新 `yearly-events.md` 格式，支持标记重要事件（如添加 `***` 前缀）
- **FR-2**: 更新 `yearly-events.ts` 数据模型，支持解析事件重要性标记
- **FR-3**: 更新 `YearlyEvents.tsx` 组件，对重要事件进行视觉强化渲染
- **FR-4**: 定义重要事件识别规则（里程碑、重大转折、标志性事件）

## Non-Functional Requirements
- **NFR-1**: 视觉强化手段应符合整体设计风格，不破坏页面美观
- **NFR-2**: 重要事件标记应清晰可辨，不影响普通事件的阅读
- **NFR-3**: 修改应保持向后兼容，不影响现有功能

## Constraints
- **Technical**: Next.js 14.x, React, Tailwind CSS
- **Dependencies**: 现有内容结构和组件架构

## Assumptions
- 重要事件可通过关键词和语义识别
- 用户接受在 markdown 文件中添加标记符号
- 视觉强化手段不会影响页面加载性能

## Acceptance Criteria

### AC-1: 重要事件标记格式定义
- **Given**: 当前 `yearly-events.md` 文件内容
- **When**: 在重要事件前添加 `***` 标记
- **Then**: 数据模型能够正确识别并解析该标记
- **Verification**: `programmatic`

### AC-2: 重要事件视觉强化
- **Given**: 包含重要事件标记的大事记数据
- **When**: 渲染 `YearlyEvents` 组件
- **Then**: 重要事件显示为加粗、变色、带边框的样式，普通事件保持原有样式
- **Verification**: `human-judgment`

### AC-3: 原有结构保持不变
- **Given**: 包含重要事件和普通事件的大事记数据
- **When**: 渲染 `YearlyEvents` 组件
- **Then**: 事件按年份分组，自然分段结构保持不变
- **Verification**: `human-judgment`

### AC-4: 重要事件识别准确性
- **Given**: 梳理后的 `yearly-events.md` 文件
- **When**: 人工审核标记结果
- **Then**: 具有里程碑意义的事件（如合伙基金成立、伯克希尔收购、重大投资等）均被标记为重要事件
- **Verification**: `human-judgment`

## Open Questions
- [ ] 重要事件的具体视觉样式（颜色、边框样式等）需要确认
- [ ] 是否需要支持多级重要性标记（如一级重要、二级重要等）