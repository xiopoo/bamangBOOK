# Tasks

- [x] Task 1: 解析 content/partnership/ 目录结构
  - [x] SubTask 1.1: 列出所有合伙人信文件并提取年份、副标题
  - [x] SubTask 1.2: 确定多版本信件排序规则（按文件名中时间标识排序）
  - [x] SubTask 1.3: 统计总信件数与年份覆盖范围

- [x] Task 2: 创建 `/partnership` 列表页
  - [x] SubTask 2.1: 创建 `src/app/partnership/page.tsx`
  - [x] SubTask 2.2: 按年份分组（1956-1970）展示信件卡片
  - [x] SubTask 2.3: 同一年份多封信件在同一组内按时间顺序列出并显示副标题
  - [x] SubTask 2.4: 每个年份/信件链接到 `/letters/{year}`
  - [x] SubTask 2.5: 应用与 `/letters` 页面一致的橙色主题和布局风格

- [x] Task 3: 在股东信列表页添加入口
  - [x] SubTask 3.1: 在 `src/app/letters/page.tsx` 顶部或底部添加合伙人信时期入口
  - [x] SubTask 3.2: 保持页面整体视觉平衡

- [x] Task 4: 构建与验证
  - [x] SubTask 4.1: 运行 `npx next build` 确认无编译错误
  - [x] SubTask 4.2: 访问 `/partnership` 验证所有年份列出
  - [x] SubTask 4.3: 验证多版本年份（如 1962、1963）正确分组
  - [x] SubTask 4.4: 验证点击年份跳转 `/letters/{year}` 正常

# Task Dependencies
- Task 2 依赖 Task 1
- Task 3 与 Task 2 可并行
- Task 4 依赖 Task 2、3
