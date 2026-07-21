# 灰金重组网站配图系统全面重建 Spec

## Why
网站配图经过三轮修复（Unsplash → 本地迁移 → Vercel缓存修复）后，图片仍频繁出现"全部消失"的问题。历史讨论中确认的根本原因包括：

1. **Vercel `immutable` 缓存策略**（最近修复）：`max-age=31536000, immutable` 导致浏览器永久缓存失败状态，微信内置浏览器尤其严重
2. **图片加载链路单一**：JS 通过 `background-image` 设置图片，失败后无可见兜底
3. **缺乏系统性的配图规范**：各页面图片尺寸未标准化、主题不统一、无加载状态指示
4. **历史设计意图未落实**：用户最初期望使用 AI 生成与业务场景匹配的专业配图，而非 Unsplash 通用素材

本轮目标是基于历史讨论中积累的全部知识，建立一套完整的、可靠的、可维护的网站配图系统。

## 历史讨论关键要点
- 品牌定位：中小企业困境重组专业服务，调性为**专业、可信、务实**
- 图片风格：避免过于商业化的 stock photo，倾向**真实办公/产业场景**
- 用户偏好：使用本地图片，不依赖外部 CDN（Unsplash 在中国大陆可能被墙）
- 兜底要求：图片加载失败时必须显示品牌色渐变 + 业务关键词，不能空白
- 缓存教训：绝对禁止 `immutable`，JS 必须 `must-revalidate`，图片不超过 7 天

## What Changes
- 重新定义所有配图的位置、主题、尺寸规范
- 统一全站图片加载机制（`<img>` 代替 `background-image`，统一使用 image-urls.js 配置）
- 建立图片加载状态三态机制（加载中 → 加载成功 → 加载失败兜底）
- 标准化 vercel.json 缓存策略（JS: no-cache / 图片: 7天 / HTML: no-cache）
- 版本化管理图片 URL（`?v=N` 参数用于 cache-busting）
- **BREAKING**: index.html 的 Hero/Case/Service 图片从 `background-image` 改为 `<img>` 标签

## Impact
- Affected specs: investigate-image-display-issues（已被本 spec 取代）, deep-image-diagnose-and-404（已被本 spec 取代）
- Affected code: `hj/public/` 下全部 14 个 HTML 文件, `hj/public/js/image-urls-v2.js`, `hj/vercel.json`
- 需要验证：Chrome / Safari / Firefox / 微信内置浏览器 / 移动端

## ADDED Requirements

### Requirement 1: 全站配图位置与规范定义
系统 SHALL 为网站每个配图位置明确定义主题、尺寸和应用场景。

#### 配图清单

| 位置 | 文件 | 主题 | 建议尺寸 | 应用页面 |
|------|------|------|---------|---------|
| Hero 轮播 1 | hero-1.jpg | 现代产业园区/写字楼外景 | 1400×933 | index.html |
| Hero 轮播 2 | hero-2.jpg | 企业会议室/战略讨论场景 | 1400×935 | index.html |
| Hero 轮播 3 | hero-3.jpg | 数据分析/财务诊断场景 | 1400×933 | index.html |
| 案例 1 | case-1.jpg | 建筑/工程行业场景 | 800×533 | index.html, cases-detail.html |
| 案例 2 | case-2.jpg | 贸易/物流/制造行业场景 | 800×533 | index.html, cases-detail.html |
| 案例 3 | case-3.jpg | 餐饮/服务/纾困场景 | 800×533 | index.html, cases-detail.html |
| 服务 1 | service-1.jpg | 财务数据分析/诊断场景 | 800×534 | index.html, services.html |
| 服务 2 | service-2.jpg | 一对一咨询/辅导场景 | 800×533 | index.html, services.html |
| 服务 3 | service-3.jpg | 重组方案/多边协商场景 | 800×600 | index.html, services.html |
| 关于 Banner | about-banner.jpg | 专业团队/公司形象 | 1200×800 | about.html |

#### Scenario: 配图主题一致性
- **WHEN** 任何页面的配图被替换
- **THEN** 新图片必须符合上表定义的主题方向
- **AND** 尺寸不得小于建议尺寸的 80%

### Requirement 2: 统一图片加载机制
系统 SHALL 在所有页面中统一使用 `<img>` 元素加载配图，废止 `background-image` 方式。

