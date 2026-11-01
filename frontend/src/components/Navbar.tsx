import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import logo from '../assets/logo.png'
import { clearAuth, getAuth, roleLabels } from '../lib/auth'

// Liens par rôle : ajoute les tiens plus tard
const menus: Record<string, { label: string; to: string }[]> = {
  ADMIN: [{ label: 'Accueil', to: '/dashboard' }],
  ENSEIGNANT: [{ label: 'Accueil', to: '/dashboard' }],
  ETUDIANT: [{ label: 'Accueil', to: '/dashboard' }],
  SUPERVISEUR: [{ label: 'Accueil', to: '/dashboard' }],
}

export default function Navbar() {
  const auth = getAuth()
  const navigate = useNavigate()
  if (!auth) return null

  const logout = () => {
    clearAuth()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <img src={logo} alt="Smart Campus" className="h-9 w-auto" />
          <ul className="flex items-center gap-4">
            {(menus[auth.role] ?? []).map((m) => (
              <li key={m.to}>
                <NavLink
                  to={m.to}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${
                      isActive ? 'text-bordeaux-600' : 'text-slate-600 hover:text-bordeaux-600'
                    }`
                  }
                >
                  {m.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-900">{auth.nom}</p>
            <p className="text-xs text-slate-500">{roleLabels[auth.role] ?? auth.role}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-lg bg-bordeaux-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-bordeaux-700"
          >
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </nav>
    </header>
  )
}