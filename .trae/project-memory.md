# 项目记忆文件 — 灰金重组网站

## 项目定位
- 网站名称：灰金重组（hj）
- 定位：中小企业困境重组专业服务机构网站
- 品牌色：`#AB1942`（深红/酒红）
- 主题关键词：困境诊断、债务重组、资产盘活、法律风控、经营造血

## 技术栈
- **前端框架**：原生 HTML + CSS + JavaScript（无框架依赖，无 SPA）
- **脚本**：部分页面使用 Vue 3 (CDN: `unpkg.com/vue@3`) — 仅 `diag.html` 诊断页面
- **样式**：纯 CSS，`var()` 自定义属性，CSS Grid / Flexbox
- **图表**：Chart.js (CDN) — 仅 `diag.html` 雷达图
- **数据持久化**：`localStorage`（诊断计数、平均分、用户增量）

## 目录结构
```
bamangB/
├── bamangBOOK/          # 主工作目录（Next.js 项目，内容工具）
│   └── .trae/
│       ├── skills/      # 所有 dbs-* 和 hj-* 技能
│       └── specs/       # 已完成/进行中的规格文档
└── hj/                  # 灰金重组网站（静态站点，Git+Vercel 部署）
        ├── 域名：hjcz.vercel.app（Vercel 默认）
        ├── 自定义域名：www.hjcz.net / www.hjcz.top（已配置并生效）
    ├── public/          # 网站根目录（所有 .html 文件）
    │   ├── js/
    │   │   ├── image-urls.js   # Unsplash 配图 URL
    │   │   └── seed-data.js    # 诊断计数基线数据
    │   ├── images/      # 静态图片资源
    │   ├── index.html   # 首页
    │   ├── about.html   # 关于页面
    │   ├── services.html# 服务页面
    │   ├── cases-detail.html # 案例详情
    │   ├── cases.html   # 案例列表
    │   ├── experts.html # 专家团队
    │   ├── diag.html    # 企业诊断（Vue 3）
    │   ├── news.html    # 企业新闻
    │   ├── news-detail.html # 新闻详情
    │   ├── column.html  # 专栏列表
    │   ├── column-detail.html # 专栏详情
    │   ├── 404.html     # 404 页面
    │   └── intro.html   # 公司介绍
    ├── vercel.json      # Vercel 部署配置
    ├── server.js        # 本地开发服务器
    └── package.json
```

## 部署信息
- **托管平台**：Vercel.com
- **GitHub 仓库**：`https://github.com/xiopoo/egroup-lab.git`
- **源代码目录**：`bamangB/hj/`
- **静态文件目录**：`hj/public/`（Vercel outputDirectory）
- **触发方式**：`git push` 到 `main` 分支 → Vercel 自动部署
- **暂无自定义域名**（使用 Vercel 默认域名）

## 常用命令
```bash
# 开发目录
cd /Users/lucas/Documents/bamangB/hj

# 本地预览
node server.js
# 访问 http://localhost:3000

# 部署（推送到 main 自动触发 Vercel 部署）
git add public/xxx.html
git commit -m "feat/fix: 描述"
git push
```

## 诊断计数机制
- `seed-data.js` → 定义基线值 `DIAGNOSIS_BASE_COUNT`（当前 128）
- `localStorage('diagnosis_user_extra')` → 记录每个用户完成的增量
- 显示 = `DIAGNOSIS_BASE_COUNT + parseInt(localStorage('diagnosis_user_extra') || 0)`
- 推送新代码时**不需要**修改 seed-data.js 的基线值，用户端增量数据留在 localStorage 中
- 迁移旧数据：首次运行时自动从 `diagnosis_count` 迁移到新机制

## 页面导航结构（全站统一）
1. 首页 → 2. 关于 → 3. 服务 → 4. 案例 → 5. 企业新闻 → 6. 专家团队 → 7. 诊断 → 8. 专栏

