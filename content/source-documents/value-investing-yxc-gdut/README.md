# value-investing source import

Source repository: https://github.com/yxc-gdut/value-investing

Fetched commit: `953e06b0880063cc82bda890213fff34960b13f4`

Fetched on: 2026-08-12

## Import Scope

This directory keeps only the upstream source-like materials that appear to fill local gaps. It intentionally does not import upstream `knowledge/`, `chunks/`, or scripts, because those are derived notes or processing utilities rather than primary reading materials.

Imported directories:

| Directory | Files | Notes |
| --- | ---: | --- |
| `duanyongping/` | 132 | Duan Yongping PDFs, monthly Xueqiu posts, research notes, and Duan-specific speeches/interviews. |

## Local Comparison Notes

- The local repo already has substantial Buffett and Munger material, including official Berkshire shareholder letter HTML/PDFs, partnership-letter collation packets, Poor Charlie's Almanack source captures, and a large `content/duanyongping/` collection.
- The upstream Berkshire letters, annual reports, Buffett articles, and general Buffett/Munger speeches overlap heavily with local source holdings. Those directories were removed from this import after review, even though their exact file hashes differ.
- The clearest local gaps kept here are:
  - `duanyongping/xueqiu-posts/`: 119 monthly `@大道无形我有型` Xueqiu post files from 2011-03 through 2026-04.
  - `duanyongping/段永平投资问答录（投资逻辑篇）.pdf` and `duanyongping/段永平投资问答录（商业逻辑篇）.pdf`.
  - `duanyongping/references/research/`: six compact research notes on writings, conversations, expression style, external views, decisions, and timeline.
  - `duanyongping/speeches/`: four Duan-specific speech/interview text files from the upstream speeches collection.

`MANIFEST.csv` lists every imported file with byte size and SHA-256.
