# 表格格式全面标准化处理 - Product Requirement Document

## Overview
- **Summary**: 对网站所有 Markdown 表格进行全面的内容格式修复和样式标准化处理，包括清理剩余的 Markdown 语法错误、统一表格视觉样式（对齐、边框、字体、表头）、优化响应式显示，并进行多设备多浏览器兼容性验证。
- **Purpose**: 解决当前网站中表格显示不一致、格式错乱、样式不统一、移动端体验不佳等问题，使所有表格达到专业水准，与整体"书房风格"设计规范高度一致。
- **Target Users**: 所有网站访客，尤其是通过表格数据进行投资学习和研究的深度用户。

## Goals
- 修复所有剩余的 Markdown 表格语法错误（合伙人信 + 股东信 + 其他分类全面扫描）
- 统一表格样式标准：对齐方式、边框、字体、表头、斑马纹、间距
- 优化表格在移动端的显示效果（横向滚动 + 数据可读性）
- 确保暗色模式下表格样式完美适配
- 解决 `.prose` CSS 与 `MarkdownContent` 组件内联样式的冲突问题
- 清理与此相关的冗余代码、注释和调试信息
- 进行多设备多浏览器兼容性验证

## Non-Goals (Out of Scope)
- 不修改表格数据内容（数值、文字含义）
- 不新增表格或重新组织表格结构
- 不改变表格在文档中的位置
- 不涉及非表格相关的 CSS 样式调整
- 不实现跨浏览器截图自动化测试（将使用浏览器手动验证）

## Background & Context

