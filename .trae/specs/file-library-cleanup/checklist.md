# 文件库全面清理 - 验收清单

## 备份
- [x] 备份目录 `.trae/backups/file-library-cleanup/` 已创建
- [x] 所有待删除文件已备份到备份目录
- [x] 备份文件数量与待删除文件一致

## 目录删除
- [x] `.next/` 目录已删除（含 `.next/standalone/`）
- [x] `audit-reports/` 目录已删除
- [x] `crawl/` 目录已删除
- [x] `crawl_full/` 目录已删除
- [x] `data/` 目录已删除
- [x] `scripts/` 目录已删除
- [x] `content/pdf-documents/` 目录已删除

## 文件删除
- [x] `content/pdf-analysis.txt` 已删除
- [x] `content/pdf-full.txt` 已删除
- [x] `content/temp_full_text.txt` 已删除
- [x] `content/1957-1970.pdf` 已删除
- [x] `content/yearly-events.bak.md` 已删除
- [x] `content/ima-classified.json` 已删除
- [x] `content/ima-list.json` 已删除
- [x] `content/my-kb-content.json` 已删除
- [x] `content/buffett-kb-list.json` 已删除
- [x] 根目录下所有 `.js` 脚本已删除
- [x] 根目录下所有 `.py` 脚本已删除
- [x] `scan_report.txt` 已删除
- [x] `scan_result*.json` 已删除
- [x] `build.log`、`dev.err.log`、`dev.log` 已删除
- [x] `cross-links-report.json` 已删除
- [x] `IMA_SYNC_REPORT.md` 已删除
- [x] `SCAN_REPORT.md` 已删除
- [x] `preview-home.png` 已删除

## 保留验证
- [x] `src/` 目录完整无损
- [x] `content/` 目录各子目录完整无损（articles、qa、talks、interviews、letters 等）
- [x] `公众号HTML输出/` 目录完整无损
- [x] `.trae/` 目录完整无损（specs、skills）
- [x] 项目配置文件完整（package.json、next.config.js 等）

## 构建验证
- [x] `npm run build` 构建通过（exit code 0）
- [x] `npm run dev` 启动正常
