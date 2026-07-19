import Fastify from 'fastify'
import { config } from './config/index.js'
import { logger } from '../shared/logger/index.js'
import { errorPlugin } from './plugins/error.js'
import { corsPlugin } from './plugins/cors.js'
import { jwtPlugin } from './plugins/jwt.js'
import { swaggerPlugin } from './plugins/swagger.js'
import { authRoutes } from '../features/auth/auth.routes.js'
import { chatRoutes } from '../features/chat/chat.routes.js'
import { roadmapRoutes } from '../features/roadmap/roadmap.routes.js'
import { healthRoutes } from '../features/health-score/health-score.routes.js'
import { swotRoutes } from '../features/swot/swot.routes.js'
import { financialRoutes } from '../features/financial/financial.routes.js'
import { checklistRoutes } from '../features/checklist/checklist.routes.js'
import { tasksRoutes } from '../features/tasks/tasks.routes.js'
import { documentsRoutes } from '../features/documents/documents.routes.js'
import { paymentsRoutes } from '../features/payments/payments.routes.js'

const app = Fastify({
  logger: {
    level: config.NODE_ENV === 'development' ? 'debug' : 'info',
  },
})

async function buildApp() {
  await app.register(errorPlugin)
  await app.register(corsPlugin)
  await app.register(jwtPlugin)
  await app.register(swaggerPlugin)

  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  }))

  await app.register(authRoutes, { prefix: '/api/auth' })
  await app.register(chatRoutes, { prefix: '/api/chat' })
  await app.register(roadmapRoutes, { prefix: '/api/roadmap' })
  await app.register(healthRoutes, { prefix: '/api/health-score' })
  await app.register(swotRoutes, { prefix: '/api/swot' })
  await app.register(financialRoutes, { prefix: '/api/financial' })
  await app.register(checklistRoutes, { prefix: '/api/checklist' })
  await app.register(tasksRoutes, { prefix: '/api/tasks' })
  await app.register(documentsRoutes, { prefix: '/api/documents' })
  await app.register(paymentsRoutes, { prefix: '/api/payments' })

  try {
    await app.listen({ port: config.API_PORT, host: config.API_HOST })
    logger.info(`Server running on http://${config.API_HOST}:${config.API_PORT}`)
    logger.info(`API docs available at http://localhost:${config.API_PORT}/docs`)
  } catch (err) {
    logger.error(err, 'Failed to start server')
    process.exit(1)
  }
}

buildApp()
