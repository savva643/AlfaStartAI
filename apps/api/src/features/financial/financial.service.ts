import { prisma } from '../../shared/db/index.js'
import { getLLMProvider } from '../../ai/llm/client.js'
import type { LLMMessage } from '../../ai/llm/types.js'

export interface ForecastEntry {
  month: string
  value: number
}

export interface FinancialForecast {
  revenue: ForecastEntry[]
  expenses: ForecastEntry[]
  profit: ForecastEntry[]
  unitEconomics: {
    cac: number
    ltv: number
    ltvCacRatio: number
    paybackPeriod: number
    arpu: number
    churnRate: number
  }
}

export class FinancialService {
  private provider = getLLMProvider()

  async forecast(userId: string): Promise<FinancialForecast> {
    const user = await prisma.user.findUnique({ where: { id: userId } })

    const prompt = `Создай финансовый прогноз на 6 месяцев для стартапа.

Информация:
- Название: ${user?.businessName || 'Не указано'}
- Тип: ${user?.businessType || 'Не указан'}
- Этап: ${user?.stage || 'Начальный'}

Создай прогноз по месяцам. Оцени выручку, расходы, прибыль и юнит-экономику.

Ответ ТОЛЬКО в JSON:
{
  "revenue": [{"month": "Янв", "value": 100000}],
  "expenses": [{"month": "Янв", "value": 80000}],
  "profit": [{"month": "Янв", "value": 20000}],
  "unitEconomics": {
    "cac": 500, "ltv": 15000, "ltvCacRatio": 30,
    "paybackPeriod": 3, "arpu": 2500, "churnRate": 5
  }
}`

    const messages: LLMMessage[] = [
      { role: 'system', content: 'Ты финансовый аналитик стартапов. Отвечай ТОЛЬКО валидным JSON. Цены в рублях.' },
      { role: 'user', content: prompt },
    ]

    const response = await this.provider.chat({ messages, temperature: 0.5 })

    try {
      const cleaned = response.content.replace(/```json\n?|\n?```/g, '').trim()
      return JSON.parse(cleaned) as FinancialForecast
    } catch {
      return this.getDefaultForecast()
    }
  }

  private getDefaultForecast(): FinancialForecast {
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн']
    const year = new Date().getFullYear()

    return {
      revenue: months.map((m, i) => ({ month: `${m} ${year}`, value: 50000 * (i + 1) })),
      expenses: months.map((m, i) => ({ month: `${m} ${year}`, value: 40000 + 5000 * i })),
      profit: months.map((m, i) => ({ month: `${m} ${year}`, value: 10000 * (i + 1) })),
      unitEconomics: {
        cac: 500,
        ltv: 15000,
        ltvCacRatio: 30,
        paybackPeriod: 3,
        arpu: 2500,
        churnRate: 5,
      },
    }
  }
}

export const financialService = new FinancialService()
