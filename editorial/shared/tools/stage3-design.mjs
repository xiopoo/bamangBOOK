import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const EDITORIAL = path.join(ROOT, "editorial");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const header = rows.shift();
  return rows.filter((item) => item.some(Boolean)).map((item) =>
    Object.fromEntries(header.map((key, index) => [key, item[index] ?? ""])),
  );
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(filePath, rows) {
  const keys = Object.keys(rows[0] ?? {});
  const text = [
    keys.map(csvEscape).join(","),
    ...rows.map((row) => keys.map((key) => csvEscape(row[key])).join(",")),
  ].join("\n") + "\n";
  fs.writeFileSync(filePath, text);
}

function loadCsv(relativePath) {
  return parseCsv(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

const buffettAtoms = loadCsv("editorial/buffett/outline/巴菲特观点原子库.csv");
const mungerAtoms = loadCsv("editorial/munger/outline/芒格观点原子库.csv");
const atomMap = new Map([...buffettAtoms, ...mungerAtoms].map((row) => [row["节点编号"], row]));
const classified = loadCsv("editorial/shared/内容分级表_700篇.csv");
const versionRows = loadCsv("editorial/shared/主版本—替代版本映射.csv");

const C = (id, part, title, sections, question, proposition, atoms, cases, evolution, misconception, boundary, chars, illustration, relation, links) => ({
  id, part, title, sections, question, proposition, atoms, cases, evolution, misconception, boundary, chars, illustration, relation, links,
});

const buffettChapters = [
  C("buffett-ch-01", "第一篇 所有者的起点", "股票背后是一家企业", ["从报价器退后一步", "五年不开市的思想实验", "所有权带来的责任"], "买入一只股票时，真正买到的是什么？", "证券分析必须从企业部分所有权出发，市场价格只提供交易条件。", ["BA-001", "BA-024"], "1985年投资谈话；伯克希尔面向长期股东的沟通制度", "早期投资纪律逐步转化为伯克希尔的股东文化。", "所有者视角意味着任何价格都可以长期持有。", "只有理解企业经济特征和所有者权利时，这一视角才可操作。", 20000, "所有者视角双层图：股票凭证—企业现金流—股东权利", "建立全书观察位置；下一章回答价值如何衡量。", ["buffett-ch-02", "buffett-ch-09", "buffett-app-terms"]),
  C("buffett-ch-02", "第一篇 所有者的起点", "价值不在报价屏上", ["账面价值只是线索", "现金流折现的共同语言", "估值区间而非精确答案"], "怎样判断一家企业值多少钱？", "内在价值来自未来现金流及其风险，而非账面价值或短期市价。", ["BA-003", "BA-004"], "贝尔里奇石油；股票与债券的“票息”比较", "1980年代从账面价值代理指标走向更明确的内在价值表达，晚期又调整伯克希尔衡量尺度。", "DCF公式能自动产生正确价值。", "现金流和折现率都是估计，价值只能形成有边界的区间。", 21000, "内在价值估计漏斗：经营假设—现金流—折现—区间", "承接所有者视角；为所有者收益和安全边际提供尺度。", ["buffett-ch-03", "buffett-ch-04", "buffett-index-concepts"]),
  C("buffett-ch-03", "第一篇 所有者的起点", "穿过会计看所有者收益", ["报告利润遗漏了什么", "维护性资本支出的难题", "经济实质优先"], "会计利润中有多少真正属于所有者？", "所有者收益通过扣除维持竞争地位所需资本，更接近可支配经济收益。", ["BA-002", "BA-027"], "斯科特费泽；控股收益与未分配收益", "1986年提出所有者收益，随后与透视收益、经营收益等衡量方法共同演进。", "把所有者收益公式机械化就能消除判断。", "维护性资本支出和营运资金需要商业判断，不能制造虚假精确。", 20000, "所有者收益计算桥图及会计利润调整项", "把价值公式落到经营数字；下一篇转向这些现金由什么企业产生。", ["buffett-ch-02", "buffett-ch-04", "buffett-app-terms"]),
  C("buffett-ch-04", "第二篇 好企业如何创造价值", "安全边际与能力圈", ["永久损失而非波动", "知道什么不能估", "集中并非豪赌"], "不确定世界里怎样避免致命错误？", "安全边际、能力圈和受控集中共同降低永久性资本损失。", ["BA-005", "BA-006"], "1965年合伙人信；高确信度投资上限", "从格雷厄姆式资产折价和分散，逐步演化为对少数优质企业的高确信持有。", "安全边际就是低市盈率；集中就是模仿重仓。", "集中要求可理解、可估值、下行可承受和事实可反证同时成立。", 22000, "安全边际与能力圈的重叠判断图", "完成估值纪律；为纺织业务和喜诗的思想转折建立基准。", ["buffett-ch-05", "buffett-ch-06", "buffett-index-questions"]),
  C("buffett-ch-05", "第二篇 好企业如何创造价值", "伯克希尔纺织：便宜为何仍会昂贵", ["烟蒂投资的吸引力", "持续投入吞噬回报", "一次错误怎样改变方法"], "低价资产为什么可能成为长期陷阱？", "价格折扣不能补偿恶劣经济特征和持续资本需求。", ["BA-026", "BA-025"], "伯克希尔纺织业务；巴菲特对错误的公开复盘", "该案例连接格雷厄姆阶段与后来对企业质量、机会成本的重新认识。", "巴菲特后来完全否定了所有低估值投资。", "低价资产在清算或明确催化条件下仍可能有效；本章反对的是无止境投入。", 24000, "纺织资本投入漏斗与机会成本对比", "作为反例引出喜诗；与末篇错误复盘形成回环。", ["buffett-ch-04", "buffett-ch-06", "buffett-ch-15"]),
  C("buffett-ch-06", "第二篇 好企业如何创造价值", "喜诗糖果：企业质量改变资本配置", ["1972年的购买犹豫", "定价权与少量增量资本", "现金流被送往更好的机会"], "什么样的企业值得付出高于账面价值的价格？", "真正优秀的企业以持久定价权和低增量资本需求释放现金，并扩大整个资本配置系统的机会集。", ["BA-007", "BA-008", "BA-013"], "喜诗糖果；内布拉斯加家具城；芒格对质量观的影响", "喜诗使“合理价格买伟大企业”从经验变成成熟原则，并连接护城河与资本配置。", "品牌强就一定有护城河；好企业可以无视买入价格。", "必须同时验证客户习惯、定价权、资本需求、管理和合理价格。", 22000, "喜诗现金流—低再投资—跨企业配置循环图", "完成从便宜资产到优质企业的转折；下一章扩展护城河的动态检验。", ["buffett-ch-05", "buffett-ch-07", "buffett-ch-10", "buffett-case-sees"]),
  C("buffett-ch-07", "第二篇 好企业如何创造价值", "护城河必须经得住时间", ["竞争如何侵蚀高回报", "品牌、低成本与网络", "增长何时创造价值"], "怎样区分暂时高利润与持久竞争优势？", "护城河必须保护长期资本回报，并在竞争中持续维护。", ["BA-008", "BA-014", "BA-017"], "GEICO低成本；可口可乐品牌；高资本需求业务对照", "1980年代优质企业经验在2007年形成更系统的“护城河”表达。", "给企业贴上品牌或规模标签就等于证明护城河。", "优势必须动态复核；增长只有在增量资本回报足够高时才创造价值。", 20000, "护城河动态剖面与侵蚀信号", "承接喜诗；把企业判断推进到管理层和制度。", ["buffett-ch-06", "buffett-ch-08", "buffett-index-companies"]),
  C("buffett-ch-08", "第三篇 人与制度", "选择经理人：能力、精力与正直", ["经营纪录比简历重要", "正直决定能力的方向", "企业不能只靠超级明星"], "好企业需要什么样的经营者？", "经营能力必须与正直和所有者利益一致，制度不能依赖单一英雄。", ["BA-009", "BA-010"], "布卢姆金家族；梅奥诊所类比；伯克希尔子公司经理人", "从选股中的管理层判断发展为伯克希尔收购后的授权原则。", "只看历史业绩就能判断诚信；明星经理人可以替代商业质量。", "关键人才有时确实重要，仍需识别组织是否可复制、可接班。", 20000, "经理人判断三角：能力—精力—正直", "从企业质量过渡到制度质量；下一章说明信任如何运转。", ["buffett-ch-07", "buffett-ch-09", "buffett-index-people"]),
  C("buffett-ch-09", "第三篇 人与制度", "信任、声誉与去中心化", ["总部为什么保持克制", "商业失误可以容忍", "声誉不能透支"], "一个庞大集团怎样用很少的控制层保持秩序？", "伯克希尔以信任和分权降低摩擦，同时用声誉和品行红线守住共同边界。", ["BA-011", "BA-012", "BA-023"], "伯克希尔小总部；子公司CEO制度；所罗门事件", "授权经验逐渐沉淀为制度，并在危机中显露声誉约束的重要性。", "信任等于不需要审计、规则和接班机制。", "分权只有在选人、激励、信息和问责条件成立时有效。", 21000, "伯克希尔分权结构与声誉红线图", "把管理层判断升级为组织系统；下一篇进入总部保留的资本配置职责。", ["buffett-ch-08", "buffett-ch-10", "buffett-ch-15"]),
  C("buffett-ch-10", "第四篇 资本配置", "经理人的第二项工作", ["经营之外的资本责任", "留存一美元的价值检验", "分红与机会成本"], "企业赚到的钱应该留在哪里？", "资本配置是管理层的核心责任，留存收益必须创造超过替代方案的增量价值。", ["BA-013", "BA-014"], "喜诗释放的现金；伯克希尔多业务配置", "从单项投资选择发展为集团内部持续配置，并成为伯克希尔总部的首要职责。", "只要公司盈利，留存收益就天然合理。", "配置结果要按长期每股价值评估，并考虑股东可获得的替代回报。", 22000, "资本配置决策树：再投资—收购—回购—分红—现金", "承接去中心化中总部保留的职责；后接具体配置工具。", ["buffett-ch-06", "buffett-ch-11", "buffett-ch-12"]),
  C("buffett-ch-11", "第四篇 资本配置", "回购、收购与价格纪律", ["回购不是姿态", "收购的六项标准", "永久持有及其例外"], "什么时候买自己的股票，什么时候买下一家公司？", "回购和收购都必须服从内在价值、企业质量、管理层与机会成本。", ["BA-015", "BA-016", "BA-017"], "伯克希尔回购标准；企业收购广告；长期持有政策", "后期股东信不断收紧回购的价格条件，并明确永久持有是偏好而非无条件承诺。", "回购必然提升价值；“永远持有”意味着永不复核。", "回购须低于保守内在价值且不损害流动性；持有条件会随事实变化。", 23000, "回购与收购的双路径比较表", "把配置原则落到交易工具；下一章解释保险如何扩大资本池。", ["buffett-ch-10", "buffett-ch-12", "buffett-index-questions"]),
  C("buffett-ch-12", "第四篇 资本配置", "浮存金：资本优势不是免费午餐", ["保险负债怎样形成资金", "承保纪律决定成本", "巨灾与期限的压力测试"], "保险为什么能成为伯克希尔的资本引擎？", "优质浮存金提供长期可投资资金，但价值完全依赖承保纪律和生存能力。", ["BA-021", "BA-022"], "GEICO；国民赔偿；阿勒格尼；巨灾年份", "从收购保险公司获得永久资本，到形成以低成本浮存金支持配置的成熟循环。", "浮存金等于无成本永久资金。", "负债期限、巨灾风险、定价周期和资本充足性共同决定真实成本。", 25000, "保费—赔付—浮存金—投资收益时序图", "完成资本系统；下一篇讨论风险、现金与周期。", ["buffett-ch-10", "buffett-ch-13", "buffett-case-insurance"]),
  C("buffett-ch-13", "第五篇 风险、时间与复利", "风险不是一条波动曲线", ["购买力永久损失", "杠杆与被迫出售", "名义安全的陷阱"], "什么才是投资者真正需要防范的风险？", "风险是预期持有期内永久购买力损失的概率，波动只有在杠杆和期限压力下才会转化为致命后果。", ["BA-018", "BA-005"], "现金、债券、黄金与生产性资产比较；衍生品与杠杆警示", "早期安全边际在2011年被扩展为更明确的购买力风险定义。", "既然波动不是风险，就可以忽视价格、流动性和融资条件。", "不同持有人面临的期限、负债和行为约束不同，风险不能脱离主体。", 21000, "波动转化为永久损失的条件链", "重新解释第一篇的安全边际；下一章说明现金如何阻断风险链。", ["buffett-ch-04", "buffett-ch-14", "buffett-app-checklist"]),
  C("buffett-ch-14", "第五篇 风险、时间与复利", "现金与恐慌中的选择权", ["现金先保证承诺", "悲观是朋友", "逆向行动需要准备"], "为什么长期投资者仍要持有大量现金？", "现金牺牲部分长期收益，换取灾难中的生存、信誉和行动选择权。", ["BA-019", "BA-020"], "2008年金融危机；伯克希尔现金堡垒", "现金从交易等待工具发展为集团承诺、巨灾和逆周期机会的制度保障。", "持有现金天然保守低效；逆向就等于市场下跌时自动买入。", "现金规模取决于负债和机会集；逆向必须建立在独立估值与资产负债表安全上。", 20000, "现金三重功能图：承诺—灾难—机会", "承接风险定义；为最终的长期复利与传承提供生存条件。", ["buffett-ch-13", "buffett-ch-15", "buffett-index-cases"]),
  C("buffett-ch-15", "第五篇 风险、时间与复利", "把个人判断变成可传承的复利制度", ["错误如何公开复盘", "合适股东与长期沟通", "普通人能学什么、不能复制什么"], "伯克希尔的复利能否离开巴菲特继续运转？", "长期复利依赖企业现金流、资本配置、文化、声誉和股东关系共同构成的制度，而非单一投资天才。", ["BA-024", "BA-025", "BA-028"], "历年股东信；接班安排；伯克希尔制度", "晚期表达从个人投资方法收束到组织文化、接班和对股东的责任。", "复制持仓即可复制伯克希尔；复利只是高收益率的数学结果。", "普通读者能复制原则和纪律，不能复制永久资本、保险结构、规模和交易渠道。", 22000, "伯克希尔复利闭环与可复制/不可复制边界", "收束全书并返回第一章的所有者身份。", ["buffett-ch-01", "buffett-ch-09", "buffett-app-timeline", "buffett-index-questions"]),
];

const mungerChapters = [
  C("munger-ch-01", "第一篇 建造知识格栅", "一把锤子为什么不够", ["专业知识的力量与盲区", "铁锤人倾向", "少数重要模型"], "为什么受过良好训练的人仍会系统性看错问题？", "单一专业会把现实压成自己熟悉的形状，可靠判断需要多模型相互校验。", ["MA-002", "MA-001"], "1994年南加州大学演讲；脊椎按摩师式单一解释", "芒格把长期阅读经验在1994年公开组织为“普世智慧”框架。", "多学科意味着收集尽可能多的模型名词。", "模型必须少而重要，并受事实、适用条件和反证约束。", 17000, "单一锤子视野与多模型视野对照图", "用问题打开芒格体系；下一章正面建造格栅。", ["munger-ch-02", "munger-app-model-identity", "munger-index-concepts"]),
  C("munger-ch-02", "第一篇 建造知识格栅", "多元思维模型怎样连成知识格栅", ["模型不是孤立卡片", "跨学科连接的三种方式", "把知识变成自动反应"], "知识怎样从记忆材料变成可迁移的判断结构？", "少数基础模型必须围绕因果、反馈和约束连接成格栅，才能在新问题中调用。", ["MA-001", "MA-003"], "数学、会计、心理学、工程和微观经济学的连接；巴菲特的决策树习惯", "从个人阅读方法到公开演讲，再到商业和人生问答中的反复应用。", "格栅是一张固定的模型清单；所有模型都由芒格原创。", "本章首次说明思想源流：概率等为通用知识，芒格的贡献在选择、连接和使用。", 18000, "多元模型格栅主图：学科节点—连接—现实问题", "完成全书核心架构；下一章说明格栅如何通过学习保持活性。", ["munger-ch-01", "munger-ch-03", "munger-app-model-identity"]),
  C("munger-ch-03", "第一篇 建造知识格栅", "终身学习：让模型保持活性", ["好奇心与阅读", "用进废退", "承认困惑"], "为什么知识格栅需要一生更新？", "理性依赖持续学习、练习和承认无知，而非一次性教育。", ["MA-009", "MA-022"], "跨学科阅读；晚年问答；技能用进废退", "晚年表达把早期求知方法收束为谦逊、客观和持续更新。", "能力圈就是永远停留在熟悉领域。", "更新边界不等于对每个新领域都形成意见；复杂问题允许暂缓判断。", 17000, "学习复利循环：阅读—模型—应用—反馈—修正", "从知识结构过渡到具体判断工具。", ["munger-ch-04", "munger-ch-16", "munger-index-questions"]),
  C("munger-ch-04", "第二篇 判断工具", "概率：把故事变成可以检验的判断", ["基础率与条件", "期望值和赔率", "数量感的边界"], "面对不确定性，怎样避免只听一个好故事？", "概率和数量思维迫使判断者比较结果、可能性和代价。", ["MA-003", "MA-019"], "决策树与排列组合；少数高确信投资机会", "1994年演讲把概率列为必须自动化的基础模型，后期投资问答持续应用。", "任何问题都能得到精确概率；重注只取决于主观信心。", "概率常是估计，必须记录假设、误差和极端下行。", 18000, "概率树与期望值示意", "格栅的第一组工具；后接逆向和反证。", ["munger-ch-05", "munger-ch-13", "munger-app-checklist"]),
  C("munger-ch-05", "第二篇 判断工具", "逆向：先问怎样会失败", ["1986年的反讽处方", "从终点倒推约束", "避错并非消极"], "正面求解卡住时，怎样从失败条件打开问题？", "逆向通过识别失败路径和必要条件，暴露正向叙事忽略的约束。", ["MA-004", "MA-005"], "1986年毕业演讲；雅各比的逆向方法；牌桌错误打法", "从“如何过悲惨生活”的反讽演讲，发展为晚年“避开惯常失败方式”的总结。", "逆向意味着永远不冒险、不追求成长。", "逆向是正向因果分析的补充，不能替代机会识别和建设性行动。", 18000, "逆向求解双向箭头：目标—失败条件—防线", "在概率之外增加失败视角；下一章用反证检查自我。", ["munger-ch-04", "munger-ch-06", "munger-ch-15"]),
  C("munger-ch-06", "第二篇 判断工具", "反证、检查清单与第二次思考", ["达尔文怎样处理反面证据", "清单对抗遗忘", "程序也会僵化"], "怎样降低对自己珍视理论的偏爱？", "主动反证和检查清单把理性从愿望变成可重复程序。", ["MA-006", "MA-010"], "达尔文优先记录反面证据；航空与工程清单类比", "芒格把科学反证、工程程序和心理偏误结合为双轨检查方式。", "列出清单就能自动得到正确答案。", "清单只能防止已知遗漏；未知风险仍需判断和更新。", 17000, "双轨检查清单：事实轨—心理轨—反证门", "完成工具组；下一篇转向判断者自身的心理系统。", ["munger-ch-07", "munger-app-checklist", "munger-index-questions"]),
  C("munger-ch-07", "第三篇 人类误判", "误判不是偶然：心理倾向的系统", ["为什么要列倾向清单", "倾向、情境与行为", "不能用标签代替证据"], "聪明人为何会重复犯相似错误？", "可重复的心理倾向在特定情境下系统性影响判断。", ["MA-011", "MA-010"], "1995年人类误判心理学演讲及修订版", "初版倾向清单经修订扩充，并更加重视倾向之间的相互作用。", "给行为贴一个偏误标签就解释完毕。", "倾向不是临床诊断；必须结合事实、激励、环境和反馈。", 19000, "误判心理学总图的分组框架", "从判断工具进入心理轨；接下来先分析最强制度力量——激励。", ["munger-ch-08", "munger-ch-09", "munger-app-psychology"]),
  C("munger-ch-08", "第三篇 人类误判", "激励：制度比劝诫更诚实", ["先看奖励了什么", "指标如何替代目标", "设计不易作弊的系统"], "为什么好人进入坏制度也会做出坏结果？", "激励能强烈塑造行为，制度设计应让正确行为与个人回报尽量一致。", ["MA-012", "MA-018"], "联邦快递夜班计酬；销售激励和代理问题", "激励从心理倾向被扩展为芒格分析商业、专业伦理与组织制度的通用入口。", "人只受金钱激励驱动；找到激励就能解释一切。", "身份、规范和长期关系同样重要，指标设计还会产生二阶效应。", 20000, "激励反馈回路与指标异化图", "把心理学连接到制度；下一章解释群体和权威。", ["munger-ch-07", "munger-ch-09", "munger-ch-14"]),
  C("munger-ch-09", "第三篇 人类误判", "群体、权威与被剥夺感", ["猴子看，猴子做", "层级为何压住异议", "失去为何比得到更强烈"], "哪些情境最容易让群体一起失去独立判断？", "社会认同、权威和剥夺反应会在不确定与压力中相互强化。", ["MA-014", "MA-015", "MA-016"], "旁观者效应；副驾驶不纠正机长；损失威胁", "修订版演讲更清楚地呈现倾向之间不可分割的交织。", "群体意见和权威总是错误；任何反对变化都是心理偏误。", "群体信息有时是真信号，权威也能降低协调成本，实际权益损失必须被认真对待。", 19000, "群体误判三角：社会认同—权威—剥夺", "为下一章的多因素叠加建立三个关键组件。", ["munger-ch-10", "munger-app-psychology", "munger-index-cases"]),
  C("munger-ch-10", "第三篇 人类误判", "当偏误彼此增强", ["嫉妒与相对比较", "承诺、压力和反馈", "Lollapalooza效应"], "为什么多个普通因素会合成极端结果？", "多种倾向同向叠加并形成反馈时，整体效应可能远超单项相加。", ["MA-013", "MA-017"], "拍卖、市场狂热、邪教式群体过程", "芒格从倾向列表发展到相互作用和极端结果的机制解释。", "任何多因素组合都会放大；Lollapalooza是一个可以随意套用的标签。", "必须说明因素方向、先后、反馈和反事实，不能用术语代替因果。", 18000, "多因素叠加与反馈环图", "收束心理学篇；下一篇把双轨分析带入商业。", ["munger-ch-11", "munger-app-psychology", "munger-index-concepts"]),
  C("munger-ch-11", "第四篇 商业实践", "穿过会计看商业现实", ["会计是必要语言", "数字背后的资本需求", "规模的正面和反面"], "怎样把模型用于真实企业，而不是停留在概念层？", "商业判断要把会计、竞争优势、资本需求、规模和激励放在同一结构中。", ["MA-021", "MA-026"], "安然会计；连锁零售；规模优势与规模不经济", "芒格把会计训练和微观经济学模型长期用于企业案例，并持续批评单学科盲区。", "会计数字没有意义；规模越大越有优势。", "会计是起点而非终点；规模会同时制造成本优势、官僚和激励错位。", 18000, "商业判断多轨剖面：会计—竞争—规模—激励", "从心理机制进入企业分析；下一章讨论好企业与长期持有。", ["munger-ch-12", "munger-ch-13", "munger-app-model-identity"]),
  C("munger-ch-12", "第四篇 商业实践", "好企业让少行动成为优势", ["合理价格买伟大企业", "竞争优势与复利", "坐等的条件"], "为什么芒格推动巴菲特从便宜货转向优质企业？", "持久竞争优势和高资本回报能让少数优质企业长期复利，减少交易需求。", ["MA-020", "MA-027"], "喜诗、好市多、可口可乐", "与巴菲特合作使企业质量判断进入投资核心，并在好市多等长期案例中反复验证。", "买到好企业后无需再复核；价格不再重要。", "竞争优势、治理和价格必须持续成立，少行动不能成为惰性借口。", 19000, "优质企业—少行动—复利链条", "承接商业分析；下一章讨论集中与资本配置。", ["munger-ch-11", "munger-ch-13", "munger-index-companies"]),
  C("munger-ch-13", "第四篇 商业实践", "少数机会、集中下注与资本配置", ["机会成本排序", "确信时重注", "辛格尔顿的反惯例配置"], "当好机会很少时，资本应该怎样分配？", "机会应按最佳替代方案排序，集中只属于证据充分且下行可承受的少数机会。", ["MA-007", "MA-019", "MA-025"], "每日期刊集中持仓；辛格尔顿低价回购和高价增发", "机会成本从基础经济学被芒格转化为投资和董事会决策的核心尺度。", "集中本身创造超额收益；反对分散意味着忽略风险。", "集中依赖能力圈、赔率、资本结构和承受损失能力。", 18000, "机会成本排名与资本配置桶图", "把企业判断转为行动；下一篇转向合作和组织。", ["munger-ch-04", "munger-ch-14", "munger-index-cases"]),
  C("munger-ch-14", "第五篇 合作、品格与人生", "应得信任：合作如何降低摩擦", ["可靠是一项经济资产", "共同原则与能力互补", "信任不能替代控制"], "长期合作为什么有时比严密合同更有效？", "可靠、利益一致和互补能力能形成低摩擦合作，但信任必须是应得且可验证的。", ["MA-023", "MA-028"], "巴菲特与芒格数十年合作；2007年法学院演讲", "合作经验从私人关系逐渐被表达为组织与人生原则。", "信任就是取消规则；成功搭档可以机械复制。", "角色、权力和历史路径不同，必要复核与控制仍不可缺。", 18000, "应得信任结构：品格—激励—能力—复核", "承接商业制度中的激励；下一章由合作转向个人避错。", ["munger-ch-08", "munger-ch-15", "munger-index-people"]),
  C("munger-ch-15", "第五篇 合作、品格与人生", "避免惯常的失败方式", ["怨恨、嫉妒和自怜", "远离极端意识形态", "逆向设计一生"], "一套判断方法怎样变成生活纪律？", "避免常见愚蠢需要管理情绪、身份和习惯，而不仅是掌握模型。", ["MA-005", "MA-024"], "1986年反讽演讲；晚年访谈的失败清单", "早期逆向处方在晚年收束为对惯常失败方式的持续回避。", "避错就是保守、冷漠或不承担责任。", "避错必须与建设能力、承担义务和抓住少数机会结合。", 17000, "人生避错清单与红线地图", "将工具和心理学内化为品格；最后一章讨论理性的责任。", ["munger-ch-05", "munger-ch-16", "munger-app-checklist"]),
  C("munger-ch-16", "第五篇 合作、品格与人生", "理性近乎一种道德义务", ["谦逊与持续更新", "理性要承担后果", "避错与文明进步"], "理性最终是认知能力，还是一种对他人和现实的责任？", "理性要求承认错误、持续学习并承担判断后果，同时不放弃对文明长期进步的信心。", ["MA-022", "MA-029", "MA-030"], "2020年加州理工对谈档案；2023年最后访谈", "晚年表达把格栅、避错、品格和文明观收束为一套人生立场。", "理性等于全知或情感冷漠；悲观避错与长期乐观矛盾。", "理性不能消除价值冲突，也不能保证预测正确；档案摘要必须与完整对谈核对。", 18000, "理性责任闭环：事实—修正—行动—后果—文明", "收束全书并返回第一篇的持续学习。", ["munger-ch-03", "munger-ch-15", "munger-app-timeline"]),
];

function chapterAtomRows(chapter) {
  return chapter.atoms.map((id) => atomMap.get(id)).filter(Boolean);
}

function outlineMarkdown(bookTitle, cycle, chapters, total, differenceNote, anchorPrefix) {
  let output = `# ${bookTitle}唯一融合三级目录\n\n`;
  output += `系列：复利书房·巴芒经典  \n品牌主色：#AB1942  \n结构主循环：${cycle}  \n正文预算：约${total.toLocaleString("zh-CN")}字符；附录、索引和典藏层另计。  \n目录状态：本阶段唯一融合工作目录，等待样章确认。\n\n`;
  output += `结构说明：${differenceNote}\n\n`;
  let currentPart = "";
  let partIndex = 0;
  for (let i = 0; i < chapters.length; i += 1) {
    const chapter = chapters[i];
    if (chapter.part !== currentPart) {
      currentPart = chapter.part;
      partIndex += 1;
      output += `## ${currentPart} {#${anchorPrefix}-part-${String(partIndex).padStart(2, "0")}}\n\n`;
    }
    const atoms = chapterAtomRows(chapter);
    output += `### 第${toChineseNumber(i + 1)}章 ${chapter.title} {#${chapter.id}}\n\n`;
    output += chapter.sections.map((section, index) => `${index + 1}. ${section}`).join("\n") + "\n\n";
    output += `- 本章核心问题：${chapter.question}\n`;
    output += `- 核心命题：${chapter.proposition}\n`;
    output += `- 对应观点原子：${chapter.atoms.join("、")}\n`;
    output += `- 主要来源文件：${[...new Set(atoms.map((row) => `\`${row["来源文件"]}\``))].join("；")}\n`;
    output += `- 最佳证据片段：${atoms.map((row) => `“${row["原始表达"]}”〔${row["节点编号"]}〕`).join("；")}\n`;
    output += `- 代表案例：${chapter.cases}\n`;
    output += `- 思想演变：${chapter.evolution}\n`;
    output += `- 常见误解：${chapter.misconception}\n`;
    output += `- 适用边界：${chapter.boundary}\n`;
    output += `- 预计字符数：${chapter.chars.toLocaleString("zh-CN")}\n`;
    output += `- 插图需求：${chapter.illustration}\n`;
    output += `- 与前后章节的关系：${chapter.relation}\n`;
    output += `- 书内链接目标：${chapter.links.map((id) => `#${id}`).join("、")}\n\n`;
  }
  return output;
}

function evidenceMarkdown(bookTitle, chapters) {
  let output = `# ${bookTitle}逐章证据规划\n\n`;
  output += "说明：以下为章节证据包，不是完整正文。主引文优先使用完整、可核对的项目内文本；档案摘要和语录页只承担定位与语境补充。\n\n";
  for (let i = 0; i < chapters.length; i += 1) {
    const chapter = chapters[i];
    const atoms = chapterAtomRows(chapter);
    const main = atoms[0];
    const supplements = atoms.slice(1);
    output += `## 第${toChineseNumber(i + 1)}章 ${chapter.title} {#evidence-${chapter.id}}\n\n`;
    output += `- 所属篇：${chapter.part}\n`;
    output += `- 核心命题：${chapter.proposition}\n`;
    output += `- 观点原子：${chapter.atoms.join("、")}\n`;
    output += `- 主引文：${main ? `“${main["原始表达"]}”` : "待选"}\n`;
    output += `- 主引文来源：${main ? `\`${main["来源文件"]}\`；${main["时间与场合"]}；身份：${main["内容身份"]}` : "待选"}\n`;
    output += `- 补充引文：${supplements.length ? supplements.map((row) => `“${row["原始表达"]}”〔${row["节点编号"]}〕`).join("；") : "从同主题B级材料中选择边界性表达，不另造引语"}\n`;
    output += `- 案例：${chapter.cases}\n`;
    output += `- 反例：${chapter.misconception}；优先选择能显示这一误解后果的项目内材料。\n`;
    output += `- 思想演变材料：${chapter.evolution}\n`;
    output += `- 边界材料：${chapter.boundary}\n`;
    output += `- 来源路径：${[...new Set(atoms.map((row) => `\`${row["来源文件"]}\``))].join("；")}\n`;
    output += `- 内容身份：${[...new Set(atoms.map((row) => row["内容身份"]))].join("；")}\n`;
    output += "- 建议使用方式：主引文保留完整语义单元；补充引文用于修正、边界或演变；案例只保留与命题直接相关的事实链。\n";
    output += `- 内部链接关系：正文锚点 #${chapter.id}；证据锚点 #evidence-${chapter.id}；延伸目标 ${chapter.links.map((id) => `#${id}`).join("、")}。\n\n`;
  }
  return output;
}

