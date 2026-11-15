import { API_URL, getAuth } from './auth'
import type { Salle } from './salles'

export type StatutReservation = 'EN_ATTENTE' | 'CONFIRMEE' | 'REFUSEE' | 'ANNULEE'

export type Reservation = {
  id: number
  salleId: number
  salleNom: string
  batiment: string
  typeSalle: 'SALLE' | 'AMPHITHEATRE'
  dateDebut: string
  dateFin: string
  statut: StatutReservation
  motif: string | null
  motifRefus: string | null
  demandeurNom: string
  demandeurEmail: string
  dateCreation: string
  conflit: boolean
}

export type ReservationInput = {
  salleId: number
  dateDebut: string
  dureeMinutes: number
  motif: string
}

export type Recherche = { debut: string; dureeMinutes: number; type?: string; capaciteMin?: string }

export const STATUTS: Record<StatutReservation, { label: string; cls: string }> = {
  EN_ATTENTE: { label: 'En attente', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  CONFIRMEE: { label: 'Confirmée', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REFUSEE: { label: 'Refusée', cls: 'bg-red-50 text-red-700 border-red-200' },
  ANNULEE: { label: 'Annulée', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
}

export const fmt = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })

export const fmtHeure = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

/** Date locale au format YYYY-MM-DD, avec un décalage en jours. */
export function jourISO(offset = 0) {
  const d = new Date(Date.now() + offset * 86400000 - new Date().getTimezoneOffset() * 60000)
  return d.toISOString().slice(0, 10)
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuth()?.token
  const res = await fetch(`${API_URL}/api/reservations${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (res.status === 403) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? 'Accès refusé')
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? 'Une erreur est survenue')
  }
  return res.status === 204 ? (undefined as T) : res.json()
}

export const reservationsApi = {
  disponibles: (r: Recherche) => {
    const p = new URLSearchParams({ debut: r.debut, dureeMinutes: String(r.dureeMinutes) })
    if (r.type) p.set('type', r.type)
    if (r.capaciteMin) p.set('capaciteMin', r.capaciteMin)
    return request<Salle[]>(`/disponibles?${p.toString()}`)
  },
  suggestions: (salleId: number, debut: string, dureeMinutes: number) =>
    request<Salle[]>(
      `/suggestions?salleId=${salleId}&debut=${encodeURIComponent(debut)}&dureeMinutes=${dureeMinutes}`,
    ),
  creer: (d: ReservationInput) =>
    request<Reservation>('', {
      method: 'POST',
      body: JSON.stringify({
        salleId: d.salleId,
        dateDebut: d.dateDebut,
        dureeMinutes: d.dureeMinutes,
        motif: d.motif,
      }),
    }),
  mes: () => request<Reservation[]>('/mes'),
  annuler: (id: number) => request<Reservation>(`/${id}`, { method: 'DELETE' }),
  enAttente: () => request<Reservation[]>('/en-attente'),
  valider: (id: number) => request<Reservation>(`/${id}/valider`, { method: 'POST' }),
  refuser: (id: number, motif: string) =>
    request<Reservation>(`/${id}/refuser`, { method: 'POST', body: JSON.stringify({ motif }) }),
}