#### Scenario: index.html 配图加载
- **WHEN** 首页加载完成
- **THEN** Hero 轮播使用 `<img>` 标签（配合 CSS `object-fit: cover`）代替 `background-image`
- **AND** Case 卡片使用 `<img>` 标签代替 `background-image`
- **AND** Service 卡片使用 `<img>` 标签代替动态创建的 `background-image` div

#### Scenario: 其他页面配图加载
- **WHEN** services.html / cases-detail.html / about.html 等页面加载
- **THEN** 保持现有 `<img>` 动态创建方式
- **AND** 统一引用 `image-urls-v2.js` 中的配置

### Requirement 3: 图片加载三态机制
系统 SHALL 为每个配图容器提供三种视觉状态：加载中、加载成功、加载失败。

#### Scenario: 加载中状态
- **WHEN** 图片尚未完成加载
- **THEN** 容器显示品牌色（`#AB1942`）骨架屏渐变动画或静态品牌色背景
- **AND** 背景上显示半透明业务关键词（如"建筑"、"诊断"、"重组"等）

#### Scenario: 加载成功状态
- **WHEN** 图片加载完成（`img.onload` 触发）
- **THEN** 图片以 `object-fit: cover` 方式填充容器
- **AND** 骨架屏/占位文字淡出消失

#### Scenario: 加载失败状态
- **WHEN** 图片加载失败（`img.onerror` 触发）
- **THEN** 容器保持品牌色渐变背景（`linear-gradient(135deg, #AB1942, #8B1435)`）
- **AND** 显示业务关键词文字（原 `.case-image-text` 样式）
- **AND** 不显示浏览器默认裂图图标

### Requirement 4: 标准化缓存策略
系统 SHALL 在 vercel.json 中配置合理的缓存头，确保可靠性与性能平衡。

#### Scenario: JavaScript 文件缓存
- **WHEN** 浏览器请求任何 `.js` 文件
- **THEN** 服务器返回 `Cache-Control: public, max-age=0, must-revalidate`
- **AND** 禁止使用 `immutable` 指令

#### Scenario: 图片文件缓存
- **WHEN** 浏览器请求任何图片文件（`.jpg/.png/.svg/.webp`）
- **THEN** 服务器返回 `Cache-Control: public, max-age=604800`（7天）
- **AND** 禁止使用 `immutable` 指令

#### Scenario: HTML 文件缓存
- **WHEN** 浏览器请求任何 `.html` 文件
- **THEN** 服务器返回 `Cache-Control: public, max-age=0, must-revalidate`

### Requirement 5: 图片 URL 版本化管理
系统 SHALL 通过版本参数实现图片更新时的缓存刷新。

#### Scenario: 图片更新后刷新缓存
- **WHEN** `public/images/` 中的图片文件被替换（保持同名）
- **THEN** 更新 `image-urls-v2.js` 中对应 URL 的 `?v=N` 版本号（递增）
- **AND** 提交部署后所有浏览器将重新请求新版本图片

### Requirement 6: 全站图片完整性校验
系统 SHALL 在每次部署前确保所有配图文件存在且格式正确。

#### Scenario: 部署前校验
- **WHEN** 准备推送代码到 Vercel
- **THEN** 确认 `public/images/` 中 10 张配图全部存在
- **AND** 确认所有图片文件为有效 JPEG/PNG 格式（非 0 字节）
- **AND** 确认 `image-urls-v2.js` 中所有路径指向的文件实际存在

## MODIFIED Requirements

### Requirement: index.html Hero 轮播实现方式
**修改前**：使用 `background-image` + CSS `opacity` 过渡实现轮播
**修改后**：使用 `<img>` 标签 + CSS `opacity` 过渡实现轮播，保留原有淡入淡出效果

### Requirement: index.html Case/Service 卡片图片实现方式
**修改前**：JS 动态设置 `style.backgroundImage`，覆盖 CSS 渐变兜底
**修改后**：HTML 中预置 `<img>` 标签，JS 仅设置 `src` 属性，CSS 渐变作为容器背景兜底

## REMOVED Requirements

### Requirement: Unsplash 外部 CDN 依赖
**Reason**: 已全部迁移至本地 `public/images/` 目录
**Migration**: 无需迁移，已完成
