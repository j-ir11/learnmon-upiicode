import { motion } from 'framer-motion'
import { Blocks, Check, Lock, RotateCcw, Sparkles } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { MODULES, PLATFORM, TENANT } from '../../config/tenant'
import { money } from '../../utils/format'
import { Limmy } from '../../components/ui'

export default function Plataforma() {
  const { db, api, toast } = useApp()
  const total = MODULES.filter((m) => db.modulos.includes(m.key)).reduce((s, m) => s + m.price, 0) + 499

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-ink via-forest-deep to-forest p-8 text-white shadow-card">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-lime/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-lime text-ink"><Blocks size={30} /></div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-lime">{PLATFORM.name} · Software modular</p>
            <h2 className="font-display text-3xl font-extrabold">Mi plan: {TENANT.fullName}</h2>
            <p className="text-sm text-white/70">Activa solo los módulos que tu escuela necesita. El sistema crece contigo.</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-6 py-4 text-right">
            <p className="text-xs uppercase tracking-wider text-white/60">Mensualidad estimada</p>
            <motion.p key={total} initial={{ scale: 1.2, color: '#badb24' }} animate={{ scale: 1, color: '#fff' }} className="font-display text-4xl font-extrabold">{money(total)}</motion.p>
            <p className="text-[11px] text-white/50">Incluye plan base {money(499)} + módulos</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {MODULES.map((m, i) => {
          const on = db.modulos.includes(m.key)
          return (
            <motion.button key={m.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .05 }} whileHover={{ y: -4 }}
              onClick={async () => { if (m.base) { toast('Este módulo forma parte del plan base', 'info'); return } await api.plataforma.toggleModulo(m.key); toast(on ? `${m.name} desactivado` : `${m.name} activado ✨`) }}
              className={`relative rounded-[24px] border-2 p-5 text-left transition-colors ${on ? 'border-lime bg-white shadow-card' : 'border-dashed border-black/15 bg-white/50'}`}>
              <div className="flex items-start justify-between">
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${on ? 'bg-lime text-ink' : 'bg-black/5 text-black/40'}`}>{m.base ? <Lock size={18} /> : on ? <Check size={18} /> : <Sparkles size={18} />}</span>
                <div className={`relative h-6 w-11 rounded-full transition-colors ${on ? 'bg-lime' : 'bg-black/15'}`}>
                  <motion.span layout className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow" style={{ left: on ? 22 : 2 }} />
                </div>
              </div>
              <p className="mt-4 font-display text-lg font-bold leading-tight">{m.name}</p>
              <p className="mt-1 text-xs text-black/50">{m.desc}</p>
              <p className="mt-3 text-sm font-bold text-forest">{m.base ? 'Incluido en plan base' : `+${money(m.price)}/mes`}</p>
            </motion.button>
          )
        })}
      </div>

      <div className="card flex flex-wrap items-center gap-5 p-6">
        <Limmy size={60} float />
        <div className="flex-1">
          <p className="font-display text-lg font-bold">Acompañamiento UPIICODE</p>
          <p className="text-sm text-black/55">Al desactivar un módulo, desaparece del menú al instante. Así demostramos el modelo de negocio: pagar solo por lo que usas.</p>
        </div>
        <button onClick={async () => { await api.reset(); toast('Datos de demostración restablecidos') }} className="btn-ghost text-sm"><RotateCcw size={15} /> Restablecer datos demo</button>
      </div>
    </div>
  )
}
