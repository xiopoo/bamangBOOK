// buffett_book.typ — 巴菲特卷《巴菲特文集》入口
#import "book_common.typ": compose_book, endnote_mark, endnote_entries, part_lead

#compose_book(
  book_title: "巴菲特文集",
  book_subtitle: "巴菲特论企业、资本与长期复利",
  series: "复利书房 · 巴芒经典",
  editor: "金融街小胖",
  qr_path: "../public/qrcode.jpeg",
  xhs_qr_path: "../public/xhs-qr.png",
  cover_img: "cover/buffett_curve.svg",
  tagline: "以所有者的眼光看企业，以长期的尺度算价值。",
  blurb: "巴菲特文集从巴菲特六十余年致股东信与演讲出发，只回答一个问题：买入一只股票，你真正买到的是什么。全书十五章按一条资本循环推进——所有者思维、企业质量、人与制度、资本配置、风险与复利。喜诗糖果、GEICO、可口可乐、比亚迪……书里的案例都来自伯克希尔自己的历史，讲清楚价值怎么衡量、护城河长什么样、钱该往哪里放。",
  quotes: (
    "书里的每一句话，都能在原始股东信里找到出处。",
    "三十年的股东信，讲一个最基本的问题：一家企业值多少钱。",
    "不教你怎么预测市场，只教你怎么看懂一家公司。",
  ),
  toc_depth: 2,
  body: [
    #include "buffett_body.typ"
  ],
)
