import { useEffect, useState } from 'react'
import { Search, Loader2, AlertCircle, UserPlus, CheckCircle2, Pencil } from 'lucide-react'
import CreateUserModal from '../components/CreateUserModal'
import EditUserModal from '../components/EditUserModal'
import Navbar from '../components/Navbar'
import { getAuth, roleLabels } from '../lib/auth'
import { api } from '../lib/api'

interface AdminUser {
  id: number
  nom: string
  email: string
  telephone: string | null
  role: string
  actif: boolean
}

const EDITABLE_ROLES = ['ETUDIANT', 'ENSEIGNANT', 'SUPERVISEUR']

export default function UsersPage() {
  const me = getAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [notice, setNotice] = useState('')
  const [editing, setEditing] = useState<AdminUser | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const term = q.trim()

        const path = term ? `/api/admin/users?q=${encodeURIComponent(term)}` : '/api/admin/users'
        const data = await api<AdminUser[]>(path)
        if (!cancelled) { setUsers(data); setError('') }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 300)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [q, reload])

  const act = async (fn: () => Promise<unknown>) => {
    setError('')
    try {
      await fn()
      setReload((r) => r + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    }
  }

  const changeRole = (u: AdminUser, role: string) =>
    act(() => api(`/api/admin/users/${u.id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }))

  const toggleActif = (u: AdminUser) => {
    const verbe = u.actif ? 'désactiver' : 'activer'
    if (!window.confirm(`Voulez-vous ${verbe} le compte de ${u.nom} ?`)) return
    act(() => api(`/api/admin/users/${u.id}/statut`, { method: 'PUT', body: JSON.stringify({ actif: !u.actif }) }))
  }

  const shown = users.filter((u) => !roleFilter || u.role === roleFilter)


  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-3xl border border-white/40 bg-white/85 p-6 shadow-xl backdrop-blur-xl sm:p-8">
          <h1 className="font-display text-xl font-bold tracking-wide text-slate-900 sm:text-2xl">
            GESTION DES UTILISATEURS
          </h1>
          <div className="mt-3 h-0.5 w-14 rounded-full bg-gradient-to-r from-gold via-gold to-transparent" />

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="group relative flex-1">
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-bordeaux-600" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher par nom ou e-mail"
                className="w-full rounded-xl border border-slate-200 bg-white/70 py-3 pl-11 pr-4 text-slate-800 placeholder-slate-400 shadow-sm outline-none transition-all duration-300 focus:border-bordeaux-600 focus:bg-white focus:ring-4 focus:ring-bordeaux-600/15"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-slate-800 shadow-sm outline-none focus:border-bordeaux-600 focus:ring-4 focus:ring-bordeaux-600/15"
            >
              <option value="">Tous les rôles</option>
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <button
  onClick={() => setShowCreate(true)}
  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-bordeaux-600 to-bordeaux-700 px-5 py-3 font-semibold text-white shadow-lg shadow-bordeaux-600/30 transition hover:-translate-y-0.5"
>
  <UserPlus size={18} /> Créer un compte
</button>
          </div>
           
           {notice && (
  <div role="status" className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
    <CheckCircle2 size={16} /> {notice}
  </div>
)}

          {error && (
            <div role="alert" className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-bordeaux-600 text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nom</th>
                  <th className="px-4 py-3 font-semibold">E-mail</th>
                  <th className="px-4 py-3 font-semibold">Rôle</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      <Loader2 size={18} className="mr-2 inline animate-spin" /> Chargement…
                    </td>
                  </tr>
                )}
                {!loading && shown.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Aucun utilisateur trouvé</td>
                  </tr>
                )}
                {!loading && shown.map((u) => {

                  const isMe = u.email === me?.email
                  const locked = isMe || u.role === 'ADMIN'
                  return (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{u.nom}</td>
                      <td className="px-4 py-3 text-slate-600">{u.email}</td>
                      <td className="px-4 py-3">
                        {u.role === 'ADMIN' ? (
                          <span className="font-medium text-bordeaux-700">{roleLabels.ADMIN}</span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => changeRole(u, e.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700 outline-none focus:border-bordeaux-600"
                          >
                            {EDITABLE_ROLES.map((r) => (
                              <option key={r} value={r}>{roleLabels[r]}</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${u.actif ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                          {u.actif ? 'Actif' : 'Désactivé'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
  <div className="flex justify-end gap-2">
    <button
      onClick={() => setEditing(u)}
      className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-bordeaux-600 hover:text-bordeaux-600"
    >
      <Pencil size={13} /> Modifier
    </button>
    <button
      onClick={() => toggleActif(u)}
      disabled={locked}
      className="rounded-lg border border-bordeaux-600 px-3 py-1.5 text-xs font-semibold text-bordeaux-600 transition hover:bg-bordeaux-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-bordeaux-600"
    >
      {u.actif ? 'Désactiver' : 'Activer'}
    </button>
  </div>
</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      {showCreate && (
  <CreateUserModal
    onClose={() => setShowCreate(false)}
    onCreated={(nom) => {
      setShowCreate(false)
      setNotice(`Compte de ${nom} créé avec succès`)
      setReload((r) => r + 1)
    }}
  />
)}

{editing && (
  <EditUserModal
    user={editing}
    onClose={() => setEditing(null)}
    onSaved={(nom) => {
      setEditing(null)
      setNotice(`Compte de ${nom} mis à jour`)
      setReload((r) => r + 1)
    }}
  />
)}
    </div>
  )
}