import type { FastifyInstance } from 'fastify'
import { documentsService } from './documents.service.js'
import { requireAuth } from '../../shared/auth/middleware.js'

export async function documentsRoutes(app: FastifyInstance) {
  app.post(
    '/generate',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Documents'],
        summary: 'Generate document',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['type'],
          properties: {
            type: { type: 'string' },
            context: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const userId = (request as any).user.userId
      const { type, context } = request.body as { type: string; context?: string }
      const doc = await documentsService.generate(userId, type, context)
      return reply.send({ success: true, data: doc })
    },
  )

  app.get(
    '/',
    {
      preHandler: [requireAuth],
      schema: { tags: ['Documents'], summary: 'Get documents', security: [{ bearerAuth: [] }] },
    },
    async (request, reply) => {
      const userId = (request as any).user.userId
      const docs = await documentsService.getUserDocuments(userId)
      return reply.send({ success: true, data: docs })
    },
  )

  app.get(
    '/:docId',
    {
      preHandler: [requireAuth],
      schema: { tags: ['Documents'], summary: 'Get document', security: [{ bearerAuth: [] }] },
    },
    async (request, reply) => {
      const userId = (request as any).user.userId
      const { docId } = request.params as { docId: string }
      const doc = await documentsService.getDocument(docId, userId)
      return reply.send({ success: true, data: doc })
    },
  )

  app.delete(
    '/:docId',
    {
      preHandler: [requireAuth],
      schema: { tags: ['Documents'], summary: 'Delete document', security: [{ bearerAuth: [] }] },
    },
    async (request, reply) => {
      const userId = (request as any).user.userId
      const { docId } = request.params as { docId: string }
      await documentsService.deleteDocument(docId, userId)
      return reply.send({ success: true, message: 'Document deleted' })
    },
  )
}
