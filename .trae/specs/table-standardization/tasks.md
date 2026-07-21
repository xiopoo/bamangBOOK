# 表格格式全面标准化处理 - Implementation Plan

## 任务依赖关系
- Task 1（全面扫描）→ Task 2-4 的基础
- Task 2-4（内容修复）→ 可并行执行
- Task 5（样式统一）→ 可与内容修复并行
- Task 6-7（验证和清理）→ 依赖前面所有任务

---

## [ ] Task 1: 全面扫描所有内容文件中的表格问题
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 扫描所有内容分类：partnership（24）、letters（60）、articles（99）、interviews（31）、qa（40）、talks（17）
  - 编写扫描脚本或手动检查每个 Markdown 文件中的表格
  - 识别问题类型：重复表头、列数不匹配、尾部空列、单元格合并错误
  - 输出完整问题清单到 `.trae/specs/table-standardization/scan-report.md`
  - 包含：文件路径、表格位置、问题类型、严重度
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: 所有内容分类均已扫描
  - `programmatic` TR-1.2: 问题清单包含文件、位置、类型

## [ ] Task 2: 修复合伙人信剩余表格问题
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - 依据扫描报告，修复 partnership 目录下所有表格语法问题
  - 重点文件（已知可能有问题）：
    - partnership_1961-annual（5 个表格）
    - partnership_1962-annual（1 个表格）
    - partnership_1964-annual（1 个表格）
    - partnership_1967-annual（1 个表格）
    - partnership_1964-interim（尾部空列）
    - partnership_1966-interim（尾部空列）
    - partnership_1967-interim（尾部空列）
    - partnership_1968-interim（尾部空列）
  - 修复类型：删除重复表头、统一列数、清理尾部空列
  - 每修复一个文件后核对数据完整性
- **Acceptance Criteria Addressed**: AC-1, AC-4
- **Test Requirements**:
  - `programmatic` TR-2.1: 每个表格表头行数=1，所有行列数一致
  - `human-judgement` TR-2.2: 抽样核对 3 个表格的数据完整性

## [ ] Task 3: 修复股东信表格问题
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - 依据扫描报告，修复 letters 目录下所有表格语法问题
  - 已知 berkshire_1983 和 berkshire_1994 已修复，确认是否还有其他问题
  - 检查是否有其他年份的股东信包含表格且有格式问题
- **Acceptance Criteria Addressed**: AC-1, AC-4
- **Test Requirements**:
  - `programmatic` TR-3.1: 所有股东信表格语法正确
  - `human-judgement` TR-3.2: 抽样核对数据完整性

## [ ] Task 4: 修复其他分类表格问题
- **Priority**: medium
- **Depends On**: Task 1
- **Description**:
  - 修复 articles、interviews、qa、talks 中发现的表格问题
  - 如果问题数量少，一并修复；如果量大，记录下来作为后续任务
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgement` TR-4.1: 发现的问题已修复或记录

## [ ] Task 5: 表格样式统一与优化
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 统一样式来源：将 MarkdownContent 组件中的表格样式作为主样式源
  - 清理 globals.css 中冲突或重复的 `.prose table` 相关 CSS
  - 样式升级：
    - 水平居中对齐（text-center）
    - 四边完整边框（border on all sides）
    - 表头背景色与书房风格一致（bg-bg-card）
    - 斑马纹（even:bg-bg-card/50 或类似）
    - 悬停高亮
    - 圆角表格容器 + 轻微阴影
    - 暗色模式完整适配
  - 响应式优化：
    - 移动端缩小内边距和字号
    - 确保横向滚动流畅
- **Acceptance Criteria Addressed**: AC-2, AC-3, AC-4, AC-5
- **Test Requirements**:
  - `human-judgement` TR-5.1: 桌面端样式达标（边框、对齐、斑马纹、表头）
  - `human-judgement` TR-5.2: 暗色模式样式协调，对比度足够
  - `human-judgement` TR-5.3: 移动端横向滚动正常，数据可读
  - `human-judgement` TR-5.4: globals.css 中无冲突的表格 CSS

## [ ] Task 6: 多设备浏览器验证
- **Priority**: high
- **Depends On**: Task 2, Task 3, Task 5
- **Description**:
  - 启动开发服务器
  - 验证重点页面的表格显示：
    - /partnership/1961-annual（表格最多）
    - /partnership/1962-annual
    - /partnership/1963-interim
    - /letters/1983
    - /letters/1994
  - 验证维度：
    - 桌面端 Chrome（1440×900）
    - 桌面端 Firefox
    - 桌面端 Edge
    - 移动端模拟（375×812）Chrome DevTools
    - 暗色模式切换
  - 记录验证结果，截图保存（如可行）
  - 输出验证报告到 `.trae/specs/table-standardization/verification-report.md`
- **Acceptance Criteria Addressed**: AC-2, AC-3, AC-4
- **Test Requirements**:
  - `human-judgement` TR-6.1: 桌面端 Chrome 通过
  - `human-judgement` TR-6.2: 暗色模式通过
  - `human-judgement` TR-6.3: 移动端通过
  - `human-judgement` TR-6.4: 未修改的页面无回归问题

## [ ] Task 7: 冗余代码清理与最终检查
- **Priority**: medium
- **Depends On**: Task 5, Task 6
- **Description**:
  - 检查 MarkdownContent 组件：删除调试代码、注释掉的代码
  - 检查 globals.css：删除无效的、冲突的表格 CSS 规则
  - 检查是否有其他与表格相关的死代码
  - 运行 TypeScript 类型检查和 lint 确保无错误
  - 最终代码审查
- **Acceptance Criteria Addressed**: AC-5, AC-6
- **Test Requirements**:
  - `programmatic` TR-7.1: TypeScript 0 错误
  - `programmatic` TR-7.2: ESLint 0 错误
  - `human-judgement` TR-7.3: 无调试代码、无注释掉的代码块
