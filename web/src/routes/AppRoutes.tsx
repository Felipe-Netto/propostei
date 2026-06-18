import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/auth/ProtectedRoute'
import { PublicOnlyRoute } from '@/auth/PublicOnlyRoute'
import { AppLayout } from '@/layouts/AppLayout'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ClientsPage } from '@/pages/ClientsPage'
import { ClientDetailPage } from '@/pages/ClientDetailPage'
import { QuotesPage } from '@/pages/QuotesPage'
import { QuoteDetailPage } from '@/pages/QuoteDetailPage'
import { CreateQuotePage } from '@/pages/CreateQuotePage'
import { EditQuotePage } from '@/pages/EditQuotePage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />

      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/home" element={<HomePage />} />
        <Route path="/clientes" element={<ClientsPage />} />
        <Route path="/clientes/:clientId" element={<ClientDetailPage />} />
        <Route path="/propostas" element={<QuotesPage />} />
        <Route path="/propostas/nova" element={<CreateQuotePage />} />
        <Route path="/propostas/:quoteId" element={<QuoteDetailPage />} />
        <Route path="/propostas/:quoteId/editar" element={<EditQuotePage />} />
      </Route>
    </Routes>
  )
}
