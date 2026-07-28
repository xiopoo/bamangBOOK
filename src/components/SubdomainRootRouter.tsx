'use client'

import { useEffect } from 'react'

const rootDestinations: Record<string, string> = {
  buffett: '/buffett',
  munger: '/munger',
}

export default function SubdomainRootRouter() {
  useEffect(() => {
    if (window.location.pathname !== '/') return
    const subdomain = window.location.hostname.split('.')[0]
    const destination = rootDestinations[subdomain]
    if (destination) window.location.replace(destination)
  }, [])

  return null
}

