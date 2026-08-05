import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const buffettDir = path.join(root, "buffett/illustrations/sketches");
const mungerDir = path.join(root, "munger/illustrations/sketches");
const buffettRefinedDir = path.join(root, "buffett/illustrations/refined");
const mungerRefinedDir = path.join(root, "munger/illustrations/refined");
fs.mkdirSync(buffettDir, { recursive: true });
fs.mkdirSync(mungerDir, { recursive: true });
fs.mkdirSync(buffettRefinedDir, { recursive: true });
fs.mkdirSync(mungerRefinedDir, { recursive: true });

const style = `
  <style>
    text { font-family: "PingFang SC", "Noto Sans CJK SC", sans-serif; fill: #111; }
    .title { font-size: 28px; font-weight: 700; }
    .subtitle { font-size: 15px; fill: #555; }
    .label { font-size: 17px; font-weight: 600; }
    .small { font-size: 14px; }
    .tiny { font-size: 12px; fill: #555; }
    .box { fill: #fff; stroke: #111; stroke-width: 2; }
    .soft { fill: #f2f2f2; stroke: #111; stroke-width: 1.5; }
    .line { fill: none; stroke: #111; stroke-width: 2; }
    .dash { fill: none; stroke: #666; stroke-width: 1.5; stroke-dasharray: 7 6; }
  </style>`;

const defs = `
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#111"/>
    </marker>
    <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="8" stroke="#777" stroke-width="2"/>
    </pattern>
  </defs>`;

