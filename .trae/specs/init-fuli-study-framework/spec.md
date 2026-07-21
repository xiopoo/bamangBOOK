# 复利书房项目框架初始化 Spec

## Why
复利书房是一个价值投资知识网站，需要一个清晰的项目框架，包括导航系统、首页内容和功能页面占位，为后续功能开发奠定基础。

## What Changes

### 新增页面结构
- `/` - 首页（首屏 + 功能入口）
- `/letters` - 股东信列表页
- `/model` - 思维模型页
- `/reading` - 阅读库页
- `/qa` - AI问答页

### 新增组件
- `Navigation` - 顶部导航栏组件
- `Footer` - 页脚组件
- `FeatureCard` - 功能卡片组件

### 设计规范实施
- 配色：暖白背景 #faf9f6 + 深灰正文 #2c2c2c + 浅灰次要文字
- 排版：正文字号16px，宽松行高，标题层级清晰
- 交互：卡片圆角8px，轻微阴影，hover柔和过渡

## Impact
- Affected code:
  - `src/app/layout.tsx` - 全局布局
  - `src/app/page.tsx` - 首页
  - `src/components/Navigation.tsx` - 新增导航组件
  - `src/components/Footer.tsx` - 新增页脚组件
  - `src/app/letters/page.tsx` - 股东信页面
  - `src/app/model/page.tsx` - 思维模型页面
  - `src/app/reading/page.tsx` - 阅读库页面
  - `src/app/qa/page.tsx` - AI问答页面

## ADDED Requirements

### Requirement: 顶部导航系统
系统 SHALL 提供固定定位顶部导航栏，左侧显示Logo，右侧包含5个菜单项，响应式支持汉堡菜单。

#### Scenario: 桌面端显示
- **WHEN** 用户在桌面端访问
- **THEN** 导航栏显示完整菜单项

#### Scenario: 移动端显示
- **WHEN** 用户在移动端（<768px）访问
- **THEN** 导航栏显示汉堡菜单，点击展开下拉列表

### Requirement: 首页功能入口
系统 SHALL 在首页提供4个功能卡片，点击可跳转到对应页面。

### Requirement: 响应式布局
系统 SHALL 适配桌面端、平板、手机三端布局。

## 技术规范
- 前端：Next.js 14 App Router + Tailwind CSS + TypeScript
- 数据层：直接调用 IMA 知识库 API
- 部署：适配 Vercel 一键部署
