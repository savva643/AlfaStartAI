import type { FastifyInstance, FastifyError } from 'fastify'
import { AppError } from '../../shared/errors/index.js'
import { ZodError } from 'zod'

export async function errorPlugin(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError, _request, reply) => {
    const { log } = app

    if (error instanceof ZodError) {
      log.warn({ err: error }, 'Validation error')
      return reply.status(400).send({
        success: false,
        error: 'Validation error',
        details: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      })
    }

    if (error instanceof AppError) {
      log.warn({ err: error }, error.message)
      return reply.status(error.statusCode).send({
        success: false,
        error: error.message,
      })
    }

    log.error({ err: error }, 'Unhandled error')

    return reply.status(500).send({
      success: false,
      error: 'Internal server error',
    })
  })
}
