import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckSquare,
  FileText,
  ArrowRight,
  Sparkles,
  CreditCard,
  BarChart3,
  Map,
  Heart,
  Bot,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { useAuth } from '@/features/auth/useAuth'
import { healthApi, tasksApi, documentsApi, checklistApi, paymentsApi } from '@/shared/api/endpoints'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

interface ChecklistItem {
  id: string
  title: string
  completed: boolean
  category: string
}

interface Checklist {
  id: string
  title: string
  items: ChecklistItem[]
}

interface PaymentRec {
  name: string
  relevanceScore: number
}

export function DashboardPage() {
  const { user } = useAuth()
  const [healthScore, setHealthScore] = useState<number | null>(null)
  const [taskStats, setTaskStats] = useState({ total: 0, done: 0 })
  const [docCount, setDocCount] = useState(0)
  const [checklist, setChecklist] = useState<Checklist | null>(null)
  const [payments, setPayments] = useState<PaymentRec[]>([]) // eslint-disable-line @typescript-eslint/no-unused-vars

  useEffect(() => {
    const p1 = healthApi.calculate().then((r) => setHealthScore(r.data.data?.overall)).catch(() => {})
    const p2 = tasksApi.list().then((r) => {
      const tasks = r.data.data || []
      setTaskStats({ total: tasks.length, done: tasks.filter((t: { status: string }) => t.status === 'done').length })
    }).catch(() => {})
    const p3 = documentsApi.list().then((r) => setDocCount((r.data.data || []).length)).catch(() => {})
    const p4 = checklistApi.list().then((r) => {
      const lists = r.data.data || []
      if (lists.length > 0) setChecklist(lists[0])
    }).catch(() => {})
    const p5 = paymentsApi.recommendations().then((r) => setPayments((r.data.data || []).slice(0, 3))).catch(() => {})

    Promise.allSettled([p1, p2, p3, p4, p5])
  }, [])

  const toggleChecklistItem = (itemId: string, completed: boolean) => {
    checklistApi.toggleItem(itemId, !completed).then(() => {
      if (!checklist) return
      setChecklist({
        ...checklist,
        items: checklist.items.map((i) =>
          i.id === itemId ? { ...i, completed: !completed } : i,
        ),
      })
    }).catch(() => {})
  }

  const stats = [
    {
      title: 'Здоровье бизнеса',
      value: healthScore !== null ? `${healthScore}/100` : '—',
      description: healthScore !== null ? (healthScore >= 70 ? 'Хорошо' : 'Нужна работа') : 'Загрузка...',
      icon: Heart,
      color: 'text-[#EF3E33]',
      bg: 'bg-[#EF3E33]/10',
      href: '/health',
    },
    {
      title: 'Задачи',
      value: taskStats.total > 0 ? `${taskStats.done}/${taskStats.total}` : '0',
      description: taskStats.total > 0 ? 'Выполнено' : 'Нет задач',
      icon: CheckSquare,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      href: '/tasks',
    },
    {
      title: 'Документы',
      value: docCount.toString(),
      description: 'Создано',
      icon: FileText,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      href: '/documents',
    },
    {
      title: 'Агенты AI',
      value: '9',
      description: 'Доступно',
      icon: Bot,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      href: '/chat',
    },
  ]

  const quickActions = [
    { title: 'AI Чат', description: 'Спросите что угодно о вашем бизнесе', href: '/chat', icon: Sparkles, color: 'bg-[#EF3E33]/10 text-[#EF3E33]' },
    { title: 'Дорожная карта', description: 'Сгенерируйте план развития', href: '/roadmap', icon: Map, color: 'bg-blue-500/10 text-blue-500' },
    { title: 'SWOT-анализ', description: 'Оцените позицию бизнеса', href: '/swot', icon: BarChart3, color: 'bg-purple-500/10 text-purple-500' },
    { title: 'Продукты', description: 'Финансовые решения для бизнеса', href: '/products', icon: CreditCard, color: 'bg-amber-500/10 text-amber-500' },
  ]

  const completedCount = checklist?.items.filter((i) => i.completed).length || 0
  const totalCount = checklist?.items.length || 0
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Добро пожаловать, {user?.name || 'Предприниматель'}
        </h1>
        <p className="text-muted-foreground">
          {user?.businessName ? `Бизнес: ${user.businessName}` : 'Настройте информацию о бизнесе для лучшего опыта'}
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <Link to={stat.href}>
              <Card className="transition-all hover:shadow-md hover:border-[#EF3E33]/30 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.description}</p>
                    </div>
                    <div className={`rounded-xl p-3 ${stat.bg}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <motion.div variants={item} initial="hidden" animate="show" className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
              <CardDescription>Начните работать над бизнесом</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  to={action.href}
                  className="flex items-center justify-between rounded-lg border border-border p-3 transition-all hover:bg-accent hover:border-[#EF3E33]/30"
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${action.color}`}>
                      <action.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Real Checklist */}
        <motion.div variants={item} initial="hidden" animate="show" className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{checklist?.title || 'Чек-лист'}</CardTitle>
                  <CardDescription>{completedCount}/{totalCount} выполнено</CardDescription>
                </div>
                <span className="text-2xl font-bold text-[#EF3E33]">{progressPercent}%</span>
              </div>
              {totalCount > 0 && (
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full bg-[#EF3E33]"
                  />
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              {checklist ? (
                checklist.items.slice(0, 5).map((ci) => (
                  <button
                    key={ci.id}
                    onClick={() => toggleChecklistItem(ci.id, ci.completed)}
                    className="flex w-full items-center gap-3 rounded-lg border border-border p-2.5 text-left transition-colors hover:bg-accent"
                  >
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                      ci.completed ? 'border-[#EF3E33] bg-[#EF3E33]' : 'border-muted-foreground/30'
                    }`}>
                      {ci.completed && (
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm ${ci.completed ? 'text-muted-foreground line-through' : ''}`}>
                      {ci.title}
                    </span>
                  </button>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Чек-лист не создан.{' '}
                  <Link to="/checklist" className="text-[#EF3E33] hover:underline">Сгенерировать</Link>
                </p>
              )}
              {checklist && checklist.items.length > 5 && (
                <Link to="/checklist" className="block text-center text-xs text-[#EF3E33] hover:underline pt-1">
                  Показать все ({totalCount})
                </Link>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Recommendations */}
        <motion.div variants={item} initial="hidden" animate="show" className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Рекомендации</CardTitle>
              <CardDescription>Продукты Альфа-Банка для вас</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {payments.length > 0 ? (
                payments.map((p, i) => (
                  <Link
                    key={i}
                    to="/products"
                    className="flex items-center justify-between rounded-lg border border-border p-3 transition-all hover:bg-accent hover:border-[#EF3E33]/30"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{p.name}</p>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-[#EF3E33]"
                          style={{ width: `${p.relevanceScore}%` }}
                        />
                      </div>
                    </div>
                    <span className="ml-3 text-xs font-medium text-muted-foreground">{p.relevanceScore}%</span>
                  </Link>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  <Link to="/products" className="text-[#EF3E33] hover:underline">Получить рекомендации</Link>
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bank Products Banner */}
      <motion.div variants={item} initial="hidden" animate="show" className="mt-8">
        <Card className="overflow-hidden border-[#EF3E33]/20 bg-gradient-to-r from-[#EF3E33]/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-[#EF3E33]/10 p-3">
                  <CreditCard className="h-6 w-6 text-[#EF3E33]" />
                </div>
                <div>
                  <h3 className="font-semibold">Финансовые решения для вашего бизнеса</h3>
                  <p className="text-sm text-muted-staticmethod mt-1">
                    Подберём расчётный счёт, эквайринг и другие продукты под ваши задачи — с учётом текущего состояния бизнеса.
                  </p>
                </div>
              </div>
              <Link to="/products" className="hidden md:flex">
                <Button variant="outline" size="sm" className="border-[#EF3E33]/30 text-[#EF3E33] hover:bg-[#EF3E33]/5 gap-2">
                  Подобрать продукты
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
