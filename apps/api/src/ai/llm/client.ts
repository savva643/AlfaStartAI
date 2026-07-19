import { config } from '../../app/config/index.js'
import type { LLMRequest, LLMResponse, LLMStreamChunk, LLMProvider } from './types.js'
import { MockProvider } from './mock.js'

export type { LLMProvider, LLMMessage, LLMRequest, LLMResponse, LLMStreamChunk } from './types.js'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

class OpenRouterProvider implements LLMProvider {
  private apiKey: string
  private defaultModel: string
  private temperature: number
  private maxTokens: number

  constructor() {
    this.apiKey = config.OPENROUTER_API_KEY || ''
    this.defaultModel = config.DEFAULT_MODEL
    this.temperature = config.AI_TEMPERATURE
    this.maxTokens = config.AI_MAX_TOKENS
  }

  async chat(request: LLMRequest): Promise<LLMResponse> {
    const model = request.model || this.defaultModel

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://alfa-start-ai.app',
        'X-Title': 'Alfa Start AI',
      },
      body: JSON.stringify({
        model,
        messages: request.messages,
        temperature: request.temperature ?? this.temperature,
        max_tokens: request.maxTokens ?? this.maxTokens,
        stream: false,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`)
    }

    const data = (await response.json()) as any
    const choice = data.choices?.[0]

    if (!choice) {
      throw new Error('No response from OpenRouter')
    }

    return {
      content: choice.message?.content || '',
      model: data.model || model,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
    }
  }

  async *chatStream(request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
    const model = request.model || this.defaultModel

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://alfa-start-ai.app',
        'X-Title': 'Alfa Start AI',
      },
      body: JSON.stringify({
        model,
        messages: request.messages,
        temperature: request.temperature ?? this.temperature,
        max_tokens: request.maxTokens ?? this.maxTokens,
        stream: true,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data: ')) continue

          const data = trimmed.slice(6)
          if (data === '[DONE]') {
            yield { content: '', done: true }
            return
          }

          try {
            const parsed = JSON.parse(data) as any
            const content = parsed.choices?.[0]?.delta?.content || ''
            if (content) {
              yield { content, done: false }
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }
}

// Fallback wrapper: tries OpenRouter, falls back to Mock on error
class FallbackProvider implements LLMProvider {
  private openrouter: OpenRouterProvider
  private mock: MockProvider
  private usingMock = false

  constructor() {
    this.openrouter = new OpenRouterProvider()
    this.mock = new MockProvider()
  }

  async chat(request: LLMRequest): Promise<LLMResponse> {
    if (this.usingMock) {
      return this.mock.chat(request)
    }
    try {
      return await this.openrouter.chat(request)
    } catch {
      this.usingMock = true
      return this.mock.chat(request)
    }
  }

  async *chatStream(request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
    if (this.usingMock) {
      yield* this.mock.chatStream(request)
      return
    }
    try {
      yield* this.openrouter.chatStream(request)
    } catch {
      this.usingMock = true
      yield* this.mock.chatStream(request)
    }
  }
}

let providerInstance: LLMProvider | null = null

export function getLLMProvider(): LLMProvider {
  if (!providerInstance) {
    const hasKey = config.OPENROUTER_API_KEY && config.OPENROUTER_API_KEY !== 'sk-or-...'
    providerInstance = hasKey ? new FallbackProvider() : new MockProvider()
  }
  return providerInstance
}
