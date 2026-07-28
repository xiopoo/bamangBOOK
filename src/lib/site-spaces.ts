export type SiteSpace = 'buffett' | 'munger'

const spaceFallback: Record<SiteSpace, string> = {
  buffett: '/buffett',
  munger: '/munger',
}

function configuredDomain(): string | null {
  const value = process.env.NEXT_PUBLIC_SITE_DOMAIN?.trim()
  if (!value || value === 'example.com') return null
  return value.replace(/^https?:\/\//, '').replace(/\/+$/, '')
}

export function getSpaceHref(space: SiteSpace, path = '/'): string {
  const domain = configuredDomain()
  if (!domain) {
    if (path === '/') return spaceFallback[space]
    return path
  }
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `https://${space}.${domain}${suffix}`
}

