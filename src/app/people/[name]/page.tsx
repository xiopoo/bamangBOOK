import Link from 'next/link'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import MarkdownContent from '@/components/MarkdownContent'
import { resolveEntityLink, resolvePersonContentFile } from '@/lib/entity-resolver'

interface PageProps {
  params: { name: string }
}

function processPersonLinks(content: string): string {
  if (!content.includes('[[')) return content
  return content.replace(/\[\[([^\]]+)\]\]/g, (_match, entity: string) => {
    const href = resolveEntityLink(entity)
    // 未识别为任何实体（人物/公司/概念/信件）时降级为纯文本，避免生成空占位页链接
    return href ? `[${entity}](${href})` : entity
  })
}

export default function PersonDetailPage({ params }: PageProps) {
  const personName = decodeURIComponent(params.name)

  let stats = { count: 0, years: [] as number[] }
  let aliases: string[] = []

  try {
    const indexPath = path.join(process.cwd(), 'content/index.json')
    const indexData = JSON.parse(readFileSync(indexPath, 'utf-8'))
    const allPeople = indexData.people || []

    const aliasMap: { [key: string]: string[] } = {
      '巴菲特': ['Buffett', '沃伦·巴菲特', 'Warren Buffett'],
      '芒格': ['Munger', 'Charlie Munger', '查理·芒格'],
      '格雷厄姆': ['Graham', '本杰明·格雷厄姆'],
      '格雷格·阿贝尔': ['Greg Abel', 'Abel', '阿贝尔'],
      '汤姆·墨菲': ['Tom Murphy'],
      '费雪': ['Fisher'],
      '皮特·利格尔': ['Pete Liegl']
    }

    aliases = aliasMap[personName] || []

    const matchingPeople = allPeople.filter((p: { id: string }) =>
      p.id === personName || aliases.includes(p.id)
    )

    matchingPeople.forEach((p: { count: number; years: number[] }) => {
      stats.count += p.count || 0
      stats.years = [...new Set([...stats.years, ...(p.years || [])])]
    })

    stats.years.sort((a, b) => a - b)
  } catch (e) {
    console.error('Failed to read index:', e)
  }

  const personInfo: { [key: string]: { title: string; description: string } } = {
    '巴菲特': {
      title: '沃伦·巴菲特 (Warren Buffett)',
      description: '伯克希尔哈撒韦公司董事长兼CEO，被誉为"奥马哈先知"，价值投资的践行者'
    },
    '芒格': {
      title: '查理·芒格 (Charlie Munger)',
      description: '伯克希尔哈撒韦公司副董事长，巴菲特的长期合作伙伴，多元思维模型的倡导者'
    },
    '格雷厄姆': {
      title: '本杰明·格雷厄姆 (Benjamin Graham)',
      description: '价值投资之父，《证券分析》和《聪明的投资者》作者，巴菲特的投资启蒙导师'
    },
    '格雷格·阿贝尔': {
      title: '格雷格·阿贝尔 (Greg Abel)',
      description: '伯克希尔哈撒韦能源公司CEO，伯克希尔非保险业务的负责人'
    },
    '汤姆·墨菲': {
      title: '汤姆·墨菲 (Tom Murphy)',
      description: '大都会ABC公司CEO，巴菲特推崇的管理者典范'
    },
    '费雪': {
      title: '菲利普·费雪 (Philip Fisher)',
      description: '成长股投资之父，《普通股和不普通的利润》作者'
    },
    '皮特·利格尔': {
      title: '皮特·利格尔 (Pete Liegl)',
      description: '森林河公司创始人，巴菲特收购的优质企业'
    }
  }

  const info = personInfo[personName] || { title: personName, description: '关键人物' }

  const personPath = resolvePersonContentFile(personName)
  let content = ''
  let hasContent = false
  if (personPath && existsSync(personPath)) {
    content = processPersonLinks(readFileSync(personPath, 'utf-8'))
    hasContent = true
  }

  return (
    <div className="min-h-screen bg-bg-card dark:bg-dark-bg px-4 md:px-8 lg:px-12 py-8 md:py-12">
      <div className="max-w-4xl mx-auto mb-6">
        <Link
          href="/people"
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors mb-4"
        >
          ← 返回人物列表
        </Link>
        <h1 className="text-2xl md:text-4xl font-bold text-[#2c2c2c] dark:text-[#e0e0e0] mb-2">
          {info.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{info.description}</p>
      </div>

      <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-lg p-6 mb-8 border border-purple-200 dark:border-purple-900/50 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className="text-2xl">👤</div>
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats.count}次</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">提及次数</div>
              </div>
              {stats.years.length > 0 && (
                <div>
                  <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats.years.length}年</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">跨年份提及</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {aliases.length > 0 && (
        <div className="max-w-4xl mx-auto mb-6">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">相关名称</h2>
          <div className="flex flex-wrap gap-2">
            {aliases.map((alias) => (
              <span
                key={alias}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm text-gray-600 dark:text-gray-400"
              >
                {alias}
              </span>
            ))}
          </div>
        </div>
      )}

      {stats.years.length > 0 && (
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-lg font-semibold text-[#2c2c2c] dark:text-[#e0e0e0] mb-3">提及年份</h2>
          <div className="flex flex-wrap gap-2">
            {stats.years.slice(0, 30).map((year) => (
              <Link
                key={year}
                href={`/letters/${year}`}
                className="px-3 py-1 bg-white dark:bg-[#16213e] border border-gray-200 dark:border-[#2a2a4a] rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-purple-200 dark:hover:border-purple-600 transition-colors"
              >
                {year}
              </Link>
            ))}
            {stats.years.length > 30 && (
              <span className="px-3 py-1 text-sm text-gray-400">
                +{stats.years.length - 30}年
              </span>
            )}
          </div>
        </div>
      )}

      {hasContent ? (
        <div className="max-w-4xl mx-auto bg-white dark:bg-dark-card rounded-card border border-gray-100 dark:border-dark-border p-8 shadow-card hover:shadow-card-hover transition-shadow">
          <MarkdownContent content={content} />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto bg-gray-50 dark:bg-dark-card rounded-card p-8 text-center border border-gray-100 dark:border-dark-border shadow-card">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-gray-500 dark:text-gray-400">人物详细档案正在整理中</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">请查看相关年份的股东信获取更多信息</p>
        </div>
      )}

      <div className="max-w-4xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400 pt-8 mt-8 border-t border-gray-100 dark:border-[#2a2a4a]">
        巴芒书房
      </div>
    </div>
  )
}
