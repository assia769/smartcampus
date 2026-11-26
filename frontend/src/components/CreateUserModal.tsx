import { useState } from 'react'
import type { FormEvent } from 'react'
import { X, User, Mail, Lock, Loader2, AlertCircle } from 'lucide-react'
import Field from './Field'
import { api, ApiError } from '../lib/api'
import { roleLabels } from '../lib/auth'

const DOMAIN = '@ensak.ma'
const ROLES = ['ETUDIANT', 'ENSEIGNANT', 'SUPERVISEUR']

interface Props {
  onClose: () => void
  onCreated: (nom: string) => void
}

export default function CreateUserModal({ onClose, onCreated }: Props) {
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [role, setRole] = useState('ETUDIANT')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    const mail = email.trim().toLowerCase()
    if (!mail.endsWith(DOMAIN)) {
      setError(`L'adresse doit se terminer par ${DOMAIN}`)
      return
    }
    if (motDePasse.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setLoading(true)
    try {
      await api('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({ nom: nom.trim(), email: mail, motDePasse, role }),
      })
      onCreated(nom.trim())
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('Cette adresse e-mail est déjà utilisée')
      } else if (err instanceof ApiError && err.status === 400) {
        setError('Données invalides : vérifiez le domaine, le mot de passe et le rôle')
      } else {
        setError(err instanceof Error ? err.message : 'Erreur')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-white/40 bg-white/95 p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 rounded-md p-1 text-slate-400 transition hover:text-bordeaux-600"
        >
          <X size={20} />
        </button>

        <h2 className="font-display text-xl font-bold tracking-wide text-slate-900">
          CRÉER UN COMPTE
        </h2>
        <div className="mt-3 h-0.5 w-14 rounded-full bg-gradient-to-r from-gold via-gold to-transparent" />

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field
            id="new-nom"
            label="Nom complet"
            icon={User}
            placeholder="Prénom Nom"
            required
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />
          <Field
            id="new-email"
            label="Adresse e-mail institutionnelle"
            icon={Mail}
            type="email"
            placeholder={`prenom.nom${DOMAIN}`}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Field
            id="new-password"
            label="Mot de passe initial (8 caractères minimum)"
            icon={Lock}
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            required
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
          />

          <div>
            <label htmlFor="new-role" className="mb-1.5 block text-sm font-medium text-slate-700">
              Rôle
            </label>
            <select
              id="new-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-slate-800 shadow-sm outline-none focus:border-bordeaux-600 focus:ring-4 focus:ring-bordeaux-600/15"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{roleLabels[r]}</option>
              ))}
            </select>
          </div>

          {error && (
            <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-bordeaux-600 to-bordeaux-700 px-4 py-3 font-semibold text-white shadow-lg shadow-bordeaux-600/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Création…</> : 'Créer le compte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}