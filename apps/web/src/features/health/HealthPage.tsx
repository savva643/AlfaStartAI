import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Sparkles, TrendingUp, Users, Package, Rocket } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card'
import { healthApi } from '@/shared/api/endpoints'

interface HealthScore {
  overall: number
  financial: number
  market: number
  team: number
  product: number
  growth: number
  recommendations: string[]
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

const dimensions = [
  { key: 'financial' as const, title: 'Финансы', icon: TrendingUp, color: '#10b981' },
  { key: 'market' as const, title: 'Рынок', icon: Users, color: '#3b82f6' },
  { key: 'team' as const, title: 'Команда', icon: Users, color: '#8b5cf6' },
  { key: 'product' as const, title: 'Продукт', icon: Package, color: '#f59e0b' },
  { key: 'growth' as const, title: 'Рост', icon: Rocket, color: '#ef4444' },
]

function LoadingSkeleton() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-8 w-16 animate-pulse rounded bg-muted" />
                <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function CircularProgress({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (score / 100) * circumference
  const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative">
      <svg className="h-32 w-32 -rotate-90">
        <circle cx="64" cy="64" r="45" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted" />
        <motion.circle
          cx="64"
          cy="64"
          r="45"
          stroke={scoreColor}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color: scoreColor }}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground">из 100</span>
      </div>
    </div>
  )
}

export function HealthPage() {
  const [score, setScore] = useState<HealthScore | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    healthApi
      .calculate()
      .then((res) => setScore(res.data.data))
      .catch(() => setError('Не удалось загрузить данные'))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <LoadingSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="h-16 w-16 rounded-2xl bg-[#EF3E33]/10 flex items-center justify-center mb-4">
          <Heart className="h-8 w-8 text-[#EF3E33]" />
        </div>
        <h1 className="text-2xl font-bold">Ошибка</h1>
        <p className="text-muted-foreground mt-2">{error}</p>
      </div>
    )
  }

  if (!score) return null

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Здоровье бизнеса</h1>
        <p className="text-muted-foreground">Комплексная оценка вашего бизнеса</p>
      </motion.div>

      {/* Overall Score */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <CircularProgress score={score.overall} />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Общая оценка здоровья</p>
                <h2 className="text-2xl font-bold">
                  {score.overall >= 80 ? 'Отлично' : score.overall >= 60 ? 'Хорошо' : 'Требует внимания'}
                </h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-md">
                  {score.overall >= 80
                    ? 'Ваш бизнес в хорошем состоянии. Продолжайте в том же духе!'
                    : score.overall >= 60
                    ? 'Бизнес развивается, но есть возможности для улучшения.'
                    : 'Есть критические области, требующие внимания.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dimension Bars */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {dimensions.map((dim) => {
          const value = score[dim.key] as number
          return (
            <motion.div key={dim.key} variants={item}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg p-2" style={{ backgroundColor: `${dim.color}15` }}>
                        <dim.icon className="h-4 w-4" style={{ color: dim.color }} />
                      </div>
                      <span className="text-sm font-medium">{dim.title}</span>
                    </div>
                    <span className="text-lg font-bold" style={{ color: dim.color }}>
                      {value}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: dim.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Recommendations */}
      {score.recommendations && score.recommendations.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#EF3E33]" />
                Рекомендации
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {score.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-lg border border-border p-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#EF3E33]" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
