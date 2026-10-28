import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Target, BookOpen, Mic, ListChecks, Trash2, CalendarDays, Coins, Tag, Users } from 'lucide-react'
import { Field, SelectField, Modal, Badge, ConfirmDialog } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { teacherData } from './helpers'
import { fmtDate, todayISO } from '../../utils/format'
import { READINGS } from '../../data/catalogs'

const TIPOS = { Quiz: [ListChecks, 'bg-lime/25 text-forest'], Reading: [BookOpen, 'bg-sky-100 text-sky-600'], Pronunciation: [Mic, 'bg-pink-100 text-pink-600'] }
const emptyQ = () => ({ q: '', opts: ['', '', ''], a: 0 })

function Ring({ pct }) {
  const r = 26, c = 2 * Math.PI * r
  return (
    <svg width="66" height="66" className="-rotate-90">
      <circle cx="33" cy="33" r={r} stroke="#eef0ec" strokeWidth="7" fill="none" />
      <motion.circle cx="33" cy="33" r={r} stroke="#badb24" strokeWidth="7" fill="none" strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c - (c * pct) / 100 }} transition={{ duration: 1.1, ease: 'easeOut' }} />
      <text x="33" y="38" textAnchor="middle" className="rotate-90 fill-ink text-[13px] font-bold" style={{ transformOrigin: '33px 33px' }}>{pct}%</text>
    </svg>
  )
}

