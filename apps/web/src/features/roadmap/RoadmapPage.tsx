import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Map, Plus, Check, Clock, Circle, Sparkles } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { roadmapApi } from '@/shared/api/endpoints'

interface RoadmapStep {
  id: string
  roadmapId: string
  title: string
  description: string
  order: number
  status: 'pending' | 'in_progress' | 'completed'
}

interface Roadmap {
  id: string
  title: string
  description: string
  steps: RoadmapStep[]
  createdAt: string
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

const statusConfig = {
  pending: { icon: Circle, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Ожидает' },
  in_progress: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'В работе' },
  completed: { icon: Check, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Готово' },
}

function LoadingSkeleton() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 w-full animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 w-full animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export function RoadmapPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ businessName: '', businessType: '', stage: '' })

  useEffect(() => {
    roadmapApi
      .list()
      .then((res) => {
        const data = res.data.data || []
        setRoadmaps(data)
        if (data.length > 0) setActiveRoadmap(data[0])
      })
      .catch(() => setError('Не удалось загрузить дорожные карты'))
      .finally(() => setIsLoading(false))
  }, [])

  const handleGenerate = async () => {
    if (!form.businessName || !form.businessType) return
    setIsGenerating(true)
    try {
      const res = await roadmapApi.generate(form)
      const newRoadmap = res.data.data
      setRoadmaps((prev) => [newRoadmap, ...prev])
      setActiveRoadmap(newRoadmap)
      setShowForm(false)
      setForm({ businessName: '', businessType: '', stage: '' })
    } catch {
      setError('Не удалось сгенерировать дорожную карту')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUpdateStep = async (stepId: string, newStatus: RoadmapStep['status']) => {
    try {
      await roadmapApi.updateStep(stepId, newStatus)
      if (activeRoadmap) {
        setActiveRoadmap({
          ...activeRoadmap,
          steps: activeRoadmap.steps.map((s) => (s.id === stepId ? { ...s, status: newStatus } : s)),
        })
        setRoadmaps((prev) =>
          prev.map((r) =>
            r.id === activeRoadmap.id
              ? { ...r, steps: r.steps.map((s) => (s.id === stepId ? { ...s, status: newStatus } : s)) }
              : r,
          ),
        )
      }
    } catch {
      setError('Не удалось обновить шаг')
    }
  }

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Дорожная карта</h1>
            <p className="text-muted-foreground">Генерируйте и отслеживайте план развития бизнеса</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-[#EF3E33] hover:bg-[#EF3E33]/90">
            <Plus className="mr-2 h-4 w-4" />
            Создать
          </Button>
        </div>
      </motion.div>

      {error && (
        <div className="mb-6 rounded-lg border border-[#EF3E33]/20 bg-[#EF3E33]/5 p-4 text-sm text-[#EF3E33]">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Закрыть</button>
        </div>
      )}

      {showForm && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#EF3E33]" />
                Генерация дорожной карты
              </CardTitle>
              <CardDescription>AI создаст персональный план развития</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Название бизнеса *</label>
                  <Input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} placeholder="Мой стартап" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Тип бизнеса *</label>
                  <Input value={form.businessType} onChange={(e) => setForm({ ...form, businessType: e.target.value })} placeholder="SaaS, E-commerce..." className="mt-1" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleGenerate} disabled={isGenerating} className="bg-[#EF3E33] hover:bg-[#EF3E33]/90">
                  {isGenerating ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Сгенерировать
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Отмена</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Roadmaps list */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Мои дорожные карты</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {roadmaps.length === 0 ? (
                <div className="flex flex-col items-center py-8">
                  <Map className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground text-center">Нет дорожных карт</p>
                  <Button onClick={() => setShowForm(true)} size="sm" className="mt-3 bg-[#EF3E33] hover:bg-[#EF3E33]/90">
                    Создать первую
                  </Button>
                </div>
              ) : (
                roadmaps.map((roadmap) => {
                  const completed = roadmap.steps.filter((s) => s.status === 'completed').length
                  return (
                    <button
                      key={roadmap.id}
                      onClick={() => { setActiveRoadmap(roadmap); setError(null) }}
                      className={`w-full rounded-lg p-3 text-left text-sm transition-all ${
                        activeRoadmap?.id === roadmap.id
                          ? 'bg-[#EF3E33] text-white shadow-sm'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <p className="font-medium truncate">{roadmap.title}</p>
                      <p className="text-xs opacity-70 mt-0.5">
                        {completed}/{roadmap.steps.length} этапов выполнено
                      </p>
                    </button>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Active roadmap steps */}
        <div className="lg:col-span-2">
          {activeRoadmap ? (
            <Card>
              <CardHeader>
                <CardTitle>{activeRoadmap.title}</CardTitle>
                {activeRoadmap.description && (
                  <CardDescription>{activeRoadmap.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
                  {activeRoadmap.steps
                    .sort((a, b) => a.order - b.order)
                    .map((step) => {
                      const cfg = statusConfig[step.status]
                      const nextStatusMap: Record<RoadmapStep['status'], RoadmapStep['status']> = {
                        pending: 'in_progress',
                        in_progress: 'completed',
                        completed: 'pending',
                      }
                      const next = nextStatusMap[step.status]
                      return (
                        <motion.div
                          key={step.id}
                          variants={item}
                          className={`flex items-start gap-3 rounded-lg border border-border p-4 transition-colors ${
                            step.status === 'completed' ? 'bg-muted/30' : ''
                          }`}
                        >
                          <button
                            onClick={() => handleUpdateStep(step.id, next)}
                            className={`mt-0.5 rounded-lg p-1.5 transition-colors hover:bg-accent ${cfg.color}`}
                            title={`Следующий статус: ${statusConfig[next].label}`}
                          >
                            <cfg.icon className="h-4 w-4" />
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`font-medium text-sm ${step.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                {step.title}
                              </p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                                {cfg.label}
                              </span>
                            </div>
                            {step.description && (
                              <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                            )}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            {(['pending', 'in_progress', 'completed'] as const).map((s) => (
                              <Button
                                key={s}
                                variant={step.status === s ? 'default' : 'ghost'}
                                size="sm"
                                className={`text-xs h-7 ${step.status === s && s === 'completed' ? 'bg-emerald-500 hover:bg-emerald-600' : step.status === s && s === 'in_progress' ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                                onClick={() => handleUpdateStep(step.id, s)}
                              >
                                {statusConfig[s].label}
                              </Button>
                            ))}
                          </div>
                        </motion.div>
                      )
                    })}
                </motion.div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Map className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Выберите дорожную карту или создайте новую</p>
                <Button onClick={() => setShowForm(true)} className="bg-[#EF3E33] hover:bg-[#EF3E33]/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Создать дорожную карту
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
