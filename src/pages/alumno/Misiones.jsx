import { motion, AnimatePresence } from 'framer-motion'
import { Check, RotateCcw } from 'lucide-react'
import MissionPlayer from './MissionPlayer'
import { useStudent } from './useStudent'
import { TIPO_ICON } from './Inicio'
import { fmtDate } from '../../utils/format'

export default function Misiones() {
  const s = useStudent()
  const Card = ({ m, done, i }) => {
    const [I, c] = TIPO_ICON[m.tipo]
    const sc = m.completadas[s.user.id]
    return (
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .06 }} whileHover={{ y: -4 }}
        className={`flex flex-col rounded-[24px] border-2 border-b-[6px] p-5 ${done ? 'border-lime/50 bg-lime/10' : 'border-black/[.07] bg-white'}`}>
        <div className="flex items-center gap-3">
          <span className={`grid h-12 w-12 place-items-center rounded-2xl ${c}`}><I size={22} /></span>
          <span className="chip bg-black/5 text-black/50">{m.tipo}</span>
          {done && <span className="ml-auto grid h-8 w-8 place-items-center rounded-full bg-lime"><Check size={18} /></span>}
        </div>
        <p className="mt-4 font-display text-xl font-extrabold leading-tight">{m.titulo}</p>
        <p className="mt-1 text-xs text-black/45">{done ? `Resultado: ${sc}%` : `Vence ${fmtDate(m.fechaLimite)}`} · +{m.recompensa} 🍋 · +{m.xp} XP</p>
        <button onClick={() => s.setPlaying(m)} className={`mt-5 rounded-2xl border-b-4 py-3 font-display font-extrabold uppercase ${done ? 'border-black/10 bg-white text-forest' : 'border-[#8fae12] bg-lime'}`}>
          {done ? <><RotateCcw size={15} className="mr-1 inline" /> Repetir</> : '¡Comenzar misión!'}
        </button>
      </motion.div>
    )
  }
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl font-extrabold">Mis misiones</h2>
        <p className="text-sm text-black/50">Lo que aprendes en clase, llévalo a casa jugando. Cada misión hace crecer tu árbol.</p>
      </div>
      <section>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-black/40">Pendientes ({s.pendientes.length})</p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{s.pendientes.map((m, i) => <Card key={m.id} m={m} i={i} />)}</div>
        {!s.pendientes.length && <p className="rounded-2xl bg-lime/15 p-5 text-sm font-semibold">¡No tienes misiones pendientes! 🎉</p>}
      </section>
      <section>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-black/40">Completadas ({s.hechas.length})</p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{s.hechas.map((m, i) => <Card key={m.id} m={m} i={i} done />)}</div>
      </section>
      <AnimatePresence>{s.playing && <MissionPlayer mission={s.playing} onClose={() => s.setPlaying(null)} onFinish={s.finish} />}</AnimatePresence>
    </div>
  )
}
