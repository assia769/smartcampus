import { API_URL, getAuth } from './auth' 
export type Materiel = {
  id: number
  designation: string
  quantiteTotale: number
  quantiteDisponible: number
  etat: 'BON' | 'USAGE' | 'DEFECTUEUX'
}

export type MaterielInput = Pick<Materiel, 'designation' | 'quantiteTotale' | 'etat'>

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuth()?.token
  const res = await fetch(`${API_URL}/api/stock${path}`, {
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

export const stockApi = {
  lister: (q = '') => request<Materiel[]>(`?q=${encodeURIComponent(q)}`),
  ajouter: (d: MaterielInput) =>
    request<Materiel>('', { method: 'POST', body: JSON.stringify(d) }),
  modifier: (id: number, d: MaterielInput) =>
    request<Materiel>(`/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  mouvement: (id: number, type: 'ENTREE' | 'RETRAIT', quantite: number) =>
    request<Materiel>(`/${id}/mouvements`, { method: 'POST', body: JSON.stringify({ type, quantite }) }),
  retirer: (id: number) => request<void>(`/${id}`, { method: 'DELETE' }),
}