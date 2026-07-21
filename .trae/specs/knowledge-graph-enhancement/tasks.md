# Tasks

- [x] Task 1: 在股东信详情页顶部添加概念索引
  - [x] SubTask 1.1: 修改letters/[year]/page.tsx，添加概念标签云组件
  - [x] SubTask 1.2: 获取当前信件中的概念列表
  - [x] SubTask 1.3: 设计标签云样式（参考对标站点）

- [x] Task 2: 增强IMA同步脚本，补充股东信内容
  - [x] SubTask 2.1: 更新sync-ima.js，添加更多知识库
  - [ ] SubTask 2.2: 同步股东大会Q&A内容
  - [ ] SubTask 2.3: 同步阅读库内容

- [x] Task 3: 创建股东大会Q&A页面
  - [x] SubTask 3.1: 创建qa页面路由
  - [x] SubTask 3.2: 实现Q&A列表页
  - [x] SubTask 3.3: 实现Q&A详情页

- [x] Task 4: 更新知识图谱索引
  - [x] SubTask 4.1: 更新generate-index.js，支持Q&A内容
  - [x] SubTask 4.2: 重新生成index.json
  - [x] SubTask 4.3: 更新首页统计数据

# Task Dependencies
- Task 1 依赖 Task 4.2（需要更新后的index.json）
- Task 3 依赖 Task 2.2（需要Q&A内容）