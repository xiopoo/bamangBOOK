# Tasks

## 前置阶段：内容基础（已并入本任务）

- [x] Task 0: 股东信内容填充与展示优化
  - [x] SubTask 0.1: 验证content/letters/与content/partnership/文件完整性（62封股东信+35封合伙人信）
  - [x] SubTask 0.2: 实现API与页面读取两个目录的能力，支持1956-1970合伙人信自动路由
  - [x] SubTask 0.3: 修复ReactMarkdown自定义组件缺少`{children}`导致的内容空白问题
  - [x] SubTask 0.4: 优化段落间距、标题层级、引用块、列表、[[双括号链接]]等排版
  - [x] SubTask 0.5: 支持同一年份多封合伙人信按顺序展示
  - [x] SubTask 0.6: 将股东信详情页改为Server Component，首屏直接渲染完整内容

## 阶段一：基础重构

- [ ] Task 1: 布局重构：从Sidebar改为顶部导航
  - [ ] SubTask 1.1: 修改 `src/app/layout.tsx` - 移除Sidebar，添加简单顶部导航
  - [ ] SubTask 1.2: 创建 `src/components/Nav.tsx` - 顶部导航组件
  - [ ] SubTask 1.3: 创建 `src/components/Footer.tsx` - 页脚组件（关于本站）
  - [ ] SubTask 1.4: 调整 globals.css 匹配 对标站点 字体和颜色
  - [ ] SubTask 1.5: 配置 tailwind.config.js 颜色方案

- [ ] Task 2: 首页完全重构 `src/app/page.tsx`
  - [ ] SubTask 2.1: 顶部Hero区：标题 + 版本号 + 作者
  - [ ] SubTask 2.2: 4个统计数字卡片（98篇、49概念、61公司、7人物）
  - [ ] SubTask 2.3: 4个功能入口链接卡片
  - [ ] SubTask 2.4: 知识图谱入口 + 书籍入口
  - [ ] SubTask 2.5: 核心投资概念TOP 15标签云
  - [ ] SubTask 2.6: 重要公司TOP 15标签云
  - [ ] SubTask 2.7: 7位关键人物网格展示
  - [ ] SubTask 2.8: 页脚"关于本站"区域

## 阶段二：内容页面重构

- [ ] Task 3: 概念详情页重构 `src/app/concepts/[name]/page.tsx`
  - [ ] SubTask 3.1: 页面结构（标题、定义摘要）
  - [ ] SubTask 3.2: 概念解析（定义与起源、核心要义、实践应用）
  - [ ] SubTask 3.3: 常见误区 + 原话精选
  - [ ] SubTask 3.4: 思想演变时间线
  - [ ] SubTask 3.5: 相关概念 + 典型案例公司
  - [ ] SubTask 3.6: 常见问题FAQs + 链接到本页
  - [ ] SubTask 3.7: 上一篇/下一篇导航

- [ ] Task 4: 公司详情页重构 `src/app/companies/[name]/page.tsx`
  - [ ] SubTask 4.1: 页面结构标题 + 引用次数
  - [ ] SubTask 4.2: 公司介绍 + 投资历史
  - [ ] SubTask 4.3: 相关概念 + 相关信件链接

- [ ] Task 5: 人物详情页重构 `src/app/people/[name]/page.tsx`
  - [ ] SubTask 5.1: 页面结构标题 + 引用次数
  - [ ] SubTask 5.2: 人物介绍 + 巴菲特评价
  - [ ] SubTask 5.3: 相关信件链接

- [ ] Task 6: 股东信列表页重构 `src/app/letters/page.tsx`
  - [ ] SubTask 6.1: 按年代分组（合伙人时期、伯克希尔时期）
  - [ ] SubTask 6.2: 每个信件链接到详情页

## 阶段三：特殊页面

- [ ] Task 7: 知识图谱页面重构 `src/app/graph/page.tsx`
  - [ ] SubTask 7.1: 改为静态节点列表显示
  - [ ] SubTask 7.2: 按类型分组（概念、公司、人物、股东信、合伙人信、特别信件、索引）
  - [ ] SubTask 7.3: 节点详情点击展开（名称、类型、引用次数、链接信件）

- [ ] Task 8: 合伙人信列表页 `src/app/partnership/page.tsx`
  - [ ] SubTask 8.1: 列出1956-1970年所有合伙人信

## 阶段四：验证

- [ ] Task 9: 全站功能验证
  - [ ] SubTask 9.1: 验证所有页面无编译错误
  - [ ] SubTask 9.2: 验证所有链接跳转正确
  - [ ] SubTask 9.3: 验证响应式布局（桌面端为主）
  - [ ] SubTask 9.4: 验证内容与对标站点一致

## Task Dependencies
- Task 1 独立（基础布局）
- Task 2 依赖 Task 1
- Task 3,4,5,6 可并行（依赖 Task 1）
- Task 7,8 可并行（依赖 Task 1）
- Task 9 依赖所有