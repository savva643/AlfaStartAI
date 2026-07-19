// User types
export interface User {
  id: string
  email: string
  name: string
  businessName: string | null
  businessType: string | null
  createdAt: Date
  updatedAt: Date
}

export interface UserCreate {
  email: string
  password: string
  name: string
  businessName?: string
  businessType?: string
}

export interface UserLogin {
  email: string
  password: string
}

// Auth types
export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthPayload {
  userId: string
  email: string
}

// Chat types
export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  id: string
  conversationId: string
  role: MessageRole
  content: string
  agentType: string | null
  metadata: Record<string, unknown> | null
  createdAt: Date
}

export interface Conversation {
  id: string
  userId: string
  title: string
  createdAt: Date
  updatedAt: Date
  messages?: Message[]
}

export interface ChatRequest {
  conversationId?: string
  message: string
}

export interface ChatResponse {
  conversationId: string
  messageId: string
  content: string
  agentType: string
}

// Agent types
export type AgentType =
  | 'coordinator'
  | 'ceo'
  | 'planner'
  | 'finance'
  | 'marketing'
  | 'legal'
  | 'tax'
  | 'payments'
  | 'growth'

export interface AgentContext {
  userId: string
  message: string
  conversationHistory: Message[]
  businessInfo: BusinessInfo
}

export interface AgentResult {
  agentType: AgentType
  content: string
  metadata?: Record<string, unknown>
}

export interface BusinessInfo {
  businessName: string | null
  businessType: string | null
  stage: string | null
  revenue: number | null
  employees: number | null
}

// Roadmap types
export type RoadmapStepStatus = 'pending' | 'in_progress' | 'completed'

export interface RoadmapStep {
  id: string
  roadmapId: string
  title: string
  description: string
  order: number
  status: RoadmapStepStatus
  dueDate: Date | null
  completedAt: Date | null
  metadata: Record<string, unknown> | null
}

export interface Roadmap {
  id: string
  userId: string
  title: string
  description: string
  steps: RoadmapStep[]
  createdAt: Date
  updatedAt: Date
}

// Checklist types
export interface ChecklistItem {
  id: string
  checklistId: string
  title: string
  description: string | null
  completed: boolean
  category: string
  order: number
  completedAt: Date | null
}

export interface Checklist {
  id: string
  userId: string
  title: string
  items: ChecklistItem[]
  createdAt: Date
  updatedAt: Date
}

// Task types
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  id: string
  userId: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: Date | null
  assignedTo: string | null
  createdAt: Date
  updatedAt: Date
}

// Document types
export type DocumentFormat = 'markdown' | 'pdf' | 'docx'

export interface Document {
  id: string
  userId: string
  title: string
  type: string
  content: string
  format: DocumentFormat
  createdAt: Date
  updatedAt: Date
}

// Analytics types
export interface HealthScore {
  overall: number
  financial: number
  market: number
  team: number
  product: number
  growth: number
  breakdown: Record<string, number>
}

export interface SWOTAnalysis {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
}

export interface Competitor {
  name: string
  description: string
  strengths: string[]
  weaknesses: string[]
  marketShare: number | null
}

export interface FinancialForecast {
  revenue: ForecastEntry[]
  expenses: ForecastEntry[]
  profit: ForecastEntry[]
  period: string
}

export interface ForecastEntry {
  month: string
  value: number
  label: string
}

export interface UnitEconomics {
  cac: number
  ltv: number
  ltvCacRatio: number
  paybackPeriod: number
  churnRate: number
  arpu: number
}

export interface Risk {
  id: string
  category: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  probability: number
  mitigation: string
}

export interface PaymentRecommendation {
  productId: string
  name: string
  description: string
  reason: string
  relevanceScore: number
  features: string[]
}

// Settings types
export interface UserSettings {
  id: string
  userId: string
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications: boolean
  aiModel: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// LLM types
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMRequest {
  model: string
  messages: LLMMessage[]
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
