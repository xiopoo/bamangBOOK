import * as d3 from 'd3'

// 节点类型
export type NodeType = 'concept' | 'company' | 'person'

// 图节点接口
export interface GraphNode extends d3.SimulationNodeDatum {
  id: string
  name: string
  type: NodeType
  count: number
  years: number[]
  category: string
  description?: string
}

// 图链接接口
export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode
  target: string | GraphNode
  type: 'cooccurrence' | 'mention'
  weight: number
  label: string
}

export interface NodesApiResponse {
  nodes: Array<{
    id: string
    name: string
    type: NodeType
    count: number
    years: number[]
    category: string
    description?: string
  }>
  links: Array<{
    source: string
    target: string
    type: 'cooccurrence' | 'mention'
    weight: number
    label: string
  }>
  stats: {
    totalNodes: number
    totalConcepts: number
    totalPeople: number
    totalCompanies: number
    totalLinks: number
  }
}

// 可视化模式
export type GraphMode = 'force' | 'tree' | 'mindmap' | 'cards'

// 颜色映射
export const colorMap: Record<NodeType, string> = {
  concept: '#C85A17',
  company: '#3b82f6',
  person: '#22c55e',
}

export const bgColorMap: Record<NodeType, string> = {
  concept: 'bg-orange-100 text-orange-600',
  company: 'bg-blue-100 text-blue-600',
  person: 'bg-green-100 text-green-600',
}

export const typeLabels: Record<NodeType, string> = {
  concept: '投资概念',
  company: '公司',
  person: '人物',
}

export const typeList: NodeType[] = ['concept', 'company', 'person']
