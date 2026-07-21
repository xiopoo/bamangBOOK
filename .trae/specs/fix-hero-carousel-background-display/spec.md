# 修复 Hero 轮播背景图片显示异常 Spec

## Why
Hero 区域轮播图片显示异常。经排查，图片资源本身正常（HTTP 200），JavaScript 逻辑加载正确，但 `.hero-slide` 的 CSS 缺少 `background-size` 和 `background-position` 属性。当 JS 通过 `background-image` 设置图片时，`background-size` 默认值为 `auto`，导致图片以原生尺寸（1400×933）渲染并定位在左上角，在大多数视口下无法正确覆盖 Hero 区域。

## Root Cause
Line 94 的 CSS 规则：
```css
.hero-slide{position:absolute;top:0;left:0;width:100%;height:100%;opacity:0;transition:opacity 1.2s ease;background:linear-gradient(135deg,var(--brand) 0%,var(--brand-dark) 100%)}
```

问题：
1. `.hero-slide` 使用 `background` 简写属性仅设置了 `linear-gradient`，这会将所有未指定的背景子属性重置为默认值，包括 `background-size:auto` 和 `background-position:0% 0%`
2. 当 JS（第 1211 行）设置 `s.style.backgroundImage = 'url(...), linear-gradient(...)'` 时，图片使用默认的 `auto` 尺寸和 `0% 0%` 位置
3. `.hero` 虽有 `background-size:cover;background-position:center`（第 83 行），但这不影响子元素 `.hero-slide`
4. 此前使用 `<img>` 标签时依靠 `object-fit:contain` 控制显示，改为 CSS `background-image` 后未能添加对应的背景尺寸属性

## What Changes
1. 在 `.hero-slide` CSS 规则中添加 `background-size:cover;background-position:center`

## Impact
- Affected code: `hj/public/index.html`（CSS 1 行修改）
- 影响范围仅限于 Hero 轮播图片显示

## ADDED Requirements

### Requirement: 轮播背景图覆盖
系统 SHALL 确保 `.hero-slide` 的背景图片正确覆盖整个轮播区域。

#### Scenario: 图片渲染
- **WHEN** JS 设置 `backgroundImage` 后
- **THEN** 图片以 `cover` 模式填充 `.hero-slide`
- **AND** 图片居中定位
- **AND** 图片不重复（`background-repeat:no-repeat` 默认行为）
- **AND** CSS 渐变作为回退背景位于图片后方

## MODIFIED Requirements

### Requirement: .hero-slide CSS（修改后）
```css
.hero-slide{position:absolute;top:0;left:0;width:100%;height:100%;opacity:0;transition:opacity 1.2s ease;background:linear-gradient(135deg,var(--brand) 0%,var(--brand-dark) 100%);background-size:cover;background-position:center}
```

`background-size:cover` 和 `background-position:center` 在 `background` 简写之后声明，因此不会被简写重置覆盖。它们与多背景（图片 + 渐变）兼容——浏览器将相同的尺寸和定位设置应用于所有背景层。

## REMOVED Requirements
无。
