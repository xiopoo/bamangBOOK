# 巴菲特大事记板块系统性更新 - Product Requirement Document

## Overview
- **Summary**: 对每封信件详情页中的"大事记"板块进行全面重构，将其从仅作为页面顶部信息展示转变为信件正文末尾的独立补充栏目，添加明确的视觉区隔、栏目说明文字和差异化排版，确保读者能清晰识别其独立性质。
- **Purpose**: 解决当前"大事记"板块未按照要求进行任何调整的问题，使其与正文内容有效区分，建立清晰的栏目身份标识。
- **Target Users**: 浏览巴菲特股东信和合伙人信的读者、投资者、研究人员

## Goals
- 将"大事记"板块移至信件正文末尾，作为独立的补充栏目
- 设计专属的视觉标识（标题样式、背景、边框），与正文有效区分
- 添加栏目说明文字，阐明其独立补充性质
- 基于每封信的主题，优化内容展示的相关性
- 建立长效更新机制

## Non-Goals (Out of Scope)
- 不修改 the 大事记数据提取逻辑（extract-yearly-events.js）
- 不修改 the yearly-events.md 内容格式
- 不修改信件正文内容本身
- 不增加新的大事记事件

## Background & Context
- 当前[YearlyEvents.tsx](file:///C:/Users/小囤囤/Documents/trae_projects/bamangBOOK/src/components/YearlyEvents.tsx)渲染位置在信件详情页的正文之前
- 当前组件位于[letters/[year]/page.tsx](file:///C:/Users/小囤囤/Documents/trae_projects/bamangBOOK/src/app/letters/[year]/page.tsx#L143)和[partnership/[id]/page.tsx](file:///C:/Users/小囤囤/Documents/trae_projects/bamangBOOK/src/app/partnership/[id]/page.tsx#L80)的`<main>`区块顶部
- 数据模型[yearly-events.ts](file:///C:/Users/小囤囤/Documents/trae_projects/bamangBOOK/src/lib/yearly-events.ts)提供`EventItem`接口（含text和isImportant字段）
- 当前缺乏栏目说明文字和明确标识

## Functional Requirements
- **FR-1**: 在 YearlyEvents 组件顶部添加栏目说明文字，阐明"本栏目为独立于信件正文的补充内容"
- **FR-2**: 重新设计 YearlyEvents 组件的视觉样式，使用不同色系、专属徽标、边框样式等与正文明显区分
- **FR-3**: 将 YearlyEvents 组件的渲染位置从信件正文之前移至正文之后、导航链接之前
- **FR-4**: 增强组件类型定义，支持自定义标题和栏目说明文本
- **FR-5**: 建立大事记内容更新指南（README/注释）

## Non-Functional Requirements
- **NFR-1**: 视觉区隔应足够明显，不影响正文阅读体验
- **NFR-2**: 组件应保持响应式设计，适配移动端
- **NFR-3**: 组件在无事件数据时应正确隐藏（不渲染）
- **NFR-4**: 暗色模式适配

## Constraints
- **Technical**: Next.js 14.x, React, Tailwind CSS
- **Dependencies**: 现有 [YearlyEvents.tsx](file:///C:/Users/小囤囤/Documents/trae_projects/bamangBOOK/src/components/YearlyEvents.tsx) 组件和 [yearly-events.ts](file:///C:/Users/小囤囤/Documents/trae_projects/bamangBOOK/src/lib/yearly-events.ts) 数据层

## Acceptance Criteria

### AC-1: 组件位置变更
- **Given**: 信件详情页面
- **When**: 用户在页面中滚动浏览
- **Then**: 大事记栏目显示在信件正文之后、页面导航链接之前
- **Verification**: `human-judgment`

### AC-2: 栏目说明文字
- **Given**: 大事记栏目
- **When**: 用户浏览该栏目
- **Then**: 栏目顶部显示说明文字，阐明其为独立于信件正文的补充内容
- **Verification**: `human-judgment`

### AC-3: 视觉区隔设计
- **Given**: 大事记栏目与信件正文
- **When**: 用户浏览页面
- **Then**: 大事记栏目使用与正文明显不同的色系、背景样式、边框设计
- **Verification**: `human-judgment`

### AC-4: 标题增强
- **Given**: 大事记栏目
- **When**: 用户浏览
- **Then**: 标题包含年份信息和专属徽标图标
- **Verification**: `human-judgment`

### AC-5: 空数据状态
- **Given**: 某年份无大事记数据
- **When**: 渲染信件详情页
- **Then**: 大事记栏目完全不渲染（返回null）
- **Verification**: `programmatic`