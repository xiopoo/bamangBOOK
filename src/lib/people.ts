export interface PersonContentCategory {
  id: string
  label: string
  href: string
  count?: number
  icon?: string
}

export interface RelatedPerson {
  id: string
  name: string
  nameEn: string
  href: string
  relationship: string
}

export interface PersonQuote {
  text: string
  source?: string
  year?: number
}

export interface Person {
  id: string
  name: string
  nameEn: string
  avatar?: string
  role: string
  description: string
  bio: string
  achievements: string[]
  investmentPhilosophy: string[]
  contentCategories: PersonContentCategory[]
  relatedPeople: RelatedPerson[]
  quotes: PersonQuote[]
  investmentCases: string[]
  books: { title: string; year?: number; description?: string }[]
}

export const people: Record<string, Person> = {
  buffett: {
    id: 'buffett',
    name: '沃伦·巴菲特',
    nameEn: 'Warren Buffett',
    role: '价值投资之父',
    description: '全球最成功的投资者之一，伯克希尔哈撒韦公司CEO',
    bio: '沃伦·爱德华·巴菲特（Warren Edward Buffett），1930年8月30日出生于美国内布拉斯加州奥马哈市。他是伯克希尔哈撒韦公司的创始人兼首席执行官，被誉为"奥马哈先知"。巴菲特以其卓越的投资眼光和长期投资策略闻名于世，是价值投资理念的集大成者。',
    achievements: [
      '创立伯克希尔哈撒韦公司，使其成为全球市值最高的公司之一',
      '连续数十年跑赢市场平均收益率',
      '慈善捐赠超过500亿美元',
      '被《福布斯》评为全球最具影响力的商业领袖之一',
    ],
    investmentPhilosophy: [
      '价值投资：寻找被低估的优质企业',
      '安全边际：永远不要支付过高的价格',
      '能力圈：只投资自己理解的领域',
      '长期持有：复利的力量需要时间积累',
      '护城河：投资拥有持久竞争优势的企业',
    ],
    contentCategories: [
      { id: 'partnership', label: '合伙人信', href: '/partnership', count: 23, icon: '🤝' },
      { id: 'letters', label: '股东信', href: '/letters', count: 59, icon: '📬' },
      { id: 'talks', label: '演讲', href: '/talks?person=buffett', count: 11, icon: '🎤' },
      { id: 'interviews', label: '访谈', href: '/interviews?person=buffett', count: 40, icon: '🎙️' },
      { id: 'qa', label: '股东大会问答', href: '/qa', count: 40, icon: '❓' },
      { id: 'articles', label: '专题文章', href: '/articles', count: 95, icon: '📝' },
    ],
    relatedPeople: [
      { id: 'munger', name: '查理·芒格', nameEn: 'Charlie Munger', href: '/munger', relationship: '黄金搭档' },
    ],
    quotes: [
      { text: '别人贪婪时我恐惧，别人恐惧时我贪婪。', source: '股东信' },
      { text: '投资不是赌博，而是基于对企业价值的理性判断。', source: '演讲' },
      { text: '时间是好公司的朋友，是坏公司的敌人。', source: '股东信' },
      { text: '我们喜欢简单的生意，而不是复杂的。', source: '股东大会' },
      { text: '价格是你付出的，价值是你得到的。', source: '股东信' },
    ],
    investmentCases: ['可口可乐', '苹果', '美国运通', '吉列', '喜诗糖果', 'GEICO保险', '华盛顿邮报'],
    books: [
      { title: '滚雪球：巴菲特和他的财富人生', year: 2008, description: '巴菲特唯一授权的官方传记' },
      { title: '巴菲特致股东的信', description: '历年股东信精华合集' },
      { title: '聪明的投资者', year: 1949, description: '本杰明·格雷厄姆经典著作，巴菲特的投资圣经' },
    ],
  },
  munger: {
    id: 'munger',
    name: '查理·芒格',
    nameEn: 'Charlie Munger',
    role: '伯克希尔哈撒韦副董事长',
    description: '巴菲特的黄金搭档，多元思维框架的倡导者',
    bio: '查尔斯·托马斯·芒格（Charles Thomas Munger），1924年1月1日出生于美国内布拉斯加州奥马哈市。他是伯克希尔哈撒韦公司的副董事长，也是巴菲特最亲密的合作伙伴。芒格以其跨学科的思维方式和深邃的智慧著称，提出了著名的"多元思维框架"理论。',
    achievements: [
      '与巴菲特共同打造伯克希尔哈撒韦的投资传奇',
      '创立并领导Daily Journal Corporation',
      '倡导跨学科思维，影响一代投资者',
      '著有《穷查理宝典》，成为投资经典',
    ],
    investmentPhilosophy: [
      '多元思维框架：掌握多学科基本原理',
      '逆向思维：先想如何避免失败',
      '人类误判心理学：认识并克服认知偏差',
      '长期视角：拒绝短期主义',
      '专注：在能力圈内追求卓越',
    ],
    contentCategories: [
      { id: 'munger-concepts', label: '核心概念', href: '/munger', count: 49, icon: '💡' },
      { id: 'talks', label: '演讲', href: '/talks?person=munger', count: 10, icon: '🎤' },
      { id: 'interviews', label: '访谈', href: '/interviews?person=munger', count: 0, icon: '🎙️' },
    ],
    relatedPeople: [
      { id: 'buffett', name: '沃伦·巴菲特', nameEn: 'Warren Buffett', href: '/buffett', relationship: '黄金搭档' },
    ],
    quotes: [
      { text: '想要得到某样东西，最好的办法是让自己配得上它。', source: '演讲' },
      { text: '每天起床前，比昨天变聪明一点。', source: '演讲' },
      { text: '如果你手里只有一把锤子，你看什么都像钉子。', source: '演讲' },
      { text: '我最大的成功不是赚了多少钱，而是避免了多少错误。', source: '访谈' },
      { text: '投资就是比谁更能避免犯错。', source: '股东大会' },
    ],
    investmentCases: ['好市多', '比亚迪', '可口可乐', '富国银行'],
    books: [
      { title: '穷查理宝典', year: 2005, description: '芒格智慧的精华合集' },
      { title: '巴菲特致股东的信', description: '与巴菲特共同撰写' },
    ],
  },
}

