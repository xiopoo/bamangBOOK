# 首页统计数据显示修复 + Hero 图片背景化重构 Spec

## Why

经诊断发现两个独立问题：

### 问题 1：底部统计数据未显示

* **z-index 层叠**：`.stats-in-hero` 位于 `.hero` 内部的正常流末端，未设置 `position`/`z-index`，被 `.hero-carousel{z-index:2}`（position:absolute，高度 100%）完全覆盖，导致 4 个数字统计项全部不可见

* **数据源缺失**：`js/seed-data.js` 内容为空，`window.__SEED` 为 `undefined`。虽然 JS 有 `{diagnosisCount:128}` 兜底，但统计计数器无法展示正确的累计数据

### 问题 2：Hero 图片与内容层叠复杂化

当前使用 `<img>` 标签配合 JS 设置 `src` 的方式，需要复杂的 z-index 管理体系（图片 z-index:2、遮罩 z-index:2、文字 z-index:3、球体 z-index:3、按钮 z-index:4、指示点 z-index:5）。每次新增一个需要在内容层显示的元素，都需要手动调整 z-index。将图片改为 CSS `background-image` 后，图片成为元素的背景层，无需 z-index 管理，从根本上简化层叠结构。

## What Changes

1. **stats-in-hero 层叠修复**：为 `.stats-in-hero` 添加 `position:relative;z-index:3`（与文字/球体同级，在图片/遮罩之上）
2. **seed-data.js 数据填充**：写入 `window.__SEED` 定义，包含 `diagnosisCount` 等初始值
3. **Hero** **`<img>`** **→** **`background-image`** **重构**：

   * 移除 `.hero-slide` 中的 `<img>` 标签

   * JS 改为在 `.hero-slide` 上设置 `background-image`（叠加在渐变兜底之上）

   * 移除 `.hero-slide-img` CSS 及其 z-index

   * 可移除 `.hero-overlay`（因为背景图像在元素背景层，`::before`/`::after` 可覆盖）

## Impact

* Affected specs: 全部之前的 image-related specs 将被简化

* Affected code: `hj/public/index.html`, `hj/public/js/seed-data.js`, `hj/public/js/image-urls-v2.js`

## ADDED Requirements

### Requirement 1: stats-in-hero 在图片之上显示

系统 SHALL 确保统计数据区域在图片和遮罩之上可见。

#### Scenario: z-index 修复

* **WHEN** 页面加载完成，Hero 区域渲染

* **THEN** `.stats-in-hero` 应设置 `position:relative;z-index:3`

* **AND** 4 个统计数字（诊断数/债务化解/就业岗位/净利润）全部可见

* **AND** 统计数字样式（白色大号字体）保持不变

### Requirement 2: seed-data.js 包含有效数据

系统 SHALL 确保 `js/seed-data.js` 定义 `window.__SEED` 对象，使诊断计数器能读取初始值。

#### Scenario: 数据可用

* **WHEN** 页面 JS 读取 `window.__SEED`

* **THEN** `window.__SEED` 应定义为 `{diagnosisCount: 128}`

* **AND** `#diagnosis-count` 元素显示 `128+`

### Requirement 3: Hero 图片背景化

系统 SHALL 将 Hero 轮播图片从 `<img>` 标签改为 CSS `background-image`，简化层叠结构。

#### Scenario: 背景图片加载

* **WHEN** 页面加载，JS 读取 `window.__IMAGE_URLS`

* **THEN** JS 在 `.hero-slide` 元素上设置 `style.backgroundImage`

* **AND** 背景图片格式为 `url(...), linear-gradient(...)`（图片在上，渐变兜底在下）

* **AND** 移除 `<img>` 标签及相关错误处理（`onerror`/`onload`/`img-error`）

#### Scenario: 层叠结构简化

* **WHEN** 修改完成后

* **THEN** Hero 层叠结构简化为：

  ```
  z-index:0 — 装饰背景 + 轮播背景图片
  z-index:3 — 文字内容 + 球体图 + 统计数据
  z-index:5 — 按钮 + 指示点
  ```

* **AND** 无需单独的 `.hero-overlay` 遮罩层

## ikiMODIFIED Requirements

### Requirement: Hero 图片加载方式（修改前）

* 使用 `<img src="">` 标签

* JS 设置 `img.src = heroImages[i]`

* 需要 `img-error` 类处理加载失败

* 需要 `z-index:2` 设置图片层级

* 需要 `.hero-overlay` 遮罩层确保可读性

### Requirement: Hero 图片加载方式（修改后）

* 移除 `.hero-slide` 内的 `<img>` 标签

* JS 设置 `slide.style.backgroundImage = 'url(...), linear-gradient(...)'`

* 加载失败由 CSS 背景渐变自动兜底

* 无需单独的图片 z-index

* 可移除 `.hero-overlay` 遮罩层

### Requirement: Hero 层叠结构（修改后）

```
z-index:0 — ::before / ::after / .hero-decoration（装饰）
            .hero-slide（背景图片渲染在元素背景层, 无需 z-index）
z-index:3 — .hero-inner（文字 + 球体）
z-index:3 — .stats-in-hero（统计数据）
z-index:5 — .hero-cta（按钮）
z-index:5 — .hero-carousel-dots（指示点）
```

## REMOVED Requirements

* `.hero-slide-img` CSS 规则（不再需要）

* `.img-error` CSS 规则（不再需要）

* `<img>` 标签的 `onerror/onload` 事件处理（不再需要）

* `.hero-overlay` CSS 及 DOM 元素（不再需要）

