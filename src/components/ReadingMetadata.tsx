import Link from 'next/link'

export interface ReadingMetadataProps {
  person?: string
  year?: number | string
  contentType: string
  readMinutes?: number
}

// 人物标签 → 人物页
const PERSON_HREF: Record<string, string> = {
  '巴菲特': '/buffett',
  '沃伦·巴菲特': '/buffett',
  '芒格': '/munger',
  '查理·芒格': '/munger',
  '段永平': '/duanyongping',
}

// 类别标签 → 类别列表页（一个目的地只保留一个标签文案，避免同一标签映射多个页面）
const CATEGORY_HREF: Record<string, string> = {
  '股东大会': '/qa',
  '股东大会问答': '/qa',
  '股东大会实录': '/meetings',
  '问答': '/buffett-faq',
  '巴菲特问答': '/buffett-faq',
  '演讲': '/talks',
  '访谈': '/interviews',
  '信件': '/letters',
  '股东信': '/letters',
  '合伙人信': '/partnership',
  '公司研究': '/business-history',
  '商业史': '/duanyongping/milestones',
  '网易博客': '/duanyongping/blog',
  '雪球问答': '/duanyongping/qa',
  '演讲访谈': '/duanyongping/talks',
  '穷查理宝典': '/poor-charlies-almanack',
  '思维模型': '/model',
  '芒格文章': '/munger/archive',
  '文章': '/articles',
}

function renderLabel(text: string, map: Record<string, string>, key: string) {
  const href = map[text]
  return href
    ? <Link key={key} href={href}>{text}</Link>
    : <span key={key}>{text}</span>
}

/** 阅读元数据标签：人物与类别为可点击标签（分别指向人物页与类别页），年份与时长保持文本。
 *  来源、状态、完整度、修订时间等编辑性信息已移除，正文保持干净。 */
export default function ReadingMetadata({ person, year, contentType, readMinutes }: ReadingMetadataProps) {
  const personSegments = person ? person.split('、').map(s => s.trim()).filter(Boolean) : []
  return (
    <div className="reading-metadata" aria-label="阅读资料信息">
      <div className="reading-metadata__primary">
        {[
          ...personSegments.map(s => renderLabel(s, PERSON_HREF, `p-${s}`)),
          year ? <span key="y">{year}</span> : null,
          renderLabel(contentType, CATEGORY_HREF, 'c'),
          readMinutes ? <span key="m">{readMinutes} 分钟</span> : null,
        ].filter(Boolean)}
      </div>
    </div>
  )
}
