import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Pencil, Trash2, Power, GraduationCap, Hash, DollarSign, Clock, Plus } from 'lucide-react'
import { PhraseBanner, Field, Modal, ConfirmDialog, Badge } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { money } from '../../utils/format'

export default function Cursos() {
  const { db, api, toast } = useApp()
  const [form, setForm] = useState(null)
  const [orig, setOrig] = useState('')
  const [del, setDel] = useState(null)
  const [busy, setBusy] = useState(false)
  const set = (p) => setForm((f) => ({ ...f, ...p }))
  const open = (c) => { const f = c ? { ...c } : { nombre: '', tipo: 'Grupal', precio: '', edadMin: '', edadMax: '', horas: '', activo: true }; setForm(f); setOrig(JSON.stringify(f)) }
  const save = async () => {
    if (!form.nombre || !form.precio) { toast('Completa nombre y precio', 'warn'); return }
    setBusy(true)
    const data = { ...form, precio: Number(form.precio), edadMin: Number(form.edadMin) || 3, edadMax: Number(form.edadMax) || 99, horas: form.horas === null ? null : Number(form.horas) || null }
    if (form.id) await api.cursos.update(form.id, data); else await api.cursos.create(data)
    setBusy(false); setForm(null); toast(form.id ? 'Curso actualizado' : 'Curso registrado')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-extrabold">Gestión de Cursos</motion.h2>
        <button onClick={() => open()} className="btn-lime !py-2 text-sm"><Plus size={16} /> Registrar Curso</button>
      </div>
      <PhraseBanner />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <h3 className="mb-4 font-display text-lg font-extrabold">Listado Maestro de Cursos</h3>
        <div className="nice-scroll overflow-x-auto pb-2">
          <table className="w-full min-w-[900px]">
            <thead className="border-y-2 border-ink/80"><tr>{['Nombre curso', 'Tipo curso', 'Precio curso', 'Edad mín', 'Edad máx', 'Horas semanales', 'Acciones'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody>
              <AnimatePresence>
                {db.cursos.map((c, i) => (
                  <motion.tr key={c.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: i * .04 }} className={`border-b border-black/5 hover:bg-sage-soft/50 ${!c.activo ? 'opacity-50' : ''}`}>
                    <td className="td font-bold">{c.nombre}</td>
                    <td className="td"><Badge tone={c.tipo === 'Grupal' ? 'lime' : 'yellow'}>{c.tipo.toUpperCase()}</Badge></td>
                    <td className="td font-bold">{money(c.precio)}.00</td>
                    <td className="td text-black/60">{c.edadMin} años</td>
                    <td className="td text-black/60">{c.edadMax} años</td>
                    <td className="td text-black/60">{c.horas ? `${c.horas} hrs/sem` : 'Sin Especificar'}</td>
                    <td className="td"><div className="flex gap-1.5">
                      <button onClick={() => open(c)} className="icon-btn bg-black/5 text-forest"><Pencil size={15} /></button>
                      <button title="Activar/Desactivar" onClick={async () => { await api.cursos.update(c.id, { activo: !c.activo }); toast(c.activo ? 'Curso desactivado' : 'Curso activado') }} className={`icon-btn ${c.activo ? 'bg-lime text-ink' : 'bg-black/5'}`}><Power size={15} /></button>
                      <button onClick={() => setDel(c)} className="icon-btn bg-red-50 text-red-500"><Trash2 size={15} /></button>
                    </div></td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? 'Editar Curso' : 'Registrar Curso'} dirty={form && JSON.stringify(form) !== orig}
        footer={(close) => <div className="flex gap-3"><button onClick={close} className="btn-ghost flex-1">Cancelar</button><button onClick={save} disabled={busy} className="btn-lime flex-1">{busy ? 'Guardando…' : 'Guardar'}</button></div>}>
        {form && (
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-forest-dark">Tipo curso:</p>
            <div className="grid grid-cols-2 gap-2">
              {['Grupal', 'Personalizado'].map((t) => (
                <button key={t} onClick={() => set({ tipo: t })} className={`rounded-xl py-2.5 text-sm font-bold uppercase transition ${form.tipo === t ? 'bg-lime shadow-lime' : 'bg-black/5 text-black/50'}`}>{t}</button>
              ))}
            </div>
            <Field label="Nombre curso (MAYÚSCULAS)" icon={GraduationCap} value={form.nombre} onChange={(v) => set({ nombre: v.toUpperCase() })} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Edad mínima (1-99 años)" icon={Hash} type="number" value={form.edadMin} onChange={(v) => set({ edadMin: v })} />
              <Field label="Edad máxima (1-99 años)" icon={Hash} type="number" value={form.edadMax} onChange={(v) => set({ edadMax: v })} />
            </div>
            <Field label="Precio mensual ($) (máx 10 dígitos)" icon={DollarSign} type="number" value={form.precio} onChange={(v) => set({ precio: v.slice(0, 10) })} />
            <div className="flex items-center gap-3">
              <Field className="flex-1" label="Horas semanales" icon={Clock} type="number" value={form.horas ?? ''} locked={form.horas === null} onChange={(v) => set({ horas: v })} />
              <label className="flex items-center gap-2 text-xs font-bold uppercase"><input type="checkbox" checked={form.horas === null} onChange={(e) => set({ horas: e.target.checked ? null : '' })} className="h-5 w-5 accent-lime" /> Sin especificar</label>
            </div>
          </div>
        )}
      </Modal>
      <ConfirmDialog open={!!del} danger title="Eliminar curso" text={`¿Eliminar ${del?.nombre}?`} confirmText="Eliminar" loading={busy}
        onCancel={() => setDel(null)} onConfirm={async () => { setBusy(true); await api.cursos.remove(del.id); setBusy(false); setDel(null); toast('Curso eliminado') }} />
    </div>
  )
}
