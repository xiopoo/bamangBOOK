# 灰金重组写作助手（Regroup Lab）- 实施计划

## 一期范围：诊 → 写 → 优 → 发 核心闭环
形态：TRAE IDE Skill 模块集合

---

## [ ] Task 0: Skill 系统基础框架
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 在 `.trae/skills/` 下创建 regroup-lab 系列 Skill 目录结构
  - 创建主入口 Skill：`regroup-lab/SKILL.md`
  - 建立 Skill 命名规范与开发规范
  - 配置本地数据存储路径：`~/.regroup-lab/`
  - 建立数据文件目录结构：cases/、terms/、templates/、saves/
  - 定义核心数据模型（案例、术语、模板、存档）
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-0.1: regroup-lab 主 Skill 可被正常调用
  - `programmatic` TR-0.2: 本地数据目录结构创建完成
  - `programmatic` TR-0.3: 数据模型定义清晰完整
  - `human-judgement` TR-0.4: Skill 目录结构清晰，命名规范统一
- **Notes**: Skill 放在当前项目的 `.trae/skills/` 目录下，与 DBS 平行

## [ ] Task 1: regroup-lab 主入口 Skill
- **Priority**: high
- **Depends On**: Task 0
- **Description**: 
  - 实现模式 A：任务前路由
    - 路由表设计（11个子Skill的触发条件）
    - 模糊需求引导流程
    - 直接指定子Skill的识别
  - 实现模式 B：任务后导航
    - 导航地图设计（各子Skill之间的流转关系）
    - 根据诊断结果推荐下一步
  - 边界情况处理
  - 说话风格定义（与DBS一致：直接、精准、不讨好）
- **Acceptance Criteria Addressed**: AC-1, AC-10
- **Test Requirements**:
  - `programmatic` TR-1.1: 调用 regroup-lab 后，能根据用户描述路由到正确的子Skill
  - `programmatic` TR-1.2: 子Skill完成后返回主入口，能推荐2-3个下一步方向
  - `programmatic` TR-1.3: 模糊需求时能给出清晰的选项引导
  - `human-judgement` TR-1.4: 路由逻辑合理，符合用户直觉
  - `human-judgement` TR-1.5: 说话风格与DBS一致，直接精准
- **Notes**: 主入口是整个系统的调度中心，路由逻辑要清晰准确

## [ ] Task 2: regroup-lab-content 内容诊断
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 基于dbs-content五维诊断框架，适配重组领域
  - 五个诊断维度：
    - 专业深度检测（专业术语使用、案例支撑、数据准确性）
    - 结构逻辑检测（章节框架、论证链条、逻辑一致性）
    - 传播性检测（标题吸引力、开头钩子、读者获得感）
    - 可读性检测（语言表达、段落节奏、专业度平衡）
    - 合规性检测（风险提示、免责声明、敏感词检查）
  - 诊断流程设计
  - 诊断报告格式
  - 重组领域适配的检测规则与标准
  - 专业度评分体系
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-2.1: 接收文章后能生成五维诊断报告
  - `programmatic` TR-2.2: 每个维度有具体的问题识别和优化建议
  - `programmatic` TR-2.3: 诊断报告格式规范统一
  - `human-judgement` TR-2.4: 诊断结果合理，建议有实际参考价值
  - `human-judgement` TR-2.5: 适配重组领域的专业特性，诊断维度准确
- **Notes**: 内容诊断是核心功能，诊断质量直接决定系统价值。需深度适配重组领域

## [ ] Task 3: regroup-lab-ai-check AI写作特征检测
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 基于dbs-ai-check的22个特征，适配专业文章场景
  - 增加重组领域特有的AI特征检测：
    - 专业术语堆砌（不懂装懂）
    - 案例假大空（缺乏具体细节）
    - 法律条文引用不规范
    - 数据来源模糊
  - 检测报告格式（逐处标记 + 严重度分级）
  - 改写引导模式（追问用户真实意图）
  - 专业文章体裁的误伤警告
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-3.1: 接收文章后能生成AI特征检测报告
  - `programmatic` TR-3.2: 至少检测8种以上AI写作特征
  - `programmatic` TR-3.3: 逐处标记，引用原文，说明问题
  - `programmatic` TR-3.4: 严重度分级清晰（强/中/弱）
  - `human-judgement` TR-3.5: 检测结果合理，误报率低
  - `human-judgement` TR-3.6: 改写引导有启发性，能帮用户找到自己的表达方式
- **Notes**: 专业文章有其特殊性，不能照搬通用AI检测标准，需调整阈值和规则

