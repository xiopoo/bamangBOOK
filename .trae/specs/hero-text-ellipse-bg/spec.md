# Hero 文字区域椭圆半透明背景 Spec

## Why
当前 Hero 区域文字为纯白色（`color:#fff`），直接叠加在 Hero 背景图片之上。虽然背景图片通过半透明遮罩进行了压暗处理，但白色文字在图片颜色较浅的区域仍然存在视觉识别问题，部分文字与背景融入，影响可读性和用户体验。

需要为文字内容添加一个椭圆形的半透明背景，使用品牌色 `#AB1942`，确保文字在所有 Hero 轮播图片上都能清晰可读，同时保持整体视觉美感。

## What Changes
在 `.hero-content` 上添加 `::before` 伪元素，创建一个椭圆形的半透明品牌色背景层。

## Impact
- Affected specs: fix-stats-and-background-images（本 spec 为其补充）
- Affected code: `hj/public/index.html`（仅 CSS）

## 设计方案

### 方案 A：径向渐变椭圆（推荐）
使用 `radial-gradient(ellipse at center, ...)` 创建中心不透明度高、边缘渐隐至透明的椭圆背景。

```css
.hero-content::before {
  content: '';
  position: absolute;
  top: -40px;
  left: -80px;
  right: -80px;
  bottom: -40px;
  background: radial-gradient(
    ellipse at center,
    rgba(171, 25, 66, 0.65) 0%,
    rgba(171, 25, 66, 0.40) 50%,
    transparent 80%
  );
  z-index: -1;
  pointer-events: none;
  border-radius: 50%;
}
```

**透明度说明**：
| 区域 | 不透明度 | 效果 |
|------|---------|------|
| 中心 0%（文字区域） | 65% | 深色背景，文字清晰 |
| 50%（文字边缘） | 40% | 柔和过渡 |
| 80%（外围） | 0% (透明) | 与 Hero 背景自然融合 |

**视觉效果**：
- 中心：深色品牌色半透明底，白色文字清晰可辨
- 边缘：渐变消失，无硬切边
- 整体：类似"光晕"效果，自然融入 Hero 背景

---

### 方案 B：实色椭圆（备选）
使用 `backdrop-filter: blur()` + 半透明品牌色，创建类似毛玻璃的椭圆背景。

```css
.hero-content {
  padding: 24px 32px;
  margin: -24px -32px;
  border-radius: 50%;
  background: rgba(171, 25, 66, 0.55);
}
```

**透明度建议**：55%

**视觉效果**：
- 实色椭圆区域，有明确的形状边界
- 边缘可能较硬，视觉上更"有存在感"
- 像标签/徽章效果

---

### 透明度对照表

| 不透明度 | 效果 | 适用场景 |
|---------|------|---------|
| 45% | 轻微压暗，图片仍清晰可见 | 图片颜色较深 |
| 55% | 中等压暗，文字可读性好 | **推荐通用值** |
| 65% | 明显压暗，文字非常清晰 | 图片颜色较浅 |
| 75% | 大幅压暗，图片几乎不可见 | 仅在需要最高可读性时使用 |

## 最终推荐：方案 A

**选择理由**：
1. 边缘渐变消失，无硬切边，视觉更自然
2. 中心 65% 不透明度确保文字清晰
3. 从中心到外围的渐变与 Hero 背景图自然融合
4. 不影响 Hero 整体设计风格

## ADDED Requirements

### Requirement: 椭圆背景层
系统 SHALL 在 `.hero-content` 上添加一个椭圆形的半透明背景层。

#### Scenario: 背景渲染
- **WHEN** 用户访问首页
- **THEN** 文字内容后方显示一个椭圆形的 `#AB1942` 半透明背景
- **AND** 背景从中心（65% 不透明度）到边缘（透明）渐变
- **AND** 背景不遮挡文字内容或 CTA 按钮

## MODIFIED Requirements
### Requirement: .hero-content CSS（修改后）
```css
.hero-content {
  position: relative;
  z-index: 3;
}
.hero-content::before {
  content: '';
  position: absolute;
  top: -40px;
  left: -80px;
  right: -80px;
  bottom: -40px;
  background: radial-gradient(
    ellipse at center,
    rgba(171, 25, 66, 0.65) 0%,
    rgba(171, 25, 66, 0.40) 50%,
    transparent 80%
  );
  z-index: -1;
  pointer-events: none;
  border-radius: 50%;
}
```

## REMOVED Requirements
无。
