# Checklist

## P0 渲染 Bug
- [x] `/graph` 主容器背景为 `bg-bg-card` 或 `bg-[#faf9f6]`，文字为 `text-text`，无 `[#f[#fff9f6]6]` 之类的残留
- [x] `/concepts` 主容器背景正常（`bg-bg-card dark:bg-dark-bg`），无 `bg-[#fff9f6]6]6]6] da[#1k1a2e]a2e]a2e]a2e]` 残留
- [x] `/history` 主容器背景正常（`bg-bg-card`），无 `bg-[#fff9f6]6]6]6]` 残留
- [x] `/reading` 顶部渐变条带正常（`from-primary/5 to-bg-card`），无 `from-orgnge-00` 残留
- [x] `/talk` 顶部渐变条带正常，无 `from-orgnge-00` 残留
- [x] 首页"重要公司 TOP 15"中数字使用主题橙色 `text-primary`，不是默认黑色或无效 class

## 死代码清理
- [x] `src/components/Nav.tsx` 已删除
- [x] `src/components/Footer.tsx` 已删除
- [x] 全局搜索 `from '@/components/Nav'` 与 `from '@/components/Footer'` 命中数均为 0
- [x] 全局搜索 `import.*Nav\b`（排除 `NavItem`、`useNavigate` 等）与 `import.*Footer\b` 命中数均为 0

## 设计系统统一
- [x] 业务页不再出现 `bg-[#faf9f6]`、`#f97316`、`#F97316` 等硬编码色值（已迁移到 token）
- [x] 业务页不再出现 `from-orgnge-*` / `text-orgnge-*` / `border-orgnge-*` 拼写错误
- [x] 所有列表 / 详情 / 工具页正文均为 `text-text` / `text-text-muted` / `text-gray-600` 中的一种
- [x] 所有卡片阴影为 `shadow-card` / `shadow-card-hover` / `shadow-sm` 中的一种
- [x] 所有页面圆角为 `rounded-xl` / `rounded-lg` / `rounded-full` 中的一种

## 公共组件
- [x] `src/components/PageHeader.tsx` 已创建并被多个页面引用
- [x] `src/components/PageFooter.tsx` 已创建并被多个页面引用
- [x] `src/components/StatBadge.tsx` 已创建并被多个页面引用
- [x] `src/components/PageContainer.tsx` 已创建并被多个页面引用

## 全局布局
- [x] `layout.tsx` body 使用 `bg-bg dark:bg-dark-bg`，与 `globals.css` 中米色底纹一致
- [x] `Sidebar` 在 layout 中正确占位，移动端正确隐藏

## Sidebar & Logo
- [x] Logo 颜色 `text-primary`，副标题 `text-text-muted`，不再硬编码
- [x] 移动端汉堡按钮位于 `top-3 left-3`，不与页面右侧操作区重叠
- [x] 暗色模式下 Sidebar 文字可读（`dark:text-gray-200` + `backdrop-blur-sm`）

## 业务页迁移
- [x] `/`（首页）已迁移到公共组件
- [x] `/letters` 已迁移到公共组件
- [x] `/letters/[year]` 已迁移到公共组件，且"来源"字段正确渲染
- [x] `/partnership` 已迁移到公共组件
- [x] `/concepts` 与 `/concepts/[name]` 已迁移到公共组件
- [x] `/companies` 与 `/companies/[name]` 已迁移到公共组件
- [x] `/people` 与 `/people/[name]` 已迁移到公共组件
- [x] `/qa` 与 `/qa/[id]` 已迁移到公共组件
- [x] `/reading` 已迁移到公共组件
- [x] `/talk` 已迁移到公共组件
- [x] `/model` 已迁移到公共组件
- [x] `/history` 已迁移到公共组件
- [x] `/search` 已迁移到公共组件
- [x] `/books`、`/munger` 等其他页已迁移到公共组件

## `/letters/1965` 来源链接
- [x] `/letters/1965` 头部"来源"渲染为合法 `<a>` 标签或纯文本，无 `[[沃伦·巴菲特]]` 拼接错乱（LetterReader.processContent 防御性处理：URL 段跳过 `[[entity]]` 转换并降级方括号）
- [x] `/letters/2024`、`/letters/1963` 等其他年份的"来源"也正常（单元测试 6/6 通过：URL/Entity/Mixed/Strut 全部正确处理）

## 知识图谱移动端
- [x] 375px 视口下 `/graph` 图谱区高度 ≥ 360px（主容器 `min-h-[480px]` + SVG `min-h-[360px] md:min-h-0`）
- [x] 375px 视口下底部图例可折叠（`showMobileLegend` toggle，默认折叠）
- [x] 移动端控制面板改为 `fixed inset-0 z-40`，不再被 header 遮挡

## 验证
- [x] `npm run lint` 0 error
- [x] `npx tsc --noEmit` 0 error
- [x] `npm run build` 通过（26 个静态页 + 9 个 API 路由）
- [x] dev server 下访问 16 个关键页面均 HTTP 200
- [ ] 1440×900 与 375×812 视口下截图与设计规范一致（需 Playwright 自动化）
- [x] 全局搜索 `bg-\[#faf9f6\]`、`#f97316`、`#F97316`、`orgnge-`、`text-\[#C85A17\]`、`text-\[#8B7355\]` 命中数均为 0












