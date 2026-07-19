import { getLLMProvider, type LLMProvider } from '../llm/client.js'
import type { LLMMessage } from '../llm/types.js'

export interface AgentContext {
  userId: string
  message: string
  conversationHistory: LLMMessage[]
  businessInfo: {
    businessName: string | null
    businessType: string | null
    stage: string | null
    revenue: number | null
  }
}

export interface AgentResult {
  agentType: string
  content: string
  metadata?: Record<string, unknown>
}

export abstract class BaseAgent {
  protected provider: LLMProvider
  abstract readonly agentType: string
  abstract readonly name: string
  abstract readonly systemPrompt: string

  constructor() {
    this.provider = getLLMProvider()
  }

  protected buildMessages(context: AgentContext): LLMMessage[] {
    const systemMessage: LLMMessage = {
      role: 'system',
      content: this.getSystemPromptWithContext(context),
    }

    const recentHistory = context.conversationHistory.slice(-10)

    return [systemMessage, ...recentHistory, { role: 'user', content: context.message }]
  }

  protected getSystemPromptWithContext(context: AgentContext): string {
    const businessContext = context.businessInfo.businessName
      ? `\n\nИнформация о бизнесе пользователя:\n- Название: ${context.businessInfo.businessName}\n- Тип: ${context.businessInfo.businessType || 'не определён'}\n- Этап: ${context.businessInfo.stage || 'начальный'}\n- Выручка: ${context.businessInfo.revenue ? `${context.businessInfo.revenue} руб./мес.` : 'не определена'}`
      : '\n\nПользователь пока не указал информацию о своём бизнесе. Помоги ему определиться.'

    return this.systemPrompt + businessContext
  }

  async process(context: AgentContext): Promise<AgentResult> {
    const messages = this.buildMessages(context)

    const response = await this.provider.chat({
      messages,
      temperature: 0.7,
      maxTokens: 1024,
    })

    return {
      agentType: this.agentType,
      content: response.content,
    }
  }

  async *processStream(context: AgentContext): AsyncGenerator<string> {
    const messages = this.buildMessages(context)

    const stream = this.provider.chatStream({
      messages,
      temperature: 0.7,
      maxTokens: 1024,
    })

    for await (const chunk of stream) {
      if (chunk.content) {
        yield chunk.content
      }
    }
  }
}
