// cover_design.typ — 封面设计方案（正面 · 书脊 · 背面 三视图 · A4 封面等比缩放）

#let brand = rgb("#AB1942")
#let paper = rgb("#F7F1E8")
#let ink = rgb("#4A3A32")
#let linecolor = rgb("#D8CFC0")
#let faint = rgb("#8A7A70")

// 正视图：与正书封面完全等比（A4 封面 29.7cm → 设计图 box 10.2cm，比例 = 0.343）
// 正书各 v/cm × 0.343 = 设计图内部各段 v/cm
#let front_view(
  title: none, subtitle: none, tagline: none, img: none, editor: none, series: none,
) = box(
  width: 7.2cm, height: 10.2cm,
  fill: paper, stroke: 0.5pt + linecolor, radius: 2pt,
  inset: (x: 0.9cm, y: 0.55cm),
)[
  #v(0.08cm)
  #align(center, text(size: 3.8pt, fill: brand, tracking: 0.3em)[#series])
  #v(0.4cm)
  #align(center, text(size: 11pt, weight: "bold", fill: brand)[#title])
  #v(0.2cm)
  #align(center, text(size: 4.2pt, fill: ink)[#subtitle])
  #v(0.35cm)
  #align(center, image(img, height: 3.4cm))
  #v(0.25cm)
  #align(center, text(size: 3.4pt, fill: ink)[“#tagline”])
  #v(0.15cm)
  #align(center, line(length: 1.4cm, stroke: 0.35pt + linecolor))
  #v(0.1cm)
  #align(center, text(size: 3.2pt, fill: brand)[编者　#editor])
  #v(0.05cm)
  #align(center, text(size: 2.9pt, fill: faint)[二〇二六年])
]

#let spine_view(title: none) = box(
  width: 1.0cm, height: 10.2cm,
  fill: brand, radius: 1pt,
)[
  #v(1fr)
  #for c in title [
    #align(center, text(size: 9pt, weight: "bold", fill: paper)[#c])
    #v(2pt)
  ]
  #v(0.4cm)
  #align(center, text(size: 4pt, fill: rgb("#E8CFC6"))[复利书房])
  #v(1fr)
]

#let back_view(title: none, blurb: none, quotes: none, qr: none) = {
  set par(justify: true)
  box(
  width: 7.2cm, height: 10.2cm,
  fill: paper, stroke: 0.5pt + linecolor, radius: 2pt,
  inset: (x: 1.2cm, y: 0.8cm),
)[
  #v(0.34cm)
  #align(center, text(size: 5.8pt, weight: "bold", fill: brand)[#title])
  #v(0.14cm)
  #align(center, line(length: 1.6cm, stroke: 0.4pt + brand))
  #v(0.24cm)
  #text(size: 3.6pt, fill: ink)[#blurb]
  #v(0.24cm)
  #for q in quotes [
    #block(text(size: 3.6pt, fill: ink)[“#q”])
    #v(0.07cm)
  ]
  #v(1fr)
  #align(center, image(qr, height: 1.9cm))
  #v(0.15cm)
  #align(center, text(size: 3.6pt, fill: brand)[微信公众号 · 金家岭小胖])
  #v(0.04cm)
  #align(center, text(size: 3.2pt, fill: faint)[fulilab.com · 阅读原典，形成自己的判断])
]
}

#let design_page(
  vol_label: none, title: none, subtitle: none, tagline: none,
  img: none, blurb: none, quotes: none,
) = {
  set page(width: 24cm, height: 15.5cm, margin: 1.1cm, fill: white)
  set text(font: ("Songti SC", "PingFang SC"), lang: "zh")
  set par(justify: true)

  text(size: 13pt, weight: "bold", fill: brand)[#vol_label —— 封面设计方案（正面 · 书脊 · 背面）]
  v(0.35cm)

  grid(
    columns: (7.2cm, 1.0cm, 7.2cm),
    column-gutter: 0.8cm,
    front_view(
      title: title, subtitle: subtitle, tagline: tagline, img: img,
      editor: "金融街小胖", series: "复利书房 · 巴芒经典",
    ),
    spine_view(title: title),
    back_view(title: title, blurb: blurb, quotes: quotes, qr: "../../public/qrcode.jpeg"),
  )

  v(0.3cm)
  grid(
    columns: (7.2cm, 1.0cm, 7.2cm),
    column-gutter: 0.8cm,
    align(center, text(size: 7.5pt, fill: gray)[封面 210 × 297 mm · 正面]),
    align(center, text(size: 7.5pt, fill: gray)[书脊 15 mm]),
    align(center, text(size: 7.5pt, fill: gray)[封面 210 × 297 mm · 背面]),
  )
}

// ===== 第 1 页：芒格卷 =====
#design_page(
  vol_label: "芒格文集",
  title: "芒格文集",
  subtitle: "芒格论思维模型、商业判断与人生智慧",
  tagline: "手里只有一把锤子的人，看什么都像钉子。",
  img: "munger_lattice.svg",
  blurb: "理性的格栅把芒格散落在十一场演讲与六十年问答里的思想，收拢成一套可以用的判断系统。全书十六章分五篇：先建知识格栅，再练判断工具，看清二十五种心理倾向如何让人犯错，最后落到商业实践与品格人生。铁锤人、双轨分析、检查清单、Lollapalooza 效应——每个概念都标明来源与思想源流，附二百三十二个思维模型对照表。",
  quotes: (
    "芒格没有讲过的地方，这本书不替他编。",
    "一个模型是一把锤子，一套模型才是一张网。",
    "判断这件事，多数人输在手里只有一件工具。",
  ),
)

// ===== 第 2 页：巴菲特卷 =====
#design_page(
  vol_label: "巴菲特文集",
  title: "巴菲特文集",
  subtitle: "巴菲特论企业、资本与长期复利",
  tagline: "以所有者的眼光看企业，以长期的尺度算价值。",
  img: "buffett_curve.svg",
  blurb: "所有者的眼光从巴菲特六十余年致股东信与演讲出发，只回答一个问题：买入一只股票，你真正买到的是什么。全书十五章按一条资本循环推进——所有者思维、企业质量、人与制度、资本配置、风险与复利。喜诗糖果、GEICO、可口可乐、比亚迪……书里的案例都来自伯克希尔自己的历史，讲清楚价值怎么衡量、护城河长什么样、钱该往哪里放。",
  quotes: (
    "书里的每一句话，都能在原始股东信里找到出处。",
    "三十年的股东信，讲一个最基本的问题：一家企业值多少钱。",
    "不教你怎么预测市场，只教你怎么看懂一家公司。",
  ),
)