## [ ] Task 4: regroup-lab-title 公众号标题生成
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 基于爆款公式，适配重组领域
  - 标题类型：数字型、疑问型、悬念型、对比型、案例型、痛点型、金句型、反常识型
  - 20+重组领域专用标题公式
  - 标题生成流程
  - 标题质量评估维度
  - 输出格式：10个备选标题 + 分类 + 适用场景说明
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-4.1: 输入主题关键词后能生成至少10个备选标题
  - `programmatic` TR-4.2: 标题覆盖至少5种不同类型/风格
  - `programmatic` TR-4.3: 每个标题有类型标注和适用场景说明
  - `human-judgement` TR-4.4: 标题有吸引力，符合公众号爆款特征
  - `human-judgement` TR-4.5: 标题适配重组领域语境，专业且不违和
- **Notes**: 参考dbs-xhs-title的75个公式，精选适配公众号和重组领域的

## [ ] Task 5: regroup-lab-wechat-html 公众号排版
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 基于dbs-wechat-html框架，精选适配专业内容的排版风格
  - 3-5种专业风格预设：
    - 简约商务（适合观点评论）
    - 专业报告（适合案例分析、数据报告）
    - 法律文书（适合政策解读、法律分析）
    - 清新阅读（适合行业观察、随笔）
  - 公众号HTML生成逻辑
  - 样式变量定义
  - 输出格式：HTML代码 + 使用说明
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `programmatic` TR-5.1: 输入Markdown文章能生成公众号兼容的HTML
  - `programmatic` TR-5.2: 至少提供3种排版风格预设
  - `programmatic` TR-5.3: 生成的HTML可在微信公众号编辑器中正常显示
  - `human-judgement` TR-5.4: 排版风格专业美观，适合专业内容
  - `human-judgement` TR-5.5: 代码结构清晰，易于调整
- **Notes**: 可复用dbs-wechat-html的核心逻辑，重点在风格预设的适配

