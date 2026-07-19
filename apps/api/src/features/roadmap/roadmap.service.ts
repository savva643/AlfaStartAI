import { prisma } from '../../shared/db/index.js'
import { getLLMProvider } from '../../ai/llm/client.js'
import type { LLMMessage } from '../../ai/llm/types.js'
import { NotFoundError } from '../../shared/errors/index.js'

export class RoadmapService {
  private provider = getLLMProvider()

  async generate(userId: string, businessInfo: {
    businessName: string
    businessType: string
    stage?: string
  }) {
    const prompt = `Создай детальную дорожную карту для стартапа "${businessInfo.businessName}" (${businessInfo.businessType}).
Текущий этап: ${businessInfo.stage || 'начальный'}

Создай roadmap из 8-12 конкретных шагов. Для каждого шага укажи title, description, estimatedWeeks.

Ответ ТОЛЬКО в JSON:
{
  "title": "Roadmap для [название]",
  "description": "Краткое описание",
  "steps": [{"title": "Название", "description": "Описание", "estimatedWeeks": 2}]
}`

    const messages: LLMMessage[] = [
      { role: 'system', content: 'Ты бизнес-плановщик. Отвечай ТОЛЬКО валидным JSON, без markdown.' },
      { role: 'user', content: prompt },
    ]

    const response = await this.provider.chat({ messages, temperature: 0.7 })

    try {
      const cleaned = response.content.replace(/```json\n?|\n?```/g, '').trim()
      const data = JSON.parse(cleaned) as {
        title: string
        description: string
        steps: Array<{ title: string; description: string; estimatedWeeks: number }>
      }

      return prisma.roadmap.create({
        data: {
          userId,
          title: data.title || `Roadmap для ${businessInfo.businessName}`,
          description: data.description || '',
          steps: {
            create: data.steps.map((step, i) => ({
              title: step.title,
              description: step.description,
              order: i + 1,
            })),
          },
        },
        include: { steps: true },
      })
    } catch {
      return prisma.roadmap.create({
        data: {
          userId,
          title: `Roadmap для ${businessInfo.businessName}`,
          description: 'Дорожная карта для развития бизнеса',
          steps: {
            create: [
              { title: 'Определение MVP', description: 'Определи минимально жизнеспособный продукт', order: 1 },
              { title: 'Исследование рынка', description: 'Проанализируй конкурентов и аудиторию', order: 2 },
              { title: 'Разработка MVP', description: 'Создай первую рабочую версию', order: 3 },
              { title: 'Тестирование', description: 'Получи обратную связь от первых пользователей', order: 4 },
              { title: 'Запуск', description: 'Запусти продукт на рынок', order: 5 },
            ],
          },
        },
        include: { steps: true },
      })
    }
  }

  async getUserRoadmaps(userId: string) {
    return prisma.roadmap.findMany({
      where: { userId },
      include: { steps: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async updateStep(stepId: string, status: string) {
    return prisma.roadmapStep.update({
      where: { id: stepId },
      data: {
        status,
        completedAt: status === 'completed' ? new Date() : null,
      },
    })
  }
}

export const roadmapService = new RoadmapService()
