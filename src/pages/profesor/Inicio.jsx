import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts'
import { School, Users, Clock, Target, Siren, Hourglass, Star, Send, Coins, ChevronRight, CalendarClock } from 'lucide-react'
import { CountUp, Limmy, PhraseBanner, Section, Avatar, Badge } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { teacherData, proximasClases, isToday } from './helpers'
import { fullName, cap } from '../../utils/format'

const tone = {
  atencion: { Icon: Siren, card: 'border-red-200 bg-red-50', icon: 'bg-red-500 text-white', label: 'text-red-600' },
  misiones: { Icon: Hourglass, card: 'border-amber-200 bg-lemon-pale', icon: 'bg-lemon text-ink', label: 'text-amber-700' },
  sobresaliente: { Icon: Star, card: 'border-lime/50 bg-lime/10', icon: 'bg-lime text-ink', label: 'text-forest' },
}

export default function Inicio() {
  const { db, user, api, toast } = useApp()
  const navigate = useNavigate()
  const t = teacherData(db, user)
  const clases = proximasClases(t.grupos)
  const curso = (id) => db.cursos.find((c) => c.id === id)
  const chart = t.grupos.map((g) => {
    const al = db.usuarios.filter((u) => g.alumnos.includes(u.id))
    return { name: g.nombre, v: al.length ? Math.round(al.reduce((s, a) => s + a.progreso, 0) / al.length) : 0 }
  })
  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-forest-dark via-forest to-[#7a9c3a] p-7 text-white shadow-card">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-lime/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-6">
          <Limmy size={86} float />
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-lime">{new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <h2 className="font-display text-3xl font-extrabold">{saludo}, teacher {user.nombre}</h2>
            <p className="text-sm text-white/75">Tienes <b className="text-lime">{t.alertas.filter((a) => a.tipo !== 'sobresaliente').length} alumno(s)</b> que necesitan seguimiento y <b className="text-lime">{clases.filter((c) => isToday(c.when)).length} clase(s)</b> hoy.</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [School, 'Mis grupos', t.grupos.length, 'bg-lemon', 'text-forest-deep'],
          [Users, 'Alumnos', t.alumnos.length, 'bg-forest', 'text-white'],
          [Clock, 'Horas impartidas (mes)', user.horasMes || 0, 'bg-lime', 'text-forest-deep'],
          [Target, 'Misiones activas', t.misiones.length, 'bg-[#fff1a8]', 'text-forest-deep'],
        ].map(([I, l, v, bg, tx], i) => (
          <motion.div key={l} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 * i, type: 'spring', damping: 18 }} whileHover={{ y: -5 }}
            className={`relative overflow-hidden rounded-[24px] p-5 shadow-card ${bg} ${tx}`}>
            <I size={80} className="absolute -bottom-3 -right-2 opacity-10" />
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-black/10"><I size={20} /></span>
            <p className="mt-5 font-display text-4xl font-extrabold"><CountUp to={v} /></p>
            <p className="text-[11px] font-bold uppercase tracking-[.14em] opacity-80">{l}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Section title="Tu lista de hoy" right={<Badge tone="gray">Alertas inteligentes</Badge>} delay={.15}>
          <div className="space-y-3">
            <AnimatePresence>
              {t.alertas.map((al, i) => {
                const s = tone[al.tipo]
                const g = t.grupoDe(al.a.id)
                return (
                  <motion.div key={al.tipo + al.a.id} layout initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .2 + i * .06 }}
                    className={`flex flex-wrap items-center gap-3 rounded-2xl border p-3 ${s.card}`}>
                    <motion.span animate={al.tipo === 'atencion' ? { scale: [1, 1.12, 1] } : {}} transition={{ repeat: Infinity, duration: 1.6 }} className={`grid h-10 w-10 place-items-center rounded-xl ${s.icon}`}><s.Icon size={18} /></motion.span>
                    <Avatar u={al.a} size={34} />
                    <div className="min-w-[180px] flex-1">
                      <p className={`text-xs font-bold uppercase tracking-wider ${s.label}`}>{al.texto}</p>
                      <p className="text-sm font-semibold">{cap(fullName(al.a))} <span className="font-normal text-black/40">· {g?.nombre}</span></p>
                      <p className="text-xs text-black/50">{al.det}</p>
                    </div>
                    {al.tipo === 'sobresaliente'
                      ? <button onClick={async () => { await api.reconocimientos.lemonDollars(al.a.id, 5); toast(`+5 Lemon Dollars para ${al.a.nombre.split(' ')[0]}`) }} className="chip bg-lime px-3 py-1.5 text-ink"><Coins size={13} /> Dar 5 L$</button>
                      : <button onClick={() => toast(`Recordatorio enviado a ${al.a.nombre.split(' ')[0]} y su tutor`)} className="chip bg-white px-3 py-1.5 text-forest-dark shadow-sm"><Send size={13} /> Recordar</button>}
                    <button onClick={() => navigate(`/profesor/grupos?alumno=${al.a.id}`)} className="grid h-8 w-8 place-items-center rounded-lg bg-white/70 hover:bg-white"><ChevronRight size={16} /></button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            {!t.alertas.length && <p className="py-8 text-center text-sm text-black/50">Todo en orden. ¡Tus alumnos van excelente!</p>}
          </div>
        </Section>

        <div className="space-y-6">
          <Section title="Próximas clases" delay={.2}>
            <div className="relative space-y-3 pl-5 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-0.5 before:bg-sage">
              {clases.map((c, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .25 + i * .07 }} className="relative">
                  <span className={`absolute -left-[18px] top-3 h-3.5 w-3.5 rounded-full border-2 border-white ${i === 0 ? 'bg-lime ring-4 ring-lime/30' : 'bg-sage'}`} />
                  <div className={`rounded-2xl p-3 ${i === 0 ? 'bg-forest text-white' : 'bg-sage-soft'}`}>
                    <div className="flex items-center justify-between">
                      <p className="font-bold">{c.g.nombre} · {c.hora}</p>
                      <span className={`text-xs font-semibold ${i === 0 ? 'text-lime' : 'text-forest'}`}>{isToday(c.when) ? 'Hoy' : cap(c.when.toLocaleDateString('es-MX', { weekday: 'long' }))}</span>
                    </div>
                    <p className={`text-xs ${i === 0 ? 'text-white/70' : 'text-black/50'}`}>{curso(c.g.cursoId)?.nombre} · {c.g.alumnos.length} {c.g.alumnos.length === 1 ? 'alumno' : 'alumnos'}</p>
                  </div>
                </motion.div>
              ))}
              {!clases.length && <p className="text-sm text-black/50"><CalendarClock size={14} className="inline" /> Sin clases programadas.</p>}
            </div>
          </Section>
          <Section title="Progreso grupal" delay={.25}>
            <div className="h-48">
              <ResponsiveContainer>
                <BarChart data={chart} margin={{ left: -24, right: 8 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip cursor={{ fill: '#eef3dc' }} formatter={(v) => [`${v}%`, 'Progreso promedio']} contentStyle={{ borderRadius: 14, border: 'none' }} />
                  <Bar dataKey="v" radius={[12, 12, 4, 4]} animationDuration={1200}>{chart.map((_, i) => <Cell key={i} fill={i % 2 ? '#52723e' : '#badb24'} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>
      </div>
      <PhraseBanner />
    </div>
  )
}
