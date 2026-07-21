# 信件结尾清理与阅读库重构 Spec

## Why
合伙人信末尾存在大量非原始内容的附加信息（大事记条目、阅读推荐、人物简介等），这些附加信息破坏了原始信件的完整性，需要系统性地清理。同时，侧边栏"工具区"导航需要清理，阅读库的内容组织方式需要按照作者和文章类别进行重组。

## What Changes

### 一、信件结尾清理
- **扫描全部 24 封合伙人信**，定位所有"沃伦·巴菲特"署名后的非原始内容
- 以 **1959 年合伙人信**的末尾格式为标准模板（仅以"沃伦·巴菲特"署名结尾，无任何附加内容）
- 建立冗余信息特征库，识别并删除以下类型的非原始内容：
  - 人物生平介绍（如"结识一生的搭档查理芒格..."）
  - 大事记条目（如"1960 年开始加入的门槛提高到 8000 美元"）
  - 阅读推荐（如"1962 年持仓明细请延伸阅读陈蔚文..."）
  - 英文语录/引用
  - 其他非来源信件原文的注释性内容
- 删除后进行二次校验，确保仅删除附加内容，不影响原始信件主体

### 二、工具区导航栏清理
- **删除** Sidebar.tsx 中的"工具区"（toolsSection）整个区域
- 清理相关状态变量（expandedTools, isToolsActive 等）

### 三、阅读库内容重组
- 将 `content/` 下所有文章按以下维度重新组织：
  1. **作者分类**：巴菲特、芒格、施洛斯、其他
  2. **文章类别**：合伙人信、股东信、演讲、访谈、文章、公司分析等
- 创建符合新结构的索引文件
- 确保迁移后内容完整，图片等附属元素不受影响

## Impact
- Affected code:
  - 24 个合伙人信 markdown 文件（`content/partnership/*.md`）
  - `src/components/Sidebar.tsx` — 删除工具区导航
  - 阅读库相关页面组件（可能需要修改）
  - 阅读库索引/路由配置

## ADDED Requirements

### Requirement: 信件结尾净化
The system SHALL strip all non-original content appended after "沃伦·巴菲特" signature in partnership letters.

#### Scenario: 检测并删除非原始内容
- **WHEN** 扫描合伙人信文件中"沃伦·巴菲特"署名后的所有行
- **THEN** 识别并删除非原始内容，保留署名位置不变

### Requirement: 工具区导航删除
The system SHALL remove the "工具区" section from the sidebar navigation.

#### Scenario: 清理导航栏
- **WHEN** 用户在侧边栏中查看导航选项
- **THEN** 不再显示"工具区"及其子项（概念、公司、人物、知识图谱、搜索、阅读历史、AI对话、思维模型、阅读库）

### Requirement: 阅读库按作者分类
The system SHALL reorganize reading library content by author and article category.

#### Scenario: 按作者查看文章
- **WHEN** 用户进入阅读库
- **THEN** 首先按作者（巴菲特/芒格/施洛斯/其他）分类显示
- **WHEN** 用户选择一个作者
- **THEN** 显示该作者下按文章类别（演讲/访谈/文章等）分类的内容

## REMOVED Requirements

### Requirement: 工具区导航栏
**Reason**: 工具区导航栏中的功能链接与核心人物主导航体系重叠，且部分功能（AI对话、搜索等）可通过其他入口访问，导航栏清理有助于聚焦以人为核心的内容组织架构。
**Migration**: 各功能页面仍然可通过直接 URL 访问（如 /search, /graph, /talk 等），只是从侧边栏导航中移除。

## 验收标准
- 所有合伙人信结尾非原始内容 100% 清除
- 工具区导航栏 100% 从 Sidebar 中移除
- 阅读库按作者-文章类别双维度组织
- 构建通过，无功能性损失
