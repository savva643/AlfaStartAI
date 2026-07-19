import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, CheckCircle, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/shared/ui/Card'
import { paymentsApi } from '@/shared/api/endpoints'
import { useAuth } from '@/features/auth/useAuth'

interface PaymentRecommendation {
  productId: string
  name: string
  description: string
  reason: string
  relevanceScore: number
  features: string[]
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

function LoadingSkeleton() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
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

function getScoreColor(score: number) {
  if (score >= 80) return '#10b981'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}

function getScoreLabel(score: number) {
  if (score >= 80) return 'Отлично подходит'
  if (score >= 50) return 'Рекомендуется'
  return 'Можно рассмотреть'
}

function getProductEmoji(productId: string) {
  const emojis: Record<string, string> = {
    business_account: '🏦',
    acquiring: '💳',
    internet_acquiring: '🌐',
    business_card: '💎',
    credit: '💰',
    leasing: '📦',
  }
  return emojis[productId] || '📦'
}

export function PaymentsPage() {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState<PaymentRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    paymentsApi
      .recommendations()
      .then((res) => setRecommendations(res.data.data || []))
      .catch(() => setError('Не удалось загрузить рекомендации'))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <LoadingSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Ошибка</h1>
        <p className="text-muted-foreground mt-2">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Финансовые решения</h1>
        <p className="text-muted-foreground">
          AI проанализировал ваш бизнес и подобрал подходящие продукты. Вот почему каждый из них полезен именно вам.
        </p>
      </motion.div>

      {/* AI Analysis Summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Card className="border-[#EF3E33]/20 bg-gradient-to-r from-[#EF3E33]/5 to-transparent">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#EF3E33]/10 p-2">
                <Sparkles className="h-5 w-5 text-[#EF3E33]" />
              </div>
              <div>
                <p className="font-medium text-sm">Как AI подбирает продукты</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Мы анализируем тип вашего бизнеса, этап развития и текущие потребности.
                  Каждая рекомендация объясняет, почему именно этот продукт подходит именно вам.
                  {user?.businessName && ` Бизнес: ${user.businessName}.`}
                  {user?.businessType && ` Тип: ${user.businessType}.`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {recommendations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Рекомендации пока не сформированы</p>
          </CardContent>
        </Card>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          {recommendations
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .map((rec) => {
              const scoreColor = getScoreColor(rec.relevanceScore)
              return (
                <motion.div key={rec.productId} variants={item}>
                  <Card className="hover:shadow-md transition-shadow overflow-hidden">
                    <div className="h-1 w-full" style={{ backgroundColor: scoreColor }} />
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        {/* Left: Product info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl">{getProductEmoji(rec.productId)}</span>
                            <div>
                              <h3 className="font-semibold text-lg">{rec.name}</h3>
                              <span
                                className="text-xs font-medium px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: `${scoreColor}15`, color: scoreColor }}
                              >
                                {getScoreLabel(rec.relevanceScore)}
                              </span>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>

                          {/* Why it fits */}
                          <div className="rounded-lg bg-muted/50 p-3 mb-3">
                            <p className="text-xs font-medium text-[#EF3E33] mb-1">Почему этот продукт подходит вам:</p>
                            <p className="text-sm">{rec.reason}</p>
                          </div>

                          {/* Features */}
                          {rec.features.length > 0 && (
                            <div>
                              <p className="text-xs font-medium mb-2 text-muted-foreground">Ключевые преимущества:</p>
                              <div className="flex flex-wrap gap-2">
                                {rec.features.map((f, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs"
                                  >
                                    <CheckCircle className="h-3 w-3 text-[#EF3E33]" />
                                    {f}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right: Score */}
                        <div className="lg:w-32 shrink-0">
                          <div className="rounded-xl border border-border p-4 text-center">
                            <p className="text-3xl font-bold" style={{ color: scoreColor }}>
                              {rec.relevanceScore}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Релевантность</p>
                            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: scoreColor }}
                                initial={{ width: 0 }}
                                animate={{ width: `${rec.relevanceScore}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
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
