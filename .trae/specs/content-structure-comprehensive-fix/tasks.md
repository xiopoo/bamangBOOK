# 内容结构全面修复 - 实施计划（分解后的优先级任务列表）

## [x] Task 1: 修复标题层级倒置问题（h3 下出现 h2）
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修复 12 封股东信中 h3 标题下直接出现 h2 标题的层级倒置问题
  - 判断原则：如果 h3 是章节主题（如"透视收益"、"报告收益"），将其提升为 h2；如果 h2 是子板块内容，保持 h2 但确保上层有对应 h2 章节
  - 涉及文件：
    1. `berkshire_1979-巴菲特致股东信.md` (h3 报告收益 → h2；下面的 h2 业务板块降为 h3)
    2. `berkshire_1986-巴菲特致股东信.md` (同上)
    3. `berkshire_1990-巴菲特致股东信.md` (h3 透视收益 → h2；下面的 h2 业务板块降为 h3)
    4. `berkshire_1993-巴菲特致股东信.md` (同上)
    5. `berkshire_1994-巴菲特致股东信.md` (同上)
    6. `berkshire_1999-巴菲特致股东信.md` (h3 股票回购 → 检查上下文)
    7. `berkshire_2004-巴菲特致股东信.md` (h3 再保险 → 检查上下文)
    8. `berkshire_2006-巴菲特致股东信.md` (h3 收购 → 检查上下文)
    9. `berkshire_2007-巴菲特致股东信.md` (同上)
    10. `berkshire_2011-巴菲特致股东信.md` (h3 股票回购 → 检查上下文)
    11. `berkshire_2016-巴菲特致股东信.md` (同上)
    12. `berkshire_2017-巴菲特致股东信.md` (h3 收购 → 检查上下文)
  - **修复策略**：将作为大章节标题的 h3 提升为 h2，将作为子板块的 h2 降为 h3，确保层级逻辑连贯
- **Acceptance Criteria Addressed**: AC-1, AC-7
- **Test Requirements**:
  - `human-judgement` TR-1.1: 标题层级符合 h1 > h2 > h3 规范
  - `human-judgement` TR-1.2: 目录结构逻辑连贯
  - `human-judgement` TR-1.3: 不改变标题文字内容，只调整层级
- **Notes**: 需逐篇阅读上下文，判断正确的层级关系

## [x] Task 2: 修复列表项/正文句子误设为标题
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修复列表项或正文句子被错误设置为 h2/h3 标题的问题
  - 典型特征：以数字开头（"1，"、"2，"、"3，"等），内容是完整句子
  - 涉及文件：
    - `partnership_1958-巴菲特致合伙人信.md` - 2 处（"1，防守属性极高；"、"2，价值明确可靠..."）
    - `berkshire_1990-巴菲特致股东信.md` - 2 处（"3，所有的薪资与奖金..."、"5，将现有特别股..."）
    - `berkshire_1993-巴菲特致股东信.md` - 2 处（"1，这家公司长期竞争..."、"5，税负和通货膨胀..."）
    - `berkshire_2012-巴菲特致股东信.md` - 1 处（"2，2012 年第二件令人失望..."）
    - `berkshire_2014-巴菲特致股东信.md` - 6 处（收购标准列表）
    - `partnership_1962-annual-巴菲特致合伙人信.md` - 1 处（"2，对于获得利息的合伙人..."）
    - 其他合伙人信中的列表项
  - **修复策略**：将误设的标题改为正常段落文本，保留列表格式（用数字+句号/逗号开头）
- **Acceptance Criteria Addressed**: AC-2, AC-7
- **Test Requirements**:
  - `human-judgement` TR-2.1: 列表项不再出现在目录中
  - `human-judgement` TR-2.2: 正文内容完整，文字未被修改
  - `human-judgement` TR-2.3: 列表格式清晰可读
- **Notes**: 注意不要把真正的小标题（如"第一，..."）误删

## [x] Task 3: 修复业务板块标题截断问题
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修复"内布拉斯加家具"等不完整的业务板块标题
  - 确认方法：查看标题下一段正文的开头文字，如果能与标题衔接组成完整名称，则补充完整
  - 涉及文件：
    - `berkshire_1986-巴菲特致股东信.md` - "内布拉斯加家具" → "内布拉斯加家具店"
    - `berkshire_1990-巴菲特致股东信.md` - "内布拉斯加家具" → "内布拉斯加家具店"
    - `berkshire_1999-巴菲特致股东信.md` - "内布拉斯加家具" → "内布拉斯加家具店"
    - 其他可能存在的截断标题
