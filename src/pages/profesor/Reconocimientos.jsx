import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Coins, Minus, Plus, Trophy, Crown, Star } from 'lucide-react'
import { Avatar, Segmented, Badge } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { teacherData } from './helpers'
import { cap, daysLeftInMonth } from '../../utils/format'
import { INSIGNIAS } from '../../data/catalogs'
import { InsIcon } from '../../components/icons'

export default function Reconocimientos() {
  const { db, user, api, toast } = useApp()
  const t = teacherData(db, user)
  const [gid, setGid] = useState(t.grupos[0]?.id)
  const [pops, setPops] = useState([])
  const [estrella, setEstrella] = useState(null)
  const g = t.grupos.find((x) => x.id === gid)
  const alumnos = g ? db.usuarios.filter((u) => g.alumnos.includes(u.id)).sort((a, b) => b.lemonDollars - a.lemonDollars) : []

  const give = async (a, n, e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const id = Math.random()
    setPops((p) => [...p, { id, x: r.left + r.width / 2, y: r.top, n }])
    setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 900)
    await api.reconocimientos.lemonDollars(a.id, n)
  }
  const nominar = async (a) => {
    setEstrella(a.id)
    await api.reconocimientos.insignia(a.id, 'estrella')
    confetti({ particleCount: 140, spread: 80, origin: { y: .6 }, colors: ['#badb24', '#f5d005', '#52723e', '#fff496'] })
    toast(`${a.nombre.split(' ')[0]} nominado como Alumno del Mes`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-extrabold">Lemon Dollars y reconocimientos</motion.h2>
          <p className="text-sm text-black/50">Los Lemon Dollars se reinician en <b>{daysLeftInMonth()} días</b>. Se canjean por premios en la escuela.</p>
        </div>
        {t.grupos.length > 0 && <Segmented className="ml-auto" options={t.grupos.map((x) => x.nombre)} value={g?.nombre} onChange={(n) => setGid(t.grupos.find((x) => x.nombre === n).id)} />}
      </div>

      {alumnos.length >= 3 && (
        <div className="flex items-end justify-center gap-3 pt-4">
          {[1, 0, 2].map((idx, k) => {
            const a = alumnos[idx]; const h = [120, 160, 96][k]
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 * k, type: 'spring', damping: 14 }} className="flex w-32 flex-col items-center">
                {idx === 0 && <Crown className="mb-1 text-lemon" size={28} fill="#f5d005" />}
                <Avatar u={a} size={idx === 0 ? 64 : 52} className="border-4 border-white shadow-md" />
                <p className="mt-1 truncate text-sm font-bold">{a.nombre.split(' ')[0]}</p>
                <p className="text-xs font-semibold text-amber-600">{a.lemonDollars} L$</p>
                <motion.div initial={{ height: 0 }} animate={{ height: h }} transition={{ delay: .3 + .1 * k, duration: .6 }} className={`mt-2 grid w-full place-items-start justify-center rounded-t-2xl pt-3 font-display text-3xl font-extrabold ${idx === 0 ? 'bg-lemon' : idx === 1 ? 'bg-lime' : 'bg-sage'}`}>{idx + 1}</motion.div>
              </motion.div>
            )
          })}
        </div>
      )}

      <div className="card divide-y divide-black/5 p-3">
        {alumnos.map((a, i) => (
          <motion.div key={a.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * .04 }} className="flex flex-wrap items-center gap-3 px-3 py-3">
            <Avatar u={a} size={42} />
            <div className="min-w-[150px] flex-1">
              <p className="font-semibold">{cap(`${a.nombre} ${a.apPaterno}`)} {(estrella === a.id || a.insignias.includes('estrella')) && <Star size={15} className="ml-1 inline text-amber-500" fill="currentColor" />}</p>
              <div className="mt-1 flex flex-wrap gap-1">{a.insignias.map((k) => { const ins = INSIGNIAS.find((x) => x.key === k); return <span key={k} title={ins?.name} className="text-forest"><InsIcon k={k} size={15} /></span> })}</div>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-lemon-pale px-2 py-1.5">
              <button onClick={(e) => give(a, -1, e)} className="grid h-8 w-8 place-items-center rounded-xl bg-white text-black/50 hover:text-red-500"><Minus size={15} /></button>
              <AnimatePresence mode="popLayout"><motion.span key={a.lemonDollars} initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-14 text-center font-display text-xl font-extrabold"><Coins size={15} className="mr-1 inline text-amber-500" />{a.lemonDollars}</motion.span></AnimatePresence>
              <button onClick={(e) => give(a, 1, e)} className="grid h-8 w-8 place-items-center rounded-xl bg-white text-forest hover:bg-lime"><Plus size={15} /></button>
              <button onClick={(e) => give(a, 5, e)} className="rounded-xl bg-lime px-2.5 py-1.5 text-xs font-bold text-ink">+5</button>
            </div>
            <button onClick={() => nominar(a)} className="chip bg-forest px-3 py-2 text-white hover:bg-forest-dark"><Trophy size={13} /> Nominar alumno del mes</button>
          </motion.div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2"><Badge tone="gray">Tip</Badge><span className="text-sm text-black/50">Cada Lemon Dollar que otorgas aparece al instante en la app del alumno con una notificación.</span></div>

      {pops.map((p) => (
        <motion.span key={p.id} className="pointer-events-none fixed z-50 font-display text-xl font-extrabold text-amber-500" style={{ left: p.x - 16, top: p.y }} initial={{ y: 0, opacity: 1, scale: .8 }} animate={{ y: -60, opacity: 0, scale: 1.3 }} transition={{ duration: .9 }}>
          {p.n > 0 ? `+${p.n}` : p.n} L$
        </motion.span>
      ))}
    </div>
  )
}
