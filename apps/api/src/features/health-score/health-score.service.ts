import { prisma } from '../../shared/db/index.js'
import { getLLMProvider } from '../../ai/llm/client.js'
import type { LLMMessage } from '../../ai/llm/types.js'

export interface HealthScoreResult {
  overall: number
  financial: number
  market: number
  team: number
  product: number
  growth: number
  breakdown: Record<string, number>
  recommendations: string[]
}

export class HealthScoreService {
  private provider = getLLMProvider()

  async calculate(userId: string): Promise<HealthScoreResult> {
    const user = await prisma.user.findUnique({ where: { id: userId } })

    const prompt = `Оцени здоровье бизнеса по шкале от 0 до 100 для каждого параметра.

Информация о бизнесе:
- Название: ${user?.businessName || 'Не указано'}
- Тип: ${user?.businessType || 'Не указан'}
- Этап: ${user?.stage || 'Начальный'}

Оцени по критериям:
1. Финансы (financial): наличие бюджета, управление расходами
2. Рынок (market): понимание рынка, конкуренты, спрос
3. Команда (team): навыки, опыт, компетенции
4. Продукт (product): готовность MVP, качество
5. Рост (growth): потенциал масштабирования

Ответ ТОЛЬКО в JSON:
{
  "financial": 0-100,
  "market": 0-100,
  "team": 0-100,
  "product": 0-100,
  "growth": 0-100,
  "recommendations": ["рекомендация 1", "рекомендация 2"]
}`

    const messages: LLMMessage[] = [
      { role: 'system', content: 'Ты бизнес-аналитик. Отвечай ТОЛЬКО валидным JSON.' },
      { role: 'user', content: prompt },
    ]

    let response: { content: string }
    try {
      response = await this.provider.chat({ messages, temperature: 0.5 })
    } catch {
      // Fallback if OpenRouter is unavailable
      return this.getFallbackScore(user)
    }

    try {
      const cleaned = response.content.replace(/```json\n?|\n?```/g, '').trim()
      const data = JSON.parse(cleaned) as Omit<HealthScoreResult, 'overall' | 'breakdown'>

      const scores = {
        financial: Math.min(100, Math.max(0, data.financial || 50)),
        market: Math.min(100, Math.max(0, data.market || 50)),
        team: Math.min(100, Math.max(0, data.team || 50)),
        product: Math.min(100, Math.max(0, data.product || 50)),
        growth: Math.min(100, Math.max(0, data.growth || 50)),
      }

      const overall = Math.round(
        (scores.financial + scores.market + scores.team + scores.product + scores.growth) / 5,
      )

      return {
        overall,
        ...scores,
        breakdown: scores,
        recommendations: data.recommendations || [],
      }
    } catch {
      return {
        overall: 50,
        financial: 50,
        market: 50,
        team: 50,
        product: 50,
        growth: 50,
        breakdown: { financial: 50, market: 50, team: 50, product: 50, growth: 50 },
        recommendations: ['Заполните информацию о бизнесе для более точной оценки'],
      }
    }
  }

  private getFallbackScore(user: { businessName: string | null; businessType: string | null; stage: string | null } | null): HealthScoreResult {
    const base = user?.stage === 'idea' ? 30 : user?.stage === 'mvp' ? 50 : user?.stage === 'launch' ? 65 : 45
    const scores = {
      financial: base - 5,
      market: base + 5,
      team: base - 10,
      product: base + 10,
      growth: base,
    }
    const overall = Math.round(
      (scores.financial + scores.market + scores.team + scores.product + scores.growth) / 5,
    )
    return {
      overall,
      ...scores,
      breakdown: scores,
      recommendations: [
        'Заполните информацию о бизнесе для более точной оценки',
        'Создайте бизнес-план для определения стратегии',
        'Оцените конкурентную среду на вашем рынке',
      ],
    }
  }
}

export const healthScoreService = new HealthScoreService()
