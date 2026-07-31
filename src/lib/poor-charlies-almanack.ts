import { readFileSync } from 'fs'
import path from 'path'

export type AlmanackSectionKind = '中文译稿' | '原书演讲' | '延伸阅读'

export interface AlmanackSection {
  slug: string
  part: string
  number: string
  title: string
  subtitle?: string
  year?: number
  kind: AlmanackSectionKind
  sourceFile: string
  sourceNote: string
  officialUrl: string
}

const PROJECT_DIR = process.cwd()

export const almanackSections: AlmanackSection[] = [
  {
    slug: 'forewords',
    part: '卷首',
    number: '00',
    title: '序言、回应与全书导读',
    subtitle: '约翰·科利森、沃伦·巴菲特、查理·芒格与彼得·考夫曼',
    kind: '中文译稿',
    sourceFile: 'poor-charlies-almanack/poor-charlies-almanack-forewords.md',
    sourceNote: '依据文件夹中的 Stripe Press 英文稿翻译，并统一采用本站人名与术语译法。',
    officialUrl: 'https://www.stripe.press/poor-charlies-almanack/forewords',
  },
  {
    slug: 'chapter-one',
    part: '第一章',
    number: '01',
    title: '查理·芒格肖像',
    subtitle: '从奥马哈少年到伯克希尔副董事长',
    kind: '中文译稿',
    sourceFile: 'poor-charlies-almanack/poor-charlies-almanack-chapter-one.md',
    sourceNote: '依据 Michael Broggie 的英文传记章节翻译，并统一采用本站人名与术语译法。',
    officialUrl: 'https://www.stripe.press/poor-charlies-almanack/chapter-one',
  },
  {
    slug: 'chapter-two',
    part: '第二章',
    number: '02',
    title: '孩子们记忆中的查理',
    subtitle: '家庭生活里的原则、耐心与身教',
    kind: '中文译稿',
    sourceFile: 'poor-charlies-almanack/poor-charlies-almanack-chapter-two.md',
    sourceNote: '依据文件夹中的英文家庭回忆章节翻译，并统一采用本站译法。',
    officialUrl: 'https://www.stripe.press/poor-charlies-almanack/chapter-two',
  },
  {
    slug: 'chapter-three',
    part: '第三章',
    number: '03',
    title: '芒格的生活、学习与决策方法',
    subtitle: '多元思维模型、逆向思考与终身学习',
    kind: '中文译稿',
    sourceFile: 'poor-charlies-almanack/poor-charlies-almanack-chapter-three.md',
    sourceNote: '依据 Peter D. Kaufman 的英文方法论章节翻译，并与站内思维模型术语统一。',
    officialUrl: 'https://www.stripe.press/poor-charlies-almanack/chapter-three',
  },
  {
    slug: 'talk-one',
    part: '第四章 · 十一讲',
    number: '04-01',
    title: '如何保证自己过上痛苦的生活',
    subtitle: '哈佛中学毕业典礼演讲',
    year: 1986,
    kind: '原书演讲',
    sourceFile: 'poor-charlies-almanack/poor-charlies-almanack-talk-one.md',
    sourceNote: '站内既有中文译稿，统一纳入本书阅读顺序。',
    officialUrl: 'https://www.stripe.press/poor-charlies-almanack/talk-one',
  },
  {
    slug: 'talk-two',
    part: '第四章 · 十一讲',
    number: '04-02',
    title: '论基本的、普世的智慧',
    subtitle: '南加州大学商学院演讲',
    year: 1994,
    kind: '原书演讲',
    sourceFile: 'poor-charlies-almanack/poor-charlies-almanack-talk-two.md',
    sourceNote: '站内既有中文译稿，统一纳入本书阅读顺序。',
    officialUrl: 'https://www.stripe.press/poor-charlies-almanack/talk-two',
  },
  {
    slug: 'talk-three',
    part: '第四章 · 十一讲',
    number: '04-03',
    title: '论基本的、普世的智慧（再论）',
    subtitle: '斯坦福法学院演讲与问答',
    year: 1996,
    kind: '原书演讲',
    sourceFile: 'poor-charlies-almanack/poor-charlies-almanack-talk-three.md',
    sourceNote: '站内既有中文译稿，含现场问答，统一纳入本书阅读顺序。',
    officialUrl: 'https://www.stripe.press/poor-charlies-almanack/talk-three',
  },
  {
    slug: 'talk-four',
    part: '第四章 · 十一讲',
    number: '04-04',
    title: '关于实践思维的现实思考',
    subtitle: '用五个基本概念推演一家两万亿美元企业',
    year: 1996,
    kind: '原书演讲',
    sourceFile: 'poor-charlies-almanack/poor-charlies-almanack-talk-four.md',
    sourceNote: '站内既有中文译稿，统一纳入本书阅读顺序。',
    officialUrl: 'https://www.stripe.press/poor-charlies-almanack/talk-four',
  },
  {
    slug: 'talk-five',
    part: '第四章 · 十一讲',
    number: '04-05',
    title: '跨学科技能的必要性',
    subtitle: '哈佛法学院毕业五十周年聚会演讲',
    year: 1998,
    kind: '原书演讲',
    sourceFile: 'poor-charlies-almanack/poor-charlies-almanack-talk-five.md',
    sourceNote: '站内既有中文译稿，统一纳入本书阅读顺序。',
    officialUrl: 'https://www.stripe.press/poor-charlies-almanack/talk-five',
  },
  {
    slug: 'talk-six',
    part: '第四章 · 十一讲',
    number: '04-06',
    title: '大型慈善基金的投资实践',
    subtitle: '基金会财务主管联合会演讲',
    year: 1998,
    kind: '原书演讲',
    sourceFile: 'poor-charlies-almanack/poor-charlies-almanack-talk-six.md',
    sourceNote: '站内既有中文译稿，统一纳入本书阅读顺序。',
    officialUrl: 'https://www.stripe.press/poor-charlies-almanack/talk-six',
  },
  {
    slug: 'talk-seven',
    part: '第四章 · 十一讲',
    number: '04-07',
    title: '慈善圆桌会议早餐会讲话',
    subtitle: '基金管理、激励机制与社会责任',
    year: 2000,
    kind: '原书演讲',
    sourceFile: 'poor-charlies-almanack/poor-charlies-almanack-talk-seven.md',
    sourceNote: '站内既有中文译稿，统一纳入本书阅读顺序。',
    officialUrl: 'https://www.stripe.press/poor-charlies-almanack/talk-seven',
  },
  {
    slug: 'talk-eight',
    part: '第四章 · 十一讲',
    number: '04-08',
    title: '2003年的金融大丑闻',
    subtitle: '一则关于会计、激励与职业伦理的寓言',
    year: 2003,
    kind: '原书演讲',
    sourceFile: 'poor-charlies-almanack/poor-charlies-almanack-talk-eight.md',
    sourceNote: '站内既有中文译稿，原位于专题文章栏目，现统一纳入本书阅读顺序。',
    officialUrl: 'https://www.stripe.press/poor-charlies-almanack/talk-eight',
  },
  {
    slug: 'talk-nine',
    part: '第四章 · 十一讲',
    number: '04-09',
    title: '学院派经济学的优点与缺点',
    subtitle: '跨学科需求视角下的九项批评',
    year: 2003,
    kind: '原书演讲',
    sourceFile: 'poor-charlies-almanack/poor-charlies-almanack-talk-nine.md',
    sourceNote: '站内既有中文译稿，含“重读第九讲”，统一纳入本书阅读顺序。',
    officialUrl: 'https://www.stripe.press/poor-charlies-almanack/talk-nine',
  },
  {
    slug: 'talk-ten',
    part: '第四章 · 十一讲',
    number: '04-10',
    title: '获得人生智慧',
    subtitle: '南加州大学法学院毕业典礼演讲',
    year: 2007,
    kind: '原书演讲',
    sourceFile: 'poor-charlies-almanack/poor-charlies-almanack-talk-ten.md',
    sourceNote: '站内既有中文译稿，统一纳入本书阅读顺序。',
    officialUrl: 'https://www.stripe.press/poor-charlies-almanack/talk-ten',
  },
  {
    slug: 'talk-eleven',
    part: '第四章 · 十一讲',
    number: '04-11',
    title: '人类误判心理学',
    subtitle: '2005年书面修订版导读与25种心理倾向',
    year: 2005,
    kind: '中文译稿',
    sourceFile: 'poor-charlies-almanack/poor-charlies-almanack-talk-eleven.md',
    sourceNote: '依据文件夹中的2005年修订英文稿翻译，并统一采用本站25种心理倾向译名。',
    officialUrl: 'https://www.stripe.press/poor-charlies-almanack/talk-eleven',
  },
  {
    slug: 'recommended-reading',
    part: '附录',
    number: '05',
    title: '芒格推荐阅读',
    subtitle: '搭建多元思维格栅的延伸书目',
    kind: '延伸阅读',
    sourceFile: 'poor-charlies-almanack/poor-charlies-almanack-recommended-reading.md',
    sourceNote: '依据 Stripe Press 版推荐书目整理，并与站内芒格资料互联。',
    officialUrl: 'https://www.stripe.press/poor-charlies-almanack/recommended-reading',
  },
]

export function getAlmanackSection(slug: string) {
  const index = almanackSections.findIndex((section) => section.slug === slug)
  if (index < 0) return null
  const section = almanackSections[index]
  const filePath = path.join(PROJECT_DIR, section.sourceFile)
  return {
    ...section,
    content: readFileSync(filePath, 'utf-8'),
    previous: index > 0 ? almanackSections[index - 1] : null,
    next: index < almanackSections.length - 1 ? almanackSections[index + 1] : null,
  }
}

export function almanackSectionParams() {
  return almanackSections.map(({ slug }) => ({ slug }))
}
