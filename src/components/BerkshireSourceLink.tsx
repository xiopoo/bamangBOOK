import { ExternalLink } from 'lucide-react'
import { getBerkshireShareholderSource } from '@/lib/berkshire-sources'

interface BerkshireSourceLinkProps {
  year: number
}

export default function BerkshireSourceLink({ year }: BerkshireSourceLinkProps) {
  const source = getBerkshireShareholderSource(year)
  if (!source) return null

  return (
    <div className="mt-8 border-t border-primary/15 pt-5 text-sm">
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        title={source.description}
        className="inline-flex items-center gap-1.5 font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:text-primary-light hover:decoration-primary dark:text-primary-light"
      >
        {source.format === 'archive' ? '伯克希尔官网档案说明' : '伯克希尔官方英文原文'}
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
      </a>
    </div>
  )
}
