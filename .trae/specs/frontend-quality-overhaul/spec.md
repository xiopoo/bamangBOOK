# 前台页面质量综合优化 Spec

## Why
当前网站前台存在 **多处严重视觉与代码质量问题**，已经影响正常使用：

1. **多处 className 存在手误（typo）**，直接导致页面无法正常渲染或样式严重错位。
2. **设计系统未统一执行**——颜色、字体、圆角、阴影在十几个页面里被"各自为政"地实现，同一元素在不同页面里呈现完全不同的外观。
3. **大量冗余 / 死代码**，例如 `Nav.tsx`、`Footer.tsx` 已在 `layout.tsx` 中被 `Sidebar` 取代却仍保留，并且 `Nav.tsx` 的英文标题与"复利书房"中文品牌不一致。
4. **既有 spec 的修复未完全落地**：上一轮 `site-structure-and-style-redesign` 和 `visual-display-fix` 列出的若干项（如统一背景色、统一页头、移动端适配等）仍处于"已勾选但未真正生效"的状态。

本次优化对前台页面做一次**彻底的视觉与代码质量大扫除**，使页面恢复设计规范、统一体验、修复所有已知渲染 Bug。

## What Changes
- **修复** 多处导致页面崩溃 / 错位的 className 手误（graph、concepts、history、reading、talk、home）
- **统一** 全站背景色、文本色、字体、阴影、圆角——以 Tailwind 配置中的 `primary / accent / bg / text / dark` token 为唯一来源
- **统一** 所有列表页 / 详情页 / 工具页的页头样式、卡片样式、页脚样式
- **删除** 死代码：`Nav.tsx`（未被 layout 引用）、`Footer.tsx`（未被 layout 引用）
- **修复** Sidebar 在移动端的可访问性问题（汉堡按钮与 Logo 重叠、关闭态遮挡内容等）
- **修复** `/letters/1965` 顶部"来源"链接被错误拼接 `[[...]]` 模式的渲染 Bug
- **修复** 首页公司数字颜色 className 手误
- **修复** Reading / Talk 页面渐变色中错误的 `from-orgnge-00` / `border-orgnge-100` 手误
- **优化** 知识图谱页在移动端的可视区域与底部图例体验
- **抽取** 公共组件（`PageHeader`、`PageFooter`、`StatBadge`），消除散落在各页的重复 JSX
- **验证** 全站 lint、typecheck、关键页面手动 + 截图对比

## Impact
- Affected specs: `site-structure-and-style-redesign`, `visual-display-fix`, `site-wide-link-responsive-audit`
- Affected code（按修复优先级排列）：
  - **P0 渲染 Bug**
    - `src/app/graph/page.tsx` (line ~509) — 主容器 className 笔误
    - `src/app/concepts/page.tsx` (line ~34) — 主容器 className 笔误
    - `src/app/history/page.tsx` (line ~39) — 主容器 className 笔误
    - `src/app/reading/page.tsx` (line ~25) — 渐变 className 笔误
    - `src/app/talk/page.tsx` (line ~62) — 渐变 className 笔误
    - `src/app/page.tsx` (line ~195) — 公司数字 `text-orgnge-500500` 笔误
  - **P1 设计统一**
    - `src/app/globals.css` — 统一 prose / 通用 class
    - `tailwind.config.js` — 补全 token，补全失效的 class
    - `src/app/layout.tsx` — 背景色 / 容器 / 全局 footer
    - `src/components/Sidebar.tsx` — 移动端按钮、Logo 颜色
    - `src/components/Logo.tsx` — 颜色 token 化
    - `src/components/PageHeader.tsx`（新增）— 统一页头
    - `src/components/PageFooter.tsx`（新增）— 统一页脚
    - `src/components/StatBadge.tsx`（新增）— 统一统计卡片
    - 各业务页（`letters/page.tsx`、`partnership/page.tsx`、`concepts/page.tsx`、`companies/page.tsx`、`people/page.tsx`、`qa/page.tsx`、`reading/page.tsx`、`talk/page.tsx`、`model/page.tsx`、`history/page.tsx`、`search/page.tsx`）— 改用统一组件
  - **P2 死代码与移动端**
    - 删除 `src/components/Nav.tsx`
    - 删除 `src/components/Footer.tsx`（旧版）
    - `src/app/letters/[year]/page.tsx` — 修复来源链接渲染
    - `src/app/graph/page.tsx` — 移动端可视区域与图例优化

