import { prisma } from '../../shared/db/index.js'

export class TasksService {
  async getUserTasks(userId: string) {
    return prisma.task.findMany({
      where: { userId },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    })
  }

  async createTask(userId: string, data: {
    title: string
    description?: string
    status?: string
    priority?: string
    dueDate?: string
  }) {
    return prisma.task.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    })
  }

  async updateTask(taskId: string, data: {
    title?: string
    description?: string
    status?: string
    priority?: string
    dueDate?: string
  }) {
    return prisma.task.update({
      where: { id: taskId },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
    })
  }

  async deleteTask(taskId: string) {
    return prisma.task.delete({ where: { id: taskId } })
  }
}

export const tasksService = new TasksService()
