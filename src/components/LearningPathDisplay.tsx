'use client'

import Link from 'next/link'
import { useProgress } from '@/hooks/useProgress'
import { FileText, Lightbulb, Mail, Clock } from 'lucide-react'

function ItemTypeIcon({ type }: { type: string }) {
  if (type === 'article') return <FileText className="w-3.5 h-3.5" strokeWidth={1.75} />
  if (type === 'concept') return <Lightbulb className="w-3.5 h-3.5" strokeWidth={1.75} />
  return <Mail className="w-3.5 h-3.5" strokeWidth={1.75} />
}

interface PathItem {
  type: string
  category: string
  file: string
  note: string
  href?: string
}

interface PathStep {
  order: number
  title: string
  description: string
  items: PathItem[]
}

interface LearningPath {
  id: string
  title: string
  subtitle: string
  estimatedTime: string
  icon: string
  steps: PathStep[]
}

interface SubPath {
  id: string
  title: string
  subtitle: string
  steps: PathStep[]
}

interface TopicsPath {
  id: string
  title: string
  subtitle: string
  icon: string
  subPaths: SubPath[]
}

function cleanFileName(file: string, category: string): string {
  // concept/company/people routes append .md internally, strip extension
  if (['concepts', 'companies', 'people'].includes(category)) {
    return file.replace(/\.md$/, '')
  }
  return file
}

function getItemHref(item: PathItem): string {
  if (item.href) return item.href
  const fileName = cleanFileName(item.file, item.category)
  const encoded = encodeURIComponent(fileName)
  switch (item.category) {
    case 'concepts': return `/concepts/${encoded}`
    case 'companies': return `/companies/${encoded}`
    case 'people': return `/people/${encoded}`
    case 'letters': return `/letters/${encoded}`
    case 'partnership': return `/partnership/${encoded}`
    default: return '/'
  }
}

function getItemLabel(item: PathItem): string {
  const name = item.file.replace('.md', '')
  return name.split('/').pop() || name
}

function getItemKey(item: PathItem): string {
  return `${item.category}/${item.file}`
}

