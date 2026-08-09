// book_common.typ — 巴芒两卷共用排版模板（A4 打印规格：210 × 297 mm）
#let brand = rgb("#AB1942")
#let paper = rgb("#F7F1E8")
#let ink = rgb("#4A3A32")
#let linecolor = rgb("#D8CFC0")
#let faint = rgb("#8A7A70")

// ---- 章末注释（endnote）：正文上标编号 + 每章「注释」区集中列出 ----
// 必须在顶层定义：body content（include 的文件）在文件作用域解析函数名。
// 正文引用处的编号标记，与脚注 mark 同一上标样式（右上角、不缩小）。
#let endnote_mark(n) = text(
  size: 7.2pt, weight: "semibold", fill: brand, baseline: -6pt, str(n),
)
// 章末注释列表：`#endnote_entries((1, [内容]), (2, [内容]), ...)`
// 条目排版：小字 + 放宽行距（leading 0.65em，10pt 下约 6.5pt 行内留白）。
// 相邻 block 的 above/below 在 Typst 中按 margin-collapse 取 max（而非相加），
// 原先 0.15em/0.1em 只产生 1.5pt 条目间距，视觉上与行内挤成一团；
// 现用 above 0.8em / below 0.7em → 条目间留白 ~8pt，比行内 6.5pt 略大，
// 既分清条目又不至于让注释区大幅变长。
#let endnote_entries(..items) = {
  set par(first-line-indent: 0em, leading: 0.65em, spacing: 0.5em)
  set text(size: 10pt, fill: ink)
  set block(above: 0.4em, below: 0.4em)
  for it in items.pos() {
    let (n, content) = it
    block(
      width: 100%,
      above: 0.8em,
      below: 0.7em,
      [
        #text(size: 9pt, weight: "semibold", fill: brand, str(n) + ".")
        #h(0.35em)
        #content
      ],
    )
  }
}

// ---- 篇首导读：并入篇首页设计页（居中窄栏、无首行缩进）----
#let part_lead(body) = {
  set par(first-line-indent: 0em, leading: 0.6em)
  align(center, block(
    width: 70%,
    inset: (top: 1.4cm),
    text(size: 11.5pt, fill: ink)[#body],
  ))
}

