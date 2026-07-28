import Link from 'next/link'
import PageContainer from '@/components/PageContainer'
import PageFooter from '@/components/PageFooter'
import { getDocuments } from '@/lib/documents'
import { getTopCompanies, getTopConcepts, getTopPeople } from '@/lib/recommendations'
import { getAllPartnershipLetters, getShareholderLetters } from '@/lib/partnership'
import styles from './buffett.module.css'

export default function BuffettPage() {
  const partnerships = getAllPartnershipLetters()
  const letters = getShareholderLetters()
  const concepts = getTopConcepts(15)
  const companies = getTopCompanies(8)
  const people = getTopPeople(7)
  const qaCount = getDocuments('qa').length
  const minYear = partnerships[0]?.year ?? 1956
  const maxYear = letters.at(-1)?.year ?? 2025

  const indexes = [
    { number: '01', href: '/partnership', title: '合伙人信', note: '方法形成期的第一手记录', count: `${partnerships.length} 封` },
    { number: '02', href: '/letters', title: '伯克希尔股东信', note: `${letters[0]?.year ?? 1965}—${maxYear} 年完整阅读`, count: `${letters.length} 封` },
    { number: '03', href: '/concepts', title: '核心思想索引', note: '每个概念都回到出现它的原文', count: `${concepts.length}+ 核心概念` },
    { number: '04', href: '/companies', title: '公司索引', note: '从商业模式连接到历年判断', count: `${companies.length}+ 重点公司` },
    { number: '05', href: '/people', title: '人物索引', note: '合伙人、经理人与思想源流', count: `${people.length}+ 关键人物` },
    { number: '06', href: '/graph', title: '知识图谱', note: '在信件、概念、公司与人物间穿行', count: '关系浏览' },
  ]

  return (
    <>
      <PageContainer maxWidth="6xl" className={styles.page}>
        <header className={styles.hero}>
          <p>WARREN BUFFETT KNOWLEDGE BASE</p>
          <h1>巴菲特知识库</h1>
          <div>
            <strong>{maxYear - minYear + 1} 年投资智慧</strong>
            <span>{partnerships.length + letters.length} 封信件，概念、公司与人物均可溯源到原文。</span>
          </div>
        </header>

        <div className={styles.ledger}>
          <div><strong>{partnerships.length + letters.length}</strong><span>封长期信件</span></div>
          <div><strong>{qaCount}</strong><span>篇大会与问答</span></div>
          <div><strong>{concepts.length}</strong><span>个高频概念</span></div>
          <div><strong>{companies.length}</strong><span>家重点公司</span></div>
        </div>

        <nav className={styles.indexes} aria-label="巴菲特知识库索引">
          {indexes.map((item) => (
            <Link key={item.href} href={item.href}>
              <span>{item.number}</span>
              <div><h2>{item.title}</h2><p>{item.note}</p></div>
              <small>{item.count}</small>
            </Link>
          ))}
        </nav>

        <section className={styles.ask}>
          <div>
            <p>ASK THE ARCHIVE</p>
            <h2>有一个投资问题？先查巴菲特在原文里说过什么。</h2>
          </div>
          <Link href="/search?q=资本配置">从“资本配置”开始 <span aria-hidden="true">→</span></Link>
        </section>

        <section className={styles.section}>
          <header><span>概念</span><h2>核心投资思想</h2><Link href="/concepts">查看全部 →</Link></header>
          <div className={styles.concepts}>
            {concepts.map((concept) => (
              <Link key={concept.name} href={`/concepts/${encodeURIComponent(concept.name)}`}>
                <span>{concept.name}</span>
                <small>{concept.count ?? 0}</small>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <header><span>原文</span><h2>沿年份进入股东信</h2><Link href="/letters">完整年表 →</Link></header>
          <div className={styles.years}>
            {letters.slice(-12).reverse().map((letter) => (
              <Link key={letter.year} href={`/letters/${letter.year}`}>
                <strong>{letter.year}</strong>
                <span>巴菲特致股东信</span>
              </Link>
            ))}
          </div>
        </section>
      </PageContainer>
      <PageFooter />
    </>
  )
}
