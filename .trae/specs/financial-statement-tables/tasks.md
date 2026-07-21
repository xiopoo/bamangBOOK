# 财务报表表格化整理 - 实施计划（分解后的优先级任务列表）

## [x] Task 1: 修复「所有者收益」vs「自由现金流」损益表
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修复 `content/articles/「所有者收益」vs「自由现金流」.md` 中的 Scott Fetzer 损益表
  - 报表项目包括：
    - 收入 Revenues
    - 销售成本（历史成本、存货跌价、折旧减值）
    - 毛利 Gross Profit
    - 销售和管理费用 SG&A
    - 商誉摊销
    - 经营收益 Operating Profit
    - 其他净收益
    - 税前收益 Pre-Tax Income
    - 适用所得税（历史递延、非现金跨期调整）
    - 净利润 Net Income
  - 两列：公司 O（旧公司）、公司 N（新公司）
  - 保留脚注标记 (1)(2)(3)(4)
  - 保留"-"前缀表示扣减项
- **Acceptance Criteria Addressed**: AC-1, AC-4, AC-5
- **Test Requirements**:
  - `human-judgement` TR-1.1: 所有行项目正确，分类清晰
  - `human-judgement` TR-1.2: 数字与原文完全一致
  - `human-judgement` TR-1.3: 脚注标记位置正确
  - `human-judgement` TR-1.4: 浏览器中表格渲染正确
- **Notes**: 这是最复杂的报表，需要仔细核对每个数字

## [x] Task 2: 修复「所有者收益」vs「自由现金流」资产负债表
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修复 `content/articles/「所有者收益」vs「自由现金流」.md` 中的 Scott Fetzer 资产负债表
  - 报表项目包括：
    - 资产部分：现金、应收、存货、其他、流动资产总额、固定资产、投资、其他资产（含商誉）、资产总额
    - 负债部分：应付票据/债务当期部分、应付账款、应计负债、流动负债总额、长期债务、递延所得税、其他递延、负债总额
    - 股东权益
  - 两列：公司 O、公司 N
  - 保留"千美金"单位说明
- **Acceptance Criteria Addressed**: AC-2, AC-4, AC-5
- **Test Requirements**:
  - `human-judgement` TR-2.1: 资产、负债、权益三大类清晰
  - `human-judgement` TR-2.2: 所有数字与原文一致
  - `human-judgement` TR-2.3: 表格平衡（资产 = 负债 + 权益）
  - `human-judgement` TR-2.4: 浏览器中表格渲染正确
- **Notes**: 注意数字中的小数点（如 4.650 可能是 4,650 的 OCR 错误，需仔细辨认）

## [x] Task 3: 修复股东信"报告收益主要来源"表格（1982-1987）
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修复 1982-1987 年共 6 封股东信中的"报告收益主要来源"表格
  - 文件：
    - `content/letters/berkshire_1982-巴菲特致股东信.md`
    - `content/letters/berkshire_1983-巴菲特致股东信.md`
    - `content/letters/berkshire_1984-巴菲特致股东信.md`
    - `content/letters/berkshire_1985-巴菲特致股东信.md`
    - `content/letters/berkshire_1986-巴菲特致股东信.md`
    - `content/letters/berkshire_1987-巴菲特致股东信.md`
  - 表格结构：
    - 行：各业务板块（保险承保、保险投资、喜诗糖果、银行业务等）
    - 列：税前收益（当年/上年）、税后收益（当年/上年）、伯克希尔应占等
  - 保留"千美元/千美金"单位说明
- **Acceptance Criteria Addressed**: AC-3, AC-4, AC-5
- **Test Requirements**:
  - `human-judgement` TR-3.1: 6 封股东信的表格均已修复
  - `human-judgement` TR-3.2: 业务板块行项目正确
  - `human-judgement` TR-3.3: 数字准确无误
  - `human-judgement` TR-3.4: 列数一致，对齐正确
- **Notes**: 这 6 年的表格结构相似，可以批量处理后逐一核对

## [x] Task 4: 修复股东信"报告收益主要来源"表格（1988-1993）
- **Priority**: high
- **Depends On**: Task 3
- **Description**: 
  - 修复 1988-1993 年共 6 封股东信中的"报告收益主要来源"表格
  - 文件：
    - `content/letters/berkshire_1988-巴菲特致股东信.md`
    - `content/letters/berkshire_1989-巴菲特致股东信.md`
    - `content/letters/berkshire_1990-巴菲特致股东信.md`
    - `content/letters/berkshire_1991-巴菲特致股东信.md`
    - `content/letters/berkshire_1992-巴菲特致股东信.md`
    - `content/letters/berkshire_1993-巴菲特致股东信.md`
  - 表格结构与 1982-1987 年类似，但业务板块可能有变化（如新增业务）
  - 注意：1991 年起单位可能从"千美元"变为"千美金"
- **Acceptance Criteria Addressed**: AC-3, AC-4, AC-5
- **Test Requirements**:
  - `human-judgement` TR-4.1: 6 封股东信的表格均已修复
  - `human-judgement` TR-4.2: 业务板块行项目与原文一致
  - `human-judgement` TR-4.3: 数字准确无误
  - `human-judgement` TR-4.4: 浏览器中表格渲染正确
- **Notes**: 后期年份可能有更多业务板块，需要注意

## [x] Task 5: 浏览器端渲染验证
- **Priority**: high
- **Depends On**: Task 1, Task 2, Task 3, Task 4
- **Description**: 
  - 启动开发服务器，在浏览器中验证所有修复的表格
  - 验证页面：
    - 「所有者收益」vs「自由现金流」（损益表 + 资产负债表）
    - 股东信 1985（中期验证点）
    - 股东信 1990（中期验证点）
  - 验证维度：
    - 表格结构正确（行列对齐）
    - 数字完整无缺失
    - 暗色模式兼容
    - 移动端横向滚动
- **Acceptance Criteria Addressed**: AC-5, AC-6
- **Test Requirements**:
  - `human-judgement` TR-5.1: 桌面端表格渲染正确
  - `human-judgement` TR-5.2: 数字对齐、列数一致
  - `human-judgement` TR-5.3: 暗色模式显示正常
  - `human-judgement` TR-5.4: 移动端可横向滚动
- **Notes**: 抽查几篇有代表性的即可，不需要全部验证

## [x] Task 6: 最终检查与收尾
- **Priority**: medium
- **Depends On**: Task 5
- **Description**: 
  - TypeScript 类型检查
  - ESLint 检查
  - 清理临时文件和脚本
  - 确认所有修改可通过 Git 追溯
- **Acceptance Criteria Addressed**: NFR-4
- **Test Requirements**:
  - `programmatic` TR-6.1: TypeScript 检查 0 error
  - `programmatic` TR-6.2: ESLint 检查 0 error
  - `programmatic` TR-6.3: 无临时脚本文件残留
- **Notes**: 本轮主要是内容修改，预计不会引入代码错误
