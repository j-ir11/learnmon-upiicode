import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { Flame, Coins, Target, BookOpen, Mic, ListChecks, ChevronRight, Gift, Clock } from 'lucide-react'
import { Limmy, CountUp } from '../../components/ui'
import Tree, { stageOf } from './Tree'
import MissionPlayer from './MissionPlayer'
import { useStudent } from './useStudent'
import { daysLeftInMonth, fmtDate, isBirthday } from '../../utils/format'
import { INSIGNIAS, LIMMYS, READINGS } from '../../data/catalogs'
import { InsIcon } from '../../components/icons'
import { TENANT } from '../../config/tenant'

export const TIPO_ICON = { Quiz: [ListChecks, 'bg-lime text-ink'], Reading: [BookOpen, 'bg-sky-400 text-white'], Pronunciation: [Mic, 'bg-pink-400 text-white'] }

export default function Inicio() {
  const s = useStudent()
  const { user } = s
  const navigate = useNavigate()
  const st = stageOf(user.xp)
  const bday = isBirthday(user.fechaNac)
  const fired = useRef(false)
  useEffect(() => {
    if (bday && !fired.current) { fired.current = true; setTimeout(() => confetti({ particleCount: 120, spread: 100, origin: { y: .3 }, colors: ['#badb24', '#f5d005', '#ff8fb1', '#52723e'] }), 700) }
  }, [bday])
  const week = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
  const todayIdx = (new Date().getDay() + 6) % 7
  const msgs = [
    `¡Hola ${user.nombre.split(' ')[0].toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}! Tienes ${s.pendientes.length} misión(es) esperándote.`,
    user.racha ? `¡Llevas ${user.racha} días de racha! No la pierdas hoy` : 'Empieza una racha hoy completando una misión',
  ]

  return (
    <div className="space-y-6">
      {/* Saludo */}
      <AnimatePresence>
        {bday ? (
          <motion.div initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} className="relative overflow-hidden rounded-[30px] bg-gradient-to-r from-[#ff9ec0] via-lemon to-lime p-6 shadow-card">
            <div className="flex flex-wrap items-center gap-5">
              <Limmy size={90} float acc="cake" />
              <div className="flex-1">
                <p className="font-display text-3xl font-extrabold text-ink">¡Feliz cumpleaños, {user.nombre.split(' ')[0].toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}!</p>
                <p className="text-sm font-semibold text-ink/70">Toda la familia {TENANT.name} te desea un día brillante. Aquí va tu regalo:</p>
              </div>
              <motion.div animate={{ rotate: [0, -3, 3, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="rounded-2xl border-2 border-dashed border-ink/40 bg-white/70 px-5 py-3 text-center">
                <Gift className="mx-auto text-pink-500" /><p className="font-display text-lg font-extrabold">10% en tu mensualidad</p><p className="text-xs font-bold tracking-widest text-black/50">CUPÓN: LEMONBDAY</p>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-4">
            <Limmy size={84} float />
            <div className="relative mb-4 rounded-3xl rounded-bl-md border-2 border-black/5 bg-white px-5 py-3 shadow-sm">
              {msgs.map((m, i) => <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .3 + i * .5 }} className={i ? 'text-sm text-black/50' : 'font-display text-lg font-bold'}>{m}</motion.p>)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        {/* Árbol */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card relative overflow-hidden p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-xs font-bold uppercase tracking-widest text-black/40">Mi árbol</p><p className="font-display text-2xl font-extrabold text-forest">{st.name}</p></div>
            <span className="chip bg-lime/25 !text-sm text-forest">{user.xp} XP</span>
          </div>
          <div className="flex justify-center"><Tree xp={user.xp} /></div>
          <div className="mt-1">
            <div className="flex justify-between text-xs font-semibold text-black/50"><span>{st.next ? `Faltan ${st.toNext} XP para ${st.next}` : '¡Tu árbol está al máximo!'}</span><span>{st.pct}%</span></div>
            <div className="mt-1 h-3 overflow-hidden rounded-full bg-black/5"><motion.div className="h-full rounded-full bg-gradient-to-r from-lime to-forest" initial={{ width: 0 }} animate={{ width: `${st.pct}%` }} transition={{ duration: 1.2, delay: .5 }} /></div>
          </div>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }} className="rounded-[26px] bg-gradient-to-br from-lemon to-[#f8e04a] p-5 shadow-card">
            <Coins className="text-[#7a6500]" />
            <p className="mt-2 font-display text-4xl font-extrabold text-ink"><CountUp to={user.lemonDollars} /></p>
            <p className="text-xs font-bold uppercase tracking-widest text-ink/60">Lemon Dollars</p>
            <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-ink/60"><Clock size={12} /> Canjéalos antes de {daysLeftInMonth()} días</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 }} className="rounded-[26px] bg-white p-5 shadow-card">
            <motion.span animate={{ scale: [1, 1.15, 1], rotate: [0, -6, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="inline-block"><Flame className="text-orange-500" fill="#fb923c" /></motion.span>
            <p className="mt-2 font-display text-4xl font-extrabold">{user.racha} <span className="text-lg text-black/40">días</span></p>
            <p className="text-xs font-bold uppercase tracking-widest text-black/40">Racha de actividad</p>
            <div className="mt-3 flex gap-1.5">{week.map((d, i) => {
              const on = i <= todayIdx && todayIdx - i < user.racha
              return <span key={i} className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold ${on ? 'bg-orange-400 text-white' : i === todayIdx ? 'border-2 border-orange-300 text-orange-400' : 'bg-black/5 text-black/30'}`}>{d}</span>
            })}</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }} className="rounded-[26px] bg-forest p-5 text-white shadow-card sm:col-span-2 lg:col-span-1 xl:col-span-2">
            <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-widest text-lime">Progreso general</p><p className="text-xs text-white/60">{user.nivel} · Módulo {user.modulo} de 4</p></div>
            <div className="mt-3 flex gap-2">{TENANT.levels.map((l) => {
              const idx = TENANT.levels.indexOf(user.nivel), me = TENANT.levels.indexOf(l)
              return <div key={l} className="flex-1"><div className="h-2.5 overflow-hidden rounded-full bg-white/15"><motion.div className="h-full bg-lime" initial={{ width: 0 }} animate={{ width: me < idx ? '100%' : me === idx ? `${user.progreso}%` : '0%' }} transition={{ duration: 1, delay: .4 }} /></div><p className={`mt-1 text-[10px] font-bold ${me <= idx ? 'text-lime' : 'text-white/40'}`}>{l}</p></div>
            })}</div>
          </motion.div>
        </div>
      </div>

      {/* Misiones */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .25 }} className="card p-6">
        <div className="mb-4 flex items-center justify-between"><p className="font-display text-xl font-extrabold">Misiones pendientes</p><button onClick={() => navigate('/alumno/misiones')} className="text-sm font-bold text-forest">Ver todas</button></div>
        <div className="space-y-3">
          {s.pendientes.map((m, i) => {
            const [I, c] = TIPO_ICON[m.tipo]
            return (
              <motion.button key={m.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .3 + i * .07 }} whileHover={{ scale: 1.01 }} onClick={() => s.setPlaying(m)}
                className="flex w-full items-center gap-4 rounded-2xl border-2 border-b-4 border-black/[.07] bg-white p-3 text-left">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl ${c}`}><I size={22} /></span>
                <div className="flex-1"><p className="font-bold">{m.titulo}</p><p className="text-xs text-black/45">Vence {fmtDate(m.fechaLimite)} · +{m.recompensa} L$ · +{m.xp} XP</p></div>
                <span className="rounded-xl bg-lime px-4 py-2 font-display text-sm font-extrabold uppercase">¡Jugar!</span>
              </motion.button>
            )
          })}
          {!s.pendientes.length && <div className="flex items-center gap-3 rounded-2xl bg-lime/15 p-4"><Target className="text-forest" /><p className="text-sm font-semibold">¡Completaste todas tus misiones! Practica en el Pronunciation Lab mientras tanto.</p></div>}
        </div>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card p-6">
          <p className="mb-3 font-display text-lg font-extrabold"> Readings para ti</p>
          {READINGS.filter((r, i) => r.nivel === user.nivel || i < 2).slice(0, 3).map((r) => (
            <div key={r.id} className="mb-2 flex items-center gap-3 rounded-2xl bg-sage-soft p-3"><BookOpen size={22} className="text-forest" /><div className="flex-1"><p className="text-sm font-bold">{r.titulo}</p><p className="text-xs text-black/45">{r.min} min</p></div><ChevronRight size={16} className="text-black/30" /></div>
          ))}
        </div>
        <div className="card p-6">
          <p className="mb-3 font-display text-lg font-extrabold"> Insignias</p>
          <div className="grid grid-cols-3 gap-2">
            {INSIGNIAS.map((ins, i) => { const has = user.insignias.includes(ins.key); return (
              <motion.div key={ins.key} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: .3 + i * .05, type: 'spring' }} title={ins.desc} className={`flex flex-col items-center rounded-2xl p-2 text-center ${has ? 'bg-lemon-pale' : 'bg-black/[.03] opacity-40 grayscale'}`}>
                <InsIcon k={ins.key} className="text-forest" /><span className="text-[10px] font-bold leading-tight">{ins.name}</span>
              </motion.div>) })}
          </div>
        </div>
        <button onClick={() => navigate('/alumno/coleccion')} className="card p-6 text-left transition hover:-translate-y-1">
          <p className="mb-3 font-display text-lg font-extrabold"> Mis Limmys</p>
          <div className="flex -space-x-3">
            {LIMMYS.filter((l) => user.limmys.includes(l.key)).map((l) => <span key={l.key} className={`grid h-14 w-14 place-items-center rounded-full border-4 border-white bg-gradient-to-br ${l.bg}`}><Limmy size={34} acc={l.acc} /></span>)}
          </div>
          <p className="mt-3 text-sm text-black/50">{user.limmys.length} de {LIMMYS.length} coleccionados</p>
        </button>
      </div>

      <AnimatePresence>{s.playing && <MissionPlayer mission={s.playing} onClose={() => s.setPlaying(null)} onFinish={s.finish} />}</AnimatePresence>
    </div>
  )
}
