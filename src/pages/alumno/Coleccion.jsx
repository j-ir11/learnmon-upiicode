import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock } from 'lucide-react'
import { Limmy } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { LIMMYS, INSIGNIAS } from '../../data/catalogs'

export default function Coleccion() {
  const { user } = useApp()
  const [view, setView] = useState(null)
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl font-extrabold">Limmys coleccionables</h2>
        <p className="text-sm text-black/50">Desbloquea un Limmy especial cada 3 misiones completadas. ¡Colecciónalos todos! · Llevas <b>{user.misionesHechas}</b> misiones.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {LIMMYS.map((l, i) => {
          const has = user.limmys.includes(l.key)
          return (
            <motion.button key={l.key} initial={{ opacity: 0, y: 20, rotate: -4 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: i * .06, type: 'spring', damping: 14 }}
              whileHover={has ? { y: -8, rotate: 2 } : { x: [0, -3, 3, 0] }} onClick={() => has && setView(l)}
              className={`relative flex flex-col items-center rounded-[26px] border-2 border-b-[6px] p-5 ${has ? `border-white bg-gradient-to-br ${l.bg} shadow-card` : 'border-black/5 bg-black/[.03]'}`}>
              <div className={has ? '' : 'opacity-25 brightness-0'}><Limmy size={86} acc={l.acc} float={has} /></div>
              <p className="mt-3 font-display text-base font-extrabold">{has ? l.name : '???'}</p>
              {!has && <p className="flex items-center gap-1 text-xs font-semibold text-black/40"><Lock size={12} /> {Math.max(0, l.need - user.misionesHechas)} misiones más</p>}
            </motion.button>
          )
        })}
      </div>
      <div>
        <h3 className="mb-3 font-display text-2xl font-extrabold">Insignias</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {INSIGNIAS.map((ins, i) => { const has = user.insignias.includes(ins.key); return (
            <motion.div key={ins.key} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: .3 + i * .05, type: 'spring' }} className={`rounded-2xl p-4 text-center ${has ? 'bg-white shadow-card' : 'bg-black/[.03] opacity-40 grayscale'}`}>
              <p className="text-4xl">{ins.emoji}</p><p className="mt-1 text-sm font-bold">{ins.name}</p><p className="text-[11px] text-black/45">{ins.desc}</p>
            </motion.div>) })}
        </div>
      </div>
      <AnimatePresence>
        {view && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setView(null)}>
            <motion.div initial={{ scale: .5, rotateY: 180 }} animate={{ scale: 1, rotateY: 0 }} exit={{ scale: .5, opacity: 0 }} transition={{ type: 'spring', damping: 14 }} className={`w-72 rounded-[32px] bg-gradient-to-br ${view.bg} p-8 text-center shadow-2xl`}>
              <Limmy size={150} acc={view.acc} float className="mx-auto" />
              <p className="mt-4 font-display text-2xl font-extrabold">{view.name}</p>
              <p className="text-sm text-black/60">Desbloqueado con {view.need} misiones</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
