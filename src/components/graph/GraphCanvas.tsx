'use client'

import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react'
import * as d3 from 'd3'
import { GraphNode, GraphLink, GraphMode, colorMap, typeList } from './types'

export interface GraphCanvasHandle {
  focusOnNode: (node: GraphNode) => void
  resetView: () => void
  zoomIn: () => void
  zoomOut: () => void
}

interface GraphCanvasProps {
  nodes: GraphNode[]
  links: GraphLink[]
  selectedNode: GraphNode | null
  onNodeClick: (node: GraphNode) => void
  highlightNodeId?: string | null
  mode?: GraphMode
}

// 按 count 值分级的辅助函数
function getNodeLevel(count: number): 'high' | 'medium' | 'low' {
  if (count > 50) return 'high'
  if (count >= 10) return 'medium'
  return 'low'
}

// 节点半径计算
function getNodeRadius(d: GraphNode): number {
  const baseRadius = Math.sqrt((d.count || 1)) * 2 + 8
  const level = getNodeLevel(d.count || 1)
  if (level === 'high') return baseRadius * 1.4
  if (level === 'low') return baseRadius * 0.7
  return baseRadius
}

function getNodeOpacity(d: GraphNode): number {
  const level = getNodeLevel(d.count || 1)
  if (level === 'high') return 1
  if (level === 'low') return 0.65
  return 0.85
}

function getNodeStrokeWidth(d: GraphNode): number {
  const level = getNodeLevel(d.count || 1)
  if (level === 'high') return 3.5
  if (level === 'low') return 1.5
  return 2
}

// 构建树形分层数据（用于 tree / mindmap 模式）
function buildTreeHierarchy(
  nodes: GraphNode[],
  links: GraphLink[]
): d3.HierarchyNode<{ id: string; name: string; node: GraphNode }> {
  // 统计每个节点的连接数
  const connCount = new Map<string, number>()
  nodes.forEach(n => connCount.set(n.id, 0))
  links.forEach(l => {
    const sId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id
    const tId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id
    connCount.set(sId, (connCount.get(sId) || 0) + 1)
    connCount.set(tId, (connCount.get(tId) || 0) + 1)
  })

  // 找到连接数最多的节点作为根
  let rootId = nodes[0]?.id || ''
  let maxCount = 0
  connCount.forEach((count, id) => {
    if (count > maxCount) {
      maxCount = count
      rootId = id
    }
  })

  // 构建邻接表
  const adj = new Map<string, string[]>()
  nodes.forEach(n => adj.set(n.id, []))
  links.forEach(l => {
    const sId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id
    const tId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id
    adj.get(sId)?.push(tId)
    adj.get(tId)?.push(sId)
  })

  // BFS 构建层级树
  const visited = new Set<string>()

  function buildSubTree(
    id: string
  ): { id: string; name: string; node: GraphNode; children?: any[] } | null {
    if (visited.has(id)) return null
    visited.add(id)

    const node = nodes.find(n => n.id === id)!
    if (!node) return null

    const children: any[] = []
    for (const neighbor of adj.get(id) || []) {
      if (!visited.has(neighbor)) {
        const child = buildSubTree(neighbor)
        if (child) children.push(child)
      }
    }

    return {
      id,
      name: node.name,
      node,
      children: children.length > 0 ? children : undefined,
    }
  }

  const rootData = buildSubTree(rootId)!

  // 处理孤岛节点（从根无法到达的节点），作为根的子节点附加上
  const orphanNodes = nodes.filter(n => !visited.has(n.id))
  if (orphanNodes.length > 0) {
    if (!rootData.children) rootData.children = []
    for (const orphan of orphanNodes) {
      visited.add(orphan.id)
      rootData.children.push({
        id: orphan.id,
        name: orphan.name,
        node: orphan,
        children: undefined,
      })
    }
  }

  return d3.hierarchy(rootData)
}