## ADDED Requirements

### Requirement: 渲染 Bug 全部清零
任何页面不应因 className 手误导致样式丢失、背景透明、文字不可见。

#### Scenario: 知识图谱页背景正常
- **WHEN** 用户访问 `/graph`
- **THEN** 页面整体背景为米色 / 书房风格背景色（`bg-bg-card` 或 `bg-[#faf9f6]`），文字为深棕 / 默认前景色，**无透明背景导致的白底闪屏或无文字**

#### Scenario: 概念列表页正常显示
- **WHEN** 用户访问 `/concepts`
- **THEN** 页面整体背景正常，无残留无效 Tailwind class；暗色模式背景为 `#1a1a2e`

#### Scenario: 阅读历史页正常显示
- **WHEN** 用户访问 `/history`
- **THEN** 页面整体背景正常，不存在 `[#fff9f6]6]6]6]` 这种残留无效片段

#### Scenario: 首页公司统计数字有颜色
- **WHEN** 用户在首页浏览"重要公司 TOP 15"标签
- **THEN** 每个公司后面的数字（如 `42`）使用主题橙色 `text-primary` 显示，**而非黑色或无样式**

#### Scenario: 阅读库 / 下午茶头部渐变正常
- **WHEN** 用户访问 `/reading` 或 `/talk`
- **THEN** 页面顶部渐变条带正确渲染（`from-primary/5 to-bg-card` 风格），不出现 `from-orgnge-00` 之类的失效 class

### Requirement: 设计系统统一
所有页面必须使用 Tailwind 配置中已声明的 token 颜色 / 阴影 / 圆角 / 字体，禁止直接硬编码十六进制色值或拼写错误的 className。

#### Scenario: 颜色一致性
- **WHEN** 用户浏览任意页面
- **THEN** 主色统一为 `text-primary` / `bg-primary`（暖橙 `#C85A17`），强调色为 `accent`（金 `#D4A853`），**不再出现** `#f97316`、`#F97316`、`#orgnge-*` 等零散色值

#### Scenario: 字体一致性
- **WHEN** 用户阅读任意页面正文
- **THEN** 字体均为 `Noto Serif SC` 衬线字体族（已通过 `font-serif` / `font-body` token 引用），不再硬编码 `'Noto Serif SC', ...` 列表

#### Scenario: 阴影一致性
- **WHEN** 用户浏览任意卡片 / 弹窗
- **THEN** 阴影使用 `shadow-card` / `shadow-card-hover` / `shadow-sm` 中的一个，**不出现** `shadow-md dark:shadow-lg dark:shadow-black/20` 之类的拼装

#### Scenario: 圆角一致性
- **WHEN** 用户浏览任意卡片 / 按钮
- **THEN** 圆角统一为 `rounded-xl`（容器）或 `rounded-lg`（按钮），自定义 `rounded-card` 收敛为上述之一

### Requirement: 公共组件抽取
页头、页脚、统计卡片必须基于公共组件实现，禁止散落的 inline JSX。

#### Scenario: PageHeader 一致性
- **WHEN** 用户访问任意列表 / 详情 / 工具页
- **THEN** 页头结构为：返回链接 / 主标题 / 副标题 / 可选右侧操作区（保持相同 padding、字号、sticky 行为）

#### Scenario: PageFooter 一致性
- **WHEN** 用户访问任意页面
- **THEN** 底部页脚统一为 `复利书房 · 巴菲特/芒格价值投资知识图谱` 一行文本 + 极简分隔，不重复堆叠多版本 footer

#### Scenario: StatBadge 一致性
- **WHEN** 用户访问首页 / 概念 / 公司 / 人物等含统计的页面
- **THEN** "X 个 / X 封" 类型的统计卡片复用 `StatBadge`，不重复实现

