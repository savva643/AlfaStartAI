import Redis from 'ioredis'
import { config } from '../../app/config/index.js'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

export const redis =
  globalForRedis.redis ??
  new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: null,
  })

if (config.NODE_ENV !== 'production') {
  globalForRedis.redis = redis
}
