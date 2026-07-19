import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Bot, User, Sparkles, Plus, MessageSquare, Trash2,
  CreditCard, CheckSquare, FileText, TrendingUp, Map, Lightbulb,
} from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { chatApi } from '@/shared/api/endpoints'
import { renderMarkdown } from '@/shared/lib/markdown'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  agentType?: string
}

interface Conversation {
  id: string
  title: string
  messages?: Array<{ content: string }>
}

const agentNames: Record<string, string> = {
  coordinator: 'Координатор', ceo: 'CEO', planner: 'Бизнес-планировщик',
  finance: 'Финансовый аналитик', marketing: 'Маркетолог', legal: 'Юрист',
  tax: 'Налоговый консультант', payments: 'Платежный эксперт', growth: 'Эксперт по росту',
}

const quickActions = [
  { label: 'Создать чек-лист', prompt: 'Создай чек-лист для запуска моего бизнеса', icon: CheckSquare, color: 'text-emerald-500' },
  { label: 'Бизнес-план', prompt: 'Помоги составить бизнес-план для моего стартапа', icon: FileText, color: 'text-blue-500' },
  { label: 'Финансовый прогноз', prompt: 'Сделай финансовый прогноз на 6 месяцев', icon: TrendingUp, color: 'text-purple-500' },
  { label: 'Дорожная карта', prompt: 'Составь дорожную карту развития бизнеса', icon: Map, color: 'text-amber-500' },
  { label: 'Продукты Альфа', prompt: 'Подскажи, какие продукты Альфа-Банка подходят для моего бизнеса', icon: CreditCard, color: 'text-[#EF3E33]' },
  { label: 'Совет дня', prompt: 'Дай мне полезный совет для молодого предпринимателя', icon: Lightbulb, color: 'text-yellow-500' },
]

const WELCOME_MSG = `Привет! Я ваш AI-помощник для бизнеса. Вот что я умею:

**Создавать документы:**
- Бизнес-планы, питч-деки, маркетинговые планы
- Финансовые модели, оценки рисков

**Помогать с бизнесом:**
- Составлять чек-листы и дорожные карты
- Анализировать финансовую модель
- Проводить SWOT-анализ

**Рекомендовать продукты:**
- Подбирать решения Альфа-Банка под ваши задачи
- Объяснять, почему тот или иной продукт полезен

Используйте кнопки ниже для быстрого старта или просто напишите вопрос!`

export function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  useEffect(() => {
    chatApi.list().then((res) => setConversations(res.data.data || [])).catch(() => {})
  }, [])

  const loadConversation = async (convId: string) => {
    setActiveConversation(convId)
    setShowWelcome(false)
    try {
      const res = await chatApi.get(convId)
      const msgs = (res.data.data?.messages || []).map((m: { role: string; content: string }, i: number) => ({
        id: `hist-${i}`,
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))
      setMessages(msgs)
    } catch {
      setMessages([])
    }
  }

  const handleSend = async (text?: string) => {
    const msg = text || input
    if (!msg.trim() || isTyping) return

    setShowWelcome(false)
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: msg }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const response = await chatApi.send({ conversationId: activeConversation || undefined, message: msg })
      const data = response.data.data
      if (!activeConversation) {
        setActiveConversation(data.conversationId)
        chatApi.list().then((res) => setConversations(res.data.data || [])).catch(() => {})
      }
      setMessages((prev) => [...prev, { id: data.messageId, role: 'assistant', content: data.content, agentType: data.agentType }])
    } catch {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Извините, произошла ошибка. Проверьте подключение к API.' }])
    } finally {
      setIsTyping(false)
      inputRef.current?.focus()
    }
  }

  const handleNewChat = () => {
    setActiveConversation(null)
    setMessages([])
    setShowWelcome(true)
  }

  const handleDeleteChat = async (convId: string) => {
    try {
      await chatApi.delete(convId)
      setConversations((prev) => prev.filter((c) => c.id !== convId))
      if (activeConversation === convId) handleNewChat()
    } catch {}
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="space-y-2 p-4">
          <Button onClick={handleNewChat} className="w-full bg-[#EF3E33] hover:bg-[#EF3E33]/90">
            <Plus className="mr-2 h-4 w-4" /> Новый чат
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-2">
          {conversations.map((conv) => (
            <div key={conv.id} className="group flex items-center">
              <button
                onClick={() => loadConversation(conv.id)}
                className={`flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  activeConversation === conv.id ? 'bg-[#EF3E33] text-white' : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="truncate">{conv.title}</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteChat(conv.id) }}
                className="shrink-0 p-1 text-muted-foreground hover:text-[#EF3E33] opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col">
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-3xl space-y-4">
            {showWelcome && messages.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="rounded-2xl bg-muted p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Bot className="h-6 w-6 text-[#EF3E33]" />
                    <span className="font-semibold">AI-помощник</span>
                  </div>
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(WELCOME_MSG) }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((qa) => (
                    <button
                      key={qa.label}
                      onClick={() => handleSend(qa.prompt)}
                      className="flex items-center gap-3 rounded-xl border border-border p-3 text-left transition-all hover:border-[#EF3E33]/30 hover:bg-accent"
                    >
                      <qa.icon className={`h-5 w-5 shrink-0 ${qa.color}`} />
                      <span className="text-sm font-medium">{qa.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EF3E33]/10">
                      <Bot className="h-4 w-4 text-[#EF3E33]" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user' ? 'bg-[#EF3E33] text-white' : 'bg-muted'}`}>
                    {message.agentType && message.role === 'assistant' && (
                      <div className="mb-1 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-[#EF3E33]" />
                        <span className="text-xs font-medium text-[#EF3E33]">{agentNames[message.agentType] || message.agentType}</span>
                      </div>
                    )}
                    {message.role === 'assistant' ? (
                      <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:mb-1 prose-headings:mt-3 prose-headings:mb-1 prose-li:ml-4 prose-table:text-sm"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }} />
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EF3E33]/10">
                  <Bot className="h-4 w-4 text-[#EF3E33]" />
                </div>
                <div className="rounded-2xl bg-muted px-4 py-3">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-border p-4 lg:p-6">
          <div className="mx-auto max-w-3xl">
            <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="flex gap-2">
              <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="Спросите о вашем бизнесе..."
                className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#EF3E33]"
                disabled={isTyping} />
              <Button type="submit" size="icon" disabled={!input.trim() || isTyping} className="bg-[#EF3E33] hover:bg-[#EF3E33]/90">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
