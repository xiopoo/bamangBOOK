# 全面检查与修改文章段落和表格内容 - 实施计划

## [x] Task 1: 修复表格列数不一致问题
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修改`convertTableToMarkdown`函数，确保表格列数一致
  - 处理表格头和表格数据列数不匹配的情况
  - 添加表格列数验证逻辑
  - 修复1965年报表格中的数据错误（"上"字）
- **Acceptance Criteria Addressed**: [AC-1, AC-4]
- **Test Requirements**:
  - `human-judgment` TR-1.1: 检查所有表格列数是否一致
  - `human-judgment` TR-1.2: 检查表格格式是否符合Markdown标准
  - `human-judgment` TR-1.3: 检查表格数据是否准确完整
- **Notes**: 需要特别注意跨行表格的处理

## [x] Task 2: 修复段落分隔问题
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 修改`cleanText`函数，确保段落之间有正确的空行分隔
  - 处理表格和段落之间的分隔问题
  - 添加段落分隔验证逻辑
  - 增强`shouldStartNewParagraph`函数，添加更多段落分隔条件
- **Acceptance Criteria Addressed**: [AC-2]
- **Test Requirements**:
  - `human-judgment` TR-2.1: 检查段落之间是否有正确的空行分隔
  - `human-judgment` TR-2.2: 检查表格和段落之间是否有正确的分隔
- **Notes**: 需要特别注意表格前后的段落分隔

## [x] Task 3: 修复表格头识别问题
- **Priority**: medium
- **Depends On**: Task 1
- **Description**: 
  - 修改`isTableHeader`函数，添加更多关键词用于识别表格头
  - 处理表格头跨行的情况
  - 添加表格头识别验证逻辑
  - 修复表格列名合并问题（如"Lehman | (2) Tri-Cont. (2) 道指 LP 合伙人"）
- **Acceptance Criteria Addressed**: [AC-3]
- **Test Requirements**:
  - `human-judgment` TR-3.1: 检查所有表格头是否被正确识别
  - `human-judgment` TR-3.2: 检查表格头是否被正确转换为Markdown表格格式
- **Notes**: 需要特别注意跨行表格头的处理

## [/] Task 4: 修改脚本输出到网站实际使用的目录
- **Priority**: high
- **Depends On**: Task 1, Task 2, Task 3
- **Description**: 
  - 修改`extract-with-format.js`脚本，将修复后的文档输出到网站实际使用的目录
  - 合伙人信输出到 `/content/partnership/` 目录
  - 股东信输出到 `/content/letters/` 目录
  - 专题文章输出到 `/content/articles/` 目录
  - 访谈输出到 `/content/interviews/` 目录
  - 演讲输出到 `/content/talks/` 目录
  - 更新索引文件
- **Acceptance Criteria Addressed**: [AC-5]
- **Test Requirements**:
  - `programmatic` TR-4.1: 检查文档是否输出到正确的目录
  - `programmatic` TR-4.2: 检查索引文件是否更新
- **Notes**: 需要确保文件名格式与网站现有文件一致

## [ ] Task 5: 运行修复脚本并生成新文档
- **Priority**: high
- **Depends On**: Task 4
- **Description**: 
  - 运行修复脚本，生成新的文档
  - 检查修复后的文档内容是否与原始内容一致
  - 验证修复后的文档格式符合Markdown标准
- **Acceptance Criteria Addressed**: [AC-6]
- **Test Requirements**:
  - `human-judgment` TR-5.1: 检查修复后的文档内容是否与原始内容一致
  - `human-judgment` TR-5.2: 检查修复后的文档格式是否符合Markdown标准
- **Notes**: 需要检查多个文档，确保修复效果一致

## [ ] Task 6: 校对修复后的文档
- **Priority**: high
- **Depends On**: Task 5
- **Description**: 
  - 校对修复后的文档，确保所有修改符合内容要求和格式标准
  - 检查表格数据是否准确完整
  - 检查文本内容是否准确无误、逻辑清晰、语言流畅
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3, AC-4, AC-6]
- **Test Requirements**:
  - `human-judgment` TR-6.1: 校对表格数据是否准确完整
  - `human-judgment` TR-6.2: 校对文本内容是否准确无误、逻辑清晰、语言流畅
- **Notes**: 需要仔细校对每个文档，确保修复效果符合要求
