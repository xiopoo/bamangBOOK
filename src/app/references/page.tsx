import { existsSync, readdirSync, statSync } from 'fs'
import path from 'path'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import PageContainer from '@/components/PageContainer'
import PageFooter from '@/components/PageFooter'
import styles from './references.module.css'

export const metadata = {
  title: '引用与参考',
  description: '小胖书房所使用的官方原典、人物档案、企业与监管材料、第三方文章和编辑型内容总表。',
  alternates: { canonical: '/references' },
}

function countMarkdown(directory: string): number {
  const root = path.join(process.cwd(), 'content', directory)
  if (!existsSync(root)) return 0
  let count = 0
  for (const entry of readdirSync(root)) {
    const fullPath = path.join(root, entry)
    if (statSync(fullPath).isDirectory()) {
      count += countMarkdown(path.join(directory, entry))
    } else if (entry.endsWith('.md')) {
      count += 1
    }
  }
  return count
}

const sourceGroups = [
  {
    number: '01',
    title: '官方原典',
    note: '优先核对发布机构提供的英文原文、PDF或正式档案。',
    items: [
      {
        title: '伯克希尔·哈撒韦股东信',
        count: () => countMarkdown('letters'),
        nature: '中文整理稿 · 按年份归档',
        href: '/letters',
        source: '伯克希尔官方股东信档案',
        sourceUrl: 'https://www.berkshirehathaway.com/letters/letters.html',
      },
      {
        title: '巴菲特合伙人信',
        count: () => countMarkdown('partnership'),
        nature: '历史信件与合伙协议整理',
        href: '/partnership',
        source: '站内按年份与信件状态整理',
      },
      {
        title: 'Wesco 股东信英文原文',
        count: () => countMarkdown('munger-originals'),
        nature: '官方PDF文本提取 · 保留年份',
        href: '/munger/originals',
        source: '伯克希尔 Wesco 官方档案',
        sourceUrl: 'https://www.berkshirehathaway.com/wesco/WescoHome.html',
      },
      {
        title: '《穷查理宝典》阅读与翻译',
        count: () => countMarkdown('poor-charlies-almanack'),
        nature: '英文版本翻译与结构化阅读',
        href: '/poor-charlies-almanack',
        source: 'Stripe Press 英文版',
        sourceUrl: 'https://www.stripe.press/poor-charlies-almanack',
      },
    ],
  },
  {
    number: '02',
    title: '人物、演讲与问答档案',
    note: '同一材料可能存在录音、实录、会议笔记和编辑整理等不同版本。',
    items: [
      {
        title: 'Munger Archive 本地档案',
        count: () => countMarkdown('munger-archive'),
        nature: '生平、录音、语录、书目与思维模型',
        href: '/munger/archive',
        source: 'Munger Archive 中文站',
        sourceUrl: 'https://mungerarchive.com/zh/',
      },
      {
        title: '多元思维模型',
        count: () => countMarkdown('models'),
        nature: '原模型库与同名档案归并整理',
        href: '/model',
        source: '条目页保留具体来源链接',
      },
      {
        title: '股东大会问答',
        count: () => countMarkdown('qa'),
        nature: '伯克希尔与Wesco现场问答、实录或会议笔记',
        href: '/qa',
        source: '版本状态以各详情页说明为准',
      },
      {
        title: '演讲与访谈',
        count: () => countMarkdown('talks') + countMarkdown('interviews'),
        nature: '公开演讲、校园对话与媒体访谈',
        href: '/reading',
        source: '正文保留作者、年份与可用出处',
      },
    ],
  },
  {
    number: '03',
    title: '企业与监管材料',
    note: '企业研究优先使用年报、监管文件、投资者关系材料和公司官方说明。',
    items: [
      {
        title: '企业研究与商业史',
        count: () => countMarkdown('business-history'),
        nature: '年报、监管文件与公司史交叉整理',
        href: '/business-history',
        source: 'SEC EDGAR 与公司投资者关系页面',
        sourceUrl: 'https://www.sec.gov/edgar/search/',
      },
      {
        title: '公司知识档案',
        count: () => countMarkdown('companies'),
        nature: '由股东信、公开资料与企业研究归纳',
        href: '/companies',
        source: '用于建立检索线索，不替代当前公司披露',
      },
      {
        title: '投资概念卡片',
        count: () => countMarkdown('concepts'),
        nature: '跨年份、人物与公司资料整理',
        href: '/concepts',
        source: '引用年份可回到相关信件核对',
      },
    ],
  },
  {
    number: '04',
    title: '第三方作者与编辑型内容',
    note: '第三方内容不被包装为本站原创；能保留原链接时，在详情页提供原文入口。',
    items: [
      {
        title: '博主文章存档',
        count: () => countMarkdown('bloggers'),
        nature: '按作者、日期与原始账号归档',
        href: '/bloggers',
        source: '唐僧的碎碎念、在苍茫中传灯、方伟看十年、梁孝永康',
      },
      {
        title: '专题文章',
        count: () => countMarkdown('articles'),
        nature: '公开资料、人物文章与专题整理稿',
        href: '/reading',
        source: '作者与出处以正文标注为准',
      },
      {
        title: '拆书与专栏',
        count: () => countMarkdown('books') + countMarkdown('columns'),
        nature: '个人阅读笔记、结构化拆解与评论',
        href: '/books',
        source: '不替代原著或原作者完整论述',
      },
    ],
  },
]