### Requirement: 死代码清理
未被 `layout.tsx` 引用的 `Nav.tsx`、`Footer.tsx` 必须删除或归档。

#### Scenario: Nav 不再被任何页面 import
- **WHEN** 全局搜索 `from '@/components/Nav'`
- **THEN** 命中数为 0

#### Scenario: 旧 Footer 不再被任何页面 import
- **WHEN** 全局搜索 `from '@/components/Footer'`
- **THEN** 命中数为 0（新版 PageFooter 在 `src/components/PageFooter.tsx`）

### Requirement: 移动端体验
Sidebar、知识图谱、列表页在 375px–430px 视口下应可正常操作。

#### Scenario: 移动端 Sidebar 按钮可点击且不遮挡 Logo
- **WHEN** 用户在 375px 视口打开任意页面
- **THEN** 左上角汉堡按钮位于 `top-3 right-3` 或 `top-3 left-3` 但**与 Logo 区域不重叠**；点击后侧栏滑入，遮罩点击可关闭

#### Scenario: 知识图谱移动端高度自适应
- **WHEN** 用户在 375px 视口访问 `/graph`
- **THEN** 图谱区最小可视高度 ≥ 360px；底部图例栏可折叠为单个 toggle 按钮

### Requirement: 信件详情页"来源"链接正确渲染
`/letters/[year]` 详情页头部"来源"字段不应出现 `[[...]]` 模式与 URL 拼接导致的视觉破坏。

#### Scenario: /letters/1965 来源正常
- **WHEN** 用户访问 `/letters/1965`
- **THEN** "来源：" 后为合法超链接或纯文本，**不出现** `https://learn[沃伦·巴菲特](...)` 之类的拼接错乱

### Requirement: 验证测试
所有修改完成后须通过 lint、typecheck 与一组手动 / 自动化检查。

#### Scenario: 静态检查通过
- **WHEN** 运行 `npm run lint` 与 `npx tsc --noEmit`
- **THEN** 0 error，warning 数量不增加

#### Scenario: 关键页面渲染正确
- **WHEN** 在 `http://localhost:3000` 访问 `/`、`/graph`、`/concepts`、`/history`、`/reading`、`/talk`、`/letters`、`/letters/1965`、`/partnership`、`/search`
- **THEN** 全部 HTTP 200，无 className 解析错误告警；任选 5 个页面在 1440×900 与 375×812 视口截图，背景、字体、颜色与设计规范一致

## MODIFIED Requirements
### Requirement: 全站背景色
全局 `<body>` 背景由 `globals.css` 中硬编码的 `#F5F0E8` 改为由 `tailwind` 的 `bg-bg`（米色 `#F5F0E8`）控制，同时允许页面级覆盖。
**Migration**: 各业务页将内联的 `bg-[#faf9f6]` 全部改为 `bg-bg-card`（即 `#FAF7F2`），与 body 形成两层结构（body 是网格底纹、card 是米白卡片）。

### Requirement: 全站字体颜色
正文颜色从 `globals.css` 中硬编码 `#3C2415` 改为由 `text-text` token 控制，并允许暗色模式覆盖。
**Migration**: 现有 `text-text` / `text-text-muted` 全部保留并补全缺失的 `text-dark-text` / `text-dark-muted`。

## REMOVED Requirements
### Requirement: 顶部英文导航
**Reason**: `Nav.tsx` 标题为 "Warren Buffett · Shareholder Letters"，与"复利书房"中文品牌定位不一致，且 `layout.tsx` 实际使用 `Sidebar` 作为全局导航，Nav 已无任何被引用位置。
**Migration**: 直接删除 `src/components/Nav.tsx` 文件。

### Requirement: 旧版 Footer 组件
**Reason**: `Footer.tsx`（"© 复利书房 · 长期主义者的知识阵地"）未被任何页面 import，与"复利书房 · 巴菲特/芒格价值投资知识图谱"的新版页脚重复。
**Migration**: 删除 `src/components/Footer.tsx`，由新增的 `src/components/PageFooter.tsx` 替代。
