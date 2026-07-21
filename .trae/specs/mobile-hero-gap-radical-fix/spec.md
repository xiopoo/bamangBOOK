# 移动端 Hero 色块间隔彻底修复 Spec

## Why
上一次移动端间隙修复（mobile-hero-gap-fix）通过为 `.hero-inner` 添加背景色消除了垂直方向的大部分间隙，但遗漏了两个关键问题：

### 问题 1：底部圆角产生边缘间隙
`.hero-inner{border-radius:16px}` 将四个角都设为圆角。移动端上，`.hero-inner` 直接紧邻下方的 `.stats-in-hero`，底部圆角在左右两侧形成弧形缺口，底层 Hero 图片从这两个弧形缺口中露出。`.stats-in-hero` 的直边上沿与 `.hero-inner` 的圆角下沿不匹配。

```
  ┌──────────────────────┐
  │  .hero-inner         │
  │  圆角矩形背景         │
  │            ╲    ╱    │  ← 底部圆角
  │             ╲  ╱     │
  └──────────────┘       │  ← 左右弧形缺口露出图片
  ┌──────────────────────┐
  │  .stats-in-hero      │
  │  直边上沿             │
  └──────────────────────┘
```

### 问题 2：分隔线制造视觉断裂
`.stats-in-hero{border-top:1px solid rgba(255,255,255,.1)}` 在两个色块之间添加了一条可见的水平分隔线。这条线从视觉上割裂了两个本应连续的背景区域，使其看起来像两个独立的区块，而非一个统一的整体。移动端宽度仅 375-414px，每条视觉线都会被放大感知。

```
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ← .hero-inner 背景 (75% opacity)
  ──────────────────────────  ← border-top 分隔线 ❌
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ← .stats-in-hero 渐变背景
```

## What Changes
1. `.hero-inner` 移动端：`border-radius:16px` → `border-radius:16px 16px 0 0`（仅保留顶部圆角）
2. `.stats-in-hero` 移动端：`border-top` 隐藏，消除视觉断裂

## Impact
- Affected specs: mobile-hero-gap-fix
- Affected code: `hj/public/index.html`（仅移动端 @media 内两行修改）

## ADDED Requirements

### Requirement: 移动端色块无缝衔接
系统 SHALL 确保移动端 `.hero-inner` 背景与 `.stats-in-hero` 背景之间完全无缝，无任何形式的视觉间隙。

#### Scenario: 无底部圆角间隙
- **WHEN** 在移动设备上查看首页
- **THEN** `.hero-inner` 的底部左右两侧不应有圆角缺口
- **AND** 底部 Hero 图片不应从任何角度露出

#### Scenario: 无分隔线
- **WHEN** 在移动设备上查看首页
- **THEN** `.hero-inner` 与 `.stats-in-hero` 之间不应有可见的水平分隔线
- **AND** 两个色块在视觉上应呈现为连续统一的背景区域

## MODIFIED Requirements

### 移动端 CSS（max-width: 767px）

#### .hero-inner border-radius 修改
```css
/* 改前 */
.hero-inner{...border-radius:16px}

/* 改后 */
.hero-inner{...border-radius:16px 16px 0 0}  /* 仅顶部圆角，底部直角 */
```

#### .stats-in-hero border-top 隐藏
```css
/* 改前 */
.stats-in-hero{padding:0 0 8px;margin-top:0}

/* 改后 */
.stats-in-hero{padding:0 0 8px;margin-top:0;border-top:none}  /* 隐藏分隔线 */
```

### 修改后视觉效果

```
移动端改后：
┌──────────────────────────────┐
│  .hero-inner                 │
│  ╭──────────────────────╮    │  ← 顶部圆角 (16px)
│  │  灰金重组             │    │
│  │  企业困境诊断与重组顾问 │    │
│  │  看 清 问 题 · 重 建 秩 序 │    │
│  │  [免费诊断]           │    │
│  ╰──────────────────────╯    │
├──────────────────────────────┤  ← 底部直角，与 stats 无缝衔接
│  .stats-in-hero              │  ← 无分隔线，连续背景
│  130+  2.2亿  550+  29.5%    │
└──────────────────────────────┘
```

## REMOVED Requirements
无。
