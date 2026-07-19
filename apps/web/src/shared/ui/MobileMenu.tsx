import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, MessageSquare, Map, Heart, CheckSquare, TrendingUp,
  BarChart3, CreditCard, ListTodo, FileText, Settings, Activity, Briefcase, X,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'О бизнесе', href: '/business', icon: Briefcase },
  { name: 'AI Чат', href: '/chat', icon: MessageSquare },
  { name: 'Дорожная карта', href: '/roadmap', icon: Map },
  { name: 'Здоровье', href: '/health', icon: Heart },
  { name: 'Чек-лист', href: '/checklist', icon: CheckSquare },
  { name: 'Финансы', href: '/financial', icon: TrendingUp },
  { name: 'SWOT', href: '/swot', icon: BarChart3 },
  { name: 'Аналитика', href: '/analytics', icon: Activity },
  { name: 'Продукты', href: '/products', icon: CreditCard },
  { name: 'Задачи', href: '/tasks', icon: ListTodo },
  { name: 'Документы', href: '/documents', icon: FileText },
  { name: 'Настройки', href: '/settings', icon: Settings },
]

interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col bg-card border-r border-border shadow-xl lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EF3E33]">
                  <span className="text-white text-sm font-bold">A</span>
                </div>
                <span className="font-semibold">Alfa Start</span>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-accent">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <div className="space-y-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                        isActive
                          ? 'bg-[#EF3E33] text-white shadow-sm'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                      )
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
