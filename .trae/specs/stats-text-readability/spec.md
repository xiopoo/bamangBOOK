# 统计数据文字可读性修复 Spec

## Why
首页 Hero 底部的 4 个统计数据（"130+ 企业完成诊断"、"2.2亿 单案最大债务化解"等）位于 `.stats-in-hero`（`z-index:3`）中，文字颜色为纯白（`.num{color:#fff}`）和 70% 白（`.label{color:rgba(255,255,255,.7)}`）。该区域无任何背景层，Hero 轮播图片（CSS background-image 全幅覆盖）的白色/浅色色块直接穿透，导致白色文字与白色背景色块重叠，可读性极差。

## What Changes
为统计数据区域添加品牌色半透明背景层，确保白色文字在所有轮播图片上均可清晰阅读。

## Impact
- Affected specs: fix-stats-and-background-images, hero-text-ellipse-bg
- Affected code: `hj/public/index.html`

## 设计方案

### 方案 A：整行背景面板（推荐）
为 `.stats-in-hero` 添加 `background` 属性，用半透明品牌色覆盖整行，为 4 个统计数据提供统一的深色背景。

**CSS**：
```css
.stats-in-hero {
  padding: 16px 0 24px;  /* 微调 padding 给背景留空间 */
  border-top: 1px solid rgba(255,255,255,.1);
  margin-top: 8px;
  position: relative;
  z-index: 3;
  background: linear-gradient(
    to right,
    rgba(171, 25, 66, 0.60) 0%,
    rgba(171, 25, 66, 0.45) 50%,
    rgba(171, 25, 66, 0.60) 100%
  );
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
```

**视觉效果**：
- 整行统一的深色背景，4 个白色数字清晰可辨
- 毛玻璃效果（`backdrop-filter: blur`）让背景略微模糊，视觉更柔和
- 与 Hero 区域装饰风格一致（品牌色系）

---

### 方案 B：独立卡片式背景
为每个 `.stat-item` 添加独立的半透明圆角卡片背景。

**CSS**：
```css
.stats-in-hero .stat-item {
  text-align: center;
  padding: 16px;
  position: relative;
  background: rgba(171, 25, 66, 0.35);
  border-radius: 12px;
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}
.stats-in-hero .stat-item::after { display: none; }  /* 移除分隔线 */
```

**视觉效果**：
- 每个 stat 独立卡片，间距清晰
- 35% 透明度即可，因为面积小，累积视觉效果更浓
- 移除分隔线 `::after`，卡片本身已界定边界

---

### 方案 C：仅增强文字（最小改动）
不添加背景，而是通过 text-shadow + 降低文字透明度以提升与浅色背景的对比。

**CSS**：
```css
.stats-in-hero .stat-item .num {
  font-size: 46px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.4);
  letter-spacing: -.02em;
  line-height: 1.1;
  margin-bottom: 6px;
}
.stats-in-hero .stat-item .label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);  /* 70% → 90% */
  line-height: 1.5;
}
```

**视觉效果**：
- 文字自带阴影，在浅色背景上有一定可读性
- 改动最小，无需额外元素
- 但效果不如背景面板可靠（text-shadow 在白色区域仍可能不够）

---

### 方案对比

| 维度 | A: 整行面板 | B: 独立卡片 | C: 仅文字增强 |
|------|:--------:|:--------:|:----------:|
| 文字可读性 | ★★★★★ | ★★★★★ | ★★★ |
| 视觉效果 | ★★★★ | ★★★★★ | ★★★ |
| 改动量 | 小 | 中 | **极小** |
| 移动端适配 | ★★★★ | ★★★★ | ★★★★★ |
| 与现有设计协调 | ★★★★★ | ★★★★ | ★★★ |

## 最终推荐：方案 A

**选择理由**：
1. 整行深色背景为所有 stat 提供统一支撑，可读性最佳
2. `background: linear-gradient` 两端略深（60%）、中间略浅（45%），视觉有层次感
3. `backdrop-filter: blur(4px)` 毛玻璃效果与品牌调性一致
4. 与 Hero 文字区的椭圆背景方案形成统一的视觉语言
5. 响应式友好（背景自动延伸）

## ADDED Requirements

### Requirement: 统计数据背景层
系统 SHALL 为 `.stats-in-hero` 添加品牌色半透明渐变背景，确保白色数据文字在所有 Hero 背景图片上清晰可读。

#### Scenario: 统计数据显示
- **WHEN** 用户访问首页
- **THEN** 4 个统计数据显示在品牌色半透明背景面板之上
- **AND** 白色数字（`.num`）和标签文字（`.label`）均清晰可辨
- **AND** 背景面板与 Hero 整体设计协调

## MODIFIED Requirements
### Requirement: .stats-in-hero CSS
```css
.stats-in-hero {
  padding: 16px 0 24px;
  border-top: 1px solid rgba(255,255,255,.1);
  margin-top: 8px;
  position: relative;
  z-index: 3;
  background: linear-gradient(
    to right,
    rgba(171, 25, 66, 0.60) 0%,
    rgba(171, 25, 66, 0.45) 50%,
    rgba(171, 25, 66, 0.60) 100%
  );
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
```

## REMOVED Requirements
无。
