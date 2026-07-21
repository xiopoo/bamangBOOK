# Tasks

## 阶段一：搜索功能

- [x] Task 1: 创建搜索数据索引
  - [x] SubTask 1.1: 从content/读取概念、公司、人物数据
  - [x] SubTask 1.2: 构建内存搜索索引（Fuse.js模糊搜索）
  - [x] SubTask 1.3: 创建搜索API端点 `/api/search`

- [x] Task 2: 创建搜索UI组件
  - [x] SubTask 2.1: 创建搜索输入框组件（带搜索按钮）
  - [x] SubTask 2.2: 创建搜索建议下拉框
  - [x] SubTask 2.3: 创建搜索结果分类展示组件
  - [x] SubTask 2.4: 实现关键词高亮功能

- [x] Task 3: 创建搜索页面
  - [x] SubTask 3.1: 创建 `/search` 页面
  - [x] SubTask 3.2: 集成搜索组件到导航栏
  - [x] SubTask 3.3: 实现搜索建议快速跳转

## 阶段二：知识图谱可视化

- [x] Task 4: 安装图谱依赖并创建图谱API
  - [x] SubTask 4.1: 安装D3.js依赖
  - [x] SubTask 4.2: 创建 `/api/graph/nodes` API端点
  - [x] SubTask 4.3: 创建节点数据模型（概念、公司、人物、关系）

- [x] Task 5: 创建图谱可视化页面
  - [x] SubTask 5.1: 创建 `/graph` 页面
  - [x] SubTask 5.2: 实现D3.js力导向图渲染
  - [x] SubTask 5.3: 实现节点拖拽与缩放功能
  - [x] SubTask 5.4: 实现节点详情弹窗
  - [x] SubTask 5.5: 实现关系类型差异化显示（颜色/线条）

## 阶段三：用户阅读进度记录

- [x] Task 6: 创建进度存储系统
  - [x] SubTask 6.1: 设计localStorage存储结构
  - [x] SubTask 6.2: 创建进度API `/api/progress`

- [x] Task 7: 创建进度追踪组件
  - [x] SubTask 7.1: 创建阅读进度监听Hook（useReadingProgress）
  - [x] SubTask 7.2: 创建阅读历史组件
  - [x] SubTask 7.3: 实现滚动事件监听与段落定位
  - [x] SubTask 7.4: 实现阅读进度恢复

- [x] Task 8: 集成进度功能
  - [x] SubTask 8.1: 在股东信详情页集成进度追踪
  - [x] SubTask 8.2: 创建 `/history` 阅读历史页面

## 阶段四：暗黑模式

- [x] Task 9: 配置暗黑模式基础设施
  - [x] SubTask 9.1: 配置tailwind.config.js darkMode: 'class'
  - [x] SubTask 9.2: 创建ThemeProvider组件
  - [x] SubTask 9.3: 实现系统偏好检测

- [x] Task 10: 创建暗黑模式切换组件
  - [x] SubTask 10.1: 创建主题切换按钮
  - [x] SubTask 10.2: 实现手动切换功能
  - [x] SubTask 10.3: 实现自动切换功能
  - [x] SubTask 10.4: 保存用户偏好到localStorage

- [x] Task 11: 适配暗黑模式样式
  - [x] SubTask 11.1: Sidebar组件暗黑适配
  - [x] SubTask 11.2: 股东信详情页暗黑适配
  - [x] SubTask 11.3: 概念/公司/人物详情页暗黑适配
  - [x] SubTask 11.4: 首页暗黑适配

## Task Dependencies
- Task 1 独立
- Task 2 依赖 Task 1
- Task 3 依赖 Task 2
- Task 4 独立
- Task 5 依赖 Task 4
- Task 6 独立
- Task 7 依赖 Task 6
- Task 8 依赖 Task 7
- Task 9 独立
- Task 10 依赖 Task 9
- Task 11 依赖 Task 10