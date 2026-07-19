import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card'
import { swotApi } from '@/shared/api/endpoints'

interface SwotData {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

const quadrants = [
  {
    key: 'strengths' as const,
    title: 'Сильные стороны',
    icon: TrendingUp,
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600',
    dotColor: 'bg-emerald-500',
  },
  {
    key: 'weaknesses' as const,
    title: 'Слабые стороны',
    icon: TrendingDown,
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-600',
    dotColor: 'bg-red-500',
  },
  {
    key: 'opportunities' as const,
    title: 'Возможности',
    icon: CheckCircle,
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600',
    dotColor: 'bg-blue-500',
  },
  {
    key: 'threats' as const,
    title: 'Угрозы',
    icon: AlertTriangle,
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-600',
    dotColor: 'bg-orange-500',
  },
]

function LoadingSkeleton() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-6 w-40 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function SwotPage() {
  const [result, setResult] = useState<SwotData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyze = useCallback(() => {
    setIsAnalyzing(true)
    setError(null)
    swotApi
      .analyze()
      .then((res) => setResult(res.data.data))
      .catch(() => setError('Не удалось провести анализ'))
      .finally(() => {
        setIsLoading(false)
        setIsAnalyzing(false)
      })
  }, [])

  useEffect(() => {
    analyze()
  }, [analyze])

  if (isLoading && !result) return <LoadingSkeleton />

  if (error && !result) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Ошибка</h1>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={analyze} className="mt-4 bg-[#EF3E33] hover:bg-[#EF3E33]/90">
          Попробовать снова
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">SWOT-анализ</h1>
            <p className="text-muted-foreground">Сильные и слабые стороны, возможности и угрозы</p>
          </div>
          <Button
            onClick={analyze}
            disabled={isAnalyzing}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Анализ...' : 'Пересчитать'}
          </Button>
        </div>
      </motion.div>

      {result && (
        <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2">
          {quadrants.map((q) => {
            const items = result[q.key] || []
            return (
              <motion.div key={q.key} variants={item}>
                <Card className={`h-full ${q.border} border`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className={`rounded-lg p-2 ${q.iconBg}`}>
                        <q.icon className={`h-4 w-4 ${q.iconColor}`} />
                      </div>
                      {q.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {items.length > 0 ? (
                      <ul className="space-y-2">
                        {items.map((text, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${q.dotColor}`} />
                            {text}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">Нет данных</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
