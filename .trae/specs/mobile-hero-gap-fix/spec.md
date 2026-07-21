# 移动端 Hero 区域红色背景块间隔修复 Spec

## Why
在移动设备（max-width:767px）上，首页 Hero 区域出现两个独立的半透明品牌色背景区块：
1. **上方区块**：`.hero-content::before` — 文字背后的 `rgba(171,25,66,0.75)` 圆角面板
2. **下方区块**：`.stats-in-hero` — 统计数据行的渐变背景

由于 `.hero-inner` 在移动端有 `padding:40px 0`（其中 40px 为底部内边距），而 `.stats-in-hero` 有 `margin-top:8px`，两个区块之间存在约 24px 的间隙，露出 Hero 轮播图片，视觉效果割裂。

## What Changes
在移动端（max-width:767px）为 `.hero-inner` 添加与文字面板相同颜色的背景（`rgba(171,25,66,0.75)`）及 `z-index:3`，使间隙区域被品牌色填充。同时减少 `.hero-inner` 底部内边距和 `.stats-in-hero` 顶部外边距，使两个区块无缝衔接。

## Impact
- Affected specs: stats-text-readability, hero-text-ellipse-bg
- Affected code: `hj/public/index.html`（仅移动端 CSS 覆盖）

## 问题分析

### 层叠结构（移动端）
```
z-index:3 — .hero-content（含 ::before 面板）
z-index:? — .hero-inner（无 z-index，无背景）← 间隙区域
z-index:3 — .stats-in-hero（含渐变背景）
z-index:2 — .hero-carousel（背景图片）
```

### 间隙计算
| 来源 | 值 | 说明 |
|------|----|------|
| `.hero-inner{padding:40px 0}` 底部 | 40px | 最外层容器底部空白 |
| `.hero-content::before{bottom:-24px}` 向下延伸 | -24px | 面板超出内容区域 |
| `.stats-in-hero{margin-top:8px}` | 8px | 统计区域顶部间距 |
| **净间隙** | **~24px** | 露出底层图片 |

## ADDED Requirements

### Requirement: 移动端背景连续性
系统 SHALL 确保在移动设备上 Hero 区域文字面板与统计数据背景无缝衔接，无间隙。

#### Scenario: 移动端渲染
- **WHEN** 用户在移动设备（宽度 ≤ 767px）访问首页
- **THEN** `.hero-content::before` 的文字面板与 `.stats-in-hero` 的背景之间无可见间隙
- **AND** 间隙区域使用与面板相同的品牌色（`rgba(171,25,66,0.75)`）填充
- **AND** 底层 Hero 图片在间隙中不可见

### Requirement: 设计完整性
系统 SHALL 在移动端保持与桌面版一致的设计风格和功能完整性。

#### Scenario: 功能保留
- **WHEN** 移动端渲染完成
- **THEN** 所有文字内容（标题、描述、统计数据）清晰可读
- **AND** CTA 按钮可正常点击
- **AND** 轮播指示点可正常操作

## MODIFIED Requirements

### 移动端 CSS 修改

#### .hero-inner（移动端覆盖）
```css
@media (max-width: 767px) {
  .hero-inner {
    position: relative;
    z-index: 3;
    background: rgba(171, 25, 66, 0.75);
    border-radius: 16px;
    padding: 24px 16px 0;  /* 底部无 padding，与 stats 无缝衔接 */
  }
}
```

#### .hero-content::before（移动端 — 隐藏，由 hero-inner 背景替代）
```css
@media (max-width: 767px) {
  .hero-content::before {
    display: none;  /* 背景已移至 .hero-inner */
  }
}
```

#### .stats-in-hero（移动端 — 消除上边距）
```css
@media (max-width: 767px) {
  .stats-in-hero {
    margin-top: 0;    /* 消除间隙 */
    padding: 8px 0;   /* 保持合适间距 */
  }
}
```

### 修改前 vs 修改后（移动端视觉对比）

```
修改前：                           修改后：
┌──────────────────────────┐      ┌──────────────────────────┐
│  .hero-content::before   │      │  .hero-inner 背景（连续）│
│  （品牌色面板）           │      │  ┌─ 文字内容 ─────────┐ │
│  文字内容                 │      │  │ 文字内容            │ │
└──────────────────────────┘      │  └────────────────────┘ │
         ▲ 间隙 ~24px             ├──────────────────────────┤
         │ 露出图片               │  .stats-in-hero 背景     │
┌──────────────────────────┐      │  130+  2.2亿  550+ 29.5%│
│  .stats-in-hero 背景     │      └──────────────────────────┘
│  130+ 2.2亿 550+ 29.5%  │
└──────────────────────────┘
```

## REMOVED Requirements
无。所有改动为移动端 CSS 覆盖，桌面端不受影响。
