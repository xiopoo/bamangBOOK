import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { ThinkerArchive } from '@/lib/thinker-archives'
import styles from './ThinkerArchivePage.module.css'

type Stat = {
  value: string | number
  label: string
}

export default function ThinkerArchivePage({
  archive,
  stats,
}: {
  archive: ThinkerArchive
  stats: Stat[]
}) {
  return (
    <div className={styles.archive}>
      <header className={styles.hero}>
        <p>{archive.eyebrow}</p>
        <h1>{archive.name}</h1>
        <div className={styles.heroStatement}>
          <strong>{archive.headline}</strong>
          <span>{archive.introduction}</span>
        </div>
      </header>

      <dl className={styles.stats}>
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt>{stat.value}</dt>
            <dd>{stat.label}</dd>
          </div>
        ))}
      </dl>

      <section className={styles.sources}>
        <header>
          <p>第一手资料</p>
          <h2>{archive.sourceHeading}</h2>
        </header>
        <div>
          {archive.sources.map((source, index) => (
            <Link key={source.href} href={source.href}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <p>{source.meta}</p>
                <h3>{source.label}</h3>
                <small>{source.description}</small>
              </div>
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.ideas}>
        <header>
          <p>THE IDEAS</p>
          <h2>思想不是清单，而是一组彼此制约的判断</h2>
        </header>
        <div>
          {archive.ideas.map((idea, index) => (
            <Link key={idea.title} href={idea.href}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{idea.title}</h3>
              <p>{idea.thesis}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.chapters}>
        <header>
          <p>THE LIFE</p>
          <h2>思想怎样被经历改写</h2>
        </header>
        <ol>
          {archive.chapters.map((chapter) => (
            <li key={chapter.period}>
              <span>{chapter.period}</span>
              <h3>{chapter.title}</h3>
              <p>{chapter.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.cases}>
        <header>
          <div>
            <p>IN PRACTICE</p>
            <h2>在公司里检验这些判断</h2>
          </div>
          <Link href="/companies">全部公司 →</Link>
        </header>
        <div>
          {archive.cases.map((item) => (
            <Link key={item.label} href={item.href}>
              <small>{item.meta}</small>
              <h3>{item.label}</h3>
              <p>{item.description}</p>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
