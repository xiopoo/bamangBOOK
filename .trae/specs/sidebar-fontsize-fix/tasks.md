# 右侧导览与文字大小控制修复 - 实施计划

## [x] Task 1: 分析右侧导览显示异常问题
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 分析`ArticleTableOfContents.tsx`组件的CSS布局和定位
  - 检查父容器的flex布局设置
  - 分析可能导致竖排显示的原因
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgment` TR-1.1: 确定导览显示异常的根本原因
  - `human-judgment` TR-1.2: 分析父容器布局是否正确

## [x] Task 2: 修复右侧导览CSS布局问题
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 修复`ArticleTableOfContents.tsx`组件的定位和布局
  - 确保导览区域有固定宽度，防止文字竖排
  - 添加必要的CSS样式确保横排显示
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `human-judgment` TR-2.1: 导览正常横排显示
  - `human-judgment` TR-2.2: 响应式表现正确

## [x] Task 3: 在文档详情页面集成文字大小控制按钮
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 在`partnership/[id]/page.tsx`、`articles/[id]/page.tsx`、`qa/[id]/page.tsx`、`talks/[id]/page.tsx`、`interviews/[id]/page.tsx`、`letters/[year]/page.tsx`中添加`FontSizeControlFixed`组件
  - 确保按钮显示在页面头部右侧
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgment` TR-3.1: 按钮在所有文档详情页面显示
  - `human-judgment` TR-3.2: 按钮位置合理，不影响其他元素

## [x] Task 4: 确保文字大小控制功能正常工作
- **Priority**: high
- **Depends On**: Task 3
- **Description**: 
  - 验证CSS变量`--text-size-base`在全局样式中正确使用
  - 确保点击放大/缩小按钮后文字大小正确调整
  - 测试响应式表现
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgment` TR-4.1: 点击放大按钮文字变大
  - `human-judgment` TR-4.2: 点击缩小按钮文字变小
  - `human-judgment` TR-4.3: 按钮在不同屏幕尺寸下正常显示

## [x] Task 5: 回归测试确保修复不影响其他功能
- **Priority**: medium
- **Depends On**: Task 2, Task 3, Task 4
- **Description**: 
  - 测试所有文档详情页面的其他功能（导航、内容显示、链接跳转等）
  - 验证页面布局在修复后保持正常
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `human-judgment` TR-5.1: 页面其他功能无异常
  - `human-judgment` TR-5.2: 页面布局保持正常