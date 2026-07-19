import { prisma } from '../../shared/db/index.js'
import { getLLMProvider } from '../../ai/llm/client.js'
import type { LLMMessage } from '../../ai/llm/types.js'

export class DocumentsService {
  private provider = getLLMProvider()

  async generate(userId: string, type: string, context?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    const name = user?.businessName || 'стартап'
    const btype = user?.businessType || 'IT'

    const prompts: Record<string, string> = {
      business_plan: `Создай подробный бизнес-план для "${name}" (${btype}). Включи: резюме проекта, анализ рынка, целевую аудиторию, конкурентов, модель монетизации, финансовую модель на год, команду, конкурентные преимущества, roadmap развития. Формат: Markdown с заголовками, таблицами, списками.`,
      pitch_deck: `Создай питч-дек из 12 слайдов для "${name}" (${btype}). Каждый слайд: название, ключевая информация, визуальные рекомендации. Формат: Markdown.`,
      marketing_plan: `Создай маркетинговый план для "${name}" (${btype}). Включи: целевую аудиторию, позиционирование, каналы продвижения (органические, платные, партнёрские), контент-стратегию, бюджет на месяц, KPI. Формат: Markdown с таблицами.`,
      financial_model: `Создай финансовую модель на 12 месяцев для "${name}" (${btype}). Включи: прогноз выручки/расходов/прибыли по месяцам, структуру расходов, точку безубыточности, юнит-экономику (CAC, LTV, ARPU, churn). Формат: Markdown с таблицами.`,
      competitive_analysis: `Проведи анализ конкурентов для "${name}" (${btype}). Найди 5-7 реальных конкурентов, опиши их сильные/слабые стороны, ценовую политику, долю рынка. Определи конкурентные преимущества. Формат: Markdown с таблицами.`,
      investor_letter: `Напиши письмо инвестору для "${name}" (${btype}). Включи: кто мы, какую проблему решаем,市场规模,traction, команда, запрашиваемые инвестиции, использование средств. Тон: профессиональный, но доступный.`,
      user_research: `Создай план исследований пользователей для "${name}" (${btype}). Включи: методы исследований (интервью, анкеты, A/B тесты), вопросы для интервью, целевое количество респондентов, сроки, шаблон анкеты.`,
      risk_assessment: `Проведи оценку рисков для "${name}" (${btype}). Определи 10-15 рисков по категориям: рыночные, финансовые, операционные, технологические, юридические. Для каждого: описание, вероятность, влияние, стратегия митигации. Формат: Markdown с таблицами.`,
      go_to_market: `Создай Go-to-Market стратегию для "${name}" (${btype}). Включи: этапы запуска, каналы, позиционирование, messaging, метрики успеха, бюджет. Формат: Markdown.`,
      unit_economics: `Рассчитай юнит-экономику для "${name}" (${btype}). Определи: CAC, LTV, LTV/CAC, Payback Period, ARPU, ARPA, Churn Rate, MRR, ARR. Построй модель на 12 месяцев. Формат: Markdown с таблицами и формулами.`,
      technical_spec: `Создай техническое задание для "${name}" (${btype}). Опиши: архитектуру системы, технологии, API, базу данных, интеграции, требования к производительности, безопасность. Формат: Markdown.`,
    }

    const typeLabels: Record<string, string> = {
      business_plan: 'Бизнес-план',
      pitch_deck: 'Питч-дек',
      marketing_plan: 'Маркетинговый план',
      financial_model: 'Финансовая модель',
      competitive_analysis: 'Анализ конкурентов',
      investor_letter: 'Письмо инвестору',
      user_research: 'Исследование пользователей',
      risk_assessment: 'Оценка рисков',
      go_to_market: 'Go-to-Market стратегия',
      unit_economics: 'Юнит-экономика',
      technical_spec: 'Техническое задание',
    }

    const prompt = prompts[type as keyof typeof prompts]
    if (!prompt) {
      throw new Error(`Unknown document type: ${type}`)
    }

    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: 'Ты опытный бизнес-консультант и аналитик. Создавай структурированные документы в формате Markdown. Используй таблицы, списки, заголовки. Отвечай на русском языке. Будь конкретным и давай actionable рекомендации.',
      },
      {
        role: 'user',
        content: prompt + (context ? `\n\nДополнительная информация от пользователя: ${context}` : ''),
      },
    ]

    const response = await this.provider.chat({ messages, temperature: 0.7, maxTokens: 1024 })

    return prisma.document.create({
      data: {
        userId,
        title: typeLabels[type as keyof typeof typeLabels] || 'Документ',
        type,
        content: response.content,
        format: 'markdown',
      },
    })
  }

  async getUserDocuments(userId: string) {
    return prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getDocument(docId: string, userId: string) {
    return prisma.document.findFirst({
      where: { id: docId, userId },
    })
  }

  async deleteDocument(docId: string, userId: string) {
    return prisma.document.deleteMany({
      where: { id: docId, userId },
    })
  }
}

export const documentsService = new DocumentsService()
