# 灰金重组写作助手（Regroup Lab）- 产品需求文档

## Overview
- **Summary**: 基于 DBS（dontbesilent）诊断式方法论，面向企业困境诊断与重组领域的专业写作助手 Skill 集合。通过对话交互的方式，提供从选题诊断、内容创作、质量检测到排版发布的全流程写作辅助。
- **Purpose**: 解决困境重组领域专业内容创作中"选题难、质量不稳定、AI味重、排版发布繁琐"等痛点，将 DBS 的诊断能力与重组领域知识深度结合，形成可复用、可沉淀的智能写作系统。
- **Target Users**: 企业困境诊断顾问、不良资产处置专家、重组重整从业者、律师事务所专业人员、金融机构风控人员。

## 项目定位
本项目为 **独立的 Skill 模块集合**，与"复利书房"价值投资内容网站完全独立，与 DBS 商业工具箱平行。

- **项目名**: regroup-lab
- **品牌名**: 灰金重组写作助手
- **形态**: TRAE IDE Skill 模块集合
- **调用方式**: 对话交互，类似 DBS 的使用方式
- **方法论来源**: DBS（dontbesilent）商业工具箱诊断框架
- **领域**: 企业困境诊断与重组重整

## 核心设计理念：DBS × 重组写作

### 诊断式写作流程
```
选题诊断 → 结构化写作 → 内容诊断 → 专项优化 → 发布管理
   ↓           ↓           ↓          ↓          ↓
regroup-lab-  模板/案例/   regroup-lab- regroup-lab-  regroup-lab-
diagnosis   术语库       content   title/AI检测  wechat-html
```

### Skill 架构总览

```
regroup-lab（主入口，路由+导航）
├── regroup-lab-content      内容五维诊断（核心）
├── regroup-lab-ai-check     AI写作特征检测
├── regroup-lab-title        公众号标题生成
├── regroup-lab-wechat-html  公众号排版与HTML生成
├── regroup-lab-cases        案例库检索与引用
├── regroup-lab-terms        专业术语库查询
├── regroup-lab-templates    写作模板库
├── regroup-lab-diagnosis    选题诊断（二期）
├── regroup-lab-hook         开头优化（二期）
├── regroup-lab-chatroom     多视角讨论（二期）
├── regroup-lab-save         诊断存档
├── regroup-lab-restore      恢复存档
└── regroup-lab-report       报告生成
```

## Goals
- 构建"诊断式写作"工作流：选题诊断 → 内容创作 → 质量检测 → 优化提升 → 发布管理
- 将 DBS 核心诊断能力适配到重组写作场景（内容诊断、AI味检测、标题生成、公众号排版）
- 建立重组领域知识库（案例库、术语库、模板库），支持持续沉淀与调用
- 实现从写作到发布的完整闭环，提升专业内容生产效率
- 模块化架构，支持后续逐步扩展更多 DBS 能力与领域知识
- 所有功能通过对话交互调用，无需切换界面

## Non-Goals (Out of Scope)
- 不提供法律意见书或财务顾问服务，系统仅为写作辅助工具
- 不涉及真实企业敏感数据的存储与处理
- 不替代专业人士的判断，所有生成内容需人工审核确认
- 不开发独立的 Web 应用或移动端 App
- 不集成微信支付、打赏等商业化功能
- 不提供 AI 自动生成完整文章功能，仅提供诊断与辅助工具
- 一期不实现实时多人协作编辑
- 不直接对接微信公众号 API，仅提供 HTML 导出

## 一期 Skill 模块规划

### 1. regroup-lab（主入口 Skill）
- **功能**: 路由分发 + 任务后导航
- **模式A（任务前路由）**: 根据用户意图，路由到对应的子 Skill
- **模式B（任务后导航）**: 上一个 Skill 完成后，推荐 2-3 个下一步方向
- **路由表**: 包含所有子 Skill 的入口与触发条件

