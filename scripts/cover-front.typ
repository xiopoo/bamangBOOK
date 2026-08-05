// cover-front.typ — 正式书封正面（竖版 7.2cm × 10.2cm ≈ 1:1.42），供 EPUB 封面使用
// 复用 build_books/cover/cover_design.typ 的视觉规范（品牌色 AB1942 / 米白纸面）

#let brand = rgb("#AB1942")
#let paper = rgb("#F7F1E8")
#let ink = rgb("#4A3A32")
#let linecolor = rgb("#D8CFC0")
#let faint = rgb("#8A7A70")

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

#let vol = sys.inputs.at("vol", default: "buffett")
#let (title, subtitle, tagline, img, editor, series) = if vol == "munger" {
  (
    "理性的格栅",
    "芒格论思维模型、商业判断与人生智慧",
    "手里只有一把锤子的人，看什么都像钉子。",
    "munger_lattice.svg",
    "金家岭小胖",
    "复利书房 · 巴芒经典",
  )
} else {
  (
    "所有者的眼光",
    "巴菲特论企业、资本与长期复利",
    "以所有者的眼光看企业，以长期的尺度算价值。",
    "buffett_curve.svg",
    "金家岭小胖",
    "复利书房 · 巴芒经典",
  )
}

#set page(width: 7.2cm, height: 10.2cm, margin: 0pt, fill: paper)
#set text(font: ("Songti SC", "PingFang SC"), lang: "zh")

#front_view(
  title: title, subtitle: subtitle, tagline: tagline,
  img: img, editor: editor, series: series,
)
