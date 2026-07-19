import type { FastifyInstance } from 'fastify'
import { swotService } from './swot.service.js'
import { requireAuth } from '../../shared/auth/middleware.js'

export async function swotRoutes(app: FastifyInstance) {
  app.post(
    '/analyze',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['SWOT'],
        summary: 'Run SWOT analysis',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            context: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const userId = (request as any).user.userId
      const body = (request.body || {}) as { context?: string }
      const result = await swotService.analyze(userId, body.context)
      return reply.send({ success: true, data: result })
    },
  )
}