## 关键页面技术特点
| 页面 | 技术特点 | 特殊注意事项 |
|------|---------|-------------|
| index.html | 纯 HTML+CSS+JS，Hero 轮播、案例卡片、统计数据 | 导航栏是其他页面的标准参考 |
| diag.html | **Vue 3** 单页应用，36 道诊断题，Chart.js 雷达图 | 微信弹窗 `v-if` + CSS `[v-cloak]` 防闪现；汉堡菜单用 `onclick` 内联 |
| news / column | 纯 HTML+CSS+JS，列表/详情结构 | 数据硬编码于 HTML |
| 其他页面 | 纯 HTML+CSS+JS，品牌介绍内容 | 导航栏结构与首页保持一致 |

## 外部依赖
- **Vue 3** — CDN (unpkg.com/vue@3)，仅用于 diag.html
- **Chart.js** — CDN (cdn.jsdelivr.net/npm/chart.js)，仅用于 diag.html 雷达图

## 图片托管策略
- **所有配图已下载到本地** `public/images/` 目录，不再依赖 Unsplash CDN
- 通过 `js/image-urls.js` 引用本地路径（如 `images/hero-1.jpg`）
- 共 10 张 JPEG 配图：3 张轮播、3 张案例、3 张服务、1 张关于
- service-3.jpg 替换过：原 Unsplash photo-1542744173 已失效 → 替换为 photo-1556761175

## 重大 Bug 修复记录

### Bug 1：手机端首屏统计数据数字显示不全
**症状**：手机版首屏 4 个统计数据只能看到 3 个，第 3 个还被裁切。
**耗时**：跨 10+ 轮对话、10+ 次推送才最终修复。
**修复过程**：
1. ❌ `clamp()` 缩放 → 手机不支持
2. ❌ `vw` 单位 → CSS 源顺序问题，移动端 `@media` 块中 `font-size:4.5vw` 写在 `font-size:46px` **之前**，46px 始终覆盖 4.5vw
3. ❌ `calc()` 回退 → 微信内置浏览器 WebView 不兼容
4. ❌ 单列 flex 布局 → 用户要求恢复 2 行显示
5. ✅ **最终解决**：`!important` 强制移动端 vw 生效（commit `c7e1e7a`）
**教训**：CSS 级联顺序和 `@media` 代码块位置很重要。同优先级选择器，后面的覆盖前面的。修改移动端样式时要在媒体查询内加 `!important` 或确保写在基础规则之后。

### Bug 2：移动端 4 列布局只显示 3 个数字
**症状**：手机竖屏 4 列只能放 3 个数字，第 4 个溢出。
**根因**：`grid-template-columns: repeat(4,1fr)`（第 449 行）的优先级和 `@media` 中 `repeat(2,1fr)` 相同，由于在基础规则中写在后面，覆盖了媒体查询中的 2 列设置。
**修复**：`@media` 中用 `!important` 强制 `repeat(2,1fr)`（commit `bb30109`）。
**教训**：CSS Grid 列数在移动端媒体查询中必须用 `!important` 确保覆盖。

### Bug 3：诊断计数部署后重置为 128
**症状**：每次推送新代码，诊断完成数变回 128，之前积累的数据丢失。
**根因**：`localStorage` 纯客户端存储，部署新页面代码时硬编码的 `128` 被覆盖。
**修复方案**（最终版）：
- 创建 `js/seed-data.js`，定义 `DIAGNOSIS_BASE_COUNT = 128`
- 用户完成的增量存入 `localStorage('diagnosis_user_extra')`
- 显示值 = 基线值 + 用户增量
- 首次运行时自动从旧 `diagnosis_count` 迁移数据
- 推送新代码**不动** seed-data.js 的基线值（commit `0aaeba6`）

