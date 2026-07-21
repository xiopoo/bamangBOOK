# 网站修整项目全面评估 - Implementation Plan

## 任务依赖关系
- Task 1（规格文档梳理与分类）→ 后续所有任务的基础
- Task 2~6（6 个维度评估）→ 可在 Task 1 后并行执行
- Task 7（综合报告生成）→ 依赖 Task 2~6 的结果

---

## [ ] Task 1: 梳理所有规格文档，建立目标基线
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 读取 `.trae/specs/` 下全部 40 个规格文档
  - 按类别分组：内容建设、功能开发、设计UI、内容抓取、架构工程、其他
  - 提取每个规格的核心目标和验收标准
  - 建立"项目目标全景图"：列出所有规划目标、对应规格、当前状态
  - 输出：`.trae/specs/project-evaluation/spec-inventory.md`
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: 40 个规格文档全部纳入清单
  - `human-judgement` TR-1.2: 分类准确，每个规格的核心目标描述清晰

## [x] Task 2: 内容质量维度评估
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - 统计 `content/` 目录下所有内容文件数量（letters、partnership、articles、interviews、qa、talks、concepts、companies、people）
  - 检查内容校对完成度（基于 content-proofread 规格）
    - 合伙人信：24 封，已知修复了 7 个严重问题
    - 股东信：60 封，已知修复了 2 个表格问题
    - 文章：99 篇，已知 15 篇有换行差异
  - 检查表格修复完成度（基于 table-fix 规格）
    - 已修复的表格数量 vs 计划修复数量
  - 检查 PDF 对照覆盖情况
  - 输出内容质量评分和具体数据
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` TR-2.1: 所有内容分类的文件数量已统计
  - `human-judgement` TR-2.2: 内容质量评分有具体依据

## [ ] Task 3: 功能实现维度评估
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - 列出已实现的页面和功能模块
  - 对比规格中规划的功能，标记完成/部分完成/未开始
  - 核心功能验证：
    - 首页：统计数据、快速入口
    - 列表页：股东信、合伙人信、概念、公司、人物、演讲、访谈、QA、文章
    - 详情页：信件阅读、概念卡片、公司档案、人物档案
    - 工具：搜索、知识图谱、阅读历史、阅读进度、AI问答
    - 系统：暗色模式、字号调节
  - 输出功能完成度矩阵
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` TR-3.1: 所有页面路由已枚举
  - `human-judgement` TR-3.2: 功能完成度评级有依据

## [ ] Task 4: 界面设计维度评估
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - 检查设计系统统一性
    - Tailwind 配置中的 token（颜色、字体、圆角、阴影）
    - 页面中是否有硬编码色值
  - 检查公共组件复用情况（PageHeader、PageFooter、StatBadge、Sidebar 等）
  - 检查响应式设计：关键页面的移动端适配
  - 检查暗色模式支持：样式变量、组件适配
  - 评估设计一致性评分
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `human-judgement` TR-4.1: 设计系统评估有具体案例支撑
  - `human-judgement` TR-4.2: 公共组件复用率已统计

## [ ] Task 5: 知识图谱维度评估
- **Priority**: medium
- **Depends On**: Task 1
- **Description**:
  - 统计知识实体数量：概念、公司、人物
  - 检查交叉链接实现：`[[概念]]` 解析机制
  - 检查知识图谱页面功能：节点、连线、交互
  - 检查推荐系统：相关概念/公司/人物推荐
  - 评估知识图谱的深度和广度
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` TR-5.1: 实体数量已统计
  - `human-judgement` TR-5.2: 图谱功能完整性评估有依据

## [ ] Task 6: 工程质量维度评估
- **Priority**: medium
- **Depends On**: Task 1
- **Description**:
  - 代码组织检查：目录结构、模块划分
  - TypeScript 类型检查：运行 `npx tsc --noEmit` 查看错误数量
  - Lint 检查：运行 `npm run lint` 查看结果
  - 死代码检测：未使用的组件、未引用的文件
  - 构建验证：`next build` 是否成功
  - 组件复用率：公共组件 vs 页面内联组件
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` TR-6.1: TypeScript 和 lint 检查已运行
  - `human-judgement` TR-6.2: 工程质量评估有具体数据支撑

## [x] Task 7: 生成综合评估报告
- **Priority**: high
- **Depends On**: Task 2, Task 3, Task 4, Task 5, Task 6
- **Description**:
  - 汇总 6 个维度的评估结果
  - 计算整体完成度（加权平均）
  - 列出 Top 10 未达标项，分析原因
  - 提出改进建议，按优先级排序（P0/P1/P2）
  - 输出最终报告：`.trae/specs/project-evaluation/final-report.md`
- **Acceptance Criteria Addressed**: AC-3, AC-4
- **Test Requirements**:
  - `human-judgement` TR-7.1: 报告结构清晰，数据完整
  - `human-judgement` TR-7.2: 改进建议具体可操作
