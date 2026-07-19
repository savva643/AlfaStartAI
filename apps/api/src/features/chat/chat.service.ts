import { prisma } from '../../shared/db/index.js'
import { getCoordinator, type AgentContext } from '../../ai/agents/index.js'
import { NotFoundError } from '../../shared/errors/index.js'
import type { LLMMessage } from '../../ai/llm/types.js'

export class ChatService {
  private coordinator = getCoordinator()

  async getOrCreateConversation(userId: string, conversationId?: string) {
    if (conversationId) {
      const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId },
      })
      if (!conversation) {
        throw new NotFoundError('Conversation not found')
      }
      return conversation
    }

    return prisma.conversation.create({
      data: {
        userId,
        title: 'Новый разговор',
      },
    })
  }

  async getConversationHistory(conversationId: string): Promise<LLMMessage[]> {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    })

    return messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }))
  }

  async sendMessage(userId: string, conversationId: string, content: string) {
    const userMessage = await prisma.message.create({
      data: {
        conversationId,
        role: 'user',
        content,
      },
    })

    const history = await this.getConversationHistory(conversationId)
    const user = await prisma.user.findUnique({ where: { id: userId } })

    const context: AgentContext = {
      userId,
      message: content,
      conversationHistory: history.slice(0, -1),
      businessInfo: {
        businessName: user?.businessName || null,
        businessType: user?.businessType || null,
        stage: user?.stage || null,
        revenue: null,
      },
    }

    let result
    try {
      result = await this.coordinator.process(context)
    } catch {
      result = {
        agentType: 'coordinator',
        content: 'Извините, AI-сервис временно недоступен. Попробуйте переформулировать вопрос или повторить позже. Вы также можете использовать быстрые действия на дашборде для создания задач и документов.',
      }
    }

    const assistantMessage = await prisma.message.create({
      data: {
        conversationId,
        role: 'assistant',
        content: result.content,
        agentType: result.agentType,
        metadata: result.metadata as any || undefined,
      },
    })

    return {
      userMessage,
      assistantMessage,
      agentType: result.agentType,
    }
  }

  async *sendMessageStream(userId: string, conversationId: string, content: string) {
    await prisma.message.create({
      data: {
        conversationId,
        role: 'user',
        content,
      },
    })

    const history = await this.getConversationHistory(conversationId)
    const user = await prisma.user.findUnique({ where: { id: userId } })

    const context: AgentContext = {
      userId,
      message: content,
      conversationHistory: history.slice(0, -1),
      businessInfo: {
        businessName: user?.businessName || null,
        businessType: user?.businessType || null,
        stage: user?.stage || null,
        revenue: null,
      },
    }

    let fullContent = ''

    try {
      for await (const chunk of this.coordinator.processStream(context)) {
        fullContent += chunk
        yield chunk
      }
    } catch {
      const fallback = 'Извините, AI-сервис временно недоступен. Попробуйте позже.'
      fullContent = fallback
      yield fallback
    }

    await prisma.message.create({
      data: {
        conversationId,
        role: 'assistant',
        content: fullContent,
        agentType: 'coordinator',
      },
    })
  }

  async getUserConversations(userId: string) {
    return prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    })
  }

  async deleteConversation(userId: string, conversationId: string) {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
    })

    if (!conversation) {
      throw new NotFoundError('Conversation not found')
    }

    await prisma.conversation.delete({
      where: { id: conversationId },
    })
  }
}

export const chatService = new ChatService()
