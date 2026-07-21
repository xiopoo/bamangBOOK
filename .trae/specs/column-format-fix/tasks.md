# 分栏格式检查与修正 - 实施计划

## [x] Task 1: 分析分栏问题
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 查看1966年合伙人信文档，分析"麻省投资信托"表格的分栏问题
  - 分析表格结构和数据格式，确定正确的分栏方式
- **Acceptance Criteria Addressed**: [AC-1, AC-2]
- **Test Requirements**:
  - `human-judgment` TR-1.1: 分析1966年合伙人信文档中的分栏问题
  - `human-judgment` TR-1.2: 分析表格结构和数据格式

## [x] Task 2: 创建分栏修复脚本
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 创建一个新的Node.js脚本 `fix-column-format.js`
  - 实现表格分栏识别逻辑，正确修复分栏错位问题
  - 实现空栏消除逻辑，确保表格列数一致
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3]
- **Test Requirements**:
  - `human-judgment` TR-2.1: 检查修复脚本是否能正确识别分栏问题
  - `human-judgment` TR-2.2: 检查修复脚本是否能正确消除空栏问题
  - `human-judgment` TR-2.3: 检查修复脚本是否能正确处理表格数据

## [x] Task 3: 运行修复脚本修复合伙人信文档分栏
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 运行修复脚本，修复 `/content/partnership/` 目录下所有合伙人信文档的分栏问题
  - 检查修复后的表格格式是否正确
  - 验证修复后的表格数据是否准确完整
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3]
- **Test Requirements**:
  - `programmatic` TR-3.1: 检查 `content/partnership/` 目录是否有正确数量的文档
  - `human-judgment` TR-3.2: 检查所有合伙人信文档的分栏格式是否正确
  - `human-judgment` TR-3.3: 检查所有合伙人信文档的表格数据是否准确完整

## [x] Task 4: 运行修复脚本修复其他文档分栏
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 运行修复脚本，修复 `/content/letters/`、`/content/articles/` 等目录下所有文档的分栏问题
  - 检查修复后的表格格式是否正确
  - 验证修复后的表格数据是否准确完整
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3]
- **Test Requirements**:
  - `programmatic` TR-4.1: 检查各目录是否有正确数量的文档
  - `human-judgment` TR-4.2: 检查所有文档的分栏格式是否正确
  - `human-judgment` TR-4.3: 检查所有文档的表格数据是否准确完整

## [x] Task 5: 校对修复后的分栏格式
- **Priority**: high
- **Depends On**: Task 3, Task 4
- **Description**: 
  - 校对修复后的所有表格，确保所有修改符合内容要求和格式标准
  - 检查表格数据是否准确完整
  - 检查表格格式是否符合Markdown标准
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3, AC-4]
- **Test Requirements**:
  - `human-judgment` TR-5.1: 校对表格数据是否准确完整
  - `human-judgment` TR-5.2: 校对表格格式是否符合Markdown标准