# 表格显示问题修复 - The Implementation Plan (Decomposed and Prioritized Task List)

## [ ] Task 1: 修复 partnership_1961-annual 表格
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修复 5 个问题表格
  - 清理重复表头行（保留分隔符行上方紧邻的正确表头）
  - 修正列数不匹配问题
  - 清理尾部多余管道符 `||` 和空列
  - 保持所有数据不变
- **Acceptance Criteria Addressed**: AC-1, AC-4
- **Test Requirements**:
  - `programmatic` TR-1.1: 每个表格表头行数=1，表头列数=分隔符列数=数据行列数
  - `programmatic` TR-1.2: 表格数据行数和数据值与修复前一致
  - `human-judgement` TR-1.3: 人工核对 5 个表格的数据完整性，确认无内容丢失

## [ ] Task 2: 修复 partnership_1962-annual 表格
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修复 1 个问题表格（第69-78行附近）
  - 清理重复表头行（3行→1行）
  - 修正列数不匹配问题
  - 清理尾部多余管道符
  - 保持所有数据不变
- **Acceptance Criteria Addressed**: AC-1, AC-4
- **Test Requirements**:
  - `programmatic` TR-2.1: 表格表头行数=1，列数一致
  - `programmatic` TR-2.2: 数据值无变化
  - `human-judgement` TR-2.3: 人工核对数据完整性

## [ ] Task 3: 修复 partnership_1963-interim 表格
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修复 1 个严重问题表格（单元格内容合并）
  - 分析数据行的列数，推断正确的列划分
  - 修正表头中的管道符位置
  - 确保"道指"、"Mass.Inv. Trust"、"Investors Stock"、"Tri-Cont"、"Lehman"、"合伙公司"、"LP 合伙人"等列正确分离
- **Acceptance Criteria Addressed**: AC-1, AC-4
- **Test Requirements**:
  - `programmatic` TR-3.1: 表头列数=分隔符列数=数据行列数
  - `human-judgement` TR-3.2: 人工仔细核对每列标题与数据的对应关系，确认含义正确
  - `human-judgement` TR-3.3: 对比原文上下文（表格前后文字）验证列标题正确性

## [ ] Task 4: 修复 partnership_1964-annual 表格
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修复 1 个问题表格
  - 清理重复表头行（3行→1行）
  - 修正列数不匹配问题
  - 清理尾部多余管道符和空列
- **Acceptance Criteria Addressed**: AC-1, AC-4
- **Test Requirements**:
  - `programmatic` TR-4.1: 表格表头行数=1，列数一致
  - `human-judgement` TR-4.2: 人工核对数据完整性

## [ ] Task 5: 修复 partnership_1967-annual 表格
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修复 1 个问题表格
  - 清理重复表头行（3行→1行）
  - 修正列数不匹配问题
  - 清理尾部多余管道符和空列
- **Acceptance Criteria Addressed**: AC-1, AC-4
- **Test Requirements**:
  - `programmatic` TR-5.1: 表格表头行数=1，列数一致
  - `human-judgement` TR-5.2: 人工核对数据完整性

## [ ] Task 6: 修复合伙人信尾部空列问题（4个文件）
- **Priority**: medium
- **Depends On**: None
- **Description**: 
  - 修复 partnership_1964-interim、partnership_1966-interim、partnership_1967-interim、partnership_1968-interim 中的尾部空列
  - 清理每行末尾多余的 `|  |` 或 `||`
  - 确保所有行列数一致
- **Acceptance Criteria Addressed**: AC-1, AC-4
- **Test Requirements**:
  - `programmatic` TR-6.1: 每个表格的所有行列数一致
  - `human-judgement` TR-6.2: 人工抽查数据完整性

## [ ] Task 7: 修复股东信表格（berkshire_1983 和 berkshire_1994）
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修复 berkshire_1983 中的表格（5 行重复表头）
  - 修复 berkshire_1994 中的表格（5 行重复表头）
  - 清理重复表头行，保留正确的一行
  - 修正列数不匹配问题
  - 清理尾部空列
- **Acceptance Criteria Addressed**: AC-2, AC-4
- **Test Requirements**:
  - `programmatic` TR-7.1: 每个表格表头行数=1，列数一致
  - `human-judgement` TR-7.2: 人工核对两个表格的数据完整性

## [ ] Task 8: 优化表格 CSS 样式
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 统一样式来源：将表格样式统一到 globals.css 的 `.prose` 中，移除或简化 MarkdownContent 组件中的内联样式以避免冲突
  - 完善边框：添加 td/th 的左右边框，不仅是底边框
  - 添加斑马纹（隔行变色）提升可读性
  - 优化表头背景色与书房风格协调
  - 增强响应式：确保横向滚动容器正确工作
  - 完善暗色模式样式
  - 优化表格在移动端的显示（缩小内边距、字号）
- **Acceptance Criteria Addressed**: AC-3, AC-5
- **Test Requirements**:
  - `human-judgement` TR-8.1: 桌面端查看表格：边框完整、表头清晰、斑马纹明显
  - `human-judgement` TR-8.2: 移动端查看表格：横向滚动正常、内容可读
  - `human-judgement` TR-8.3: 暗色模式下表格对比度足够、样式协调
  - `human-judgement` TR-8.4: 表格与正文间距合理，不影响阅读体验

## [ ] Task 9: 全量验证和回归测试
- **Priority**: high
- **Depends On**: Task 1, Task 2, Task 3, Task 4, Task 5, Task 6, Task 7, Task 8
- **Description**: 
  - 启动开发服务器，访问所有修改过的页面
  - 验证每个修复过的表格显示正确
  - 检查未修改的表格是否受样式变更影响
  - 验证暗色模式
  - 验证移动端响应式
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4, AC-5
- **Test Requirements**:
  - `human-judgement` TR-9.1: 所有 11 个文件中的表格均正常显示
  - `human-judgement` TR-9.2: 未修改的文件表格显示正常（无回归）
  - `human-judgement` TR-9.3: 亮色/暗色模式切换正常
  - `human-judgement` TR-9.4: 移动端和桌面端均正常
