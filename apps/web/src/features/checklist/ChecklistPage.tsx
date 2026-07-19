import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckSquare, Plus, Sparkles, Check } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { checklistApi } from '@/shared/api/endpoints'

interface ChecklistItem {
  id: string
  checklistId: string
  title: string
  description: string | null
  completed: boolean
  category: string
  order: number
}

interface Checklist {
  id: string
  title: string
  items: ChecklistItem[]
  createdAt: string
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const item = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
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
              {[1, 2].map((i) => (
                <div key={i} className="h-14 w-full animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export function ChecklistPage() {
  const [checklists, setChecklists] = useState<Checklist[]>([])
  const [activeChecklist, setActiveChecklist] = useState<Checklist | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ businessType: '', stage: '' })

  useEffect(() => {
    checklistApi
      .list()
      .then((res) => {
        const data = res.data.data || []
        setChecklists(data)
        if (data.length > 0) setActiveChecklist(data[0])
      })
      .catch(() => setError('Не удалось загрузить чек-листы'))
      .finally(() => setIsLoading(false))
  }, [])

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const res = await checklistApi.generate()
      const newChecklist = res.data.data
      setChecklists((prev) => [newChecklist, ...prev])
      setActiveChecklist(newChecklist)
      setShowForm(false)
      setForm({ businessType: '', stage: '' })
    } catch {
      setError('Не удалось сгенерировать чек-лист')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleToggleItem = async (itemId: string, completed: boolean) => {
    try {
      await checklistApi.toggleItem(itemId, !completed)
      const update = (cl: Checklist) => ({
        ...cl,
        items: cl.items.map((i) => (i.id === itemId ? { ...i, completed: !completed } : i)),
      })
      if (activeChecklist) setActiveChecklist(update(activeChecklist))
      setChecklists((prev) => prev.map((cl) => (cl.id === activeChecklist?.id ? update(cl) : cl)))
    } catch {
      setError('Не удалось обновить элемент')
    }
  }

  if (isLoading) return <LoadingSkeleton />

  const items = activeChecklist?.items || []
  const grouped = items.reduce<Record<string, ChecklistItem[]>>((acc, item) => {
    const cat = item.category || 'Общее'
    ;(acc[cat] ??= []).push(item)
    return acc
  }, {})
  const completedCount = items.filter((i) => i.completed).length
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Чек-лист</h1>
            <p className="text-muted-foreground">Пошаговый план запуска бизнеса</p>
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
                Генерация чек-листа
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Тип бизнеса</label>
                  <Input value={form.businessType} onChange={(e) => setForm({ ...form, businessType: e.target.value })} placeholder="SaaS, E-commerce..." className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Стадия</label>
                  <Input value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} placeholder="Idea, MVP..." className="mt-1" />
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
        {/* List sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Мои чек-листы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {checklists.length === 0 ? (
                <div className="flex flex-col items-center py-8">
                  <CheckSquare className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground text-center">Нет чек-листов</p>
                  <Button onClick={() => setShowForm(true)} size="sm" className="mt-3 bg-[#EF3E33] hover:bg-[#EF3E33]/90">
                    Создать первый
                  </Button>
                </div>
              ) : (
                checklists.map((cl) => {
                  const done = cl.items.filter((i) => i.completed).length
                  return (
                    <button
                      key={cl.id}
                      onClick={() => { setActiveChecklist(cl); setError(null) }}
                      className={`w-full rounded-lg p-3 text-left text-sm transition-all ${
                        activeChecklist?.id === cl.id
                          ? 'bg-[#EF3E33] text-white shadow-sm'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <p className="font-medium truncate">{cl.title}</p>
                      <p className="text-xs opacity-70 mt-0.5">{done}/{cl.items.length} выполнено</p>
                    </button>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Active checklist */}
        <div className="lg:col-span-2">
          {activeChecklist ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{activeChecklist.title}</CardTitle>
                  <span className="text-sm text-muted-foreground">{completedCount}/{items.length} ({Math.round(progress)}%)</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
                  <motion.div
                    className="h-full bg-[#EF3E33] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {Object.keys(grouped).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(grouped).map(([category, catItems]) => (
                      <div key={category}>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">{category}</h3>
                        <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
                          {catItems.sort((a, b) => a.order - b.order).map((ci) => (
                            <motion.div
                              key={ci.id}
                              variants={item}
                              className={`flex items-center gap-3 rounded-lg border p-3 transition-all cursor-pointer ${
                                ci.completed ? 'bg-muted/50 border-muted' : 'hover:bg-accent/50'
                              }`}
                              onClick={() => handleToggleItem(ci.id, ci.completed)}
                            >
                              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                                ci.completed ? 'bg-[#EF3E33] border-[#EF3E33]' : 'border-muted-foreground/30'
                              }`}>
                                {ci.completed && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${ci.completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {ci.title}
                                </p>
                                {ci.description && (
                                  <p className="text-xs text-muted-foreground mt-0.5">{ci.description}</p>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Нет элементов</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Выберите чек-лист или создайте новый</p>
                <Button onClick={() => setShowForm(true)} className="bg-[#EF3E33] hover:bg-[#EF3E33]/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Создать чек-лист
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
