import { API_URL, clearAuth, getAuth } from './auth'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const auth = getAuth()
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: `Bearer ${auth.token}` } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new ApiError(0, 'Serveur injoignable')
  }

  if (res.status === 401) {
    clearAuth()
    window.location.hash = '#/login'
    window.location.reload()
    throw new ApiError(401, 'Session expirée')
  }

  if (res.status === 403) throw new ApiError(403, 'Accès refusé')

  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    throw new ApiError(res.status, data?.message ?? `Erreur ${res.status}`)
  }
  return data as T
}