function toChineseNumber(number) {
  const digits = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  if (number <= 10) return digits[number];
  if (number < 20) return `十${digits[number - 10]}`;
  return String(number);
}

const relationByPath = new Map();
for (const row of versionRows) {
  const mainRelation = {
    role: "主版本",
    group: row["版本组"],
    counterpart: row["替代版本"],
    type: row["关系类型"],
    decision: row["处理决定"],
  };
  const alternateRelation = {
    role: "替代版本",
    group: row["版本组"],
    counterpart: row["主版本"],
    type: row["关系类型"],
    decision: row["处理决定"],
  };
  relationByPath.set(row["主版本"], [...(relationByPath.get(row["主版本"]) ?? []), mainRelation]);
  relationByPath.set(row["替代版本"], [...(relationByPath.get(row["替代版本"]) ?? []), alternateRelation]);
}

const buffettThemeMap = [
  [/所有者思维|股东沟通/, "buffett-ch-01"],
  [/内在价值|账面价值|估值/, "buffett-ch-02"],
  [/所有者收益|会计与经济现实/, "buffett-ch-03"],
  [/安全边际|能力圈|集中投资/, "buffett-ch-04"],
  [/烟蒂|思想演变|错误复盘/, "buffett-ch-05"],
  [/企业质量|定价权/, "buffett-ch-06"],
  [/护城河|竞争优势|增长/, "buffett-ch-07"],
  [/管理层/, "buffett-ch-08"],
  [/企业文化|信任|去中心化|声誉/, "buffett-ch-09"],
  [/留存收益|分红|资本配置/, "buffett-ch-10"],
  [/回购|收购|长期持有/, "buffett-ch-11"],
  [/保险|浮存金|承保纪律/, "buffett-ch-12"],
  [/风险|购买力|波动/, "buffett-ch-13"],
  [/现金|市场波动|逆周期/, "buffett-ch-14"],
  [/复利|制度传承|普通读者/, "buffett-ch-15"],
];

