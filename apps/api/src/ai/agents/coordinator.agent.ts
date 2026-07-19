import { BaseAgent, type AgentContext, type AgentResult } from './base.agent.js'
import { CEOAgent } from './ceo.agent.js'
import { PlannerAgent } from './planner.agent.js'
import { FinanceAgent } from './finance.agent.js'
import { MarketingAgent } from './marketing.agent.js'
import { LegalAgent } from './legal.agent.js'
import { TaxAgent } from './tax.agent.js'
import { PaymentsAgent } from './payments.agent.js'
import { GrowthAgent } from './growth.agent.js'
import { tools, getToolsDescription } from '../tools/registry.js'

export class CoordinatorAgent extends BaseAgent {
  readonly agentType = 'coordinator'
  readonly name = 'Координатор'

  readonly systemPrompt = `Ты — AI-помощник Alfa Start AI для молодых предпринимателей (17–25 лет).

Ты УМЕЕШЬ управлять данными через инструменты. Когда нужно создать/посмотреть/удалить данные — ВЫЗВАЙ инструмент.

Доступные инструменты:
${getToolsDescription()}

ВАЖНО: Когда тебе нужно вызвать инструмент, ты ОБЯЗАН добавить специальную строку в свой ответ в формате:
[TOOL:название_инструмента]параметр1=значение1,параметр2=значение2

Примеры:
- "Хорошо, создам задачу для тебя!\n[TOOL:create_task]title=Купить ноутбук,priority=high"
- "Вот список твоих задач:\n[TOOL:list_tasks]"
- "Вот что делать дальше:\n[TOOL:suggest_next_steps]"

Можешь вызывать НЕСКОЛЬКО инструментов в одном ответе (каждый на новой строке с [TOOL:...]).

После вызова инструмента ты получишь результат — упомяни его в своём ответе.

Доступные агенты (направляй для экспертизы):
- CEO: стратегия, видение
- Planner: бизнес-планы, roadmap
- Finance: финансы, прогнозы
- Marketing: маркетинг, продвижение
- Legal: юридические вопросы
- Tax: налоги, отчётность
- Payments: платёжные решения Альфа-Банка
- Growth: рост, масштабирование

Стиль: дружелюбный, конкретный, на русском.`

  private agents: Map<string, BaseAgent>

  constructor() {
    super()
    const agentsList: [string, BaseAgent][] = [
      ['ceo', new CEOAgent()],
      ['planner', new PlannerAgent()],
      ['finance', new FinanceAgent()],
      ['marketing', new MarketingAgent()],
      ['legal', new LegalAgent()],
      ['tax', new TaxAgent()],
      ['payments', new PaymentsAgent()],
      ['growth', new GrowthAgent()],
    ]
    this.agents = new Map(agentsList)
  }

  override async process(context: AgentContext): Promise<AgentResult> {
    const response = await super.process(context)
    const { cleanText, toolCalls } = this.parseToolCalls(response.content)

    // Also try regex-based detection as fallback
    if (toolCalls.length === 0) {
      const regexResult = await this.tryRegexDetection(context.message)
      if (regexResult) {
        return { agentType: this.agentType, content: regexResult }
      }
    }

    if (toolCalls.length > 0) {
      const results: string[] = []
      for (const tc of toolCalls) {
        const toolDef = tools.find((t) => t.name === tc.name)
        if (toolDef) {
          try {
            const result = await toolDef.execute(tc.params, context.userId)
            results.push(result)
          } catch (err) {
            results.push(`Ошибка: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`)
          }
        }
      }

      const toolResults = results.join('\n')
      const finalContent = cleanText
        ? `${cleanText}\n\n**Результат:**\n${toolResults}`
        : toolResults

      return { agentType: this.agentType, content: finalContent }
    }

    return response
  }

