import { prisma } from '../../shared/db/index.js'
import type { Tool } from './types.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type P = Record<string, any>

export const tools: Tool[] = [
  {
    name: 'create_task',
    description: 'Создать задачу для пользователя',
    parameters: {
      title: { type: 'string', description: 'Название задачи', required: true },
      description: { type: 'string', description: 'Описание задачи' },
      priority: { type: 'string', description: 'Приоритет: low, medium, high, urgent' },
      dueDate: { type: 'string', description: 'Срок выполнения (YYYY-MM-DD)' },
    },
    execute: async (params: P, userId: string) => {
      const task = await prisma.task.create({
        data: {
          userId,
          title: params['title'] as string,
          description: (params['description'] as string) || null,
          priority: (params['priority'] as string) || 'medium',
          dueDate: params['dueDate'] ? new Date(params['dueDate'] as string) : null,
        },
      })
      return `Задача создана: "${task.title}" (приоритет: ${task.priority})`
    },
  },
  {
    name: 'complete_task',
    description: 'Отметить задачу как выполненную',
    parameters: {
      taskId: { type: 'string', description: 'ID задачи', required: true },
    },
    execute: async (params: P) => {
      const task = await prisma.task.update({
        where: { id: params['taskId'] as string },
        data: { status: 'done' },
      })
      return `Задача "${task.title}" отмечена как выполненная`
    },
  },
  {
    name: 'list_tasks',
    description: 'Показать список задач пользователя',
    parameters: {
      status: { type: 'string', description: 'Фильтр по статусу: todo, in_progress, review, done' },
    },
    execute: async (params: P, userId: string) => {
      const where: Record<string, unknown> = { userId }
      if (params['status']) where['status'] = params['status'] as string
      const tasks = await prisma.task.findMany({ where, orderBy: { createdAt: 'desc' } })
      if (tasks.length === 0) return 'Нет задач'
      return tasks.map((t) => `- [${t.status}] ${t.title} (приоритет: ${t.priority})`).join('\n')
    },
  },
  {
    name: 'delete_task',
    description: 'Удалить задачу',
    parameters: {
      taskId: { type: 'string', description: 'ID задачи', required: true },
    },
    execute: async (params: P) => {
      const task = await prisma.task.delete({ where: { id: params['taskId'] as string } })
      return `Задача "${task.title}" удалена`
    },
  },
  {
    name: 'create_checklist',
    description: 'Создать чек-лист с пунктами',
    parameters: {
      title: { type: 'string', description: 'Название чек-листа', required: true },
      items: { type: 'string', description: 'Пункты через запятую' },
    },
    execute: async (params: P, userId: string) => {
      const itemsList = ((params['items'] as string) || '').split(',').map((s: string) => s.trim()).filter(Boolean)
      const checklist = await prisma.checklist.create({
        data: {
          userId,
          title: params['title'] as string,
          items: {
            create: itemsList.map((item: string, i: number) => ({
              title: item,
              category: 'Общее',
              order: i + 1,
            })),
          },
        },
        include: { items: true },
      })
      return `Чек-лист "${checklist.title}" создан с ${checklist.items.length} пунктами`
    },
  },
  {
    name: 'complete_checklist_item',
    description: 'Отметить пункт чек-листа как выполненный',
    parameters: {
      itemId: { type: 'string', description: 'ID пункта', required: true },
    },
    execute: async (params: P) => {
      const item = await prisma.checklistItem.update({
        where: { id: params['itemId'] as string },
        data: { completed: true, completedAt: new Date() },
      })
      return `Пункт "${item.title}" отмечен как выполненный`
    },
  },
  {
    name: 'list_checklists',
    description: 'Показать чек-листы пользователя',
    parameters: {},
    execute: async (_params: P, userId: string) => {
      const checklists = await prisma.checklist.findMany({
        where: { userId },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      })
      if (checklists.length === 0) return 'Нет чек-листов'
      return checklists.map((cl) => {
        const done = cl.items.filter((i) => i.completed).length
        return `- ${cl.title} (${done}/${cl.items.length} выполнено)`
      }).join('\n')
    },
  },
  {
    name: 'get_health_score',
    description: 'Получить текущую оценку здоровья бизнеса',
    parameters: {},
    execute: async (_params: P, userId: string) => {
      const analytics = await prisma.analytics.findFirst({
        where: { userId, type: 'health_score' },
        orderBy: { createdAt: 'desc' },
      })
      if (!analytics) return 'Оценка здоровья ещё не рассчитана. Рекомендую запросить расчёт.'
      const data = analytics.data as Record<string, number>
      return `Здоровье бизнеса: ${data['overall'] || 'N/A'}/100\nФинансы: ${data['financial'] || 'N/A'}\nРынок: ${data['market'] || 'N/A'}\nКоманда: ${data['team'] || 'N/A'}\nПродукт: ${data['product'] || 'N/A'}\nРост: ${data['growth'] || 'N/A'}`
    },
  },
  {
    name: 'get_tasks_stats',
    description: 'Получить статистику по задачам',
    parameters: {},
    execute: async (_params: P, userId: string) => {
      const tasks = await prisma.task.findMany({ where: { userId }, select: { status: true } })
      const stats = { todo: 0, in_progress: 0, review: 0, done: 0 }
      tasks.forEach((t) => { stats[t.status as keyof typeof stats]++ })
      return `Задачи: ${stats.todo} в очереди, ${stats.in_progress} в работе, ${stats.review} на проверке, ${stats.done} выполнено. Всего: ${tasks.length}`
    },
  },
  {
    name: 'suggest_next_steps',
    description: 'Проанализировать текущее состояние и предложить следующие шаги',
    parameters: {},
    execute: async (_params: P, userId: string) => {
      const tasks = await prisma.task.findMany({ where: { userId }, select: { status: true, title: true } })
      const checklists = await prisma.checklist.findMany({ where: { userId }, include: { items: { select: { completed: true } } } })
      const docs = await prisma.document.findMany({ where: { userId }, select: { type: true } })

      const pendingTasks = tasks.filter((t) => t.status !== 'done').length
      const totalItems = checklists.reduce((acc, cl) => acc + cl.items.length, 0)
      const doneItems = checklists.reduce((acc, cl) => acc + cl.items.filter((i) => i.completed).length, 0)
      const checklistProgress = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0
      const docTypes = docs.map((d) => d.type)

      const suggestions: string[] = []
      if (pendingTasks > 5) suggestions.push('У вас много незавершённых задач. Сфокусируйтесь на самых важных.')
      if (checklistProgress < 50 && checklists.length > 0) suggestions.push(`Чек-лист выполнен на ${checklistProgress}%. Продолжайте работать над пунктами.`)
      if (!docTypes.includes('business_plan')) suggestions.push('Создайте бизнес-план — это основа для всех решений.')
      if (!docTypes.includes('financial_model')) suggestions.push('Составьте финансовую модель для прогнозирования.')
      if (tasks.filter((t) => t.status === 'done').length === 0 && tasks.length > 0) suggestions.push('Начните выполнять задачи — первые результаты мотивируют!')
      if (suggestions.length === 0) suggestions.push('Отличная работа! Продолжайте в том же духе.')

      return suggestions.join('\n')
    },
  },
  {
    name: 'get_documents',
    description: 'Показать список документов пользователя',
    parameters: {},
    execute: async (_params: P, userId: string) => {
      const docs = await prisma.document.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
      if (docs.length === 0) return 'Нет документов. Рекомендую создать бизнес-план.'
      return docs.map((d) => `- ${d.title} (${d.type})`).join('\n')
    },
  },
  {
    name: 'get_financial_data',
    description: 'Получить финансовую информацию о бизнесе',
    parameters: {},
    execute: async (_params: P, userId: string) => {
      const analytics = await prisma.analytics.findFirst({
        where: { userId, type: 'financial_forecast' },
        orderBy: { createdAt: 'desc' },
      })
      if (!analytics) return 'Финансовые данные ещё не рассчитаны.'
      const data = analytics.data as Record<string, unknown>
      return `Финансовый прогноз: выручка ${data['revenue'] || 'N/A'}, расходы ${data['expenses'] || 'N/A'}`
    },
  },
]

export function getToolByName(name: string): Tool | undefined {
  return tools.find((t) => t.name === name)
}

export function getToolsDescription(): string {
  return tools.map((t) => {
    const params = Object.entries(t.parameters)
      .map(([k, v]) => `${k}: ${v.type}${v.required ? ' (обязательно)' : ''}`)
      .join(', ')
    return `- ${t.name}: ${t.description} [${params}]`
  }).join('\n')
}
