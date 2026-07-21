import { readFileSync, existsSync } from 'fs'
import path from 'path'
import PageContainer from '@/components/PageContainer'
import PageFooter from '@/components/PageFooter'
import { LearningPathBeginner, LearningPathIntermediate, LearningPathTopics } from '@/components/LearningPathDisplay'

interface PathItem {
  type: string
  category: string
  file: string
  note: string
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

function getPathsData(): { beginner: LearningPath | null; intermediate: LearningPath | null; topics: TopicsPath | null } {
  const base = path.join(process.cwd(), 'content/paths')
  const read = (name: string) => {
    const fp = path.join(base, name)
    return existsSync(fp) ? JSON.parse(readFileSync(fp, 'utf-8')) : null
  }
  return {
    beginner: read('beginner.json'),
    intermediate: read('intermediate.json'),
    topics: read('topics.json'),
  }
}

export default function LearnPage() {
  const paths = getPathsData()

  return (
    <PageContainer maxWidth="5xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-serif mb-3">
          🗺️ 学习路径
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          三条渐进式路径，从入门到精通。勾选方块记录进度，数据保存在本地浏览器中。
        </p>
      </div>

      {/* Client components manage their own progress state */}
      {paths.beginner && <LearningPathBeginner path={paths.beginner} />}
      {paths.intermediate && <LearningPathIntermediate path={paths.intermediate} />}
      {paths.topics && <LearningPathTopics topics={paths.topics} />}

      <div className="text-center mt-8 mb-4">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          进度数据保存在浏览器本地存储中，不会上传到服务器。
        </p>
      </div>
      <PageFooter />
    </PageContainer>
  )
}
