# 表格显示问题修复 - Product Requirement Document

## Overview
- **Summary**: 系统地修复网站所有 Markdown 文章中的表格格式问题，包括内容层面的 Markdown 表格语法错误和渲染层面的 CSS 样式缺陷，确保所有表格在桌面端、平板和移动端均能正确、美观地显示。
- **Purpose**: 解决当前网站中大量表格存在的显示异常问题（格式错乱、重复表头、列数不匹配、内容溢出、边框样式不一致等），提升阅读体验，保证数据完整性和可读性。
- **Target Users**: 所有网站访客，尤其是通过表格数据进行投资学习和研究的用户。

## Goals
- 修复所有合伙人信（partnership）中存在的表格格式问题
- 修复所有股东信（letters）中存在的表格格式问题
- 优化表格 CSS 样式，确保响应式显示和视觉一致性
- 确保修复后的表格数据完整、列数正确、无内容丢失
- 在桌面端、平板端、移动端均能正常查看表格

## Non-Goals (Out of Scope)
- 不修改文章正文内容（除表格格式修正外）
- 不新增表格或重新设计表格结构
- 不改动非表格相关的 CSS 样式
- 不处理 articles、qa、talks 等其他分类（除非发现同类问题）
- 不改变表格数据的含义和顺序

## Background & Context

项目使用 Next.js + React + react-markdown + remark-gfm 渲染 Markdown 内容。表格渲染组件在 [MarkdownContent.tsx](file:///c:/Users/小囤囤/Documents/trae_projects/bamangBOOK/src/components/MarkdownContent.tsx#L82-L96) 中定义，同时 [globals.css](file:///c:/Users/小囤囤/Documents/trae_projects/bamangBOOK/src/app/globals.css#L167-L215) 也有 `.prose` 表格样式。两套样式同时存在，存在样式冲突风险。

经扫描，内容层面发现以下问题：
- **11 个文件**存在表格格式问题，涉及 **15 个表格**
- 合伙人信（partnership）：9 个文件有问题
- 股东信（letters）：2 个文件有问题

主要问题类型：
1. **重复表头行**：部分表格有 2-5 行重复的表头行（PDF 转换残留）
2. **列数不匹配**：表头行、分隔符行、数据行列数不一致
3. **尾部多余管道符**：行末出现 `||` 或多余空列
4. **单元格内容合并**：多个列名被错误地合并到同一单元格
5. **尾部空列**：数据行末尾有多余的空列

样式层面潜在问题：
1. `.prose` CSS 样式与 `MarkdownContent` 组件内联样式存在冲突
2. 表格在窄屏设备上可能横向溢出体验不佳
3. 斑马纹和边框样式需要优化

## Functional Requirements

### FR-1: 修复合伙人信中的表格格式问题
- 修复 partnership_1961-annual 中的 5 个问题表格（重复表头、列数不匹配）
- 修复 partnership_1962-annual 中的 1 个问题表格（重复表头、列数不匹配）
- 修复 partnership_1963-interim 中的 1 个问题表格（单元格内容合并）
- 修复 partnership_1964-annual 中的 1 个问题表格（重复表头、列数不匹配）
- 修复 partnership_1964-interim 中的尾部空列问题
- 修复 partnership_1966-interim 中的尾部空列问题
- 修复 partnership_1967-annual 中的 1 个问题表格（重复表头、列数不匹配）
- 修复 partnership_1967-interim 中的尾部空列问题
- 修复 partnership_1968-interim 中的尾部空列问题

### FR-2: 修复股东信中的表格格式问题
- 修复 berkshire_1983 中的 1 个问题表格（5 行重复表头、列数不匹配）
- 修复 berkshire_1994 中的 1 个问题表格（5 行重复表头、列数不匹配）

### FR-3: 优化表格 CSS 样式
- 统一表格边框样式（确保所有边有边框，不只是底边）
- 优化斑马纹（隔行变色）效果提升可读性
- 增强响应式体验（移动端横向滚动提示）
- 确保暗色模式下表格样式正确
- 解决 `.prose` 样式与组件内联样式的冲突问题

### FR-4: 表格数据完整性验证
- 所有修复后的表格数据与原文一致，无内容丢失
- 列数正确，表头与数据列一一对应
- 数值数据保持原样，不做四舍五入或格式化改动

## Non-Functional Requirements

### NFR-1: 响应式显示
- 桌面端（≥1024px）：表格完整显示，边框清晰
- 平板端（768px-1023px）：表格可横向滚动查看
- 移动端（<768px）：表格可横向滚动，确保数据可读

### NFR-2: 浏览器兼容性
- Chrome、Safari、Firefox、Edge 最新版本均正常显示
- 暗色模式和亮色模式均正常显示

### NFR-3: 视觉一致性
- 所有表格样式统一，边框颜色、间距、字号一致
- 表头背景色与正文风格协调（书房风格）
- 表格与正文段落间距合理

## Constraints
- **技术**: Next.js 14 + React + react-markdown + remark-gfm + Tailwind CSS
- **业务**: 不得修改原文内容，只能修正表格格式语法
- **内容来源**: 以原始信件内容为准，修复的是 Markdown 语法错误而非内容本身

## Assumptions
- 重复表头行是 PDF/HTML 转 Markdown 时的产物，正确表头是分隔符行上方紧邻的那一行
- 尾部空列和多余管道符是转换错误，应清理
- 单元格内容合并的情况，需根据上下文（列标题含义、数据列数量）推断正确的列划分
- 现有表格数据内容本身是正确的，只是格式有误

## Acceptance Criteria

### AC-1: 合伙人信表格修复
- **Given**: 9 个有问题的合伙人信文件
- **When**: 修复所有表格格式问题后
- **Then**: 每个表格只有一行表头，列数与分隔符行一致，无多余空列，数据完整
- **Verification**: `programmatic`（通过 Markdown 解析验证表格行列数） + `human-judgment`（人工核对数据完整性）
- **Notes**: 重点关注 1963-interim 的内容合并问题，需仔细核对列数和内容

### AC-2: 股东信表格修复
- **Given**: 2 个有问题的股东信文件
- **When**: 修复所有表格格式问题后
- **Then**: 每个表格只有一行表头，列数与分隔符行一致，无多余空列，数据完整
- **Verification**: `programmatic` + `human-judgment`

### AC-3: 表格样式优化
- **Given**: 修复后的表格内容
- **When**: 在浏览器中渲染查看
- **Then**: 表格有完整边框（不是只有横线）、表头背景清晰、隔行变色、暗色模式正常、响应式滚动流畅
- **Verification**: `human-judgment`
- **Notes**: 需在桌面端和移动端分别验证

### AC-4: 无内容丢失
- **Given**: 修复前后的文件对比
- **When**: 对比所有修改过的表格数据
- **Then**: 所有数值、文字均保留，无删减、无篡改
- **Verification**: `human-judgment`

### AC-5: 暗色模式兼容性
- **Given**: 切换到暗色模式
- **When**: 查看所有修复过的表格
- **Then**: 边框、背景、文字颜色均适配暗色模式，对比度足够，可读性良好
- **Verification**: `human-judgment`

## Open Questions
- [ ] 1963-interim 表格中"道指 Mass.Inv."被合并到一个单元格，是两个独立的列还是一个复合列名？需根据原文数据列数推断
- [ ] 是否需要为超宽表格添加"左右滑动查看更多"的视觉提示？
- [ ] 是否需要对 articles、qa、talks 等其他分类也进行同样的扫描修复？
