# 修复桌面端 Hero 首屏图片显示异常 Spec

## Why

用户报告在响应式网站中，手机端网页版的首页首屏图片（Hero 轮播背景图）能够正常显示，但在桌面端网页版中，首屏图片无法显示，仅显示红色渐变背景（CSS 渐变回退）。该问题持续存在，需要进行系统性根因分析并修复。

## 根因分析

经代码审查，发现以下关键差异和潜在问题：

### 1. `.hero` 缺少显式 `min-height`（桌面端）

```css
.hero{background:linear-gradient(135deg,var(--brand) 0%,var(--brand-dark) 100%);background-size:cover;background-position:center;position:relative;overflow:hidden}
```

- `.hero` 的高度完全由内容 `.hero-inner` 撑开，**没有任何显式 `min-height` 或 `height`**
- `.hero-carousel` 使用 `position:absolute;height:100%` 填充父容器 —— 如果 `.hero` 高度不足，轮播容器高度也将不足
- 在页面加载不稳定、字体渲染差异或网格内容高度计算存在偏差的场景下，`.hero` 可能高度不够，导致轮播图片无法有效展示
- 移动端（line 406）Hero 的内边距为 `padding:24px 16px 10px`，提供了更多底部空间；桌面端仅 `padding:20px 0 0`，垂直空间更紧凑

### 2. 桌面端 `overflow:hidden` 与移动端 `overflow:visible` 的差异

- 桌面端：`.hero{overflow:hidden}`（line 83）
- 移动端：`.hero{overflow:visible}`（line 413）

当 `.hero` 内容高度不足或渲染过程中存在尺寸波动时，`overflow:hidden` 会裁剪轮播内容。移动端的 `overflow:visible` 允许内容溢出，因此即使在 `.hero` 高度不足时，轮播图片仍可见。

### 3. 桌面端 `.hero-inner` 缺少显式 `z-index`

- 桌面端：`.hero-inner{position:relative}`（z-index:auto → 在 `.hero` 的层叠上下文中渲染于步骤 6）
- 移动端：`.hero-inner{z-index:3}`（line 406 → 渲染于步骤 7，明确在轮播之上）

在桌面端，`.hero-inner`（position:relative, z-index:auto）与 `.hero-carousel`（position:absolute, z-index:auto）处于同一层叠级别（步骤 6），按 DOM 顺序绘制。由于 `.hero-inner` 在 DOM 顺序上晚于 `.hero-carousel`，它绘制在轮播之上。但更重要的是，`z-index:auto` 意味着 `.hero-inner` **不创建新的层叠上下文**，导致其子元素 `.hero-content{z-index:3}` 的 z-index 直接作用于 `.hero` 的层叠上下文。虽然理论上轮播仍应在内容之下可见，但结合 3D 球状图中大量 `position:absolute` 元素（z-index 值从 0 到 10），可能在某些渲染场景中干扰轮播图的显示。

### 4. 桌面端的复杂 DOM 结构

桌面端 `.hero-visual`（3D 球状图）处于可见状态，其 JS 脚本创建了大量绝对定位元素（轨道、节点、连线），这些元素可能消耗渲染资源或意外遮挡轮播区域。

## What Changes

1. **为 `.hero` 添加 `min-height`** — 确保 Hero 区域在桌面端始终有足够高度展示轮播图片
2. **为 `.hero-carousel` 添加显式 `z-index`** — 明确层叠顺序，避免与 `.hero-inner` 及其子元素产生层叠歧义
3. **为 `.hero-inner` 添加显式 `z-index`** — 在桌面端也创建明确的层叠上下文，与移动端行为一致
4. **优化轮播图片加载逻辑** — 添加错误处理和诊断日志，便于排查

## Impact

- Affected code: `hj/public/index.html`（CSS + JS）
- 影响范围仅限于首页 Hero 区域的桌面端显示
- 移动端行为不受影响（移动端已有 `z-index:3` 和 `overflow:visible`）

## ADDED Requirements

### Requirement: 桌面端 Hero 最小高度

系统 SHALL 确保首页 Hero 区域在桌面端视口（≥768px）具有足够的最小高度，使轮播图片能够完整展示。

#### Scenario: 桌面端 Hero 渲染
- **WHEN** 视口宽度 ≥ 768px
- **THEN** `.hero` 元素高度至少为 `min-height` 设定值
- **AND** `.hero-carousel` 的绝对定位填充正确覆盖 Hero 区域

### Requirement: 一致的层叠上下文

系统 SHALL 确保桌面端和移动端的 Hero 区域具有一致的层叠上下文行为。

#### Scenario: 轮播层叠顺序
- **WHEN** 桌面端页面加载完成
- **THEN** `.hero-carousel` 在层叠上下文中明确位于 `z-index:1`
- **AND** `.hero-inner` 位于 `z-index:2`（内容在轮播之上）
- **AND** 轮播图片背景在渐变回退之上可视

### Requirement: 加载诊断能力

系统 SHALL 在 Hero 轮播图片加载过程中输出诊断日志，以便未来排查类似问题。

#### Scenario: 诊断日志
- **WHEN** JS 执行图片 URL 注入
- **THEN** 控制台输出 `[Hero]` 前缀的日志，包含 Hero 元素实际高度、图片 URL 和注入状态

## MODIFIED Requirements

### Requirement: .hero CSS（修改后）

```css
/* 桌面端（基线样式） */
.hero{
  background:linear-gradient(135deg,var(--brand) 0%,var(--brand-dark) 100%);
  background-size:cover;background-position:center;
  position:relative;overflow:hidden;
  min-height:480px
}
```

- `min-height:480px` 确保 Hero 在任何视口下都有足够高度展示轮播
- 移动端通过媒体查询可覆盖此值

### Requirement: .hero-carousel CSS（修改后）

```css
.hero-carousel{
  position:absolute;top:0;left:0;width:100%;height:100%;
  overflow:hidden;z-index:1
}
```

- 添加 `z-index:1` 确保轮播层叠顺序明确

### Requirement: .hero-inner CSS（桌面端，修改后）

```css
.hero-inner{
  position:relative;z-index:2;
  display:grid;grid-template-columns:1.3fr 1fr;
  gap:24px;align-items:center;
  box-sizing:border-box;min-height:auto;padding:20px 0 0
}
```

- 添加 `z-index:2` 确保内容层叠在轮播之上，与移动端行为一致

## REMOVED Requirements

无。
