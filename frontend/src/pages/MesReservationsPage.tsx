import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { reservationsApi, STATUTS, fmt, fmtHeure, type Reservation } from '../lib/reservations'

type Onglet = 'avenir' | 'attente' | 'historique'

export default function MesReservationsPage() {
  const [items, setItems] = useState<Reservation[]>([])
  const [onglet, setOnglet] = useState<Onglet>('avenir')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function charger() {
    setLoading(true)
    try {
      setItems(await reservationsApi.mes())
      setError('')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { charger() }, [])

  const maintenant = Date.now()
  const avenir = items.filter((r) => r.statut === 'CONFIRMEE' && new Date(r.dateFin).getTime() > maintenant)
  const attente = items.filter((r) => r.statut === 'EN_ATTENTE')
  const historique = items.filter((r) => !avenir.includes(r) && !attente.includes(r))
  const liste = onglet === 'avenir' ? avenir : onglet === 'attente' ? attente : historique

  async function annuler(r: Reservation) {
    if (!window.confirm(`Annuler la réservation de ${r.salleNom} ?`)) return
    try {
      await reservationsApi.annuler(r.id)
      setError('')
      setSuccess('Réservation annulée')
      setTimeout(() => setSuccess(''), 3000)
      charger()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const onglets: { key: Onglet; label: string; n: number }[] = [
    { key: 'avenir', label: 'À venir', n: avenir.length },
    { key: 'attente', label: 'En attente de validation', n: attente.length },
    { key: 'historique', label: 'Historique', n: historique.length },
  ]

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <div className="p-6 md:p-10">
        <div className="mx-auto max-w-5xl">
          <h1 className="font-display text-3xl font-bold text-bordeaux-900">Mes réservations</h1>
          <div className="mt-2 h-0.5 w-16 bg-gold" />

          {success && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>
          )}
          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {onglets.map((o) => (
              <button key={o.key} onClick={() => setOnglet(o.key)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  onglet === o.key ? 'bg-bordeaux-600 text-white shadow' : 'border border-slate-200 bg-white text-slate-600 hover:border-gold'
                }`}>
                {o.label} ({o.n})
              </button>
            ))}
          </div>

          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-bordeaux-900 text-ivory">
                <tr>
                  <th className="px-5 py-3 font-semibold">Salle</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Statut</th>
                  <th className="px-5 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-500">Chargement…</td></tr>
                )}
                {!loading && liste.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-500">Aucune réservation.</td></tr>
                )}
                {liste.map((r) => {
                  const st = STATUTS[r.statut]
                  const annulable =
                    (r.statut === 'CONFIRMEE' || r.statut === 'EN_ATTENTE') && new Date(r.dateDebut).getTime() > maintenant
                  return (
                    <tr key={r.id} className="border-t border-slate-100 hover:bg-ivory/60">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-800">{r.salleNom}</p>
                        <p className="text-xs text-slate-500">
                          Bâtiment {r.batiment}{r.typeSalle === 'AMPHITHEATRE' ? ' · Amphithéâtre' : ''}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-slate-700">
                        {fmt(r.dateDebut)} → {fmtHeure(r.dateFin)}
                        {r.motif && <p className="text-xs text-slate-500">{r.motif}</p>}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full border px-3 py-1 text-xs font-medium ${st.cls}`}>{st.label}</span>
                        {r.statut === 'REFUSEE' && r.motifRefus && (
                          <p className="mt-1 text-xs text-red-600">Motif : {r.motifRefus}</p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {annulable && (
                          <button onClick={() => annuler(r)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-red-400 hover:text-red-600">
                            Annuler
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}