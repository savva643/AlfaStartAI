import { getLLMProvider } from '../../ai/llm/client.js'
import type { LLMMessage } from '../../ai/llm/types.js'
import { prisma } from '../../shared/db/index.js'

export interface PaymentRecommendation {
  productId: string
  name: string
  description: string
  reason: string
  relevanceScore: number
  features: string[]
}

export class PaymentsService {
  private provider = getLLMProvider()

  async getRecommendations(userId: string): Promise<PaymentRecommendation[]> {
    const user = await prisma.user.findUnique({ where: { id: userId } })

    const prompt = `Подбери банковские продукты Альфа-Банка для стартапа "${user?.businessName || 'стартап'}" (${user?.businessType || 'IT'}).

Доступные продукты:
1. Бизнес-счёт — расчётный счёт для бизнеса
2. Эквайринг — приём платежей по картам
3. Интернет-эквайринг — онлайн-платежи
4. Бизнес-карта — корпоративная карта
5. Кредит для бизнеса — кредитование
6. Лизинг — аренда оборудования

Для каждого продукта оцени релевантность от 0 до 100.

Ответ ТОЛЬКО в JSON:
[{
  "productId": "business_account",
  "name": "Бизнес-счёт",
  "description": "Описание",
  "reason": "Почему подходит",
  "relevanceScore": 85,
  "features": ["feature 1", "feature 2"]
}]`

    const messages: LLMMessage[] = [
      { role: 'system', content: 'Ты эксперт по банковским продуктам. Отвечай ТОЛЬКО валидным JSON на русском. Рекомендуй естественно, не навязывай.' },
      { role: 'user', content: prompt },
    ]

    const response = await this.provider.chat({ messages, temperature: 0.5 })

    try {
      const cleaned = response.content.replace(/```json\n?|\n?```/g, '').trim()
      return JSON.parse(cleaned) as PaymentRecommendation[]
    } catch {
      return [
        {
          productId: 'business_account',
          name: 'Бизнес-счёт Альфа-Банка',
          description: 'Расчётный счёт для ведения бизнеса с льготным обслуживанием',
          reason: 'Необходим для работы любого бизнеса',
          relevanceScore: 90,
          features: ['Бесплатное открытие', 'Онлайн-банк', 'Быстрые переводы'],
        },
        {
          productId: 'acquiring',
          name: 'Эквайринг',
          description: 'Приём платежей банковскими картами',
          reason: 'Позволяет принимать оплату от клиентов',
          relevanceScore: 70,
          features: ['Низкая комиссия', 'Терминалы', 'Онлайн-платежи'],
        },
      ]
    }
  }
}

export const paymentsService = new PaymentsService()
