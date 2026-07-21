# 巴菲特股东信PDF格式修复 - 实施计划

## [x] Task 1: 修复目录条目识别问题
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修改`isPageSeparator`函数，添加对前后空白字符的支持
  - 修改`isTableOfContentsEntry`函数，增加页面分隔符检查，确保跳过目录区域
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgement` TR-1.1: 检查"伯克希尔与标普 500 指数"文件内容是否为表格数据而非股东大会问答
- **Notes**: 修复了页面分隔符正则表达式不匹配的问题

## [x] Task 2: 修复同名文档覆盖问题
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 修改`generateFileName`函数，添加索引参数支持
  - 在提取主循环中添加标题计数逻辑，为同名标题生成不同的文件名
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-2.1: 检查输出目录中是否存在多个同名文件（如`伯克希尔与标普_500_指数.md`和`伯克希尔与标普_500_指数_1.md`）
- **Notes**: 使用`titleCountMap`对象跟踪每个标题出现的次数

## [x] Task 3: 实现表格识别和转换功能
- **Priority**: high
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 修改`isTableHeader`函数，使用普通空格分割而非`\s`正则
  - 修改`isTableData`函数，使用普通空格分割
  - 修改`convertTableToMarkdown`函数，使用普通空格分割
  - 添加`isBusinessTableData`函数，识别业务版图表格数据
  - 修改`cleanText`函数，集成业务表格识别逻辑
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgement` TR-3.1: 检查"伯克希尔与标普 500 指数"文件中的表格是否转换为Markdown格式
  - `human-judgement` TR-3.2: 检查"伯克希尔业务版图"文件中的表格是否转换为Markdown格式
- **Notes**: 修复了`\s`正则表达式不匹配空格的问题