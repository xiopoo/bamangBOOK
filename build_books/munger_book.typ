// munger_book.typ — 芒格卷《理性的格栅》入口
#import "book_common.typ": compose_book, endnote_mark, endnote_entries, part_lead

#compose_book(
  book_title: "理性的格栅",
  book_subtitle: "芒格论思维模型、商业判断与人生智慧",
  series: "复利书房 · 巴芒经典",
  editor: "金融街小胖",
  qr_path: "../public/qrcode.jpeg",
  xhs_qr_path: "../public/xhs-qr.png",
  cover_img: "cover/munger_lattice.svg",
  tagline: "手里只有一把锤子的人，看什么都像钉子。",
  blurb: "理性的格栅把芒格散落在十一场演讲与六十年问答里的思想，收拢成一套可以用的判断系统。全书十六章分五篇：先建知识格栅，再练判断工具，看清二十五种心理倾向如何让人犯错，最后落到商业实践与品格人生。铁锤人、双轨分析、检查清单、Lollapalooza 效应——每个概念都标明来源与思想源流，附二百三十二个思维模型对照表。",
  quotes: (
    "芒格没有讲过的地方，这本书不替他编。",
    "一个模型是一把锤子，一套模型才是一张网。",
    "判断这件事，多数人输在手里只有一件工具。",
  ),
  toc_depth: 1,
  body: [
    #include "munger_body.typ"
  ],
)
