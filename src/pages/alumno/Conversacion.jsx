import { Fragment, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessagesSquare, X } from 'lucide-react'
import { ConfirmDialog } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { TENANT } from '../../config/tenant'
import { cap } from '../../utils/format'

const HORAS = ['16:00', '17:00', '18:00', '19:00', '20:00']
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export default function Conversacion() {
  const { db, user, api, toast } = useApp()
  const [pick, setPick] = useState(null)
  const [cancel, setCancel] = useState(null)
  const mes = iso(new Date()).slice(0, 7)
  const mias = db.reservas.filter((r) => r.alumnoId === user.id)
  const usadas = mias.filter((r) => r.fecha.startsWith(mes)).length
  const total = TENANT.conversationHoursPerMonth
  const dias = Array.from({ length: 7 }, (_, k) => { const d = new Date(); d.setDate(d.getDate() + k + 1); return d }).filter((d) => d.getDay() !== 0)
  const ocupado = (f, h) => db.reservas.some((r) => r.fecha === f && r.hora === h && r.alumnoId !== user.id) || (f.endsWith('5') && h === '18:00')
  const r = 54, c = 2 * Math.PI * r

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-extrabold">Horas de conversación</h2>
        <p className="text-sm text-black/50">Tienes derecho a {total} horas al mes. Acomódalas como prefieras (ideal: 2 por semana).</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="card flex flex-col items-center p-6">
          <div className="relative">
            <svg width="140" height="140" className="-rotate-90">
              <circle cx="70" cy="70" r={r} stroke="#eef0ec" strokeWidth="14" fill="none" />
              <motion.circle cx="70" cy="70" r={r} stroke="#badb24" strokeWidth="14" fill="none" strokeLinecap="round" strokeDasharray={c} animate={{ strokeDashoffset: c - (c * usadas) / total }} initial={{ strokeDashoffset: c }} transition={{ duration: 1 }} />
            </svg>
            <div className="absolute inset-0 grid place-content-center text-center"><p className="font-display text-4xl font-extrabold leading-none">{total - usadas}</p><p className="text-[10px] font-bold text-black/40">HORAS LIBRES</p></div>
          </div>
          <p className="mt-3 text-sm text-black/50">{usadas} de {total} reservadas este mes</p>
          <div className="mt-5 w-full space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-black/40">Mis reservas</p>
            <AnimatePresence>
              {mias.sort((a, b) => a.fecha.localeCompare(b.fecha)).map((x) => (
                <motion.div key={x.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-2 rounded-xl bg-lime/15 px-3 py-2 text-sm">
                  <MessagesSquare size={15} className="text-forest" /><span className="flex-1 font-semibold">{cap(new Date(x.fecha + 'T12:00').toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' }))} · {x.hora}</span>
                  <button onClick={() => setCancel(x)} className="text-black/30 hover:text-red-500"><X size={15} /></button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="card nice-scroll overflow-x-auto p-6">
          <div className="grid min-w-[560px] gap-2" style={{ gridTemplateColumns: `70px repeat(${dias.length}, 1fr)` }}>
            <span />
            {dias.map((d) => <p key={iso(d)} className="text-center text-xs font-bold uppercase text-black/50">{d.toLocaleDateString('es-MX', { weekday: 'short' })}<br /><span className="font-display text-lg text-ink">{d.getDate()}</span></p>)}
            {HORAS.map((h) => (
              <Fragment key={h}>
                <p className="self-center text-sm font-bold text-black/40">{h}</p>
                {dias.map((d) => {
                  const f = iso(d)
                  const mine = mias.find((x) => x.fecha === f && x.hora === h)
                  const busy = ocupado(f, h)
                  return (
                    <motion.button key={f + h} whileHover={!busy ? { scale: 1.05 } : {}} whileTap={{ scale: .95 }} disabled={busy && !mine}
                      onClick={() => (mine ? setCancel(mine) : usadas >= total ? toast('Ya usaste tus horas de este mes', 'warn') : setPick({ f, h }))}
                      className={`h-12 rounded-xl text-xs font-bold transition ${mine ? 'bg-forest text-white' : busy ? 'bg-black/[.04] text-black/25 line-through' : 'border-2 border-dashed border-lime/60 text-forest hover:bg-lime/20'}`}>
                      {mine ? 'Reservado' : busy ? 'Lleno' : 'Libre'}
                    </motion.button>
                  )
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
      <ConfirmDialog open={!!pick} title="Reservar conversación" text={pick && `¿Reservar 1 hora el ${new Date(pick.f + 'T12:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })} a las ${pick.h}?`} confirmText="Reservar"
        onCancel={() => setPick(null)} onConfirm={async () => { await api.alumno.reservar(user.id, pick.f, pick.h); setPick(null); toast('¡Reservado! Te esperamos') }} />
      <ConfirmDialog open={!!cancel} danger title="Cancelar reserva" text="¿Seguro que quieres liberar esta hora?" confirmText="Cancelar reserva"
        onCancel={() => setCancel(null)} onConfirm={async () => { await api.alumno.cancelarReserva(cancel.id); setCancel(null); toast('Reserva cancelada') }} />
    </div>
  )
}
