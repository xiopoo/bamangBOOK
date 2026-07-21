import type { Plugin } from 'unified'
import type { Node, Parent, Element } from 'hast'

interface NumberedParagraph extends Parent {
  data?: {
    numberedList?: {
      number: number
    }
  }
}

function isNumberedParagraph(node: Node): node is NumberedParagraph {
  return node.type === 'element' && 
         (node as any).tagName === 'p' && 
         (node as any).data?.numberedList?.number !== undefined
}

function collectNumberedParagraphs(children: Node[]): { paragraphs: NumberedParagraph[], startIndex: number, endIndex: number }[] {
  const groups: { paragraphs: NumberedParagraph[], startIndex: number, endIndex: number }[] = []
  let currentGroup: NumberedParagraph[] | null = null
  let startIndex = -1
  
  children.forEach((child, index) => {
    if (isNumberedParagraph(child)) {
      if (!currentGroup) {
        currentGroup = []
        startIndex = index
      }
      currentGroup.push(child)
    } else if (currentGroup) {
      groups.push({
        paragraphs: currentGroup,
        startIndex,
        endIndex: index - 1
      })
      currentGroup = null
      startIndex = -1
    }
  })
  
  if (currentGroup) {
    groups.push({
      paragraphs: currentGroup,
      startIndex,
      endIndex: children.length - 1
    })
  }
  
  return groups
}

const rehypeNumberedList: Plugin<[], Node> = function () {
  return function (tree) {
    const visitor = (node: Node, index: number, parent: Parent) => {
      if (node.type === 'element') {
        const elementNode = node as Parent
        if (!elementNode.children) return
        
        const groups = collectNumberedParagraphs(elementNode.children)
        
        groups.reverse().forEach(group => {
          const startNumber = group.paragraphs[0].data?.numberedList?.number || 1
          
          const ol: Element = {
            type: 'element',
            tagName: 'ol',
            properties: { start: startNumber },
            children: group.paragraphs.map(p => ({
              type: 'element' as const,
              tagName: 'li' as const,
              properties: {},
              children: (p as any).children || []
            }))
          }
          
          const newChildren = [...elementNode.children]
          newChildren.splice(group.startIndex, group.endIndex - group.startIndex + 1, ol)
          elementNode.children = newChildren
        })
        
        elementNode.children.forEach((child, i) => {
          visitor(child, i, elementNode)
        })
      }
    }
    
    visitor(tree, 0, tree as Parent)
  }
}

export default rehypeNumberedList