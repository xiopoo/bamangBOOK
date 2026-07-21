# 全站配图排版系统修复 Spec

## Why

首页核心服务板块配图存在右侧留白，专栏精选与企业新闻板块完全缺少真实配图（仅使用 CSS 渐变占位），导致页面视觉层次单一、专业感不足。需要系统性修复配图渲染与布局问题，确保所有板块配图显示正确、风格统一。

## Root Cause Analysis

### 问题 1：核心服务配图右侧留白

**根因**：全局 `img{max-width:100%}`（index.html 第 13 行）限制了图片宽度不能超过其包含块的内容区宽度。`.service-card-img` 虽然设置了 `width: calc(100% + 48px)` 意图扩展到 padding 区域，但 `max-width: 100%` 优先级更高，将实际宽度限制在内容区宽度。配合 `margin: 0 -24px` 左移后，右侧产生 24px 的空白间隙。

### 问题 2：成功案例配图无重复

首页 3 个案例对应 3 张独立配图（case-1/2/3.jpg），无重复。cases-detail.html 中 6 个案例循环使用 3 张图，属于设计预期，不在本次修复范围。

### 问题 3：专栏精选无配图

首页专栏精选 3 篇和 column.html 所有文章均使用纯 CSS 渐变背景，无 `<img>` 标签。

### 问题 4：企业新闻无配图

news.html 使用 emoji 图标 + CSS 渐变背景，无真实图片。

## What Changes

### 1. 核心服务：修复右侧留白

* `.service-card-img` 增加 `max-width: none` 解除宽度限制

* 保持 `object-fit: cover` 确保图片比例不失真

* 已验证：`.service-card-img` 的 `object-fit: cover` 特异性高于全局 `img{object-fit:contain}`，无需额外声明

### 2. 专栏精选（首页 + column.html）：添加配图

在 `image-urls-v2.js` 中新增 4 个专栏图片条目：

| Key       | 图片              | 主题映射            |
| --------- | --------------- | --------------- |
| `column1` | `service-1.jpg` | 债务重组 ← 财务数据分析场景 |
| `column2` | `case-2.jpg`    | 资产盘活 ← 制造/物流场景  |
| `column3` | `service-3.jpg` | 重组方案/谈判场景       |
| `column4` | `case-3.jpg`    | 经营诊断/纾困场景       |

* 首页 index.html：3 个专栏卡片中各插入 `<img class="article-card-img" data-column="N">`，JS 注入 src

* column.html：4 个文章卡片中各插入 `<img class="article-card-img" data-column="N">`，JS 注入 src

* column-detail.html：专题文章区插入 featured 图片

* CSS 统一：`.article-card-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;max-width:none;z-index:0}`

### 3. 企业新闻（news.html）：添加配图

在 `image-urls-v2.js` 中新增 2 个新闻图片条目：

| Key     | 图片              | 用途                 |
| ------- | --------------- | ------------------ |
| `news1` | `service-2.jpg` | 公司动态类（咨询/会议场景）     |
| `news2` | `case-1.jpg`    | 行业资讯/媒体报道（建筑/行业场景） |

* JS 轮询分配：新闻列表按 `(index % 2) + 1` 分配 news1/news2

* CSS：`.news-thumb-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;max-width:none;z-index:0}`

### 4. 样式统一

* 所有新增配图使用统一 CSS 模式：`position:absolute;inset:0;width:100%;height:100%;object-fit:cover;max-width:none`

* 图片容器已有 `overflow:hidden`，无需额外声明

* 保留现有 `.img-error` 机制：图片加载失败时自动隐藏，显示 CSS 渐变回退

## Impact

* Affected code: `index.html` (CSS + HTML), `column.html` (CSS + HTML), `news.html` (CSS + HTML), `column-detail.html` (CSS + HTML), `image-urls-v2.js` (新增条目 + 快取版本号 v3→v4)

* No breaking changes to existing image display (Hero, services.html, about.html, cases-detail.html)

## ADDED Requirements

### Requirement: 核心服务配图 100% 填充

系统 SHALL 确保 `.service-card-img` 宽度不受全局 `max-width:100%` 限制，完整填充至卡片左右边缘。

#### Scenario: 服务卡片渲染

* **WHEN** 页面加载完成且图片加载成功

* **THEN** 图片左右边缘与卡片左右边缘精确对齐

* **AND** 图片无右侧白色间隙

* **AND** 图片比例不失真（`object-fit:cover`）

### Requirement: 专栏精选配图

系统 SHALL 为首页和专栏页的文章卡片添加与主题相关的配图。

#### Scenario: 专栏卡片渲染

* **WHEN** 用户访问首页或专栏页

* **THEN** 每个专栏文章卡片显示对应配图

* **AND** 配图占据卡片顶部区域

* **AND** 图片加载失败时显示 CSS 渐变回退

### Requirement: 企业新闻配图

系统 SHALL 为企业新闻卡片添加配图。

#### Scenario: 新闻卡片渲染

* **WHEN** 用户访问新闻页

* **THEN** 每个新闻卡片显示配图

* **AND** 配图按类别轮询分配

* **AND** 图片加载失败时显示 CSS 渐变回退

## Images Used (全部复用现有图片，无新增图片文件)

| 文件              | 尺寸      | 新增用途      |
| --------------- | ------- | --------- |
| `service-1.jpg` | 800×534 | 专栏-债务重组   |
| `service-2.jpg` | 800×534 | 企业新闻-公司动态 |
| `service-3.jpg` | 800×534 | 专栏-重组方案   |
| `case-1.jpg`    | 800×533 | 企业新闻-行业资讯 |
| `case-2.jpg`    | 800×533 | 专栏-资产盘活   |
| `case-3.jpg`    | 800×533 | 专栏-经营诊断   |

