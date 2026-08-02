import type { Plugin } from 'unified'
import type { Node, Parent } from 'unist'

type MarkdownNode = Node & {
  type: string
  value?: string
  children?: MarkdownNode[]
}

const pairedEmphasis = /(\*{3}|\*{2})(?=\S)([\s\S]*?\S)\1/g

function repairTextNode(node: MarkdownNode): MarkdownNode[] {
  const value = node.value || ''
  if (!value.includes('**')) return [node]

  const children: MarkdownNode[] = []
  let cursor = 0
  let match: RegExpExecArray | null

  pairedEmphasis.lastIndex = 0
  while ((match = pairedEmphasis.exec(value)) !== null) {
    if (match.index > cursor) {
      children.push({ type: 'text', value: value.slice(cursor, match.index) })
    }

    const textNode: MarkdownNode = { type: 'text', value: match[2] }
    children.push(
      match[1].length === 3
        ? { type: 'strong', children: [{ type: 'emphasis', children: [textNode] }] }
        : { type: 'strong', children: [textNode] }
    )
    cursor = match.index + match[0].length
  }

  if (cursor < value.length) {
    children.push({ type: 'text', value: value.slice(cursor) })
  }

  // 中文标点紧邻 Markdown 定界符时，CommonMark 可能把它们留作可见文本。
  // 成对内容已在上面恢复为语义节点；余下的连续星号属于损坏的排版残片。
  return (children.length ? children : [node]).map((child) =>
    child.type === 'text' && child.value
      ? { ...child, value: child.value.replace(/\*{2,}/g, '') }
      : child
  )
}

const remarkCjkEmphasis: Plugin<[], Node> = function () {
  return function (tree) {
    const visit = (node: MarkdownNode) => {
      if (!node.children || node.type === 'code' || node.type === 'inlineCode') return

      const repaired: MarkdownNode[] = []
      for (const child of node.children) {
        if (child.type === 'text') {
          repaired.push(...repairTextNode(child))
        } else {
          visit(child)
          repaired.push(child)
        }
      }
      node.children = repaired
    }

    visit(tree as MarkdownNode)
  }
}

export default remarkCjkEmphasis
