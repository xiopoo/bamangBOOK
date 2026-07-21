# 移动端 Hero 色块间隔彻底根治 Spec

## Why
移动端（≤767px）首页 Hero 区域的两个品牌色背景块（`.hero-inner` 和 `.stats-in-hero`）之间持续存在视觉间隔，虽经多轮修复（添加背景、消除圆角、隐藏分隔线）均未彻底解决。

## 根本原因分析

### Root Cause: 层叠上下文中的间隙暴露

两个色块是两个**独立的 DOM 元素**，各有自己的背景：
- `.hero-inner{position:relative;z-index:3}` — 顶部文字区域，`rgba(171,25,66,0.75)` 背景
- `.stats-in-hero{position:relative;z-index:3}` — 底部统计数据，渐变背景

虽然两者 `z-index:3` 均高于 `.hero-carousel{z-index:2}`，但在两个元素的**交界处**，`.hero-carousel`（position:absolute 覆盖全 Hero 区域）从两者的间隙中暴露。两个独立盒模型之间即便 margin/padding 为 0，浏览器在渲染时仍可能存在**亚像素间隙**或**行框间距**。

```
根层叠上下文:
  z-index:2  ─ .hero-carousel（覆盖全 Hero 区域 ↓↓↓）
  z-index:3  ─ .hero-inner（背景 → ▓▓▓▓▓▓▓▓▓） 
                 ║ ← 亚像素间隙/行框间距 → 车臣图片暴露 ║
  z-index:3  ─ .stats-in-hero（背景 → ▓▓▓▓▓▓▓▓▓）
```

### 辅助因素

| 因素 | 说明 | 是否已修复 |
|------|------|-----------|
| `.hero-inner{border-radius:16px}` 底部圆角 | 圆角与直边不匹配，产生弧形缺口 | ✅ `16px 16px 0 0` |
| `.stats-in-hero{border-top}` 分隔线 | 视觉割裂 | ✅ `border-top:none` |
| `.stats-in-hero{margin-top:8px}` | 垂直间距 | ✅ `margin-top:0` |
| **独立盒模型间隙（本次根因）** | **两个独立元素之间的固有间隙** | ❌ **待修复** |

## 解决方案

### 方案 A（推荐）：`.hero-inner::after` 向下延伸填充间隙

利用伪元素在 `.hero-inner` 底部下方延伸一个背景条，填充两个元素之间的任何间隙。

**原理**：
- `.hero-inner{position:relative;z-index:3}` 创建层叠上下文
- `::after{position:absolute;top:100%;height:50px;z-index:-1}` 在此上下文内位于 z-index:-1
- 整个上下文位于根层叠上下文的 z-index:3，高于 `.hero-carousel{z-index:2}`
- `::after` 延伸部分覆盖底层车臣图片，填充间隙
- `.stats-in-hero{z-index:3}` 在其上方重叠时覆盖 `::after`

```
根层叠上下文:
  z-index:2  ─ .hero-carousel
  z-index:3  ─ .hero-inner（包含 ::after）
                 ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ← hero-inner 背景
                 ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ← ::after 延伸 50px 填充间隙
               ─ .stats-in-hero
                 ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ← 覆盖 ::after，间隙完全消除
```

**CSS**（仅移动端 @media 内添加）：
```css
.hero-inner::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  height: 50px;
  background: rgba(171, 25, 66, 0.75);
  z-index: -1;
}
```

**优势**：无需修改 HTML，仅 1 条规则，与现有层叠架构兼容。

### 方案 B：HTML 结构重组

将 `.container`（包装 `.hero-inner`）和 `.stats-in-hero` 包裹在一个新的 `<div class="hero-body">` 中，让 `hero-body` 提供统一背景。

**优势**：视觉上完全统一的一个背景块
**劣势**：需要修改 HTML 结构，影响面大

### 方案对比

| 维度 | A: ::after 延伸 | B: HTML 重组 |
|------|:-------------:|:----------:|
| 改动量 | **极小（1 条 CSS）** | 大（HTML + CSS） |
| 可靠性 | ★★★★★ | ★★★★★ |
| 影响范围 | 仅移动端 | 全屏 |
| 副作用风险 | 几乎为零 | 可能影响其他布局 |
| 回滚难度 | 删除 1 行 | 需要撤销 HTML 更改 |

## Impact
- Affected specs: mobile-hero-gap-radical-fix, mobile-hero-gap-fix
- Affected code: `hj/public/index.html`（移动端 @media 内 1 条规则）

## MODIFIED Requirements

### Requirement: 间隙填充
系统 SHALL 在移动端通过 `.hero-inner::after` 伪元素填充 `.hero-inner` 与 `.stats-in-hero` 之间的任何间隙。

#### Scenario: 移动端渲染
- **WHEN** 用户在移动设备访问首页
- **THEN** `.hero-inner` 背景与 `.stats-in-hero` 背景之间无任何可见间隙
- **AND** 底层 Hero 图片不可见

### 最终推荐：方案 A

不修改 HTML，仅添加 1 条 CSS 规则。利用现有层叠架构，`::after` 在 `z-index:-1` 处延伸 50px 填充间隙，被 `.stats-in-hero{z-index:3}` 自然覆盖。
