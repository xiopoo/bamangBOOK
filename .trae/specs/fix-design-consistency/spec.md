# 设计一致性修复项目 - 产品需求文档

## Overview
- **Summary**: 修复网站设计一致性问题，包括CSS语法错误、页面容器结构、头部组件统一和颜色变量使用规范
- **Purpose**: 解决当前网站存在的设计不一致问题，提升用户体验和代码可维护性
- **Target Users**: 网站访问用户、开发维护团队

## Goals
- 修复CSS语法错误，确保页面正确渲染
- 统一页面容器结构，使用标准的PageContainer组件
- 统一头部组件，使用标准的PageHeader组件
- 规范颜色变量使用，确保主题切换正常工作

## Non-Goals (Out of Scope)
- 不涉及功能逻辑变更
- 不新增页面或功能模块
- 不修改后端API

## Background & Context
当前网站存在多处设计不一致问题，主要体现在：
1. 概念详情页存在CSS语法错误导致样式失效
2. 部分页面未使用统一的PageContainer组件
3. 概念详情页头部为自定义实现，与其他页面不一致
4. 颜色变量使用不统一，部分页面使用硬编码颜色值

## Functional Requirements
- **FR-1**: 修复概念详情页CSS语法错误
- **FR-2**: 概念详情页采用统一的PageContainer组件
- **FR-3**: 概念详情页采用统一的PageHeader组件
- **FR-4**: 统一颜色变量使用，移除硬编码颜色值

## Non-Functional Requirements
- **NFR-1**: 页面加载时间不受影响
- **NFR-2**: 暗色模式切换正常工作
- **NFR-3**: 响应式布局保持正常

## Constraints
- **Technical**: Next.js + Tailwind CSS 框架
- **Dependencies**: 项目现有依赖不变

## Assumptions
- 项目已安装并配置好Tailwind CSS
- 现有组件（PageContainer、PageHeader）功能完整

## Acceptance Criteria

### AC-1: CSS语法错误修复
- **Given**: 概念详情页存在CSS语法错误
- **When**: 修复背景色定义
- **Then**: 页面背景色正确渲染，暗色模式正常工作
- **Verification**: `programmatic`

### AC-2: 页面容器统一
- **Given**: 概念详情页使用自定义容器
- **When**: 替换为PageContainer组件
- **Then**: 页面布局与其他页面一致
- **Verification**: `human-judgment`

### AC-3: 头部组件统一
- **Given**: 概念详情页使用自定义头部
- **When**: 替换为PageHeader组件
- **Then**: 头部样式与其他页面一致
- **Verification**: `human-judgment`

### AC-4: 颜色变量统一
- **Given**: 页面使用硬编码颜色值
- **When**: 替换为Tailwind配置变量
- **Then**: 颜色切换正常，主题一致性提升
- **Verification**: `programmatic`

## Open Questions
- [ ] 无

---

# 任务分解与优先级规划

## 任务列表

### Task 1: 修复概念详情页CSS语法错误
- **Priority**: P0
- **Depends On**: None
- **Description**: 修复`src/app/concepts/[name]/page.tsx`中背景色定义的语法错误
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic`: 页面正常渲染，暗色模式切换正常
  - `human-judgment`: 背景色显示正确

### Task 2: 概念详情页使用PageContainer组件
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 将概念详情页的自定义容器替换为统一的PageContainer组件
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic`: 页面布局正常，无渲染错误
  - `human-judgment`: 页面边距与其他页面一致

### Task 3: 概念详情页使用PageHeader组件
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 将概念详情页的自定义头部替换为统一的PageHeader组件
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic`: 页面正常渲染
  - `human-judgment`: 头部样式与其他页面一致

### Task 4: 统一颜色变量使用
- **Priority**: P1
- **Depends On**: Task 3
- **Description**: 将公司页面等使用硬编码颜色的地方替换为Tailwind配置变量
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic`: 暗色模式切换正常
  - `human-judgment`: 颜色显示一致性提升

## 验证检查清单

- [ ] Checkpoint 1: 概念详情页CSS语法错误已修复
- [ ] Checkpoint 2: 概念详情页使用PageContainer组件
- [ ] Checkpoint 3: 概念详情页使用PageHeader组件
- [ ] Checkpoint 4: 颜色变量使用统一
- [ ] Checkpoint 5: 暗色模式切换正常
- [ ] Checkpoint 6: 所有页面布局一致