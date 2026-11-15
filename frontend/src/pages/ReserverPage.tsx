import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Building2, Users, ShieldCheck } from 'lucide-react'
import Navbar from '../components/Navbar'
import { getAuth } from '../lib/auth'
import type { Salle } from '../lib/salles'
import { reservationsApi, jourISO, fmt } from '../lib/reservations'
import { Overlay, ErrorBox, Label, inputCls, btnPrimary, btnGhost } from '../components/ui'

const DUREES = [30, 60, 90, 120, 180, 240]

export default function ReserverPage() {
  const role = getAuth()?.role
  const [params] = useSearchParams()
  const salleCible = Number(params.get('salle')) || null

  const [date, setDate] = useState(jourISO(1))
  const [heure, setHeure] = useState('08:00')
  const [duree, setDuree] = useState(60)
  const [type, setType] = useState('')
  const [capaciteMin, setCapaciteMin] = useState('')

  const [libres, setLibres] = useState<Salle[]>([])
  const [suggestions, setSuggestions] = useState<Salle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [choix, setChoix] = useState<Salle | null>(null)

  const debut = `${date}T${heure}`

  async function charger() {
    setLoading(true)
    try {
      const l = await reservationsApi.disponibles({ debut, dureeMinutes: duree, type, capaciteMin })
      setLibres(l)
      if (salleCible && !l.some((s) => s.id === salleCible)) {
        setSuggestions(await reservationsApi.suggestions(salleCible, debut, duree))
      } else {
        setSuggestions([])
      }
      setError('')
    } catch (e) {
      setLibres([])
      setSuggestions([])
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(charger, 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, heure, duree, type, capaciteMin, salleCible])

  function fini(message: string) {
    setChoix(null)
    setSuccess(message)
    setTimeout(() => setSuccess(''), 5000)
    charger()
  }

  const cible = salleCible ? libres.find((s) => s.id === salleCible) : undefined
  const cibleOccupee = salleCible !== null && !cible && !loading && !error
  const liste = cible ? [cible] : cibleOccupee ? suggestions : libres

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <div className="p-6 md:p-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-3xl font-bold text-bordeaux-900">Réserver une salle</h1>
          <div className="mt-2 h-0.5 w-16 bg-gold" />
          <p className="mt-3 text-sm text-slate-600">
            Choisissez un créneau : seules les salles libres sont affichées. Les amphithéâtres sont soumis à la
            validation de l'administration.
          </p>

          {success && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success} <Link to="/reservations" className="font-semibold underline">Voir mes réservations</Link>
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5">
            <div>
              <Label>Date</Label>
              <input type="date" min={jourISO(0)} value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <Label>Heure de début</Label>
              <input type="time" step={900} min="08:00" max="19:30" value={heure}
                onChange={(e) => setHeure(e.target.value)} className={inputCls} />
            </div>
            <div>
              <Label>Durée</Label>
              <select value={duree} onChange={(e) => setDuree(Number(e.target.value))} className={inputCls}>
                {DUREES.map((d) => (
                  <option key={d} value={d}>{d >= 60 ? `${d / 60} h${d % 60 ? ' 30' : ''}` : `${d} min`}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Type</Label>
              <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
                <option value="">Tous</option>
                <option value="SALLE">Salle</option>
                <option value="AMPHITHEATRE">Amphithéâtre</option>
              </select>
            </div>
            <div>
              <Label>Capacité min.</Label>
              <input type="number" min={1} value={capaciteMin} onChange={(e) => setCapaciteMin(e.target.value)}
                placeholder="Ex. 30" className={inputCls} />
            </div>
          </div>

          {cibleOccupee && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <span>
                La salle choisie n'est pas disponible à ce créneau.{' '}
                {suggestions.length > 0 ? 'Voici des salles équivalentes libres :' : 'Aucune salle équivalente n’est libre.'}
              </span>
              <Link to="/reserver" className="font-semibold underline">Voir toutes les salles libres</Link>
            </div>
          )}

          {loading && <p className="mt-10 text-center text-slate-500">Recherche…</p>}
          {!loading && !error && liste.length === 0 && !cibleOccupee && (
            <p className="mt-10 text-center text-slate-500">Aucune salle libre sur ce créneau.</p>
          )}

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {liste.map((s) => {
              const amphi = s.type === 'AMPHITHEATRE'
              return (
                <div key={s.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg font-bold text-bordeaux-900">{s.nom}</h3>
                    {amphi && (
                      <span className="flex shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                        <ShieldCheck size={13} /> Validation requise
                      </span>
                    )}
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <Building2 size={15} className="text-gold" /> Bâtiment {s.batiment}
                      {s.etage ? ` · étage ${s.etage}` : ''}
                    </p>
                    <p className="flex items-center gap-2">
                      <Users size={15} className="text-gold" /> {s.capacite} places
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {s.equipements.map((e) => (
                      <span key={e.id} className="rounded-md bg-ivory px-2 py-1 text-xs text-slate-700">{e.nom}</span>
                    ))}
                  </div>
                  <div className="mt-auto pt-5">
                    <button onClick={() => setChoix(s)} className={btnPrimary + ' w-full'}>
                      {amphi && role !== 'ADMIN' ? 'Envoyer une demande' : 'Réserver'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {choix && (
        <ConfirmerReservation salle={choix} debut={debut} duree={duree} role={role}
          onClose={() => setChoix(null)} onDone={fini} />
      )}
    </div>
  )
}

function ConfirmerReservation({
  salle, debut, duree, role, onClose, onDone,
}: {
  salle: Salle; debut: string; duree: number; role?: string
  onClose: () => void; onDone: (m: string) => void
}) {
  const amphi = salle.type === 'AMPHITHEATRE'
  const demande = amphi && role !== 'ADMIN'
  const [motif, setMotif] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (demande && !motif.trim()) return setError('Le motif est obligatoire pour un amphithéâtre')
    setBusy(true)
    try {
      await reservationsApi.creer({ salleId: salle.id, dateDebut: debut, dureeMinutes: duree, motif })
      onDone(demande
        ? 'Demande envoyée à l’administration. Elle est en attente de validation.'
        : 'Réservation confirmée.')
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <Overlay title={demande ? 'Demande de réservation' : 'Confirmer la réservation'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-xl bg-ivory p-4 text-sm text-slate-700">
          <p className="font-semibold text-bordeaux-900">{salle.nom} · bâtiment {salle.batiment}</p>
          <p className="mt-1">{fmt(debut)} · {duree} min</p>
        </div>
        <div>
          <Label>Motif {demande ? '' : '(optionnel)'}</Label>
          <textarea rows={3} className={inputCls} value={motif} onChange={(e) => setMotif(e.target.value)}
            placeholder={demande ? 'Ex. : Conférence de rentrée' : ''} />
        </div>
        {demande && (
          <p className="text-xs text-slate-500">
            Votre demande restera « En attente » jusqu'à la décision de l'administration.
          </p>
        )}
        <ErrorBox message={error} />
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className={btnGhost}>Annuler</button>
          <button type="submit" disabled={busy} className={btnPrimary}>
            {busy ? 'Envoi…' : demande ? 'Envoyer la demande' : 'Confirmer'}
          </button>
        </div>
      </form>
    </Overlay>
  )
}