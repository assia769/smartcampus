import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Pencil, Trash2, Users, Building2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import { getAuth } from '../lib/auth'
import { sallesApi, type Salle, type SalleInput } from '../lib/salles'
import { Overlay, ErrorBox, Label, inputCls, btnPrimary, btnGhost, btnDanger } from '../components/ui'

type Modal = { kind: 'form'; item: Salle | null } | { kind: 'delete'; item: Salle } | null

export default function SallesPage() {
  const role = getAuth()?.role
  const estAdmin = role === 'ADMIN'
  const peutReserver = role === 'ETUDIANT' || role === 'ENSEIGNANT'
  const [salles, setSalles] = useState<Salle[]>([])
  const [filtres, setFiltres] = useState({ q: '', batiment: '', capaciteMin: '', type: '', equipement: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modal, setModal] = useState<Modal>(null)

  async function charger() {
    setLoading(true)
    try {
      setSalles(await sallesApi.lister(filtres))
      setError('')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(charger, 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtres])

  function fini(message: string) {
    setModal(null)
    setSuccess(message)
    setTimeout(() => setSuccess(''), 3000)
    charger()
  }

  const set = (k: keyof typeof filtres) => (e: { target: { value: string } }) =>
    setFiltres({ ...filtres, [k]: e.target.value })

  // Les non-admin ne voient que les salles disponibles
  const visibles = estAdmin ? salles : salles.filter((s) => s.etat === 'DISPONIBLE')

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <div className="p-6 md:p-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-bordeaux-900">Salles</h1>
              <div className="mt-2 h-0.5 w-16 bg-gold" />
              <p className="mt-3 text-sm text-slate-600">
                Recherchez une salle par nom, bâtiment, capacité ou équipement.
              </p>
            </div>
            {estAdmin && (
              <button
                onClick={() => setModal({ kind: 'form', item: null })}
                className="flex items-center gap-2 rounded-xl bg-bordeaux-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-bordeaux-700"
              >
                <Plus size={18} /> Ajouter une salle
              </button>
            )}
          </div>

          {success && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          {/* Filtres */}
          <div className="mt-6 grid gap-3 md:grid-cols-5">
            <div className="relative md:col-span-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={filtres.q}
                onChange={set('q')}
                placeholder="Nom de salle ou bâtiment…"
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm outline-none focus:border-bordeaux-500 focus:ring-2 focus:ring-bordeaux-500/20"
              />
            </div>
            <input
              type="number"
              min={1}
              value={filtres.capaciteMin}
              onChange={set('capaciteMin')}
              placeholder="Capacité min."
              className={inputCls + ' bg-white'}
            />
            <select value={filtres.type} onChange={set('type')} className={inputCls + ' bg-white'}>
              <option value="">Tous les types</option>
              <option value="SALLE">Salle</option>
              <option value="AMPHITHEATRE">Amphithéâtre</option>
            </select>
            <input
              value={filtres.equipement}
              onChange={set('equipement')}
              placeholder="Équipement (ex. projecteur)"
              className={inputCls + ' bg-white'}
            />
          </div>

          {/* Cartes */}
          {loading && <p className="mt-10 text-center text-slate-500">Chargement…</p>}
          {!loading && visibles.length === 0 && (
            <p className="mt-10 text-center text-slate-500">Aucune salle trouvée.</p>
          )}
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibles.map((s) => {
              const horsService = s.etat === 'HORS_SERVICE'
              return (
                <div key={s.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg font-bold text-bordeaux-900">{s.nom}</h3>
                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${
                        horsService
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {horsService ? 'Hors service' : 'Disponible'}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <Building2 size={15} className="text-gold" /> Bâtiment {s.batiment}
                      {s.etage ? ` · étage ${s.etage}` : ''}
                    </p>
                    <p className="flex items-center gap-2">
                      <Users size={15} className="text-gold" /> {s.capacite} places ·{' '}
                      {s.type === 'AMPHITHEATRE' ? 'Amphithéâtre' : 'Salle'}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {s.equipements.slice(0, 4).map((e) => (
                      <span key={e.id} className="rounded-md bg-ivory px-2 py-1 text-xs text-slate-700">
                        {e.nom}
                      </span>
                    ))}
                    {s.equipements.length > 4 && (
                      <span className="rounded-md bg-ivory px-2 py-1 text-xs text-slate-500">
                        +{s.equipements.length - 4}
                      </span>
                    )}
                    {s.equipements.length === 0 && (
                      <span className="text-xs text-slate-400">Aucun équipement</span>
                    )}
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-5">
                    <div className="flex gap-2">
                      <Link
                        to={`/salles/${s.id}`}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:border-gold hover:text-bordeaux-700"
                      >
                        Détails
                      </Link>
                      {peutReserver && (
                        <Link
                          to={`/reserver?salle=${s.id}`}
                          className="rounded-lg bg-bordeaux-600 px-4 py-2 text-xs font-semibold text-white hover:bg-bordeaux-700"
                        >
                          Réserver
                        </Link>
                      )}
                    </div>
                    {estAdmin && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setModal({ kind: 'form', item: s })}
                          aria-label="Modifier"
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-bordeaux-500 hover:text-bordeaux-600"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setModal({ kind: 'delete', item: s })}
                          aria-label="Supprimer"
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-red-400 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {modal?.kind === 'form' && <SalleForm item={modal.item} onClose={() => setModal(null)} onDone={fini} />}
      {modal?.kind === 'delete' && (
        <Overlay title="Supprimer la salle" onClose={() => setModal(null)}>
          <SupprimerSalle item={modal.item} onClose={() => setModal(null)} onDone={fini} />
        </Overlay>
      )}
    </div>
  )
}

function SalleForm({ item, onClose, onDone }: { item: Salle | null; onClose: () => void; onDone: (m: string) => void }) {
  const [form, setForm] = useState<SalleInput>({
    nom: item?.nom ?? '',
    batiment: item?.batiment ?? '',
    etage: item?.etage ?? '',
    capacite: item?.capacite ?? 30,
    type: item?.type ?? 'SALLE',
    etat: item?.etat ?? 'DISPONIBLE',
    description: item?.description ?? '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!form.nom.trim()) return setError('Le nom est obligatoire')
    if (!form.batiment.trim()) return setError('Le bâtiment est obligatoire')
    if (!Number.isInteger(form.capacite) || form.capacite < 1)
      return setError('La capacité doit être un entier supérieur à 0')
    setBusy(true)
    try {
      if (item) await sallesApi.modifier(item.id, form)
      else await sallesApi.creer(form)
      onDone(item ? 'Salle modifiée avec succès' : 'Salle créée avec succès')
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <Overlay title={item ? 'Modifier la salle' : 'Ajouter une salle'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>Nom</Label>
          <input className={inputCls} value={form.nom} placeholder="Ex. : Salle 12"
            onChange={(e) => setForm({ ...form, nom: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Bâtiment</Label>
            <input className={inputCls} value={form.batiment} placeholder="Ex. : A"
              onChange={(e) => setForm({ ...form, batiment: e.target.value })} />
          </div>
          <div>
            <Label>Étage</Label>
            <input className={inputCls} value={form.etage} placeholder="Ex. : 1"
              onChange={(e) => setForm({ ...form, etage: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Capacité</Label>
            <input type="number" min={1} className={inputCls} value={form.capacite}
              onChange={(e) => setForm({ ...form, capacite: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Type</Label>
            <select className={inputCls} value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as SalleInput['type'] })}>
              <option value="SALLE">Salle</option>
              <option value="AMPHITHEATRE">Amphithéâtre</option>
            </select>
          </div>
        </div>
        <div>
          <Label>État</Label>
          <select className={inputCls} value={form.etat}
            onChange={(e) => setForm({ ...form, etat: e.target.value as SalleInput['etat'] })}>
            <option value="DISPONIBLE">Disponible</option>
            <option value="HORS_SERVICE">Hors service</option>
          </select>
        </div>
        <div>
          <Label>Description (optionnel)</Label>
          <textarea rows={2} className={inputCls} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
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

function SupprimerSalle({ item, onClose, onDone }: { item: Salle; onClose: () => void; onDone: (m: string) => void }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function confirmer() {
    setBusy(true)
    try {
      await sallesApi.supprimer(item.id)
      onDone('Salle supprimée')
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Voulez-vous vraiment supprimer <b>{item.nom}</b> (bâtiment {item.batiment}) ? Ses équipements seront aussi
        supprimés.
      </p>
      <ErrorBox message={error} />
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className={btnGhost}>Annuler</button>
        <button onClick={confirmer} disabled={busy} className={btnDanger}>Supprimer</button>
      </div>
    </div>
  )
}