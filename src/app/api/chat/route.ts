import { NextRequest, NextResponse } from 'next/server'
import { SearchItem, extractDescription, searchContent } from '@/lib/content-search'

function normalizeQuestion(question: string): string {
  return question
    .replace(/[？?。！!，,]/g, ' ')
    .replace(/什么是|是什么意思|如何看待|如何计算|如何|为什么|怎么理解|请问|讲讲/g, ' ')
    .replace(/你/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function usefulExcerpt(item: SearchItem, keywords: string[]): string {
  const paragraphs = item.content
    .replace(/^---[\s\S]*?---/m, '')
    .split(/\n{2,}/)
    .map(paragraph => extractDescription(paragraph, 180))
    .filter(paragraph => paragraph.length > 25)

  return paragraphs.find(paragraph => keywords.some(keyword => paragraph.includes(keyword)))
    || item.description
}

// 限制问题长度，避免超长输入触发昂贵的全文检索造成 DoS。
const MAX_QUESTION_LENGTH = 200

export async function POST(req: NextRequest) {
  try {
    const body: { question?: unknown } = await req.json()
    const question: string = typeof body.question === 'string'
      ? body.question.trim().slice(0, MAX_QUESTION_LENGTH)
      : ''
    if (!question) {
      return NextResponse.json({ error: '请输入问题' }, { status: 400 })
    }

    const normalized = normalizeQuestion(question)
    const query = normalized || question
    const keywords = query.split(/\s+/).filter(keyword => keyword.length >= 2)
    const matches = searchContent(query, 8)
      .filter(result => (result.score ?? 1) < 0.45)
      .slice(0, 4)

    if (matches.length === 0) {
      return NextResponse.json({
        answer: `本站资料中暂时没有找到能可靠回答「${question}」的内容。你可以换一个更具体的关键词，或前往全站搜索继续查找。`,
        sources: [],
        found: false,
        searchUrl: `/search?q=${encodeURIComponent(query)}`,
      })
    }

    const excerpts = matches.map(({ item }) => ({
      title: item.name,
      url: item.url,
      excerpt: usefulExcerpt(item, keywords),
    }))
    const answer = [
      `根据本站已收录资料，与你的问题最相关的是：`,
      ...excerpts.slice(0, 3).map((source, index) => `${index + 1}. ${source.title}：${source.excerpt}`),
      `以上是资料摘取与索引结果，请打开来源结合上下文阅读。`,
    ].join('\n\n')

    return NextResponse.json({
      answer,
      sources: excerpts.map(source => ({ title: source.title, url: source.url })),
      found: true,
      searchUrl: `/search?q=${encodeURIComponent(query)}`,
    })
  } catch (error) {
    console.error('Knowledge assistant error:', error)
    return NextResponse.json({ error: '资料检索失败，请稍后重试' }, { status: 500 })
  }
}