  override async *processStream(context: AgentContext): AsyncGenerator<string> {
    let fullResponse = ''

    for await (const chunk of super.processStream(context)) {
      fullResponse += chunk
      yield chunk
    }

    const { cleanText, toolCalls } = this.parseToolCalls(fullResponse)

    if (toolCalls.length > 0) {
      yield '\n\n'
      for (const tc of toolCalls) {
        const toolDef = tools.find((t) => t.name === tc.name)
        if (toolDef) {
          try {
            const result = await toolDef.execute(tc.params, context.userId)
            yield `**Результат:** ${result}\n\n`
          } catch (err) {
            yield `**Ошибка:** ${err instanceof Error ? err.message : 'Неизвестная ошибка'}\n\n`
          }
        }
      }
    }
  }

  private parseToolCalls(text: string): { cleanText: string; toolCalls: Array<{ name: string; params: Record<string, string> }> } {
    const toolCallRegex = /\[TOOL:(\w+)\]([^\n]*)/g
    const toolCalls: Array<{ name: string; params: Record<string, string> }> = []
    let cleanText = text

    let match
    while ((match = toolCallRegex.exec(text)) !== null) {
      const name = match[1] ?? ''
      const paramsStr = match[2]?.trim() ?? ''
      const params: Record<string, string> = {}

      if (paramsStr) {
        const pairs = paramsStr.split(',')
        for (const pair of pairs) {
          const [key, ...valueParts] = pair.split('=')
          if (key && valueParts.length > 0) {
            params[key.trim()] = valueParts.join('=').trim()
          }
        }
      }

      toolCalls.push({ name, params })
      cleanText = cleanText.replace(match[0], '')
    }

    cleanText = cleanText.trim()
    return { cleanText, toolCalls }
  }

  private async tryRegexDetection(message: string): Promise<string | null> {
    const lower = message.toLowerCase()
    const patterns: Array<{ pattern: RegExp; tool: string; getParams: (m: RegExpMatchArray) => Record<string, string> }> = [
      { pattern: /создай(?: задачу|ТЕ)?\s*[:"]?\s*(.+)/i, tool: 'create_task', getParams: (m) => ({ title: (m[1] || '').trim() }) },
      { pattern: /новая задача[:"]?\s*(.+)/i, tool: 'create_task', getParams: (m) => ({ title: (m[1] || '').trim() }) },
      { pattern: /задача[:"]?\s*(.+)/i, tool: 'create_task', getParams: (m) => ({ title: (m[1] || '').trim() }) },
      { pattern: /список задач/i, tool: 'list_tasks', getParams: () => ({}) },
      { pattern: /мои задачи/i, tool: 'list_tasks', getParams: () => ({}) },
      { pattern: /что делать дальше/i, tool: 'suggest_next_steps', getParams: () => ({}) },
      { pattern: /следующие шаги/i, tool: 'suggest_next_steps', getParams: () => ({}) },
      { pattern: /что сделать/i, tool: 'suggest_next_steps', getParams: () => ({}) },
      { pattern: /статус(?: задач)?/i, tool: 'get_tasks_stats', getParams: () => ({}) },
      { pattern: /прогресс/i, tool: 'get_tasks_stats', getParams: () => ({}) },
      { pattern: /здоровье бизнеса/i, tool: 'get_health_score', getParams: () => ({}) },
      { pattern: /создай чек-лист[:"]?\s*(.+)/i, tool: 'create_checklist', getParams: (m) => ({ title: (m[1] || '').trim(), items: (m[1] || '').trim() }) },
      { pattern: /чек-лист[:"]?\s*(.+)/i, tool: 'create_checklist', getParams: (m) => ({ title: (m[1] || '').trim(), items: (m[1] || '').trim() }) },
      { pattern: /мои чек-листы/i, tool: 'list_checklists', getParams: () => ({}) },
      { pattern: /документ(?:ы)?/i, tool: 'get_documents', getParams: () => ({}) },
      { pattern: /финансы/i, tool: 'get_financial_data', getParams: () => ({}) },
    ]

    for (const { pattern, tool, getParams } of patterns) {
      const match = lower.match(pattern)
      if (match) {
        const toolDef = tools.find((t) => t.name === tool)
        if (toolDef) {
          const params = getParams(match)
          return toolDef.execute(params, 'sync')
        }
      }
    }

    return null
  }
}
