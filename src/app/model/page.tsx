import Link from 'next/link'
import type { Metadata } from 'next'
import PageContainer from '@/components/PageContainer'
import { getModelsByDiscipline, getModelStats } from '@/lib/models'

export const metadata: Metadata = {
  title: '多元思维模型库',
  description: '综合整理查理·芒格的多元思维模型、人类误判心理学与跨学科决策工具。',
}

export default function ModelPage() {
  const groups = getModelsByDiscipline()
  const stats = getModelStats()

  return (
    <PageContainer maxWidth="6xl" className="model-library">
      <header className="model-library__hero">
        <p className="model-library__kicker">LATTICEWORK OF MENTAL MODELS</p>
        <h1>多元思维模型库</h1>
        <p className="model-library__lede">
          从心理学、数学、经济学到工程学，以跨学科模型建立一张可反复检索、彼此校验的思考格栅。
        </p>
        <div className="model-library__ledger" aria-label="模型库统计">
        {[
          { label: '思维模型', value: stats.total },
          { label: '学科', value: stats.disciplines },
          { label: '应用场景', value: stats.scenarios },
          { label: '核心模型', value: stats.core },
        ].map(item => (
          <div key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
        </div>
      </header>

      <section className="model-library__feature">
        <div>
          <p>专题入口 · 人类误判心理学</p>
          <h2>先理解人为什么会持续犯错</h2>
        </div>
        <p>
          芒格把常见的认知偏误整理成一套相互作用的心理倾向。它既是理解其他模型的起点，也是投资与决策中最常用的检查表。
        </p>
        <Link href="/model/psychology-of-human-misjudgment">进入专题 →</Link>
      </section>

      <nav className="model-library__index" aria-label="学科索引">
        <span>按学科浏览</span>
        <div>
          {groups.map((group, index) => (
            <a key={group.id} href={`#discipline-${group.id}`}>
              {String(index + 1).padStart(2, '0')} {group.name}
            </a>
          ))}
        </div>
      </nav>

      <div className="model-library__groups">
        {groups.map((group, groupIndex) => (
          <section key={group.id} id={`discipline-${group.id}`} className="model-discipline">
            <header className="model-discipline__heading">
              <span>{String(groupIndex + 1).padStart(2, '0')}</span>
              <h2>{group.name}</h2>
              <p>{group.models.length} 个模型</p>
            </header>
            <div className="model-discipline__list">
              {group.models.map((model, modelIndex) => (
                <Link key={model.slug} href={`/model/${model.slug}`} className="model-entry">
                  <span className="model-entry__number">{String(modelIndex + 1).padStart(2, '0')}</span>
                  <div className="model-entry__body">
                    <div className="model-entry__title">
                      <h3>{model.title}</h3>
                      {model.importance >= 5 && <span>核心</span>}
                    </div>
                    {model.english && <p className="model-entry__english">{model.english}</p>}
                    {model.description && <p className="model-entry__description">{model.description}</p>}
                  </div>
                  <span className="model-entry__arrow" aria-hidden="true">↗</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
      <p className="model-library__source">
        本库综合原有模型资料与 Munger Archive 整理；同名及同义模型已归并为单一条目，并在详情页保留来源。
      </p>

    </PageContainer>
  )
}
