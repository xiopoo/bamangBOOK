# 巴芒书房内容规范

本规范用于新增和逐步治理内容。旧资料不要求一次性迁移；每次编辑旧文件时补齐可确认字段，不猜测来源或作者。

## 建议元数据

```yaml
---
title: 内容标题
content_type: letter | partnership | article | qa | talk | interview | concept | company | person
source_title: 原始资料标题
source_url: https://...
author: 作者或发言人
translator: 翻译者，未知则留空
editor: 整理者
published_at: YYYY-MM-DD
updated_at: YYYY-MM-DD
language: zh-CN
verification: verified | partial | pending
copyright_note: 版权与转载说明
topics:
  - 主题
entities:
  - 相关人物、公司或概念
---
```

## 状态定义

- `verified`：标题、来源、时间及关键引文均已对照原始发布资料。
- `partial`：正文可阅读，但部分翻译、段落或引用尚未逐项核对。
- `pending`：来源或文本质量尚待核验，不应作为确定性引文使用。

## 发布检查

1. 标题与正文第一标题一致，不保留重复标题。
2. 原文、翻译、编辑补充和本站归纳应能区分。
3. 引语注明人物和年份；可确认时补充原始链接。
4. 公司数字注明统计口径与对应年份。
5. 不把历史观点改写成当前投资建议。
6. 内部链接必须指向真实存在的页面。
7. 更新后填写 `updated_at` 和 `verification`。

## 文件命名

- 文件名保持稳定，避免无必要改名导致外部链接失效。
- 年份资料使用四位年份。
- 专题文章可保留分类目录；索引程序必须递归读取目录。
- 同名实体通过元数据或明确后缀消歧，不使用模糊占位页。
