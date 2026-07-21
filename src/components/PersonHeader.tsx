import { Person } from '@/lib/people'
import StatBadge from './StatBadge'

interface PersonHeaderProps {
  person: Person
  stats?: {
    letters?: number
    talks?: number
    interviews?: number
    qa?: number
    articles?: number
    partnerships?: number
  }
}

export default function PersonHeader({ person, stats }: PersonHeaderProps) {
  const totalLetters = (stats?.partnerships || 0) + (stats?.letters || 0)
  const totalTalks = (stats?.talks || 0) + (stats?.interviews || 0)

  return (
    <header className="bg-gradient-to-r from-primary/5 via-primary/8 to-primary/5 dark:from-primary/10 dark:via-primary/15 dark:to-primary/10 rounded-2xl p-6 md:p-8 mb-8 border border-primary/20 dark:border-primary/30">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="flex-shrink-0">
          <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-primary/20 to-primary/30 dark:from-primary/30 dark:to-primary/40 rounded-full flex items-center justify-center text-5xl md:text-6xl shadow-lg shadow-primary/10">
            👤
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-text dark:text-dark-text">
              {person.name}
            </h1>
            <span className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap">
              {person.role}
            </span>
          </div>

          <p className="text-gray-500 dark:text-gray-400 mb-3">
            {person.nameEn}
          </p>

          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
            {person.description}
          </p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {totalLetters > 0 && (
            <StatBadge
              icon="📖"
              count={`${totalLetters}封`}
              label="信件收录"
              sub={stats.partnerships && stats.letters ? `${stats.partnerships}封合伙人信 + ${stats.letters}封股东信` : undefined}
            />
          )}
          {totalTalks > 0 && (
            <StatBadge
              icon="🎤"
              count={`${totalTalks}场`}
              label="演讲访谈"
              sub={stats.talks && stats.interviews ? `${stats.talks}场演讲 + ${stats.interviews}场访谈` : undefined}
            />
          )}
          {stats.qa && stats.qa > 0 && (
            <StatBadge
              icon="❓"
              count={`${stats.qa}场`}
              label="股东大会问答"
            />
          )}
          {stats.articles && stats.articles > 0 && (
            <StatBadge
              icon="📝"
              count={`${stats.articles}篇`}
              label="专题文章"
            />
          )}
        </div>
      )}
    </header>
  )
}
