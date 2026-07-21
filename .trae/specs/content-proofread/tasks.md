# 网页文档与 PDF 原版内容校对统一 - Implementation Plan

## 任务依赖关系
- Task 1（建立校对标准）→ 所有其他任务的前提
- Task 2~3（批量扫描识别差异）→ 可在 Task 1 后并行执行
- Task 4~8（分类校对修复）→ 可在扫描报告产出后并行或按序执行
- Task 9（抽检验证）→ 所有校对任务完成后执行

---

## [x] Task 1: 建立校对标准和规则文档
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 制定专业术语对照表：整理 PDF 原版中出现的所有人名、公司名、投资术语的标准译法
  - 定义文档格式规范：标题层级规则、序号格式、日期格式、货币格式、百分比格式
  - 创建对照映射表：明确每个网页文档对应的 PDF 源文件和对照路径
  - 定义"第三方内容"处理规则：明确哪些内容应删除、哪些应移至"编者注"区域
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `human-judgement` TR-1.1: 术语对照表覆盖所有人名、公司名、核心术语
  - `human-judgement` TR-1.2: 格式规范文档清晰可执行

## [ ] Task 2: 批量扫描合伙人信内容差异
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 使用自动化 diff 工具逐一对比 `content/partnership/` 与 `content/pdf-documents-formatted/` 中对应文件
  - 生成每份文件的差异报告（新增行、删除行、修改行）
  - 标记含第三方插入分析的文件
  - 标记含表格格式问题的文件
  - 输出汇总报告：差异文件清单、差异类型分布、差异严重度
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-2.1: 完成 24 份文件的差异扫描
  - `human-judgement` TR-2.2: 差异报告准确标注了实质性差异（忽略格式微调）

## [ ] Task 3: 批量扫描股东信内容差异
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 逐一对比 `content/letters/` 与 `content/pdf-documents-formatted/` 中对应文件
  - 生成每份文件的差异报告
  - 重点标记含第三方插入分析的文件（如 1965 年信）
  - 输出汇总报告
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-3.1: 完成 60 份文件的差异扫描
  - `human-judgement` TR-3.2: 差异报告准确标记了第三方插入内容

## [ ] Task 4: 修复合伙人信内容差异
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 依据 Task 2 差异报告，逐文件修复合伙人信中的内容偏差
  - 处理类型：
    - 第三方插入分析 → 移至文末"编者注"区域或删除
    - 内容改写 → 恢复为 PDF 原版内容
    - 表格格式错误 → 修复（参照 table-fix 规格的处理方式）
    - 术语/格式不一致 → 按规范统一
  - 修复完成后对每份文件做最终检查
- **Acceptance Criteria Addressed**: AC-1, AC-4
- **Test Requirements**:
  - `human-judgement` TR-4.1: 随机抽检 5 份修改过的文件，逐段与 PDF 对比验证
  - `human-judgement` TR-4.2: 确认无内容意外丢失

## [ ] Task 5: 修复股东信内容差异
- **Priority**: high
- **Depends On**: Task 3
- **Description**: 
  - 依据 Task 3 差异报告，逐文件修复股东信中的内容偏差
  - 重点清理第三方插入分析
  - 修复表格格式
  - 统一术语和格式
- **Acceptance Criteria Addressed**: AC-2, AC-4
- **Test Requirements**:
  - `human-judgement` TR-5.1: 随机抽检 5 份修改过的文件，逐段与 PDF 对比验证
  - `human-judgement` TR-5.2: 确认无内容意外丢失

## [ ] Task 6: 批量扫描文章类文档内容差异
- **Priority**: medium
- **Depends On**: Task 1
- **Description**: 
  - 逐一对比 `content/articles/` 与 `content/pdf-documents-formatted/` 中对应文件
  - 生成差异报告，标记需修复的文件
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-6.1: 完成 ~99 份文件的差异扫描

## [ ] Task 7: 修复文章类文档内容差异
- **Priority**: medium
- **Depends On**: Task 6
- **Description**: 
  - 依据 Task 6 差异报告，修复文章类文档中的内容偏差
  - 统一引用格式和脚注格式
- **Acceptance Criteria Addressed**: AC-3, AC-4
- **Test Requirements**:
  - `human-judgement` TR-7.1: 抽检 10 份文件，与 PDF 对比验证

## [x] Task 8: 术语和格式一致性批量修正
- **Priority**: medium
- **Depends On**: Task 1
- **Description**: 
  - 使用全局搜索替换，对跨文档的术语格式进行统一修正
  - 修正范围：人名大小写、百分比格式、货币格式、日期格式
  - 对每个替换操作先在 2-3 个文件中验证，确认无误后再全局执行
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `programmatic` TR-8.1: 通过正则扫描验证修正后的术语一致性
  - `human-judgement` TR-8.2: 确认替换未导致误伤（如将正确内容错误替换）

## [x] Task 9: 全量抽检验证
- **Priority**: high
- **Depends On**: Task 4, Task 5, Task 7, Task 8
- **Description**: 
  - 从已修改的文件中按类别抽检
  - 每类抽检 5-10 份，逐段与 PDF 对比
  - 验证修改质量：内容正确、格式统一、无退化
  - 编写校对报告，记录修改统计
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4, AC-5
- **Test Requirements**:
  - `human-judgement` TR-9.1: 所有抽检文件内容与 PDF 版一致
  - `human-judgement` TR-9.2: 无内容退化
  - `human-judgement` TR-9.3: 术语一致性达标
