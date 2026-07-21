# 扩展巴菲特知识网络 - 产品需求文档

## Overview

* **Summary**: 使用新提取的268篇文档（股东信、合伙人信、演讲、访谈、股东大会问答、芒格文章等）填充现有网站框架，替换原有内容，扩展知识网络结构，提供更丰富的内容浏览体验。

* **Purpose**: 利用新提取的完整PDF文档内容，填充现有网站框架，确保内容的完整性和一致性，让用户能够全面探索巴菲特和芒格的思想体系。

* **Target Users**: 价值投资学习者、巴菲特思想研究者、金融从业者

## Goals

* 将新提取的268篇文档分类整理到现有content目录结构

* 替换原有股东信和合伙人信内容为新版本

* 创建新内容分类（演讲、访谈、股东大会问答、专题文章）

* 更新首页和导航，整合新内容入口

* 更新知识索引，融入新概念和关联关系

## Non-Goals (Out of Scope)

* 不重新设计网站整体视觉风格和布局

* 不添加新的功能模块（如AI问答已有）

* 不修改网站的核心架构和组件

## Background & Context

* 现有网站框架包含：/letters（股东信）、/partnership（合伙人信）、/concepts（概念）、/companies（公司）、/people（人物）、/graph（知识图谱）

* 新提取了268篇文档，包含：股东信60封、合伙人信23封、股东大会实录/问答40个、演讲17个、访谈32个、芒格文章7个、其他文章81个

* 需要将新文档按现有框架分类整理

## Functional Requirements

* **FR-1**: 将新提取的股东信（1965-2024）整理到content/letters目录

* **FR-2**: 将新提取的合伙人信（1956-1970）整理到content/partnership目录

* **FR-3**: 创建content/talks目录存放演讲类文档

* **FR-4**: 创建content/interviews目录存放访谈类文档

* **FR-5**: 创建content/qa目录存放股东大会问答类文档

* **FR-6**: 创建content/articles目录存放专题文章类文档

* **FR-7**: 更新content/index.json，融入新内容统计和关联数据

* **FR-8**: 更新首页统计数据和导航入口

## Non-Functional Requirements

* **NFR-1**: 页面加载时间 < 2秒

* **NFR-2**: 索引构建脚本执行时间 < 5分钟

* **NFR-3**: 保持与现有代码风格和架构一致

* **NFR-4**: 支持响应式设计

## Constraints

* **Technical**: Next.js + TypeScript + Tailwind CSS

* **Business**: 内容为中文，需保持语言一致性

* **Dependencies**: 基于现有文档结构和组件库

## Assumptions

* 新提取的268篇文档内容完整，格式规范

* 现有组件可复用，无需修改

* 网站框架结构保持不变

## Acceptance Criteria

### AC-1: 股东信替换

* **Given**: 用户访问/letters页面

* **When**: 用户浏览股东信列表

* **Then**: 显示新提取的1965-2024年股东信，内容完整

* **Verification**: `human-judgment`

### AC-2: 合伙人信替换

* **Given**: 用户访问/partnership页面

* **When**: 用户浏览合伙人信列表

* **Then**: 显示新提取的1956-1970年合伙人信，内容完整

* **Verification**: `human-judgment`

### AC-3: 演讲页面

* **Given**: 用户访问/talks页面

* **When**: 用户浏览演讲列表

* **Then**: 显示新提取的演讲类文档，按年份分组

* **Verification**: `human-judgment`

### AC-4: 访谈页面

* **Given**: 用户访问/interviews页面

* **When**: 用户浏览访谈列表

* **Then**: 显示新提取的访谈类文档，按年份分组

* **Verification**: `human-judgment`

### AC-5: 问答页面

* **Given**: 用户访问/qa页面

* **When**: 用户浏览问答列表

* **Then**: 显示新提取的股东大会问答类文档

* **Verification**: `human-judgment`

### AC-6: 专题文章页面

* **Given**: 用户访问/articles页面

* **When**: 用户浏览文章列表

* **Then**: 显示新提取的专题文章类文档

* **Verification**: `human-judgment`

### AC-7: 首页更新

* **Given**: 用户访问首页

* **When**: 用户浏览首页

* **Then**: 首页统计数据更新，包含新内容类型入口

* **Verification**: `human-judgment`

### AC-8: 文档阅读体验

* **Given**: 用户打开任意新文档

* **When**: 用户阅读文档

* **Then**: 页面格式与现有风格一致，支持目录导航

* **Verification**: `human-judgment`

## Open Questions

* [ ] 是否需要保留原有网站中的概念、公司、人物数据？

* [ ] 是否需要为新文档添加阅读进度追踪？

