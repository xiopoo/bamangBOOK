# 网站结构与内容优化 Spec

## Why
当前网站存在布局结构单一（顶部导航）、首页包含不适配内容（"V1.33"版本标识、"帮比快跑"）、视觉风格缺乏统一文化主题、信件页面排版不佳等问题，需要进行系统性优化以提升用户体验和品牌调性。

## What Changes
- **重构** 页面布局：将顶部导航改为左侧目录+右侧内容的双栏结构，支持多级导航、展开折叠、目录联动定位
- **修改** 首页内容：移除"V1.33"和"帮比快跑"相关内容，添加"BY金融街小胖"超链接
- **改造** 整体风格：以"复利书房"为主题，橙色+米色色系，宋体/serif字体，添加装饰元素
- **新增** Logo设计：简洁大方的书房主题Logo
- **优化** 信件页面排版：改善股东信和合伙企业信的布局和排版

## Impact
- Affected specs: init-fuli-study-framework, visual-display-fix
- Affected code:
  - `src/app/layout.tsx` - 全局布局改为双栏结构
  - `src/app/page.tsx` - 首页内容修改
  - `src/components/Navigation.tsx` - 导航栏改为左侧边栏
  - `src/components/Sidebar.tsx` - 侧边栏组件（新增或改造）
  - `src/app/globals.css` - 全局样式和主题色
  - `tailwind.config.js` - 主题配置
  - `src/app/letters/[year]/page.tsx` - 股东信详情页排版
  - `src/app/partnership/[name]/page.tsx` - 合伙企业信详情页排版

## ADDED Requirements

### Requirement: 双栏布局重构
系统 SHALL 提供左侧目录、右侧内容的双栏布局，取代现有顶部导航。

#### Scenario: 桌面端双栏显示
- **WHEN** 用户在桌面端（>=768px）访问
- **THEN** 左侧显示固定目录，右侧显示内容区域，两者可独立滚动

#### Scenario: 左侧目录多级导航
- **WHEN** 用户查看左侧目录
- **THEN** 目录展示层级结构，支持点击展开/折叠子菜单，当前页面/章节高亮

#### Scenario: 目录与内容联动定位
- **WHEN** 用户点击左侧目录项
- **THEN** 右侧内容自动滚动至对应位置，目录中对应项高亮

#### Scenario: 移动端单栏布局
- **WHEN** 用户在移动端（<768px）访问
- **THEN** 目录折叠为汉堡菜单或顶部导航，点击后展开覆盖层，选择后跳转并收起

### Requirement: 首页内容精准修改
首页 SHALL 移除"V1.33"和"帮比快跑"内容，添加指定超链接。

#### Scenario: 移除版本标识
- **WHEN** 用户访问首页
- **THEN** 页面任何位置不显示"V1.33"文本

#### Scenario: 移除"帮比快跑"内容
- **WHEN** 用户访问首页
- **THEN** 页面中不存在"帮比快跑"相关文字、图片或链接

#### Scenario: 添加超链接
- **WHEN** 用户访问首页
- **THEN** 在页脚或视觉平衡位置显示"BY金融街小胖"超链接，点击在新标签页打开 `https://xhslink.com/m/6OPiGk9H7w7`

### Requirement: "复利书房"主题风格
系统 SHALL 以"复利书房"为整体视觉主题进行改造。

#### Scenario: 色彩方案
- **WHEN** 用户浏览任何页面
- **THEN** 页面以橙色（主色 #C85A17 或类似暖橙）、米色（背景 #F5F0E8）、深棕（文字 #3C2415）为基调

#### Scenario: 字体选择
- **WHEN** 用户阅读正文内容
- **THEN** 正文字体优先使用宋体/Noto Serif SC/serif 类字体

#### Scenario: 装饰元素
- **WHEN** 用户查看页面
- **THEN** 页面包含适当的纹理背景、装饰性边框、分隔线等书房风格元素

#### Scenario: 统一组件风格
- **WHEN** 用户与按钮、卡片、表单等组件交互
- **THEN** 所有组件风格统一，使用圆润边框、柔和阴影，与整体主题协调

### Requirement: Logo设计
系统 SHALL 在导航/页眉区域显示"复利书房"主题Logo。

#### Scenario: Logo显示
- **WHEN** 用户访问任何页面
- **THEN** 左侧目录顶部显示Logo，包含文字"复利书房"和简洁图形元素（如书本/铜钱组合图案）

### Requirement: 信件页面排版优化
股东信和合伙企业信详情页 SHALL 优化排版结构。

#### Scenario: 标题层级
- **WHEN** 用户阅读信件
- **THEN** 标题层级清晰（h1 > h2 > h3），字号递减，使用主题色区分

#### Scenario: 段落布局
- **WHEN** 用户阅读信件正文
- **THEN** 段落间距宽松（1.8倍行高），首行缩进，两端对齐，最大宽度控制在70-80字符

#### Scenario: 重点内容突出
- **WHEN** 信件中存在引用、数据、关键观点
- **THEN** 使用引用块、背景高亮、特殊边框等方式突出显示

### Requirement: 全面测试
全部修改完成后 SHALL 进行系统性测试。

#### Scenario: 功能测试
- **WHEN** 测试人员检查所有页面和交互
- **THEN** 所有导航跳转正常，链接可打开，表单可提交

#### Scenario: 兼容性测试
- **WHEN** 测试人员在不同浏览器（Chrome/Firefox/Edge/Safari）和设备（桌面/平板/手机）上访问
- **THEN** 页面正常渲染，无布局错乱

#### Scenario: 视觉一致性检查
- **WHEN** 测试人员逐页浏览
- **THEN** 所有页面保持统一的主题风格，色彩、字体、间距一致

## MODIFIED Requirements
### Requirement: 全局布局
全局布局 SHALL 从顶部导航栏+内容区的单栏结构改为左侧边栏+右侧内容的双栏结构。

## REMOVED Requirements
### Requirement: 首页版本标识
**Reason**: "V1.33"版本标识不再需要显示
**Migration**: 直接删除相关元素

### Requirement: 首页"帮比快跑"内容
**Reason**: 该内容与网站主题不符
**Migration**: 直接删除相关文字、图片和链接
