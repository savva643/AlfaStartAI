import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Clock, CheckCircle, AlertCircle, Circle, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { tasksApi } from '@/shared/api/endpoints'

interface Task {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate: string | null
  createdAt: string
}

const statusConfig: Record<Task['status'], { icon: typeof Circle; color: string; bg: string; label: string }> = {
  todo: { icon: Circle, color: 'text-muted-foreground', bg: 'bg-muted', label: 'К выполнению' },
  in_progress: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'В работе' },
  review: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'На проверке' },
  done: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Выполнено' },
}

const priorityConfig: Record<Task['priority'], string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-blue-500/10 text-blue-600',
  high: 'bg-amber-500/10 text-amber-600',
  urgent: 'bg-[#EF3E33]/10 text-[#EF3E33]',
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

function LoadingSkeleton() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-6 w-24 animate-pulse rounded bg-muted" />
            {[1, 2].map((j) => (
              <div key={j} className="h-24 w-full animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' as Task['priority'] })

  useEffect(() => {
    tasksApi
      .list()
      .then((res) => setTasks(res.data.data || []))
      .catch(() => setError('Не удалось загрузить задачи'))
      .finally(() => setIsLoading(false))
  }, [])

  const handleCreate = async () => {
    if (!form.title.trim()) return
    try {
      const res = await tasksApi.create(form)
      setTasks((prev) => [res.data.data, ...prev])
      setShowForm(false)
      setForm({ title: '', description: '', priority: 'medium' })
    } catch {
      setError('Не удалось создать задачу')
    }
  }

  const handleStatusChange = async (taskId: string, status: Task['status']) => {
    try {
      await tasksApi.update(taskId, { status })
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)))
    } catch {
      setError('Не удалось обновить статус')
    }
  }

  const handleDelete = async (taskId: string) => {
    try {
      await tasksApi.delete(taskId)
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    } catch {
      setError('Не удалось удалить задачу')
    }
  }

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Задачи</h1>
            <p className="text-muted-foreground">Управляйте задачами вашего бизнеса</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-[#EF3E33] hover:bg-[#EF3E33]/90">
            <Plus className="mr-2 h-4 w-4" />
            Новая задача
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Новая задача</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Название задачи"
              />
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Описание (необязательно)"
              />
              <div className="flex gap-2 flex-wrap">
                {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                  <Button
                    key={p}
                    variant={form.priority === p ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setForm({ ...form, priority: p })}
                    className={form.priority === p ? 'bg-[#EF3E33] hover:bg-[#EF3E33]/90' : ''}
                  >
                    {p === 'low' ? 'Низкий' : p === 'medium' ? 'Средний' : p === 'high' ? 'Высокий' : 'Срочный'}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} className="bg-[#EF3E33] hover:bg-[#EF3E33]/90">Создать</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Отмена</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Kanban board */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(statusConfig) as Task['status'][]).map((status) => {
          const cfg = statusConfig[status]
          const Icon = cfg.icon
          const statusTasks = tasks.filter((t) => t.status === status)

          return (
            <div key={status}>
              <div className="flex items-center gap-2 text-sm font-medium mb-3 px-1">
                <Icon className={`h-4 w-4 ${cfg.color}`} />
                {cfg.label}
                <span className="text-muted-foreground">({statusTasks.length})</span>
              </div>
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-2 min-h-[200px]">
                {statusTasks.map((task) => (
                  <motion.div key={task.id} variants={item}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="font-medium text-sm leading-tight">{task.title}</p>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="shrink-0 text-muted-foreground hover:text-[#EF3E33] transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
                        )}
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${priorityConfig[task.priority]}`}>
                            {task.priority}
                          </span>
                          <div className="flex gap-1">
                            {(Object.keys(statusConfig) as Task['status'][])
                              .filter((s) => s !== status)
                              .map((s) => (
                                <Button
                                  key={s}
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleStatusChange(task.id, s)}
                                  title={statusConfig[s].label}
                                >
                                  {(() => {
                                    const SIcon = statusConfig[s].icon
                                    return <SIcon className={`h-3 w-3 ${statusConfig[s].color}`} />
                                  })()}
                                </Button>
                              ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                {statusTasks.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border p-4 text-center">
                    <p className="text-xs text-muted-foreground">Нет задач</p>
                  </div>
                )}
              </motion.div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
