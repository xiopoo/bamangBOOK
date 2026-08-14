# 全量 Markdown 编目与本人原始文献鉴别报告

- 生成时间：2026-08-10T15:41:50.794Z
- 扫描根目录：`/Users/lucas/Documents/bamangB/bamangBOOK`
- 扫描文件：8,112 个 Markdown 文件
- 输出目录：`editorial/shared/source-catalog`（该目录自身不参与扫描，以保证重复运行时数量稳定）
- 本报告只做文献鉴别和候选分层，不生成、不改写任何巴菲特或芒格正文。

## 一、扫描口径结论

旧编目把临时目录、编辑成品、工具说明与原始资料混在同一个数字中，也会受搜索工具是否遵守 `.gitignore` 影响。本次改为直接遍历文件系统，并明确排除依赖、缓存、Git 元数据及本报告自身的输出目录。

### 工作区区域统计

```json
{
  "source-corpus": 7124,
  "editorial-or-output": 366,
  "temporary": 324,
  "workspace-infrastructure": 294,
  "project-documentation": 3,
  "workspace-other": 1
}
```

### 主要目录统计

```json
{
  "content/duanyongping": 2865,
  "content/bloggers": 2638,
  "content/buffettfaq_cnbc": 651,
  "tmp": 324,
  "editorial": 289,
  ".trae": 288,
  "content/models": 232,
  "content/munger-archive": 112,
  "content/companies": 98,
  "content/articles": 72,
  "content/qa": 70,
  "content/concepts": 67,
  "recovery_archive": 65,
  "content/letters": 61,
  "content/interviews": 40,
  "content/partnership": 37,
  "poor-charlies-almanack": 32,
  "content/business-history": 29,
  "content/buffett-quotes": 25,
  "content/talks": 25,
  "content/buffettfaq": 18,
  "content/munger-originals": 13,
  "content/people": 13,
  "output": 7,
  ".codebuddy": 6,
  "content/poor-charlies-almanack": 6,
  "reports": 5,
  "content/books": 4,
  "content/columns": 4,
  "content/li-lu": 4,
  "content/special": 3,
  "docs": 3,
  "content/wechat": 2,
  "(root)": 1,
  "content/bamang-README.md": 1,
  "content/CONTENT_SCHEMA.md": 1,
  "content/yearly-events.md": 1
}
```

## 二、本人文献鉴别结果

- 可直接进入“全文/完整问答候选”层：170 个。
- 包含英文对照底本、需逐篇核源材料及嵌入式转载在内的全部候选：425 个。
- 需要人工或逐文件进一步复核：174 个。
- 精确或规范化重复组：166 组。
- 已识别的同一作品/场次版本族：17 组。
- 候选材料中含时间矛盾、待核来源或明确缺段警告：40 个。

### 处理决定统计

```json
{
  "exclude-unrelated-or-secondary": 5590,
  "exclude-generated-or-editorial": 690,
  "reference-only": 547,
  "reference-only-no-primary-text": 542,
  "exclude-non-source": 298,
  "candidate-primary-review": 153,
  "candidate-include-full": 104,
  "candidate-source-version": 82,
  "candidate-include-selection": 66,
  "reference-only-source-locator": 19,
  "review-embedded-primary-text": 14,
  "requires-source-review": 6,
  "exclude-or-review": 1
}
```

### 候选人物归属

```json
{
  "buffett": 230,
  "munger": 111,
  "both": 81,
  "none": 3
}
```

### 候选文献类型

```json
{
  "berkshire-annual-meeting-session": 61,
  "shareholder-letter": 61,
  "article-candidate": 46,
  "berkshire-annual-meeting-qa": 43,
  "interview": 39,
  "partnership-letter": 36,
  "wesco-annual-meeting-qa": 25,
  "munger-speech-or-interview": 24,
  "speech-or-talk": 24,
  "wesco-letter": 13,
  "daily-journal-meeting-record": 11,
  "speech-original-language": 11,
  "speech-translation": 11,
  "other": 9,
  "subject-reference": 5,
  "berkshire-meeting-record": 2,
  "book-derived-section": 1,
  "partnership-agreement": 1,
  "qa-record": 1,
  "video-clip-or-transcript": 1
}
```

### 需要优先处理的文献警告

