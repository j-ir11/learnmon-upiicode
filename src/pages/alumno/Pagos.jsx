import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Megaphone, Receipt, Copy } from 'lucide-react'
import { Badge } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { money, fmtDate } from '../../utils/format'

export default function Pagos() {
  const { db, user, toast } = useApp()
  const [ref, setRef] = useState(null)
  const pagos = db.pagos.filter((p) => p.alumnoId === user.id)
  const curso = db.cursos.find((c) => c.id === user.cursoId)
  const promo = db.promociones.find((p) => p.activa && p.tipoPromo === 'Descuento General')
  const prox = pagos.find((p) => p.estado !== 'Pagado')
  const desc = promo && prox ? Math.round(prox.monto * (1 - promo.valor / 100)) : null

  return (
    <div className="space-y-6">
      <h2 className="font-display text-3xl font-extrabold">Mis pagos</h2>
      {promo && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-lemon to-lime p-6 shadow-card">
          <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2.2 }} className="absolute right-6 top-4 opacity-30"><Megaphone size={70} /></motion.div>
          <p className="text-xs font-bold uppercase tracking-widest text-forest-deep">¡Es semana de promoción!</p>
          <p className="font-display text-2xl font-extrabold">Paga por adelantado y ahorra {promo.valor}%</p>
          {desc && <p className="mt-1 text-sm font-semibold text-forest-deep/80">Tu próxima mensualidad: <s>{money(prox.monto)}</s> → <b>{money(desc)}</b></p>}
        </motion.div>
      )}
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="card p-5"><p className="text-xs font-bold uppercase tracking-widest text-black/40">Mensualidad</p><p className="font-display text-3xl font-extrabold">{money(curso?.precio)}</p><p className="text-xs text-black/45">{curso?.nombre}</p></div>
        <div className="card p-5"><p className="text-xs font-bold uppercase tracking-widest text-black/40">Próximo pago</p><p className="font-display text-3xl font-extrabold">{prox ? fmtDate(prox.fecha) : '—'}</p><p className="text-xs text-black/45">Cada {user.diaPago} del mes</p></div>
        <div className="card p-5"><p className="text-xs font-bold uppercase tracking-widest text-black/40">Estado</p><p className={`font-display text-3xl font-extrabold ${pagos.some((p) => p.estado === 'Vencido') ? 'text-red-500' : 'text-forest'}`}>{pagos.some((p) => p.estado === 'Vencido') ? 'Con adeudo' : 'Al corriente'}</p></div>
      </div>
      <div className="card p-6">
        <p className="mb-3 font-display text-lg font-extrabold">Historial</p>
        {pagos.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .06 }} className="flex items-center gap-3 border-b border-black/5 py-3 last:border-0">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-sage-soft"><Receipt size={18} className="text-forest" /></span>
            <div className="flex-1"><p className="font-semibold">Módulo {p.modulo}</p><p className="text-xs text-black/45">{fmtDate(p.fecha)}</p></div>
            <Badge tone={p.estado === 'Pagado' ? 'lime' : p.estado === 'Vencido' ? 'red' : 'yellow'}>{p.estado}</Badge>
            <span className="w-20 text-right font-bold">{money(p.monto)}</span>
            {p.estado !== 'Pagado' && <button onClick={() => setRef(p)} className="chip bg-lime px-3 py-1.5 text-ink">Referencia</button>}
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {ref && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRef(null)}>
            <motion.div initial={{ y: 40, scale: .9 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-[28px] bg-white p-6 text-center shadow-2xl">
              <p className="font-display text-xl font-bold">Referencia de pago (demo)</p>
              <p className="text-sm text-black/50">Preséntala en recepción o en tu transferencia.</p>
              <p className="mt-4 rounded-2xl bg-sage-soft py-4 font-mono text-xl font-bold tracking-widest">LT-{user.id}-{ref.fecha.replace(/-/g, '').slice(0, 6)}-{ref.modulo}</p>
              <p className="mt-2 text-sm">Monto: <b>{money(desc && ref.id === prox?.id ? desc : ref.monto)}</b></p>
              <button onClick={() => { try { navigator.clipboard.writeText(`LT-${user.id}-${ref.fecha.replace(/-/g, '').slice(0, 6)}-${ref.modulo}`) } catch { /* */ } toast('Referencia copiada') ; setRef(null) }} className="btn-lime mt-5 w-full"><Copy size={15} /> Copiar referencia</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
