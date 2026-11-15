import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { AlertTriangle } from 'lucide-react'
import Navbar from '../components/Navbar'
import { reservationsApi, fmt, fmtHeure, type Reservation } from '../lib/reservations'
import { Overlay, ErrorBox, Label, inputCls, btnGhost, btnDanger } from '../components/ui'

export default function DemandesAmphiPage() {
  const [items, setItems] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [refus, setRefus] = useState<Reservation | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  async function charger() {
    setLoading(true)
    try {
      setItems(await reservationsApi.enAttente())
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { charger() }, [])

  function message(m: string) {
    setSuccess(m)
    setTimeout(() => setSuccess(''), 4000)
  }

  async function valider(r: Reservation) {
    setBusyId(r.id)
    try {
      await reservationsApi.valider(r.id)
      setError('')
      message(`Demande de ${r.demandeurNom} acceptée`)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusyId(null)
      charger()
    }
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <div className="p-6 md:p-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-3xl font-bold text-bordeaux-900">Demandes d'amphithéâtre</h1>
          <div className="mt-2 h-0.5 w-16 bg-gold" />
          <p className="mt-3 text-sm text-slate-600">Validez ou refusez les demandes en attente.</p>

          {success && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>
          )}
          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-bordeaux-900 text-ivory">
                <tr>
                  <th className="px-5 py-3 font-semibold">Demandeur</th>
                  <th className="px-5 py-3 font-semibold">Amphithéâtre</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Motif</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">Chargement…</td></tr>
                )}
                {!loading && items.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">Aucune demande en attente.</td></tr>
                )}
                {items.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100 hover:bg-ivory/60">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800">{r.demandeurNom}</p>
                      <p className="text-xs text-slate-500">{r.demandeurEmail}</p>
                    </td>
                    <td className="px-5 py-3">{r.salleNom}</td>
                    <td className="px-5 py-3 text-slate-700">
                      {fmt(r.dateDebut)} → {fmtHeure(r.dateFin)}
                      {r.conflit && (
                        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-700">
                          <AlertTriangle size={13} /> Conflit avec une réservation confirmée
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{r.motif ?? '—'}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => valider(r)} disabled={busyId === r.id || r.conflit}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                          Valider
                        </button>
                        <button onClick={() => setRefus(r)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-red-400 hover:text-red-600">
                          Refuser
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {refus && (
        <RefusForm item={refus} onClose={() => setRefus(null)}
          onDone={() => { setRefus(null); message('Demande refusée'); charger() }} />
      )}
    </div>
  )
}

function RefusForm({ item, onClose, onDone }: { item: Reservation; onClose: () => void; onDone: () => void }) {
  const [motif, setMotif] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!motif.trim()) return setError('Le motif du refus est obligatoire')
    setBusy(true)
    try {
      await reservationsApi.refuser(item.id, motif)
      onDone()
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <Overlay title="Refuser la demande" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-slate-600">
          Demande de <b>{item.demandeurNom}</b> pour <b>{item.salleNom}</b>, {fmt(item.dateDebut)}.
        </p>
        <div>
          <Label>Motif du refus</Label>
          <textarea rows={3} className={inputCls} value={motif} onChange={(e) => setMotif(e.target.value)} />
        </div>
        <ErrorBox message={error} />
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className={btnGhost}>Annuler</button>
          <button type="submit" disabled={busy} className={btnDanger}>Refuser</button>
        </div>
      </form>
    </Overlay>
  )
}