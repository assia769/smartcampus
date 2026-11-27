import { useState } from 'react'
import type { FormEvent } from 'react'
import { X, User, Phone, Loader2, AlertCircle } from 'lucide-react'
import Field from './Field'
import { api } from '../lib/api'

interface Props {
  user: { id: number; nom: string; email: string; telephone: string | null }
  onClose: () => void
  onSaved: (nom: string) => void
}

export default function EditUserModal({ user, onClose, onSaved }: Props) {
  const [nom, setNom] = useState(user.nom)
  const [telephone, setTelephone] = useState(user.telephone ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!nom.trim()) {
      setError('Le nom est obligatoire')
      return
    }
    setLoading(true)
    try {
      await api(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({ nom: nom.trim(), telephone: telephone.trim() }),
      })
      onSaved(nom.trim())

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
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
          MODIFIER LE COMPTE
        </h2>
        <div className="mt-3 h-0.5 w-14 rounded-full bg-gradient-to-r from-gold via-gold to-transparent" />
        <p className="mt-3 text-sm text-slate-500">{user.email}</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <Field

            id="edit-nom"
            label="Nom complet"
            icon={User}
            required
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />
          <Field
            id="edit-tel"
            label="Téléphone"
            icon={Phone}
            type="tel"
            placeholder="0600000000"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
          />

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
              {loading ? <><Loader2 size={18} className="animate-spin" /> Enregistrement…</> : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}