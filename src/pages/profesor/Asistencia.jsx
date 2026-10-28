import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Clock3, X, CheckCheck, Save, CalendarDays } from 'lucide-react'
import { Segmented, Avatar, Section, Badge } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { teacherData } from './helpers'
import { fullName, cap, todayISO, fmtLong } from '../../utils/format'

const OPTS = [
  { k: 'P', label: 'Presente', Icon: Check, on: 'bg-lime text-ink shadow-lime' },
  { k: 'R', label: 'Retardo', Icon: Clock3, on: 'bg-lemon text-ink' },
  { k: 'A', label: 'Falta', Icon: X, on: 'bg-red-500 text-white' },
]

export default function Asistencia() {
  const { db, user, api, toast } = useApp()
  const t = teacherData(db, user)
  const [gid, setGid] = useState(t.grupos[0]?.id)
  const [fecha, setFecha] = useState(todayISO())
  const [reg, setReg] = useState({})
  const [saving, setSaving] = useState(false)
  const g = t.grupos.find((x) => x.id === gid)
  const alumnos = g ? db.usuarios.filter((u) => g.alumnos.includes(u.id)) : []

  useEffect(() => {
    const ex = db.asistencias.find((a) => a.grupoId === gid && a.fecha === fecha)
    setReg(ex ? { ...ex.registros } : {})
  }, [gid, fecha]) // eslint-disable-line

  const count = (k) => Object.values(reg).filter((v) => v === k).length
  const done = alumnos.every((a) => reg[a.id])
  const save = async () => {
    if (!done) { toast('Marca la asistencia de todos los alumnos', 'warn'); return }
    setSaving(true); await api.asistencia.guardar(gid, fecha, reg); setSaving(false)
    toast(`Asistencia de ${g.nombre} guardada · +2 h registradas`)
  }
  const historial = db.asistencias.filter((a) => a.grupoId === gid).sort((a, b) => b.fecha.localeCompare(a.fecha))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-extrabold">Pase de lista</motion.h2>
        {t.grupos.length > 0 && <Segmented options={t.grupos.map((x) => x.nombre)} value={g?.nombre} onChange={(n) => setGid(t.grupos.find((x) => x.nombre === n).id)} />}
        <label className="relative ml-auto flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 shadow-sm">
          <CalendarDays size={17} className="text-lime-dark" />
          <input type="date" value={fecha} max={todayISO()} onChange={(e) => setFecha(e.target.value)} className="bg-transparent text-sm font-semibold outline-none" />
        </label>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Section title={cap(fmtLong(fecha))} right={<button onClick={() => setReg(Object.fromEntries(alumnos.map((a) => [a.id, 'P'])))} className="chip bg-sage-soft px-3 py-1.5 text-forest-dark hover:bg-lime/30"><CheckCheck size={14} /> Todos presentes</button>}>
          <div className="divide-y divide-black/5">
            {alumnos.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .05 }} className="flex flex-wrap items-center gap-3 py-3">
                <span className="w-5 text-sm font-bold text-black/30">{i + 1}</span>
                <Avatar u={a} size={40} />
                <div className="min-w-[160px] flex-1"><p className="font-semibold">{cap(fullName(a))}</p><p className="text-xs text-black/45">{a.matricula}</p></div>
                <div className="flex gap-1.5 rounded-2xl bg-black/[.04] p-1">
                  {OPTS.map((o) => (
                    <motion.button key={o.k} whileTap={{ scale: .9 }} onClick={() => setReg((r) => ({ ...r, [a.id]: o.k }))}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${reg[a.id] === o.k ? o.on : 'text-black/45 hover:bg-white'}`}>
                      <o.Icon size={14} /> <span className="hidden sm:inline">{o.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
          <button onClick={save} disabled={saving} className="btn-lime mt-5 w-full !py-3"><Save size={17} /> {saving ? 'Guardando…' : 'Guardar asistencia'}</button>
        </Section>

        <div className="space-y-6">
          <div className="card p-6">
            <p className="mb-4 font-display text-lg font-extrabold">Resumen</p>
            {OPTS.map((o) => (
              <div key={o.k} className="mb-3 flex items-center gap-3">
                <span className={`grid h-9 w-9 place-items-center rounded-xl ${o.on}`}><o.Icon size={16} /></span>
                <span className="flex-1 text-sm font-semibold">{o.label}</span>
                <AnimatePresence mode="popLayout"><motion.span key={count(o.k)} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-2xl font-extrabold">{count(o.k)}</motion.span></AnimatePresence>
              </div>
            ))}
            <div className="mt-4 rounded-2xl bg-sage-soft p-3 text-center text-sm"><b>{user.horasMes || 0} h</b> impartidas este mes</div>
          </div>
          <div className="card p-6">
            <p className="mb-3 font-display text-lg font-extrabold">Historial</p>
            {historial.map((h) => {
              const v = Object.values(h.registros)
              return (
                <button key={h.id} onClick={() => setFecha(h.fecha)} className="mb-2 flex w-full items-center justify-between rounded-xl bg-black/[.03] px-3 py-2 text-left text-sm hover:bg-sage-soft">
                  <span className="font-semibold">{h.fecha}</span>
                  <span className="flex gap-1"><Badge>{v.filter((x) => x === 'P').length} P</Badge><Badge tone="red">{v.filter((x) => x === 'A').length} F</Badge></span>
                </button>
              )
            })}
            {!historial.length && <p className="text-sm text-black/50">Sin registros.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
