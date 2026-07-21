# 项目规格文档全景清单

## 概览
- 总规格数: 43
- 内容建设类: 17
- 功能开发类: 10
- 设计/UI类: 6
- 内容抓取/同步类: 4
- 架构/工程类: 4
- 其他: 2

---

## 一、内容建设类（17个）
| 规格 | 核心目标 | 验收标准数 | 状态 |
|------|---------|-----------|------|
| content-proofread | 网页文档与PDF原版内容校对统一，消除第三方插入内容 | 5 | 进行中 |
| expand-knowledge-network | 用268篇新文档填充网站框架，扩展演讲/访谈/QA/文章分类 | 8 | 未开始 |
| fill-concept-misconceptions | 为36个投资概念卡片填充"常见误解"部分 | 3 | 已完成 |
| fill-letter-content | 确保股东信与合伙人信内容完整可访问，优化排版展示 | - | 已完成 |
| organize-shareholder-letters | 系统整理股东信与合伙人信，去重排序，知识图谱完善 | - | 已完成 |
| letter-classification-optimization | 建立合伙人信与股东信独立分类，补充1956年信件 | 5 | 已完成 |
| milestone-highlight | 对大事记中里程碑事件进行视觉强化标记 | 4 | 已完成 |
| yearly-events-enhancement | 大事记栏目系统增强，添加视觉区隔与主题匹配 | 4 | 未开始 |
| document-format-unification | 所有文档类型统一执行表格识别与小标题处理 | 6 | 进行中 |
| comprehensive-doc-fix | 全面修复文章段落与表格内容格式问题 | 7 | 已完成 |
| fix-documents-format | 修复表格列数、段落分隔、表格头识别等问题 | 6 | 进行中 |
| table-fix | 系统修复所有Markdown表格格式与CSS样式问题 | 5 | 未开始 |
| table-column-fix | 修复表格栏位分类错误与数据错位 | 5 | 进行中 |
| table-column-classification | 修复年份列偏移、重复表头、数据错位 | 4 | 已完成 |
| table-comprehensive-fix | 全面修复表格被合并为一行文本的问题 | 4 | 已完成 |
| column-format-fix | 修正分栏错位，消除空栏，确保麻省投资信托等条目完整 | 4 | 已完成 |
| pdf-format-fix | 修复PDF提取脚本，表格识别与目录过滤 | 3 | 已完成 |

---

## 二、功能开发类（10个）
| 规格 | 核心目标 | 验收标准数 | 状态 |
|------|---------|-----------|------|
| build-knowledge-graph-connections | 建立内容间网状联系，创建知识图谱API与可视化页面 | - | 进行中 |
| knowledge-graph-enhancement | 增强知识图谱，添加概念索引、股东大会Q&A | - | 进行中 |
| concept-evolution | AI提取概念，追踪思想演变，构建知识图谱 | 6 | 进行中 |
| replicate-learnbuffett | 1:1像素级复刻对标网站，重构首页与详情页 | - | 进行中 |
| four-core-features-enhancement | 添加搜索、知识图谱、阅读进度、暗黑模式四大功能 | - | 已完成 |
| improve-markdown-rendering | 优化Markdown渲染，支持关键词链接与表格 | - | 已完成 |
| build-partnership-list-page | 新增合伙人信列表页，支持多版本信件展示 | - | 已完成 |
| fix-content-detail-pages | 修复概念/人物/公司详情页渲染问题，抽取公共组件 | - | 已完成 |
| nav-restructure-by-person | 导航按人物维度重构，巴菲特为一级导航 | 3 | 进行中 |
| fix-company-links-and-counts | 修复公司引用数量统计与双括号链接跳转 | - | 已完成 |

---

## 三、设计/UI类（6个）
| 规格 | 核心目标 | 验收标准数 | 状态 |
|------|---------|-----------|------|
| frontend-quality-overhaul | 前台页面质量大扫除，统一设计系统，修复渲染Bug | - | 进行中 |
| site-structure-and-style-redesign | 双栏布局重构，"复利书房"主题风格改造 | - | 已完成 |
| fix-design-consistency | 修复CSS语法错误，统一PageContainer与PageHeader组件 | 4 | 已完成 |
| visual-display-fix | 系统性排查修复布局错乱与响应式问题 | - | 已完成 |
| sidebar-fontsize-fix | 修复右侧导览竖排显示与文字大小控制功能 | 5 | 已完成 |
| yearly-events-redesign | 大事记板块移至正文末尾，独立补充栏目视觉区隔 | 5 | 已完成 |

---