- **Acceptance Criteria Addressed**: AC-3, AC-7
- **Test Requirements**:
  - `human-judgement` TR-3.1: 标题完整，与正文衔接自然
  - `human-judgement` TR-3.2: 不修改标题之外的内容
- **Notes**: 必须仔细核对上下文，确保补全正确

## [x] Task 4: 修复投资组合表（第一批：1985-1995年）
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修复 1980-1990 年代股东信中的投资组合持仓表
  - 表格结构通常为：股份数量 | 公司名称 | 成本 | 市值
  - 涉及约 15-20 个文件，每篇 1-3 个表格
  - 处理步骤：
    1. 找到纯文本持仓数据行
    2. 识别列结构（股份数量、公司名称、成本、市值等）
    3. 转换为标准 Markdown 表格
    4. 核对数字准确性
- **Acceptance Criteria Addressed**: AC-4, AC-7
- **Test Requirements**:
  - `human-judgement` TR-4.1: 表格列数一致，对齐正确
  - `human-judgement` TR-4.2: 所有数字与原文一致
  - `human-judgement` TR-4.3: 公司名称完整准确
  - `human-judgement` TR-4.4: 表格前后有空行
- **Notes**: 这是数量最多的表格类型，分批处理

## [x] Task 5: 修复保险业务数据表
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修复保险业务相关的纯文本数据表
  - 主要类型：
    1. 浮存金年度统计表（年度、承保损失、平均浮存金、资金成本等）
    2. 行业综合比率年度变化表（保费收入增长率、综合比率、损失赔付增长率等）
  - 涉及约 20-30 个文件
  - 处理步骤：
    1. 找到以纯文本形式存在的保险数据行
    2. 识别列结构（年度、各项指标）
    3. 转换为标准 Markdown 表格
    4. 核对数据准确性
- **Acceptance Criteria Addressed**: AC-5, AC-7
- **Test Requirements**:
  - `human-judgement` TR-5.1: 表格列结构正确
  - `human-judgement` TR-5.2: 所有数字与原文一致
  - `human-judgement` TR-5.3: 年度顺序正确
- **Notes**: 注意有些表格是横向排列（年份为行），有些是纵向排列

## [ ] Task 6: 修复财务年度对比表
- **Priority**: medium
- **Depends On**: None
- **Description**: 
  - 修复多年份财务数据对比表（利润表、资产负债表等）
  - 常见于早期股东信（1960-1970年代）
  - 表格结构：财务项目行 × 年度列
  - 涉及约 10-15 个文件
- **Acceptance Criteria Addressed**: AC-6, AC-7
- **Test Requirements**:
  - `human-judgement` TR-6.1: 财务项目名称正确
  - `human-judgement` TR-6.2: 各年度数据准确
  - `human-judgement` TR-6.3: 表格结构清晰
- **Notes**: 早期年份的表格可能结构较复杂，需仔细辨认

## [x] Task 7: 浏览器端渲染验证
- **Priority**: high
- **Depends On**: Task 1, Task 2, Task 3, Task 4, Task 5, Task 6
- **Description**: 
  - 启动开发服务器，在浏览器中验证修复效果
  - 验证页面（抽样）：
    - 1990 年股东信（标题问题 + 表格问题都有）
    - 1986 年股东信（标题截断 + 投资组合表）
    - 1958 年合伙人信（列表项误设标题）
  - 验证维度：
    - 目录结构逻辑连贯
    - 标题层级正确显示
    - 表格正确渲染
    - 暗色模式兼容
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `human-judgement` TR-7.1: 目录结构逻辑连贯，无不协调的层级
  - `human-judgement` TR-7.2: 表格以表格形式正确渲染
  - `human-judgement` TR-7.3: 暗色模式显示正常
  - `human-judgement` TR-7.4: 移动端可横向滚动

## [x] Task 8: 最终检查与收尾
- **Priority**: medium
- **Depends On**: Task 7
- **Description**: 
  - TypeScript 类型检查
  - ESLint 检查
  - 确认所有修改可通过 Git 追溯
- **Acceptance Criteria Addressed**: NFR-4
- **Test Requirements**:
  - `programmatic` TR-8.1: TypeScript 检查 0 error
  - `programmatic` TR-8.2: ESLint 检查 0 error
  - `programmatic` TR-8.3: 无临时脚本文件残留
- **Notes**: 本轮主要是内容修改，预计不会引入代码错误