export default function ReferencesPage() {
  return (
    <>
      <PageContainer maxWidth="6xl" className={styles.page}>
        <header className={styles.hero}>
          <p>REFERENCES &amp; SOURCES</p>
          <h1>引用与参考</h1>
          <span>把资料性质、站内整理与外部核验入口放在同一张书目卡上。</span>
        </header>

        <section className={styles.guide} aria-labelledby="reference-guide">
          <div>
            <p>HOW TO READ</p>
            <h2 id="reference-guide">先辨认材料，再判断观点</h2>
          </div>
          <dl>
            <div><dt>原文</dt><dd>发布机构或作者提供的第一手材料。</dd></div>
            <div><dt>翻译</dt><dd>与英文原文分开标注，疑难处以原文为准。</dd></div>
            <div><dt>编辑整理</dt><dd>补充结构和关联，不等同于作者原话。</dd></div>
            <div><dt>第三方存档</dt><dd>保留作者与账号信息，不作为本站原创。</dd></div>
          </dl>
        </section>

        <div className={styles.groups}>
          {sourceGroups.map((group) => (
            <section key={group.number} className={styles.group}>
              <header>
                <span>{group.number}</span>
                <div><h2>{group.title}</h2><p>{group.note}</p></div>
              </header>
              <div className={styles.items}>
                {group.items.map((item) => (
                  <article key={item.title}>
                    <div className={styles.itemHeading}>
                      <div><h3>{item.title}</h3><p>{item.nature}</p></div>
                      <strong>{item.count()}<small> 项</small></strong>
                    </div>
                    <div className={styles.sourceLine}>
                      <span>主要来源</span>
                      {item.sourceUrl ? (
                        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                          {item.source}<ArrowUpRight size={14} aria-hidden="true" />
                        </a>
                      ) : <p>{item.source}</p>}
                    </div>
                    <Link href={item.href}>查看站内资料 <span aria-hidden="true">→</span></Link>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className={styles.note}>
          <p>说明</p>
          <h2>这是一张总表，不取代页面级出处。</h2>
          <span>具体引语、数字和事实仍应以详情页正文标注及其原始链接为准。发现来源、翻译或归类问题后，本站会持续修订。</span>
          <Link href="/about">查看编辑原则 →</Link>
        </aside>
      </PageContainer>
      <PageFooter />
    </>
  )
}
