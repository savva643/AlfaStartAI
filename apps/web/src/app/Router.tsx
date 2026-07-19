import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { Layout } from '@/shared/ui/Layout'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { ChatPage } from '@/features/chat/ChatPage'
import { HealthPage } from '@/features/health/HealthPage'
import { RoadmapPage } from '@/features/roadmap/RoadmapPage'
import { ChecklistPage } from '@/features/checklist/ChecklistPage'
import { FinancialPage } from '@/features/financial/FinancialPage'
import { SwotPage } from '@/features/swot/SwotPage'
import { ProductsPage } from '@/features/products/ProductsPage'
import { TasksPage } from '@/features/tasks/TasksPage'
import { DocumentsPage } from '@/features/documents/DocumentsPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { AnalyticsPage } from '@/features/analytics/AnalyticsPage'
import { BusinessPage } from '@/features/business/BusinessPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#EF3E33] border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export function Router() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="business" element={<BusinessPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="roadmap" element={<RoadmapPage />} />
        <Route path="health" element={<HealthPage />} />
        <Route path="checklist" element={<ChecklistPage />} />
        <Route path="financial" element={<FinancialPage />} />
        <Route path="swot" element={<SwotPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
