import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Pencil, Trash2, Users, Building2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import { getAuth } from '../lib/auth'
import { sallesApi, type Salle, type Equipement, type EquipementInput } from '../lib/salles'
import {
  Overlay, ErrorBox, Label, inputCls, btnPrimary, btnGhost, btnDanger, ETATS_EQUIPEMENT,
} from '../components/ui'

type Modal = { kind: 'form'; item: Equipement | null } | { kind: 'delete'; item: Equipement } | null

export default function SalleDetailPage() {
  const { id } = useParams()
  const salleId = Number(id)
  const estAdmin = getAuth()?.role === 'ADMIN'
  const [salle, setSalle] = useState<Salle | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modal, setModal] = useState<Modal>(null)

  const charger = useCallback(async () => {
    try {
      setSalle(await sallesApi.obtenir(salleId))
      setError('')
    } catch (e) {
      setError((e as Error).message)
    }
  }, [salleId])

  useEffect(() => { charger() }, [charger])

  function fini(message: string) {
    setModal(null)
    setSuccess(message)
    setTimeout(() => setSuccess(''), 3000)
    charger()
  }

  const horsService = salle?.etat === 'HORS_SERVICE'

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <div className="p-6 md:p-10">
        <div className="mx-auto max-w-4xl">
          <Link to="/salles" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-bordeaux-700">
            <ArrowLeft size={16} /> Retour aux salles
          </Link>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          {success && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          {salle && (
            <>
              <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl font-bold text-bordeaux-900">{salle.nom}</h1>
                  <div className="mt-2 h-0.5 w-16 bg-gold" />
                </div>
                <span
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                    horsService
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {horsService ? 'Hors service' : 'Disponible'}
                </span>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
                  <p className="flex items-center gap-2">
                    <Building2 size={16} className="text-gold" /> Bâtiment {salle.batiment}
                    {salle.etage ? ` · étage ${salle.etage}` : ''}
                  </p>
                  <p className="flex items-center gap-2">
                    <Users size={16} className="text-gold" /> {salle.capacite} places
                  </p>
                  <p>{salle.type === 'AMPHITHEATRE' ? 'Amphithéâtre' : 'Salle'}</p>
                </div>
                {salle.description && <p className="mt-4 text-sm text-slate-600">{salle.description}</p>}
              </div>

              <div className="mt-8 flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-bordeaux-900">Équipements</h2>
                {estAdmin && (
                  <button
                    onClick={() => setModal({ kind: 'form', item: null })}
                    className="flex items-center gap-2 rounded-xl bg-bordeaux-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-bordeaux-700"
                  >
                    <Plus size={16} /> Ajouter un équipement
                  </button>
                )}
              </div>

              <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-bordeaux-900 text-ivory">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Équipement</th>
                      <th className="px-5 py-3 font-semibold">État</th>
                      <th className="px-5 py-3 font-semibold">Description</th>
                      {estAdmin && <th className="px-5 py-3 text-right font-semibold">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {salle.equipements.length === 0 && (
                      <tr>
                        <td colSpan={estAdmin ? 4 : 3} className="px-5 py-8 text-center text-slate-500">
                          Aucun équipement dans cette salle.
                        </td>
                      </tr>
                    )}
                    {salle.equipements.map((e) => {
                      const etat = ETATS_EQUIPEMENT.find((x) => x.value === e.etat)
                      return (
                        <tr key={e.id} className="border-t border-slate-100 hover:bg-ivory/60">
                          <td className="px-5 py-3 font-medium text-slate-800">{e.nom}</td>
                          <td className="px-5 py-3">
                            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${etat?.cls ?? ''}`}>
                              {etat?.label ?? e.etat}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-slate-600">{e.description ?? '—'}</td>
                          {estAdmin && (
                            <td className="px-5 py-3">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setModal({ kind: 'form', item: e })}
                                  aria-label="Modifier"
                                  className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-bordeaux-500 hover:text-bordeaux-600"
                                >
                                  <Pencil size={15} />
                                </button>
                                <button
                                  onClick={() => setModal({ kind: 'delete', item: e })}
                                  aria-label="Retirer"
                                  className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-red-400 hover:text-red-600"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {modal?.kind === 'form' && (
        <EquipementForm salleId={salleId} item={modal.item} onClose={() => setModal(null)} onDone={fini} />
      )}
      {modal?.kind === 'delete' && (
        <Overlay title="Retirer l'équipement" onClose={() => setModal(null)}>
          <RetirerEquipement salleId={salleId} item={modal.item} onClose={() => setModal(null)} onDone={fini} />
        </Overlay>
      )}
    </div>
  )
}

function EquipementForm({
  salleId, item, onClose, onDone,
}: { salleId: number; item: Equipement | null; onClose: () => void; onDone: (m: string) => void }) {
  const [form, setForm] = useState<EquipementInput>({
    nom: item?.nom ?? '',
    etat: item?.etat ?? 'BON',
    description: item?.description ?? '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!form.nom.trim()) return setError("Le nom de l'équipement est obligatoire")
    setBusy(true)
    try {
      if (item) await sallesApi.modifierEquipement(salleId, item.id, form)
      else await sallesApi.ajouterEquipement(salleId, form)
      onDone(item ? 'Équipement modifié' : 'Équipement ajouté')
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <Overlay title={item ? "Modifier l'équipement" : 'Ajouter un équipement'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>Nom</Label>
          <input className={inputCls} value={form.nom} placeholder="Ex. : Projecteur"
            onChange={(e) => setForm({ ...form, nom: e.target.value })} />
        </div>
        <div>
          <Label>État</Label>
          <select className={inputCls} value={form.etat}
            onChange={(e) => setForm({ ...form, etat: e.target.value as EquipementInput['etat'] })}>
            {ETATS_EQUIPEMENT.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
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

function RetirerEquipement({
  salleId, item, onClose, onDone,
}: { salleId: number; item: Equipement; onClose: () => void; onDone: (m: string) => void }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function confirmer() {
    setBusy(true)
    try {
      await sallesApi.retirerEquipement(salleId, item.id)
      onDone('Équipement retiré de la salle')
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Retirer <b>{item.nom}</b> de cette salle ?
      </p>
      <ErrorBox message={error} />
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className={btnGhost}>Annuler</button>
        <button onClick={confirmer} disabled={busy} className={btnDanger}>Retirer</button>
      </div>
    </div>
  )
}