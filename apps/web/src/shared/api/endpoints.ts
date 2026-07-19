import { api } from './client'

// Auth
export const authApi = {
  register: (data: { email: string; password: string; name: string; businessName?: string; businessType?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

// Chat
export const chatApi = {
  send: (data: { conversationId?: string; message: string }) => api.post('/chat', data),
  list: () => api.get('/chat'),
  get: (id: string) => api.get(`/chat/${id}`),
  delete: (id: string) => api.delete(`/chat/${id}`),
}

// Roadmap
export const roadmapApi = {
  generate: (data: { businessName: string; businessType: string; stage?: string }) =>
    api.post('/roadmap/generate', data),
  list: () => api.get('/roadmap'),
  updateStep: (stepId: string, status: string) => api.patch(`/roadmap/step/${stepId}`, { status }),
}

// Health Score
export const healthApi = {
  calculate: () => api.get('/health-score'),
}

// SWOT
export const swotApi = {
  analyze: (data?: { context?: string }) => api.post('/swot/analyze', data || {}),
}

// Financial
export const financialApi = {
  forecast: () => api.post('/financial/forecast', {}),
}

// Analytics
export const analyticsApi = {
  getHealth: () => api.get('/health-score'),
  getFinancial: () => api.post('/financial/forecast', {}),
  getSWOT: () => api.post('/swot/analyze', {}),
  getPayments: () => api.get('/payments/recommendations'),
}

// Checklist
export const checklistApi = {
  generate: () => api.post('/checklist/generate'),
  list: () => api.get('/checklist'),
  toggleItem: (itemId: string, completed: boolean) =>
    api.patch(`/checklist/item/${itemId}`, { completed }),
}

// Tasks
export const tasksApi = {
  list: () => api.get('/tasks'),
  create: (data: { title: string; description?: string; status?: string; priority?: string; dueDate?: string }) =>
    api.post('/tasks', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
}

// Documents
export const documentsApi = {
  generate: (data: { type: string; context?: string }) => api.post('/documents/generate', data),
  list: () => api.get('/documents'),
  get: (id: string) => api.get(`/documents/${id}`),
  delete: (id: string) => api.delete(`/documents/${id}`),
}

// Payments
export const paymentsApi = {
  recommendations: () => api.get('/payments/recommendations'),
}
