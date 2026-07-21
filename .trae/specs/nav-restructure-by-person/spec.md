# 导航重构项目 - 按人物分类

## Overview
- **Summary**: 重构导航结构，将"巴菲特股东信"按人物维度重新组织，使"巴菲特"成为一级导航，合伙人信和股东信作为二级导航
- **Purpose**: 实现按人物分阶段拆解的核心思路，为后续扩展芒格、纳瓦尔等人物模块奠定基础
- **Target Users**: 网站访问用户、开发维护团队

## Goals
- 将导航按"人物"维度重新组织
- "巴菲特"作为一级导航，包含合伙人信和股东信两个二级入口
- 重新设计巴菲特信件的展示方式
- 保持现有功能不变

## Non-Goals (Out of Scope)
- 不新增页面或功能模块
- 不修改后端API
- 不涉及芒格、纳瓦尔等其他人物模块

## Background & Context
项目整体架构按人物分阶段拆解：
1. 巴菲特 - 先从股东信开始
2. 芒格 - 接力扩展
3. 纳瓦尔 - 再往后扩展
4. 拆书 - 经典投资/思维类书籍
5. AI对话 - 集大成模块

当前阶段需要完成巴菲特模块的导航重构。

## Functional Requirements
- **FR-1**: 导航按人物维度重新组织，"巴菲特"作为一级导航
- **FR-2**: "巴菲特"栏目下包含合伙人信和股东信两个二级导航
- **FR-3**: 重新设计巴菲特信件的展示页面

## Non-Functional Requirements
- **NFR-1**: 页面加载时间不受影响
- **NFR-2**: 暗色模式切换正常工作
- **NFR-3**: 响应式布局保持正常

## Constraints
- **Technical**: Next.js + Tailwind CSS 框架
- **Dependencies**: 项目现有依赖不变

## Acceptance Criteria

### AC-1: 导航结构重构
- **Given**: 原有导航结构
- **When**: 重构完成后
- **Then**: 导航栏显示"巴菲特"一级栏目，包含合伙人信和股东信二级导航
- **Verification**: `human-judgment`

### AC-2: 巴菲特页面展示
- **Given**: 用户点击"巴菲特"导航
- **When**: 进入巴菲特页面
- **Then**: 展示合伙人信和股东信的汇总信息
- **Verification**: `human-judgment`

### AC-3: 功能完整性
- **Given**: 原有信件功能
- **When**: 重构完成后
- **Then**: 所有原有功能保持正常
- **Verification**: `programmatic`

## Open Questions
- [ ] 无

---

# 任务分解与优先级规划

## 任务列表

### Task 1: 创建巴菲特主页面
- **Priority**: P0
- **Depends On**: None
- **Description**: 创建 `/buffett` 页面，作为巴菲特模块的入口，展示合伙人信和股东信概览
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic`: 页面正常渲染
  - `human-judgment`: 展示清晰的信件分类

### Task 2: 重构Sidebar导航组件
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 修改导航结构，将"巴菲特"作为一级栏目，合伙人信和股东信作为二级导航
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic`: 导航链接正常跳转
  - `human-judgment`: 导航结构清晰

### Task 3: 更新现有页面引用
- **Priority**: P1
- **Depends On**: Task 2
- **Description**: 更新首页等页面中指向信件的链接，保持功能完整性
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic`: 所有链接正常跳转
  - `human-judgment`: 用户体验不受影响

## 验证检查清单

- [ ] Checkpoint 1: 巴菲特主页面创建完成
- [ ] Checkpoint 2: Sidebar导航重构完成
- [ ] Checkpoint 3: 导航结构按人物分类正确
- [ ] Checkpoint 4: 所有链接正常跳转
- [ ] Checkpoint 5: 无TypeScript编译错误