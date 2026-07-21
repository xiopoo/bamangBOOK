# 信件分类优化与格式修正 - 实施计划

## [x] Task 1: 创建1956年合伙人信文件
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 从articles/巴菲特合伙契约_1956.md提取内容
  - 创建partnership_1956-巴菲特致合伙人信.md文件
  - 更新partnership.ts的PARTNERSHIP_YEAR_RANGE为[1956, 1970]
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: /partnership页面显示1956年条目
  - `programmatic` TR-1.2: 1956年合伙人信内容可正常访问
- **Notes**: 1956年是巴菲特合伙基金成立的第一年

## [x] Task 2: 修改分类逻辑，实现合伙人信与股东信严格分离
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 修改letters.ts的getLetterByYear，1965-1970年只返回股东信数据
  - 更新letters/[year]/page.tsx，移除合伙人信显示逻辑
  - 更新股东信列表页，移除"含合伙人信"标签
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-2.1: /letters/1965页面只显示股东信
  - `programmatic` TR-2.2: /partnership页面显示1956-1970年合伙人信
  - `human-judgment` TR-2.3: 股东信列表页无"含合伙人信"标签
- **Notes**: 需要确保1965-1970年两个时期的信件都能正常访问

## [x] Task 3: 扫描信件内容，确定编号格式修正方案
- **Priority**: medium
- **Depends On**: None
- **Description**: 
  - 扫描所有信件内容，统计"1、""2、"等编号格式的使用模式
  - 检查是否有误用##标记的编号项
  - 确定格式修正规则
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgment` TR-3.1: 完成编号格式使用情况报告
  - `human-judgment` TR-3.2: 确定格式修正规则
- **Notes**: 这是分析阶段，为后续实现做准备

## [x] Task 4: 修正编号格式渲染
- **Priority**: medium
- **Depends On**: Task 3
- **Description**: 
  - 更新ArticleContent.tsx的ReactMarkdown渲染配置
  - 将编号段落与标题区分渲染
  - 添加CSS样式确保编号段落以标准列表格式呈现
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgment` TR-4.1: 编号段落不以标题样式显示
  - `human-judgment` TR-4.2: 编号段落以标准列表格式呈现
- **Notes**: 需要使用remark或rehype插件处理

## [x] Task 5: 扫描信件内容，提取年度大事记
- **Priority**: medium
- **Depends On**: None
- **Description**: 
  - 扫描所有信件中的历史注释和重要事件记录
  - 确定大事记提取规则（如括号内注释、特定格式内容）
  - 创建大事记数据提取脚本
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgment` TR-5.1: 完成大事记内容分析报告
  - `programmatic` TR-5.2: 脚本能够提取大部分大事记内容
- **Notes**: 大事记内容格式多样，需要灵活的提取规则

## [x] Task 6: 设计并实现年度大事记展示组件
- **Priority**: medium
- **Depends On**: Task 5
- **Description**: 
  - 创建YearlyEvents组件，用于展示年度大事记
  - 在信件详情页面集成该组件
  - 添加CSS样式确保展示效果美观
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgment` TR-6.1: 信件详情页面显示"年度大事记"板块
  - `human-judgment` TR-6.2: 大事记内容展示清晰、规范
- **Notes**: 组件需要支持从信件内容中动态提取数据

## [x] Task 7: 审核并修正标题分类错误
- **Priority**: medium
- **Depends On**: None
- **Description**: 
  - 审核所有信件标题的分类归属
  - 修正错误分类的标题
  - 确保标题格式统一
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgment` TR-7.1: 所有信件标题分类准确
  - `human-judgment` TR-7.2: 标题格式统一规范
- **Notes**: 需要人工审核

## [x] Task 8: 项目构建验证
- **Priority**: high
- **Depends On**: Task 1, 2, 4, 6
- **Description**: 
  - 运行npm run build验证项目能够正常构建
  - 修复构建过程中出现的错误
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `programmatic` TR-8.1: 项目构建成功，exit code为0
- **Notes**: 构建过程中不应有任何错误