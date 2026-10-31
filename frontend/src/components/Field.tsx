import { useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Eye, EyeOff } from 'lucide-react'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  icon: LucideIcon
}

export default function Field({ id, label, icon: Icon, type = 'text', ...props }: FieldProps) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="group relative">
        <Icon
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-300 group-focus-within:text-bordeaux-600"
        />
        <input
          id={id}
          type={isPassword && show ? 'text' : type}
          className="w-full rounded-xl border border-slate-200 bg-white/70 py-3 pl-11 pr-11 text-slate-800 placeholder-slate-400 shadow-sm outline-none transition-all duration-300 focus:border-bordeaux-600 focus:bg-white focus:ring-4 focus:ring-bordeaux-600/15"
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-bordeaux-600"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  )
}