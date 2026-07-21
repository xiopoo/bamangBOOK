# 扩展巴菲特知识网络 - 实施计划

## [ ] Task 1: 整理股东信到content/letters目录
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 创建脚本将新提取的60封股东信（1965-2024）整理到content/letters目录
  - 文件命名与现有格式保持一致：berkshire_YYYY-巴菲特致股东信.md
  - 更新letters-index.json索引文件
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: 60封股东信成功复制到content/letters目录
  - `programmatic` TR-1.2: letters-index.json包含完整元数据
  - `human-judgment` TR-1.3: 文件命名符合现有格式

## [ ] Task 2: 整理合伙人信到content/partnership目录
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 创建脚本将新提取的23封合伙人信（1956-1970）整理到content/partnership目录
  - 文件命名与现有格式保持一致
  - 更新合伙人信索引文件
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-2.1: 23封合伙人信成功复制到content/partnership目录
  - `programmatic` TR-2.2: 索引文件包含完整元数据
  - `human-judgment` TR-2.3: 文件命名符合现有格式

## [ ] Task 3: 创建演讲类文档目录和页面
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 创建content/talks目录，整理17篇演讲类文档
  - 创建/src/app/talks/page.tsx页面
  - 创建/src/app/talks/[id]/page.tsx阅读页面
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-3.1: 17篇演讲文档成功复制到content/talks目录
  - `human-judgment` TR-3.2: /talks页面展示演讲列表，按年份分组
  - `human-judgment` TR-3.3: 演讲阅读页面格式与现有风格一致

## [ ] Task 4: 创建访谈类文档目录和页面
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 创建content/interviews目录，整理32篇访谈类文档
  - 创建/src/app/interviews/page.tsx页面
  - 创建/src/app/interviews/[id]/page.tsx阅读页面
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-4.1: 32篇访谈文档成功复制到content/interviews目录
  - `human-judgment` TR-4.2: /interviews页面展示访谈列表，按年份分组
  - `human-judgment` TR-4.3: 访谈阅读页面格式与现有风格一致

## [ ] Task 5: 创建问答类文档目录和页面
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 创建content/qa目录，整理40篇股东大会问答类文档
  - 创建/src/app/qa/page.tsx页面
  - 创建/src/app/qa/[id]/page.tsx阅读页面
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `programmatic` TR-5.1: 40篇问答文档成功复制到content/qa目录
  - `human-judgment` TR-5.2: /qa页面展示问答列表，按年份分组
  - `human-judgment` TR-5.3: 问答阅读页面格式与现有风格一致

## [ ] Task 6: 创建专题文章目录和页面
- **Priority**: medium
- **Depends On**: Task 1
- **Description**: 
  - 创建content/articles目录，整理81篇专题文章类文档
  - 创建/src/app/articles/page.tsx页面
  - 创建/src/app/articles/[id]/page.tsx阅读页面
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic` TR-6.1: 81篇文章成功复制到content/articles目录
  - `human-judgment` TR-6.2: /articles页面展示文章列表，按主题分组
  - `human-judgment` TR-6.3: 文章阅读页面格式与现有风格一致

## [ ] Task 7: 更新首页和导航
- **Priority**: medium
- **Depends On**: Task 1-6
- **Description**: 
  - 更新首页统计数据，包含新内容类型
  - 添加新内容分类入口卡片
  - 更新导航菜单，添加演讲、访谈、问答等链接
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `human-judgment` TR-7.1: 首页展示新内容统计数据
  - `human-judgment` TR-7.2: 导航菜单包含新分类入口
  - `human-judgment` TR-7.3: 入口卡片链接正确

## [ ] Task 8: 更新知识索引和图谱
- **Priority**: medium
- **Depends On**: Task 1-6
- **Description**: 
  - 更新content/index.json，融入新内容统计
  - 更新知识图谱数据接口，包含新文档节点
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `programmatic` TR-8.1: index.json包含新内容统计数据
  - `human-judgment` TR-8.2: 知识图谱包含新文档节点

## [ ] Task 9: 验证和测试
- **Priority**: high
- **Depends On**: Task 1-8
- **Description**: 
  - 验证所有页面功能正常
  - 检查链接完整性和导航正确性
  - 测试响应式布局在移动端的表现
- **Acceptance Criteria Addressed**: 所有AC
- **Test Requirements**:
  - `human-judgment` TR-9.1: 所有页面可正常访问
  - `human-judgment` TR-9.2: 链接无404错误
  - `human-judgment` TR-9.3: 移动端布局正常