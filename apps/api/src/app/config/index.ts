import { z } from 'zod'
import { config as loadEnv } from 'dotenv'
import { resolve } from 'path'

loadEnv({ path: resolve(process.cwd(), '../../.env') })

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PORT: z.coerce.number().default(3001),
  API_HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default('7d'),
  OPENROUTER_API_KEY: z.string().optional(),
  DEFAULT_MODEL: z.string().default('openai/gpt-4o'),
  FALLBACK_MODEL: z.string().default('anthropic/claude-3.5-sonnet'),
  AI_TEMPERATURE: z.coerce.number().default(0.7),
  AI_MAX_TOKENS: z.coerce.number().default(4096),
  VITE_API_URL: z.string().optional(),
})

function loadConfig() {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors)
    process.exit(1)
  }

  return parsed.data
}

export const config = loadConfig()
export type Config = z.infer<typeof envSchema>
