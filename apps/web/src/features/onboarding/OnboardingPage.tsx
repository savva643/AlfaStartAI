import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Rocket, Check } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { useAuth } from '@/features/auth/useAuth'

const steps = [
  { id: 'welcome', title: 'Давайте приступим!', subtitle: 'Настроим ваш бизнес за 3 шага' },
  { id: 'name', title: 'Как называется проект?', subtitle: 'Введите название вашего бизнеса' },
  { id: 'type', title: 'Чем занимаетесь?', subtitle: 'Выберите тип и опишите направление' },
  { id: 'stage', title: 'Где вы сейчас?', subtitle: 'Этап развития вашего бизнеса' },
]

const businessTypes = [
  'E-commerce', 'SaaS', 'Маркетинг', 'Образование', 'Финтех',
  'Здоровье', 'EdTech', 'FoodTech', 'AI/ML', 'Другое',
]

const stages = [
  { id: 'idea', label: 'Идея', desc: 'Пока есть только идея' },
  { id: 'mvp', label: 'MVP', desc: 'Разрабатываем прототип' },
  { id: 'launch', label: 'Запуск', desc: 'Готовы к запуску' },
  { id: 'growth', label: 'Рост', desc: 'Уже работаем и растём' },
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const { updateUser } = useAuth()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [form, setForm] = useState({
    businessName: '',
    businessType: '',
    businessDirection: '',
    stage: '',
  })
  const [isFinishing, setIsFinishing] = useState(false)

  const canNext = () => {
    if (step === 0) return true
    if (step === 1) return form.businessName.trim().length > 0
    if (step === 2) return form.businessType.length > 0
    if (step === 3) return form.stage.length > 0
    return false
  }

  const next = () => {
    if (step < steps.length - 1) {
      setDirection(1)
      setStep(step + 1)
    } else {
      finish()
    }
  }

  const prev = () => {
    if (step > 0) {
      setDirection(-1)
      setStep(step - 1)
    }
  }

  const finish = async () => {
    setIsFinishing(true)
    try {
      const data: Record<string, string> = {
        businessName: form.businessName,
        businessType: form.businessType,
        stage: form.stage,
      }
      await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(data),
      })
      updateUser(data)
    } catch {}
    setTimeout(() => navigate('/dashboard'), 800)
  }

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -200 : 200, opacity: 0 }),
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="px-6 pt-6">
        <div className="flex gap-2 max-w-md mx-auto">
          {steps.map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full bg-[#EF3E33] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: i <= step ? '100%' : '0%' }}
                transition={{ duration: 0.4 }}
              />
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">Шаг {step + 1} из {steps.length}</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold tracking-tight">{steps[step]?.title}</h1>
                <p className="text-muted-foreground mt-2">{steps[step]?.subtitle}</p>
              </div>

              {step === 0 && (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-[#EF3E33]/10 flex items-center justify-center">
                    <Rocket className="h-10 w-10 text-[#EF3E33]" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-muted-foreground">Мы поможем вам превратить идею в работающий бизнес с помощью AI.</p>
                    <p className="text-sm text-muted-foreground">Ответьте на 3 вопроса — и получите персональные рекомендации.</p>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <Input
                    placeholder="Например: EcoDelivery"
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                    className="text-center text-lg"
                    autoFocus
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {businessTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setForm({ ...form, businessType: type })}
                        className={`rounded-xl border-2 p-3 text-center transition-all ${
                          form.businessType === type
                            ? 'border-[#EF3E33] bg-[#EF3E33]/5 shadow-sm'
                            : 'border-border hover:border-[#EF3E33]/30'
                        }`}
                      >
                        <span className="text-sm font-medium">{type}</span>
                        {form.businessType === type && (
                          <Check className="h-4 w-4 text-[#EF3E33] mx-auto mt-1" />
                        )}
                      </button>
                    ))}
                  </div>
                  <Input
                    placeholder="Опишите направление (доставка еды, образование...)"
                    value={form.businessDirection}
                    onChange={(e) => setForm({ ...form, businessDirection: e.target.value })}
                    className="text-center"
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  {stages.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setForm({ ...form, stage: s.id })}
                      className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                        form.stage === s.id
                          ? 'border-[#EF3E33] bg-[#EF3E33]/5'
                          : 'border-border hover:border-[#EF3E33]/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{s.label}</span>
                        {form.stage === s.id && <Check className="h-4 w-4 text-[#EF3E33] ml-auto" />}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="px-6 pb-8">
        <div className="flex gap-3 max-w-md mx-auto">
          {step > 0 && (
            <Button variant="outline" onClick={prev} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" /> Назад
            </Button>
          )}
          <Button
            onClick={next}
            disabled={!canNext() || isFinishing}
            className="flex-1 bg-[#EF3E33] hover:bg-[#EF3E33]/90"
          >
            {isFinishing ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
            ) : step === steps.length - 1 ? (
              <>Начать <Rocket className="h-4 w-4 ml-2" /></>
            ) : (
              <>Далее <ArrowRight className="h-4 w-4 ml-2" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