function svg(width, height, title, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${title}</title>
  <desc id="desc">黑白结构草图，仅用于出版前信息关系确认。</desc>
  ${defs}
  ${style}
  <rect width="${width}" height="${height}" fill="#fff"/>
  ${body}
  <text x="${width - 24}" y="${height - 18}" text-anchor="end" class="tiny">结构草图｜非正式插图</text>
</svg>
`;
}

const sketches = [
  {
    dir: buffettDir,
    file: "BF-06-01_两种观察方式_黑白结构草图.svg",
    content: svg(1200, 800, "BF-06-01 两种观察方式", `
      <text x="60" y="60" class="title">同一笔收购的两种观察方式</text>
      <text x="60" y="88" class="subtitle">1972年喜诗糖果｜账面资产视角 vs. 企业经济视角</text>
      <rect x="60" y="125" width="500" height="560" rx="8" class="soft"/>
      <rect x="640" y="125" width="500" height="560" rx="8" class="box"/>
      <text x="310" y="175" text-anchor="middle" class="label">账面资产视角</text>
      <text x="890" y="175" text-anchor="middle" class="label">企业经济视角</text>
      <rect x="135" y="220" width="350" height="78" rx="6" class="box"/>
      <text x="310" y="251" text-anchor="middle" class="small">净有形资产：约800万美元</text>
      <text x="310" y="277" text-anchor="middle" class="tiny">看得见、可核算</text>
      <rect x="135" y="360" width="350" height="78" rx="6" class="box"/>
      <text x="310" y="391" text-anchor="middle" class="small">收购价格：约2500万美元</text>
      <text x="310" y="417" text-anchor="middle" class="tiny">“三倍于有形资产”造成心理阻力</text>
      <line x1="310" y1="300" x2="310" y2="352" class="line" marker-end="url(#arrow)"/>
      <text x="310" y="500" text-anchor="middle" class="label">疑问：溢价是否合理？</text>
      <g>
        <text x="890" y="208" text-anchor="middle" class="tiny">经济机制链（箭头表示作用方向）</text>
        <rect x="755" y="225" width="270" height="60" rx="30" class="soft"/>
        <rect x="755" y="315" width="270" height="60" rx="30" class="soft"/>
        <rect x="755" y="405" width="270" height="60" rx="30" class="soft"/>
        <rect x="755" y="495" width="270" height="60" rx="30" class="soft"/>
        <text x="890" y="262" text-anchor="middle" class="small">客户信任</text>
        <text x="890" y="352" text-anchor="middle" class="small">定价权</text>
        <text x="890" y="442" text-anchor="middle" class="small">较低增量资本需求</text>
        <text x="890" y="532" text-anchor="middle" class="small">可分配现金</text>
        <line x1="890" y1="287" x2="890" y2="307" class="line" marker-end="url(#arrow)"/>
        <line x1="890" y1="377" x2="890" y2="397" class="line" marker-end="url(#arrow)"/>
        <line x1="890" y1="467" x2="890" y2="487" class="line" marker-end="url(#arrow)"/>
      </g>
      <text x="890" y="610" text-anchor="middle" class="label">检验：未来现金能否持续？</text>
      <text x="890" y="640" text-anchor="middle" class="tiny">持续超额回报能力构成经济商誉</text>
      <line x1="580" y1="405" x2="620" y2="405" class="line" marker-end="url(#arrow)"/>
      <text x="600" y="385" text-anchor="middle" class="tiny">转换</text>
    `),
  },
  {
    dir: buffettDir,
    file: "BF-06-02_通胀资本需求_黑白结构草图.svg",
    content: svg(1280, 720, "BF-06-02 通胀资本需求", `
      <text x="60" y="58" class="title">相同利润，不同的通胀资本需求</text>
      <text x="60" y="86" class="subtitle">情境：物价水平与名义利润翻倍｜数字采用1983年股东信的简化示例</text>
      <line x1="110" y1="610" x2="1170" y2="610" class="line"/>
      <g>
        <text x="340" y="135" text-anchor="middle" class="label">喜诗式企业</text>
        <rect x="235" y="480" width="210" height="130" fill="url(#hatch)" stroke="#111" stroke-width="2"/>
        <text x="340" y="545" text-anchor="middle" class="label">800万美元</text>
        <text x="340" y="635" text-anchor="middle" class="small">需新增的维持性资本</text>
        <rect x="485" y="250" width="150" height="150" rx="75" class="box"/>
        <text x="560" y="315" text-anchor="middle" class="label">利润</text>
        <text x="560" y="345" text-anchor="middle" class="small">400万美元</text>
        <line x1="475" y1="470" x2="520" y2="405" class="line" marker-end="url(#arrow)"/>
        <text x="560" y="220" text-anchor="middle" class="tiny">翻倍后的年利润（两家相同）</text>
      </g>
      <line x1="900" y1="130" x2="900" y2="660" class="dash"/>
      <g>
        <text x="1040" y="135" text-anchor="middle" class="label">重资产企业</text>
        <rect x="945" y="320" width="190" height="290" fill="url(#hatch)" stroke="#111" stroke-width="2"/>
        <text x="1040" y="465" text-anchor="middle" class="label">1800万美元</text>
        <text x="1040" y="635" text-anchor="middle" class="small">需新增的维持性资本</text>
        <text x="1040" y="220" text-anchor="middle" class="small">翻倍后的年利润</text>
        <text x="1040" y="248" text-anchor="middle" class="label">400万美元</text>
        <line x1="1040" y1="265" x2="1040" y2="310" class="line" marker-end="url(#arrow)"/>
        <text x="1040" y="690" text-anchor="middle" class="tiny">原文比较累计新增资本，不给出单期可分配现金额</text>
      </g>
    `),
  },
  {
    dir: buffettDir,
    file: "BF-06-03_资本循环_黑白结构草图.svg",
    content: svg(1000, 750, "BF-06-03 喜诗与伯克希尔资本循环", `
      <text x="50" y="58" class="title">喜诗与伯克希尔的资本循环</text>
      <text x="50" y="86" class="subtitle">经营自主不等于资本永久留在原业务</text>
      <rect x="350" y="130" width="300" height="90" rx="10" class="box"/>
      <text x="500" y="170" text-anchor="middle" class="label">喜诗：优质经营资产</text>
      <text x="500" y="196" text-anchor="middle" class="tiny">客户信任｜定价权｜低增量资本</text>
      <rect x="680" y="330" width="260" height="90" rx="10" class="soft"/>
      <text x="810" y="370" text-anchor="middle" class="label">多余现金释放</text>
      <text x="810" y="396" text-anchor="middle" class="tiny">不强迫低回报扩张</text>
      <rect x="350" y="535" width="300" height="100" rx="10" class="box"/>
      <text x="500" y="575" text-anchor="middle" class="label">伯克希尔资本配置</text>
      <text x="500" y="602" text-anchor="middle" class="tiny">收购｜证券｜回购｜现金储备</text>
      <rect x="60" y="330" width="260" height="90" rx="10" class="soft"/>
      <text x="190" y="370" text-anchor="middle" class="label">新的优质资产</text>
      <text x="190" y="396" text-anchor="middle" class="tiny">产生下一轮可分配现金</text>
      <path d="M650 180 C820 190 860 250 820 322" class="line" marker-end="url(#arrow)"/>
      <path d="M800 425 C770 545 700 580 660 580" class="line" marker-end="url(#arrow)"/>
      <path d="M340 585 C185 575 140 500 175 428" class="line" marker-end="url(#arrow)"/>
      <path d="M200 322 C225 210 295 175 340 175" class="line" marker-end="url(#arrow)"/>
      <text x="735" y="215" class="small">可分配现金</text>
      <text x="725" y="520" class="small">比较机会成本</text>
      <text x="185" y="530" class="small">重新投入</text>
      <text x="210" y="220" class="small">利润回流</text>
      <rect x="340" y="300" width="320" height="120" rx="60" class="soft"/>
      <text x="500" y="348" text-anchor="middle" class="label">复利不只发生在企业内部</text>
      <text x="500" y="378" text-anchor="middle" class="small">还发生在企业之间</text>
    `),
  },
  {
    dir: mungerDir,
    file: "MG-02-01_从孤立知识到格栅_黑白结构草图.svg",
    content: svg(1280, 720, "MG-02-01 从孤立知识到知识格栅", `
      <text x="55" y="58" class="title">从孤立知识到可更新的知识格栅</text>
      <text x="55" y="86" class="subtitle">多元不是堆积；连接必须说明因果、反馈、约束与反证</text>
      <g>
        <text x="205" y="145" text-anchor="middle" class="label">① 孤立事实</text>
        <circle cx="115" cy="245" r="38" class="soft"/><circle cx="260" cy="220" r="38" class="soft"/>
        <circle cx="180" cy="360" r="38" class="soft"/><circle cx="310" cy="355" r="38" class="soft"/>
        <text x="115" y="251" text-anchor="middle" class="small">数学</text>
        <text x="260" y="226" text-anchor="middle" class="small">会计</text>
        <text x="180" y="366" text-anchor="middle" class="small">心理</text>
        <text x="310" y="361" text-anchor="middle" class="small">经济</text>
        <text x="205" y="480" text-anchor="middle" class="tiny">记住名称，但无法迁移</text>
      </g>
      <line x1="385" y1="320" x2="465" y2="320" class="line" marker-end="url(#arrow)"/>
      <g>
        <text x="640" y="145" text-anchor="middle" class="label">② 建立连接</text>
        <circle cx="545" cy="240" r="38" class="box"/><circle cx="720" cy="220" r="38" class="box"/>
        <circle cx="535" cy="400" r="38" class="box"/><circle cx="735" cy="405" r="38" class="box"/>
        <circle cx="640" cy="320" r="45" class="soft"/>
        <text x="545" y="246" text-anchor="middle" class="small">数量</text>
        <text x="720" y="226" text-anchor="middle" class="small">会计</text>
        <text x="535" y="406" text-anchor="middle" class="small">工程</text>
        <text x="735" y="411" text-anchor="middle" class="small">心理</text>
        <text x="640" y="326" text-anchor="middle" class="small">问题</text>
        <path d="M579 259 L602 290 M685 246 L677 284 M570 385 L605 350 M700 384 L676 355 M575 247 L684 227 M570 395 L698 402" class="line"/>
        <text x="640" y="480" text-anchor="middle" class="tiny">因果｜反馈｜约束｜反证</text>
      </g>
      <line x1="810" y1="320" x2="890" y2="320" class="line" marker-end="url(#arrow)"/>
      <g>
        <text x="1060" y="145" text-anchor="middle" class="label">③ 判断与更新</text>
        <rect x="940" y="205" width="240" height="70" rx="8" class="box"/>
        <rect x="940" y="325" width="240" height="70" rx="8" class="soft"/>
        <rect x="940" y="445" width="240" height="70" rx="8" class="box"/>
        <text x="1060" y="247" text-anchor="middle" class="small">形成可检验判断</text>
        <text x="1060" y="367" text-anchor="middle" class="small">观察结果与反例</text>
        <text x="1060" y="487" text-anchor="middle" class="small">修正连接或暂缓</text>
        <line x1="1060" y1="278" x2="1060" y2="317" class="line" marker-end="url(#arrow)"/>
        <line x1="1060" y1="398" x2="1060" y2="437" class="line" marker-end="url(#arrow)"/>
      </g>
    `),
  },
  {
    dir: mungerDir,
    file: "MG-02-02_五学科检查_黑白结构草图.svg",
    content: svg(900, 900, "MG-02-02 同一企业问题的五学科检查", `
      <text x="45" y="58" class="title">同一企业问题的五学科检查</text>
      <text x="45" y="86" class="subtitle">模型多为通用知识；芒格的贡献在组织、连接与反复应用</text>
      <circle cx="450" cy="450" r="105" class="soft"/>
      <text x="450" y="436" text-anchor="middle" class="label">这是一家</text>
      <text x="450" y="470" text-anchor="middle" class="label">好企业吗？</text>
      <g>
        <rect x="345" y="135" width="210" height="90" rx="10" class="box"/>
        <text x="450" y="170" text-anchor="middle" class="label">数量</text>
        <text x="450" y="198" text-anchor="middle" class="tiny">概率与基准率如何？</text>
        <rect x="635" y="310" width="210" height="90" rx="10" class="box"/>
        <text x="740" y="345" text-anchor="middle" class="label">会计</text>
        <text x="740" y="373" text-anchor="middle" class="tiny">数字等于经济现实吗？</text>
        <rect x="555" y="650" width="240" height="90" rx="10" class="box"/>
        <text x="675" y="685" text-anchor="middle" class="label">微观经济学</text>
        <text x="675" y="713" text-anchor="middle" class="tiny">优势为何难以复制？</text>
        <rect x="105" y="650" width="210" height="90" rx="10" class="box"/>
        <text x="210" y="685" text-anchor="middle" class="label">心理学</text>
        <text x="210" y="713" text-anchor="middle" class="tiny">谁被激励或偏误推动？</text>
        <rect x="55" y="310" width="210" height="90" rx="10" class="box"/>
        <text x="160" y="345" text-anchor="middle" class="label">工程</text>
        <text x="160" y="373" text-anchor="middle" class="tiny">断裂点与冗余在哪？</text>
      </g>
      <line x1="450" y1="235" x2="450" y2="335" class="line" marker-end="url(#arrow)"/>
      <line x1="625" y1="375" x2="550" y2="415" class="line" marker-end="url(#arrow)"/>
      <line x1="575" y1="650" x2="505" y2="548" class="line" marker-end="url(#arrow)"/>
      <line x1="325" y1="650" x2="395" y2="548" class="line" marker-end="url(#arrow)"/>
      <line x1="275" y1="375" x2="350" y2="415" class="line" marker-end="url(#arrow)"/>
      <circle cx="450" cy="450" r="170" class="dash"/>
    `),
  },
  {
    dir: mungerDir,
    file: "MG-02-03_格栅更新循环_黑白结构草图.svg",
    content: svg(1000, 750, "MG-02-03 格栅的更新循环", `
      <text x="50" y="58" class="title">格栅的更新循环</text>
      <text x="50" y="86" class="subtitle">学习不是收藏模型，而是让连接接受结果与反证</text>
      <g>
        <rect x="405" y="115" width="190" height="70" rx="35" class="box"/>
        <rect x="690" y="235" width="190" height="70" rx="35" class="soft"/>
        <rect x="690" y="455" width="190" height="70" rx="35" class="box"/>
        <rect x="405" y="575" width="190" height="70" rx="35" class="soft"/>
        <rect x="120" y="455" width="190" height="70" rx="35" class="box"/>
        <rect x="120" y="235" width="190" height="70" rx="35" class="soft"/>
        <text x="500" y="158" text-anchor="middle" class="label">学习</text>
        <text x="785" y="278" text-anchor="middle" class="label">连接</text>
        <text x="785" y="488" text-anchor="middle" class="label">应用</text>
        <text x="785" y="510" text-anchor="middle" class="tiny">形成判断</text>
        <text x="500" y="618" text-anchor="middle" class="label">观察结果</text>
        <text x="215" y="498" text-anchor="middle" class="label">反证</text>
        <text x="215" y="278" text-anchor="middle" class="label">更新</text>
        <path d="M600 150 C690 160 745 185 775 225" class="line" marker-end="url(#arrow)"/>
        <path d="M835 310 C870 355 870 410 835 445" class="line" marker-end="url(#arrow)"/>
        <path d="M690 505 C635 570 605 590 600 590" class="line" marker-end="url(#arrow)"/>
        <path d="M400 610 C320 595 260 565 230 535" class="line" marker-end="url(#arrow)"/>
        <path d="M165 450 C130 405 130 355 165 315" class="line" marker-end="url(#arrow)"/>
        <path d="M310 245 C355 195 390 165 400 160" class="line" marker-end="url(#arrow)"/>
      </g>
      <rect x="385" y="330" width="230" height="105" rx="12" class="box"/>
      <text x="500" y="366" text-anchor="middle" class="label">证据不足</text>
      <text x="500" y="395" text-anchor="middle" class="small">暂缓判断／“太难”</text>
      <text x="500" y="420" text-anchor="middle" class="tiny">补充证据后重新进入循环</text>
      <path d="M685 485 C640 465 615 430 610 410" class="dash" marker-end="url(#arrow)"/>
      <path d="M430 330 C400 275 410 220 455 190" class="dash" marker-end="url(#arrow)"/>
    `),
  },
];

for (const sketch of sketches) {
  fs.writeFileSync(path.join(sketch.dir, sketch.file), sketch.content);
}

function brandify(content) {
  return content
    .replaceAll(".line { fill: none; stroke: #111;", ".line { fill: none; stroke: #AB1942;")
    .replaceAll('<path d="M0,0 L0,6 L9,3 z" fill="#111"/>', '<path d="M0,0 L0,6 L9,3 z" fill="#AB1942"/>')
    .replace(/(<rect width="[^"]+" height="[^"]+" fill="#fff"\/>)/u, '$1\n  <rect x="0" y="0" width="12" height="100%" fill="#AB1942"/>')
    .replace("结构草图｜非正式插图", "样章精绘｜品牌色版本");
}

const manifest = [];
for (const sketch of sketches) {
  const bookRefinedDir = sketch.dir === buffettDir ? buffettRefinedDir : mungerRefinedDir;
  const refinedName = sketch.file.replace("_黑白结构草图.svg", "_品牌色精绘.svg");
  fs.writeFileSync(path.join(bookRefinedDir, refinedName), brandify(sketch.content));
  manifest.push({
    file: path.relative(root, path.join(sketch.dir, sketch.file)),
    format: "SVG",
    palette: "black-white-gray",
    status: "按确认意见修订并通过复核",
  });
  manifest.push({
    file: path.relative(root, path.join(bookRefinedDir, refinedName)),
    format: "SVG",
    palette: "#AB1942-black-white-gray",
    status: "样章品牌色精绘版本",
  });
}
fs.writeFileSync(
  path.join(root, "shared/黑白结构草图清单.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(JSON.stringify({ sketches: manifest.length, files: manifest.map((item) => item.file) }, null, 2));
