# 设计一致性修复项目 - 实施计划

## [x] Task 1: 修复概念详情页CSS语法错误
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 修复`src/app/concepts/[name]/page.tsx`第42行背景色定义的语法错误
  - 当前错误：`bg-[#fff9f6]6]6] dark[#1b1a2e]a2e]a2e]`
  - 正确应为：`bg-[#fff9f6] dark:bg-[#1b1a2e]`
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic`: 页面正常渲染，暗色模式切换正常
  - `human-judgment`: 背景色显示正确，与其他页面风格一致

## [x] Task 2: 概念详情页使用PageContainer组件
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 将概念详情页的自定义容器`div.min-h-screen...`替换为统一的PageContainer组件
  - 移除自定义的max-w-4xl等样式，使用PageContainer的maxWidth属性
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic`: 页面布局正常，无渲染错误
  - `human-judgment`: 页面边距与其他页面一致

## [x] Task 3: 概念详情页使用PageHeader组件
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 将概念详情页的自定义头部替换为统一的PageHeader组件
  - 保持返回链接、标题、副标题等功能
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic`: 页面正常渲染
  - `human-judgment`: 头部样式与其他页面一致

## [x] Task 4: 统一公司页面颜色变量使用
- **Priority**: P1
- **Depends On**: Task 3
- **Description**: 
  - 将公司页面中硬编码的颜色值替换为Tailwind配置变量
  - 如`bg-[#16213e]`替换为`dark:bg-dark-card`
  - `border-[#2a2a4a]`替换为`dark:border-dark-border`
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic`: 暗色模式切换正常
  - `human-judgment`: 颜色显示一致性提升