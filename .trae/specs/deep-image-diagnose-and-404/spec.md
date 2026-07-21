# 网站图片深度诊断 + 404 重定向配置 Spec

## Why
上一轮代码级排查（investigate-image-display-issues）确认了代码逻辑正确、URL 可达、路径文件名无错误。但图片仍有显示问题，需进行更深度的浏览器端诊断和服务器配置检查。

## 前期结论（已知）
- 所有 Unsplash URL 返回 HTTP 200
- 所有本地图片文件存在且路径正确
- 代码逻辑无结构性错误（已修复 2 处小缺陷）
- **浏览器验证未完成** — 这是本轮重点

## What Changes
- 从浏览器端验证图片实际加载请求
- 检查服务器 MIME 类型 / 权限 / 安全策略
- 检查文件格式兼容性和文件完整性
- 配置 404 页面重定向机制（Vercel）
- 提供完整的错误汇总报告

## Impact
- Affected code: Vercel 配置（vercel.json）、可能涉及 image-urls.js 和 HTML 调整
- Affected specs: investigate-image-display-issues（补充验证）

## ADDED Requirements

### Requirement 1: 文件格式与完整性检查
- **WHEN** 验证所有图片文件
- **THEN** 确认格式（JPG/PNG/WebP）被主流浏览器支持
- **AND** 检查文件头部魔数（magic bytes）确认非损坏文件

#### Scenario: 文件损坏
- **WHEN** 文件头部非正确格式标识
- **THEN** 标记为损坏并提供替换方案

### Requirement 2: 服务器配置检查
- **WHEN** 验证 Vercel CDN 对图片文件的 MIME 类型、Cache-Control 头
- **THEN** 确认所有图片资源返回正确的 Content-Type

#### Scenario: MIME 类型错误
- **WHEN** 服务器返回错误的 Content-Type
- **THEN** 在 vercel.json 中添加 headers 修正

### Requirement 3: 浏览器网络请求分析
- **WHEN** 使用浏览器 DevTools 加载各页面
- **THEN** 记录所有图片请求的 URL、状态码、耗时、大小
- **AND** 标记状态码非 200 的请求

#### Scenario: 跨域限制
- **WHEN** Unsplash 图片因 CORS 策略被浏览器阻止
- **THEN** 确认问题并切换图源或配置代理

### Requirement 4: 404 重定向机制
- **WHEN** 用户访问不存在的路径（含无效图片路径、不存在页面）
- **THEN** 服务器返回 404.html 内容且 HTTP 状态码为 404

#### Scenario: Vercel 配置
- **WHEN** 访问 `/nonexistent.jpg` 或 `/wrong-page`
- **THEN** Vercel 通过 vercel.json 的 rewrites/redirects 指向 404.html

## MODIFIED Requirements

### Requirement: vercel.json 更新
**修改前**：仅有 Cache-Control headers 和 outputDirectory
**修改后**：添加 404 fallback 配置

## REMOVED Requirements
无