const mungerThemeMap = [
  [/铁锤人倾向/, "munger-ch-01"],
  [/多元思维模型|知识格栅/, "munger-ch-02"],
  [/终身学习|谦逊|太难问题/, "munger-ch-03"],
  [/概率|期望值/, "munger-ch-04"],
  [/逆向|避免愚蠢/, "munger-ch-05"],
  [/反证|检查清单|双轨分析/, "munger-ch-06"],
  [/人类误判心理学|心理倾向/, "munger-ch-07"],
  [/激励/, "munger-ch-08"],
  [/社会认同|权威|剥夺/, "munger-ch-09"],
  [/Lollapalooza|叠加|嫉妒/, "munger-ch-10"],
  [/会计|规模效应|商业判断/, "munger-ch-11"],
  [/企业质量|护城河|坐等投资/, "munger-ch-12"],
  [/机会成本|集中投资|资本配置/, "munger-ch-13"],
  [/应得信任|合作/, "munger-ch-14"],
  [/意识形态|品格|失败清单/, "munger-ch-15"],
  [/理性|文明|晚年思想/, "munger-ch-16"],
];

function chooseChapter(themes, map, fallback) {
  for (const [pattern, id] of map) {
    if (pattern.test(themes)) return id;
  }
  return fallback;
}

