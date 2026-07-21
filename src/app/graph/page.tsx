'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'

interface GraphNode {
  id: string
  name: string
  type: 'concept' | 'company' | 'person'
  count: number
  years: number[]
  category: string
  description: string
}

interface GraphLink {
  source: string
  target: string
  type: 'cooccurrence' | 'mention'
  weight: number
  label: string
}

interface NodesApiResponse {
  nodes: GraphNode[]
  links: GraphLink[]
  stats: {
    totalNodes: number
    totalConcepts: number
    totalPeople: number
    totalCompanies: number
    totalLinks: number
  }
}

function getNodeUrl(node: GraphNode): string {
  const name = encodeURIComponent(node.name)
  switch (node.type) {
    case 'concept': return `/concepts/${name}`
    case 'company': return `/companies/${name}`
    case 'person': return `/people/${name}`
    default: return '/'
  }
}

function getTypeIcon(type: string): string {
  return type === 'concept' ? '💡' : type === 'company' ? '🏢' : '👤'
}

function getTypeLabel(type: string): string {
  return type === 'concept' ? '概念' : type === 'company' ? '公司' : '人物'
}

export default function ConnectionExplorer() {
  const [allNodes, setAllNodes] = useState<GraphNode[]>([])
  const [allLinks, setAllLinks] = useState<GraphLink[]>([])
  const [stats, setStats] = useState<NodesApiResponse['stats'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'concept' | 'company' | 'person'>('all')

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const res = await fetch('/api/graph/nodes')
        const data: NodesApiResponse = await res.json()
        setAllNodes(data.nodes)
        setAllLinks(data.links)
        setStats(data.stats)
      } catch (err) {
        console.error('Failed to fetch graph data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Build node lookup
  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>()
    allNodes.forEach(n => map.set(n.id, n))
    return map
  }, [allNodes])

  // Filter nodes for sidebar
  const filteredNodes = useMemo(() => {
    return allNodes.filter(n => {
      if (filterType !== 'all' && n.type !== filterType) return false
      if (searchQuery && !n.name.includes(searchQuery)) return false
      return true
    })
  }, [allNodes, filterType, searchQuery])

  // Group filtered nodes by type
  const groupedNodes = useMemo(() => {
    const groups: Record<string, GraphNode[]> = { concept: [], company: [], person: [] }
    filteredNodes.forEach(n => groups[n.type].push(n))
    // Sort by count desc
    groups.concept.sort((a, b) => b.count - a.count)
    groups.company.sort((a, b) => b.count - a.count)
    groups.person.sort((a, b) => b.count - a.count)
    return groups
  }, [filteredNodes])

  // Selected node
  const selectedNode = useMemo(() => {
    return selectedId ? nodeMap.get(selectedId) || null : null
  }, [selectedId, nodeMap])

  // Connections for selected node
  const connections = useMemo(() => {
    if (!selectedNode) return { strong: [], weak: [], people: [], companies: [], concepts: [] }

    const result: {
      strong: Array<{ node: GraphNode; weight: number }>
      weak: Array<{ node: GraphNode; weight: number }>
      people: Array<{ node: GraphNode; weight: number }>
      companies: Array<{ node: GraphNode; weight: number }>
      concepts: Array<{ node: GraphNode; weight: number }>
    } = { strong: [], weak: [], people: [], companies: [], concepts: [] }

    allLinks.forEach(link => {
      let otherId: string | null = null
      if (link.source === selectedNode.id) otherId = link.target
      else if (link.target === selectedNode.id) otherId = link.source
      if (!otherId) return

      const otherNode = nodeMap.get(otherId)
      if (!otherNode) return

      const entry = { node: otherNode, weight: link.weight }

      // Sort into buckets
      if (otherNode.type === 'concept') {
        result.concepts.push(entry)
        if (link.weight >= 10) result.strong.push(entry)
        else result.weak.push(entry)
      } else if (otherNode.type === 'company') {
        result.companies.push(entry)
      } else if (otherNode.type === 'person') {
        result.people.push(entry)
      }
    })

    // Sort by weight
    result.strong.sort((a, b) => b.weight - a.weight)
    result.weak.sort((a, b) => b.weight - a.weight)
    result.concepts.sort((a, b) => b.weight - a.weight)
    result.companies.sort((a, b) => b.weight - a.weight)
    result.people.sort((a, b) => b.weight - a.weight)

    return result
  }, [selectedNode, allLinks, nodeMap])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-card flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
          <p className="text-gray-500">加载知识关联数据...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-card text-text flex">
      {/* Left sidebar: node list */}
      <aside className="w-72 md:w-80 shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card flex flex-col">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold font-serif text-gray-900 dark:text-white mb-3">
            🧠 知识关联浏览器
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            选择一个概念、公司或人物，查看其关联网络
          </p>
          <input
            type="text"
            placeholder="搜索节点..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <div className="flex gap-1 mt-2">
            {(['all', 'concept', 'company', 'person'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                  filterType === t
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {t === 'all' ? '全部' : t === 'concept' ? `概念(${stats?.totalConcepts})` : t === 'company' ? `公司(${stats?.totalCompanies})` : `人物(${stats?.totalPeople})`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {(['concept', 'company', 'person'] as const).map(type => {
            const nodes = groupedNodes[type]
            if (nodes.length === 0) return null
            return (
              <div key={type} className="mb-3">
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase px-2 py-1">
                  {getTypeIcon(type)} {getTypeLabel(type)}
                </div>
                {nodes.map(node => (
                  <button
                    key={node.id}
                    onClick={() => setSelectedId(node.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                      selectedId === node.id
                        ? 'bg-primary/10 dark:bg-primary/20 text-primary font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="truncate">{node.name}</span>
                    <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                      {node.count}
                    </span>
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      </aside>

      {/* Right: detail panel */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        {!selectedNode ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="max-w-md">
              <div className="text-6xl mb-4">🧠</div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2 font-serif">
                选择一个节点开始探索
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                左侧列表中包含了 {stats?.totalConcepts} 个概念、{stats?.totalCompanies} 家公司、{stats?.totalPeople} 位人物，共 {stats?.totalLinks} 条关联。
              </p>
            </div>
          </div>
        ) : (
          <div>
            {/* Selected node header */}
            <div className="mb-6">
              <Link href={getNodeUrl(selectedNode)} className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors mb-2">
                <span>查看详情页 →</span>
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getTypeIcon(selectedNode.type)}</span>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold font-serif text-gray-900 dark:text-white">
                    {selectedNode.name}
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs">
                      {getTypeLabel(selectedNode.type)}
                    </span>
                    <span>提及 {selectedNode.count.toLocaleString()} 次</span>
                    {selectedNode.years.length > 0 && (
                      <span>{selectedNode.years[0]} - {selectedNode.years[selectedNode.years.length - 1]}</span>
                    )}
                  </div>
                  {selectedNode.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-2xl line-clamp-2">
                      {selectedNode.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Strong connections */}
            {connections.strong.length > 0 && (
              <section className="mb-8">
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-3 font-serif">
                  📌 强关联概念
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {connections.strong.map(({ node, weight }) => (
                    <ConnectionCard key={node.id} node={node} weight={weight} highlight />
                  ))}
                </div>
              </section>
            )}

            {/* Concept connections */}
            {connections.concepts.length > 0 && (
              <section className="mb-8">
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-3 font-serif">
                  💡 关联概念 ({connections.concepts.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {connections.concepts.map(({ node, weight }) => (
                    <ConnectionCard key={node.id} node={node} weight={weight} />
                  ))}
                </div>
              </section>
            )}

            {/* Company connections */}
            {connections.companies.length > 0 && (
              <section className="mb-8">
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-3 font-serif">
                  🏢 关联公司 ({connections.companies.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {connections.companies.map(({ node, weight }) => (
                    <ConnectionCard key={node.id} node={node} weight={weight} />
                  ))}
                </div>
              </section>
            )}

            {/* People connections */}
            {connections.people.length > 0 && (
              <section className="mb-8">
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-3 font-serif">
                  👤 关联人物 ({connections.people.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {connections.people.map(({ node, weight }) => (
                    <ConnectionCard key={node.id} node={node} weight={weight} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function ConnectionCard({ node, weight, highlight }: { node: GraphNode; weight: number; highlight?: boolean }) {
  return (
    <Link
      href={getNodeUrl(node)}
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
        highlight
          ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/20'
          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-primary/30'
      }`}
    >
      <span className="text-xl flex-shrink-0">{getTypeIcon(node.type)}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
          {node.name}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {getTypeLabel(node.type)}
        </div>
      </div>
      <div className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
        highlight
          ? 'bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
      }`}>
        ×{weight}
      </div>
    </Link>
  )
}
