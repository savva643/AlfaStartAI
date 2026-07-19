import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  MessageSquare,
  Map,
  Heart,
  CheckSquare,
  TrendingUp,
  BarChart3,
  CreditCard,
  ListTodo,
  FileText,
  Settings,
  Activity,
  Briefcase,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const navigation = [
  { name: 'Главная', href: '/dashboard', icon: LayoutDashboard },
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

export function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="hidden w-[280px] flex-col border-r border-border bg-card lg:flex"
    >
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <img src="/alfa.png" alt="Alfa" className="h-9 w-9 object-contain" />
        <div>
          <span className="text-lg font-bold">Alfa Start</span>
          <span className="text-lg font-light text-muted-foreground">AI</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
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

      <div className="border-t border-border p-4">
        <div className="rounded-xl bg-gradient-to-r from-[#EF3E33]/10 to-[#EF3E33]/5 p-4">
          <p className="text-xs font-medium text-muted-foreground">Разработка</p>
          <p className="text-sm font-bold text-[#EF3E33]">Сваровски</p>
          <p className="text-xs text-muted-foreground mt-1">Версия 1.0</p>
        </div>
      </div>
    </motion.aside>
  )
}
