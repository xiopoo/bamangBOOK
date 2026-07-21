'use client'

import { useState } from 'react'
import { Send, MessageCircle, BookOpen, Sparkles, Clock, User, Bot } from 'lucide-react'
import PageContainer from '@/components/PageContainer'
import PageFooter from '@/components/PageFooter'

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
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
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      })
      const data = await res.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer || '抱歉，AI服务暂时不可用。',
        sources: data.sources,
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
      <div className="bg-gradient-to-br from-primary/5 to-bg-card border-b border-primary/20 -mx-4 md:-mx-6 -mt-8 md:-mt-12 rounded-xl">
        <div className="px-6 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-primary font-medium">AI 对话</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">巴菲特下午茶</h1>
          <p className="text-gray-600">
            拉把椅子，听老先生慢慢讲投资与人生
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              每日免费对话 3 次
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              RAG 技术支持
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        {/* Suggestions */}
        {messages.length === 0 && (
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="font-medium text-gray-900 mb-4">不知道问什么？试试这些话题</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(item.question)}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-sm transition-all text-left group"
                >
                  <span className="text-gray-900 group-hover:text-orange-600 transition-colors">
                    {item.question}
                  </span>
                  <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full">
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
                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className={`mt-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                    <div className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <BookOpen className="w-3 h-3" />
                      <span>原文溯源：</span>
                      {msg.sources.map((source, j) => (
                        <span key={j} className="text-orange-600 hover:underline cursor-pointer">
                          {source}{j < (msg.sources?.length ?? 0) - 1 ? '、' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
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
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入你的问题..."
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 transition-colors"
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
            内容由 AI 生成，基于巴菲特公开信件整理，不构成任何投资建议
          </p>
        </div>
      </div>

      <PageFooter />
    </PageContainer>
  )
}
