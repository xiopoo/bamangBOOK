# 四大核心功能增强 Spec

## Why
用户希望为「复利书房」网站添加搜索、知识图谱可视化、阅读进度记录和暗黑模式四个核心功能，以提升网站的可用性和用户体验。

## What Changes
- **新增** 全站搜索系统，支持概念/公司/人物三类实体的模糊搜索与关键词联想
- **新增** 交互式知识图谱可视化页面，支持节点拖拽、缩放、路径探索
- **新增** 用户阅读进度记录系统，支持段落级进度追踪与阅读历史
- **新增** 暗黑模式，支持手动/自动切换，符合WCAG AA标准

## Impact
- Affected specs: 搜索、知识图谱、阅读进度、暗黑模式
- Affected code:
  - `src/app/search/` - 搜索页面
  - `src/app/graph/` - 知识图谱可视化页面
  - `src/app/api/` - 搜索API、进度API
  - `src/components/` - 搜索组件、暗黑模式切换、进度组件
  - `tailwind.config.js` - 暗黑模式配置

## ADDED Requirements

### Requirement: 搜索系统
系统 SHALL 提供全站搜索，支持对概念、公司、人物三类核心实体的精准检索。

#### Scenario: 搜索成功
- **WHEN** 用户在搜索框输入关键词
- **THEN** 系统在300ms内返回搜索结果，按类别分组展示，匹配的关键词高亮显示

#### Scenario: 模糊搜索
- **WHEN** 用户输入部分关键词（如"护城"）
- **THEN** 系统返回包含"护城河"在内的相关结果

#### Scenario: 搜索建议
- **WHEN** 用户输入关键词时
- **THEN** 系统在下拉框中展示搜索建议和匹配数量

### Requirement: 知识图谱可视化
系统 SHALL 提供交互式知识图谱可视化页面。

#### Scenario: 图谱展示
- **WHEN** 用户访问图谱页面
- **THEN** 系统以力导向图展示概念、公司、人物之间的关联

#### Scenario: 交互操作
- **WHEN** 用户拖拽/缩放节点
- **THEN** 图谱平滑响应，无卡顿

#### Scenario: 节点详情
- **WHEN** 用户点击节点
- **THEN** 弹出详情弹窗，展示实体属性和关联信息

### Requirement: 阅读进度追踪
系统 SHALL 追踪用户在各文档中的阅读位置，精确到段落级别。

#### Scenario: 进度记录
- **WHEN** 用户滚动阅读文档
- **THEN** 系统自动记录当前阅读段落

#### Scenario: 进度恢复
- **WHEN** 用户重新访问文档
- **THEN** 系统自动定位到上次阅读位置

#### Scenario: 阅读历史
- **WHEN** 用户查看阅读历史
- **THEN** 系统展示最近阅读的文档列表及其进度

### Requirement: 暗黑模式
系统 SHALL 支持完整的夜间阅读模式。

#### Scenario: 手动切换
- **WHEN** 用户点击暗黑模式切换按钮
- **THEN** 系统立即切换主题，保存用户偏好

#### Scenario: 自动切换
- **WHEN** 系统检测到暗色主题偏好
- **THEN** 系统自动切换到暗黑模式

## MODIFIED Requirements
### Requirement: 全局布局
布局组件需感知主题状态，根据暗黑模式调整样式。

## REMOVED Requirements
无