export default function Misiones() {
  const { db, user, api, toast } = useApp()
  const t = teacherData(db, user)
  const [form, setForm] = useState(null)
  const [del, setDel] = useState(null)
  const [busy, setBusy] = useState(false)
  const set = (p) => setForm((f) => ({ ...f, ...p }))

  const open = () => {
    const d = new Date(); d.setDate(d.getDate() + 3)
    setForm({ titulo: '', tipo: 'Quiz', grupoId: t.grupos[0]?.id, alumnos: [], fechaLimite: d.toISOString().slice(0, 10), recompensa: 5, xp: 50, preguntas: [emptyQ()], lectura: '', palabras: '' })
  }
  const grupo = form && db.grupos.find((g) => g.id === Number(form.grupoId))
  const save = async () => {
    if (!form.titulo) { toast('Ponle un nombre a la misión', 'warn'); return }
    const preguntas = form.preguntas.filter((q) => q.q && q.opts.every((o) => o))
    if (form.tipo !== 'Pronunciation' && !preguntas.length) { toast('Agrega al menos una pregunta completa', 'warn'); return }
    setBusy(true)
    await api.misiones.create({ ...form, grupoId: Number(form.grupoId), recompensa: Number(form.recompensa), xp: Number(form.xp), preguntas, palabras: form.palabras.split(',').map((w) => w.trim()).filter(Boolean), creada: todayISO(), completadas: {} })
    setBusy(false); setForm(null); toast('Misión asignada 🚀 Los alumnos ya la ven en Learnmon')
  }
  const updQ = (i, p) => set({ preguntas: form.preguntas.map((q, j) => (j === i ? { ...q, ...p } : q)) })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-extrabold">Misiones</motion.h2>
          <p className="text-sm text-black/50">Las tareas no son tareas: son misiones que el alumno juega en casa.</p>
        </div>
        <button onClick={open} className="btn-lime ml-auto !py-2.5 text-sm"><Plus size={16} /> Nueva misión</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        <AnimatePresence>
          {t.misiones.slice().reverse().map((m, i) => {
            const [I, c] = TIPOS[m.tipo]
            const dest = t.destinatarios(m)
            const hechas = Object.keys(m.completadas).filter((k) => dest.includes(Number(k)))
            const pct = dest.length ? Math.round((hechas.length / dest.length) * 100) : 0
            const g = db.grupos.find((x) => x.id === m.grupoId)
            const avg = hechas.length ? Math.round(hechas.reduce((s, k) => s + m.completadas[k], 0) / hechas.length) : null
            return (
              <motion.div key={m.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .9 }} transition={{ delay: i * .05 }} className="card p-5">
                <div className="flex items-start gap-3">
                  <span className={`grid h-11 w-11 place-items-center rounded-2xl ${c}`}><I size={20} /></span>
                  <div className="flex-1">
                    <p className="font-display text-lg font-bold leading-tight">{m.titulo}</p>
                    <p className="text-xs text-black/45">{g?.nombre} · {m.alumnos?.length ? `${m.alumnos.length} alumno(s)` : 'Todo el grupo'} · vence {fmtDate(m.fechaLimite)}</p>
                  </div>
                  <button onClick={() => setDel(m)} className="text-black/25 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <Ring pct={pct} />
                  <div className="space-y-1 text-sm">
                    <p><b>{hechas.length}</b>/{dest.length} completada(s)</p>
                    <p className="text-black/50">Promedio: <b className="text-forest">{avg === null ? '—' : `${avg}%`}</b></p>
                    <div className="flex gap-1.5"><Badge tone="yellow"><Coins size={11} /> {m.recompensa} L$</Badge><Badge tone="gray">{m.xp} XP</Badge><Badge tone="gray">{m.tipo}</Badge></div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <div className="card p-6">
        <p className="mb-3 font-display text-lg font-extrabold">📚 Recomendar lecturas de Reading Tree</p>
        <div className="flex flex-wrap gap-3">
          {READINGS.map((r) => (
            <button key={r.id} onClick={() => toast(`"${r.titulo}" recomendada a tus grupos 📖`)} className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-lime">
              <span className="text-2xl">{r.emoji}</span><span><span className="block text-sm font-bold">{r.titulo}</span><span className="text-xs text-black/45">{r.nivel} · {r.min} min</span></span>
            </button>
          ))}
        </div>
      </div>

      <Modal open={!!form} onClose={() => setForm(null)} title="Nueva misión" width="max-w-2xl" dirty={!!form?.titulo}
        footer={(close) => <div className="flex gap-3"><button onClick={close} className="btn-ghost flex-1">Cancelar</button><button onClick={save} disabled={busy} className="btn-lime flex-1">{busy ? 'Asignando…' : 'Asignar misión'}</button></div>}>
        {form && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(TIPOS).map(([k, [I]]) => (
                <button key={k} onClick={() => set({ tipo: k })} className={`flex flex-col items-center gap-1 rounded-2xl py-3 text-xs font-bold transition ${form.tipo === k ? 'bg-lime shadow-lime' : 'bg-black/5 text-black/50'}`}><I size={20} />{k}</button>
              ))}
            </div>
            <Field label="Nombre de la misión" icon={Tag} value={form.titulo} onChange={(v) => set({ titulo: v })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField label="Grupo" icon={Users} value={form.grupoId} onChange={(v) => set({ grupoId: Number(v), alumnos: [] })} options={t.grupos.map((g) => ({ value: g.id, label: g.nombre }))} />
              <Field label="Fecha límite" icon={CalendarDays} type="date" value={form.fechaLimite} onChange={(v) => set({ fechaLimite: v })} />
              <Field label="Recompensa (Lemon Dollars)" icon={Coins} type="number" value={form.recompensa} onChange={(v) => set({ recompensa: v })} />
              <Field label="Experiencia (XP)" icon={Target} type="number" value={form.xp} onChange={(v) => set({ xp: v })} />
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-forest-dark">Enviar a</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => set({ alumnos: [] })} className={`chip px-3 py-1.5 ${!form.alumnos.length ? 'bg-forest text-white' : 'bg-black/5'}`}>Todo el grupo</button>
                {grupo && db.usuarios.filter((u) => grupo.alumnos.includes(u.id)).map((u) => {
                  const on = form.alumnos.includes(u.id)
                  return <button key={u.id} onClick={() => set({ alumnos: on ? form.alumnos.filter((x) => x !== u.id) : [...form.alumnos, u.id] })} className={`chip px-3 py-1.5 ${on ? 'bg-lime text-ink' : 'bg-black/5 text-black/60'}`}>{u.nombre.split(' ')[0]} {u.apPaterno[0]}.</button>
                })}
              </div>
            </div>
            {form.tipo === 'Reading' && <textarea value={form.lectura} onChange={(e) => set({ lectura: e.target.value })} placeholder="Pega aquí la lectura en inglés…" rows={4} className="w-full rounded-2xl border border-black/10 p-4 text-sm outline-none focus:border-lime" />}
            {form.tipo === 'Pronunciation'
              ? <Field label="Palabras a practicar (separadas por coma)" icon={Mic} value={form.palabras} onChange={(v) => set({ palabras: v })} hint="Ej. think, three, mother" />
              : (
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-forest-dark">Preguntas</p>
                  {form.preguntas.map((q, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 rounded-2xl bg-sage-soft p-3">
                      <input value={q.q} onChange={(e) => updQ(i, { q: e.target.value })} placeholder={`Pregunta ${i + 1}`} className="w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold outline-none" />
                      {q.opts.map((o, j) => (
                        <label key={j} className="flex items-center gap-2">
                          <input type="radio" checked={q.a === j} onChange={() => updQ(i, { a: j })} className="accent-lime" />
                          <input value={o} onChange={(e) => updQ(i, { opts: q.opts.map((x, k) => (k === j ? e.target.value : x)) })} placeholder={`Opción ${j + 1}${q.a === j ? ' (correcta)' : ''}`} className={`flex-1 rounded-xl px-3 py-1.5 text-sm outline-none ${q.a === j ? 'bg-lime/30' : 'bg-white'}`} />
                        </label>
                      ))}
                    </motion.div>
                  ))}
                  <button onClick={() => set({ preguntas: [...form.preguntas, emptyQ()] })} className="chip bg-white px-3 py-1.5 text-forest shadow-sm"><Plus size={13} /> Agregar pregunta</button>
                </div>
              )}
          </div>
        )}
      </Modal>
      <ConfirmDialog open={!!del} danger title="Eliminar misión" text={`¿Eliminar "${del?.titulo}"?`} confirmText="Eliminar" onCancel={() => setDel(null)} onConfirm={async () => { await api.misiones.remove(del.id); setDel(null); toast('Misión eliminada') }} />
    </div>
  )
}
