import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getAuth, roleLabels } from '../lib/auth'

export default function WelcomePage() {
  const auth = getAuth()
  const label = auth ? roleLabels[auth.role] ?? auth.role : ''
  const peutGererStock = auth?.role === 'SUPERVISEUR' || auth?.role === 'ADMIN'

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-bold text-slate-900">Welcome {label}</h1>

        {peutGererStock && (
          <Link
            to="/stock"
            className="rounded-xl bg-bordeaux-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-bordeaux-700"
          >
            Gérer le stock
          </Link>
        )}
      </main>
    </div>
  )
} 