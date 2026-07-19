import type { FastifyInstance } from 'fastify'
import { chatService } from './chat.service.js'
import { requireAuth } from '../../shared/auth/middleware.js'

export async function chatRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Chat'],
        summary: 'Send a message',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['message'],
          properties: {
            conversationId: { type: 'string' },
            message: { type: 'string', minLength: 1 },
          },
        },
      },
    },
    async (request, reply) => {
      const userId = (request as any).user.userId
      const { conversationId, message } = request.body as {
        conversationId?: string
        message: string
      }

      const conversation = await chatService.getOrCreateConversation(userId, conversationId)
      const result = await chatService.sendMessage(userId, conversation.id, message)

      return reply.send({
        success: true,
        data: {
          conversationId: conversation.id,
          messageId: result.assistantMessage.id,
          content: result.assistantMessage.content,
          agentType: result.agentType,
        },
      })
    },
  )

  app.get(
    '/',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Chat'],
        summary: 'Get conversations',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const userId = (request as any).user.userId
      const conversations = await chatService.getUserConversations(userId)
      return reply.send({ success: true, data: conversations })
    },
  )

  app.get(
    '/:conversationId',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Chat'],
        summary: 'Get conversation with messages',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            conversationId: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const userId = (request as any).user.userId
      const { conversationId } = request.params as { conversationId: string }

      const conversation = await chatService.getOrCreateConversation(userId, conversationId)
      const history = await chatService.getConversationHistory(conversationId)

      return reply.send({
        success: true,
        data: { conversation, messages: history },
      })
    },
  )

  app.delete(
    '/:conversationId',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Chat'],
        summary: 'Delete conversation',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const userId = (request as any).user.userId
      const { conversationId } = request.params as { conversationId: string }

      await chatService.deleteConversation(userId, conversationId)
      return reply.send({ success: true, message: 'Conversation deleted' })
    },
  )
}
