# 标准化信件替换 - 任务列表

- [ ] Task 1: 用户上传文件
  - **Priority**: high
  - **Depends On**: None
  - **Description**:
    - 用户将整理好的标准化信件文件放入以下目录：
      - 股东信 → `upload/letters/`
      - 合伙人信 → `upload/partnership/`
    - 文件名可自由命名，系统通过文件内容中的年份自动匹配
    - **此任务需用户手动完成，完成后通知我继续**
  - **Action Required**: 用户需执行此步骤

- [ ] Task 2: 文件检测与映射
  - **Priority**: high
  - **Depends On**: Task 1
  - **Description**:
    - 读取 `upload/letters/` 和 `upload/partnership/` 目录中的文件列表
    - 对每个文件，识别对应的年份和类型（annual/interim/liquidation/bond）
    - 建立上传文件 → 目标文件名的映射表
    - 输出映射表供用户确认
  - **Acceptance Criteria**: 所有上传文件都有对应的目标文件名

- [ ] Task 3: 执行文件替换
  - **Priority**: high
  - **Depends On**: Task 2
  - **Description**:
    - 可选：将旧文件备份到 `.trae/backups/replace-letters/`
    - 将上传文件复制到 `content/letters/` 和 `content/partnership/` 覆盖旧文件
    - 统一文件名格式：
      - 合伙人信：`partnership_{year}-{type}-巴菲特致合伙人信.md`
      - 股东信：`berkshire_{year}-巴菲特致股东信.md`
    - 删除 `upload/` 目录中的源文件（清理）
  - **Acceptance Criteria**: 所有新旧文件完成替换

- [ ] Task 4: 格式清洗与标准化
  - **Priority**: medium
  - **Depends On**: Task 3
  - **Description**:
    - 对替换后的所有文件执行格式检查：
      - 确保首行以 `# ` 开头作为 H1 标题
      - 确保文件 UTF-8 编码无 BOM
      - 检查信件结尾是否符合 letter-ending-cleanup 标准
    - 如有不符合标准的文件，进行编辑修复
  - **Sub Tasks**:
    - 4.1: 检查标题格式
    - 4.2: 检查编码
    - 4.3: 检查信件结尾
  - **Acceptance Criteria**: 所有替换文件格式一致

- [ ] Task 5: 索引 wordCount 更新
  - **Priority**: medium
  - **Depends On**: Task 3
  - **Description**:
    - 对每个替换后的文件重新计算 wordCount（中文字数）
    - 用新 wordCount 更新 `content/letters-index.json` 和 `content/partnership-index.json`
    - 注意：只更新 wordCount 字段，保留 title、year、fileName、person 等字段不变
  - **Acceptance Criteria**: 索引文件中 wordCount 与文件实际字数一致

- [ ] Task 6: 构建验证
  - **Priority**: high
  - **Depends On**: Task 4, Task 5
  - **Description**:
    - 执行 `rm -rf .next && npm run build`
    - 确认构建无错误（exit code 0）
    - 启动预览，抽样检查信件详情页：
      - 合伙人信：1957 年（检查段落和表格）、1961 年（mid-year + annual 两封）
      - 股东信：1965 年（首年）、2024 年（最新）
  - **Acceptance Criteria**: 构建通过，页面正常渲染

# Task Dependencies
- Task 1（用户手动）→ Task 2 → Task 3 → Task 4 → Task 6
- Task 5 可并行于 Task 4