#let compose_book(
  book_title: none,    // 主书名（不含书名号）
  book_subtitle: none, // 副书名
  series: none,        // 系列名
  editor: none,        // 编者
  qr_path: none,       // 微信公众号二维码图片路径
  xhs_qr_path: none,   // 小红书主页二维码图片路径
  cover_img: none,     // 封面主题图
  tagline: none,       // 封面宣传句
  blurb: none,         // 背面简介
  quotes: none,        // 背面推荐语（数组）
  body: none,          // 正文 content
  toc_depth: 1,        // 目录深度
) = {
  let current_chap = state("current_chap", "")

  // ---------- 全局基础样式 ----------
  set page(
    paper: "a4",
    margin: (top: 2.6cm, bottom: 2.8cm, left: 2.9cm, right: 2.9cm),
  )
  set text(
    font: ("Songti SC", "STSong", "PingFang SC"),
    size: 13pt,
    lang: "zh",
    tracking: 0.02em,
  )
  // all: true 保证标题后 / 块后首段也缩进两格
  // 中文出版级标准：段间距 > 行间距（段内两行之间不应比两段之间还松散）
  //   · leading=1.15em ：行内相邻两行间约 15pt 行距空白（13pt 字行高 ≈ 1.9 倍，疏朗）
  //   · spacing=1.5em ：段落之间约 19.5pt 段间距空白，视觉上段落分明
  set par(justify: true, leading: 1.15em, spacing: 1.5em, first-line-indent: (amount: 2em, all: true))
  set figure(supplement: [图], numbering: "1", gap: 0.9em)

  // ---------- 封面（正面 · 无页码，全幅）A4 · 国际出版级主图比例 ----------
  // 国际投资类精装（Wiley Finance、Penguin Press、HBR Press）主图一般占封面垂直 30~38%，宽度 55~70%
  // 主图高度=9.8cm=34.8%页面总高，宽自动按SVG 6:5比例=11.8cm=56%封面宽
  // 目标y%：系列名9-10.5 · 书名17±1 · 副书名26±1 · 主图顶33-35 · 主图底67-69
  //           宣传语74±1 · 分隔线79 · 编者83±1 · 年份87±1
  {
    set page(numbering: none, margin: 0pt, fill: paper)
    set par(spacing: 0em, leading: 1em, first-line-indent: 0em)
    box(width: 100%, height: 100%, fill: paper, inset: (x: 2.9cm, y: 2.0cm))[
      #v(0.8cm)
      #align(center, text(size: 11.5pt, fill: brand, tracking: 0.3em)[#series])
      #v(2.2cm)
      #align(center, text(size: 38pt, weight: "bold", fill: brand)[#book_title])
      #v(1.6cm)
      #align(center, text(size: 14pt, fill: ink)[#book_subtitle])
      #v(2.0cm)
      #align(center, image(cover_img, height: 9.8cm))
      #v(1.5cm)
      #align(center, text(size: 11pt, fill: ink)[“#tagline”])
      #v(1.3cm)
      #align(center, line(length: 5cm, stroke: 0.6pt + linecolor))
      #v(1.45cm)
      #align(center, text(size: 10.5pt, fill: brand)[编者　#editor])
      #v(0.85cm)
      #align(center, text(size: 9pt, fill: faint)[二〇二六年])
    ]
  }

  pagebreak()

  // ---------- 版权页（罗马页码，从 I 起算） ----------
  set page(numbering: "I", number-align: center + bottom)
  counter(page).update(1)
  set par(first-line-indent: 0em, leading: 0.55em, spacing: 0.9em)
  align(center + horizon)[
    // ── 书名区：书名 + 副书名（正式版权页惯例，居中）──
    #text(size: 18pt, weight: "bold", fill: ink)[#book_title]
    #v(0.4em)
    #text(size: 10.5pt, fill: faint)[#book_subtitle]
    #v(2.8em)

    // ── 版本信息：条目式，全角空格对齐 ──
    #align(center, grid(
      columns: (auto, auto),
      column-gutter: 0.7em,
      row-gutter: 0.8em,
      text(size: 10pt)[编　者], text(size: 10pt)[#editor],
      text(size: 10pt)[系　列], text(size: 10pt)[#series],
      text(size: 10pt)[版　次], text(size: 10pt)[二〇二六年八月　初稿第 1 版],
      text(size: 10pt)[开　本], text(size: 10pt)[210 × 297 毫米（A4）],
    ))
    #v(2.6em)

    // ── 版权声明：两端对齐，小字 ──
    #align(center, block(width: 80%, text(size: 8.5pt, fill: gray)[
      本书为档案材料的整理与再编辑，为非商业出版物，与巴菲特、芒格本人及其名下机构均无隶属或授权关系。书中全部引文均标注原始出处，引文、录音与档案的版权归原作者及原权利人所有。本书无意复制、替代或侵犯任何正式出版物的权益。
    ]))
    #v(1.5em)
    #align(center, text(size: 9.5pt, weight: "bold", fill: ink)[版权所有 · 翻印必究])
    #v(2.6em)

    // ── 分隔线 ──
    #align(center, line(length: 5cm, stroke: 0.4pt + linecolor))
    #v(1.5em)

    // ── 关注与交流 ──
    #align(center, text(size: 10pt, weight: "bold", fill: brand)[关注与交流])
    #v(0.8em)
    #grid(
      columns: (1fr, 1fr),
      column-gutter: 2em,
      align(center)[
        #image(qr_path, height: 3.2cm)
        #v(0.4em)
        #text(size: 9pt, weight: "bold", fill: ink)[微信公众号 · 金家岭小胖]
        #v(0.15em)
        #text(size: 8pt, fill: faint)[个人思考与长期文章]
      ],
      align(center)[
        #image(xhs_qr_path, height: 3.2cm)
        #v(0.4em)
        #text(size: 9pt, weight: "bold", fill: ink)[小红书 · 金融街小胖]
        #v(0.15em)
        #text(size: 8pt, fill: faint)[xhslink.com/m/6OPiGk9H7w7]
      ],
    )
    #v(0.9em)
    #align(center, text(size: 9pt, fill: brand)[fulilab.com · 阅读原典，形成自己的判断])
  ]

  pagebreak()

  // ---------- 目录（罗马页码） ----------
  text(size: 20pt, weight: "bold", fill: brand)[目录]
  v(1em)
  // 目录条目行距：此处继承版权页的 par.spacing(0.9em)，条目间距仅 16.2pt 偏窄，
  // 用块间距撑宽至 ~22pt；title: none 去掉 outline 自动生成的黑色「目录」标题
  show outline.entry: set block(above: 1em, below: 0.6em)
  outline(depth: toc_depth, title: none)

  pagebreak()

  // ---------- 正文（阿拉伯页码，页眉：书名 + 当前章节名） ----------
  set page(
    numbering: "1",
    header: context {
      let chap = current_chap.get()
      block(
        width: 100%,
        [
          // 消除块间距：否则 grid 与 line 之间会被全局 par.spacing(1.5em)
          // 叠加成 ~22pt 的大空隙，页眉文字会离横线过远（实测 22.3pt）
          #set par(spacing: 0em)
          #grid(
            columns: (1fr, 1fr),
            align(left, text(size: 8.5pt, fill: faint)[#book_title]),
            align(right, text(size: 8.5pt, fill: faint)[#chap]),
          )
          #v(4pt)
          #line(length: 100%, stroke: 0.4pt + linecolor)
        ],
      )
    },
  )
  counter(page).update(1)

  // ---- 正文全局样式：出版级中文排版标准，段间距 > 行间距 ----
  //   正文 13pt · 行距 1.15em（≈15pt 行距空白，行高 ≈1.9 倍字高，疏朗不拥挤）
  //   段首空两格 · 段间距 1.5em（≈19.5pt 段间距，段落一眼能看出两段）
  set text(
    size: 13pt,
    font: ("Songti SC", "STSong", "PingFang SC"),
    fill: ink,
  )
  set par(
    first-line-indent: 2em,
    justify: true,
    spacing: 1.5em,
    leading: 1.15em,
  )
  // 避免极端窄容器里中文被挤成"叠字"

  set heading(numbering: none)

  // （脚注 layout 定义在下方「脚注区」块，保证与 quote/list/table 的 leading 标准统一）

  // 列表：行距与正文一致（1.15em），项目之间留出间隔
  show list: it => {
    set block(above: 0.7em, below: 0.7em, inset: (left: 0.5em))
    set list(indent: 1.4em, body-indent: 0em)
    set par(first-line-indent: 0em, leading: 1.15em, spacing: 0.8em)
    it
  }
  show enum: it => {
    set block(above: 0.7em, below: 0.7em, inset: (left: 0.5em))
    set enum(indent: 1.4em, body-indent: 0em, numbering: "1.")
    set par(first-line-indent: 0em, leading: 1.15em, spacing: 0.8em)
    it
  }

  // 表格：单元格 padding 加大，避免内容行挤叠；表头行加粗
  //   · 允许整张表跨页（breakable: true）——长表被强制挤在一页会把行高压扁，
  //     这是「文字重叠」的首要根因之一。
  //   · 网格线用 table 原生 stroke：旧版给每个单元格套独立 block 描边，
  //     同排单元格高度随内容不同（短列 40pt / 长列 108pt），横线错位成
  //     短线/虚线，且与 Typst 默认 1pt 黑色网格双重绘制。原生 stroke 单套
  //     连续网格，行线永远对齐；单元格留白改用原生 inset。
  //   · 线宽 0.75pt 而非 0.5pt：经像素级实测（Typst 0.15.1 输出 PDF），
  //     0.5pt 在 96–125dpi（100%–130% 缩放）下恰好落在亚像素边界，
  //     约 18%–28% 的表线渲染成淡虚线（同一行横线有的实、有的几乎不可见），
  //     用户看到的「表格全是短线/虚线」即由此而来；0.75pt 在 96/110/125dpi
  //     下实测 0% 低对比（0.7pt 在 96dpi 仍有 4% 落点在像素缝上）。
  //   · 重要：`set table(stroke: ...)` 必须放在顶层（与其他 set 同级）。
  //     Typst 0.15 中写在 `show table: it => {…}` 规则体内不会作用于 `it`
  //     已求值的表格，网格会退回默认黑色 1pt；且 pandoc 生成的
  //     `table.hline()`（默认 1pt 黑线）与浅色网格叠加会造成断续深线
  //     （已在脚本层删除 hline）。顶层 set 对正文全部表格统一生效。
  set table(stroke: 0.75pt + linecolor, inset: (x: 6pt, y: 5.5pt))
  show table: it => {
    set block(above: 0.9em, below: 0.9em, breakable: true, inset: 0pt)
    set par(first-line-indent: 0em, leading: 0.4em, spacing: 0.55em)
    set text(size: 10.5pt)
    it
  }
  show table.header: set text(weight: "bold", fill: ink, size: 11pt)

  // 图像 figure：上下间隙增大，breakable=false 防止图片被切；
  // 表格 figure 保持 breakable=true 允许跨页，避免整张大表被硬塞在一页导致内容挤叠
  show figure.where(kind: image): it => {
    set block(above: 1.2em, below: 1.2em, breakable: false)
    it
  }
  show figure.where(kind: table): it => {
    set block(above: 1.2em, below: 1.2em, breakable: true)
    it
  }
  show figure.where(kind: none): it => {
    set block(above: 1.2em, below: 1.2em, breakable: true)
    it
  }

  // 引用 / 档案证据 / 侧栏（blockquote）：
  // 文字格式与正文完全一致（13pt · 行距 1.15em · 段间距 1.5em），
  // 首段缩进与正文一致（每段首行空两格，all: true 保证标题后首段也缩进），
  // 仅用左边线 + 缩进做视觉区分，避免字号/行距与正文不一致。
  show quote.where(block: true): it => block(
    above: 1.5em,
    below: 1.5em,
    inset: (left: 1.2em, top: 0.8em, bottom: 0.8em, right: 0.8em),
    stroke: (left: 2.5pt + brand),
    {
      set par(first-line-indent: (amount: 2em, all: true), leading: 1.15em, spacing: 1.5em)
      set text(size: 13pt, fill: ink)
      it
    },
  )

  // 脚注：
  // · 隐藏 Typst 自动生成的 super 元素（正文自动 mark、页脚 entry 自动编号均为
  //   super 形式，且 Typst 0.15 的 #super 会把内容缩到 ~10% 而不可见）。
  //   全书无合法 super 用法（正文上标一律用 text(baseline:-6pt) 渲染），故安全。
  show super: none
  // · 正文脚注 mark：可见上标、右上角。用 text(baseline: -6pt) 而非 #super。
  //   之前误用 baseline 正值导致编号沉到右下角；现在负值上浮 6pt 为标准上标位。
  show footnote: it => {
    let loc = it.location()
    let m = counter(footnote).at(loc).first()
    [#text(size: 7.2pt, weight: "semibold", fill: brand, baseline: -6pt, str(m))]
  }
  show footnote.entry: it => {
    set par(first-line-indent: 0em, leading: 0.35em, spacing: 0.55em)
    set text(size: 9pt, fill: ink)
    let loc = it.location()
    let m = counter(footnote).at(loc).first()
    block(
      width: 100%,
      above: 0.25em,
      below: 0.15em,
      [
        #text(size: 8.5pt, weight: "semibold", fill: brand, str(m) + ".")
        #h(0.3em)
        #it
      ],
    )
  }

  // 篇 / 章标题
  show heading.where(level: 1): it => {
    let lab = it.label
    let is_part = lab != none and str(lab).contains("part")
    if (is_part) {
      current_chap.update(it.body)
      pagebreak(weak: true)
      block(height: 55%, width: 100%)[
        #v(1fr)
        #align(center, text(size: 26pt, weight: "bold", fill: brand)[#it.body])
        #v(1.2em)
        #align(center, text(size: 11pt, fill: faint)[#series])
        #v(1fr)
      ]
      // 篇首导读（#part_lead[...]）紧随其后渲染在篇首页下方，不再单独成页
    } else {
      current_chap.update(it.body)
      pagebreak(weak: true)
      set text(fill: brand, size: 18pt, weight: "bold")
      set block(above: 2em, below: 1.3em)
      it
    }
  }
  // 节标题：黑色加粗（章红·节黑·段黑），字号与前后间距拉开层级
  // 标题与下文间距 ≥ 段间距（1.5em≈19.5pt），避免标题紧贴段落
  show heading.where(level: 2): it => {
    set text(size: 16pt, weight: "bold")
    set block(above: 2.2em, below: 1.4em)
    it
  }
  show heading.where(level: 3): it => {
    set text(size: 14.5pt, weight: "bold")
    set block(above: 2.0em, below: 1.5em)
    it
  }

  // 图注（最后追加的精细化，保证与正文样式统一）
  show figure.caption: set par(first-line-indent: 0em, leading: 1.3em)
  show figure.caption: set text(size: 9.5pt, fill: faint)

  body

  // ---------- 末页（背面 · 无页码，全幅） ----------
  {
    set page(numbering: none, margin: 0pt, fill: paper)
    set par(spacing: 0em, leading: 1em, first-line-indent: 0em)
    box(width: 100%, height: 100%, fill: paper, inset: (x: 3.4cm, y: 2.4cm))[
      #v(1cm)
      #align(center, text(size: 17pt, weight: "bold", fill: brand)[#book_title])
      #v(0.4cm)
      #align(center, line(length: 4.6cm, stroke: 0.7pt + brand))
      #v(0.7cm)
      #block(width: 66%, text(size: 10.5pt, fill: ink)[#blurb])
      #v(0.7cm)
      #for q in quotes [
        #block(text(size: 10pt, fill: ink)[“#q”])
        #v(0.18cm)
      ]
      #v(1fr)
      #align(center, image(qr_path, height: 5.6cm))
      #v(0.45cm)
      #align(center, text(size: 10.5pt, fill: brand)[微信公众号 · 金家岭小胖])
      #v(0.12cm)
      #align(center, text(size: 9.5pt, fill: faint)[fulilab.com · 阅读原典，形成自己的判断])
    ]
  }
}
