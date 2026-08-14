# 全量 Markdown 编目报告

- 生成时间：2026-08-10T08:17:02.931Z
- 扫描根目录：`/Users/lucas/Documents/bamangB/bamangBOOK`
- Markdown 文件：8019
- 精确/规范化重复组：88

## 人物归属统计

```json
{
  "both": 1655,
  "buffett": 1896,
  "candidate": 4069,
  "munger": 399
}
```

## 来源类型统计

```json
{
  "article": 6005,
  "company-case": 99,
  "concept": 67,
  "editorial-asset": 202,
  "faq": 669,
  "generated-output": 2,
  "interview": 40,
  "other": 658,
  "partnership-letter": 39,
  "quote-card": 52,
  "recovery-reference": 65,
  "shareholder-letter": 61,
  "talk": 60
}
```

## 版本状态统计

```json
{
  "backup-or-archive": 181,
  "editorial-canonical-or-locked": 8,
  "editorial-working-or-reference": 190,
  "generated-output": 2,
  "source-current": 7638
}
```

## 处理去向统计

```json
{
  "candidate-review": 3887,
  "editorial-reference-or-final": 202,
  "exclude-from-book-scan": 658,
  "generated-output": 2,
  "reference-only": 65,
  "source-candidate": 3205
}
```

## 处理规则

- `content/` 是原始资料候选层；`editorial/`、`recovery_archive/` 和 `output/` 不作为原始证据直接扩写正文。
- 精确重复按 SHA-256 归组；规范化重复按去 frontmatter、锚点和空白后的指纹归组。
- `candidate` 不等于自动纳入，仍需在材料去向表中人工复核。
- 原始资料未被写入；本报告及清单均写入 `editorial/shared/audit/`。