const GraphCanvas = forwardRef<GraphCanvasHandle, GraphCanvasProps>(
  ({ nodes, links, selectedNode, onNodeClick, highlightNodeId, mode = 'force' }, ref) => {
    const svgRef = useRef<SVGSVGElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null)
    const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)
    const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set())

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      focusOnNode(node: GraphNode) {
        if (svgRef.current && zoomRef.current && node.x != null && node.y != null) {
          const container = containerRef.current
          const width = container?.clientWidth || 800
          const height = container?.clientHeight || 600
          const svg = d3.select(svgRef.current)
          svg.transition().duration(500).call(
            zoomRef.current.transform,
            d3.zoomIdentity.translate(width / 2 - node.x * 1.5, height / 2 - node.y * 1.5).scale(1.5)
          )
        }
      },
      resetView() {
        if (svgRef.current && zoomRef.current) {
          const svg = d3.select(svgRef.current)
          svg.transition().duration(500).call(zoomRef.current.transform, d3.zoomIdentity)
        }
      },
      zoomIn() {
        if (svgRef.current && zoomRef.current) {
          const svg = d3.select(svgRef.current)
          svg.transition().call(zoomRef.current.scaleBy, 1.3)
        }
      },
      zoomOut() {
        if (svgRef.current && zoomRef.current) {
          const svg = d3.select(svgRef.current)
          svg.transition().call(zoomRef.current.scaleBy, 0.7)
        }
      },
    }))

    const renderGraph = useCallback(() => {
      if (!svgRef.current || nodes.length === 0) return

      // 如果已有模拟运行，先停止
      if (simulationRef.current) {
        simulationRef.current.stop()
        simulationRef.current = null
      }

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()

      const container = containerRef.current
      const width = container?.clientWidth || 800
      const height = container?.clientHeight || 600

      // 创建缩放行为
      const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.2, 5])
        .on('zoom', (event) => {
          g.attr('transform', event.transform)
        })

      svg.call(zoomBehavior)
      zoomRef.current = zoomBehavior

      // 创建主容器
      const g = svg.append('g')

      // 定义滤镜和标记
      const defs = svg.append('defs')

      // 箭头标记
      defs.append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '-0 -5 10 10')
        .attr('refX', 20)
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .append('path')
        .attr('d', 'M 0,-5 L 10,0 L 0,5')
        .attr('fill', '#d1d5db')

      // 为每个节点类型创建发光滤镜
      typeList.forEach(type => {
        const filter = defs.append('filter')
          .attr('id', `glow-${type}`)
          .attr('x', '-50%')
          .attr('y', '-50%')
          .attr('width', '200%')
          .attr('height', '200%')
        filter.append('feGaussianBlur')
          .attr('stdDeviation', '3')
          .attr('result', 'blur')
        const merge = filter.append('feMerge')
        merge.append('feMergeNode').attr('in', 'blur')
        merge.append('feMergeNode').attr('in', 'SourceGraphic')
      })

      // 背景网格
      const pattern = defs.append('pattern')
        .attr('id', 'grid')
        .attr('width', 40)
        .attr('height', 40)
        .attr('patternUnits', 'userSpaceOnUse')
      pattern.append('path')
        .attr('d', 'M 40 0 L 0 0 0 40')
        .attr('fill', 'none')
        .attr('stroke', '#f0f0f0')
        .attr('stroke-width', 0.5)

      g.append('rect')
        .attr('width', width * 3)
        .attr('height', height * 3)
        .attr('x', -width)
        .attr('y', -height)
        .attr('fill', 'url(#grid)')

      // === 根据模式分发渲染 ===
      switch (mode) {
        case 'tree':
          renderTreeLayout(g, width, height)
          break
        case 'mindmap':
          renderMindmapLayout(g, width, height)
          break
        case 'cards':
          renderCardsLayout(g, width, height)
          break
        default:
          renderForceLayout(g, width, height)
          break
      }

      return () => {
        if (simulationRef.current) {
          simulationRef.current.stop()
          simulationRef.current = null
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nodes, links, onNodeClick, mode, collapsedIds])

    // ========== 力导向图模式 ==========
    function renderForceLayout(
      g: d3.Selection<SVGGElement, unknown, null, undefined>,
      width: number,
      height: number
    ) {
      // 创建力导向模拟
      const simulation = d3.forceSimulation<GraphNode>(nodes)
        .velocityDecay(0.6)
        .force('link', d3.forceLink<GraphNode, GraphLink>(links)
          .id(d => d.id)
          .distance(120)
          .strength(l => Math.min(l.weight / 20, 0.6)))
        .force('charge', d3.forceManyBody<GraphNode>().strength(d => -150 - (d.count || 1) * 2))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide<GraphNode>().radius(d => {
          const level = getNodeLevel(d.count || 1)
          const baseRadius = Math.sqrt((d.count || 1)) * 2 + 8
          if (level === 'high') return baseRadius * 1.4 + 5
          if (level === 'low') return baseRadius * 0.7
          return baseRadius + 2
        }))

      simulationRef.current = simulation

      // 绘制链接
      const linkGroup = g.append('g').attr('class', 'links')
      const linkElements = linkGroup.selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke', '#d1d5db')
        .attr('stroke-width', d => Math.max(0.5, Math.sqrt(d.weight) * 1.2))
        .attr('opacity', 0.5)
        .attr('stroke-dasharray', d => d.type === 'mention' ? '4,3' : 'none')

      // 绘制节点组
      const nodeGroup = g.append('g').attr('class', 'nodes')
      const nodeElements = nodeGroup.selectAll('g')
        .data(nodes)
        .join('g')
        .attr('cursor', 'pointer')
        .call(d3.drag<any, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.stop()
            d.fx = d.x ?? 0
            d.fy = d.y ?? 0
          })
          .on('drag', (event, d) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on('end', (event, d) => {
            if (!event.active) {
              setTimeout(() => {
                simulation.alpha(0.3).restart()
                d.fx = null
                d.fy = null
              }, 100)
            }
          }))

      // 节点外圈光晕
      nodeElements.append('circle')
        .attr('class', 'glow-ring')
        .attr('r', d => getNodeRadius(d) + 7)
        .attr('fill', d => {
          const c = d3.color(colorMap[d.type])
          return c ? c.darker(0.3).toString() : colorMap[d.type]
        })
        .attr('opacity', d => {
          const level = getNodeLevel(d.count || 1)
          return level === 'high' ? 0.15 : 0.08
        })
        .attr('pointer-events', 'none')

      // 节点圆形主体
      nodeElements.append('circle')
        .attr('class', 'node-circle')
        .attr('r', getNodeRadius)
        .attr('fill', d => {
          const level = getNodeLevel(d.count || 1)
          if (level === 'high') {
            const c = d3.color(colorMap[d.type])
            return c ? c.darker(0.3).toString() : colorMap[d.type]
          }
          return colorMap[d.type]
        })
        .attr('stroke', '#fff')
        .attr('stroke-width', getNodeStrokeWidth)
        .attr('opacity', getNodeOpacity)
        .attr('filter', d => `url(#glow-${d.type})`)

      // 高频节点加星标装饰
      nodeElements.filter(d => getNodeLevel(d.count || 1) === 'high')
        .append('text')
        .text('★')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', 'rgba(255,255,255,0.9)')
        .attr('font-size', d => Math.max(10, getNodeRadius(d) * 0.5))
        .attr('pointer-events', 'none')

      // 节点标签
      nodeElements.append('text')
        .text(d => d.name)
        .attr('text-anchor', 'middle')
        .attr('dy', d => getNodeRadius(d) + 16)
        .attr('fill', d => {
          const level = getNodeLevel(d.count || 1)
          if (level === 'high') return '#1f2937'
          if (level === 'low') return '#9ca3af'
          return '#374151'
        })
        .attr('font-size', d => {
          const level = getNodeLevel(d.count || 1)
          if (level === 'high') return '13px'
          if (level === 'low') return '10px'
          return '11px'
        })
        .attr('font-weight', d => {
          const level = getNodeLevel(d.count || 1)
          return level === 'high' ? 700 : 500
        })
        .attr('pointer-events', 'none')

      // 悬停交互
      let hoverTimeout: ReturnType<typeof setTimeout> | null = null

      nodeElements.on('click', (_event: any, d: GraphNode) => {
        onNodeClick(d)
      })
      .on('mouseover', function(_event: any, d: GraphNode) {
        if (hoverTimeout) {
          clearTimeout(hoverTimeout)
          hoverTimeout = null
        }

        simulation.stop()

        // 高亮当前节点
        d3.select(this).select('.node-circle')
          .attr('opacity', 1)
          .attr('stroke-width', () => getNodeStrokeWidth(d) + 1)

        d3.select(this).select('.glow-ring')
          .attr('opacity', 0.25)

        // 计算关联节点ID
        const relatedIds = new Set<string>()
        links.forEach(l => {
          const sId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id
          const tId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id
          if (sId === d.id) relatedIds.add(tId)
          if (tId === d.id) relatedIds.add(sId)
        })

        // 高亮关联链接
        linkElements
          .attr('stroke', l => {
            const sId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id
            const tId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id
            return sId === d.id || tId === d.id ? '#C85A17' : '#d1d5db'
          })
          .attr('opacity', l => {
            const sId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id
            const tId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id
            return sId === d.id || tId === d.id ? 0.9 : 0.15
          })
          .attr('stroke-width', l => {
            const sId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id
            const tId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id
            return sId === d.id || tId === d.id
              ? Math.max(1, Math.sqrt((l.weight || 1)) * 2)
              : Math.max(0.5, Math.sqrt((l.weight || 1)) * 1.2)
          })

        // 高亮/淡化节点
        nodeElements.attr('opacity', n => {
          if (n.id === d.id) return 1
          return relatedIds.has(n.id) ? 1 : 0.2
        })
      })
      .on('mouseout', function() {
        const element = this
        hoverTimeout = setTimeout(() => {
          simulation.alpha(0.3).restart()

          // 恢复节点状态
          d3.select(element).select('.node-circle')
            .attr('opacity', d => getNodeOpacity(d as GraphNode))
            .attr('stroke-width', d => getNodeStrokeWidth(d as GraphNode))

          d3.select(element).select('.glow-ring')
            .attr('opacity', d => {
              const level = getNodeLevel((d as GraphNode).count || 1)
              return level === 'high' ? 0.15 : 0.08
            })

          linkElements
            .attr('stroke', '#d1d5db')
            .attr('opacity', 0.5)
            .attr('stroke-width', d => Math.max(0.5, Math.sqrt((d.weight || 1)) * 1.2))

          nodeElements.attr('opacity', d => getNodeOpacity(d as GraphNode))
        }, 100)
      })

      // 更新位置
      simulation.on('tick', () => {
        linkElements
          .attr('x1', d => (d.source as GraphNode).x || 0)
          .attr('y1', d => (d.source as GraphNode).y || 0)
          .attr('x2', d => (d.target as GraphNode).x || 0)
          .attr('y2', d => (d.target as GraphNode).y || 0)

        nodeElements.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`)
      })
    }

    // ========== 层级树状图模式 ==========
    function renderTreeLayout(
      g: d3.Selection<SVGGElement, unknown, null, undefined>,
      width: number,
      height: number
    ) {
      const margin = { top: 40, right: 60, bottom: 40, left: 60 }
      const innerWidth = width - margin.left - margin.right
      const innerHeight = height - margin.top - margin.bottom

      const root = buildTreeHierarchy(nodes, links)

      // 根据 collapsedIds 折叠节点：将折叠节点的 children 保存并置空
      root.each(d => {
        if (collapsedIds.has(d.data.id) && d.children) {
          (d as any)._children = d.children
          d.children = undefined
        }
      })

      // 使用 d3.tree() 布局（水平方向：从左到右）
      const treeLayout = d3.tree<{ id: string; name: string; node: GraphNode }>()
        .size([innerHeight, innerWidth])
        .separation((a, b) => (a.parent === b.parent ? 1 : 1.5))

      treeLayout(root)

      // 绘制连线（贝塞尔曲线，从左到右）
      const linkGroup = g.append('g').attr('class', 'links')
      linkGroup.selectAll('path')
        .data(root.links())
        .join('path')
        .attr('fill', 'none')
        .attr('stroke', '#d1d5db')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.6)
        .attr('d', d => {
          // d3.tree() 中：x = 垂直位置, y = 水平位置
          // 我们渲染为从左到右：SVG x = node.y, SVG y = node.x
          const sx = (d.source as any).y + margin.left
          const sy = (d.source as any).x + margin.top
          const tx = (d.target as any).y + margin.left
          const ty = (d.target as any).x + margin.top
          const midX = (sx + tx) / 2
          return `M${sx},${sy} C${midX},${sy} ${midX},${ty} ${tx},${ty}`
        })

      // 绘制节点
      const nodeGroup = g.append('g').attr('class', 'nodes')
      const nodeElements = nodeGroup.selectAll('g')
        .data(root.descendants())
        .join('g')
        .attr('transform', d => `translate(${(d.y ?? 0) + margin.left},${(d.x ?? 0) + margin.top})`)
        .attr('cursor', 'pointer')

      // 节点外圈光晕
      nodeElements.append('circle')
        .attr('class', 'glow-ring')
        .attr('r', d => getNodeRadius(d.data.node) + 5)
        .attr('fill', d => {
          const c = d3.color(colorMap[d.data.node.type])
          return c ? c.darker(0.3).toString() : colorMap[d.data.node.type]
        })
        .attr('opacity', 0.08)
        .attr('pointer-events', 'none')

      // 节点圆形主体
      nodeElements.append('circle')
        .attr('class', 'node-circle')
        .attr('r', d => getNodeRadius(d.data.node))
        .attr('fill', d => colorMap[d.data.node.type])
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .attr('filter', d => `url(#glow-${d.data.node.type})`)

      // 高频节点加星标
      nodeElements.filter(d => getNodeLevel(d.data.node.count || 1) === 'high')
        .append('text')
        .text('★')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', 'rgba(255,255,255,0.9)')
        .attr('font-size', d => Math.max(10, getNodeRadius(d.data.node) * 0.5))
        .attr('pointer-events', 'none')

      // 节点标签
      nodeElements.append('text')
        .text(d => d.data.name)
        .attr('text-anchor', 'middle')
        .attr('dy', d => getNodeRadius(d.data.node) + 14)
        .attr('fill', '#374151')
        .attr('font-size', '11px')
        .attr('font-weight', 500)
        .attr('pointer-events', 'none')

      // 折叠/展开指示器（+ / −）
      nodeElements.each(function(d) {
        const hasCollapsedChildren = (d as any)._children
        if (hasCollapsedChildren) {
          // 有子节点但已折叠
          d3.select(this).append('text')
            .text('+')
            .attr('x', -getNodeRadius(d.data.node) - 12)
            .attr('y', 0)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .attr('fill', '#6b7280')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .attr('pointer-events', 'none')
        } else if (d.children && d.children.length > 0) {
          // 有子节点且已展开
          d3.select(this).append('text')
            .text('−')
            .attr('x', -getNodeRadius(d.data.node) - 12)
            .attr('y', 0)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .attr('fill', '#6b7280')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .attr('pointer-events', 'none')
        }
      })

      // 悬停交互
      let hoverTimeout: ReturnType<typeof setTimeout> | null = null

      nodeElements.on('click', (_event: any, d) => {
        // 如果有子节点（展开或折叠状态），切换折叠/展开
        if (d.children || (d as any)._children) {
          setCollapsedIds(prev => {
            const next = new Set(prev)
            if (next.has(d.data.id)) {
              next.delete(d.data.id)
            } else {
              next.add(d.data.id)
            }
            return next
          })
        }
        onNodeClick(d.data.node)
      })
      .on('mouseover', function(_event: any, d) {
        if (hoverTimeout) {
          clearTimeout(hoverTimeout)
          hoverTimeout = null
        }

        // 高亮当前节点
        d3.select(this).select('.node-circle')
          .attr('opacity', 1)
          .attr('stroke-width', 3)

        d3.select(this).select('.glow-ring')
          .attr('opacity', 0.2)

        // 计算关联节点ID
        const relatedIds = new Set<string>()
        links.forEach(l => {
          const sId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id
          const tId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id
          if (sId === d.data.node.id) relatedIds.add(tId)
          if (tId === d.data.node.id) relatedIds.add(sId)
        })

        // 高亮关联节点和路径
        nodeElements.attr('opacity', n => {
          if (n.data.node.id === d.data.node.id) return 1
          return relatedIds.has(n.data.node.id) ? 1 : 0.2
        })
      })
      .on('mouseout', function() {
        const element = this
        hoverTimeout = setTimeout(() => {
          d3.select(element).select('.node-circle')
            .attr('opacity', 1)
            .attr('stroke-width', 2)

          d3.select(element).select('.glow-ring')
            .attr('opacity', 0.08)

          nodeElements.attr('opacity', 1)
        }, 100)
      })
    }

    // ========== 思维导图模式（径向树） ==========
    function renderMindmapLayout(
      g: d3.Selection<SVGGElement, unknown, null, undefined>,
      width: number,
      height: number
    ) {
      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(width, height) / 2 - 80

      const root = buildTreeHierarchy(nodes, links)

      // 使用 d3.tree() 布局，角度作为 x，半径作为 y
      const treeLayout = d3.tree<{ id: string; name: string; node: GraphNode }>()
        .size([2 * Math.PI, radius])
        .separation((a, b) => (a.parent === b.parent ? 0.8 : 1.2))

      treeLayout(root)

      // 绘制连线
      const linkGroup = g.append('g').attr('class', 'links')
      linkGroup.selectAll('path')
        .data(root.links())
        .join('path')
        .attr('fill', 'none')
        .attr('stroke', '#d1d5db')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.5)
        .attr('d', d => {
          const sAngle = (d.source as any).x
          const sRad = (d.source as any).y
          const tAngle = (d.target as any).x
          const tRad = (d.target as any).y

          const sx = centerX + sRad * Math.cos(sAngle - Math.PI / 2)
          const sy = centerY + sRad * Math.sin(sAngle - Math.PI / 2)
          const tx = centerX + tRad * Math.cos(tAngle - Math.PI / 2)
          const ty = centerY + tRad * Math.sin(tAngle - Math.PI / 2)

          return `M${sx},${sy} L${tx},${ty}`
        })

      // 绘制节点
      const nodeGroup = g.append('g').attr('class', 'nodes')
      const nodeElements = nodeGroup.selectAll('g')
        .data(root.descendants())
        .join('g')
        .attr('cursor', 'pointer')

      // 计算每个节点的屏幕坐标并存储
      nodeElements.each(function(d) {
        const angle = d.x ?? 0
        const rad = d.y ?? 0
        const cx = centerX + rad * Math.cos(angle - Math.PI / 2)
        const cy = centerY + rad * Math.sin(angle - Math.PI / 2)
        d3.select(this).attr('transform', `translate(${cx},${cy})`)
      })

      // 节点外圈光晕
      nodeElements.append('circle')
        .attr('class', 'glow-ring')
        .attr('r', d => getNodeRadius(d.data.node) + 5)
        .attr('fill', d => {
          const c = d3.color(colorMap[d.data.node.type])
          return c ? c.darker(0.3).toString() : colorMap[d.data.node.type]
        })
        .attr('opacity', 0.08)
        .attr('pointer-events', 'none')

      // 节点圆形主体
      nodeElements.append('circle')
        .attr('class', 'node-circle')
        .attr('r', d => getNodeRadius(d.data.node))
        .attr('fill', d => colorMap[d.data.node.type])
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .attr('filter', d => `url(#glow-${d.data.node.type})`)

      // 高频节点加星标
      nodeElements.filter(d => getNodeLevel(d.data.node.count || 1) === 'high')
        .append('text')
        .text('★')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', 'rgba(255,255,255,0.9)')
        .attr('font-size', d => Math.max(10, getNodeRadius(d.data.node) * 0.5))
        .attr('pointer-events', 'none')

      // 节点标签
      nodeElements.append('text')
        .text(d => d.data.name)
        .attr('text-anchor', 'middle')
        .attr('dy', d => getNodeRadius(d.data.node) + 14)
        .attr('fill', '#374151')
        .attr('font-size', '11px')
        .attr('font-weight', 500)
        .attr('pointer-events', 'none')

      // 悬停交互
      let hoverTimeout: ReturnType<typeof setTimeout> | null = null

      nodeElements.on('click', (_event: any, d) => {
        onNodeClick(d.data.node)
      })
      .on('mouseover', function(_event: any, d) {
        if (hoverTimeout) {
          clearTimeout(hoverTimeout)
          hoverTimeout = null
        }

        d3.select(this).select('.node-circle')
          .attr('opacity', 1)
          .attr('stroke-width', 3)

        d3.select(this).select('.glow-ring')
          .attr('opacity', 0.2)

        const relatedIds = new Set<string>()
        links.forEach(l => {
          const sId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id
          const tId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id
          if (sId === d.data.node.id) relatedIds.add(tId)
          if (tId === d.data.node.id) relatedIds.add(sId)
        })

        nodeElements.attr('opacity', n => {
          if (n.data.node.id === d.data.node.id) return 1
          return relatedIds.has(n.data.node.id) ? 1 : 0.2
        })
      })
      .on('mouseout', function() {
        const element = this
        hoverTimeout = setTimeout(() => {
          d3.select(element).select('.node-circle')
            .attr('opacity', 1)
            .attr('stroke-width', 2)

          d3.select(element).select('.glow-ring')
            .attr('opacity', 0.08)

          nodeElements.attr('opacity', 1)
        }, 100)
      })
    }

    // ========== 知识卡片集群模式 ==========
    function renderCardsLayout(
      g: d3.Selection<SVGGElement, unknown, null, undefined>,
      width: number,
      height: number
    ) {
      // 预先计算每个节点的关联实体数量
      const relatedCountMap = new Map<string, number>()
      nodes.forEach(n => relatedCountMap.set(n.id, 0))
      links.forEach(l => {
        const sId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id
        const tId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id
        relatedCountMap.set(sId, (relatedCountMap.get(sId) || 0) + 1)
        relatedCountMap.set(tId, (relatedCountMap.get(tId) || 0) + 1)
      })

      // 按类型分组
      const groups = new Map<GraphNode['type'], GraphNode[]>()
      typeList.forEach(t => groups.set(t, []))
      nodes.forEach(n => groups.get(n.type)?.push(n))

      // 卡片尺寸
      const cardWidth = 220
      const cardHeight = 90
      const gapX = 24
      const gapY = 20
      const sectionGap = 50

      // 类型标题栏
      const typeTitleColors: Record<GraphNode['type'], { bg: string; text: string; border: string }> = {
        concept: { bg: '#FFF5EB', text: '#C85A17', border: '#FED7AA' },
        company: { bg: '#EFF6FF', text: '#3b82f6', border: '#BFDBFE' },
        person: { bg: '#F0FDF4', text: '#22c55e', border: '#BBF7D0' },
      }

      let currentY = 20

      for (const type of typeList) {
        const typeNodes = groups.get(type) || []
        if (typeNodes.length === 0) continue

        const colors = typeTitleColors[type]

        // 类型标题
        const typeLabelMap: Record<GraphNode['type'], string> = {
          concept: '📘 投资概念',
          company: '🏢 公司',
          person: '👤 人物',
        }

        g.append('text')
          .attr('x', 30)
          .attr('y', currentY + 20)
          .attr('fill', colors.text)
          .attr('font-size', '16px')
          .attr('font-weight', 700)
          .text(`${typeLabelMap[type]}（${typeNodes.length}）`)

        currentY += 45

        // 按行排列卡片
        const cols = Math.max(1, Math.floor((width - 60) / (cardWidth + gapX)))
        let col = 0

        for (const node of typeNodes) {
          const cx = 30 + col * (cardWidth + gapX)
          const cy = currentY

          const relatedCount = relatedCountMap.get(node.id) || 0
          const cardGroup = g.append('g')
            .attr('cursor', 'pointer')
            .attr('class', 'card-group')

          // 卡片背景
          cardGroup.append('rect')
            .attr('x', cx)
            .attr('y', cy)
            .attr('width', cardWidth)
            .attr('height', cardHeight)
            .attr('rx', 10)
            .attr('ry', 10)
            .attr('fill', '#ffffff')
            .attr('stroke', colors.border)
            .attr('stroke-width', 1.5)
            .attr('filter', 'drop-shadow(0 1px 2px rgba(0,0,0,0.05))')

          // 左侧类型色条
          cardGroup.append('rect')
            .attr('x', cx)
            .attr('y', cy)
            .attr('width', 5)
            .attr('height', cardHeight)
            .attr('rx', 10)
            .attr('ry', 10)
            .attr('fill', colors.text)

          // 节点名称
          cardGroup.append('text')
            .attr('x', cx + 18)
            .attr('y', cy + 28)
            .attr('fill', '#1f2937')
            .attr('font-size', '13px')
            .attr('font-weight', 600)
            .text(node.name.length > 14 ? node.name.slice(0, 14) + '…' : node.name)

          // 类型徽章
          const badgeColors: Record<GraphNode['type'], { bg: string; text: string }> = {
            concept: { bg: '#FFF5EB', text: '#C85A17' },
            company: { bg: '#EFF6FF', text: '#3b82f6' },
            person: { bg: '#F0FDF4', text: '#22c55e' },
          }
          const badge = badgeColors[node.type]
          const badgeText = type === 'concept' ? '概念' : type === 'company' ? '公司' : '人物'

          // 徽章背景
          const badgeWidth = 36
          const badgeHeight = 20
          const badgeX = cx + cardWidth - badgeWidth - 12
          const badgeY = cy + 10

          cardGroup.append('rect')
            .attr('x', badgeX)
            .attr('y', badgeY)
            .attr('width', badgeWidth)
            .attr('height', badgeHeight)
            .attr('rx', 4)
            .attr('ry', 4)
            .attr('fill', badge.bg)

          cardGroup.append('text')
            .attr('x', badgeX + badgeWidth / 2)
            .attr('y', badgeY + badgeHeight / 2)
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('fill', badge.text)
            .attr('font-size', '11px')
            .attr('font-weight', 600)
            .text(badgeText)

          // 提及次数
          cardGroup.append('text')
            .attr('x', cx + 18)
            .attr('y', cy + 50)
            .attr('fill', '#6b7280')
            .attr('font-size', '11px')
            .text(`📄 提及 ${node.count} 次`)

          // 关联实体数量
          cardGroup.append('text')
            .attr('x', cx + 18)
            .attr('y', cy + 70)
            .attr('fill', '#6b7280')
            .attr('font-size', '11px')
            .text(`🔗 关联 ${relatedCount} 个实体`)

          // 点击事件
          cardGroup.on('click', () => {
            onNodeClick(node)
          })

          // 悬停效果
          cardGroup.on('mouseenter', function() {
            d3.select(this).select('rect:first-child')
              .transition()
              .duration(150)
              .attr('stroke-width', 2.5)
              .attr('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))')
          })

          cardGroup.on('mouseleave', function() {
            d3.select(this).select('rect:first-child')
              .transition()
              .duration(150)
              .attr('stroke-width', 1.5)
              .attr('filter', 'drop-shadow(0 1px 2px rgba(0,0,0,0.05))')
          })

          col++
          if (col >= cols) {
            col = 0
            currentY += cardHeight + gapY
          }
        }

        if (col > 0) {
          currentY += cardHeight + gapY
        }
        currentY += sectionGap
      }
    }

    // 渲染 D3 图
    useEffect(() => {
      const cleanup = renderGraph()
      return cleanup
    }, [renderGraph])

    return (
      <div ref={containerRef} className="flex-1 w-full bg-bg-card dark:bg-dark-bg min-h-[360px] md:min-h-0">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className="cursor-grab active:cursor-grabbing"
        />
      </div>
    )
  }
)

GraphCanvas.displayName = 'GraphCanvas'

export default GraphCanvas
