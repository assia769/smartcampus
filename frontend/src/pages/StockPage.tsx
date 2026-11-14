import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Plus, Search, Pencil, Trash2, ArrowUpDown, AlertTriangle, X } from 'lucide-react'
import Navbar from '../components/Navbar'
import { stockApi, type Materiel, type MaterielInput } from '../lib/stock'

const SEUIL_FAIBLE = 5

const ETATS = [
  { value: 'BON', label: 'Bon état', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'USAGE', label: 'Usagé', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'DEFECTUEUX', label: 'Défectueux', cls: 'bg-red-50 text-red-700 border-red-200' },
] as const

type Modal =
  | { kind: 'form'; item: Materiel | null }
  | { kind: 'mouvement'; item: Materiel }
  | { kind: 'delete'; item: Materiel }
  | null

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-bordeaux-500 focus:ring-2 focus:ring-bordeaux-500/20'
const btnPrimary =
  'rounded-xl bg-bordeaux-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-bordeaux-700 disabled:opacity-60'
const btnGhost =
  'rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50'

export default function StockPage() {
  const [items, setItems] = useState<Materiel[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modal, setModal] = useState<Modal>(null)
  const [sortDesc, setSortDesc] = useState(false)

  async function charger(recherche = q) {
    setLoading(true)
    try {
      setItems(await stockApi.lister(recherche))
      setError('')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(() => charger(q), 250) // recherche avec délai
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  function fini(message: string) {
    setModal(null)
    setSuccess(message)
    setTimeout(() => setSuccess(''), 3000)
    charger()
  }

  const tries = [...items].sort((a, b) =>
    sortDesc ? b.designation.localeCompare(a.designation) : a.designation.localeCompare(b.designation),
  )
  const faibles = items.filter((i) => i.quantiteDisponible < SEUIL_FAIBLE).length

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />

      <div className="p-6 md:p-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-bordeaux-900">Stock de matériel</h1>
              <div className="mt-2 h-0.5 w-16 bg-gold" />
              <p className="mt-3 text-sm text-slate-600">
                Micros, caméras, rallonges… gérez les quantités et l'état du matériel empruntable.
              </p>
            </div>
            <button
              onClick={() => setModal({ kind: 'form', item: null })}
              className="flex items-center gap-2 rounded-xl bg-bordeaux-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-bordeaux-700"
            >
              <Plus size={18} /> Ajouter un article
            </button>
          </div>

          {faibles > 0 && (
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <AlertTriangle size={18} />
              {faibles} article(s) en stock faible (moins de {SEUIL_FAIBLE} disponibles).
            </div>
          )}
          {success && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="relative mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un article…"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm outline-none focus:border-bordeaux-500 focus:ring-2 focus:ring-bordeaux-500/20"
            />
          </div>

          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-bordeaux-900 text-ivory">
                <tr>
                  <th className="px-5 py-3">
                    <button onClick={() => setSortDesc(!sortDesc)} className="flex items-center gap-1 font-semibold">
                      Matériel <ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th className="px-5 py-3 font-semibold">Quantité totale</th>
                  <th className="px-5 py-3 font-semibold">Disponible</th>
                  <th className="px-5 py-3 font-semibold">État</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-500">Chargement…</td>
                  </tr>
                )}
                {!loading && tries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-500">Aucun article trouvé.</td>
                  </tr>
                )}
                {tries.map((m) => {
                  const etat = ETATS.find((e) => e.value === m.etat)
                  const faible = m.quantiteDisponible < SEUIL_FAIBLE
                  return (
                    <tr key={m.id} className="border-t border-slate-100 hover:bg-ivory/60">
                      <td className="px-5 py-3 font-medium text-slate-800">{m.designation}</td>
                      <td className="px-5 py-3">{m.quantiteTotale}</td>
                      <td className="px-5 py-3">
                        <span className={faible ? 'font-semibold text-red-600' : ''}>{m.quantiteDisponible}</span>
                        {faible && <span className="ml-2 text-xs text-red-500">stock faible</span>}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full border px-3 py-1 text-xs font-medium ${etat?.cls ?? ''}`}>
                          {etat?.label ?? m.etat}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setModal({ kind: 'mouvement', item: m })}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-gold hover:text-bordeaux-700"
                          >
                            Entrée / Retrait
                          </button>
                          <button
                            onClick={() => setModal({ kind: 'form', item: m })}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-bordeaux-500 hover:text-bordeaux-600"
                            aria-label="Modifier"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setModal({ kind: 'delete', item: m })}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-red-400 hover:text-red-600"
                            aria-label="Retirer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal?.kind === 'form' && (
        <ArticleForm item={modal.item} onClose={() => setModal(null)} onDone={fini} />
      )}
      {modal?.kind === 'mouvement' && (
        <MouvementForm item={modal.item} onClose={() => setModal(null)} onDone={fini} />
      )}
      {modal?.kind === 'delete' && (
        <Overlay title="Retirer l'article" onClose={() => setModal(null)}>
          <DeleteConfirm item={modal.item} onClose={() => setModal(null)} onDone={fini} />
        </Overlay>
      )}
    </div>
  )
}

/* ---------- Composants internes ---------- */

function Overlay({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bordeaux-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
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

function ErrorBox({ message }: { message: string }) {
  return message ? (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>
  ) : null
}

function ArticleForm({
  item,
  onClose,
  onDone,
}: {
  item: Materiel | null
  onClose: () => void
  onDone: (msg: string) => void
}) {
  const [form, setForm] = useState<MaterielInput>({
    designation: item?.designation ?? '',
    quantiteTotale: item?.quantiteTotale ?? 0,
    etat: item?.etat ?? 'BON',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!form.designation.trim()) return setError('La désignation est obligatoire')
    if (form.quantiteTotale < 0) return setError('La quantité ne peut pas être négative')
    setBusy(true)
    try {
      if (item) await stockApi.modifier(item.id, form)
      else await stockApi.ajouter(form)
      onDone(item ? 'Article modifié avec succès' : 'Article ajouté avec succès')
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <Overlay title={item ? "Modifier l'article" : 'Ajouter un article'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Désignation</label>
          <input
            className={inputCls}
            value={form.designation}
            placeholder="Ex. : Microphone sans fil"
            onChange={(e) => setForm({ ...form, designation: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Quantité totale</label>
            <input
              type="number"
              min={0}
              className={inputCls}
              value={form.quantiteTotale}
              onChange={(e) => setForm({ ...form, quantiteTotale: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">État</label>
            <select
              className={inputCls}
              value={form.etat}
              onChange={(e) => setForm({ ...form, etat: e.target.value as MaterielInput['etat'] })}
            >
              {ETATS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
        <ErrorBox message={error} />
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className={btnGhost}>Annuler</button>
          <button type="submit" disabled={busy} className={btnPrimary}>
            {busy ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </Overlay>
  )
}

function MouvementForm({
  item,
  onClose,
  onDone,
}: {
  item: Materiel
  onClose: () => void
  onDone: (msg: string) => void
}) {
  const [type, setType] = useState<'ENTREE' | 'RETRAIT'>('ENTREE')
  const [quantite, setQuantite] = useState(1)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (quantite < 1) return setError('La quantité doit être au moins 1')
    setBusy(true)
    try {
      await stockApi.mouvement(item.id, type, quantite)
      onDone(type === 'ENTREE' ? 'Entrée enregistrée' : 'Retrait enregistré')
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <Overlay title={item.designation} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-slate-600">
          Total : <b>{item.quantiteTotale}</b> · Disponible : <b>{item.quantiteDisponible}</b>
        </p>
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          {(['ENTREE', 'RETRAIT'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-lg py-2 text-sm font-medium transition ${
                type === t ? 'bg-bordeaux-600 text-white shadow' : 'text-slate-600'
              }`}
            >
              {t === 'ENTREE' ? 'Entrée' : 'Retrait'}
            </button>
          ))}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Quantité</label>
          <input
            type="number"
            min={1}
            className={inputCls}
            value={quantite}
            onChange={(e) => setQuantite(Number(e.target.value))}
          />
        </div>
        <ErrorBox message={error} />
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className={btnGhost}>Annuler</button>
          <button type="submit" disabled={busy} className={btnPrimary}>Valider</button>
        </div>
      </form>
    </Overlay>
  )
}

function DeleteConfirm({
  item,
  onClose,
  onDone,
}: {
  item: Materiel
  onClose: () => void
  onDone: (msg: string) => void
}) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function confirmer() {
    setBusy(true)
    try {
      await stockApi.retirer(item.id)
      onDone('Article retiré du stock')
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Voulez-vous vraiment retirer <b>{item.designation}</b> du stock ? Cette action est définitive.
      </p>
      <ErrorBox message={error} />
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className={btnGhost}>Annuler</button>
        <button
          onClick={confirmer}
          disabled={busy}
          className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          Retirer
        </button>
      </div>
    </div>
  )
}