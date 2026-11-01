import Navbar from '../components/Navbar'
import { getAuth, roleLabels } from '../lib/auth'

export default function WelcomePage() {
  const auth = getAuth()
  const label = auth ? roleLabels[auth.role] ?? auth.role : ''

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <h1 className="text-3xl font-bold text-slate-900">Welcome {label}</h1>
      </main>
    </div>
  )
}