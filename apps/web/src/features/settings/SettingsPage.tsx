import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Building2, Mail, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { useAuth } from '@/features/auth/useAuth'
import { api } from '@/shared/api/client'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function SettingsPage() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    businessName: user?.businessName || '',
    businessType: user?.businessType || '',
  })
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = async () => {
    try {
      const res = await api.patch('/auth/me', {
        name: form.name,
        businessName: form.businessName,
        businessType: form.businessType,
      })
      updateUser(res.data.data)
    } catch {}
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Настройки</h1>
        <p className="text-muted-foreground">Настройки вашего аккаунта и предпочтения</p>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="max-w-2xl space-y-6">
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-[#EF3E33]" />
                Профиль
              </CardTitle>
              <CardDescription>Основная информация о вас</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Имя</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ваше имя" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> Email</label>
                <Input value={form.email} disabled className="mt-1 opacity-60" />
                <p className="text-xs text-muted-foreground mt-1">Email нельзя изменить</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#EF3E33]" />
                Бизнес
              </CardTitle>
              <CardDescription>Информация о вашем бизнесе</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Название бизнеса</label>
                <Input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} placeholder="Название вашего бизнеса" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Тип бизнеса</label>
                <Input value={form.businessType} onChange={(e) => setForm({ ...form, businessType: e.target.value })} placeholder="SaaS, E-commerce, Fintech..." className="mt-1" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="flex justify-end">
          <Button onClick={handleSave} className="bg-[#EF3E33] hover:bg-[#EF3E33]/90 gap-2">
            {isSaved ? <>Сохранено</> : <><Save className="h-4 w-4" /> Сохранить</>}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