- `content/letters/berkshire_1990-巴菲特致股东信.md`：translator-source-language-footnote-not-original-body
- `content/letters/berkshire_2000-巴菲特致股东信.md`：leading-layout-note-needs-editorial-separation
- `content/letters/berkshire_2001-巴菲特致股东信.md`：leading-layout-note-needs-editorial-separation
- `content/letters/berkshire_2002-巴菲特致股东信.md`：leading-layout-note-needs-editorial-separation
- `content/letters/berkshire_2003-巴菲特致股东信.md`：leading-layout-note-needs-editorial-separation
- `content/letters/berkshire_2004-巴菲特致股东信.md`：leading-layout-note-needs-editorial-separation
- `content/letters/berkshire_2006-巴菲特致股东信.md`：leading-layout-note-needs-editorial-separation
- `content/letters/berkshire_2007-巴菲特致股东信.md`：leading-layout-note-needs-editorial-separation
- `content/letters/berkshire_2016-巴菲特致股东信.md`：translator-explanatory-footnotes-not-original-body
- `content/letters/berkshire_2025-巴菲特致股东信.md`：2025-thanksgiving-letter-not-annual-report-letter；official-press-release-wrapper-not-buffett-letter-body
- `content/munger-archive/recordings/2018-08 红周刊专访查理芒格.md`：source-verification-pending
- `content/qa/2020.05 伯克希尔股东大会文字记录.md`：source-verification-pending
- `content/qa/伯克希尔股东大会实录_1994.md`：explicit-omission-or-missing-text
- `content/qa/伯克希尔股东大会实录_1995.md`：explicit-omission-or-missing-text
- `content/qa/伯克希尔股东大会实录_1996.md`：explicit-omission-or-missing-text
- `content/qa/伯克希尔股东大会实录_1997.md`：explicit-omission-or-missing-text
- `content/qa/伯克希尔股东大会实录_1998.md`：explicit-omission-or-missing-text
- `content/qa/伯克希尔股东大会实录_1999.md`：explicit-omission-or-missing-text
- `content/qa/伯克希尔股东大会实录_2003.md`：explicit-omission-or-missing-text
- `content/qa/伯克希尔股东大会实录_2004.md`：explicit-omission-or-missing-text
- `content/qa/伯克希尔股东大会实录_2005.md`：explicit-omission-or-missing-text
- `content/qa/伯克希尔股东大会实录_2006.md`：explicit-omission-or-missing-text
- `content/qa/伯克希尔股东大会实录_2007.md`：explicit-omission-or-missing-text
- `content/qa/伯克希尔股东大会实录_2008.md`：explicit-omission-or-missing-text
- `content/qa/伯克希尔股东大会实录_2009.md`：explicit-omission-or-missing-text
- `content/qa/伯克希尔股东大会实录_2010.md`：explicit-omission-or-missing-text
- `content/qa/伯克希尔股东大会实录_2011.md`：explicit-omission-or-missing-text
- `content/qa/伯克希尔股东大会实录_2012.md`：explicit-omission-or-missing-text
- `content/qa/伯克希尔股东大会实录_2013.md`：explicit-omission-or-missing-text
- `content/qa/伯克希尔股东大会实录_2014.md`：explicit-omission-or-missing-text
- `content/qa/伯克希尔股东大会实录_2015.md`：explicit-omission-or-missing-text
- `content/qa/伯克希尔股东大会实录_2024.md`：munger-speech-after-2023-check-historical-or-misdated
- `content/qa/伯克希尔股东大会实录_2025.md`：munger-speech-after-2023-check-historical-or-misdated
- `content/talks/1999.12 巴菲特在太阳谷的演讲.md`：source-verification-pending
- `content/talks/2013.11 巴菲特在马里兰大学的演讲.md`：source-verification-pending
- `content/talks/2018.02 北京大学光华管理学院.md`：source-verification-pending
- `content/talks/芒格：DJ_年会_2013.md`：explicit-omission-or-missing-text
- `poor-charlies-almanack/_english-source/poor-charlies-almanack-talk-eleven.md`：local-source-is-summary-or-incomplete-capture
- `poor-charlies-almanack/_english-source/poor-charlies-almanack-talk-five.md`：local-source-is-summary-or-incomplete-capture
- `poor-charlies-almanack/_english-source/poor-charlies-almanack-talk-nine.md`：local-source-is-summary-or-incomplete-capture

## 三、关键处理规则

- 巴菲特合伙人信、伯克希尔股东信和芒格/西科信件优先列为署名文献候选。
- 演讲、访谈和股东大会按独立场次处理；完整会议与单段视频不能按同一层级计数。
- CNBC 只有标题、简介或视频元数据的页面仅作定位参考，不算一篇本人文献。
- `buffettfaq` 的主题拼合问答只作来源定位；正式成书优先回到完整会议或完整问答底本。
- 语录卡、概念卡、公司卡、书籍摘要、旧编辑稿和 AI 合成稿不进入本人文集正文。
- 《穷查理宝典》中的演讲与书籍编者文字分开处理；演讲中文本须与英文对照底本建立版本关系。
- 非核心目录中若检测到连续的本人说话标记，进入“嵌入式原文复核队列”，避免漏掉完整转载。

## 四、当前限制

- 自动规则只能建立高置信候选和复核队列，不能替代对署名、来源、译本和完整度的逐篇判断。
- `candidate-include-full` 表示“全文收录候选”，不是已批准进入终稿。
- `candidate-source-version` 主要是英文原文、另一译本或局部视频转录，应先与中文主底本建立版本关系。
- 任何来源不明、文本残缺或只有二次概括的材料，在核验完成前都不能进入主书。

## 五、配套文件

- `markdown-inventory.csv/json`：全量文件级编目与去向。
- `primary-document-candidates.csv/json`：本人原始文献候选及对照底本。
- `review-queue.csv`：需要进一步核验的材料。
- `duplicate-groups.json`：精确与规范化重复组。
- `work-version-families.json`：同一作品或同一场次的中文、英文、完整场次与选录版本关系。

## 六、下一步

先从高确定性的四组材料开始建立正式文献表：巴菲特合伙人信、伯克希尔股东信、芒格演讲、两家公司股东大会记录。逐篇确认标题、日期、场合、完整度、中文底本、英文对照和重复版本，再处理文章、访谈与嵌入式转载。

