import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, Users, Percent, ArrowUpRight, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { financialApi } from '@/shared/api/endpoints'

interface ForecastEntry {
  month: string
  value: number
  label: string
}

interface FinancialForecast {
  revenue: ForecastEntry[]
  expenses: ForecastEntry[]
  profit: ForecastEntry[]
  unitEconomics: {
    cac: number
    ltv: number
    ltvCacRatio: number
    paybackPeriod: number
    churnRate: number
    arpu: number
  }
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
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-8 w-20 animate-pulse rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function BarChart({ entries, color, maxVal }: { entries: ForecastEntry[]; color: string; maxVal: number }) {
  return (
    <div className="space-y-2">
      {entries.map((entry, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-16 shrink-0">{entry.label}</span>
          <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
            <motion.div
              className="h-full rounded"
              style={{ backgroundColor: color }}
              initial={{ width: 0 }}
              animate={{ width: maxVal > 0 ? `${(entry.value / maxVal) * 100}%` : '0%' }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.1 }}
            />
          </div>
          <span className="text-sm font-medium w-28 text-right shrink-0">
            {entry.value.toLocaleString('ru-RU')} ₽
          </span>
        </div>
      ))}
    </div>
  )
}

function UnitCard({ icon: Icon, label, value, subtext }: { icon: typeof DollarSign; label: string; value: string; subtext?: string }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#EF3E33]/10 p-2.5">
            <Icon className="h-5 w-5 text-[#EF3E33]" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold">{value}</p>
            {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function FinancialPage() {
  const [data, setData] = useState<FinancialForecast | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = () => {
    setIsLoading(true)
    setError(null)
    financialApi
      .forecast()
      .then((res) => setData(res.data.data))
      .catch(() => setError('Не удалось загрузить данные'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  if (isLoading) return <LoadingSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Ошибка</h1>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={loadData} className="mt-4 bg-[#EF3E33] hover:bg-[#EF3E33]/90">
          Попробовать снова
        </Button>
      </div>
    )
  }

  if (!data) return null

  const allValues = [...data.revenue, ...data.expenses, ...data.profit].map((e) => e.value)
  const maxVal = Math.max(...allValues, 1)

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Финансы</h1>
            <p className="text-muted-foreground">Финансовый прогноз и юнит-экономика</p>
          </div>
          <Button onClick={loadData} variant="outline" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
        </div>
      </motion.div>

      {/* Unit Economics */}
      {data.unitEconomics && (
        <motion.div variants={container} initial="hidden" animate="show" className="mb-8">
          <motion.div variants={item}>
            <h2 className="text-lg font-semibold mb-4">Юнит-экономика</h2>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: DollarSign, label: 'CAC', value: `${data.unitEconomics.cac.toLocaleString('ru-RU')} ₽`, subtext: 'Стоимость привлечения' },
              { icon: Users, label: 'LTV', value: `${data.unitEconomics.ltv.toLocaleString('ru-RU')} ₽`, subtext: 'Пожизненная ценность' },
              { icon: ArrowUpRight, label: 'LTV/CAC', value: data.unitEconomics.ltvCacRatio.toFixed(1), subtext: data.unitEconomics.ltvCacRatio >= 3 ? 'Хорошо' : 'Нужно улучшать' },
              { icon: TrendingUp, label: 'Окупаемость', value: `${data.unitEconomics.paybackPeriod} мес`, subtext: 'Срок окупаемости' },
              { icon: Percent, label: 'Churn', value: `${data.unitEconomics.churnRate}%`, subtext: 'Отток клиентов' },
              { icon: DollarSign, label: 'ARPU', value: `${data.unitEconomics.arpu.toLocaleString('ru-RU')} ₽`, subtext: 'Средний доход' },
            ].map((card) => (
              <motion.div key={card.label} variants={item}>
                <UnitCard {...card} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Forecast Charts */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="rounded-lg bg-emerald-500/10 p-1.5">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
                Выручка
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart entries={data.revenue} color="#10b981" maxVal={maxVal} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="rounded-lg bg-red-500/10 p-1.5">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </div>
                Расходы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart entries={data.expenses} color="#ef4444" maxVal={maxVal} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="rounded-lg bg-blue-500/10 p-1.5">
                  <DollarSign className="h-4 w-4 text-blue-500" />
                </div>
                Прибыль
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart entries={data.profit} color="#3b82f6" maxVal={maxVal} />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
