import type { FastifyInstance } from 'fastify'
import { checklistService } from './checklist.service.js'
import { requireAuth } from '../../shared/auth/middleware.js'

export async function checklistRoutes(app: FastifyInstance) {
  app.post(
    '/generate',
    {
      preHandler: [requireAuth],
      schema: { tags: ['Checklist'], summary: 'Generate startup checklist', security: [{ bearerAuth: [] }] },
    },
    async (request, reply) => {
      const userId = (request as any).user.userId
      const checklist = await checklistService.generate(userId)
      return reply.send({ success: true, data: checklist })
    },
  )

  app.get(
    '/',
    {
      preHandler: [requireAuth],
      schema: { tags: ['Checklist'], summary: 'Get checklists', security: [{ bearerAuth: [] }] },
    },
    async (request, reply) => {
      const userId = (request as any).user.userId
      const checklists = await checklistService.getUserChecklists(userId)
      return reply.send({ success: true, data: checklists })
    },
  )

  app.patch(
    '/item/:itemId',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Checklist'],
        summary: 'Toggle checklist item',
        security: [{ bearerAuth: [] }],
        body: { type: 'object', properties: { completed: { type: 'boolean' } } },
      },
    },
    async (request, reply) => {
      const { itemId } = request.params as { itemId: string }
      const { completed } = request.body as { completed: boolean }
      const item = await checklistService.toggleItem(itemId, completed)
      return reply.send({ success: true, data: item })
    },
  )
}
