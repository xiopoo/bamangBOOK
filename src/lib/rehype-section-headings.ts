import type { Plugin } from 'unified'
import type { Root, Element, Text, Properties } from 'hast'

const headingClasses: Record<string, string> = {
  h1: 'text-3xl md:text-4xl font-serif font-bold text-primary dark:text-primary-light mt-8 mb-6 pb-2 border-b border-primary/20',
  h2: 'text-2xl md:text-2.5xl font-serif font-bold text-text dark:text-dark-text mt-10 mb-5 flex items-center gap-3',
  h3: 'text-xl font-semibold text-text dark:text-dark-text mt-8 mb-4 flex items-center gap-2',
  h4: 'text-lg font-semibold text-text-dark/80 dark:text-dark-text/80 mt-6 mb-3',
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\u4e00-\u9fa5a-z0-9-]/g, '')
    .trim()
}

function addId(node: Element): void {
  const children = node.children as (Text | Element)[]
  const text = children
    .map((child) => (child.type === 'text' ? child.value : ''))
    .join('')
  const id = slugify(text)
  if (id) {
    ;(node.properties as Properties).id = id
  }
}

export const rehypeSectionHeadings: Plugin<[], Root> = () => {
  return (tree) => {
    function transform(node: Root | Element) {
      if (node.type === 'element' && headingClasses[node.tagName]) {
        addId(node)
        const existingClass = (node.properties as Properties).className || ''
        const newClass = `${existingClass} ${headingClasses[node.tagName]}`.trim()
        ;(node.properties as Properties).className = newClass
      }
      if ('children' in node) {
        for (const child of node.children) {
          if (child.type === 'element') {
            transform(child)
          }
        }
      }
    }
    transform(tree)
  }
}

export default rehypeSectionHeadings