export const extendedPeople: { id: string; name: string; nameEn: string; status: 'coming' | 'draft' }[] = [
  { id: 'duanyongping', name: '段永平', nameEn: 'Duan Yongping', status: 'coming' },
  { id: 'tangchao', name: '唐朝', nameEn: 'Tang Chao', status: 'coming' },
]

function getPerson(id: string): Person | undefined {
  return people[id]
}

function getAllPeople(): Person[] {
  return Object.values(people)
}

export function getRelatedPeople(personId: string): RelatedPerson[] {
  const person = people[personId]
  return person ? person.relatedPeople : []
}

const personNameMap: Record<string, string> = {
  '巴菲特': 'buffett',
  '沃伦·巴菲特': 'buffett',
  'Warren Buffett': 'buffett',
  '芒格': 'munger',
  '查理·芒格': 'munger',
  'Charlie Munger': 'munger',
  '施洛斯': 'schloss',
  '沃尔特·施洛斯': 'schloss',
  'Walter Schloss': 'schloss',
  '苏珊·巴菲特': 'buffett',
}

export function identifyPerson(title: string): string[] {
  const foundPersons: string[] = []
  
  for (const [name, id] of Object.entries(personNameMap)) {
    if (title.includes(name)) {
      if (!foundPersons.includes(id)) {
        foundPersons.push(id)
      }
    }
  }
  
  return foundPersons
}

function identifyMainPerson(title: string): string | null {
  const persons = identifyPerson(title)
  if (persons.length === 0) return null
  
  if (persons.length === 1) {
    return persons[0]
  }
  
  if (persons.includes('buffett')) {
    return 'buffett'
  }
  
  return persons[0]
}