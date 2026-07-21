# 知识图谱可视化体验重构 Spec

## Why
当前知识图谱页面采用 D3.js 力导向图渲染，用户在交互（悬停、拖拽、筛选）时页面出现明显晃动/抖动，导致视觉疲劳。同时节点关键词的视觉层级单一（仅靠颜色区分类型），关键概念无法被快速识别定位。此外仅提供一种力导向图模式，无法满足不同浏览需求。

## What Changes
- **修复页面晃动问题**：优化力导向模拟的 alpha 衰减、碰撞检测和 tick 回调，增加 transition 过渡动画的稳定性控制；在鼠标悬停/拖拽期间暂停模拟，离开后恢复。
- **提供多种可视化模式**：至少 4 种模式 - 力导向图优化版、层级树状图、思维导图模式、知识卡片集群模式。
- **增强关键词视觉突出**：通过节点尺寸（按提及频率动态缩放）、颜色编码（同类型渐变区分重要性）、字体加粗/高亮、徽章标记（高频词标记）等方式，使核心概念一目了然。
- **优化交互体验**：缩放控件、搜索定位、关系筛选（按类型/按权重阈值/按年份）、节点详情面板、布局重置。
- **响应式适配**：桌面端双栏布局（左侧面板+图谱）、平板自适应、移动端全屏图谱+抽屉式控制面板。

## Impact
- Affected code:
  - 重写 [src/app/graph/page.tsx](file:///Users/lucas/Documents/bamangB/bamangBOOK/src/app/graph/page.tsx) — 当前文件全部替换
  - [src/app/api/graph/nodes/route.ts](file:///Users/lucas/Documents/bamangB/bamangBOOK/src/app/api/graph/nodes/route.ts) — 可能需扩展 API 字段
  - 可能新增组件：`src/components/graph/` 目录下的多个子组件
  - [src/app/globals.css](file:///Users/lucas/Documents/bamangB/bamangBOOK/src/app/globals.css) — 可能需添加知识图谱专用样式
- Affected specs: 无受影响的历史 spec（这是全新的重写）

## ADDED Requirements

### Requirement: 多模式切换
The system SHALL provide at least 4 visualization modes for the knowledge graph.

#### Scenario: 切换可视化模式
- **WHEN** 用户在知识图谱页面点击模式切换按钮
- **THEN** 图谱在力导向图、层级树状图、思维导图、知识卡片集群四种模式之间切换，每次切换动画流畅无卡顿

### Requirement: 页面稳定性
The system SHALL eliminate page shaking/jitter during normal interaction.

#### Scenario: 交互操作不抖动
- **WHEN** 用户悬停节点、拖拽节点或缩放画布
- **THEN** 图谱画面保持稳定，无异常晃动或跳动；力模拟在交互期间暂停，交互结束后平滑恢复

### Requirement: 关键词视觉突出
The system SHALL make key nodes visually distinguishable at a glance.

#### Scenario: 快速识别核心概念
- **WHEN** 用户打开知识图谱页面
- **THEN** 高频提及的节点（count 值较高）具有更大的半径、更粗的字体、更深的颜色或特殊徽章标记，在视觉上优先吸引注意力

### Requirement: 交互控制
The system SHALL provide rich interactive controls for navigation and exploration.

#### Scenario: 搜索定位
- **WHEN** 用户在搜索框输入关键词
- **THEN** 匹配的节点高亮显示，选择后自动居中并放大该节点所在区域

#### Scenario: 关系筛选
- **WHEN** 用户调整关系权重阈值或选择节点类型
- **THEN** 图谱动态过滤符合条件的节点和链接，低于阈值的弱关系被淡化或隐藏

### Requirement: 响应式适配
The system SHALL adapt to desktop, tablet, and mobile viewports.

#### Scenario: 桌面端
- **WHEN** 在 ≥1024px 视口下
- **THEN** 显示双栏布局（左侧控制面板 + 右侧图谱），全部交互控件可见

#### Scenario: 平板端
- **WHEN** 在 768-1023px 视口下
- **THEN** 控制面板折叠为可滑出的抽屉式面板，图谱占据全屏

#### Scenario: 移动端
- **WHEN** 在 <768px 视口下
- **THEN** 图谱全屏展示，控制面板为底部弹出式抽屉，使用触摸友好的按钮尺寸

## MODIFIED Requirements

### Requirement: API 数据扩展
当前 [api/graph/nodes/route.ts](file:///Users/lucas/Documents/bamangB/bamangBOOK/src/app/api/graph/nodes/route.ts) 返回的节点数据可能需扩展以支持新模式。例如增加树状结构的 `children` 字段、或思维导图的 `parent` 字段。后端返回前端缓存，避免重复计算。

## REMOVED Requirements
无移除项。
