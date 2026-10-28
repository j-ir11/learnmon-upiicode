import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Coins, Target, NotebookPen, Send, Users } from 'lucide-react'
import { Modal, Progress, Avatar, Badge, Segmented } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { teacherData } from './helpers'
import { fullName, cap, age, todayISO } from '../../utils/format'
import { INSIGNIAS } from '../../data/catalogs'
import { InsIcon } from '../../components/icons'

const asis = { P: ['Presente', 'lime'], R: ['Retardo', 'yellow'], A: ['Falta', 'red'] }

export default function Grupos() {
  const { db, user, api, toast } = useApp()
  const [params] = useSearchParams()
  const t = teacherData(db, user)
  const pre = Number(params.get('alumno'))
  const [gid, setGid] = useState(() => (pre && t.grupoDe(pre)?.id) || t.grupos[0]?.id)
  const [sel, setSel] = useState(pre || null)
  const [nota, setNota] = useState('')
  const g = t.grupos.find((x) => x.id === gid)
  const alumnos = g ? db.usuarios.filter((u) => g.alumnos.includes(u.id)) : []
  const a = db.usuarios.find((u) => u.id === sel)
  const curso = g && db.cursos.find((c) => c.id === g.cursoId)

  const addNota = async () => {
    if (!nota.trim()) return
    await api.observaciones.create({ alumnoId: a.id, profesorId: user.id, texto: nota.trim(), fecha: todayISO() })
    setNota(''); toast('Observación registrada en el expediente')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-extrabold">Mis Grupos</motion.h2>
        {t.grupos.length > 0 && <Segmented options={t.grupos.map((x) => x.nombre)} value={g?.nombre} onChange={(n) => setGid(t.grupos.find((x) => x.nombre === n).id)} />}
      </div>

      {g && (
        <motion.div key={g.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-6 rounded-[26px] bg-gradient-to-r from-sage to-sage-soft p-5">
          <div><p className="text-xs font-bold uppercase tracking-wider text-forest-dark/70">Curso</p><p className="font-display text-lg font-bold">{curso?.nombre}</p></div>
          <div><p className="text-xs font-bold uppercase tracking-wider text-forest-dark/70">Horario</p><p className="font-semibold">{g.horario.map((h) => `${h.dia} ${h.hora}`).join(' · ')}</p></div>
          <div><p className="text-xs font-bold uppercase tracking-wider text-forest-dark/70">Alumnos</p><p className="font-semibold"><Users size={15} className="inline" /> {g.alumnos.length}</p></div>
          <button onClick={() => toast(`Mensaje enviado al grupo ${g.nombre}`)} className="btn-lime ml-auto !py-2 text-sm"><Send size={15} /> Mensaje al grupo</button>
        </motion.div>
      )}

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {alumnos.map((u, i) => {
            const pend = t.pendientesDe(u.id).length
            const ult = t.ultimaAsistencia(u.id)
            return (
              <motion.button layout key={u.id} initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .9 }} transition={{ delay: i * .05 }} whileHover={{ y: -4 }}
                onClick={() => setSel(u.id)} className="card p-5 text-left">
                <div className="flex items-center gap-3">
                  <Avatar u={u} size={46} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{cap(fullName(u))}</p>
                    <p className="text-xs text-black/45">{u.matricula} · {age(u.fechaNac)} años · {u.nivel}</p>
                  </div>
                  {ult && <Badge tone={asis[ult][1]}>{asis[ult][0]}</Badge>}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-semibold text-black/50"><span>Progreso del módulo</span><span className="text-forest">{u.progreso}%</span></div>
                <Progress value={u.progreso} className="mt-1" color={u.progreso >= 80 ? 'bg-forest' : u.progreso < 25 ? 'bg-orange-400' : 'bg-lime'} />
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-sage-soft py-2"><Flame size={14} className="mx-auto text-orange-500" /><p className="text-sm font-bold">{u.racha}</p><p className="text-[10px] text-black/45">racha</p></div>
                  <div className="rounded-xl bg-lemon-pale py-2"><Coins size={14} className="mx-auto text-amber-500" /><p className="text-sm font-bold">{u.lemonDollars}</p><p className="text-[10px] text-black/45">Lemon $</p></div>
                  <div className={`rounded-xl py-2 ${pend ? 'bg-red-50' : 'bg-lime/15'}`}><Target size={14} className={`mx-auto ${pend ? 'text-red-500' : 'text-forest'}`} /><p className="text-sm font-bold">{pend}</p><p className="text-[10px] text-black/45">pendientes</p></div>
                </div>
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>

      <Modal open={!!a} onClose={() => setSel(null)} title="Seguimiento académico" width="max-w-2xl">
        {a && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 rounded-2xl bg-forest p-4 text-white">
              <Avatar u={a} size={56} className="!bg-white" />
              <div className="flex-1"><p className="font-display text-xl font-bold">{cap(fullName(a))}</p><p className="text-sm text-lime">{a.nivel} · Módulo {a.modulo} · {a.xp} XP</p></div>
              <div className="text-right"><p className="font-display text-3xl font-extrabold">{a.progreso}%</p><p className="text-xs text-white/60">progreso</p></div>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-forest-dark">Resultados de misiones</p>
              <div className="space-y-2">
                {t.misiones.filter((m) => t.destinatarios(m).includes(a.id)).map((m) => {
                  const sc = m.completadas[a.id]
                  return (
                    <div key={m.id} className="flex items-center gap-3 rounded-xl bg-black/[.03] px-3 py-2 text-sm">
                      <Target size={15} className="text-lime-dark" /><span className="flex-1 font-semibold">{m.titulo}</span><Badge tone="gray">{m.tipo}</Badge>
                      {sc === undefined ? <Badge tone="yellow">Pendiente</Badge> : <Badge tone={sc >= 70 ? 'lime' : 'orange'}>{sc}%</Badge>}
                    </div>
                  )
                })}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-forest-dark">Insignias</p>
              <div className="flex flex-wrap gap-2">
                {INSIGNIAS.map((ins) => {
                  const has = a.insignias.includes(ins.key)
                  return (
                    <motion.button whileTap={{ scale: .9 }} key={ins.key} disabled={has} onClick={async () => { await api.reconocimientos.insignia(a.id, ins.key); toast(`Insignia "${ins.name}" otorgada`) }}
                      className={`chip px-3 py-1.5 text-xs ${has ? 'bg-lime/30 text-forest-dark' : 'border border-dashed border-black/20 bg-white text-black/45 hover:border-lime hover:text-forest'}`}><InsIcon k={ins.key} size={13} /> {ins.name}</motion.button>
                  )
                })}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-forest-dark"><NotebookPen size={15} className="inline" /> Observaciones académicas</p>
              <div className="space-y-2">
                {db.observaciones.filter((o) => o.alumnoId === a.id).map((o) => <div key={o.id} className="rounded-xl bg-sage-soft p-3 text-sm">{o.texto}<p className="mt-1 text-xs text-black/40">{o.fecha}</p></div>)}
              </div>
              <div className="mt-2 flex gap-2">
                <input value={nota} onChange={(e) => setNota(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addNota()} placeholder="Escribe una nota sobre su progreso…" className="flex-1 rounded-2xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-lime focus:ring-4 focus:ring-lime/15" />
                <button onClick={addNota} className="btn-lime !py-2 text-sm">Guardar</button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
