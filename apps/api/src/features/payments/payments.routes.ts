import type { FastifyInstance } from 'fastify'
import { paymentsService } from './payments.service.js'
import { requireAuth } from '../../shared/auth/middleware.js'

export async function paymentsRoutes(app: FastifyInstance) {
  app.get(
    '/recommendations',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Payments'],
        summary: 'Get payment product recommendations',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const userId = (request as any).user.userId
      const recommendations = await paymentsService.getRecommendations(userId)
      return reply.send({ success: true, data: recommendations })
    },
  )
}
