import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/shared/api/client'
import { useAuthStore } from './authStore'

export function useAuth() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, login, logout, updateUser } = useAuthStore()

  const registerMutation = useMutation({
    mutationFn: async (data: {
      email: string
      password: string
      name: string
      businessName?: string
      businessType?: string
    }) => {
      const response = await api.post('/auth/register', data)
      return response.data.data
    },
    onSuccess: (data) => {
      login(data.user, data.accessToken, data.refreshToken)
      navigate('/onboarding')
    },
  })

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await api.post('/auth/login', data)
      return response.data.data
    },
    onSuccess: (data) => {
      login(data.user, data.accessToken, data.refreshToken)
      navigate('/dashboard')
    },
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    register: registerMutation.mutate,
    login: loginMutation.mutate,
    logout: handleLogout,
    updateUser,
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    registerError: registerMutation.error,
    loginError: loginMutation.error,
  }
}
