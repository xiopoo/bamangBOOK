# 移动端红色背景元素重叠堆叠修复 Spec

## Why
`hero-inner::after` 伪元素（`position:absolute;top:100%;height:50px;z-index:-1`）虽然填充了 `.hero-inner` 与 `.stats-in-hero` 之间的间隙，但同时也与 `.stats-in-hero` 产生了 50px 的重叠区域。由于 `.stats-in-hero` 的背景是半透明渐变（`rgba(171,25,66,.60)` → `rgba(171,25,66,.45)`），`::after` 的 75% 实色背景（`rgba(171,25,66,.75)`）从半透明渐变下方透出，在重叠区域产生可见的色差/堆叠伪影。

## 问题分析

```
当前问题（::after 重叠）:                  目标效果:
┌──────────────────────┐                ┌──────────────────────┐
│ .hero-inner          │                │ .hero-inner          │
│ background: .75      │                │ background: .75      │
├══════════════════════┤                ├──────────────────────┤
│ ::after 重叠区域     │  ← 透出 .75   │ padding 延伸 10px    │
│ 与 .stats-in-hero    │  ← 混合渐变   │ (无重叠，背景连续)   │
│ 半透明渐变混合       │                ├──────────────────────┤
├──────────────────────┤                │ .stats-in-hero       │
│ .stats-in-hero       │                │ 渐变背景 (45-60%)    │
│ 渐变背景 (45-60%)    │                │                      │
└──────────────────────┘                └──────────────────────┘
```

## What Changes
1. 删除 `.hero-inner::after` 规则（移除重叠源）
2. 将 `.hero-inner{padding:24px 16px 0}` 改为 `padding:24px 16px 10px`
   - 10px 底部内边距延伸 `.hero-inner` 自身背景（与背景色绑定，无额外层叠）
   - 与 `.stats-in-hero{margin-top:0}` 配合，消除间隙
   - 无独立伪元素，无层叠重叠问题

## Impact
- Affected specs: mobile-hero-gap-final-fix
- Affected code: `hj/public/index.html`（移动端 @media 内 2 行修改）

## ADDED Requirements

### Requirement: 无元素重叠
系统 SHALL 确保移动端首屏品牌色背景元素之间不出现重叠堆叠。

#### Scenario: 正常渲染
- **WHEN** 用户访问移动端首页
- **THEN** `.hero-inner` 与 `.stats-in-hero` 之间无重叠
- **AND** 无可见的层叠伪影或色差混合

### Requirement: 无可见间隙
系统 SHALL 确保 `.hero-inner` 与 `.stats-in-hero` 之间无可见间隙，底层图片不露出。

## MODIFIED Requirements

```css
/* 改前 */
.hero-inner{padding:24px 16px 0;z-index:3;background:rgba(171,25,66,.75);border-radius:16px 16px 0 0}
.hero-inner::after{content:'';position:absolute;left:0;right:0;top:100%;height:50px;background:rgba(171,25,66,.75);z-index:-1}

/* 改后 */
.hero-inner{padding:24px 16px 10px;z-index:3;background:rgba(171,25,66,.75);border-radius:16px 16px 0 0}
/* 删除 .hero-inner::after 整行 */
```

## REMOVED Requirements
删除 `.hero-inner::after` 伪元素规则。其功能由 `.hero-inner` 的 `padding-bottom:10px` 替代。
