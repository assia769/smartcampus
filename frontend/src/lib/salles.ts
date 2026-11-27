import { API_URL, getAuth } from './auth'

export type EtatEquipement = 'BON' | 'USAGE' | 'DEFECTUEUX'
export type TypeSalle = 'SALLE' | 'AMPHITHEATRE'
export type EtatSalle = 'DISPONIBLE' | 'HORS_SERVICE'

export type Equipement = {
  id: number
  nom: string
  etat: EtatEquipement
  description: string | null
}

export type Salle = {
  id: number
  nom: string
  batiment: string
  etage: string | null
  capacite: number
  type: TypeSalle
  etat: EtatSalle
  description: string | null
  equipements: Equipement[]
}

export type SalleInput = {
  nom: string
  batiment: string
  etage: string
  capacite: number
  type: TypeSalle
  etat: EtatSalle
  description: string
}

export type EquipementInput = {
  nom: string
  etat: EtatEquipement
  description: string
}

export type SalleFiltres = {
  q?: string
  batiment?: string
  capaciteMin?: string
  type?: string
  equipement?: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuth()?.token
  const res = await fetch(`${API_URL}/api/salles${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (res.status === 403) throw new Error('Accès refusé')
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? 'Une erreur est survenue')
  }
  return res.status === 204 ? (undefined as T) : res.json()
}

export const sallesApi = {
  lister: (f: SalleFiltres = {}) => {
    const p = new URLSearchParams()
    Object.entries(f).forEach(([k, v]) => v && p.set(k, v))
    return request<Salle[]>(`?${p.toString()}`)
  },
  obtenir: (id: number) => request<Salle>(`/${id}`),
  creer: (d: SalleInput) => request<Salle>('', { method: 'POST', body: JSON.stringify(d) }),
  modifier: (id: number, d: SalleInput) =>
    request<Salle>(`/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  supprimer: (id: number) => request<void>(`/${id}`, { method: 'DELETE' }),

  ajouterEquipement: (salleId: number, d: EquipementInput) =>
    request<Equipement>(`/${salleId}/equipements`, { method: 'POST', body: JSON.stringify(d) }),
  modifierEquipement: (salleId: number, id: number, d: EquipementInput) =>
    request<Equipement>(`/${salleId}/equipements/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  retirerEquipement: (salleId: number, id: number) =>
    request<void>(`/${salleId}/equipements/${id}`, { method: 'DELETE' }),
}