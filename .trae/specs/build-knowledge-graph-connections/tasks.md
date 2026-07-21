# Tasks

## 阶段一：内容收集与整理（前置任务）

- [x] Task 0: 内容现状调查
  - [x] SubTask 0.1: 列出IMA中已有的股东信年份
  - [x] SubTask 0.2: 列出IMA中已有的股东大会问答年份
  - [x] SubTask 0.3: 找出缺失的年份列表（特别是2023-2025年）
  - [x] SubTask 0.4: 定位2025.txt文件（股东大会问答录）
  - [x] SubTask 0.5: 确定哪些需要从PDF提取

- [x] Task 1: 补充股东信内容
  - [x] SubTask 1.1: 从IMA"巴菲特知识库"同步更多股东信（已同步1956年Partnership信）
  - [ ] SubTask 1.2: 查找缺失年份的PDF（2025年股东信需要从PDF合集提取）
  - [ ] SubTask 1.3: 从PDF提取内容并转换格式

- [x] Task 2: 补充股东大会问答内容
  - [x] SubTask 2.1: 从IMA"巴菲特知识库"同步更多Q&A（已找到2017、2018、2023、2024、2025年文件）
  - [ ] SubTask 2.2: 特别获取2023、2024、2025年Q&A（等待API限制解除）
  - [ ] SubTask 2.3: 整理Q&A文件命名（按年份+场次）
  - [ ] SubTask 2.4: 建立 Q&A 内容索引

## 阶段二：内容编辑与优化

- [x] Task 2.5: 股东信内容编辑与优化
  - [x] SubTask 2.5.1: 对股东信进行专业编辑
  - [x] SubTask 2.5.2: 进行段落分层处理
  - [x] SubTask 2.5.3: 提升内容可读性
  - [x] SubTask 2.5.4: 确保结构清晰、易于理解

## 阶段三：建立索引数据

- [x] Task 3: 增强 generate-index.js，分析概念共现关系
  - [x] SubTask 3.1: 统计每对概念在同一封信中出现的次数
  - [x] SubTask 3.2: 生成"概念-关联概念"列表
  - [x] SubTask 3.3: 为每封信生成"核心概念"列表
  - [x] SubTask 3.4: 提取人物、公司、事件实体
  - [x] SubTask 3.5: 建立实体之间的关联关系
  - [x] SubTask 3.6: 输出增强版 index.json

- [x] Task 4: 创建图谱API接口
  - [x] SubTask 4.1: `/api/graph/concepts` - 所有概念及关联
  - [x] SubTask 4.2: `/api/graph/letter/[year]` - 某年信件的概念卡片
  - [x] SubTask 4.3: `/api/graph/matrix` - 概念共现矩阵数据
  - [x] SubTask 4.4: `/api/graph/entities` - 人物、公司、事件实体及关系

## 阶段四：创建知识图谱页面

- [ ] Task 5: 创建 /graph 知识图谱可视化页面
  - [ ] SubTask 5.1: 使用 D3.js 力导向图展示概念关系
  - [ ] SubTask 5.2: 点击节点显示概念详情
  - [ ] SubTask 5.3: 高亮显示关联节点
  - [ ] SubTask 5.4: 实现人物、事件、公司三者的多维度关联展示

- [x] Task 6: 增强股东信详情页
  - [x] SubTask 6.1: 显示该年核心概念
  - [x] SubTask 6.2: 显示"跨年份关联"
  - [x] SubTask 6.3: 显示相关问答链接
  - [x] SubTask 6.4: 显示相关人物、公司、事件

# Task Dependencies
- Task 1 依赖 Task 0
- Task 2 依赖 Task 0
- Task 2.5 依赖 Task 1 和 Task 2
- Task 3 依赖 Task 1、Task 2 和 Task 2.5
- Task 4 依赖 Task 3
- Task 5 和 Task 6 依赖 Task 4