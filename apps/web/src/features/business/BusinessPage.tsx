import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, Loader2, Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { useAuth } from '@/features/auth/useAuth'
import { renderMarkdown } from '@/shared/lib/markdown'
import { api } from '@/shared/api/client'

export function BusinessPage() {
  const { user } = useAuth()
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeMarket = async () => {
    setIsAnalyzing(true)
    try {
      const res = await api.post('/chat', {
        message: 'Проанализируй рынок и предложи 3 бизнес-направления которые могут быть успешными для молодого предпринимателя в России в 2025 году. Для каждого направления опиши: название, почему перспективно, минимальный бюджет для старта, основные риски. Формат: Markdown.',
      })
      setAiSuggestion(res.data.data.content)
    } catch {
      setAiSuggestion('Не удалось получить рекомендации. Попробуйте позже.')
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">О бизнесе</h1>
        <p className="text-muted-foreground">Управляйте проектами и получайте AI-рекомендации по направлениям</p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Business Profile */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#EF3E33]" />
                Профиль бизнеса
              </CardTitle>
              <CardDescription>Текущая информация о вашем проекте</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm text-muted-foreground">Название</span>
                  <span className="text-sm font-medium">{user?.businessName || 'Не указано'}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm text-muted-foreground">Тип бизнеса</span>
                  <span className="text-sm font-medium">{user?.businessType || 'Не указан'}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="text-sm font-medium">{user?.email}</span>
                </div>
              </div>
              <Button asChild variant="outline" className="w-full">
                <a href="/settings">Редактировать профиль</a>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Market Suggestions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#EF3E33]" />
                AI-рекомендации по рынку
              </CardTitle>
              <CardDescription>Что можно запустить, учитывая текущий рынок</CardDescription>
            </CardHeader>
            <CardContent>
              {aiSuggestion ? (
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(aiSuggestion) }} />
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">AI проанализирует рынок и предложит перспективные направления</p>
                  <Button onClick={analyzeMarket} disabled={isAnalyzing} className="bg-[#EF3E33] hover:bg-[#EF3E33]/90">
                    {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    {isAnalyzing ? 'Анализирую...' : 'Получить рекомендации'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
