import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trash2, ArrowLeft, Clock, Copy, Check } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Card, CardContent } from '@/shared/ui/Card'
import { documentsApi } from '@/shared/api/endpoints'
import { renderMarkdown } from '@/shared/lib/markdown'

interface Document {
  id: string
  title: string
  type: string
  content: string
  format: string
  createdAt: string
}

type DocumentType = 'business_plan' | 'pitch_deck' | 'marketing_plan' | 'financial_model' | 'competitive_analysis' | 'investor_letter' | 'user_research' | 'risk_assessment' | 'go_to_market' | 'unit_economics' | 'technical_spec'

const documentTypes: { value: DocumentType; label: string; description: string; icon: string }[] = [
  { value: 'business_plan', label: 'Бизнес-план', description: 'Полный план: рынок, продукт, финансы, команда, roadmap', icon: '📊' },
  { value: 'pitch_deck', label: 'Питч-дек', description: 'Презентация из 12 слайдов для инвесторов', icon: '🎯' },
  { value: 'marketing_plan', label: 'Маркетинг', description: 'Стратегия продвижения: каналы, бюджет, KPI', icon: '📣' },
  { value: 'financial_model', label: 'Финансовая модель', description: 'Прогноз на 12 месяцев: выручка, расходы, юнит-экономика', icon: '💰' },
  { value: 'competitive_analysis', label: 'Конкуренты', description: 'Анализ 5-7 конкурентов: сильные/слабые стороны', icon: '🔍' },
  { value: 'investor_letter', label: 'Письмо инвестору', description: 'Персонализированное письмо для привлечения инвестиций', icon: '✉️' },
  { value: 'user_research', label: 'Исследование', description: 'План исследований: интервью, анкеты, A/B тесты', icon: '🔬' },
  { value: 'risk_assessment', label: 'Оценка рисков', description: '10-15 рисков с оценкой вероятности и митигации', icon: '⚠️' },
  { value: 'go_to_market', label: 'Go-to-Market', description: 'Стратегия запуска: этапы, каналы, метрики', icon: '🚀' },
  { value: 'unit_economics', label: 'Юнит-экономика', description: 'CAC, LTV, LTV/CAC, Payback, MRR, ARR', icon: '📈' },
  { value: 'technical_spec', label: 'Техническое задание', description: 'Архитектура, технологии, API, безопасность', icon: '⚙️' },
]

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

function getPreview(content: string, maxLen = 120): string {
  const text = content.replace(/[#*|`\n]/g, ' ').replace(/\s+/g, ' ').trim()
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text
}

function getTypeIcon(type: string): string {
  const map: Record<string, string> = {
    business_plan: '📊', pitch_deck: '🎯', marketing_plan: '📣', financial_model: '💰',
  }
  return map[type] || '📄'
}

function getTypeLabel(type: string): string {
  const map: Record<string, string> = {
    business_plan: 'Бизнес-план', pitch_deck: 'Питч-дек', marketing_plan: 'Маркетинг', financial_model: 'Фин. модель',
  }
  return map[type] || type
}

export function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingType, setGeneratingType] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    documentsApi
      .list()
      .then((res) => setDocuments(res.data.data || []))
      .catch(() => setError('Не удалось загрузить документы'))
      .finally(() => setIsLoading(false))
  }, [])

  const handleGenerate = async (type: DocumentType) => {
    setIsGenerating(true)
    setGeneratingType(type)
    setError(null)
    try {
      const res = await documentsApi.generate({ type })
      const newDoc = res.data.data
      setDocuments((prev) => [newDoc, ...prev])
      setSelectedDoc(newDoc)
    } catch {
      setError('Не удалось сгенерировать документ')
    } finally {
      setIsGenerating(false)
      setGeneratingType(null)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await documentsApi.delete(id)
      setDocuments((prev) => prev.filter((d) => d.id !== id))
      if (selectedDoc?.id === id) setSelectedDoc(null)
    } catch {
      setError('Не удалось удалить документ')
    }
  }

  const handleCopy = () => {
    if (!selectedDoc) return
    navigator.clipboard.writeText(selectedDoc.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Loading
  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8 space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="p-6"><div className="space-y-3">
              <div className="h-6 w-40 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
            </div></CardContent></Card>
          ))}
        </div>
      </div>
    )
  }

  // Detail view
  if (selectedDoc) {
    return (
      <div className="p-6 lg:p-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Button variant="ghost" onClick={() => setSelectedDoc(null)} className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" /> Назад к списку
          </Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getTypeIcon(selectedDoc.type)}</span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{selectedDoc.title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(selectedDoc.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{getTypeLabel(selectedDoc.type)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Скопировано' : 'Копировать'}
              </Button>
              <Button variant="outline" size="sm" className="text-[#EF3E33] border-[#EF3E33]/30 hover:bg-[#EF3E33]/5" onClick={() => handleDelete(selectedDoc.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        <Card>
          <CardContent className="p-8">
            <div
              className="prose prose-sm max-w-none prose-p:mb-2 prose-headings:mt-6 prose-headings:mb-3 prose-headings:tracking-tight prose-li:ml-4 prose-table:text-sm prose-th:text-left prose-th:font-semibold prose-td:p-2 prose-tr:border-b prose-thead:border-b-2"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedDoc.content) }}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main view
  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Документы</h1>
        <p className="text-muted-foreground">Генерация бизнес-планов, питч-деков и других документов с помощью AI</p>
      </motion.div>

      {error && (
        <div className="mb-6 rounded-lg border border-[#EF3E33]/20 bg-[#EF3E33]/5 p-4 text-sm text-[#EF3E33]">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Закрыть</button>
        </div>
      )}

      {/* Generation cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {documentTypes.map((dt) => (
          <motion.div key={dt.value} variants={item}>
            <Card
              className={cn(
                'group cursor-pointer transition-all hover:shadow-md hover:border-[#EF3E33]/30',
                isGenerating && generatingType === dt.value && 'border-[#EF3E33] shadow-md',
              )}
              onClick={() => !isGenerating && handleGenerate(dt.value)}
            >
              <CardContent className="p-5">
                <div className="text-3xl mb-3">{dt.icon}</div>
                <p className="font-medium text-sm mb-1">{dt.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{dt.description}</p>
                {isGenerating && generatingType === dt.value && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-[#EF3E33]">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#EF3E33] border-t-transparent" />
                    Генерация...
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Documents list */}
      {documents.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mb-4">Сгенерированные документы ({documents.length})</h2>
          <motion.div variants={container} initial="hidden" animate="show" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <motion.div key={doc.id} variants={item}>
                <Card
                  className="group cursor-pointer transition-all hover:shadow-md hover:border-[#EF3E33]/30"
                  onClick={() => setSelectedDoc(doc)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getTypeIcon(doc.type)}</span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">{getTypeLabel(doc.type)}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(doc.id) }}
                        className="text-muted-foreground hover:text-[#EF3E33] transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="font-medium text-sm mb-1">{doc.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{getPreview(doc.content)}</p>
                    <div className="flex items-center gap-1 mt-3 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(doc.createdAt).toLocaleDateString('ru-RU')}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
