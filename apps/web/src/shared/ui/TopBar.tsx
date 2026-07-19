import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/features/auth/useAuth'
import { LogOut, User, Settings, Building2, ChevronDown, Menu } from 'lucide-react'

interface TopBarProps {
  onMenuToggle?: () => void
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-accent transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-accent"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EF3E33]/10">
            <User className="h-4 w-4 text-[#EF3E33]" />
          </div>
          <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-card shadow-lg z-50 overflow-hidden"
            >
              <div className="border-b border-border p-4">
                <p className="font-medium text-sm">{user?.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
                {user?.businessName && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    {user.businessName}
                  </div>
                )}
              </div>

              <div className="p-1.5">
                <button
                  onClick={() => { navigate('/settings'); setIsOpen(false) }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  Настройки
                </button>
                <button
                  onClick={() => { logout(); setIsOpen(false) }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#EF3E33] transition-colors hover:bg-[#EF3E33]/5"
                >
                  <LogOut className="h-4 w-4" />
                  Выйти
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
