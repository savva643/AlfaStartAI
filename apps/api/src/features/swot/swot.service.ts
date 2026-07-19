import { getLLMProvider } from '../../ai/llm/client.js'
import type { LLMMessage } from '../../ai/llm/types.js'
import { prisma } from '../../shared/db/index.js'

export interface SWOTResult {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
}

export class SWOTService {
  private provider = getLLMProvider()

  async analyze(userId: string, additionalContext?: string): Promise<SWOTResult> {
    const user = await prisma.user.findUnique({ where: { id: userId } })

    const prompt = `Проведи SWOT-анализ для стартапа.

Информация:
- Название: ${user?.businessName || 'Не указано'}
- Тип: ${user?.businessType || 'Не указан'}
- Этап: ${user?.stage || 'Начальный'}
${additionalContext ? `- Дополнительно: ${additionalContext}` : ''}

Для каждой категории приведи 3-5 конкретных пунктов.

Ответ ТОЛЬКО в JSON:
{
  "strengths": ["сила 1", "сила 2"],
  "weaknesses": ["слабость 1", "слабость 2"],
  "opportunities": ["возможность 1", "возможность 2"],
  "threats": ["угроза 1", "угроза 2"]
}`

    const messages: LLMMessage[] = [
      { role: 'system', content: 'Ты бизнес-стратег. Отвечай ТОЛЬКО валидным JSON на русском языке.' },
      { role: 'user', content: prompt },
    ]

    const response = await this.provider.chat({ messages, temperature: 0.7 })

    try {
      const cleaned = response.content.replace(/```json\n?|\n?```/g, '').trim()
      return JSON.parse(cleaned) as SWOTResult
    } catch {
      return {
        strengths: ['Информация о бизнесе не заполнена'],
        weaknesses: ['Информация о бизнесе не заполнена'],
        opportunities: ['Информация о бизнесе не заполнена'],
        threats: ['Информация о бизнесе не заполнена'],
      }
    }
  }
}

export const swotService = new SWOTService()
