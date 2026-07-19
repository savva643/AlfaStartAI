import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Sparkles, Plus, X, TrendingUp, TrendingDown, Target } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card'
import { api } from '@/shared/api/client'

interface Competitor {
  name: string
  description: string
  strengths: string[]
  weaknesses: string[]
  marketShare: number | null
  pricing: string
}

interface CompetitorAnalysis {
  competitors: Competitor[]
  yourPosition: string
  competitiveAdvantages: string[]
  improvementAreas: string[]
  summary: string
}

export function CompetitorsPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<CompetitorAnalysis | null>(null)
  const [competitors, setCompetitors] = useState<string[]>([''])
  const [form, setForm] = useState({
    businessName: '',
    businessType: '',
    targetMarket: '',
    uniqueSellingProposition: '',
  })

  const addCompetitor = () => setCompetitors([...competitors, ''])
  const removeCompetitor = (index: number) => setCompetitors(competitors.filter((_, i) => i !== index))
  const updateCompetitor = (index: number, value: string) => {
    const updated = [...competitors]
    updated[index] = value
    setCompetitors(updated)
  }

  const handleAnalyze = async () => {
    if (!form.businessName || !form.businessType) return
    const validCompetitors = competitors.filter((c) => c.trim())
    if (validCompetitors.length === 0) return

    setIsAnalyzing(true)
    try {
      const response = await api.post('/competitors/analyze', {
        ...form,
        competitors: validCompetitors,
      })
      setResult(response.data.data)
    } catch (error) {
      console.error('Failed to analyze competitors:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Анализ конкурентов</h1>
        <p className="text-muted-foreground">Изучите конкурентов и найдите своё преимущество</p>
      </motion.div>

      {/* Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
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

          <div>
            <label className="text-sm font-medium">Конкуренты *</label>
            <div className="mt-2 space-y-2">
              {competitors.map((comp, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={comp}
                    onChange={(e) => updateCompetitor(i, e.target.value)}
                    className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    placeholder={`Конкурент ${i + 1}`}
                  />
                  {competitors.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCompetitor(i)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addCompetitor}>
                <Plus className="mr-2 h-4 w-4" />
                Добавить конкурента
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Целевой рынок</label>
              <input
                type="text"
                value={form.targetMarket}
                onChange={(e) => setForm({ ...form, targetMarket: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Ваше УТП</label>
              <input
                type="text"
                value={form.uniqueSellingProposition}
                onChange={(e) => setForm({ ...form, uniqueSellingProposition: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
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
          {/* Competitors grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            {result.competitors.map((comp, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle>{comp.name}</CardTitle>
                  <CardDescription>{comp.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-emerald-600 mb-1">Сильные стороны</p>
                    <ul className="text-sm space-y-1">
                      {comp.strengths.map((s, j) => (
                        <li key={j} className="flex items-start gap-1">
                          <TrendingUp className="h-3 w-3 mt-1 text-emerald-500" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600 mb-1">Слабые стороны</p>
                    <ul className="text-sm space-y-1">
                      {comp.weaknesses.map((w, j) => (
                        <li key={j} className="flex items-start gap-1">
                          <TrendingDown className="h-3 w-3 mt-1 text-red-500" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Your position */}
          <div className="grid gap-4 sm:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Ваша позиция
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{result.yourPosition || 'Не определена'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Конкурентные преимущества</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1">
                  {result.competitiveAdvantages.map((adv, i) => (
                    <li key={i}>• {adv}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {result.summary && (
            <Card>
              <CardHeader>
                <CardTitle>Резюме</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{result.summary}</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  )
}
