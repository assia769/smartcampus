import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import LoginPage from './pages/LoginPage'
import WelcomePage from './pages/WelcomePage'
import { getAuth } from './lib/auth'
import UsersPage from './pages/UsersPage'

function Protected({ children }: { children: ReactNode }) {
  return getAuth() ? <>{children}</> : <Navigate to="/login" replace />
}

function AdminOnly({ children }: { children: ReactNode }) {
  const auth = getAuth()
  if (!auth) return <Navigate to="/login" replace />
  return auth.role === 'ADMIN' ? <>{children}</> : <Navigate to="/dashboard" replace />
}
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={getAuth() ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/dashboard" element={<Protected><WelcomePage /></Protected>} />
        <Route path="/admin/users" element={<AdminOnly><UsersPage /></AdminOnly>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </HashRouter>
  )
}