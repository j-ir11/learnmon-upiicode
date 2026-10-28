import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Pencil, Trash2, Power, Tag, AlignLeft, Percent, CalendarDays, Layers } from 'lucide-react'
import { PhraseBanner, Field, SelectField, Modal, ConfirmDialog, Badge } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { money, todayISO } from '../../utils/format'

const blank = () => {
  const d = new Date(); d.setDate(d.getDate() + 30)
  return { titulo: '', descripcion: '', tipoPromo: 'Descuento General', tipoDesc: 'Porcentaje (%)', valor: '', inicio: todayISO(), fin: d.toISOString().slice(0, 10), activa: true }
}

export default function Promociones() {
  const { db, api, toast } = useApp()
  const [form, setForm] = useState(null)
  const [orig, setOrig] = useState('')
  const [del, setDel] = useState(null)
  const [busy, setBusy] = useState(false)
  const set = (p) => setForm((f) => ({ ...f, ...p }))

  const open = (p) => { const f = p ? { ...p } : blank(); setForm(f); setOrig(JSON.stringify(f)) }
  const save = async () => {
    if (!form.titulo || !form.valor) { toast('Completa título y valor del descuento', 'warn'); return }
    setBusy(true)
    const data = { ...form, valor: Number(form.valor) }
    if (form.id) await api.promociones.update(form.id, data); else await api.promociones.create(data)
    setBusy(false); setForm(null); toast(form.id ? 'Promoción actualizada' : 'Promoción creada y publicada 🎉')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-extrabold">Promociones y Descuentos</motion.h2>
          <p className="text-sm text-black/50">Gestiona ofertas, becas especiales y campañas de descuento para los alumnos.</p>
        </div>
        <button onClick={() => open()} className="btn-lime !py-2 text-sm">Nueva Promoción</button>
      </div>
      <PhraseBanner />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <h3 className="mb-4 font-display text-lg font-extrabold">Catálogo de Promociones</h3>
        <div className="nice-scroll overflow-x-auto pb-2">
          <table className="w-full min-w-[1000px]">
            <thead className="border-y-2 border-ink/80"><tr>{['Título', 'Descripción', 'Tipo promo', 'Tipo desc.', 'Valor', 'Fecha inicio', 'Fecha fin', 'Estado', 'Acciones'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody>
              <AnimatePresence>
                {db.promociones.map((p, i) => (
                  <motion.tr key={p.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: i * .04 }} className="border-b border-black/5 hover:bg-sage-soft/50">
                    <td className="td font-bold">{p.titulo}</td>
                    <td className="td max-w-[260px] truncate text-black/60">{p.descripcion}</td>
                    <td className="td"><Badge tone="green">{p.tipoPromo}</Badge></td>
                    <td className="td"><Badge tone="yellow">{p.tipoDesc}</Badge></td>
                    <td className="td font-bold">{p.tipoDesc.includes('%') ? `${p.valor}%` : money(p.valor)}</td>
                    <td className="td text-black/60">{p.inicio}</td>
                    <td className="td text-black/60">{p.fin}</td>
                    <td className="td"><Badge tone={p.activa ? 'lime' : 'red'}>{p.activa ? 'Activa' : 'Inactiva'}</Badge></td>
                    <td className="td"><div className="flex gap-1.5">
                      <button title="Activar/Desactivar" onClick={async () => { await api.promociones.update(p.id, { activa: !p.activa }); toast(p.activa ? 'Promoción desactivada' : 'Promoción activada') }} className={`icon-btn ${p.activa ? 'bg-lime text-ink' : 'bg-black/5'}`}><Power size={15} /></button>
                      <button onClick={() => open(p)} className="icon-btn bg-black/5 text-forest"><Pencil size={15} /></button>
                      <button onClick={() => setDel(p)} className="icon-btn bg-red-50 text-red-500"><Trash2 size={15} /></button>
                    </div></td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? 'Editar Promoción' : 'Registrar Nueva Promoción'} dirty={form && JSON.stringify(form) !== orig}
        footer={(close) => <div className="flex gap-3"><button onClick={close} className="btn-ghost flex-1">Cancelar</button><button onClick={save} disabled={busy} className="btn-lime flex-1">{busy ? 'Guardando…' : form?.id ? 'Guardar Cambios' : 'Crear Promoción'}</button></div>}>
        {form && (
          <div className="space-y-4">
            <Field label="Título" icon={Tag} value={form.titulo} onChange={(v) => set({ titulo: v })} />
            <Field label="Descripción" icon={AlignLeft} value={form.descripcion} onChange={(v) => set({ descripcion: v })} />
            <SelectField label="Tipo de Promoción" icon={Layers} value={form.tipoPromo} onChange={(v) => set({ tipoPromo: v })} options={['Descuento General', 'Inscripción $0', 'Beca', 'Pago adelantado', 'Hermanos']} />
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label="Tipo de descuento" value={form.tipoDesc} onChange={(v) => set({ tipoDesc: v })} options={['Porcentaje (%)', 'Monto Fijo ($)']} />
              <Field label="Valor del Descuento" icon={Percent} type="number" value={form.valor} onChange={(v) => set({ valor: v })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Fecha de Inicio" icon={CalendarDays} type="date" value={form.inicio} onChange={(v) => set({ inicio: v })} />
              <Field label="Fecha de Fin" icon={CalendarDays} type="date" value={form.fin} onChange={(v) => set({ fin: v })} />
            </div>
          </div>
        )}
      </Modal>
      <ConfirmDialog open={!!del} danger title="Eliminar promoción" text={`¿Eliminar "${del?.titulo}"? Esta acción no se puede deshacer.`} confirmText="Eliminar" loading={busy}
        onCancel={() => setDel(null)} onConfirm={async () => { setBusy(true); await api.promociones.remove(del.id); setBusy(false); setDel(null); toast('Promoción eliminada') }} />
    </div>
  )
}