### 2. regroup-lab-content（内容诊断）
- **功能**: 基于 DBS 五维诊断框架，适配重组领域的内容质量检测
- **诊断维度**:
  - 专业深度检测（专业术语使用、案例支撑、数据准确性）
  - 结构逻辑检测（章节框架、论证链条、逻辑一致性）
  - 传播性检测（标题吸引力、开头钩子、读者获得感）
  - 可读性检测（语言表达、段落节奏、专业度平衡）
  - 合规性检测（风险提示、免责声明、敏感词检查）
- **输出**: 诊断报告 + 具体问题清单 + 优化建议

### 3. regroup-lab-ai-check（AI写作特征检测）
- **功能**: 基于 dbs-ai-check 框架，适配专业文章场景的 AI 味检测
- **检测维度**: 开头套路感、段落结尾金句、连接词过度、假大空描述、公式化结构、专业术语堆砌等
- **输出**: 检测报告 + 逐处标记 + 修改建议
- **改写引导**: 针对每处问题追问用户真实意图，引导找到自己的表达方式

### 4. regroup-lab-title（公众号标题生成）
- **功能**: 基于爆款公式，适配重组领域的公众号标题生成
- **标题类型**: 数字型、疑问型、悬念型、对比型、案例型、痛点型、金句型、反常识型
- **模板库**: 20+ 重组领域专用标题公式
- **输出**: 10 个备选标题 + 质量评估 + 一键应用

### 5. regroup-lab-wechat-html（公众号排版）
- **功能**: 将 Markdown 文章转换为公众号兼容的 HTML
- **排版样式**: 3-5 种专业风格预设（简约商务、专业报告、清新阅读、法律文书、数据报告）
- **输出**: 预览 + HTML 代码 + 一键复制
- **位置**: 与 dbs-wechat-html 功能类似，但预设风格更偏向专业内容

### 6. regroup-lab-cases（案例库）
- **功能**: 困境重组案例的检索、查询与引用
- **数据来源**: 内置经典案例 + 用户自定义案例
- **检索维度**: 行业、问题类型、解决方案、企业规模、审理法院
- **案例结构**: 背景、问题分析、解决方案、关键节点、结果启示
- **输出**: 案例列表 + 详情 + 一键引用到当前写作
- **数据存储**: 本地 Markdown/JSON 文件，支持用户自行添加

### 7. regroup-lab-terms（术语库）
- **功能**: 重组领域专业术语查询与解释
- **术语分类**: 债务类、资产类、法律类、财务类、经营类、程序类
- **术语结构**: 标准定义、应用场景、常见误区、相关术语、用法示例
- **输出**: 术语解释 + 相关术语推荐 + 一键插入文章
- **数据存储**: 本地数据文件，支持用户自定义补充

### 8. regroup-lab-templates（写作模板库）
- **功能**: 提供多种文章类型的结构化写作模板
- **模板类型**:
  - 案例分析型
  - 问题解读型
  - 方法工具型
  - 行业观察型
  - 观点评论型
  - 政策解读型
- **模板结构**: 章节框架 + 写作提示 + 示例片段
- **输出**: 模板内容 + 使用说明 + 一键应用

### 9. regroup-lab-save（存档）
- **功能**: 将当前诊断/写作状态保存到本地
- **保存内容**: 诊断结果、文章版本、优化记录
- **存储位置**: `~/.regroup-lab/saves/` 目录
- **输出**: 存档文件路径 + 存档摘要

### 10. regroup-lab-restore（恢复存档）
- **功能**: 恢复之前的存档，继续上次的工作
- **输出**: 存档列表 + 恢复后的状态

### 11. regroup-lab-report（报告生成）
- **功能**: 将多份诊断存档合并为一份完整报告
- **输出**: Markdown 格式报告，可导出

## 二期 Skill 模块规划（待确认）
- **regroup-lab-diagnosis**: 选题诊断（基于 dbs-diagnosis 框架，评估选题价值）
- **regroup-lab-hook**: 开头优化（基于 dbs-hook 框架，优化文章开头）
- **regroup-lab-chatroom**: 多视角讨论（基于 dbs-chatroom，重组领域专家角色）
- **regroup-lab-deconstruct**: 概念拆解（基于 dbs-deconstruct，拆解专业概念）
- **regroup-lab-decision**: 决策沉淀（基于 dbs-decision，选题决策记录复盘）
- **regroup-lab-content-system**: 内容结构化系统（基于 dbs-content-system，内容资产工程化）