### Bug 4：diag.html 右上角汉堡菜单在手机端无响应
**症状**：手机端点击汉堡菜单没有任何反应。
**耗时**：连跨 4 轮推送才修复。
**修复过程**：
1. ❌ `touch-action: manipulation` → 消除 300ms 点击延迟，但不是根因（commit `1cd96d2`）
2. ❌ 调整 z-index → 不是层级问题
3. ❌ JS 移到 Vue mount 之后执行（`nextTick`）→ 仍然不行（commit `a870b4d`）
4. ✅ **最终解决**：放弃 JS 绑定，改用 **`onclick` 内联属性** 写在汉堡按钮 HTML 标签上（commit `5ea2ed1`）
**根因**：Vue 3 的 `createApp().mount()` 会重建/重新渲染挂载点内的 DOM 结构。如果汉堡菜单的 JS 事件绑定在 Vue mount **之前**执行，Vue mount 后绑定的 DOM 元素被替换，事件丢失。Vue mount 后即使通过 `nextTick` 绑定也存在竞态条件。`onclick` 内联由浏览器原生解析，不受 Vue 影响。
**教训**：在 Vue 3 项目（diag.html）中，任何直接操作全局 DOM 的代码（导航、弹窗、菜单）都要用 `onclick` 内联属性，不要用 `addEventListener`。

### Bug 5：微信弹窗关不掉
**症状**：微信二维码弹窗一直显示在屏幕上，点击关闭按钮无效。
**根因**（非常隐蔽）：修复 Bug 4（汉堡菜单）时，移除了汉堡菜单的 `<script>` 标签，但**误删了包裹整个 Vue 代码的 `<script>` 标签**，导致 Vue 根本没有执行，`v-if="showContact"` 不生效，弹窗始终可见（commit `57927f7`）。
**修复**：加回被误删的 `<script>` 开始标签。
**教训**：修改 HTML 时注意 `<script>` 标签的边界，尤其当多个 `<script>` 块相邻时。误删一个标签会导致整个后面的 JS 代码不被执行。

### Bug 6：手机端刷新诊断页面闪现微信二维码
**症状**：每次刷新 `diag.html`，微信二维码弹窗会短暂闪现一下再消失。
**根因**：浏览器解析 HTML 时，遇到 `<div v-if="showContact">` 不认识 `v-if` 属性，直接将弹窗渲染为可见 DOM。Vue 加载后才执行 `v-if="false"` 将其隐藏。这个从"可见→隐藏"的过程产生了闪现。
**修复**：标准的 Vue 解决方案 — 添加 `[v-cloak]` 指令 + CSS 规则：
```css
[v-cloak]{display:none!important}
```
Vue 编译前，带有 `v-cloak` 的元素隐藏；Vue 编译完成后自动移除 `v-cloak` 属性，弹窗恢复正常（`v-if` 控制）（commit `e360f73`）。

### Bug 7：首页统计数据初始显示"128+"
**症状**：首页统计区加载时先闪一下 "128+"，然后才跳转到正确数字。
**根因**：HTML 中直接写了 `128+` 作为占位文本，JS 脚本加载后才覆盖。
**修复**：HTML 中留空 `<div></div>`，由 JS 直接写入最终数值，消除闪烁（commit `c7e1e7a`）。

### Bug 8：Write 工具误覆盖整个 diag.html
**事件**：修改评分粒度时，用 `Write` 工具写入 36 道题目的数组，但 `Write` **完全替换**了整个文件，导致页面上所有之前的修复（汉堡菜单、微信弹窗等）被覆盖。
**恢复**：`git checkout public/diag.html` 恢复文件，然后用 `sed -i ''` 只做批量文本替换（分数 80→67、40→33 等）。
**教训**：需要局部修改时，永远用 `SearchReplace`（`old_str` / `new_str`）而不是 `Write`，除非你确定要替换整个文件内容。

## 评分系统设计
- 36 道诊断题，每道 3 个选项
- 分数：100 / 67 / 33（不产生个位数，避免评分精度问题）
- 总分 = 所有题目分数平均值，四舍五入取整
- 维度：债务/debt、法律/legal、经营/operation、资产/asset
- 运行平均分持久化：`diagnosis_avg_score` + `diagnosis_avg_count`
