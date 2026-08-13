'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import ArchiveList, { type ArchiveListItem } from './ArchiveList'

interface FilterOption {
  value: string
  label: string
}

interface DocumentArchiveClientProps {
  title: string
  pathname: string
  items: ArchiveListItem[]
  people: FilterOption[]
  years: number[]
  statuses: string[]
  extraLink?: { href: string; label: string }
}

interface Filters {
  person: string
  year: string
  status: string
}

const emptyFilters: Filters = { person: '', year: '', status: '' }

function filtersFromLocation(): Filters {
  if (typeof window === 'undefined') return emptyFilters
  const params = new URLSearchParams(window.location.search)
  return {
    person: params.get('person') || '',
    year: params.get('year') || '',
    status: params.get('status') || '',
  }
}

export default function DocumentArchiveClient({ title, pathname, items, people, years, statuses, extraLink }: DocumentArchiveClientProps) {
  const [draft, setDraft] = useState<Filters>(emptyFilters)
  const [applied, setApplied] = useState<Filters>(emptyFilters)

  useEffect(() => {
    const syncFromUrl = () => {
      const next = filtersFromLocation()
      setDraft(next)
      setApplied(next)
    }
    syncFromUrl()
    window.addEventListener('popstate', syncFromUrl)
    return () => window.removeEventListener('popstate', syncFromUrl)
  }, [])

  const filtered = useMemo(() => items.filter(item => {
    const itemPeople = item.personIds || []
    return (!applied.person || itemPeople.includes(applied.person))
      && (!applied.year || item.year === Number(applied.year))
      && (!applied.status || item.status === applied.status)
  }), [applied, items])

  const updateUrl = (filters: Filters) => {
    const params = new URLSearchParams()
    if (filters.person) params.set('person', filters.person)
    if (filters.year) params.set('year', filters.year)
    if (filters.status) params.set('status', filters.status)
    const query = params.toString()
    window.history.pushState({}, '', query ? `${pathname}?${query}` : pathname)
  }

  const apply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setApplied(draft)
    updateUrl(draft)
  }

  const clear = () => {
    setDraft(emptyFilters)
    setApplied(emptyFilters)
    updateUrl(emptyFilters)
  }

  const active = Boolean(applied.person || applied.year || applied.status)

  return <>
    <form className="archive-filters" action={pathname} method="get" aria-label={`${title}筛选`} onSubmit={apply}>
      <label>人物<select name="person" value={draft.person} onChange={event => setDraft(current => ({ ...current, person: event.target.value }))}><option value="">全部人物</option>{people.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      <label>年份<select name="year" value={draft.year} onChange={event => setDraft(current => ({ ...current, year: event.target.value }))}><option value="">全部年份</option>{years.map(year => <option key={year} value={year}>{year}</option>)}</select></label>
      {statuses.length > 1 && <label>状态<select name="status" value={draft.status} onChange={event => setDraft(current => ({ ...current, status: event.target.value }))}><option value="">全部状态</option>{statuses.map(status => <option key={status} value={status}>{status}</option>)}</select></label>}
      <button type="submit">应用筛选</button>
      {active && <button type="button" onClick={clear}>清除</button>}
      {extraLink && <Link href={extraLink.href}>{extraLink.label}</Link>}
    </form>
    <p className="archive-sort-note" aria-live="polite">按时间从早到晚 · 当前显示 {filtered.length} 篇</p>
    <ArchiveList items={filtered} />
  </>
}
