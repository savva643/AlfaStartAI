import { prisma } from '../../shared/db/index.js'
import { getLLMProvider } from '../../ai/llm/client.js'
import type { LLMMessage } from '../../ai/llm/types.js'

export class ChecklistService {
  private provider = getLLMProvider()

  async generate(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })

    const prompt = `Создай чек-лист для запуска стартапа "${user?.businessName || 'Мой стартап'}" (${user?.businessType || 'IT'}).

Создай чек-лист из 15-20 пунктов, сгруппированных по категориям.

Ответ ТОЛЬКО в JSON:
{
  "title": "Чек-лист запуска",
  "items": [{"title": "Название", "category": "Категория", "description": "Описание"}]
}`

    const messages: LLMMessage[] = [
      { role: 'system', content: 'Ты бизнес-планировщик. Отвечай ТОЛЬКО валидным JSON на русском языке.' },
      { role: 'user', content: prompt },
    ]

    const response = await this.provider.chat({ messages, temperature: 0.7 })

    try {
      const cleaned = response.content.replace(/```json\n?|\n?```/g, '').trim()
      const data = JSON.parse(cleaned) as {
        title: string
        items: Array<{ title: string; category: string; description: string }>
      }

      return prisma.checklist.create({
        data: {
          userId,
          title: data.title || 'Чек-лист запуска',
          items: {
            create: data.items.map((item, i) => ({
              title: item.title,
              description: item.description,
              category: item.category,
              order: i + 1,
            })),
          },
        },
        include: { items: true },
      })
    } catch {
      return prisma.checklist.create({
        data: {
          userId,
          title: 'Чек-лист запуска',
          items: {
            create: [
              { title: 'Определить целевую аудиторию', category: 'Подготовка', order: 1 },
              { title: 'Создать бизнес-план', category: 'Подготовка', order: 2 },
              { title: 'Выбрать форму собственности', category: 'Юридические', order: 3 },
              { title: 'Зарегистрировать бизнес', category: 'Юридические', order: 4 },
              { title: 'Разработать MVP', category: 'Разработка', order: 5 },
              { title: 'Создать лендинг', category: 'Маркетинг', order: 6 },
              { title: 'Запустить рекламу', category: 'Маркетинг', order: 7 },
              { title: 'Открыть расчётный счёт', category: 'Финансы', order: 8 },
            ],
          },
        },
        include: { items: true },
      })
    }
  }

  async getUserChecklists(userId: string) {
    return prisma.checklist.findMany({
      where: { userId },
      include: { items: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async toggleItem(itemId: string, completed: boolean) {
    return prisma.checklistItem.update({
      where: { id: itemId },
      data: {
        completed,
        completedAt: completed ? new Date() : null,
      },
    })
  }
}

export const checklistService = new ChecklistService()
