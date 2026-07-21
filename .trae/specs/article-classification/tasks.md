# 文章人物分类系统 - 实施计划

## [x] Task 1: 创建人物识别工具函数
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 在 `src/lib/people.ts` 中添加人物识别函数 `identifyPerson`
  - 通过文章标题自动识别归属人物
  - 支持多种标题格式（如"巴菲特：..."、"巴菲特太阳谷演讲"等）
  - 支持返回多个人物（当标题涉及多人时）
- **Acceptance Criteria Addressed**: [AC-2]
- **Test Requirements**:
  - `programmatic` TR-1.1: 函数能正确识别标题中的人物 ✓
  - `programmatic` TR-1.2: 函数返回正确的人物ID数组 ✓
- **Notes**: 需要处理边界情况，如标题中不包含已知人物的情况

## [x] Task 2: 更新文档索引结构，添加人物标识字段
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 更新 `DocumentItem` 接口，添加 `person` 字段（支持单人和多人）
  - 更新 `talks-index.json`，为每篇文章添加人物标识
  - 更新 `interviews-index.json`，为每篇文章添加人物标识
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `programmatic` TR-2.1: 索引文件包含person字段 ✓
  - `human-judgement` TR-2.2: 人物标识准确无误 ✓
- **Notes**: 已为所有演讲和访谈文章添加了人物标识

## [x] Task 3: 更新文档工具函数，支持按人物过滤
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 更新 `getDocuments` 函数，支持可选的人物ID参数
  - 添加 `getDocumentsByPerson` 函数，按人物ID获取文档
  - 添加 `countDocumentsByPerson` 函数，统计人物相关文档数量
  - 更新 `getDocumentByFileName` 函数，返回文档时包含人物信息
- **Acceptance Criteria Addressed**: [AC-3]
- **Test Requirements**:
  - `programmatic` TR-3.1: `getDocuments('talks', 'buffett')` 返回正确结果 ✓
  - `programmatic` TR-3.2: `getDocuments('talks', 'munger')` 返回正确结果 ✓
- **Notes**: 保持向后兼容，不传递人物参数时返回全部文档

## [x] Task 4: 修改巴菲特专区页面，按人物过滤内容
- **Priority**: high
- **Depends On**: Task 3
- **Description**: 
  - 修改 `BuffettContent.tsx`，演讲、访谈等板块只显示巴菲特的内容
  - 更新统计数据，显示巴菲特相关文章的数量（12场演讲 + 32场访谈）
  - 链接指向过滤后的内容列表（如 `/talks?person=buffett`）
- **Acceptance Criteria Addressed**: [AC-4]
- **Test Requirements**:
  - `human-judgement` TR-4.1: 巴菲特专区演讲列表只显示巴菲特的演讲 ✓
  - `human-judgement` TR-4.2: 统计数据准确反映巴菲特的文章数量 ✓
- **Notes**: 已完成

## [x] Task 5: 修改芒格专区页面，按人物过滤内容
- **Priority**: high
- **Depends On**: Task 3
- **Description**: 
  - 修改 `MungerContent.tsx`，演讲板块只显示芒格的内容
  - 更新统计数据，显示芒格相关文章的数量（5场演讲）
  - 链接指向过滤后的内容列表（如 `/talks?person=munger`）
- **Acceptance Criteria Addressed**: [AC-5]
- **Test Requirements**:
  - `human-judgement` TR-5.1: 芒格专区演讲列表只显示芒格的演讲 ✓
  - `human-judgement` TR-5.2: 统计数据准确反映芒格的文章数量 ✓
- **Notes**: 已完成

## [x] Task 6: 更新文章详情页，显示人物标签
- **Priority**: medium
- **Depends On**: Task 2
- **Description**: 
  - 修改演讲详情页（`/talks/[id]/page.tsx`），显示文章归属人物标签
  - 人物标签支持点击跳转至对应人物专区
- **Acceptance Criteria Addressed**: [AC-6, AC-7]
- **Test Requirements**:
  - `human-judgement` TR-6.1: 文章详情页显示人物标签 ✓
  - `human-judgement` TR-6.2: 人物标签可点击跳转至人物专区 ✓
- **Notes**: 已完成

## [x] Task 7: 验证文章分类效果
- **Priority**: high
- **Depends On**: Task 4-6
- **Description**: 
  - 验证巴菲特专区显示正确的内容
  - 验证芒格专区显示正确的内容
  - 验证文章详情页人物标签显示正确
  - 验证页面加载速度不受影响
- **Acceptance Criteria Addressed**: [AC-4, AC-5, AC-6, AC-7]
- **Test Requirements**:
  - `human-judgement` TR-7.1: 所有分类功能正常工作 ✓
  - `programmatic` TR-7.2: 项目构建成功，无错误 ✓
- **Notes**: 项目构建成功，所有修改已验证