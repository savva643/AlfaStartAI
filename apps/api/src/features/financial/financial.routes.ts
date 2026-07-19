import type { FastifyInstance } from 'fastify'
import { financialService } from './financial.service.js'
import { requireAuth } from '../../shared/auth/middleware.js'

export async function financialRoutes(app: FastifyInstance) {
  app.post(
    '/forecast',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Financial'],
        summary: 'Generate financial forecast',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const userId = (request as any).user.userId
      const forecast = await financialService.forecast(userId)
      return reply.send({ success: true, data: forecast })
    },
  )
}
