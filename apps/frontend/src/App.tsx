import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { AuthCallback } from '@/pages/AuthCallback'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { CompanyPage } from '@/pages/CompanyPage'
import { CompaniesPage } from '@/pages/CompaniesPage'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-muted-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/" replace /> : <LoginPage />} 
      />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/empresas" replace />} />
        <Route path="empresas" element={<CompaniesPage />} />
        <Route path="empresa/:id" element={<CompanyPage />} />
        <Route path="empresa/:id/:tab" element={<CompanyPage />} />
        <Route path="jobs" element={<div className="p-8 max-w-7xl mx-auto"><h1 className="text-2xl font-bold text-foreground">Jobs</h1><p className="text-muted-foreground mt-2">Browse available positions</p></div>} />
        <Route path="matches" element={<div className="p-8 max-w-7xl mx-auto"><h1 className="text-2xl font-bold text-foreground">Matches</h1><p className="text-muted-foreground mt-2">Your job matches</p></div>} />
        <Route path="calendar" element={<div className="p-8 max-w-7xl mx-auto"><h1 className="text-2xl font-bold text-foreground">Calendar</h1><p className="text-muted-foreground mt-2">Schedule and interviews</p></div>} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="empliq-ui-theme">
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
