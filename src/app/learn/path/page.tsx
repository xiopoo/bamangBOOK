import { existsSync, readFileSync } from 'fs'
import path from 'path'
import PageContainer from '@/components/PageContainer'
import PageFooter from '@/components/PageFooter'
import PageHeader from '@/components/PageHeader'
import { LearningPathBeginner, LearningPathIntermediate, LearningPathTopics } from '@/components/LearningPathDisplay'
import { getDocuments } from '@/lib/documents'
import { getAllPartnershipLetters } from '@/lib/partnership'

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

function resolveItemHref(item: PathItem): string {
  if (item.category === 'articles') {
    const docs = getDocuments('articles') as Array<ReturnType<typeof getDocuments>[number] & { origFileName?: string }>
    const matched = docs.find((doc) => doc.origFileName === item.file || doc.fileName === item.file)
    return matched ? `/articles/${encodeURIComponent(matched.fileName)}` : '/articles'
  }
  if (item.category === 'letters') {
    const year = item.file.match(/(?:19|20)\d{2}/)?.[0]
    return year ? `/letters/${year}` : '/letters'
  }
  if (item.category === 'partnership') {
    const letter = getAllPartnershipLetters().find((entry) => entry.filename === item.file)
    return letter ? `/partnership/${letter.id}` : '/partnership'
  }
  const name = item.file.replace(/\.md$/, '')
  if (item.category === 'concepts') return `/concepts/${encodeURIComponent(name)}`
  if (item.category === 'companies') return `/companies/${encodeURIComponent(name)}`
  if (item.category === 'people') return `/people/${encodeURIComponent(name)}`
  return '/'
}

function withResolvedLinks<T extends { steps: PathStep[] }>(data: T): T {
  return {
    ...data,
    steps: data.steps.map((step) => ({
      ...step,
      items: step.items.map((item) => ({ ...item, href: resolveItemHref(item) })),
    })),
  }
}

function readPath<T>(name: string): T | null {
  const filePath = path.join(process.cwd(), 'content/paths', name)
  return existsSync(filePath) ? JSON.parse(readFileSync(filePath, 'utf-8')) as T : null
}

export default function OptionalLearningPathPage() {
  const beginnerData = readPath<LearningPath>('beginner.json')
  const intermediateData = readPath<LearningPath>('intermediate.json')
  const topicsData = readPath<TopicsPath>('topics.json')
  const beginner = beginnerData ? withResolvedLinks(beginnerData) : null
  const intermediate = intermediateData ? withResolvedLinks(intermediateData) : null
  const topics = topicsData
    ? { ...topicsData, subPaths: topicsData.subPaths.map((subPath) => withResolvedLinks(subPath)) }
    : null

  return (
    <PageContainer maxWidth="5xl">
      <PageHeader
        title="可选阅读地图"
        subtitle="当你需要一个起点时使用；它不是课表，也不要求按顺序完成。"
        backHref="/learn"
        backLabel="返回学习室"
      />
      {beginner && <LearningPathBeginner path={beginner} />}
      {intermediate && <LearningPathIntermediate path={intermediate} />}
      {topics && <LearningPathTopics topics={topics} />}
      <PageFooter />
    </PageContainer>
  )
}
