import type { FastifyInstance } from 'fastify'
import { authService } from './auth.service.js'
import { registerSchema, loginSchema } from './auth.schema.js'
import { requireAuth } from '../../shared/auth/middleware.js'

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', {
    schema: {
      tags: ['Auth'],
      summary: 'Register a new user',
      body: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          name: { type: 'string', minLength: 1 },
          businessName: { type: 'string' },
          businessType: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const input = registerSchema.parse(request.body)
      const result = await authService.register(input)
      return reply.status(201).send({ success: true, data: result })
    },
  })

  app.post('/login', {
    schema: {
      tags: ['Auth'],
      summary: 'Login user',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const input = loginSchema.parse(request.body)
      const result = await authService.login(input)
      return reply.send({ success: true, data: result })
    },
  })

  app.get(
    '/me',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Auth'],
        summary: 'Get current user',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const user = await authService.getMe((request as any).user.userId)
      return reply.send({ success: true, data: user })
    },
  )

  app.patch(
    '/me',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Auth'],
        summary: 'Update user profile',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            businessName: { type: 'string' },
            businessType: { type: 'string' },
            stage: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const user = await authService.updateProfile((request as any).user.userId, request.body as Record<string, string>)
      return reply.send({ success: true, data: user })
    },
  )
}
