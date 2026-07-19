import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Sparkles, X, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { paymentsApi } from '@/shared/api/endpoints'

interface PaymentRecommendation {
  productId: string
  name: string
  description: string
  reason: string
  relevanceScore: number
  features: string[]
}

function getScoreColor(s: number) { return s >= 80 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444' }
function getScoreLabel(s: number) { return s >= 80 ? 'Отлично подходит' : s >= 50 ? 'Рекомендуется' : 'Можно рассмотреть' }
function getEmoji(id: string) { return { business_account: '🏦', acquiring: '💳', internet_acquiring: '🌐', business_card: '💎', credit: '💰', leasing: '📦' }[id] || '📦' }

function ProductModal({ product, onClose }: { product: PaymentRecommendation; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false)
  const color = getScoreColor(product.relevanceScore)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="h-1.5 w-full rounded-t-2xl" style={{ backgroundColor: color }} />
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getEmoji(product.productId)}</span>
              <div>
                <h2 className="text-xl font-bold">{product.name}</h2>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}15`, color }}>{getScoreLabel(product.relevanceScore)}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-accent"><X className="h-5 w-5" /></button>
          </div>

          <p className="text-sm text-muted-foreground mb-4">{product.description}</p>

          <div className="rounded-lg bg-[#EF3E33]/5 border border-[#EF3E33]/10 p-3 mb-4">
            <p className="text-xs font-medium text-[#EF3E33] mb-1">Почему подходит именно вам:</p>
            <p className="text-sm">{product.reason}</p>
          </div>

          <div className="mb-4">
            <p className="text-xs font-medium mb-2">Преимущества:</p>
            <div className="flex flex-wrap gap-2">
              {product.features.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs">
                  <CheckCircle className="h-3 w-3 text-[#EF3E33]" />{f}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium mb-3">Настройка продукта</p>
            <ProductConfig productId={product.productId} />
          </div>

          <div className="mt-6 flex gap-3">
            {submitted ? (
              <div className="flex-1 text-center py-2 text-sm text-emerald-600 font-medium">Заявка отправлена! Мы свяжемся с вами.</div>
            ) : (
              <>
                <Button variant="outline" onClick={onClose} className="flex-1">Закрыть</Button>
                <Button onClick={() => setSubmitted(true)} className="flex-1 bg-[#EF3E33] hover:bg-[#EF3E33]/90">Подать заявку</Button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ProductConfig({ productId }: { productId: string }) {
  const [volume, setVolume] = useState('1M-5M')
  const [currency, setCurrency] = useState('RUB')
  const [terminal, setTerminal] = useState('mobile')
  const [cardType, setCardType] = useState('visa')
  const [limit, setLimit] = useState('300K')
  const [term, setTerm] = useState('6')
  const [equipment, setEquipment] = useState('computer')
  const [url, setUrl] = useState('')

  const select = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm'
  const label = 'text-xs font-medium text-muted-foreground'

  if (productId === 'business_account') return (
    <div className="space-y-3">
      <div><p className={label}>Объём операций в месяц</p><select className={select} value={volume} onChange={(e) => setVolume(e.target.value)}><option>0 — 1 млн ₽</option><option>1 — 5 млн ₽</option><option>Более 5 млн ₽</option></select></div>
      <div><p className={label}>Валюта</p><select className={select} value={currency} onChange={(e) => setCurrency(e.target.value)}><option>RUB</option><option>USD</option><option>EUR</option></select></div>
    </div>
  )
  if (productId === 'acquiring') return (
    <div className="space-y-3">
      <div><p className={label}>Тип терминала</p><select className={select} value={terminal} onChange={(e) => setTerminal(e.target.value)}><option>Мобильный</option><option>Стационарный</option><option>POS-терминал</option></select></div>
      <div><p className={label}>Транзакций в месяц</p><input type="number" placeholder="100" className={select} /></div>
    </div>
  )
  if (productId === 'internet_acquiring') return (
    <div className="space-y-3">
      <div><p className={label}>URL сайта</p><input type="url" placeholder="https://mysite.ru" className={select} value={url} onChange={(e) => setUrl(e.target.value)} /></div>
      <div><p className={label}>Способы оплаты</p><div className="flex gap-4 mt-1"><label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Карты</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> СБП</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" /> Кошельки</label></div></div>
    </div>
  )
  if (productId === 'business_card') return (
    <div className="space-y-3">
      <div><p className={label}>Тип карты</p><select className={select} value={cardType} onChange={(e) => setCardType(e.target.value)}><option>Visa</option><option>Mastercard</option></select></div>
      <div><p className={label}>Кредитный лимит</p><select className={select} value={limit} onChange={(e) => setLimit(e.target.value)}><option>100 000 ₽</option><option>300 000 ₽</option><option>500 000 ₽</option></select></div>
    </div>
  )
  if (productId === 'credit') return (
    <div className="space-y-3">
      <div><p className={label}>Сумма кредита</p><input type="range" min="100000" max="5000000" step="100000" className="w-full" /></div>
      <div><p className={label}>Цель</p><textarea placeholder="На что нужны средства?" className={select} rows={2} /></div>
      <div><p className={label}>Срок</p><select className={select} value={term} onChange={(e) => setTerm(e.target.value)}><option>3 месяца</option><option>6 месяцев</option><option>12 месяцев</option></select></div>
    </div>
  )
  if (productId === 'leasing') return (
    <div className="space-y-3">
      <div><p className={label}>Тип оборудования</p><select className={select} value={equipment} onChange={(e) => setEquipment(e.target.value)}><option>Компьютеры / ноутбуки</option><option>Офисная техника</option><option>Производственное оборудование</option><option>Транспорт</option></select></div>
      <div><p className={label}>Срок лизинга</p><select className={select} value={term} onChange={(e) => setTerm(e.target.value)}><option>12 месяцев</option><option>24 месяца</option><option>36 месяцев</option></select></div>
    </div>
  )
  return <p className="text-sm text-muted-foreground">Настройки для этого продукта появятся скоро.</p>
}

export function ProductsPage() {
  const [products, setProducts] = useState<PaymentRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState<PaymentRecommendation | null>(null)

  useEffect(() => {
    paymentsApi.recommendations()
      .then((r) => setProducts((r.data.data || []).sort((a: PaymentRecommendation, b: PaymentRecommendation) => b.relevanceScore - a.relevanceScore)))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <div className="p-6 lg:p-8"><div className="space-y-2 mb-8"><div className="h-8 w-48 animate-pulse rounded-lg bg-muted" /><div className="h-4 w-64 animate-pulse rounded bg-muted" /></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((i) => <Card key={i}><CardContent className="p-6"><div className="space-y-3"><div className="h-6 w-40 animate-pulse rounded bg-muted" /><div className="h-4 w-full animate-pulse rounded bg-muted" /></div></CardContent></Card>)}</div></div>

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Продукты</h1>
        <p className="text-muted-foreground">AI подобрал финансовые решения под ваш бизнес. Нажмите, чтобы настроить и подать заявку.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Card className="border-[#EF3E33]/20 bg-gradient-to-r from-[#EF3E33]/5 to-transparent">
          <CardContent className="p-4 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-[#EF3E33] shrink-0" />
            <p className="text-sm text-muted-foreground">Каждая рекомендация основана на AI-анализе вашего бизнеса. Оценка показывает, насколько продукт релевантен.</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }} initial="hidden" animate="show" className="space-y-3">
        {products.map((p) => {
          const c = getScoreColor(p.relevanceScore)
          return (
            <motion.div key={p.productId} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
              <Card className="cursor-pointer hover:shadow-md hover:border-[#EF3E33]/30 transition-all" onClick={() => setSelected(p)}>
                <CardContent className="p-4 flex items-center gap-4">
                  <span className="text-2xl shrink-0">{getEmoji(p.productId)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2"><p className="font-medium truncate">{p.name}</p><span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: `${c}15`, color: c }}>{p.relevanceScore}%</span></div>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">{p.reason}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      <AnimatePresence>
        {selected && <ProductModal product={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  )
}