function bookAndChapter(row) {
  const person = row["所属人物"];
  const themes = `${row["对应主题"]}|${row["标题"]}`;
  if (person === "巴菲特与芒格") {
    return {
      book: "巴菲特卷|芒格卷",
      chapter: `${chooseChapter(themes, buffettThemeMap, "buffett-ch-15")}|${chooseChapter(themes, mungerThemeMap, "munger-ch-14")}`,
    };
  }
  if (person === "芒格") return { book: "芒格卷", chapter: chooseChapter(themes, mungerThemeMap, "munger-ch-02") };
  if (person === "巴菲特" || person === "巴菲特相关") return { book: "巴菲特卷", chapter: chooseChapter(themes, buffettThemeMap, "buffett-ch-01") };
  if (/芒格|模型|心理|格栅/.test(themes)) return { book: "芒格卷", chapter: chooseChapter(themes, mungerThemeMap, "munger-ch-02") };
  return { book: "巴菲特卷|芒格卷", chapter: "buffett-ch-15|munger-ch-16" };
}

const chapterPartMap = new Map(
  [...buffettChapters, ...mungerChapters].map((chapter) => [chapter.id, chapter.part]),
);

function partsForChapterIds(chapterIds) {
  return chapterIds
    .split("|")
    .map((id) => chapterPartMap.get(id))
    .filter(Boolean)
    .join("|");
}

