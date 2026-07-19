import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Building2, ArrowRight } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card'
import { AlfaLogo } from '@/shared/ui/AlfaLogo'
import { useAuth } from './useAuth'

export function RegisterPage() {
  const { isAuthenticated, register, isRegistering, registerError } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    businessType: '',
  })

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    register(form)
  }

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center"
          >
            <AlfaLogo size={48} />
          </motion.div>
          <h1 className="text-2xl font-bold">Alfa Start AI</h1>
          <p className="mt-1 text-muted-foreground">Начните свой путь с AI</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Регистрация</CardTitle>
            <CardDescription>Создайте аккаунт предпринимателя</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="name">
                  Имя
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Ваше имя"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="password">
                  Пароль
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Минимум 6 символов"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    className="pl-9"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="businessName">
                  Название бизнеса <span className="text-muted-foreground">(необязательно)</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="businessName"
                    placeholder="Название вашего проекта"
                    value={form.businessName}
                    onChange={(e) => updateField('businessName', e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {registerError && (
                <p className="text-sm text-destructive">
                  {(registerError as any).response?.data?.error || 'Ошибка регистрации'}
                </p>
              )}

              <Button type="submit" className="w-full bg-[#EF3E33] hover:bg-[#EF3E33]/90" disabled={isRegistering}>
                {isRegistering ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <>
                    Создать аккаунт
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Уже есть аккаунт?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Войти
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
