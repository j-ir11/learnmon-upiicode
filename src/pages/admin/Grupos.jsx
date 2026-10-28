import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, Pencil, Trash2, Users, UserRound, GraduationCap, CalendarDays, Plus, X } from 'lucide-react'
import { PhraseBanner, Field, SelectField, Modal, ConfirmDialog } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { age, fmtDate, todayISO } from '../../utils/format'

export default function Grupos() {
  const { db, api, toast } = useApp()
  const [q, setQ] = useState('')
  const [form, setForm] = useState(null)
  const [orig, setOrig] = useState('')
  const [del, setDel] = useState(null)
  const [busy, setBusy] = useState(false)
  const [adding, setAdding] = useState(false)
  const profes = db.usuarios.filter((u) => u.rol === 'Profesor' && u.estado)
  const prof = (id) => db.usuarios.find((u) => u.id === id)
  const curso = (id) => db.cursos.find((c) => c.id === id)
  const set = (p) => setForm((f) => ({ ...f, ...p }))

  const list = db.grupos.filter((g) => `${g.nombre} ${prof(g.profesorId)?.nombre} ${prof(g.profesorId)?.apPaterno} ${curso(g.cursoId)?.nombre}`.toLowerCase().includes(q.toLowerCase()))
  const open = (g) => { const f = g ? { ...g, alumnos: [...g.alumnos] } : { nombre: '', profesorId: profes[0]?.id, cursoId: db.cursos[0].id, fechaCreacion: todayISO(), alumnos: [], horario: [] }; setForm(f); setOrig(JSON.stringify(f)); setAdding(false) }
  const save = async () => {
    if (form.nombre.length < 3) { toast('El nombre del grupo debe tener 3-10 caracteres', 'warn'); return }
    setBusy(true)
    const data = { ...form, profesorId: Number(form.profesorId), cursoId: Number(form.cursoId) }
    if (form.id) await api.grupos.update(form.id, data); else await api.grupos.create(data)
    setBusy(false); setForm(null); toast(form.id ? 'Grupo actualizado' : 'Grupo creado')
  }
  const disponibles = form ? db.usuarios.filter((u) => u.rol === 'Alumno' && u.estado && !form.alumnos.includes(u.id) && !db.grupos.some((g) => g.id !== form.id && g.alumnos.includes(u.id))) : []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-extrabold">Gestión de Grupos</motion.h2>
        <button onClick={() => open()} className="btn-lime !py-2 text-sm"><Plus size={16} /> Crear Grupo</button>
      </div>
      <PhraseBanner />
      <label className="card flex items-center gap-3 px-5 py-4 focus-within:ring-4 focus-within:ring-lime/15">
        <Search size={18} className="text-lime-dark" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Búsqueda Spotlight (Grupos, Profesor o Curso)" className="w-full bg-transparent outline-none placeholder:text-black/70" />
      </label>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <h3 className="mb-4 font-display text-lg font-extrabold">Administrar Grupos de Cursos</h3>
        <div className="nice-scroll overflow-x-auto pb-2">
          <table className="w-full min-w-[860px]">
            <thead className="border-y-2 border-ink/80"><tr>{['Nombre de grupo', 'Alumnos inscritos', 'Profesor', 'Horario', 'Fecha creación', 'Curso impartido', 'Acciones'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody>
              <AnimatePresence>
                {list.map((g, i) => (
                  <motion.tr key={g.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: i * .04 }} className="border-b border-black/5 hover:bg-sage-soft/50">
                    <td className="td font-bold">{g.nombre}</td>
                    <td className="td"><span className="inline-flex items-center gap-1.5 font-bold"><Users size={15} className="text-lime-dark" />{g.alumnos.length}</span></td>
                    <td className="td uppercase text-black/60">{prof(g.profesorId)?.nombre} {prof(g.profesorId)?.apPaterno}</td>
                    <td className="td text-black/60">{g.horario?.map((h) => `${h.dia.slice(0, 3)} ${h.hora}`).join(' · ') || '—'}</td>
                    <td className="td text-black/60">{fmtDate(g.fechaCreacion)}</td>
                    <td className="td uppercase text-black/60">{curso(g.cursoId)?.nombre}</td>
                    <td className="td"><div className="flex gap-1.5">
                      <button onClick={() => open(g)} className="icon-btn bg-black/5 text-forest"><Pencil size={15} /></button>
                      <button onClick={() => setDel(g)} className="icon-btn bg-red-50 text-red-500"><Trash2 size={15} /></button>
                    </div></td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      <Modal open={!!form} onClose={() => setForm(null)} width={form?.id ? 'max-w-3xl' : 'max-w-lg'} title={form?.id ? `Editar Grupo: ${form.nombre}` : 'Crear Nuevo Grupo de Curso'} dirty={form && JSON.stringify(form) !== orig}
        footer={(close) => <div className="flex gap-3"><button onClick={close} className="btn-ghost flex-1">Cancelar</button><button onClick={save} disabled={busy} className="btn-lime flex-1">{busy ? 'Guardando…' : form?.id ? 'Guardar Cambios' : 'Crear Grupo'}</button></div>}>
        {form && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-sage-soft p-4">
              <div className="mb-3 flex justify-between text-xs font-bold uppercase tracking-wider text-forest-dark"><span>Datos del grupo (editable)</span>{form.id && <span>Alumnos: {form.alumnos.length}</span>}</div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nombre de grupo (3-10 caracteres)" icon={Users} value={form.nombre} onChange={(v) => set({ nombre: v.toUpperCase().slice(0, 10) })} />
                <SelectField label="Profesor" icon={UserRound} value={form.profesorId} onChange={(v) => set({ profesorId: Number(v) })} options={profes.map((p) => ({ value: p.id, label: `${p.nombre} ${p.apPaterno}`.toUpperCase() }))} />
                <SelectField label="Curso impartido" icon={GraduationCap} value={form.cursoId} onChange={(v) => set({ cursoId: Number(v) })} options={db.cursos.map((c) => ({ value: c.id, label: c.nombre }))} />
                <Field label="Fecha creación (solo lectura)" icon={CalendarDays} value={fmtDate(form.fechaCreacion)} locked />
              </div>
            </div>
            {form.id && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-bold text-forest-dark">Alumnos en Grupo</p>
                  <button onClick={() => setAdding((a) => !a)} className="chip bg-lime px-3 py-1.5 text-ink"><Plus size={13} /> Agregar Alumno</button>
                </div>
                <AnimatePresence>
                  {adding && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="mb-3 flex flex-wrap gap-2 rounded-2xl border border-dashed border-lime p-3">
                        {disponibles.length ? disponibles.map((u) => (
                          <button key={u.id} onClick={() => set({ alumnos: [...form.alumnos, u.id] })} className="chip bg-white px-3 py-1.5 text-forest-dark shadow-sm hover:bg-lime/30"><Plus size={12} /> {u.nombre} {u.apPaterno}</button>
                        )) : <p className="text-xs text-black/50">No hay alumnos disponibles sin grupo.</p>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="nice-scroll overflow-x-auto">
                  <table className="w-full min-w-[620px]">
                    <thead className="border-b-2 border-ink/70"><tr>{['Nombre alumno', 'Ap. Paterno', 'Ap. Materno', 'Matrícula', 'Correo', 'Edad', 'Módulo', ''].map((h) => <th key={h} className="th !py-2">{h}</th>)}</tr></thead>
                    <tbody>
                      <AnimatePresence>
                        {form.alumnos.map((id) => { const u = db.usuarios.find((x) => x.id === id); return (
                          <motion.tr key={id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="border-b border-black/5">
                            <td className="td !py-2 font-bold">{u.nombre}</td><td className="td !py-2 text-black/60">{u.apPaterno}</td><td className="td !py-2 text-black/60">{u.apMaterno}</td>
                            <td className="td !py-2">{u.matricula}</td><td className="td !py-2 text-sky-600">{u.correo}</td><td className="td !py-2">{age(u.fechaNac)}</td><td className="td !py-2">{u.modulo}</td>
                            <td className="td !py-2"><button onClick={() => set({ alumnos: form.alumnos.filter((x) => x !== id) })} className="text-red-500 hover:scale-110"><X size={16} /></button></td>
                          </motion.tr>) })}
                      </AnimatePresence>
                    </tbody>
                  </table>
                  {!form.alumnos.length && <p className="py-4 text-center text-sm text-black/50">Este grupo aún no tiene alumnos.</p>}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
      <ConfirmDialog open={!!del} danger title="Eliminar grupo" text={`¿Eliminar el grupo ${del?.nombre}? Los alumnos quedarán sin grupo asignado.`} confirmText="Eliminar" loading={busy}
        onCancel={() => setDel(null)} onConfirm={async () => { setBusy(true); await api.grupos.remove(del.id); setBusy(false); setDel(null); toast('Grupo eliminado') }} />
    </div>
  )
}
