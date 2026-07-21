# 灰金重组官网结构重构 - Product Requirement Document

## Overview
- **Summary**: 将灰金重组官网（hjcz.top）从单页滚动式结构，全面重构为 gaoshanwen.com 式的多页面信息架构。保持所有原有内容不变，但按 gaoshanwen.com 的导航层级、URL 结构、页面组织方式和视觉风格进行系统性重组。
- **Purpose**: 提升网站的专业感和信息架构清晰度，使企业官网具备与个人学者/专业人士网站同等的克制、克制、学术化视觉语言，强化"专业顾问"的品牌定位。
- **Target Users**: 中小企业主、企业高管、财务负责人、法律顾问等 B 端决策人群；潜在客户；合作伙伴；行业关注者。

## Goals
- 完全复刻 gaoshanwen.com 的导航结构、URL 体系、页面组织方式和底部信息架构
- 保持所有原有内容（关于企业、服务体系、案例、团队、诊断工具、联系方式等）的完整性
- 统一全站视觉风格：极简黑白灰为主、品牌色点缀、大留白、单栏居中、文字驱动
- 确保所有内部链接和导航路径功能正常
- 保持诊断工具（diag.html）的独立功能不受影响

## Non-Goals (Out of Scope)
- 不新增内容（仅重组已有内容）
- 不修改诊断系统的功能逻辑
- 不做后端/数据库/动态内容
- 不做用户系统/登录/评论
- 不做中英文双语
- 不做暗黑模式切换（但保留 theme 参数的可能性）

## Background & Context
- 现有网站为单页滚动式（index.html + diag.html + 404.html）
- 参考站 gaoshanwen.com 采用多页面结构，5 个一级导航：首页/简历/纪念/文章/书籍
- 灰金品牌色：#AB1942（深酒红）
- 技术栈：纯 HTML + CSS，零 JS，零外部依赖，部署在 Vercel
- 项目位置：`/Users/lucas/Documents/bamangB/regroup-lab/public/`

## Functional Requirements
- **FR-1**: 主导航系统 — 与 gaoshanwen.com 结构一致，5 个一级导航项 + 1 个功能按钮
- **FR-2**: 多页面架构 — 每个一级导航对应一个独立 HTML 页面
- **FR-3**: URL 结构 — 与 gaoshanwen.com 对应：`/`（首页）、`/about`（关于）、`/services`（服务）、`/cases`（案例）、`/books`（... 等等，需要精确映射）
- **FR-4**: 统一视觉系统 — 全站统一的排版、间距、颜色、组件风格
- **FR-5**: 页脚信息架构 — 与 gaoshanwen.com 底部一致的两行结构：整理者/运营者 + 联系方式
- **FR-6**: 内容迁移 — 将现有单页内容按新架构分配到各对应页面
- **FR-7**: 诊断工具集成 — 诊断页面保持独立功能，纳入新导航体系
- **FR-8**: 内部链接完整性 — 所有导航链接、锚点跳转、CTA 按钮均功能正常

## Non-Functional Requirements
- **NFR-1**: 纯静态 HTML/CSS，零 JavaScript，零外部 CDN 依赖
- **NFR-2**: 响应式设计，移动端 <768px 单列，桌面端 ≥768px
- **NFR-3**: 页面加载速度快（首屏 <1s 国内访问）
- **NFR-4**: 所有图片保持原始比例，object-fit: contain
- **NFR-5**: 代码结构清晰，便于后续维护和扩展

## Constraints
- **Technical**: 纯 HTML + CSS，不使用任何框架
- **Business**: 保留全部现有内容，不做内容删减或新增
- **Dependencies**: Vercel 部署，vercel.json 路由配置需更新

## Assumptions
- 内容映射关系：
  - 首页 → 品牌介绍 + 核心服务亮点 + 案例精选 + 诊断入口（对应 gaoshanwen 首页）
  - 关于 → 关于灰金 + 专业团队 + 我们的不同（对应 gaoshanwen 简历页）
  - 服务 → 核心服务体系 + 服务流程 + 交付成果（对应 gaoshanwen 文章页的分类方式）
  - 案例 → 成功案例（3个）+ 服务过的企业类型（对应 gaoshanwen 书籍页）
  - 诊断 → 直接跳转 diag.html（对应 gaoshanwen 的下载按钮位置）
- 诊断工具页（diag.html）保持独立，仅更新 header 导航与新系统一致

## Acceptance Criteria

### AC-1: 导航系统与 gaoshanwen.com 结构一致
- **Given**: 用户访问网站任意页面
- **When**: 查看顶部导航栏
- **Then**: 导航包含 5 个一级菜单项（首页、关于、服务、案例、诊断），位置和样式与 gaoshanwen.com 一致
- **Verification**: `human-judgment`

### AC-2: 5 个独立页面均存在并可访问
- **Given**: 部署完成的网站
- **When**: 访问 `/`, `/about`, `/services`, `/cases`, `/diag`
- **Then**: 每个 URL 均返回对应页面，200 状态码
- **Verification**: `programmatic`

### AC-3: 内容完整性保留
- **Given**: 现有单页的全部内容
- **When**: 对比新网站各页面内容之和
- **Then**: 所有原有内容（文字、数据、案例、团队信息等）均出现在新网站中，无遗漏
- **Verification**: `human-judgment`

### AC-4: 统一视觉风格
- **Given**: 任意页面
- **When**: 浏览各页面
- **Then**: 排版、间距、颜色、组件风格保持一致，与 gaoshanwen.com 的极简克制风格一致
- **Verification**: `human-judgment`

### AC-5: 页脚信息架构
- **Given**: 任意页面底部
- **When**: 查看页脚
- **Then**: 页脚包含两行：运营方署名 + 联系邮箱/电话，样式与 gaoshanwen.com 一致
- **Verification**: `human-judgment`

### AC-6: 所有内部链接正常
- **Given**: 网站上线
- **When**: 点击导航栏任意链接、CTA 按钮、锚点跳转
- **Then**: 跳转到正确页面/位置，无 404 错误
- **Verification**: `programmatic`

### AC-7: 诊断工具功能不受影响
- **Given**: 访问诊断页面
- **When**: 使用诊断功能
- **Then**: 快速体检和全面诊断均正常工作，结果页正常显示
- **Verification**: `human-judgment`

### AC-8: 响应式适配
- **Given**: 移动端和桌面端访问
- **When**: 浏览所有页面
- **Then**: 布局在各尺寸下均合理，无溢出、错位、文字被遮挡
- **Verification**: `human-judgment`

## Open Questions
- [ ] "诊断"在导航中的位置：是作为一级导航（替换 gaoshanwen 的"书籍"位置），还是作为右上角功能按钮（替换"下载"位置）？
- [ ] 案例页面是否需要分类筛选（类似 gaoshanwen 文章页的"全部/代表/分析/评论/随笔"标签）？
- [ ] 是否需要保留 404 页面？
- [ ] 尾页宣传图（banner-footer.png）放在哪个页面？还是所有页面都放？