## Background & Context
- 本项目为独立的 Skill 模块集合，与"复利书房"价值投资内容网站相互独立
- 方法论借鉴自 DBS（dontbesilent）商业工具箱的诊断式框架
- 用户为拥有十年行业经验的企业困境诊断与重组顾问
- 公众号是专业人士建立个人品牌、获取客户的重要渠道
- 系统定位为专业人士的个人写作工作台，通过对话交互提供全流程支持
- Skill 数据存储在本地文件系统中，用户可自行编辑和扩展

## Functional Requirements

### FR-1: 主入口路由系统
- 用户输入模糊需求时，引导用户选择具体功能
- 根据用户意图信号，自动路由到对应子 Skill
- 任务完成后，推荐 2-3 个下一步方向
- 支持用户直接指定子 Skill 调用

### FR-2: 内容五维诊断
- 接收用户的文章（选题或初稿）
- 从五个维度进行诊断：专业深度、结构逻辑、传播性、可读性、合规性
- 每维给出具体问题识别与优化建议
- 输出结构化诊断报告
- 保存诊断历史

### FR-3: AI写作特征检测
- 检测文章中的 AI 写作特征
- 逐处标记 AI 特征明显的段落
- 给出严重度分级（强/中/弱）
- 输出检测报告
- 提供改写引导模式（追问用户真实意图）

### FR-4: 公众号标题生成
- 根据用户输入的主题/关键词生成标题
- 提供多种风格/类型的备选标题
- 标题质量评估
- 适配重组领域语境

### FR-5: 公众号排版与HTML生成
- 将 Markdown 转换为公众号兼容的 HTML
- 提供多种专业排版样式预设
- 支持自定义样式调整
- 一键复制 HTML
- 预览效果说明

### FR-6: 案例库系统
- 内置 10-15 个经典公开案例
- 支持按多维度检索案例
- 查看案例详情
- 一键引用案例到当前写作
- 支持用户自定义添加、编辑案例
- 案例数据以本地文件形式存储

### FR-7: 专业术语库
- 内置 50-80 个核心专业术语
- 按分类浏览术语
- 搜索术语
- 查看术语详情（定义、场景、误区、示例）
- 一键插入术语解释到文章
- 支持用户自定义补充术语

### FR-8: 写作模板库
- 内置 5-6 种文章类型模板
- 每种模板包含章节框架与写作提示
- 浏览和搜索模板
- 一键应用模板
- 支持用户自定义模板

### FR-9: 存档与恢复
- 保存当前工作状态到本地
- 列出历史存档
- 恢复指定存档
- 删除存档

### FR-10: 报告生成
- 合并多份诊断存档
- 生成完整的 Markdown 报告
- 支持导出报告

## Non-Functional Requirements
- **NFR-1 (可用性)**: 所有功能通过对话调用，无需学习成本，核心功能 1 轮对话可达
- **NFR-2 (可靠性)**: 用户数据本地存储，不上传云端，支持备份与导出
- **NFR-3 (可扩展性)**: 模块化设计，新增 Skill 不影响现有功能
- **NFR-4 (可定制性)**: 案例、术语、模板数据存储在本地文件，用户可自行编辑扩展
- **NFR-5 (一致性)**: 与 DBS 风格保持一致：直接、精准、不讨好、给行动不给建议

## Constraints
- **技术形态**: TRAE IDE Skill 模块，基于 SKILL.md 定义
- **数据存储**: 本地文件系统（Markdown/JSON），路径 `~/.regroup-lab/`
- **交互方式**: 纯对话交互，无图形界面
- **诊断逻辑**: 基于规则引擎与模板匹配，不依赖大模型 API
- **内容安全**: 所有诊断仅为辅助建议，不构成专业意见

