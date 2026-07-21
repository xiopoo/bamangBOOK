# 巴菲特大事记栏目系统增强 - Implementation Plan

## [ ] Task 1: 大事记栏目组件视觉增强
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 更新 YearlyEvents.tsx 组件，添加栏目说明文字（"本文是巴菲特致股东/合伙人信的补充阅读材料，记录与信件内容相关的重大事件与历史背景。"）
  - 设计专属栏目标题样式（添加"补充阅读"标签徽章）
  - 强化栏目的背景边框样式，形成更明显的视觉区隔
  - 添加"查看完整年度大事记→"链接
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `human-judgment` TR-1.1: 栏目显示专属标题样式和说明文字
  - `human-judgment` TR-1.2: 栏目的背景/边框样式与正文有明显视觉区隔
  - `human-judgment` TR-1.3: 底部显示"查看完整年度大事记"链接

## [ ] Task 2: 更新数据模型支持主题标签
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 更新 EventItem 接口，添加 `tags` 字段（字符串数组）
  - 更新 yearly-events.ts 的解析逻辑，支持在 markdown 中解析 `[tag1,tag2]` 格式的主题标签
  - 更新 YearlyEvents 组件的 props，支持传入 `filterTag` 参数进行主题过滤
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-2.1: 解析含主题标签的事件条目，返回正确的 tags 数组
  - `programmatic` TR-2.2: 无标签的事件 tags 为空数组
  - `programmatic` TR-2.3: 按 filterTag 过滤后只返回匹配的事件

## [ ] Task 3: 为大事记条目添加主题标签
- **Priority**: high
- **Depends On**: Task 2
- **Description**:
  - 分析现有 yearly-events.md 内容，识别事件的类别（收购、投资、法规、人物、行业背景等）
  - 为每个条目添加 `[收购]` `[投资]` `[法规]` `[人物]` `[行业]` `[伯克希尔]` 等主题标签
  - 更新时间较早的条目补充更准确的标签
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgment` TR-3.1: 标签分类合理，覆盖主要类别
  - `human-judgment` TR-3.2: 标签格式正确，能被解析逻辑识别

## [ ] Task 4: 信件详情页传递主题上下文
- **Priority**: medium
- **Depends On**: Task 2
- **Description**:
  - 在 partnership/[id]/page.tsx 和 letters/[year]/page.tsx 中
  - 根据信件内容动态确定主题关键词（如 "收购"、"投资理念"等）
  - 传递给 YearlyEvents 组件的 filterTag 参数，实现主题匹配
  - 若无匹配事件，回退显示按年份获取的常规事件
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgment` TR-4.1: 特定主题的信件显示相关主题事件
  - `human-judgment` TR-4.2: 无主题匹配时正常显示年度事件

## [ ] Task 5: 创建内容更新维护脚本
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - 更新 scripts/extract-yearly-events.js，支持添加主题标签
  - 添加脚本注释文档，说明如何添加/修改/删除事件
  - 创建 README 说明内容更新流程
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgment` TR-5.1: 脚本能够正确提取并标记主题标签
  - `human-judgment` TR-5.2: 更新文档清晰完整

## [ ] Task 6: 项目构建验证
- **Priority**: high
- **Depends On**: Task 1, Task 2, Task 4
- **Description**:
  - 运行 npm run build 验证项目能够正常构建
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4
- **Test Requirements**:
  - `programmatic` TR-6.1: npm run build 成功完成（exit code 0）

# Task Dependencies
- Task 4 depends on Task 2
- Task 3 depends on Task 2
- Task 6 depends on Task 1, Task 2, Task 4