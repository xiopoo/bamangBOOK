# 巴菲特大事记重要事件显要标记 - Implementation Plan

## [x] Task 1: 更新数据模型支持重要事件标记
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 更新 `yearly-events.ts` 数据模型，添加 `isImportant` 字段
  - 修改解析逻辑，识别重要事件标记（如 `***` 前缀）
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: 解析包含重要事件标记的 markdown 文件，返回正确的 `isImportant` 值
  - `programmatic` TR-1.2: 未标记的普通事件 `isImportant` 为 false

## [x] Task 2: 更新年度大事记展示组件
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 更新 `YearlyEvents.tsx` 组件，对重要事件应用视觉强化样式
  - 重要事件显示为加粗、变色、带边框的样式
  - 普通事件保持原有样式不变
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `human-judgment` TR-2.1: 重要事件显示为加粗、变色、带边框的样式
  - `human-judgment` TR-2.2: 普通事件保持原有样式不变
  - `human-judgment` TR-2.3: 事件按年份分组，自然分段结构保持不变

## [x] Task 3: 梳理并标记重要事件
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 系统性梳理 `yearly-events.md` 内容
  - 识别具有里程碑意义、重大转折或标志性的事件
  - 在重要事件前添加 `***` 标记
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgment` TR-3.1: 合伙基金成立、伯克希尔收购等里程碑事件均被标记
  - `human-judgment` TR-3.2: 重要事件标记准确，无遗漏或误标

## [x] Task 4: 项目构建验证
- **Priority**: high
- **Depends On**: Task 1, Task 2, Task 3
- **Description**: 
  - 运行 npm run build 验证项目能够正常构建
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4
- **Test Requirements**:
  - `programmatic` TR-4.1: npm run build 成功完成（exit code 0）