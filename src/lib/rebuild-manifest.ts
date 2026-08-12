import fs from 'node:fs'
import path from 'node:path'

export type RebuildItem = {
  id: string
  sourcePath: string
  targetPath: string
  title: string
  person: string
  collection: string
  kind: string
  year: number | null
  wordCount: number | null
  summary: string | null
  sourceUrl?: string | null
}

type Manifest = { total: number; items: RebuildItem[] }

let cache: Manifest | null = null

export function getRebuildManifest(): Manifest {
  if (cache) return cache
  const manifestPath = path.join(process.cwd(), 'content/rebuild/migration-manifest.json')
  cache = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Manifest
  return cache
}

export function getRebuildCollection(person: string, collection: string) {
  return getRebuildManifest().items.filter((item) => item.person === person && item.collection === collection)
}

export function collectionCount(person: string, collection: string) {
  return getRebuildCollection(person, collection).length
}

export function getRebuildItem(person: string, collection: string, slug: string) {
  return getRebuildCollection(person, collection).find((item) => item.targetPath.endsWith(`/${slug}`)) || null
}

export function getRebuildWriters() {
  const grouped = new Map<string, RebuildItem[]>()
  for (const item of getRebuildCollection('writer', 'writers')) {
    const writer = item.summary || '未署名作者'
    grouped.set(writer, [...(grouped.get(writer) || []), item])
  }
  return [...grouped].map(([name, items]) => ({ name, items })).sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
}

export function getRebuildWriter(name: string) {
  return getRebuildWriters().find((writer) => writer.name === name) || null
}

export function getRebuildRouteParams() {
  return getRebuildManifest().items.map((item) => ({
    person: item.person,
    collection: item.collection,
    slug: item.targetPath.split('/').pop() || '',
  }))
}

export function getRebuildCollectionParams() {
  return [...new Map(getRebuildManifest().items.map((item) => [`${item.person}/${item.collection}`, { person: item.person, collection: item.collection }])).values()]
}
