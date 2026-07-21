# Tasks

## 阶段一：主题风格与全局配置改造

- [x] Task 1: 配置 Tailwind 主题色和字体
  - [x] SubTask 1.1: 在 `tailwind.config.js` 中添加橙色、米色、深棕等主题色
  - [x] SubTask 1.2: 配置 serif 字体族（宋体/Noto Serif SC）
  - [x] SubTask 1.3: 添加自定义阴影、边框半径等设计令牌
- [x] Task 2: 改造全局样式 globals.css
  - [x] SubTask 2.1: 设置 body 背景色（米色）、文字色（深棕）
  - [x] SubTask 2.2: 设置正文字体为 serif 类
  - [x] SubTask 2.3: 添加书房风格装饰元素（纹理背景、装饰性边框、分隔线样式）
  - [x] SubTask 2.4: 统一定义按钮、卡片、链接等组件的基础样式

## 阶段二：Logo 设计

- [x] Task 3: 创建 Logo 组件
  - [x] SubTask 3.1: 在 `src/components/Logo.tsx` 中创建 Logo 组件
  - [x] SubTask 3.2: 设计包含"复利书房"文字和书本/铜钱图形元素的 SVG/HTML Logo
  - [x] SubTask 3.3: 确保 Logo 在亮色/暗色背景上均可识别

## 阶段三：页面布局重构（双栏布局）

- [x] Task 4: 创建左侧导航目录组件
  - [x] SubTask 4.1: 创建 `src/components/Sidebar.tsx` 组件
  - [x] SubTask 4.2: 实现多级导航数据结构（从现有菜单项构建层级树）
  - [x] SubTask 4.3: 实现展开/折叠功能（带 +/- 图标和动画）
  - [x] SubTask 4.4: 实现当前页面/章节高亮
  - [x] SubTask 4.5: 集成 Logo 组件到侧边栏顶部
- [x] Task 5: 重构全局布局 layout.tsx
  - [x] SubTask 5.1: 改为左侧 Sidebar + 右侧主内容区的双栏结构
  - [x] SubTask 5.2: 桌面端（>=768px）固定侧边栏宽度（约 260px），右侧 overflow-y: auto
  - [x] SubTask 5.3: 移动端（<768px）侧边栏折叠为汉堡菜单，点击弹出覆盖层
  - [x] SubTask 5.4: 移除旧的顶部 Navigation 组件引用，替换为 Sidebar
- [x] Task 6: 实现目录与内容联动定位
  - [x] SubTask 6.1: 在内容区标题处添加 ID 锚点
  - [x] SubTask 6.2: 点击目录项时平滑滚动至对应锚点位置
  - [x] SubTask 6.3: 滚动时自动高亮当前可见章节对应的目录项
  - [x] SubTask 6.4: 创建 `useScrollSpy` 自定义 Hook

## 阶段四：首页内容精准修改

- [x] Task 7: 修改首页 page.tsx
  - [x] SubTask 7.1: 搜索并移除所有 "V1.33" 文本元素
  - [x] SubTask 7.2: 搜索并删除所有 "帮比快跑" 相关内容
  - [x] SubTask 7.3: 在视觉平衡位置（如页脚或底部区域）添加 "BY金融街小胖" 超链接
  - [x] SubTask 7.4: 设置链接 target="_blank" 和 rel="noopener noreferrer"
  - [x] SubTask 7.5: 确保修改后首页布局视觉平衡

## 阶段五：信件页面排版优化

- [x] Task 8: 优化股东信详情页排版
  - [x] SubTask 8.1: 调整标题层级样式（h1/h2/h3 字号和颜色）
  - [x] SubTask 8.2: 优化段落行高（1.8倍）、首行缩进、两端对齐
  - [x] SubTask 8.3: 优化引用块、数据表格、重点内容样式
  - [x] SubTask 8.4: 设置内容最大宽度（max-w-prose），提升可读性
  - [x] SubTask 8.5: 应用主题色到标题、链接、引用等元素
- [x] Task 9: 优化合伙企业信详情页排版
  - [x] SubTask 9.1: 检查并统一排版结构与股东信一致
  - [x] SubTask 9.2: 应用相同主题样式

## 阶段六：全站适配与统一

- [x] Task 10: 统一全站组件风格
  - [x] SubTask 10.1: 检查并统一按钮样式（主题色、圆角、悬停效果）
  - [x] SubTask 10.2: 检查并统一卡片样式（边框、阴影、背景）
  - [x] SubTask 10.3: 检查并统一链接样式（颜色、下划线、悬停效果）
  - [x] SubTask 10.4: 确保所有页面主题风格一致

## 阶段七：全面测试

- [x] Task 11: 功能测试
  - [x] SubTask 11.1: 测试所有导航跳转、链接点击
  - [x] SubTask 11.2: 测试目录展开/折叠功能
  - [x] SubTask 11.3: 测试目录与内容联动定位
  - [x] SubTask 11.4: 测试首页超链接跳转（新标签页打开）
  - [x] SubTask 11.5: 确认首页无残留"V1.33"和"帮比快跑"内容
- [x] Task 12: 响应式兼容性测试
  - [x] SubTask 12.1: 测试桌面端（>=1024px）双栏布局
  - [x] SubTask 12.2: 测试平板端（768px-1024px）布局适配
  - [x] SubTask 12.3: 测试移动端（<768px）单栏布局和汉堡菜单
  - [x] SubTask 12.4: 检查不同屏幕下信件页面排版
- [x] Task 13: 视觉一致性检查
  - [x] SubTask 13.1: 逐页检查主题色应用一致性
  - [x] SubTask 13.2: 检查字体渲染效果
  - [x] SubTask 13.3: 检查装饰元素在各页面的呈现
  - [x] SubTask 13.4: 检查 Logo 显示效果

## Task Dependencies

- Task 1, 2（主题配置）可并行进行
- Task 3（Logo）依赖 Task 1（有主题色后设计）
- Task 4（Sidebar）依赖 Task 3（集成Logo）
- Task 5（布局重构）依赖 Task 4（Sidebar完成）
- Task 6（联动定位）依赖 Task 5
- Task 7（首页修改）可独立于布局重构进行
- Task 8, 9（信件排版）可并行，依赖 Task 1, 2
- Task 10（全站统一）依赖 Task 1, 2, 5, 7, 8, 9
- Task 11, 12, 13（测试）依赖 Task 10
