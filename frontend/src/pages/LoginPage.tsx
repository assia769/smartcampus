import { useState } from 'react'
import type { FormEvent } from 'react'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { User, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import bg from '../assets/bg.png'
import logo from '../assets/logo.png'
import Field from '../components/Field'
import Testimonials from '../components/Testimonials'

const container: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.09, delayChildren: 0.25 },
  },
}
const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const links = [
  { label: 'Mot de passe oublié ?', href: '#/forgot-password' },
  { label: 'Créer un compte', href: '#/register' },
  { label: 'Aide et support', href: '#/support' },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) throw new Error('Identifiants incorrects')
      const data = await res.json()
      localStorage.setItem('token', data.token) // à adapter selon ton backend
      // TODO : rediriger vers le tableau de bord
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="relative flex min-h-screen flex-col bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-bordeaux-900/60 via-black/50 to-black/80" />

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="w-full max-w-md rounded-3xl border border-white/40 bg-white/85 p-8 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-10"
        >
          <motion.div variants={item} className="flex justify-center">
            <img src={logo} alt="Logo Smart Campus" className="h-auto w-32 drop-shadow-md" />
          </motion.div>

          <motion.div variants={item} className="mt-6 text-center">
            <h1 className="font-display text-xl font-bold tracking-wide text-slate-900 sm:text-2xl">
              CONNEXION ÉTUDIANT &amp; PERSONNEL
            </h1>
            <div className="mx-auto mt-3 h-0.5 w-14 rounded-full bg-gradient-to-r from-transparent via-gold to-transparent" />
          </motion.div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <motion.div variants={item}>
              <Field
                id="email"
                label="Identifiant (Adresse e-mail institutionnelle)"
                icon={User}
                type="email"
                placeholder="prenom.nom@ensak.ma"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </motion.div>

            <motion.div variants={item}>
              <Field
                id="password"
                label="Mot de passe"
                icon={Lock}
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                minLength={8}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700"
              >
                <AlertCircle size={16} /> {error}
              </motion.div>
            )}

            <motion.div variants={item}>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-bordeaux-600 to-bordeaux-700 px-6 py-3.5 font-semibold text-white shadow-lg shadow-bordeaux-600/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-bordeaux-600/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-bordeaux-600/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-white/25 opacity-0 group-hover:opacity-100 group-hover:[animation:shine_0.9s_ease]" />
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Connexion…</>
                ) : (
                  <>Se Connecter <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" /></>
                )}
              </button>
            </motion.div>
          </form>

          <motion.nav
            variants={item}
            className="mt-7 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm"
          >
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="relative font-medium text-slate-600 transition-colors duration-300 after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-bordeaux-600 after:transition-all after:duration-300 hover:text-bordeaux-600 hover:after:w-full"
              >
                {l.label}
              </a>
            ))}
          </motion.nav>
        </motion.div>
      </main>

      <div className="relative z-10">
        <Testimonials />
        <p className="pb-6 text-center text-xs text-white/50">
          © 2026 Smart Campus · ENSA Khouribga
        </p>
      </div>
    </div>
  )
}