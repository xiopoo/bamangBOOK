import type { Plugin } from 'unified'
import type { Node, Parent } from 'unist'

const numberedPattern = /^(\d+)[，、.]\s*/

function isNumberedParagraph(node: Node): boolean {
  if (node.type !== 'paragraph') return false
  const paragraph = node as Parent
  if (!paragraph.children || paragraph.children.length === 0) return false
  const firstChild = paragraph.children[0]
  if (firstChild.type !== 'text') return false
  const textValue = (firstChild as any).value || ''
  return numberedPattern.test(textValue)
}

function processNumberedParagraph(node: Parent): void {
  const firstChild = node.children[0] as any
  const match = firstChild.value.match(numberedPattern)
  if (match) {
    const num = parseInt(match[1], 10)
    firstChild.value = firstChild.value.replace(numberedPattern, '')
    const n = node as any
    n.data = n.data || {}
    n.data.numberedList = { number: num }
  }
}

const remarkNumberedList: Plugin<[], Node> = function () {
  return function (tree) {
    const visitor = (node: Node) => {
      if (isNumberedParagraph(node)) {
        processNumberedParagraph(node as Parent)
      }
      if ((node as Parent).children) {
        (node as Parent).children.forEach(visitor)
      }
    }
    visitor(tree)
  }
}

export default remarkNumberedList