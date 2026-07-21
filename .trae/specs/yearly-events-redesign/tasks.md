# 巴菲特大事记板块系统性更新 - Implementation Plan

## [x] Task 1: 重构 YearlyEvents 组件（视觉与内容区隔）
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 重新设计 YearlyEvents 组件，添加独立的栏目说明文字（"📌 本栏目为独立补充内容，与信件正文相互独立"）
  - 重新设计视觉样式：使用与正文(prose)不同的底色/边框色系，添加专属栏目徽标
  - 添加 DecorativeDivider 分隔元素，强化栏目独立性感知
  - 支持自定义 title 和 description props
  - 保持空数据隐藏逻辑
- **Acceptance Criteria Addressed**: AC-2, AC-3, AC-4, AC-5
- **Test Requirements**:
  - `human-judgment` TR-1.1: 栏目顶部显示说明文字，阐明独立性质
  - `human-judgment` TR-1.2: 栏目使用与正文明显不同的色系和背景样式
  - `human-judgment` TR-1.3: 标题包含年份信息和专属徽标图标
  - `programmatic` TR-1.4: 组件在 events 为空时返回 null

## [x] Task 2: 调整大事记渲染位置
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 在 letters/[year]/page.tsx 中，将 YearlyEvents 从信件正文之前移至正文之后、导航链接之前
  - 在 partnership/[id]/page.tsx 中，将 YearlyEvents 从信件正文之前移至正文之后、导航链接之前
  - 确保在无事件数据时不会出现空白区块
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgment` TR-2.1: 股东信详情页中，大事记栏目位于正文之后、导航链接之前
  - `human-judgment` TR-2.2: 合伙人信详情页中，大事记栏目位于正文之后、导航链接之前
  - `programmatic` TR-2.3: 无事件数据时不产生空白区域

## [x] Task 3: 项目构建验证与预览
- **Priority**: high
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 运行 npm run build 验证项目能够正常构建
  - 启动开发服务器验证视觉区隔效果
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4, AC-5
- **Test Requirements**:
  - `programmatic` TR-3.1: npm run build 成功完成（exit code 0）