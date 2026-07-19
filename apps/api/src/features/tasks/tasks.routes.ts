import type { FastifyInstance } from 'fastify'
import { tasksService } from './tasks.service.js'
import { requireAuth } from '../../shared/auth/middleware.js'

export async function tasksRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [requireAuth],
      schema: { tags: ['Tasks'], summary: 'Get tasks', security: [{ bearerAuth: [] }] },
    },
    async (request, reply) => {
      const userId = (request as any).user.userId
      const tasks = await tasksService.getUserTasks(userId)
      return reply.send({ success: true, data: tasks })
    },
  )

  app.post(
    '/',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Tasks'],
        summary: 'Create task',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string' },
            priority: { type: 'string' },
            dueDate: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const userId = (request as any).user.userId
      const task = await tasksService.createTask(userId, request.body as any)
      return reply.send({ success: true, data: task })
    },
  )

  app.patch(
    '/:taskId',
    {
      preHandler: [requireAuth],
      schema: { tags: ['Tasks'], summary: 'Update task', security: [{ bearerAuth: [] }] },
    },
    async (request, reply) => {
      const { taskId } = request.params as { taskId: string }
      const task = await tasksService.updateTask(taskId, request.body as any)
      return reply.send({ success: true, data: task })
    },
  )

  app.delete(
    '/:taskId',
    {
      preHandler: [requireAuth],
      schema: { tags: ['Tasks'], summary: 'Delete task', security: [{ bearerAuth: [] }] },
    },
    async (request, reply) => {
      const { taskId } = request.params as { taskId: string }
      await tasksService.deleteTask(taskId)
      return reply.send({ success: true, message: 'Task deleted' })
    },
  )
}
