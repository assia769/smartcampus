import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import LoginPage from './pages/LoginPage'
import WelcomePage from './pages/WelcomePage'
import StockPage from './pages/StockPage'
import SallesPage from './pages/SallesPage'
import SalleDetailPage from './pages/SalleDetailPage'
import ReserverPage from './pages/ReserverPage'
import MesReservationsPage from './pages/MesReservationsPage'
import DemandesAmphiPage from './pages/DemandesAmphiPage'
import UsersPage from './pages/UsersPage'
import { getAuth } from './lib/auth'

function Protected({ children, roles }: { children: ReactNode; roles?: string[] }) {
  const auth = getAuth()
  if (!auth) return <Navigate to="/login" replace />
  if (roles && !roles.includes(auth.role)) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={getAuth() ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/dashboard" element={<Protected><WelcomePage /></Protected>} />
        <Route path="/stock" element={
          <Protected roles={['SUPERVISEUR', 'ADMIN']}><StockPage /></Protected>
        } />
        <Route path="/salles" element={<Protected><SallesPage /></Protected>} />
        <Route path="/salles/:id" element={<Protected><SalleDetailPage /></Protected>} />
        <Route path="/reserver" element={
          <Protected roles={['ETUDIANT', 'ENSEIGNANT', 'ADMIN']}><ReserverPage /></Protected>
        } />
        <Route path="/reservations" element={
          <Protected roles={['ETUDIANT', 'ENSEIGNANT', 'ADMIN']}><MesReservationsPage /></Protected>
        } />
        <Route path="/demandes" element={
          <Protected roles={['ADMIN']}><DemandesAmphiPage /></Protected>
        <Route path="/admin/users" element={
          <Protected roles={['ADMIN']}><UsersPage /></Protected>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </HashRouter>
  )
}