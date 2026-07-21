# Tasks

## Task 0: 修复 P0 渲染 Bug（最高优先级）
- [x] SubTask 0.1: 修复 `src/app/graph/page.tsx` 第 ~509 行主容器 className 笔误（`[#f[#fff9f6]6] tex[#2c2c2c]2c2c2c]` → `bg-bg-card text-text`）
- [x] SubTask 0.2: 修复 `src/app/concepts/page.tsx` 第 ~34 行主容器 className 笔误（`bg-[#fff9f6]6]6]6] da[#1k1a2e]a2e]a2e]a2e]` → `bg-bg-card dark:bg-dark-bg`）
- [x] SubTask 0.3: 修复 `src/app/history/page.tsx` 第 ~39 行主容器 className 笔误（`bg-[#fff9f6]6]6]6]` → `bg-bg-card`）
- [x] SubTask 0.4: 修复 `src/app/reading/page.tsx` 第 ~25 行渐变 className（`from-orgnge-00 border-orgnge-100` → `from-primary/5 border-primary/20`）
- [x] SubTask 0.5: 修复 `src/app/talk/page.tsx` 第 ~62 行渐变 className（同上）
- [x] SubTask 0.6: 修复 `src/app/page.tsx` 第 ~195 行公司数字颜色（`text-orgnge-500500` → `text-primary`）

## Task 1: 清理死代码
- [x] SubTask 1.1: 验证 `src/components/Nav.tsx` 确实未被任何文件 import
- [x] SubTask 1.2: 删除 `src/components/Nav.tsx`
- [x] SubTask 1.3: 验证 `src/components/Footer.tsx` 确实未被任何文件 import
- [x] SubTask 1.4: 删除 `src/components/Footer.tsx`
- [x] SubTask 1.5: 全局搜索 `import.*Nav\b` 与 `import.*Footer\b`，确认无遗漏引用

## Task 2: 完善 Tailwind token 与 globals.css
- [x] SubTask 2.1: 在 `tailwind.config.js` 中将 `primary.light` 调整为可在 `text-primary-light` 形式直接引用（验证已存在即可）
- [x] SubTask 2.2: 在 `tailwind.config.js` 中确认 `text-text`、`text-text-muted`、`text-dark-text`、`text-dark-muted` 都能正确生成 class
- [x] SubTask 2.3: 在 `globals.css` 中精简 `body` 颜色设置，确保 `bg-bg` token 在 `tailwind` 编译后能覆盖 body 默认值
- [x] SubTask 2.4: 检查 `rounded-card`、`shadow-card`、`shadow-card-hover` token 是否被所有引用页正确使用；如不再需要，可保留但应统一收敛

## Task 3: 抽取公共组件
- [x] SubTask 3.1: 新建 `src/components/PageHeader.tsx`，统一页头：返回链接 / 主标题 / 副标题 / 右侧 slot / sticky 行为
- [x] SubTask 3.2: 新建 `src/components/PageFooter.tsx`，统一"复利书房 · 巴菲特/芒格价值投资知识图谱"页脚
- [x] SubTask 3.3: 新建 `src/components/StatBadge.tsx`，统一"X 封 / X 个"统计卡片（带 emoji 与副标题）
- [x] SubTask 3.4: 新建 `src/components/PageContainer.tsx`，统一页面容器（max-w、px、py、min-h-screen、bg-bg-card）

## Task 4: 改造全局布局
- [x] SubTask 4.1: `src/app/layout.tsx` 调整 `body` className，由 `bg-white dark:bg-dark-bg` 改为 `bg-bg dark:bg-dark-bg`，确保米色 body 与设计规范一致
- [x] SubTask 4.2: 检查 `Sidebar` 在 layout 中的占位，避免与内容区视觉割裂
- [x] SubTask 4.3: 移除 `src/app/layout.tsx` 主体区域无意义的 `mb-16` 等间距

## Task 5: Sidebar 与 Logo 调整
- [x] SubTask 5.1: 修复 `src/components/Logo.tsx`，将 `text-[#C85A17]` 改为 `text-primary`；副标题 `text-[#8B7355]` 改为 `text-text-muted`
- [x] SubTask 5.2: 修复 `src/components/Sidebar.tsx` 移动端汉堡按钮位置（`top-3 right-3` → `top-3 left-3`），避让页面右侧操作区
- [x] SubTask 5.3: Sidebar 暗色模式可读性（背景 `bg-white/95 dark:bg-dark-card/95 backdrop-blur-sm`；导航文字 `dark:text-gray-200`；计数 badge `dark:text-gray-300`；section header `dark:text-gray-400`）
- [x] SubTask 5.4: Logo 容器 padding 移动端 `p-4` / 桌面端 `p-6`

