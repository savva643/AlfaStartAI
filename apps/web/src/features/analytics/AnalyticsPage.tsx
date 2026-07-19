import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, BarChart3, CreditCard, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card'
import { analyticsApi } from '@/shared/api/endpoints'

interface HealthData {
  overall: number
  financial: number
  market: number
  team: number
  product: number
  growth: number
}

interface SWOTData {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
}

interface PaymentData {
  name: string
  relevanceScore: number
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

function MiniBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}/100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  )
}

export function AnalyticsPage() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [swot, setSWOT] = useState<SWOTData | null>(null)
  const [payments, setPayments] = useState<PaymentData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      analyticsApi.getHealth(),
      analyticsApi.getSWOT(),
      analyticsApi.getPayments(),
    ]).then(([h, s, p]) => {
      if (h.status === 'fulfilled') setHealth(h.value.data.data)
      if (s.status === 'fulfilled') setSWOT(s.value.data.data)
      if (p.status === 'fulfilled') setPayments(p.value.data.data || [])
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Аналитика</h1>
        <p className="text-muted-foreground">Сводка по всем ключевым метрикам вашего бизнеса</p>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* Health Score Overview */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-[#EF3E33]" />
                Здоровье бизнеса
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col items-center justify-center">
                  <div className="relative h-32 w-32">
                    <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
                      <motion.circle
                        cx="60" cy="60" r="50" fill="none" stroke="#EF3E33" strokeWidth="8"
                        strokeLinecap="round" strokeDasharray={`${(health?.overall || 0) * 3.14} ${314 - (health?.overall || 0) * 3.14}`}
                        initial={{ strokeDasharray: '0 314' }}
                        animate={{ strokeDasharray: `${(health?.overall || 0) * 3.14} ${314 - (health?.overall || 0) * 3.14}` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold">{health?.overall || 0}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Общая оценка</p>
                </div>
                <div className="space-y-3">
                  <MiniBar label="Финансы" value={health?.financial || 0} color="bg-blue-500" />
                  <MiniBar label="Рынок" value={health?.market || 0} color="bg-emerald-500" />
                  <MiniBar label="Команда" value={health?.team || 0} color="bg-purple-500" />
                  <MiniBar label="Продукт" value={health?.product || 0} color="bg-amber-500" />
                  <MiniBar label="Рост" value={health?.growth || 0} color="bg-[#EF3E33]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* SWOT Summary */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#EF3E33]" />
                SWOT-анализ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
                  <p className="mb-2 font-medium text-emerald-700 dark:text-emerald-400">Сильные стороны</p>
                  <ul className="space-y-1 text-sm text-emerald-600 dark:text-emerald-300">
                    {swot?.strengths?.slice(0, 3).map((s, i) => <li key={i}>• {s}</li>)}
                  </ul>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
                  <p className="mb-2 font-medium text-red-700 dark:text-red-400">Слабые стороны</p>
                  <ul className="space-y-1 text-sm text-red-600 dark:text-red-300">
                    {swot?.weaknesses?.slice(0, 3).map((s, i) => <li key={i}>• {s}</li>)}
                  </ul>
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                  <p className="mb-2 font-medium text-blue-700 dark:text-blue-400">Возможности</p>
                  <ul className="space-y-1 text-sm text-blue-600 dark:text-blue-300">
                    {swot?.opportunities?.slice(0, 3).map((s, i) => <li key={i}>• {s}</li>)}
                  </ul>
                </div>
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950/30">
                  <p className="mb-2 font-medium text-orange-700 dark:text-orange-400">Угрозы</p>
                  <ul className="space-y-1 text-sm text-orange-600 dark:text-orange-300">
                    {swot?.threats?.slice(0, 3).map((s, i) => <li key={i}>• {s}</li>)}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payments + Quick Stats */}
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#EF3E33]" />
                  Платежные решения
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {payments.slice(0, 4).map((p, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-sm font-medium">{p.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-[#EF3E33]" style={{ width: `${p.relevanceScore}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{p.relevanceScore}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[#EF3E33]" />
                  Быстрая сводка
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm text-muted-foreground">Общее здоровье</span>
                  <span className="font-bold text-[#EF3E33]">{health?.overall || 0}/100</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm text-muted-foreground">Сильные стороны</span>
                  <span className="font-medium">{swot?.strengths?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm text-muted-foreground">Возможности</span>
                  <span className="font-medium">{swot?.opportunities?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm text-muted-foreground">Рекомендации</span>
                  <span className="font-medium">{payments.length} продуктов</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
