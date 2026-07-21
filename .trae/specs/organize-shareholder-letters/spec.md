# 股东信与合伙人信系统整理 Spec

## Why
当前网站存在以下问题：
1. 股东信和合伙人信文件存在重复年份
2. 文档年份排序不统一
3. 文本内容缺乏规范化排版
4. 知识图谱实体关系需要完善

## What Changes

### 文件整理
- 整理 `content/letters/` 目录下的股东信
- 整理 `content/partnership/` 目录下的合伙人信
- 删除重复年份文件
- 按年份升序或降序排列
- 每个年份仅保留一份完整且权威的文档

### 排版规范化
- 统一文本段落结构
- 统一行间距、字号
- 实现两端对齐
- 提升可读性

### 知识图谱完善
- 提取关键实体（人物、公司、概念）
- 识别实体间关系
- 建立结构化知识网络

## Impact
- Affected directories:
  - `content/letters/` - 股东信目录
  - `content/partnership/` - 合伙人信目录
- Affected code:
  - `scripts/organize-files.js` - 文件整理脚本
  - `scripts/format-content.js` - 排版格式化脚本
  - `scripts/generate-index.js` - 知识图谱索引脚本
  - `content/index.json` - 知识图谱数据

## ADDED Requirements

### Requirement: 文件去重
系统 SHALL 自动识别并删除重复年份的文件，保留最完整版本。

### Requirement: 文件排序
系统 SHALL 按年份升序或降序排列文件，确保浏览体验一致。

### Requirement: 排版规范化
系统 SHALL 统一股东信文本格式，包括段落结构、行间距、字号。

### Requirement: 知识图谱完善
系统 SHALL 提取关键实体并建立关系网络。

## 技术规范
- 数据来源：IMA 知识库 API
- 文件格式：Markdown (.md)
- 排序规则：默认升序（1956→2024）
