# 文件库全面清理 - 任务列表

- [x] Task 1: 备份所有待删除文件
  - **Priority**: high
  - **Depends On**: None
  - **Description**:
    - 创建备份目录 `.trae/backups/file-library-cleanup/`
    - 递归复制所有待删除文件和目录到备份目录（保持目录结构）
    - 待删除内容：
      - 目录：`.next/`、`audit-reports/`、`crawl/`、`crawl_full/`、`data/`、`scripts/`、`content/pdf-documents/`
      - 文件：`content/pdf-analysis.txt`、`content/pdf-full.txt`、`content/temp_full_text.txt`、`content/1957-1970.pdf`、`content/yearly-events.bak.md`、`content/ima-classified.json`、`content/ima-list.json`、`content/my-kb-content.json`、`content/buffett-kb-list.json`
      - 根目录脚本/报告：`*.js`、`*.py`（一次性处理工具）、`scan_report.txt`、`scan_result*.json`、`build.log`、`dev.err.log`、`dev.log`、`cross-links-report.json`、`IMA_SYNC_REPORT.md`、`SCAN_REPORT.md`、`preview-home.png`
      - 独立构建：`.next/standalone/`
  - **Acceptance Criteria Addressed**: AC-文件备份
  - **Test Requirements**:
    - `programmatic` TR-1.1: 备份目录已创建且非空
    - `programmatic` TR-1.2: 备份文件数量与待删除文件一致

- [x] Task 2: 执行文件删除
  - **Priority**: high
  - **Depends On**: Task 1
  - **Description**:
    - 确认备份完成后，使用 `rm -rf` 删除所有标记的文件和目录
    - 删除顺序：先文件，后目录
    - 特别注意保留 `src/`、`content/`、`公众号HTML输出/`、`.trae/` 及所有配置文件
    - 运行后使用 `ls` 确认文件已被删除
  - **Acceptance Criteria Addressed**: AC-删除
  - **Test Requirements**:
    - `programmatic` TR-2.1: `.next/` 目录已删除
    - `programmatic` TR-2.2: `audit-reports/` 目录已删除
    - `programmatic` TR-2.3: `crawl/`、`crawl_full/` 目录已删除
    - `programmatic` TR-2.4: `scripts/` 目录已删除
    - `programmatic` TR-2.5: 所有标记的临时文件已删除
    - `programmatic` TR-2.6: 所有标记的根目录脚本和报告已删除

- [ ] Task 3: 清理后验证
  - **Priority**: high
  - **Depends On**: Task 2
  - **Description**:
    - 验证保留目录完整无损（`ls` 检查 `src/`、`content/`、`公众号HTML输出/`）
    - 运行 `npm install` 重新安装依赖（因 `node_modules` 保留但 `.next/` 已删除）
    - 运行 `npm run build` 确保构建通过
    - 启动 `npm run dev` 确保开发服务器正常
  - **Acceptance Criteria Addressed**: AC-验证
  - **Test Requirements**:
    - `programmatic` TR-3.1: `npm run build` 成功（exit code 0）
    - `programmatic` TR-3.2: `npm run dev` 正常启动
    - `programmatic` TR-3.3: `src/`、`content/` 目录完整无损
    - `programmatic` TR-3.4: `公众号HTML输出/` 目录完整无损

# Task Dependencies
- Task 1 无依赖
- Task 2 依赖 Task 1
- Task 3 依赖 Task 2
