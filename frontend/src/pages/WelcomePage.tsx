import Navbar from '../components/Navbar'
import { getAuth, roleLabels } from '../lib/auth'

export default function WelcomePage() {
  const auth = getAuth()
  const label = auth ? roleLabels[auth.role] ?? auth.role : ''

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6">
  <h1 className="text-3xl font-bold text-slate-900">Welcome {label}</h1>
  {auth?.role === 'ADMIN' && (
    <a
      href="#/admin/users"
      className="rounded-xl bg-gradient-to-r from-bordeaux-600 to-bordeaux-700 px-6 py-3 font-semibold text-white shadow-lg shadow-bordeaux-600/30 transition hover:-translate-y-0.5"
    >
      Gestion des utilisateurs
    </a>
  )}
</main>
    </div>
  )
}