export const API_URL = ''
const KEY = 'smartcampus_auth'

export interface AuthUser {
  token: string
  email: string
  nom: string
  role: string
}

export const roleLabels: Record<string, string> = {
  ADMIN: 'Admin',
  ENSEIGNANT: 'Enseignant',
  ETUDIANT: 'Étudiant',
  SUPERVISEUR: 'Superviseur',
}

export function getAuth(): AuthUser | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}
export const setAuth = (u: AuthUser) => localStorage.setItem(KEY, JSON.stringify(u))
export const clearAuth = () => localStorage.removeItem(KEY)