## Task 6: 业务页迁移到公共组件
- [x] SubTask 6.1: `src/app/page.tsx`（首页）— 使用 `PageContainer`、`StatBadge`、`PageFooter`
- [x] SubTask 6.2: `src/app/letters/page.tsx` — 使用 `PageContainer`、`PageHeader`、`PageFooter`
- [x] SubTask 6.3: `src/app/letters/[year]/page.tsx` — 使用 `PageContainer`、`PageHeader`、修复"来源"链接
- [x] SubTask 6.4: `src/app/partnership/page.tsx` — 使用公共组件
- [x] SubTask 6.5: `src/app/concepts/page.tsx` — 使用公共组件
- [x] SubTask 6.6: `src/app/concepts/[name]/page.tsx` — 使用公共组件
- [x] SubTask 6.7: `src/app/companies/page.tsx` — 使用公共组件
- [x] SubTask 6.8: `src/app/companies/[name]/page.tsx` — 使用公共组件
- [x] SubTask 6.9: `src/app/people/page.tsx` — 使用公共组件
- [x] SubTask 6.10: `src/app/people/[name]/page.tsx` — 使用公共组件
- [x] SubTask 6.11: `src/app/qa/page.tsx` — 使用公共组件
- [x] SubTask 6.12: `src/app/qa/[id]/page.tsx` — 使用公共组件
- [x] SubTask 6.13: `src/app/reading/page.tsx` — 使用公共组件
- [x] SubTask 6.14: `src/app/talk/page.tsx` — 使用公共组件
- [x] SubTask 6.15: `src/app/model/page.tsx` — 使用公共组件
- [x] SubTask 6.16: `src/app/history/page.tsx` — 使用公共组件
- [x] SubTask 6.17: `src/app/search/page.tsx` — 使用公共组件
- [x] SubTask 6.18: `src/app/books/page.tsx`、`src/app/munger/page.tsx` 等其他页 — 使用公共组件

## Task 7: 修复 `/letters/1965` 来源链接
- [x] SubTask 7.1: 在 `getLetterByYear` 或 LetterReader 组件中定位"来源"字段的渲染逻辑
- [x] SubTask 7.2: 移除或转义 `[[...]]` 双括号语法在"来源"字段的应用（采用防御性处理：URL 段跳过 `[[entity]]` 转换）
- [x] SubTask 7.3: 用合法 `<a href="..." target="_blank">` 输出，URL 拼接错误时降级为纯文本（URL 内部 `[[/` 退化为普通方括号）
- [x] SubTask 7.4: 验证 1965 / 1963 / 2024 等多个年份的"来源"字段都能正常显示（单元测试 6/6 通过）

## Task 8: 知识图谱页移动端优化
- [x] SubTask 8.1: 调整图谱区高度由 `h-[calc(100vh-73px)]` 改为 `h-auto md:h-[calc(100vh-73px)] min-h-[480px]`
- [x] SubTask 8.2: 移动端底部图例栏折叠为单个 toggle（新增 `showMobileLegend` state）
- [x] SubTask 8.3: 移动端控制面板 `top-[73px]` 简化为 `fixed inset-0 z-40`，覆盖 header 下方全区域

## Task 9: 验证
- [x] SubTask 9.1: `npm run lint` 0 error（3 个 pre-existing warning，非本次修改引入）
- [x] SubTask 9.2: `npx tsc --noEmit` 0 error
- [x] SubTask 9.3: `npm run build` 通过（26 个静态页 + 9 个 API 路由）
- [x] SubTask 9.4: dev server 验证 16 个关键页全部 HTTP 200
- [ ] SubTask 9.5: 在 1440×900 与 375×812 视口下分别截图 5 个关键页面，与设计规范对比（需 Playwright 自动化截图）
- [x] SubTask 9.6: 全局搜索 `bg-\[#faf9f6\]`、`#f97316`、`#F97316`、`orgnge-`、`text-\[#C85A17\]`、`text-\[#8B7355\]`，全部 0 命中

# Task Dependencies
- Task 0 独立（最高优先级，先修）
- Task 1 独立（清理）
- Task 2 独立（配置）
- Task 3 独立（公共组件，必须先于 Task 6）
- Task 4 依赖 Task 3（layout 改造时用 PageContainer）
- Task 5 独立
- Task 6 依赖 Task 3、Task 4
- Task 7 独立
- Task 8 独立
- Task 9 依赖 Task 0–8 全部完成










