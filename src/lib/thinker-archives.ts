export type ArchiveLink = {
  href: string
  label: string
  meta: string
  description: string
}

export type ArchiveIdea = {
  href: string
  title: string
  thesis: string
}

export type ArchiveChapter = {
  period: string
  title: string
  description: string
}

export type ThinkerArchive = {
  eyebrow: string
  name: string
  years: string
  headline: string
  introduction: string
  sourceHeading: string
  sources: ArchiveLink[]
  ideas: ArchiveIdea[]
  chapters: ArchiveChapter[]
  cases: ArchiveLink[]
}

export const buffettArchive: ThinkerArchive = {
  eyebrow: '沃伦·巴菲特 · 1930—',
  name: '沃伦·巴菲特',
  years: '1956—至今',
  headline: '从价格出发，最后走向企业。',
  introduction:
    '早年的巴菲特寻找被低估的资产，后来的巴菲特愿意为好生意支付合理价格。贯穿始终的，是把股票当作企业的一部分、只做看得懂的判断，以及对资本配置近乎苛刻的要求。',
  sourceHeading: '信件、问答与公开记录',
  sources: [
    {
      href: '/partnership',
      label: '合伙人信',
      meta: '1956—1970',
      description: '方法形成期。套利、控制型投资、市场波动与业绩衡量，都在这里第一次被说清楚。',
    },
    {
      href: '/letters',
      label: '伯克希尔股东信',
      meta: '1965—至今',
      description: '从一家纺织厂到多元企业集团，六十年的经营记录，也是资本配置方法的连续样本。',
    },
    {
      href: '/qa',
      label: '股东大会问答',
      meta: '现场记录',
      description: '问题来自具体年份与具体市场。答案保留了判断成立时的条件，也保留了后来被事实修正的部分。',
    },
    {
      href: '/talks?person=buffett',
      label: '演讲与访谈',
      meta: '公开表达',
      description: '面向学生、媒体与投资者的长谈，补足股东信之外关于职业、名誉、习惯与人生选择的部分。',
    },
  ],
  ideas: [
    { href: '/concepts/价值投资', title: '股票是企业的一部分', thesis: '先理解企业如何创造现金，再讨论证券值多少钱。' },
    { href: '/concepts/能力圈', title: '能力圈', thesis: '边界是否清楚，比范围是否宽广更重要。' },
    { href: '/concepts/内在价值', title: '内在价值', thesis: '未来可分配现金的折现值，是所有估值方法最终要回答的问题。' },
    { href: '/concepts/安全边际', title: '安全边际', thesis: '价格必须为错误、意外与未知留出余地。' },
    { href: '/concepts/护城河', title: '好生意', thesis: '真正稀缺的是能长期维持高资本回报、又不依赖持续投入的企业。' },
    { href: '/concepts/股东回报', title: '资本配置', thesis: '留存、回购、并购与分红，决定利润最终能否变成股东价值。' },
    { href: '/concepts/管理层质量', title: '管理层', thesis: '能力决定能走多快，诚信决定是否值得一起走。' },
    { href: '/concepts/市场先生', title: '市场与情绪', thesis: '市场提供报价，不提供答案；波动只有在迫使你行动时才是风险。' },
  ],
  chapters: [
    { period: '1956—1969', title: '合伙人时期', description: '以价格折扣为主，也做套利和控制型投资；方法锋利，资金规模仍小。' },
    { period: '1970s', title: '从便宜到优质', description: 'See’s Candies 证明，能提价、少追加资本的企业，价值远超过账面资产。' },
    { period: '1980s—1990s', title: '伯克希尔成形', description: '保险浮存金、优秀经理人与永久资本结合，投资方法变成了一套企业制度。' },
    { period: '2000s—至今', title: '规模与传承', description: '在更大的资本基数上寻找确定性，同时处理回购、接班与伯克希尔的长期文化。' },
  ],
  cases: [
    { href: '/companies/喜诗糖果', label: 'See’s Candies', meta: '品牌与定价权', description: '改变两人投资方法的一笔收购。' },
    { href: '/companies/GEICO', label: 'GEICO', meta: '低成本与规模', description: '成本优势如何穿越数十年。' },
    { href: '/companies/可口可乐', label: '可口可乐', meta: '消费心智', description: '品牌、分销和高资本回报的组合。' },
    { href: '/companies/伯克希尔哈撒韦', label: '伯克希尔', meta: '制度与资本配置', description: '投资思想最终成为怎样一家公司。' },
  ],
}

