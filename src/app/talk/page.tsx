'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Send, MessageCircle, BookOpen, Search, ShieldCheck, User, Bot } from 'lucide-react'
import PageContainer from '@/components/PageContainer'
import { searchStaticContent } from '@/lib/static-search-client'

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: Array<{ title: string; url: string }>
  searchUrl?: string
}

const suggestions = [
  { question: '什么是能力圈？', category: '投资概念' },
  { question: '你为什么买可口可乐？', category: '投资案例' },
  { question: '市场先生是什么意思？', category: '投资概念' },
  { question: '如何看待科技股？', category: '投资观点' },
  { question: '什么是护城河？', category: '投资概念' },
  { question: '如何计算内在价值？', category: '投资方法' },
]

export default function TalkPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async (question?: string) => {
    const q = question || input
    if (!q.trim()) return

    const userMessage: Message = { role: 'user', content: q }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const docs = await searchStaticContent(q, 'all', 5)
      const sources = docs.map((item) => ({ title: item.name, url: item.url }))
      const context = docs
        .map((item) => `【${item.name}】\n${item.description || '可打开来源页阅读全文。'}`)
        .join('\n\n')

      const assistantMessage: Message = {
        role: 'assistant',
        content:
          `（巴芒知识助手 · 静态检索模式）\n\n` +
          `根据站内资料，与「${q}」最相关的内容如下：\n\n` +
          (context || '未找到相关资料，建议调整关键词或在左侧导航浏览原著。') +
          `\n\n> 说明：当前回答基于本站静态索引整理，不连接外部模型。`,
        sources,
        searchUrl: `/search?q=${encodeURIComponent(q)}`,
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '抱歉，发生了错误。请稍后重试。',
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer maxWidth="5xl">
      {/* Header */}
      <div className="bg-primary/5 dark:bg-primary/10 border-b border-primary/20 -mx-4 md:-mx-6 -mt-8 md:-mt-12">
        <div className="px-6 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-primary font-medium">资料问答 · 测试版</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">巴芒资料助手</h1>
          <p className="text-gray-600 dark:text-gray-300">
            从本站已收录的信件、概念、公司与文章中查找答案
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Search className="w-4 h-4" />
              只检索本站资料
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              找不到时明确说明
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        {/* Suggestions */}
        {messages.length === 0 && (
          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-6 mb-8">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">试试从这些问题开始</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(item.question)}
                  className="flex items-center justify-between p-4 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary/50 transition-all text-left group"
                >
                  <span className="text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
                    {item.question}
                  </span>
                  <span className="text-xs bg-primary/5 dark:bg-primary/15 text-primary px-2 py-1 rounded-full">
                    {item.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat History */}
        <div className="space-y-6 mb-8">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {msg.role === 'user' ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Bot className="w-5 h-5" />
                )}
              </div>
              <div className={`max-w-[75%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block p-4 rounded-xl ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className={`mt-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                    <div className="inline-flex flex-wrap items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <BookOpen className="w-3 h-3" />
                      <span>相关资料：</span>
                      {msg.sources.map((source, j) => (
                        <Link key={source.url} href={source.url} className="text-primary hover:underline">
                          {source.title}{j < (msg.sources?.length ?? 0) - 1 ? '、' : ''}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {msg.role === 'assistant' && msg.searchUrl && (
                  <Link href={msg.searchUrl} className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    <Search className="w-3 h-3" />
                    查看完整搜索结果
                  </Link>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Bot className="w-5 h-5 text-gray-600" />
              </div>
              <div className="bg-gray-100 rounded-xl rounded-bl-md p-4">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入你的问题..."
              className="flex-1 min-w-0 px-4 py-3 bg-white dark:bg-dark-card dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary transition-colors"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              发送
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            回答由本站资料片段自动整理，可能遗漏上下文；请以来源原文为准，不构成投资建议
          </p>
        </div>
      </div>

    </PageContainer>
  )
}
