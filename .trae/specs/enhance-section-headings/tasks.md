# 章节标题增强 - 实施计划

## [x] Task 1: 分析现有内容结构和标题组件
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 分析合伙信、股东信、文章等 markdown 内容的结构
  - 查看现有的 ArticleContent、LetterReader、MarkdownContent 组件实现
  - 确定需要添加的章节标题类型和层级
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3]
- **Test Requirements**:
  - `programmatic` TR-1.1: 确认所有内容页面使用的组件类型和渲染方式
  - `human-judgement` TR-1.2: 分析内容结构，确定章节划分逻辑

## [x] Task 2: 设计统一的章节标题样式
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 设计 h2-h4 层级标题的样式（字体大小、颜色、间距、边框等）
  - 确保样式与现有设计体系一致
  - 添加适当的视觉分隔符增强可读性
- **Acceptance Criteria Addressed**: [AC-4]
- **Test Requirements**:
  - `human-judgement` TR-2.1: 标题样式与页面其他元素协调一致
  - `human-judgement` TR-2.2: 标题层级清晰可辨

## [x] Task 3: 增强 ArticleContent 组件支持章节标题
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 修改 ArticleContent 组件，添加自定义标题渲染规则
  - 确保 markdown 中的 h2-h4 标签使用统一样式
  - 添加锚点链接支持
- **Acceptance Criteria Addressed**: [AC-1, AC-4]
- **Test Requirements**:
  - `programmatic` TR-3.1: 合伙信页面 h2-h4 标题正确渲染
  - `human-judgement` TR-3.2: 标题样式美观、层级清晰

## [x] Task 4: 增强 LetterReader 组件支持章节标题
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 修改 LetterReader 组件，添加自定义标题渲染规则
  - 确保 markdown 中的 h2-h4 标签使用统一样式
  - 添加锚点链接支持
- **Acceptance Criteria Addressed**: [AC-2, AC-4]
- **Test Requirements**:
  - `programmatic` TR-4.1: 股东信页面 h2-h4 标题正确渲染
  - `human-judgement` TR-4.2: 标题样式美观、层级清晰

## [x] Task 5: 增强 MarkdownContent 组件支持章节标题
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 修改 MarkdownContent 组件，添加自定义标题渲染规则
  - 确保 markdown 中的 h2-h4 标签使用统一样式
  - 添加锚点链接支持
- **Acceptance Criteria Addressed**: [AC-3, AC-4]
- **Test Requirements**:
  - `programmatic` TR-5.1: 文章页面 h2-h4 标题正确渲染
  - `human-judgement` TR-5.2: 标题样式美观、层级清晰

## [x] Task 6: 优化目录组件支持新标题结构
- **Priority**: medium
- **Depends On**: Task 3, Task 4, Task 5
- **Description**: 
  - 修改 ArticleTableOfContents 组件，确保正确提取和显示章节标题
  - 支持锚点导航到各个章节
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3]
- **Test Requirements**:
  - `programmatic` TR-6.1: 目录组件正确提取页面中的 h2-h4 标题
  - `human-judgement` TR-6.2: 目录导航功能正常工作

## [x] Task 7: 验证所有页面的章节标题效果
- **Priority**: high
- **Depends On**: Task 3, Task 4, Task 5, Task 6
- **Description**: 
  - 访问合伙信、股东信、文章等代表性页面
  - 验证章节标题的显示效果和样式一致性
  - 测试目录导航功能
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3, AC-4]
- **Test Requirements**:
  - `human-judgement` TR-7.1: 所有页面章节标题显示正确
  - `human-judgement` TR-7.2: 标题样式一致、美观
  - `human-judgement` TR-7.3: 目录导航功能正常