function corePoint(row) {
  const theme = row["对应主题"].split("|")[0] || "背景材料";
  const raw = fs.readFileSync(path.join(ROOT, row["来源文件"]), "utf8")
    .replace(/^---[\s\S]*?---\s*/u, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\bwww\.[^\s)]+/gi, "")
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^[#>*+-]+\s*/gm, "")
    .replace(/[*_`|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const lead = raw.slice(0, 140).replace(/[，、；：]?[^\u4e00-\u9fffA-Za-z0-9）)]*$/u, "");
  return `主题“${theme}”：${lead || row["标题"]}`;
}

const coverage = classified.map((row) => {
  const relations = relationByPath.get(row["来源文件"]) ?? [];
  const exactAlternateRelation = relations.find((relation) => relation.role === "替代版本" && relation.type === "精确重复");
  const alternateRelation = relations.find((relation) => relation.role === "替代版本");
  const exactAlternate = Boolean(exactAlternateRelation);
  const independent = exactAlternate ? "否（正文完全重复）" : row["分级"] === "D" ? "是（信息增量有限但需保留）" : "是";
  let destination;
  let use;
  let reason = "不适用：已安排进入主书或配套层。";
  if (exactAlternate) {
    destination = "由主版本承接|完整资料典藏层";
    use = "不重复编入；保留文件、版本映射与校验价值";
    reason = `正文由${exactAlternateRelation.counterpart}承接。`;
  } else if (row["分级"] === "A") {
    destination = "主书核心正文|完整资料典藏层";
    use = "抽取观点原子、最佳证据片段和必要案例";
  } else if (row["分级"] === "B") {
    destination = "案例、侧栏或补充解释|完整资料典藏层";
    use = "按独立信息增量拆取案例、反例、边界或语境";
    reason = "不整篇进入主书：作为案例或补充层使用。";
  } else if (row["分级"] === "C") {
    destination = "年表、术语表、索引或附录|完整资料典藏层";
    use = "编入检索、背景、年表或附录，全文保留于典藏层";
    reason = "正文承载效率较低，但具有检索、背景或资料价值。";
  } else if (row["分级"] === "D") {
    destination = relations.length ? "由主版本承接|完整资料典藏层" : "完整资料典藏层|暂缓使用并记录明确原因";
    use = relations.length ? "由映射主版本承接，差异仍保留" : "暂不进入主书；保留全文并在相关章节证据筛选时复核";
    reason = relations.length ? relations.map((relation) => relation.decision).join("；") : `当前暂缓原因：${row["分级理由"]}`;
  } else {
    destination = "完整资料典藏层|暂缓使用并记录明确原因";
    use = "完成人工确认后再决定主书或配套层用途";
    reason = `待确认：${row["分级理由"]}`;
  }
  const placement = bookAndChapter(row);
  return {
    "文件路径": row["来源文件"],
    "所属人物": row["所属人物"],
    "原分级": row["分级"],
    "内容身份": row["内容身份"],
    "核心观点": corePoint(row),
    "是否具有独立信息增量": independent,
    "最终去向": destination,
    "对应书卷": placement.book,
    "对应篇章": placement.chapter,
    "对应篇级结构": partsForChapterIds(placement.chapter),
    "使用方式": use,
    "主版本或替代版本关系": relations.length ? relations.map((relation) => `${relation.group}|${relation.type}|${relation.role}|对应：${relation.counterpart}`).join("；") : "独立版本",
    "未进入主书的具体原因": reason,
    "是否由其他主版本承接": exactAlternate || (alternateRelation && row["分级"] === "D") ? "是" : "否",
    "是否进入侧栏": destination.includes("案例、侧栏") ? "是" : "否",
    "是否进入附录": destination.includes("年表、术语表、索引或附录") ? "是" : "否",
    "是否进入索引": destination.includes("年表、术语表、索引或附录") ? "是" : "是（来源/主题索引）",
    "是否进入资料典藏层": destination.includes("完整资料典藏层") ? "是" : "否",
    "编辑备注": `事实核验：${row["是否需要事实核验"]}；错误归因风险：${row["是否存在错误归因风险"]}；原主题：${row["对应主题"]}。`,
  };
});

const buffettTotal = buffettChapters.reduce((sum, chapter) => sum + chapter.chars, 0);
const mungerTotal = mungerChapters.reduce((sum, chapter) => sum + chapter.chars, 0);

for (const directory of [
  "buffett/outline",
  "buffett/manuscript",
  "munger/outline",
  "munger/manuscript",
  "shared",
]) {
  fs.mkdirSync(path.join(EDITORIAL, directory), { recursive: true });
}

fs.writeFileSync(
  path.join(EDITORIAL, "buffett/outline/巴菲特卷唯一融合三级目录.md"),
  outlineMarkdown(
    "《所有者的眼光——巴菲特论企业、资本与长期复利》",
    "所有者思维—企业质量—人与制度—资本配置—风险与复利",
    buffettChapters,
    buffettTotal,
    "以企业史和资本配置实践为叙事表面，十五章按一条资本循环推进；历史案例承担思想转折，不另设独立人物传记篇。",
    "buffett",
  ),
);
fs.writeFileSync(
  path.join(EDITORIAL, "munger/outline/芒格卷唯一融合三级目录.md"),
  outlineMarkdown(
    "《理性的格栅——芒格论思维模型、商业判断与人生智慧》",
    "知识格栅—判断工具—人类误判—商业实践—品格与人生",
    mungerChapters,
    mungerTotal,
    "采用五篇十六章的“认知工具箱—心理机制—现实应用”结构；最后一篇把合作、品格与人生收束为同一条责任线。模型身份和思想源流贯穿正文，避免套用巴菲特卷的企业史模板。",
    "munger",
  ),
);
fs.writeFileSync(
  path.join(EDITORIAL, "buffett/manuscript/巴菲特卷逐章证据规划.md"),
  evidenceMarkdown("《所有者的眼光》", buffettChapters),
);
fs.writeFileSync(
  path.join(EDITORIAL, "munger/manuscript/芒格卷逐章证据规划.md"),
  evidenceMarkdown("《理性的格栅》", mungerChapters),
);
writeCsv(path.join(EDITORIAL, "shared/内容去向与覆盖表_700篇.csv"), coverage);
fs.writeFileSync(path.join(EDITORIAL, "shared/内容去向与覆盖表_700篇.json"), JSON.stringify(coverage, null, 2) + "\n");
fs.writeFileSync(
  path.join(EDITORIAL, "shared/stage3-design-summary.json"),
  JSON.stringify({
    generatedAt: new Date().toISOString(),
    buffettChapters: buffettChapters.length,
    buffettParts: new Set(buffettChapters.map((chapter) => chapter.part)).size,
    buffettMainTextChars: buffettTotal,
    mungerChapters: mungerChapters.length,
    mungerParts: new Set(mungerChapters.map((chapter) => chapter.part)).size,
    mungerMainTextChars: mungerTotal,
    coverageRows: coverage.length,
    destinations: Object.fromEntries(
      [...new Set(coverage.flatMap((row) => row["最终去向"].split("|")))].map((destination) => [
        destination,
        coverage.filter((row) => row["最终去向"].split("|").includes(destination)).length,
      ]),
    ),
    gradeDWithArchive: coverage.filter((row) => row["原分级"] === "D" && row["是否进入资料典藏层"] === "是").length,
    carriedByMainVersion: coverage.filter((row) => row["是否由其他主版本承接"] === "是").length,
  }, null, 2) + "\n",
);

console.log(JSON.stringify({
  buffettChapters: buffettChapters.length,
  buffettMainTextChars: buffettTotal,
  mungerChapters: mungerChapters.length,
  mungerMainTextChars: mungerTotal,
  coverageRows: coverage.length,
}, null, 2));
