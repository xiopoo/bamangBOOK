# 首页 Hero 区域文字被图片遮挡布局修复 Spec

## Why
在上一次配图修复中（`hj-image-system-final`），为了修复 Hero 轮播图片被装饰元素覆盖的问题，将 `.hero-carousel` 的 `z-index` 从 0 提升至 2。但未同步调整 `.hero-content` 的 `z-index`（仍为 1），导致轮播图片渲染在文字内容之上，首页标题、副标题和 CTA 按钮被图片遮挡，严重影响可读性和用户体验。

## What Changes
- 将 `.hero-content` 的 `z-index` 从 1 提升至 3（高于 `.hero-carousel` 的 2）
- 将 `.hero-cta` 的 `z-index` 从 2 提升至 4（高于文字内容，确保按钮可点击）
- 整体规范 Hero 区域层叠顺序并加注释说明
- 无需修改其他页面

## Impact
- Affected specs: hj-image-system-final（本 spec 为其修正）
- Affected code: `hj/public/index.html`（仅 CSS z-index 值修改）

## ADDED Requirements

### Requirement 1: 修正 Hero 区域层叠顺序
系统 SHALL 确保 Hero 区域中所有元素的层叠顺序正确，文字内容在图片之上。

#### 正确的层叠顺序（从底到顶）
| z-index | 元素 | 说明 |
|---------|------|------|
| 0 | `.hero::before`, `.hero::after`, `.hero-decoration` | 装饰背景元素 |
| 1 | `.hero-inner`, `.hero-content` | 文字内容层 |
| 2 | `.hero-carousel`, `.hero-slide`, `.hero-slide-img` | 轮播图片层 |
| 3 | `.hero-content` | 文字内容顶层 |
| 4 | `.hero-cta` | 按钮（确保可点击） |
| 5 | `.hero-carousel-dots` | 轮播指示点 |

#### Scenario: Hero 区域展示
- **WHEN** 用户访问首页
- **THEN** 轮播图片作为背景显示（z-index:2）
- **AND** Hero 标题、副标题文字显示在图片上方（z-index:3）
- **AND** CTA 按钮可正常点击（z-index:4）
- **AND** 轮播指示点在最上层（z-index:5）

### Requirement 2: 层叠顺序文档化
系统 SHALL 在 CSS 中添加注释清晰地标注 each 元素的 z-index 用途。

#### Scenario: 代码可维护性
- **WHEN** 开发者查看 Hero 区域 CSS 代码
- **THEN** 每个 z-index 值旁边应有注释说明其在层叠上下文中的角色

## MODIFIED Requirements

### Requirement: Hero 区域 CSS（修改前）
```
.hero-carousel { z-index: 2 }      ← 图片层（过高）
.hero-content { z-index: 1 }       ← 文字层（过低，被图片覆盖）
.hero-cta { z-index: 2 }          ← 按钮层（与图片同级，无法确保可点击）
.hero-carousel-dots { z-index: 5 } ← 指示点（正确）
```

### Requirement: Hero 区域 CSS（修改后）
```
/* z-index: 0 — 装饰背景 */
.hero-decoration { z-index: 0 }
.hero::before, .hero::after { z-index: 0 }

/* z-index: 2 — 轮播图片 */
.hero-carousel { z-index: 2 }
.hero-slide-img { z-index: 2 }

/* z-index: 3 — 文字内容（在图片之上） */
.hero-content { z-index: 3 }

/* z-index: 4 — CTA 按钮 */
.hero-cta { z-index: 4 }

/* z-index: 5 — 轮播指示点 */
.hero-carousel-dots { z-index: 5 }
```

## REMOVED Requirements
无。
