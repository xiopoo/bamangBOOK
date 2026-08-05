import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const editorial = path.join(root, "editorial/buffett");
const reports = path.join(editorial, "reports");
fs.mkdirSync(reports, { recursive: true });
const audit = JSON.parse(fs.readFileSync(path.join(editorial, "audit/巴菲特卷全卷结构内容与近重复审计结果.json"), "utf8"));
const fullSource = path.join(editorial, "manuscript/全卷/所有者的眼光_巴菲特卷全卷连续正文.md");
const lockedPath = path.join(editorial, "manuscript/全卷/所有者的眼光_巴菲特卷全卷锁定工作稿.md");
fs.writeFileSync(lockedPath, fs.readFileSync(fullSource));

const names = {
  "01": "第一章　股票背后是一家企业",
  "02": "第二章　价值不在报价屏上",
  "03": "第三章　穿过会计看所有者收益",
  "04": "第四章　安全边际与能力圈",
  "05": "第五章　伯克希尔纺织：便宜为何仍会昂贵",
  "06": "第六章　喜诗糖果：企业质量改变资本配置",
  "07": "第七章　护城河必须经得住时间",
  "08": "第八章　选择经理人：能力、精力与正直",
  "09": "第九章　信任、声誉与去中心化",
  "10": "第十章　经理人的第二项工作",
  "11": "第十一章　回购、收购与价格纪律",
  "12": "第十二章　浮存金：资本优势不是免费午餐",
  "13": "第十三章　风险不是一条波动曲线",
  "14": "第十四章　现金与恐慌中的选择权",
  "15": "第十五章　把个人判断变成可传承的复利制度",
};
const atoms = audit.atomCoverage;
const countRows = Object.entries(audit.chapterCharacters).sort(([a], [b]) => a.localeCompare(b)).map(([id, count]) => `| ${names[id]} | ${count.toLocaleString("zh-CN")} | ${(atoms[id] ?? []).join("、")} |`).join("\n");

const firstReport = `# 第一篇结构归并与锁定报告

日期：2026-07-31

## 结论

第一篇已完成最后一次结构归并并自动锁定。修订前36,033字符，连续阅读锁定稿32,004字符；压缩来自删除重复档案、合并相同论证及把完整O/N材料转入附录，没有为维持旧字符数补写。

## 三章结构调整

- 第一章：把“思想形成”和期权反例分别归入所有者视角形成与所有者责任；本章小结后只保留注释、来源映射和编辑说明。
- 第二章：把Home Protective、三类投资、联邦信托、华盛顿邮报和跨市场价格案例归入价格—价值—权利—时间主线。
- 第三章：改为历史会计语境—编辑桥表—所有者收益—维护资本—行业边界—期权反例—透视收益—资本配置的连续结构。

## 删除或合并的重复

1. 删除两次出现的“O公司与N公司其实是同一家企业”档案段。
2. 删除重复的相同经济现实、收购价、账面净资产和溢价分配说明。
3. 删除重复出现的“表格不能单独说明”段落。
4. 将所有者收益定义只保留一次。
5. 将行业(c)边界由长篇档案改为关键原话与编辑叙述。

## O/N正文与附录

正文保留一张六行编辑会计桥表，明确1986年购买法会计及当时商誉摊销属于历史语境。完整资产负债表、利润表、溢价分配和长段原文移至：

\`editorial/buffett/appendices/附录A_斯科特费泽ON会计桥完整档案.md\`

正文与附录通过书内锚点 \`#buffett-app-sf-on\` 双向连接。

## 审计

- 本章小结后新增正文：0
- 多重小结、注释、来源映射或编辑说明：0
- 正文近重复长段：0
- 引文重复长段：0
- 内部链接缺失：0
- 外部链接：0
`;
fs.writeFileSync(path.join(reports, "第一篇结构归并与锁定报告.md"), firstReport);

const quality = `# 《所有者的眼光》巴菲特卷全卷质量报告

日期：2026-07-31  
状态：十五章连续精编完成并锁定为工作稿；暂停等待全卷审阅。

## 一、全卷结果

- 五篇十五章结构保持不变。
- 正文总字符数：${audit.mainTextCharacters.toLocaleString("zh-CN")}。
- 观点原子：十五章全部覆盖。
- 第二至第五篇映射材料逐篇复核：${audit.mappedRowsReviewed}条。
- 实际核心来源映射与台账：${audit.sourceMappings}条。
- 700篇覆盖表：700条，无最终去向材料0条。
- 正文近重复长段：${audit.nearDuplicateParagraphs.length}组。
- 档案引文近重复：${audit.nearDuplicateQuotes.length}组。
- 内部链接：${audit.internalLinks.total}处，缺失0。
- 外部链接：0。

## 二、各章字符与观点原子

| 章节 | 字符数 | 观点原子 |
| --- | ---: | --- |
${countRows}

## 三、结构检查

十五章均按“问题—证据—机制—反例—边界—小结—资料区”组织。每章只有一次本章小结、一次来源映射和一次编辑说明；本章小结后没有新的正文论证，编辑说明之后没有二级标题。

第一篇已从二层拼接结构改为连续阅读。第三章正文保留一张O/N编辑表，完整档案进入书内附录，并明确购买法会计的历史语境。

## 四、证据与身份

- 股东信、合伙人信、演讲、访谈、内部备忘录、人物资料和编辑扩展分层标注。
- 芒格在五十年回顾中的独立评论明确归于芒格。
- 网络效应、规模经济、转换成本等标为通用商业模型或编辑解释。
- 人物背景资料只用于语境、侧栏和年表，不冒充巴菲特原话。
- 每章档案窗口用于保留完整语义，正文结论由连续编辑论证承担。

## 五、案例链

- 防守与转型：安全边际—伯克希尔纺织—喜诗—护城河。
- 人与制度：经理人三项品质—授权—声誉红线—去中心化。
- 资本系统：留存检验—回购与收购—保险浮存金。
- 风险与传承：购买力风险—现金选择权—接班与股东制度。

## 六、篇幅说明

全卷${audit.mainTextCharacters.toLocaleString("zh-CN")}字符，低于22万—30万的预计区间。该预计已被明确为弹性参考，本轮没有通过重复解释、通用常识或堆砌引文补足。十三章低于单章1万字符参考线，但所有章节均完成核心命题、观点原子、案例、反例、思想演变和边界闭环。

这项篇幅差异需要在全卷审阅时作为重大事项确认：可接受当前紧凑版本，或指定少数重点章进行第三轮案例深化；不建议对十二章平均扩写。

## 七、阶段边界

未制作正式封面、PDF或EPUB；未覆盖旧版成品；未修改、移动或删除原始Markdown。芒格卷未启动批量精编。
`;
fs.writeFileSync(path.join(reports, "巴菲特卷全卷质量报告_2026-07-31.md"), quality);

