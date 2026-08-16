'use client'

import { useMemo, useState } from 'react'
import ArchiveList, { type ArchiveListItem } from './ArchiveList'
import { personDisplayName } from '@/lib/people'
import styles from './ArchiveList.module.css'

interface DocumentArchiveFiltersProps {
  items: ArchiveListItem[]
  emptyMessage?: string
}

// 人物优先排序（巴菲特 → 芒格 → 段永平），其余人物按名字排后
const PERSON_ORDER = new Map<string, number>([
  ['buffett', 0], ['巴菲特', 0], ['沃伦·巴菲特', 0],
  ['munger', 1], ['芒格', 1], ['查理·芒格', 1],
  ['duan-yongping', 2], ['段永平', 2],
])

/** 人物标签筛选：聚合列表中出现的全部人物，按「全部 / 各人物」过滤。
 *  类别是页面维度（问答 / 演讲 / 访谈），人物是内容维度——两维正交。 */
export default function DocumentArchiveFilters({ items, emptyMessage }: DocumentArchiveFiltersProps) {
  const people = useMemo(() => {
    const map = new Map<string, string>()
    for (const item of items) {
      for (const id of item.personIds ?? []) {
        if (id && !map.has(id)) map.set(id, personDisplayName(id))
      }
    }
    return [...map.entries()].sort((a, b) =>
      (PERSON_ORDER.get(a[0]) ?? 99) - (PERSON_ORDER.get(b[0]) ?? 99) || a[1].localeCompare(b[1], 'zh-CN'))
  }, [items])

  const [active, setActive] = useState<string>('all')
  if (people.length < 2) return <ArchiveList items={items} emptyMessage={emptyMessage} />
  const filtered = active === 'all' ? items : items.filter(item => item.personIds?.includes(active))

  return <div>
    <div className={styles.filters} role="group" aria-label="按人物筛选">
      <span className={styles.filtersLabel}>人物</span>
      <button type="button" className={active === 'all' ? styles.isActive : undefined} onClick={() => setActive('all')}>全部</button>
      {people.map(([id, name]) => (
        <button key={id} type="button" className={active === id ? styles.isActive : undefined} onClick={() => setActive(id)}>{name}</button>
      ))}
    </div>
    <ArchiveList items={filtered} emptyMessage={emptyMessage} />
  </div>
}
