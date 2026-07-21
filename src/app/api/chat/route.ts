import { NextRequest, NextResponse } from 'next/server'

// 简单示例，实际需要接入 AI API
export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json()

    // 示例回答 - 实际需要接入智谱AI / Claude API
    const answers: Record<string, { answer: string; sources: string[] }> = {
      '什么是能力圈？': {
        answer: `能力圈是巴菲特最核心的投资原则之一。

核心思想：投资者只需要对自己真正了解的 公司进行投资，知道「你不知道什么」和「你知道什么」同样重要。

巴菲特的原话：投资的关键不是评估一家公司对社会的贡献，而是确定你能理解的公司的竞争优势。

实践建议：
1. 只投资你能够理解的业务模式
2. 不要因为某家公司便宜就买
3. 在能力圈内机会来临时敢于重仓

芒格补充：当你专注于自己能力圈时，你会获得真正的竞争优势。`,
        sources: ['1988年股东信', '1996年股东信', '芒格2007年西科金融年会']
      },
      '你为什么买可口可乐？': {
        answer: `巴菲特投资可口可乐是价值投资的经典案例。

投资理由：
1. 品牌护城河 - 可口可乐是全球最强大的消费品牌
2. 管理层优秀 - 1981年郭思达上任后开始聚焦核心业务
3. 商业模式简单 - 卖糖水赚差价
4. 全球化潜力 - 1980年代国际市场渗透率还很低

投资时间：1988年开始买入，1989年继续增持

巴菲特原话：好的品牌就是护城河。`,
        sources: ['1988年股东信', '1990年股东信', '1991年股东信']
      },
      '市场先生是什么意思？': {
        answer: `「市场先生」是格雷厄姆提出的经典比喻。

核心概念：
市场先生每天都会来报价。他非常乐观，会报出很高的价格；他也非常悲观，会报出很低的价格。

但重要的是：你不必在意他的报价。你应该等待机会，当他报价过低时买入，当他报价过高时卖出。

巴菲特的运用：
- 别人恐惧时贪婪，别人贪婪时恐惧
- 市场价格短期波动剧烈，但长期反映企业内在价值
- 成功的投资需要克服情绪影响

这就是为什么真正的投资者把市场波动看作机会而不是威胁。`,
        sources: ['1987年股东信', '1994年股东信', '格雷厄姆《聪明的投资者》']
      }
    }

    // 匹配问题或返回默认回答
    const matched = Object.entries(answers).find(([key]) => 
      question.includes(key.replace('？', '').replace('?', ''))
    )

    if (matched) {
      return NextResponse.json({
        answer: matched[1].answer,
        sources: matched[1].sources
      })
    }

    // 默认回答
    return NextResponse.json({
      answer: `关于「${question}」这个问题，让我来回答：

这是一个很好的投资问题。根据巴菲特和芒格的思想...

核心要点：
1. 理解企业本身
2. 关注长期价值
3. 在价格合适时买入

建议结合具体的股东信和芒格思想来深入理解这个话题。`,
      sources: ['巴菲特致股东信', '芒格智慧库']
    })
  } catch (error) {
    return NextResponse.json({ error: '处理失败' }, { status: 500 })
  }
}