## Assumptions
- 用户为专业人士，具备困境诊断与重组领域的基础知识
- 案例库初期内置 10-15 个经典公开案例，后续由用户自行补充
- 术语库初期内置 50-80 个核心专业术语
- 诊断逻辑基于 DBS 框架的规则与模板进行适配
- 系统主要面向单人使用
- 用户熟悉对话式交互，不依赖图形界面

## Acceptance Criteria

### AC-1: 主入口路由功能
- **Given**: 用户调用 regroup-lab 主 Skill
- **When**: 用户描述需求
- **Then**: 系统正确路由到对应子 Skill，或引导用户选择
- **Verification**: `human-judgment`

### AC-2: 内容五维诊断
- **Given**: 用户提供文章初稿或选题
- **When**: 调用 regroup-lab-content
- **Then**: 系统输出五维诊断报告，包含评分、问题、建议
- **Verification**: `human-judgment`

### AC-3: AI写作特征检测
- **Given**: 用户提供文章
- **When**: 调用 regroup-lab-ai-check
- **Then**: 系统逐处标记 AI 特征，给出检测报告
- **Verification**: `human-judgment`

### AC-4: 标题生成
- **Given**: 用户输入主题关键词
- **When**: 调用 regroup-lab-title
- **Then**: 系统生成至少 10 个备选标题，覆盖多种风格
- **Verification**: `human-judgment`

### AC-5: 公众号HTML生成
- **Given**: 用户提供 Markdown 文章
- **When**: 调用 regroup-lab-wechat-html
- **Then**: 系统生成公众号兼容的 HTML，可复制使用
- **Verification**: `programmatic`

### AC-6: 案例库检索
- **Given**: 用户描述案例检索需求
- **When**: 调用 regroup-lab-cases
- **Then**: 系统返回匹配的案例列表，可查看详情，可引用
- **Verification**: `human-judgment`

### AC-7: 术语库查询
- **Given**: 用户查询某个专业术语
- **When**: 调用 regroup-lab-terms
- **Then**: 系统返回术语解释、应用场景、常见误区
- **Verification**: `human-judgment`

### AC-8: 写作模板
- **Given**: 用户选择文章类型
- **When**: 调用 regroup-lab-templates
- **Then**: 系统输出对应模板的章节框架与写作提示
- **Verification**: `human-judgment`

### AC-9: 存档与恢复
- **Given**: 用户完成一次诊断
- **When**: 调用 regroup-lab-save 和 regroup-lab-restore
- **Then**: 存档成功保存，可恢复继续
- **Verification**: `programmatic`

### AC-10: 任务后导航
- **Given**: 一个子 Skill 完成任务
- **When**: 返回主入口
- **Then**: 系统根据结果推荐 2-3 个下一步方向
- **Verification**: `human-judgment`

## 一期范围（MVP）
一期聚焦核心闭环：**诊 → 写 → 优 → 发**

包含 Skill：
1. regroup-lab（主入口）
2. regroup-lab-content（内容诊断）
3. regroup-lab-ai-check（AI检测）
4. regroup-lab-title（标题生成）
5. regroup-lab-wechat-html（公众号排版）
6. regroup-lab-cases（案例库）
7. regroup-lab-terms（术语库）
8. regroup-lab-templates（模板库）
9. regroup-lab-save（存档）
10. regroup-lab-restore（恢复存档）
11. regroup-lab-report（报告生成）

不包含（二期及以后）：
- regroup-lab-diagnosis（选题诊断）
- regroup-lab-hook（开头优化）
- regroup-lab-chatroom（多视角讨论）
- regroup-lab-deconstruct（概念拆解）
- regroup-lab-decision（决策沉淀）
- regroup-lab-content-system（内容结构化系统）

## Open Questions
- [ ] 案例库初始数据：是否有现成的案例可以整理导入？
- [ ] 术语库初始词条：是否有现成的术语表？
- [ ] 数据存储路径：`~/.regroup-lab/` 是否合适？
- [ ] 与 DBS 的关系：是否需要从 DBS 主入口也能路由到 regroup-lab？
