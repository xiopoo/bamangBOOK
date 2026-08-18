// front_render.typ — 封面设计方案（正面视图）单页渲染，用于网页电子书封面
// 与 build_books/cover/封面设计方案.pdf 的 front_view 完全同源（无设计图边框）
// 用法：
//   typst compile --root . --format png --ppi 443 build_books/cover/front_render.typ <out.png> \
//     --input title=... --input subtitle=... --input tagline=... --input img=...

#let brand = rgb("#AB1942")
#let paper = rgb("#F7F1E8")
#let ink = rgb("#4A3A32")
#let linecolor = rgb("#D8CFC0")
#let faint = rgb("#8A7A70")

#let front_view(
  title: none, subtitle: none, tagline: none, img: none, editor: none, series: none,
) = box(
  width: 7.2cm, height: 10.2cm,
  fill: paper,
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

#let title = sys.inputs.at("title", default: "")
#let subtitle = sys.inputs.at("subtitle", default: "")
#let tagline = sys.inputs.at("tagline", default: "")
#let img = sys.inputs.at("img", default: "")
#let editor = sys.inputs.at("editor", default: "金融街小胖")
#let series = sys.inputs.at("series", default: "复利书房 · 巴芒经典")

#page(width: 7.2cm, height: 10.2cm, margin: 0pt)[
  #front_view(title: title, subtitle: subtitle, tagline: tagline, img: img, editor: editor, series: series)
]