## 四、内容抓取/同步类（4个）
| 规格 | 核心目标 | 验收标准数 | 状态 |
|------|---------|-----------|------|
| comprehensive-web-scraping | 全面网页抓取解决方案，支持JS渲染与分页 | 5 | 进行中 |
| crawl-website-content | 网站内容抓取 | - | 未开始 |
| extract-letters-from-pdf | 从PDF合集提取股东信，按年份拆分为Markdown | 5 | 已完成 |
| clean-external-link-and-internalize | 删除对标站点外链，替换为内部路由 | - | 已完成 |

---

## 五、架构/工程类（4个）
| 规格 | 核心目标 | 验收标准数 | 状态 |
|------|---------|-----------|------|
| rebuild-buffett-knowledge-base | 从零构建巴菲特知识库，维基百科式结构 | 4 | 未开始 |
| modular-knowledge-platform | 模块化价值投资知识平台，预留扩展接口 | 5 | 已完成 |
| init-fuli-study-framework | 复利书房项目框架初始化，导航与首页搭建 | - | 已完成 |
| site-wide-link-responsive-audit | 全站链接有效性与响应式适配审计 | - | 进行中 |

---

## 六、其他（2个）
| 规格 | 核心目标 | 验收标准数 | 状态 |
|------|---------|-----------|------|
| solution-recommendations | 网站优化解决方案建议，导航/阅读/搜索/推荐 | - | 进行中 |
| project-evaluation | 项目全面评估，6大维度完成度检查 | 4 | 进行中 |

---

## 项目阶段划分

### 第一阶段：基础搭建（7个规格）
- **初始定位**：项目从0到1的框架与核心内容基础
- init-fuli-study-framework - 复利书房项目框架初始化
- rebuild-buffett-knowledge-base - 知识库初始构建（规划中）
- modular-knowledge-platform - 模块化知识平台架构
- extract-letters-from-pdf - 从PDF提取股东信内容
- improve-markdown-rendering - Markdown渲染基础能力
- fill-letter-content - 信件内容填充与展示
- build-partnership-list-page - 合伙人信列表页

### 第二阶段：内容扩展（17个规格）
- **核心定位**：大规模内容扩充与格式规范化
- expand-knowledge-network - 扩展268篇文档与新分类
- content-proofread - PDF原版内容校对
- fill-concept-misconceptions - 概念误解填充
- organize-shareholder-letters - 信件系统整理
- letter-classification-optimization - 信件分类优化
- pdf-format-fix - PDF提取格式修复
- column-format-fix - 分栏格式修正
- table-comprehensive-fix - 表格全面修复
- table-column-classification - 表格栏位分类
- fix-documents-format - 文档格式修复
- comprehensive-doc-fix - 全面文档修复
- document-format-unification - 文档格式统一
- table-fix - 表格显示修复
- table-column-fix - 表格栏位修复
- milestone-highlight - 大事记重要标记
- yearly-events-redesign - 大事记板块重构
- yearly-events-enhancement - 大事记栏目增强

### 第三阶段：功能增强（8个规格）
- **核心定位**：核心功能模块开发与知识图谱建设
- four-core-features-enhancement - 搜索/图谱/进度/暗黑模式
- build-knowledge-graph-connections - 知识图谱连接建立
- knowledge-graph-enhancement - 知识图谱增强
- concept-evolution - 概念演变研究
- fix-content-detail-pages - 详情页渲染修复
- fix-company-links-and-counts - 公司链接与统计
- clean-external-link-and-internalize - 内链管理
- nav-restructure-by-person - 按人物导航重构

### 第四阶段：质量优化（8个规格）
- **核心定位**：设计统一、体验优化、质量审计
- site-structure-and-style-redesign - 网站结构与风格重设计
- fix-design-consistency - 设计一致性修复
- visual-display-fix - 视觉显示修复
- sidebar-fontsize-fix - 侧边栏与字号控制
- frontend-quality-overhaul - 前台质量全面优化
- site-wide-link-responsive-audit - 全站链接与响应式审计
- replicate-learnbuffett - 1:1复刻对标站点
- solution-recommendations - 优化方案建议

### 第五阶段：评估复盘（3个规格）
- **核心定位**：项目评估与未来规划
- comprehensive-web-scraping - 网页抓取（参考/工具类）
- crawl-website-content - 网站内容抓取（参考/工具类）
- project-evaluation - 项目全面评估

---

## 整体定位统计
| 定位 | 数量 | 占比 |
|------|------|------|
| 初始（Initial） | 7 | 16% |
| 扩展（Expansion） | 17 | 40% |
| 优化（Enhancement） | 16 | 37% |
| 修复（Fix） | 3 | 7% |

## 完成度统计
| 状态 | 数量 | 占比 |
|------|------|------|
| 已完成 | 24 | 56% |
| 进行中 | 16 | 37% |
| 未开始 | 3 | 7% |
