export type DocumentRouteCategory = 'talks' | 'interviews' | 'qa'

/**
 * Public content routes are generated in one place so list pages, homepage
 * recommendations and static route generation cannot drift apart.
 */
export function documentHref(category: DocumentRouteCategory, item: { fileName: string }): string {
  if (!item.fileName) {
    throw new Error(`Cannot build ${category} route without fileName`)
  }

  return `/${category}/${encodeURIComponent(item.fileName)}`
}

export function businessHistoryHref(slug: string): string {
  if (!slug) {
    throw new Error('Cannot build business-history route without slug')
  }

  return `/business-history/${encodeURIComponent(slug)}`
}
