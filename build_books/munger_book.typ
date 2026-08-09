// munger_book.typ — 芒格卷《芒格文集》入口
#import "book_common.typ": compose_book

#compose_book(
  book_title: "芒格文集",
  book_subtitle: "Wesco Financial 致股东信原文汇编",
  series: "复利书房 · 巴芒经典",
  editor: "金融街小胖",
  qr_path: "../public/qrcode.jpeg",
  xhs_qr_path: "../public/xhs-qr.png",
  cover_img: "cover/munger_lattice.svg",
  tagline: "阅读原典，形成自己的判断。",
  blurb: "本卷按时间顺序汇编查理·芒格签署的 Wesco Financial 致股东信英文原文。正文直接来自伯克希尔官方 Wesco 档案提取稿，不增加章导读、本章小结或编者解读。",
  quotes: (
    "Wesco Financial 致股东信：1997—2009",
    "英文原文，保留原始数据与表述",
    "正文仅作筛选、排序与版式转换",
  ),
  toc_depth: 1,
  body: [
    #include "munger_body.typ"
  ],
)
