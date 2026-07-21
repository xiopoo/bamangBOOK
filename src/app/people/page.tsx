import Link from 'next/link'
import { readFileSync } from 'fs'
import path from 'path'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import PageFooter from '@/components/PageFooter'
import StatBadge from '@/components/StatBadge'

interface Person {
  id: string
  count: number
  years: number[]
}

export default function PeoplePage() {
  let people: Person[] = []
  try {
    const indexPath = path.join(process.cwd(), 'content/index.json')
    const indexData = JSON.parse(readFileSync(indexPath, 'utf-8'))
    people = indexData.people || []
  } catch (e) {
    console.error('Failed to read index:', e)
  }

  const mergedPeople: { [key: string]: Person } = {}
  people.forEach(person => {
    let normalizedName = person.id
    if (person.id === 'Buffett' || person.id === '沃伦·巴菲特' || person.id === 'Warren Buffett') {
      normalizedName = '巴菲特'
    } else if (person.id === 'Munger' || person.id === 'Charlie Munger' || person.id === '查理·芒格') {
      normalizedName = '芒格'
    } else if (person.id === 'Graham' || person.id === '本杰明·格雷厄姆') {
      normalizedName = '格雷厄姆'
    } else if (person.id === 'Greg Abel' || person.id === '格雷格·阿贝尔' || person.id === 'Abel' || person.id === '阿贝尔') {
      normalizedName = '格雷格·阿贝尔'
    } else if (person.id === 'Tom Murphy' || person.id === '汤姆·墨菲') {
      normalizedName = '汤姆·墨菲'
    } else if (person.id === 'Fisher' || person.id === '费雪') {
      normalizedName = '费雪'
    } else if (person.id === 'Pete Liegl' || person.id === '皮特·利格尔') {
      normalizedName = '皮特·利格尔'
    }

    if (!mergedPeople[normalizedName]) {
      mergedPeople[normalizedName] = { id: normalizedName, count: 0, years: [] }
    }
    mergedPeople[normalizedName].count += person.count
    mergedPeople[normalizedName].years = [...new Set([...mergedPeople[normalizedName].years, ...person.years])]
  })

  const uniquePeople = Object.values(mergedPeople).sort((a, b) => b.count - a.count)

  return (
    <PageContainer maxWidth="7xl">
      <PageHeader
        title="关键人物"
        subtitle="巴菲特投资生涯中的关键人物档案"
        sticky
      />

      <div className="mb-8">
        <StatBadge icon="👤" count={uniquePeople.length} label="关键人物" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {uniquePeople.map((person) => (
          <Link
            key={person.id}
            href={`/people/${encodeURIComponent(person.id)}`}
            className="bg-white dark:bg-[#16213e] p-5 rounded-lg border border-gray-100 dark:border-[#2a2a4a] hover:border-purple-200 dark:hover:border-purple-600 hover:shadow-sm dark:hover:shadow-lg dark:hover:shadow-black/20 transition-all"
          >
            <div className="font-medium text-text dark:text-dark-text mb-2">{person.id}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              提及 {person.count} 次
            </div>
            {person.years.length > 0 && (
              <div className="text-xs text-gray-400 dark:text-gray-500">
                跨 {person.years.length} 年
              </div>
            )}
          </Link>
        ))}
      </div>

      <PageFooter />
    </PageContainer>
  )
}