export function LearningPathBeginner({ path }: { path: LearningPath }) {
  const { isCompleted, toggleItem } = useProgress()

  // Compute total items and completed count
  let totalItems = 0
  const allItemKeys: { key: string; item: PathItem }[] = []
  path.steps.forEach(step => {
    step.items.forEach(item => {
      const key = getItemKey(item)
      allItemKeys.push({ key, item })
      totalItems++
    })
  })

  const completedCount = allItemKeys.filter(({ key }) => isCompleted(path.id, key)).length
  const percent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0

  return (
    <section id="beginner" className="mb-14 scroll-mt-24">
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 rounded-2xl border border-primary/20 p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{path.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white font-serif">{path.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{path.subtitle}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-bold text-primary dark:text-primary-light">{percent}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{completedCount}/{totalItems}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="ml-0 mb-5">
          <div className="w-full h-2 bg-primary/10 dark:bg-primary/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary dark:bg-primary-light rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1"><Clock className="w-3.5 h-3.5 inline-block mr-1 align-[-2px]" strokeWidth={1.75} />{path.estimatedTime}</p>
        </div>

        {/* Steps */}
        <div className="space-y-5">
          {path.steps.map(step => (
            <div key={step.order} className="bg-bg-card dark:bg-dark-card rounded-xl p-5 border border-primary/15">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {step.order}
                </span>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">{step.title}</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 ml-9 mb-2">{step.description}</p>
              <div className="ml-9 space-y-1">
                {step.items.map((item, idx) => {
                  const key = getItemKey(item)
                  const done = isCompleted(path.id, key)
                  return (
                    <div key={idx} className="flex items-center gap-2 text-sm group">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleItem(path.id, key)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          done
                            ? 'bg-primary border-primary text-white'
                            : 'border-gray-300 dark:border-gray-600 hover:border-primary'
                        }`}
                        aria-label={done ? '标记为未读' : '标记为已读'}
                      >
                        {done && <span className="text-xs font-bold" aria-hidden="true">✓</span>}
                      </button>
                      {/* Link */}
                      <Link
                        href={getItemHref(item)}
                        className={`flex items-center gap-2 flex-1 py-1.5 px-2 rounded-lg transition-colors ${
                          done
                            ? 'text-gray-400 dark:text-gray-500 line-through'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary'
                        }`}
                      >
                        <span className="text-xs text-gray-400 dark:text-gray-600">
                          <ItemTypeIcon type={item.type} />
                        </span>
                        <span>{getItemLabel(item)}</span>
                      </Link>
                      <span className="text-xs text-gray-400 dark:text-gray-600 ml-auto hidden sm:inline">{item.note}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function LearningPathIntermediate({ path }: { path: LearningPath }) {
  const { isCompleted, toggleItem } = useProgress()

  let totalItems = 0
  const allItemKeys: { key: string; item: PathItem }[] = []
  path.steps.forEach(step => {
    step.items.forEach(item => {
      allItemKeys.push({ key: getItemKey(item), item })
      totalItems++
    })
  })

  const completedCount = allItemKeys.filter(({ key }) => isCompleted(path.id, key)).length
  const percent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0

  return (
    <section id="intermediate" className="mb-14 scroll-mt-24">
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 rounded-2xl border border-primary/20 p-6 md:p-8">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{path.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white font-serif">{path.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{path.subtitle}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-bold text-primary dark:text-primary-light">{percent}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{completedCount}/{totalItems}</div>
          </div>
        </div>

        <div className="ml-0 mb-5">
          <div className="w-full h-2 bg-primary/10 dark:bg-primary/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary dark:bg-primary-light rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1"><Clock className="w-3.5 h-3.5 inline-block mr-1 align-[-2px]" strokeWidth={1.75} />{path.estimatedTime}</p>
        </div>

        <div className="space-y-5">
          {path.steps.map(step => (
            <div key={step.order} className="bg-bg-card dark:bg-dark-card rounded-xl p-5 border border-primary/15">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {step.order}
                </span>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">{step.title}</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 ml-9 mb-2">{step.description}</p>
              <div className="ml-9 space-y-1">
                {step.items.map((item, idx) => {
                  const key = getItemKey(item)
                  const done = isCompleted(path.id, key)
                  return (
                    <div key={idx} className="flex items-center gap-2 text-sm group">
                      <button
                        onClick={() => toggleItem(path.id, key)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          done
                            ? 'bg-primary border-primary text-white'
                            : 'border-gray-300 dark:border-gray-600 hover:border-primary'
                        }`}
                        aria-label={done ? '标记为未读' : '标记为已读'}
                      >
                        {done && <span className="text-xs font-bold" aria-hidden="true">✓</span>}
                      </button>
                      <Link
                        href={getItemHref(item)}
                        className={`flex items-center gap-2 flex-1 py-1.5 px-2 rounded-lg transition-colors ${
                          done
                            ? 'text-gray-400 dark:text-gray-500 line-through'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary'
                        }`}
                      >
                        <span className="text-xs text-gray-400 dark:text-gray-600">
                          <ItemTypeIcon type={item.type} />
                        </span>
                        <span>{getItemLabel(item)}</span>
                      </Link>
                      <span className="text-xs text-gray-400 dark:text-gray-600 ml-auto hidden sm:inline">{item.note}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function LearningPathTopics({ topics }: { topics: TopicsPath }) {
  const { isCompleted, toggleItem } = useProgress()

  return (
    <section id="topics" className="mb-8 scroll-mt-24">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-serif">
          {topics.icon} {topics.title}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{topics.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {topics.subPaths.map(sub => {
          // Calculate progress for this sub-path
          let subTotal = 0
          let subCompleted = 0
          sub.steps.forEach(step => {
            step.items.forEach(item => {
              subTotal++
              if (isCompleted(topics.id, getItemKey(item))) subCompleted++
            })
          })
          const subPercent = subTotal > 0 ? Math.round((subCompleted / subTotal) * 100) : 0

          return (
            <div
              key={sub.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-900 dark:text-white">{sub.title}</h3>
                {subTotal > 0 && (
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{subCompleted}/{subTotal}</span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{sub.subtitle}</p>
              {subTotal > 0 && (
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${subPercent}%` }}
                  />
                </div>
              )}
              <div className="space-y-1">
                {sub.steps.flatMap(step =>
                  step.items.map((item, idx) => {
                    const key = getItemKey(item)
                    const done = isCompleted(topics.id, key)
                    return (
                      <div key={`${step.order}-${idx}`} className="flex items-center gap-2 text-xs group">
                        <button
                          onClick={() => toggleItem(topics.id, key)}
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            done
                              ? 'bg-primary border-primary text-white'
                              : 'border-gray-300 dark:border-gray-600 hover:border-primary'
                          }`}
                          aria-label={done ? '标记为未读' : '标记为已读'}
                        >
                          {done && <span className="text-[10px] font-bold" aria-hidden="true">✓</span>}
                        </button>
                        <Link
                          href={getItemHref(item)}
                          className={`flex items-center gap-1.5 flex-1 py-0.5 px-1.5 rounded transition-colors ${
                            done
                              ? 'text-gray-400 dark:text-gray-500 line-through'
                              : 'text-gray-600 dark:text-gray-400 hover:text-primary'
                          }`}
                        >
                          <span className="text-[10px]">
                            <ItemTypeIcon type={item.type} />
                          </span>
                          <span className="truncate">{getItemLabel(item)}</span>
                        </Link>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
