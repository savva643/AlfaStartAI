export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMRequest {
  messages: LLMMessage[]
  model?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface LLMResponse {
  content: string
  model: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface LLMStreamChunk {
  content: string
  done: boolean
}

export interface LLMProvider {
  chat(request: LLMRequest): Promise<LLMResponse>
  chatStream(request: LLMRequest): AsyncGenerator<LLMStreamChunk>
}
