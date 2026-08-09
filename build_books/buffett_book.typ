// buffett_book.typ — 巴菲特卷《巴菲特文集》入口
#import "book_common.typ": compose_book

#compose_book(
  book_title: "巴菲特文集",
  book_subtitle: "合伙人信与伯克希尔致股东信原文汇编",
  series: "复利书房 · 巴芒经典",
  editor: "金融街小胖",
  qr_path: "../public/qrcode.jpeg",
  xhs_qr_path: "../public/xhs-qr.png",
  cover_img: "cover/buffett_curve.svg",
  tagline: "阅读原典，形成自己的判断。",
  blurb: "本卷按时间顺序汇编巴菲特合伙公司时期致合伙人信，以及伯克希尔·哈撒韦历年致股东信。正文直接来自仓库中的原始材料，不增加章导读、本章小结或编者解读。",
  quotes: (
    "合伙人信：1956—1969",
    "伯克希尔致股东信：1965年起",
    "正文仅作筛选、排序与版式转换",
  ),
  toc_depth: 2,
  body: [
    #include "buffett_body.typ"
  ],
)