## [ ] Task 6: regroup-lab-cases 案例库
- **Priority**: high
- **Depends On**: Task 0
- **Description**: 
  - 设计案例数据模型：背景、问题分析、解决方案、关键节点、结果启示、行业、问题类型、企业规模
  - 内置5-8个经典公开案例（制造业、房地产、互联网、医疗等行业）
  - 案例检索功能：按行业、问题类型、企业规模等维度
  - 案例详情展示格式
  - 一键引用功能（生成可插入文章的案例摘要）
  - 用户自定义案例的添加说明
  - 案例数据文件存储格式（JSON/Markdown）
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic` TR-6.1: 案例库至少包含5个内置示例案例
  - `programmatic` TR-6.2: 支持按行业、问题类型等维度检索
  - `programmatic` TR-6.3: 案例详情结构完整，信息清晰
  - `programmatic` TR-6.4: 能生成可直接引用的案例摘要
  - `human-judgement` TR-6.5: 案例内容真实有价值，非编造
  - `human-judgement` TR-6.6: 案例分类合理，检索结果相关度高
- **Notes**: 内置案例使用公开的经典案例，注意版权。案例数据放在 `~/.regroup-lab/cases/`

## [ ] Task 7: regroup-lab-terms 术语库
- **Priority**: high
- **Depends On**: Task 0
- **Description**: 
  - 设计术语数据模型：标准定义、应用场景、常见误区、相关术语、用法示例、分类
  - 术语分类：债务类、资产类、法律类、财务类、经营类、程序类
  - 内置30-50个核心专业术语
  - 术语检索功能：分类浏览 + 关键词搜索
  - 术语详情展示格式
  - 一键插入功能（生成可插入文章的术语解释卡片）
  - 用户自定义术语的添加说明
  - 术语数据文件存储格式
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `programmatic` TR-7.1: 术语库至少包含30个内置术语
  - `programmatic` TR-7.2: 覆盖至少4大分类
  - `programmatic` TR-7.3: 支持分类浏览和关键词搜索
  - `programmatic` TR-7.4: 每个术语包含定义、场景、误区等完整信息
  - `human-judgement` TR-7.5: 术语解释专业准确
  - `human-judgement` TR-7.6: 应用场景和常见误区有实用价值
- **Notes**: 术语是专业性的基础，确保准确。术语数据放在 `~/.regroup-lab/terms/`

## [ ] Task 8: regroup-lab-templates 写作模板库
- **Priority**: medium
- **Depends On**: Task 0
- **Description**: 
  - 5-6种文章类型模板：
    - 案例分析型
    - 问题解读型
    - 方法工具型
    - 行业观察型
    - 观点评论型
    - 政策解读型
  - 每种模板包含：章节框架、写作提示、示例片段
  - 模板选择引导（根据用户需求推荐合适的模板）
  - 一键应用（生成完整的文章骨架）
  - 用户自定义模板的添加说明
  - 模板数据文件存储格式
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `programmatic` TR-8.1: 至少包含5种内置文章模板
  - `programmatic` TR-8.2: 每种模板有完整的章节框架和写作提示
  - `programmatic` TR-8.3: 能根据用户需求推荐合适的模板
  - `programmatic` TR-8.4: 能生成可直接使用的文章骨架
  - `human-judgement` TR-8.5: 模板结构合理，符合重组领域文章的写作规律
  - `human-judgement` TR-8.6: 写作提示有启发性，能真正帮助写作
- **Notes**: 模板是结构化写作的基础，确保每种模板都有清晰的逻辑

## [ ] Task 9: regroup-lab-save 存档功能
- **Priority**: medium
- **Depends On**: Task 2, Task 3
- **Description**: 
  - 存档数据模型：诊断结果、文章内容、时间戳、标签
  - 存档流程：保存当前工作状态到本地文件
  - 存档列表展示
  - 存储位置：`~/.regroup-lab/saves/`
  - 存档文件命名规范
  - 存档数量限制与清理提示
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `programmatic` TR-9.1: 能成功保存当前诊断状态到本地文件
  - `programmatic` TR-9.2: 能列出所有历史存档
  - `programmatic` TR-9.3: 存档文件包含完整的状态信息
  - `human-judgement` TR-9.4: 存档操作简单，结果清晰
- **Notes**: 参考dbs-save的实现方式

## [ ] Task 10: regroup-lab-restore 恢复存档
- **Priority**: medium
- **Depends On**: Task 9
- **Description**: 
  - 存档列表展示与选择
  - 存档内容预览
  - 恢复流程：恢复指定存档的状态
  - 存档删除功能
  - 恢复后的状态展示
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `programmatic` TR-10.1: 能列出所有历史存档供选择
  - `programmatic` TR-10.2: 能成功恢复指定存档的状态
  - `programmatic` TR-10.3: 能删除不需要的存档
  - `human-judgement` TR-10.4: 恢复操作清晰，不会误操作
- **Notes**: 参考dbs-restore的实现方式

## [ ] Task 11: regroup-lab-report 报告生成
- **Priority**: medium
- **Depends On**: Task 9
- **Description**: 
  - 报告数据模型：多份诊断存档的合并与整理
  - 报告生成流程：选择存档 → 合并 → 生成报告
  - 报告格式：Markdown格式，包含目录、各部分诊断结果汇总
  - 报告导出：保存为本地文件
  - 报告模板设计
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `programmatic` TR-11.1: 能合并多份存档生成完整报告
  - `programmatic` TR-11.2: 报告格式规范，包含目录和各部分内容
  - `programmatic` TR-11.3: 报告能保存为本地Markdown文件
  - `human-judgement` TR-11.4: 报告结构清晰，内容完整有价值
- **Notes**: 参考dbs-report的实现方式

## [ ] Task 12: 系统集成测试与优化
- **Priority**: medium
- **Depends On**: Task 1, Task 2, Task 3, Task 4, Task 5, Task 6, Task 7, Task 8, Task 9, Task 10, Task 11
- **Description**: 
  - 全流程测试：从选题 → 写作 → 诊断 → 优化 → 排版的完整闭环
  - 各Skill之间的衔接测试
  - 主入口路由准确性测试
  - 任务后导航合理性测试
  - 说话风格一致性检查
  - 边界情况处理测试
  - Bug修复与优化
- **Acceptance Criteria Addressed**: AC-1, AC-10, NFR-1, NFR-5
- **Test Requirements**:
  - `programmatic` TR-12.1: 所有子Skill可正常调用，无错误
  - `programmatic` TR-12.2: 主入口路由准确率高，符合用户意图
  - `programmatic` TR-12.3: 各Skill之间流转顺畅
  - `human-judgement` TR-12.4: 整体体验流畅，符合诊断式写作的工作流
  - `human-judgement` TR-12.5: 说话风格一致，与DBS风格统一
  - `human-judgement` TR-12.6: 边界情况处理合理
- **Notes**: 此任务为系统集成测试，确保整体质量

---

## 二期规划（待确认）
以下Skill在一期完成后根据需求优先级逐步开发：

- regroup-lab-diagnosis（选题诊断）
- regroup-lab-hook（开头优化）
- regroup-lab-chatroom（多视角讨论）
- regroup-lab-deconstruct（概念拆解）
- regroup-lab-decision（决策沉淀）
- regroup-lab-content-system（内容结构化系统）