export const mungerArchive: ThinkerArchive = {
  eyebrow: '查理·芒格 · 1924—2023',
  name: '查理·芒格',
  years: '1924—2023',
  headline: '从投资出发，最后走向判断。',
  introduction:
    '芒格谈投资，却很少只谈投资。他把心理学、工程学、生物学、经济学与人生经验放进同一张格栅，用来识别好企业，也用来避免那些反复出现的人类错误。',
  sourceHeading: '演讲、问答与公开记录',
  sources: [
    {
      href: '/poor-charlies-almanack',
      label: '《穷查理宝典》',
      meta: '演讲与文章',
      description: '最集中的思想文本：多元思维模型、人类误判心理学、反向思考，以及对职业与人生的判断。',
    },
    {
      href: '/munger/wesco',
      label: 'Wesco 股东大会',
      meta: '1996—2011',
      description: '没有伯克希尔的双人配合，芒格独自回答投资、公司治理、金融与社会问题。',
    },
    {
      href: '/munger/archive/daily-journal',
      label: '每日期刊股东会',
      meta: '2014—2023',
      description: '芒格独自主持、无讲稿的股东问答专场，从投资、银行业到人生判断，是晚年最完整、最不修饰的一批公开回答。',
    },
    {
      href: '/munger/archive',
      label: '演讲与访谈',
      meta: '1986—2023',
      description: '从哈佛毕业演讲到最后一次访谈，按时间、媒介与出处整理的公开记录。',
    },
  ],
  ideas: [
    { href: '/model/latticework-of-mental-models', title: '多元思维模型', thesis: '事实只有挂在模型上，才会变成可调用的理解。' },
    { href: '/model/inversion', title: '反过来想', thesis: '先问事情怎样必然失败，再避开那些路径。' },
    { href: '/model/reward-and-punishment-superresponse-tendency', title: '激励', thesis: '先看奖励什么、惩罚什么，再听人们怎样解释自己的行为。' },
    { href: '/model/circle-of-competence', title: '能力圈', thesis: '知道什么太难，本身就是一种重要能力。' },
    { href: '/model/margin-of-safety', title: '安全边际', thesis: '工程上的冗余，同样适用于投资和重要决定。' },
    { href: '/model/lollapalooza-tendency', title: '误判叠加', thesis: '最严重的错误，往往不是一个偏差，而是多个力量同向作用。' },
    { href: '/model/opportunity-cost', title: '机会成本', thesis: '每个选择都应与次优选项比较，而不是与什么都不做比较。' },
    { href: '/model/sit-on-your-ass-investing', title: '耐心与集中', thesis: '少数真正看懂的机会，值得等待，也值得下重注。' },
  ],
  chapters: [
    { period: '1924—1961', title: '法律、战争与早年投资', description: '数学训练、气象工作和法律职业，塑造了他对模型、证据与边界的偏好。' },
    { period: '1962—1975', title: '自己的合伙企业', description: '用自己的资本建立记录，也经历集中持仓与大幅回撤。' },
    { period: '1976—2011', title: '伯克希尔与 Wesco', description: '与巴菲特共同完成从廉价资产到优质企业的转向，同时长期经营 Wesco。' },
    { period: '2012—2023', title: 'Daily Journal 与晚年表达', description: '在九十多岁仍持续公开回答问题，留下最完整、最不修饰的一批判断。' },
  ],
  cases: [
    { href: '/companies/喜诗糖果', label: 'See’s Candies', meta: '优质企业', description: '从资产折扣走向企业质量的转折点。' },
    { href: '/companies/好市多', label: 'Costco', meta: '文化与低成本', description: '芒格几乎毫无保留赞赏的公司。' },
    { href: '/munger/archive/daily-journal', label: 'Daily Journal', meta: '经营与转型', description: '一份报纸、一个软件业务与一场持续多年的问答。' },
    { href: '/companies/伯克希尔哈撒韦', label: '伯克希尔', meta: '伙伴关系', description: '六十年几乎没有争执的共同事业。' },
  ],
}
