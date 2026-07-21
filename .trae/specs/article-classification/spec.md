# 文章人物分类系统 - 产品需求文档

## Overview
- **Summary**: 建立精准的人物识别机制，将网站内所有文章按归属人物进行准确分类，确保巴菲特和芒格等人物的文章能正确分配到各自对应的栏目中
- **Purpose**: 解决当前演讲类文章错误归类的问题，建立系统的文章人物分类体系
- **Target Users**: 网站管理员、内容编辑、普通读者

## Goals
- 建立文章与人物的关联机制，支持自动识别和手动标注
- 修改文档索引结构，添加人物标识字段
- 更新文档工具函数，支持按人物过滤内容
- 修改人物专区页面，只显示对应人物的文章
- 支持跨人物内容检索和推荐

## Non-Goals (Out of Scope)
- 不涉及文章内容本身的修改
- 不涉及新内容的创作
- 不涉及用户权限管理系统

## Background & Context
- 当前演讲类文章包含巴菲特和芒格的内容，但系统未按人物分类
- 文档索引文件（talks-index.json、interviews-index.json等）缺少人物标识字段
- 人物专区页面链接到统一的内容列表，无法区分归属人物
- 文章标题中已包含人物姓名（如"巴菲特：..."、"芒格：..."），可作为识别依据

## Functional Requirements
- **FR-1**: 在文档索引中添加 `person` 字段，标识文章归属人物
- **FR-2**: 创建人物识别工具函数，支持通过标题自动识别人物
- **FR-3**: 更新 `getDocuments` 函数，支持按人物ID过滤文档
- **FR-4**: 修改巴菲特专区页面，只显示巴菲特的演讲、访谈等内容
- **FR-5**: 修改芒格专区页面，只显示芒格的演讲、访谈等内容
- **FR-6**: 在文章详情页显示人物标签，支持点击跳转至对应人物专区
- **FR-7**: 支持跨人物内容检索，当文章涉及多人物时显示所有相关人物标签

## Non-Functional Requirements
- **NFR-1**: 人物识别准确率≥95%
- **NFR-2**: 页面加载速度不受影响，首屏加载时间<2秒
- **NFR-3**: 代码向后兼容，不影响现有功能
- **NFR-4**: 支持后续扩展新人物（段永平、唐朝等）

## Constraints
- **Technical**: Next.js 14 + React 18 + TypeScript + TailwindCSS 3
- **Dependencies**: 现有文档索引结构，文章标题格式需保持一致
- **Data**: 文章标题中包含人物姓名是识别的主要依据

## Assumptions
- 文章标题格式为"人物姓名：文章标题"或"人物姓名文章标题"
- 所有文章均属于特定人物或涉及多个人物
- 文档索引文件可修改，添加新字段

## Acceptance Criteria

### AC-1: 文档索引包含人物标识
- **Given**: 演讲索引文件 talks-index.json 存在
- **When**: 查看索引内容
- **Then**: 每篇文章包含 `person` 字段，值为人物ID（如 "buffett"、"munger"）
- **Verification**: `programmatic`

### AC-2: 人物识别函数可自动识别文章归属
- **Given**: 文章标题为"巴菲特：哥大商学院演讲 1984"
- **When**: 调用人物识别函数
- **Then**: 返回人物ID "buffett"
- **Verification**: `programmatic`

### AC-3: 文档工具函数支持按人物过滤
- **Given**: 调用 `getDocuments('talks', 'buffett')`
- **When**: 获取演讲文档列表
- **Then**: 返回仅包含巴菲特演讲的文档列表
- **Verification**: `programmatic`

### AC-4: 巴菲特专区显示正确的内容
- **Given**: 用户访问巴菲特专区的演讲页面
- **When**: 查看演讲列表
- **Then**: 只显示巴菲特的演讲，不包含芒格的演讲
- **Verification**: `human-judgment`

### AC-5: 芒格专区显示正确的内容
- **Given**: 用户访问芒格专区的演讲页面
- **When**: 查看演讲列表
- **Then**: 只显示芒格的演讲，不包含巴菲特的演讲
- **Verification**: `human-judgment`

### AC-6: 文章详情页显示人物标签
- **Given**: 用户访问一篇演讲文章详情页
- **When**: 查看文章头部信息
- **Then**: 显示文章归属人物的标签，可点击跳转至人物专区
- **Verification**: `human-judgment`

### AC-7: 支持跨人物内容检索
- **Given**: 一篇文章涉及多个人物（如巴菲特和芒格共同出席的活动）
- **When**: 查看文章详情页
- **Then**: 显示所有相关人物的标签
- **Verification**: `human-judgment`

## Open Questions
- [ ] 是否需要支持文章同时归属多个人物的场景？
- [ ] 是否需要提供后台管理界面手动编辑文章的人物归属？