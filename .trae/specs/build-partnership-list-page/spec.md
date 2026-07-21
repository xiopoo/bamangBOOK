# 合伙人信列表页 Spec

## Why
当前网站已完整收录 1956-1970 年巴菲特致合伙人信（共 35 封，含同一年份多版本），但缺乏专门的浏览入口。用户只能通过直接输入 `/letters/{year}`（1956-1970）访问单一年份，无法一览合伙人时期全部信件，也分不清哪些年份存在多封信件。

## What Changes
- **新增** `/partnership` 页面，按年份分组列出 1956-1970 所有合伙人信
- **支持** 同一年份多封信件展示，显示信件副标题（如“1962年中”、“1963年11月”）
- **调整** `/letters` 股东信列表页，在页面顶部或底部添加合伙人信时期入口
- **保持** 与股东信列表页一致的橙色主题视觉风格

## Impact
- Affected specs: `replicate-target-site`（Task 8: 合伙人信列表页）
- Affected code:
  - 新增 `src/app/partnership/page.tsx`
  - 修改 `src/app/letters/page.tsx`

## ADDED Requirements

### Requirement: 合伙人信浏览入口
网站 SHALL 提供 `/partnership` 页面，系统展示 1956-1970 年所有合伙人信，并允许用户点击进入对应年份详情页。

#### Scenario: 访问合伙人信列表页
- **WHEN** 用户访问 `/partnership`
- **THEN** 页面展示按年份分组的合伙人信列表，每个年份显示该年份下的所有信件版本

#### Scenario: 多版本信件展示
- **WHEN** 某一年份存在多封信件（如 1962 年有 4 封）
- **THEN** 页面在同一组内按时间顺序列出所有版本，并显示副标题

#### Scenario: 跳转至信件详情
- **WHEN** 用户点击某一年份或某一封信件
- **THEN** 跳转至 `/letters/{year}`，由现有详情页根据年份自动加载合伙人信内容

## MODIFIED Requirements

### Requirement: 股东信列表页导航
`/letters` 页面 SHALL 增加合伙人信时期入口，帮助用户在不同信件类型之间切换。

## REMOVED Requirements
无
