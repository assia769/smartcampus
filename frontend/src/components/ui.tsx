import type { ReactNode } from 'react'
import { X } from 'lucide-react'

export const inputCls =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-bordeaux-500 focus:ring-2 focus:ring-bordeaux-500/20'
export const btnPrimary =
  'rounded-xl bg-bordeaux-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-bordeaux-700 disabled:opacity-60'
export const btnGhost =
  'rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50'
export const btnDanger =
  'rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60'

export function Overlay({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bordeaux-900/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-bordeaux-900">{title}</h2>
          <button onClick={onClose} aria-label="Fermer" className="text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function ErrorBox({ message }: { message: string }) {
  return message ? (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>
  ) : null
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="mb-1 block text-sm font-medium text-slate-700">{children}</label>
}

export const ETATS_EQUIPEMENT = [
  { value: 'BON', label: 'Bon état', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'USAGE', label: 'Usagé', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'DEFECTUEUX', label: 'Défectueux', cls: 'bg-red-50 text-red-700 border-red-200' },
] as const