import type { FastifyInstance } from 'fastify'
import { roadmapService } from './roadmap.service.js'
import { requireAuth } from '../../shared/auth/middleware.js'

export async function roadmapRoutes(app: FastifyInstance) {
  app.post(
    '/generate',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Roadmap'],
        summary: 'Generate business roadmap',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['businessName', 'businessType'],
          properties: {
            businessName: { type: 'string' },
            businessType: { type: 'string' },
            stage: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const userId = (request as any).user.userId
      const body = request.body as { businessName: string; businessType: string; stage?: string }
      const roadmap = await roadmapService.generate(userId, body)
      return reply.send({ success: true, data: roadmap })
    },
  )

  app.get(
    '/',
    {
      preHandler: [requireAuth],
      schema: { tags: ['Roadmap'], summary: 'Get user roadmaps', security: [{ bearerAuth: [] }] },
    },
    async (request, reply) => {
      const userId = (request as any).user.userId
      const roadmaps = await roadmapService.getUserRoadmaps(userId)
      return reply.send({ success: true, data: roadmaps })
    },
  )

  app.patch(
    '/step/:stepId',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Roadmap'],
        summary: 'Update roadmap step',
        security: [{ bearerAuth: [] }],
        body: { type: 'object', properties: { status: { type: 'string' } } },
      },
    },
    async (request, reply) => {
      const { stepId } = request.params as { stepId: string }
      const { status } = request.body as { status: string }
      const step = await roadmapService.updateStep(stepId, status)
      return reply.send({ success: true, data: step })
    },
  )
}
