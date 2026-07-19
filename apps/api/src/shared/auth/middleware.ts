import type { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'
import { config } from '../../app/config/index.js'

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      reply.status(401).send({ success: false, error: 'Unauthorized' })
      return
    }

    const token = authHeader.slice(7)
    const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: string; email: string }
    ;(request as any).user = decoded
  } catch {
    reply.status(401).send({ success: false, error: 'Unauthorized' })
  }
}
