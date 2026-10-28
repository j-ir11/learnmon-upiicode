import { AnimatePresence, motion } from 'framer-motion'
import { UserPlus, Wallet, Wrench, Megaphone, Clock, Check, Trash2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const meta = {
  alumno: [UserPlus, 'bg-sky-100 text-sky-600'], pago: [Wallet, 'bg-orange-100 text-orange-500'],
  sistema: [Wrench, 'bg-lime/30 text-forest'], promo: [Megaphone, 'bg-lime/30 text-forest'],
}

export default function Actividad() {
  const { db, api, toast } = useApp()
  return (
    <div className="space-y-6">
      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-extrabold">Historial de Actividad</motion.h2>
      <div className="card divide-y divide-black/5 p-3">
        <AnimatePresence>
          {db.actividad.map((a, i) => {
            const [I, c] = meta[a.tipo] || meta.sistema
            return (
              <motion.div key={a.id} layout initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40, height: 0 }} transition={{ delay: i * .04 }} className="flex flex-wrap items-center gap-4 px-3 py-4">
                <span className={`grid h-11 w-11 place-items-center rounded-full ${c}`}><I size={18} /></span>
                <div className="min-w-[200px] flex-1">
                  <p className="font-bold">{a.titulo}</p>
                  <p className="text-sm text-black/50">{a.desc}</p>
                  <p className="text-xs text-black/35">{a.fecha}</p>
                </div>
                {a.leida && <span className="chip bg-lime/30 text-forest-dark">PROCESADO</span>}
                <button onClick={() => api.actividad.update(a.id, { leida: !a.leida })} className={`chip px-3 py-1.5 transition ${a.leida ? 'bg-lime/20 text-forest' : 'bg-black/5 text-black/50'}`}>{a.leida ? <><Check size={13} /> Leída</> : <><Clock size={13} /> Pendiente</>}</button>
                <button onClick={async () => { await api.actividad.remove(a.id); toast('Registro eliminado') }} className="chip bg-red-50 px-3 py-1.5 text-red-500"><Trash2 size={13} /> Eliminar</button>
              </motion.div>
            )
          })}
        </AnimatePresence>
        {!db.actividad.length && <p className="py-10 text-center text-sm text-black/50">Sin actividad reciente.</p>}
      </div>
    </div>
  )
}
