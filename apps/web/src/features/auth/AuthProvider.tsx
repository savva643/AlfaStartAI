import { useEffect } from 'react'
import { api } from '@/shared/api/client'
import { useAuthStore } from './authStore'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, logout } = useAuthStore()

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      setLoading(false)
      return
    }

    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.data)
      })
      .catch(() => {
        logout()
      })
      .finally(() => {
        setLoading(false)
      })
  }, [setUser, setLoading, logout])

  return <>{children}</>
}