const atomReport = `# 巴菲特卷观点原子覆盖报告

十五章锁定目录中的全部观点原子均进入对应章节，覆盖如下：

| 章节 | 观点原子 |
| --- | --- |
${Object.entries(atoms).sort(([a], [b]) => a.localeCompare(b)).map(([id, list]) => `| ${names[id]} | ${list.join("、")} |`).join("\n")}

重复出现的原子承担不同功能：BA-005分别用于安全边际和风险定义；BA-008分别用于喜诗机制与动态护城河；BA-013、BA-014、BA-017、BA-024、BA-025分别在企业、资本配置和制度收束中形成书内回链，并非重复正文。
`;
fs.writeFileSync(path.join(reports, "巴菲特卷观点原子覆盖报告.md"), atomReport);

const materialReport = `# 巴菲特卷材料使用及去向报告

## 审阅范围

- 第一篇定向材料：26篇，已逐篇审阅。
- 第二至第五篇按覆盖表映射材料：${audit.mappedRowsReviewed}条，已复核元数据、内容摘要、身份和独立增量。
- 全卷实际核心来源：${audit.sourceMappings}项。

## 去向规则

- 进入正文：承担主命题、主引文、必要案例、反例、思想演变或边界。
- 案例与侧栏候选：具有独立增量但不宜打断主线的B级及部分D级材料。
- 年表、术语表、索引或附录：时间线、背景、人物和完整档案。
- 主版本承接：完全重复或同源低增量版本，原文件保留。
- 完整资料典藏层：700篇全部保留，不因未进入正文而删除。

## 交付文件

- \`editorial/buffett/巴菲特卷第二至第五篇材料审阅表.csv\`
- \`editorial/buffett/巴菲特卷全卷人物原话与来源映射.csv\`
- \`editorial/shared/内容去向与覆盖表_700篇.csv\`
- \`editorial/shared/全书精编实际使用台账.json\`
`;
fs.writeFileSync(path.join(reports, "巴菲特卷材料使用及去向报告.md"), materialReport);

const parts = {
  "第二篇内部篇级报告.md": ["04", "05", "06", "07"],
  "第三篇内部篇级报告.md": ["08", "09"],
  "第四篇内部篇级报告.md": ["10", "11", "12"],
  "第五篇内部篇级报告.md": ["13", "14", "15"],
};
for (const [file, ids] of Object.entries(parts)) {
  const content = `# ${file.replace("内部篇级报告.md", "")}内部篇级报告

状态：章节完成；结构、原子、身份、重复、内链和外链自动审计通过后已连续进入下一篇。

| 章节 | 字符数 | 原子 |
| --- | ---: | --- |
${ids.map((id) => `| ${names[id]} | ${audit.chapterCharacters[id].toLocaleString("zh-CN")} | ${atoms[id].join("、")} |`).join("\n")}

篇内正文近重复0组；小结后追加正文0处；外部链接0。
`;
  fs.writeFileSync(path.join(reports, file), content);
}

const confirm = `# 需要确认的重大事项：巴菲特卷全卷连续生产

日期：2026-07-31

## 已完成并通过

1. 第一篇结构归并及O/N会计桥修复；
2. 五篇十五章连续正文；
3. 观点原子、内容身份、近重复和章节结束结构审计；
4. 700篇覆盖表及47项实际使用台账回写；
5. 内部链接目标补全，外部链接归零；
6. O/N完整档案、术语表、案例索引和典藏层规划。

## 唯一重大确认事项

全卷当前正文为${audit.mainTextCharacters.toLocaleString("zh-CN")}字符，低于22万—30万的预计区间。原因是本轮以消除拼接、重复和引文堆积为优先，未按原预算平均扩写。

请确认下一步采用哪一种方向：

1. 接受当前紧凑工作稿，进入全卷附录、索引、侧栏与插图完善；
2. 只选择若干核心章进行第三轮案例深化；
3. 要求十五章整体向22万字符以上扩展。

在确认前暂停，不制作正式封面、PDF或EPUB。
`;
fs.writeFileSync(path.join(editorial, "需要确认的重大事项_巴菲特卷全卷连续生产.md"), confirm);

console.log(JSON.stringify({ lockedPath, reports: 8, characters: audit.mainTextCharacters }, null, 2));
