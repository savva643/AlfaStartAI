export const AGENT_TYPES = {
  COORDINATOR: 'coordinator',
  CEO: 'ceo',
  PLANNER: 'planner',
  FINANCE: 'finance',
  MARKETING: 'marketing',
  LEGAL: 'legal',
  TAX: 'tax',
  PAYMENTS: 'payments',
  GROWTH: 'growth',
} as const

export const AGENT_NAMES: Record<string, string> = {
  coordinator: 'Координатор',
  ceo: 'CEO',
  planner: 'Бизнес-планировщик',
  finance: 'Финансовый аналитик',
  marketing: 'Маркетолог',
  legal: 'Юрист',
  tax: 'Налоговый консультант',
  payments: 'Платежный эксперт',
  growth: 'Эксперт по росту',
}

export const TASK_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  DONE: 'done',
} as const

export const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const

export const ROADMAP_STEP_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const

export const DOCUMENT_TYPES = {
  BUSINESS_PLAN: 'business_plan',
  PITCH_DECK: 'pitch_deck',
  FINANCIAL_MODEL: 'financial_model',
  LEGAL_DOCUMENT: 'legal_document',
  MARKETING_PLAN: 'marketing_plan',
  SWOT_REPORT: 'swot_report',
  RISK_REPORT: 'risk_report',
} as const

export const RISK_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const

export const BUSINESS_TYPES = [
  'E-commerce',
  'SaaS',
  'Marketplace',
  'Fintech',
  'EdTech',
  'HealthTech',
  'FoodTech',
  'GreenTech',
  'AI/ML',
  'Other',
] as const

export const BUSINESS_STAGES = [
  'idea',
  'mvp',
  'launch',
  'growth',
  'scale',
] as const

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const
