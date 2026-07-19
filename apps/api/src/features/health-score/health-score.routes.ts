import type { FastifyInstance } from 'fastify'
import { healthScoreService } from './health-score.service.js'
import { requireAuth } from '../../shared/auth/middleware.js'

export async function healthRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Health Score'],
        summary: 'Calculate business health score',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const userId = (request as any).user.userId
      const score = await healthScoreService.calculate(userId)
      return reply.send({ success: true, data: score })
    },
  )
}
