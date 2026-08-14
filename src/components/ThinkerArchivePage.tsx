import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { ThinkerArchive } from '@/lib/thinker-archives'
import Breadcrumbs from './Breadcrumbs'
import styles from './ThinkerArchivePage.module.css'

export default function ThinkerArchivePage({
  archive,
}: {
  archive: ThinkerArchive
}) {
  return (
    <>
      <Breadcrumbs />
      <div className={styles.archive}>
      <header className={styles.hero}>
        <p>{archive.eyebrow}</p>
        <h1>{archive.name}</h1>
      </header>

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
          <p>核心思想</p>
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
          <p>人生经历</p>
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
          <p>实践案例</p>
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
    </>
  )
}
