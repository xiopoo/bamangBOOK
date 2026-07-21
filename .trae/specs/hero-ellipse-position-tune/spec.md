# Hero 椭圆背景位置与尺寸微调 Spec

## Why
当前 Hero 区域椭圆背景块（`.hero-content::before`）尺寸偏大，覆盖范围超出文字内容较多，且中心点与文字内容中心存在偏移。椭圆视觉重心偏右下，需要整体向左上角微调，并适当缩小尺寸，使椭圆与文字内容形成更精确的包裹关系，提升页面视觉精致度。

## Current State
当前 CSS（第 103 行）：
```css
.hero-content::before {
  content: '';
  position: absolute;
  top: -40px;
  left: -80px;
  right: -80px;
  bottom: -40px;
  background: radial-gradient(ellipse at center, ...);
  border-radius: 50%;
  ...
}
```

椭圆在 `.hero-content` 四周的扩展量：
- 水平：左右各 80px（总计 +160px）
- 垂直：上下各 40px（总计 +80px）
- 椭圆中心 = `.hero-content` 中心（对称扩展）

## What Changes
1. 缩小椭圆尺寸：减小负值偏移总量
2. 向左上角偏移椭圆中心：非对称负值偏移（top/left 比 right/bottom 更负）
3. 确保椭圆覆盖文字区域且边缘在 CTA 按钮上方自然渐隐

## Impact
- Affected code: `hj/public/index.html`（CSS 1 行，仅修改偏移值）
- 不涉及 HTML 结构、JS 逻辑或其他 CSS 规则

## 调整方案

### 参数说明
| 属性 | 当前值 | 调整后 | 变化 |
|------|--------|--------|------|
| `top` | -40px | -36px | 向上收缩 4px（中心上移 2px） |
| `left` | -80px | -72px | 向左收缩 8px（中心左移 8px） |
| `right` | -80px | -56px | 向右收缩 24px（中心左移 12px） |
| `bottom` | -40px | -24px | 向下收缩 16px（中心上移 8px） |

### 效果计算
- 水平总扩展：72 + 56 = 128px（原 160px）→ **缩小 20%**
- 垂直总扩展：36 + 24 = 60px（原 80px）→ **缩小 25%**
- 椭圆中心偏移：左移 10px，上移 5px
- 文字在椭圆内保持精确居中（椭圆中心更贴近文字视觉中心）

### 调整后 CSS
```css
.hero-content::before{content:'';position:absolute;top:-36px;left:-72px;right:-56px;bottom:-24px;background:radial-gradient(ellipse at center,rgba(171,25,66,.65) 0%,rgba(171,25,66,.40) 50%,transparent 80%);border-radius:50%;z-index:-1;pointer-events:none}
```

## ADDED Requirements

### Requirement: 椭圆尺寸与位置
系统 SHALL 将椭圆背景的负值偏移从对称分布调整为非对称分布。

#### Scenario: 椭圆渲染
- **WHEN** 用户访问首页
- **THEN** 椭圆背景覆盖文字区域但范围比之前缩小
- **AND** 椭圆视觉中心更靠近文字区域中心
- **AND** 椭圆边缘延伸至 CTA 按钮上方即可自然渐隐，不过度扩展
- **AND** 椭圆左上边缘不超出 Hero 区域边界

## MODIFIED Requirements

### Requirement: .hero-content::before（修改后）
同上述"调整后 CSS"。

## REMOVED Requirements
无。