### 当前状态
项目使用 Next.js + React + react-markdown + remark-gfm 渲染 Markdown 内容。表格样式存在**双重来源**：
1. `.prose` CSS 样式（[globals.css](file:///c:/Users/小囤囤/Documents/trae_projects/bamangBOOK/src/app/globals.css#L167-L215) 第 167-215 行）
2. `MarkdownContent` 组件内联样式（[MarkdownContent.tsx](file:///c:/Users/小囤囤/Documents/trae_projects/bamangBOOK/src/components/MarkdownContent.tsx#L82-L96) 第 82-96 行）

两套样式同时作用于表格，存在冲突风险且难以维护。

### 已知剩余问题（内容层面）
根据 [table-fix 规格](file:///c:/Users/小囤囤/Documents/trae_projects/bamangBOOK/.trae/specs/table-fix/spec.md) 及前期修复工作，已修复最严重的 5 个文件，但以下问题可能仍存在：

| 文件 | 表格数 | 问题类型 | 状态 |
|------|--------|---------|------|
| partnership_1961-annual | 5 | 重复表头、列数不匹配 | ⚠️ 待确认 |
| partnership_1962-annual | 1 | 重复表头、列数不匹配 | ⚠️ 待确认 |
| partnership_1964-annual | 1 | 重复表头、列数不匹配 | ⚠️ 待确认 |
| partnership_1967-annual | 1 | 重复表头、列数不匹配 | ⚠️ 待确认 |
| partnership_1964-interim | 1 | 尾部空列 | ⚠️ 待确认 |
| partnership_1966-interim | 1 | 尾部空列 | ⚠️ 待确认 |
| partnership_1967-interim | 1 | 尾部空列 | ⚠️ 待确认 |
| partnership_1968-interim | 1 | 尾部空列 | ⚠️ 待确认 |

### 设计规范基线（书房风格）
基于 [tailwind.config.js](file:///c:/Users/小囤囤/Documents/trae_projects/bamangBOOK/tailwind.config.js) 中定义的设计 token：
- **主色**：`#C85A17`（暖橙）
- **强调色**：`#D4A853`（金色）
- **背景色**：`#F5F0E8`（米色）/ `#FAF7F2`（卡片米白）
- **正文色**：`#3C2415`（深棕）
- **字体**：`Noto Serif SC`（思源宋体）
- **暗色背景**：`#1A1A2E` / `#16213E`

## Functional Requirements

### FR-1: 全面扫描，确认剩余问题
- 对所有内容分类（partnership、letters、articles、interviews、qa、talks）进行表格语法扫描
- 识别所有存在语法问题的表格（重复表头、列数不匹配、尾部空列、单元格合并错误）
- 输出完整问题清单，为修复提供精确目标

### FR-2: 修复所有 Markdown 表格语法错误
- **重复表头行**：保留分隔符行上方紧邻的正确表头，删除其余重复行
- **列数不匹配**：统一表头行、分隔符行、数据行的列数
- **尾部空列**：删除行末多余的 `|  |` 或 `||`
- **单元格内容合并**：根据数据列数和上下文推断正确的列划分
- 所有修复必须保证数据完整性，不修改数值和文字内容

### FR-3: 统一表格样式标准
- **对齐方式**：表头和数据单元格水平居中对齐（数值类表格视觉更整齐）
- **边框样式**：统一使用 1px 实线边框，颜色与设计 token 一致，四边均有边框（不只是横线）
- **表头样式**：
  - 背景色：`bg-bg-card`（米白卡片色），与整体风格协调
  - 字体：加粗（font-semibold）
  - 文字颜色：`text-text`（深棕）
  - 单元格高度：足够的垂直内边距确保舒适阅读
- **内容行样式**：
  - 斑马纹（隔行变色）提升可读性
  - 悬停高亮效果
  - 字体：正文同字体（思源宋体）
  - 字号：0.875em（略小于正文）
- **表格容器**：
  - 横向滚动容器
  - 圆角边框（与整体卡片风格一致）
  - 阴影轻微，提升层次感

### FR-4: 暗色模式完美适配
- 暗色模式下的边框颜色、背景色、文字颜色全部适配
- 斑马纹在暗色模式下有足够对比度
- 表头在暗色模式下有明确的视觉区分

### FR-5: 响应式优化
- **桌面端**（≥1024px）：表格完整显示，边框清晰，居中对齐
- **平板端**（768px-1023px）：横向滚动可用，数据可读
- **移动端**（<768px）：
  - 确保横向滚动流畅
  - 缩小内边距以增加有效显示面积
  - 字号适当缩小
  - 表头文字不折行或有最小宽度保证

### FR-6: 样式来源统一
- 将表格样式统一管理，消除 `.prose` CSS 与 `MarkdownContent` 组件内联样式的冲突
- 统一在 MarkdownContent 组件中使用 Tailwind className 控制表格样式
- 清理 globals.css 中重复或冲突的表格 CSS

### FR-7: 冗余代码清理
- 删除与表格相关的调试代码、注释掉的代码
- 清理无效的 CSS 规则
- 确保代码整洁可维护

## Non-Functional Requirements

### NFR-1: 浏览器兼容性
- Chrome（最新版）✅ 必须通过
- Firefox（最新版）✅ 必须通过
- Safari（最新版）✅ 必须通过
- Edge（最新版）✅ 必须通过
- 亮色模式和暗色模式均需验证

### NFR-2: 设备兼容性
- 桌面端（1440×900）：完整显示
- 平板端（768×1024）：横向滚动可用
- 移动端（375×812 / 390×844）：可读、可操作

### NFR-3: 视觉一致性
- 所有表格视觉风格统一
- 与整体"书房风格"协调
- 表格与正文段落间距合理（上下各 1.5-2em）

### NFR-4: 数据完整性
- 修复过程中不得丢失任何表格数据
- 所有数值、文字保持原样
- 列的含义和顺序不变

## Constraints
- **技术**: Next.js 14 + React + react-markdown + remark-gfm + Tailwind CSS
- **业务**: 不得修改原文内容，只能修正表格格式语法
- **范围**: 聚焦表格相关，不扩散到其他样式调整

## Assumptions
- 重复表头行是 PDF/HTML 转 Markdown 时的产物，正确表头是分隔符行上方紧邻的那一行
- 尾部空列和多余管道符是转换错误，应清理
- 数值类表格居中对齐比左对齐更易读
- 现有表格数据内容本身是正确的，只是格式有误

## Acceptance Criteria

### AC-1: 内容修复完成
- **Given**: 所有含表格的 Markdown 文件
- **When**: 完成语法修复后
- **Then**: 每个表格只有 1 行表头、1 行分隔符，所有行列数一致，无尾部空列，数据完整
- **Verification**: `programmatic`（Markdown 解析验证行列数） + `human-judgment`（抽样核对数据）

### AC-2: 样式统一达标
- **Given**: 修复后的表格在浏览器中渲染
- **When**: 查看任意表格
- **Then**: 四边边框完整、表头背景清晰、斑马纹明显、居中对齐、字体字号统一
- **Verification**: `human-judgment`

### AC-3: 暗色模式适配
- **Given**: 切换到暗色模式
- **When**: 查看表格
- **Then**: 边框、背景、文字颜色均适配，对比度足够，表头与内容行区分明显
- **Verification**: `human-judgment`

### AC-4: 响应式显示正常
- **Given**: 不同屏幕尺寸
- **When**: 调整浏览器窗口或在移动设备上查看
- **Then**: 桌面端完整显示，窄屏可横向滚动，数据不丢失不重叠
- **Verification**: `human-judgment`（桌面 + 移动）

### AC-5: 样式冲突消除
- **Given**: 表格渲染的 DOM 结构
- **When**: 检查样式来源
- **Then**: 样式来源统一（MarkdownContent 组件 className），`.prose` 中无冲突的表格 CSS
- **Verification**: `programmatic`（检查 CSS 规则） + `human-judgment`

### AC-6: 代码整洁
- **Given**: 表格相关的代码文件
- **When**: 审查代码
- **Then**: 无调试代码、无注释掉的代码、无无效 CSS 规则
- **Verification**: `human-judgment`

## Open Questions
- [ ] `${design_specification}` 变量指代的具体设计规范文档在哪里？本次将基于项目现有的 Tailwind 设计 token 作为规范基线，是否需要调整？
- [ ] 表格内文字对齐方式：用户建议居中对齐，但财务数据表格通常数字右对齐、文字左对齐。统一居中是否合适？
- [ ] 是否需要对 articles、qa、talks 等其他分类也进行全面的表格扫描修复？
