# 右侧导览与文字大小控制修复 - 产品需求文档

## Overview
- **Summary**: 修复页面右侧导览显示异常的bug并恢复文字放大缩小按钮功能
- **Purpose**: 解决右侧目录导览竖排显示问题，恢复文字大小控制按钮的显示和功能，提升用户阅读体验
- **Target Users**: 文档阅读用户、网站访问者

## Goals
- 修复右侧导览组件的CSS布局问题，确保横排正常显示
- 恢复文字放大缩小按钮的显示和功能
- 确保修复在所有屏幕尺寸下正常工作
- 确保修复不会影响页面其他功能

## Non-Goals (Out of Scope)
- 修改网站整体设计风格
- 添加新的功能模块
- 修改文档内容

## Background & Context
- 右侧导览组件`ArticleTableOfContents.tsx`使用`sticky`定位，在部分页面显示异常（竖排文字）
- 文字大小控制组件`FontSizeControl.tsx`和`FontSizeControlFixed.tsx`已存在但未在页面中使用
- 问题可能涉及CSS定位、z-index层级或响应式设计

## Functional Requirements
- **FR-1**: 修复右侧导览显示异常
  - 分析并修复CSS布局问题（定位错误、尺寸计算偏差、z-index层级问题）
  - 确保导览在桌面端(≥1024px)、平板(768px-1023px)和移动设备(<768px)均能正确显示
  - 验证导览的交互功能（展开/收起、点击跳转）正常

- **FR-2**: 恢复文字放大缩小按钮
  - 在所有文档详情页面添加文字大小控制按钮
  - 确保按钮功能完整，点击后能正确调整页面文字大小
  - 确保按钮在不同屏幕尺寸下均能正常显示和使用

## Non-Functional Requirements
- **NFR-1**: 修复不影响页面其他功能模块
- **NFR-2**: 响应式表现符合设计规范
- **NFR-3**: 代码结构清晰，易于维护

## Constraints
- **Technical**: 使用Next.js和Tailwind CSS
- **Dependencies**: 依赖现有的组件和样式

## Assumptions
- 现有组件代码逻辑正确，仅需修复样式和集成问题
- 用户期望文字大小控制按钮位于页面头部区域

## Acceptance Criteria

### AC-1: 右侧导览正常显示
- **Given**: 用户访问文档详情页面
- **When**: 页面加载完成
- **Then**: 右侧导览正常横排显示，文字方向正确
- **Verification**: `human-judgment`

### AC-2: 右侧导览响应式表现
- **Given**: 用户在不同屏幕尺寸下访问文档详情页面
- **When**: 调整浏览器窗口大小
- **Then**: 导览在桌面端显示，在移动端隐藏或正常折叠
- **Verification**: `human-judgment`

### AC-3: 文字放大缩小按钮显示
- **Given**: 用户访问文档详情页面
- **When**: 页面加载完成
- **Then**: 文字大小控制按钮在页面头部显示
- **Verification**: `human-judgment`

### AC-4: 文字放大缩小功能正常
- **Given**: 用户点击文字大小控制按钮
- **When**: 点击放大或缩小按钮
- **Then**: 页面文字大小相应调整
- **Verification**: `human-judgment`

### AC-5: 回归测试通过
- **Given**: 修复完成后
- **When**: 测试所有文档详情页面
- **Then**: 页面其他功能模块无异常
- **Verification**: `human-judgment`

## Open Questions
- [ ] 文字大小控制按钮应放置在哪个位置？（页面头部右侧、底部等）
- [ ] 是否需要保存用户的文字大小偏好？