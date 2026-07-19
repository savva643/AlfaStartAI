import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Sparkles, Shield, AlertCircle, XCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card'
import { api } from '@/shared/api/client'

interface Risk {
  id: string
  category: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  probability: number
  mitigation: string
}

interface RiskAnalysis {
  risks: Risk[]
  overallRisk: 'low' | 'medium' | 'high'
  summary: string
  topRecommendations: string[]
}

const severityConfig = {
  low: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Низкий' },
  medium: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Средний' },
  high: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Высокий' },
  critical: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Критический' },
}

export function RiskPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<RiskAnalysis | null>(null)
  const [form, setForm] = useState({
    businessName: '',
    businessType: '',
    stage: '',
    description: '',
    targetMarket: '',
  })

  const handleAnalyze = async () => {
    if (!form.businessName || !form.businessType) return

    setIsAnalyzing(true)
    try {
      const response = await api.post('/risk/analyze', form)
      setResult(response.data.data)
    } catch (error) {
      console.error('Failed to analyze risks:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Анализ рисков</h1>
        <p className="text-muted-foreground">Выявите и оцените риски вашего бизнеса</p>
      </motion.div>

      {/* Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Данные для анализа
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Название бизнеса *</label>
              <input
                type="text"
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Тип бизнеса *</label>
              <input
                type="text"
                value={form.businessType}
                onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Стадия</label>
              <input
                type="text"
                value={form.stage}
                onChange={(e) => setForm({ ...form, stage: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="Idea, MVP, Growth..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Целевой рынок</label>
              <input
                type="text"
                value={form.targetMarket}
                onChange={(e) => setForm({ ...form, targetMarket: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Описание</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              rows={2}
            />
          </div>
          <Button onClick={handleAnalyze} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Провести анализ
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Overall risk */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`rounded-xl p-3 ${
                  result.overallRisk === 'high' ? 'bg-red-500/10' :
                  result.overallRisk === 'medium' ? 'bg-amber-500/10' : 'bg-emerald-500/10'
                }`}>
                  <AlertTriangle className={`h-6 w-6 ${
                    result.overallRisk === 'high' ? 'text-red-500' :
                    result.overallRisk === 'medium' ? 'text-amber-500' : 'text-emerald-500'
                  }`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Общая оценка рисков</p>
                  <p className="text-2xl font-bold">
                    {result.overallRisk === 'high' ? 'Высокий' :
                     result.overallRisk === 'medium' ? 'Средний' : 'Низкий'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risks list */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            {result.risks.map((risk) => {
              const config = severityConfig[risk.severity]
              return (
                <Card key={risk.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{risk.title}</CardTitle>
                      <div className={`rounded-lg px-2 py-1 text-xs font-medium ${config.bg} ${config.color}`}>
                        {config.label}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">{risk.description}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Вероятность:</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${risk.probability}%` }}
                        />
                      </div>
                      <span className="font-medium">{risk.probability}%</span>
                    </div>
                    {risk.mitigation && (
                      <p className="text-xs text-muted-foreground">
                        <strong>Меры:</strong> {risk.mitigation}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Recommendations */}
          {result.topRecommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Рекомендации</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.topRecommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  )
}
