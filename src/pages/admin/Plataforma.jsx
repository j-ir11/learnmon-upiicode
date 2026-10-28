import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Blocks, Check, Lock, RotateCcw, Sparkles, Lightbulb, Send, MessageSquareText, Hammer, PackageCheck, Search, FileText, Clock, Wrench, Zap, Users, UserRound } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { MODULES, PLATFORM, TENANT } from '../../config/tenant'
import { money } from '../../utils/format'
import { Limmy, Field, Segmented, Badge, CountUp } from '../../components/ui'

const AREAS = ['Administración', 'Pagos y cobranza', 'Profesores', 'App del alumno', 'Reportes', 'Otro']
const SIZES = {
  Pequeña: { min: 1500, max: 3000, sem: '1', mensual: 49, hint: 'Un ajuste, un reporte o un campo nuevo' },
  Mediana: { min: 4000, max: 8000, sem: '2 a 3', mensual: 99, hint: 'Una pantalla nueva o una automatización' },
  Grande: { min: 10000, max: 18000, sem: '4 a 6', mensual: 199, hint: 'Un módulo completo o integración externa' },
}
const USERS = { '1 a 10': 1, '11 a 50': 1, '51 a 200': 1.15, 'Más de 200': 1.3 }
const STEPS = [
  { k: 'Recibida', Icon: Send }, { k: 'En análisis', Icon: Search }, { k: 'Cotizada', Icon: FileText },
  { k: 'En desarrollo', Icon: Hammer }, { k: 'Entregada', Icon: PackageCheck },
]
const r100 = (n) => Math.round(n / 100) * 100

export function cotizar(f) {
  const s = SIZES[f.complejidad]
  const k = USERS[f.usuarios] * (f.urgencia === 'Urgente' ? 1.2 : 1)
  return { min: r100(s.min * k), max: r100(s.max * k), semanas: f.urgencia === 'Urgente' ? `${s.sem} (prioritario)` : s.sem, mensual: s.mensual }
}

const blank = () => ({ titulo: '', descripcion: '', area: 'Pagos y cobranza', complejidad: 'Mediana', usuarios: '11 a 50', urgencia: 'Normal', responsable: '', contacto: 'WhatsApp' })

function Modulos() {
  const { db, api, toast } = useApp()
  return (
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
  )
}

function Chips({ options, value, onChange, render }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <motion.button type="button" whileTap={{ scale: .95 }} key={o} onClick={() => onChange(o)}
          className={`rounded-2xl border-2 px-4 py-2 text-left text-sm font-semibold transition-colors ${value === o ? 'border-lime bg-lime/20 text-forest-deep' : 'border-black/[.07] bg-white text-black/55 hover:border-lime/50'}`}>
          {render ? render(o) : o}
        </motion.button>
      ))}
    </div>
  )
}

function Cotizador({ onSent }) {
  const { api, toast } = useApp()
  const [f, setF] = useState(blank)
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(null)
  const set = (p) => setF((x) => ({ ...x, ...p }))
  const q = cotizar(f)

  const send = async () => {
    if (f.titulo.trim().length < 5 || f.descripcion.trim().length < 10) { toast('Cuéntanos un poco más de lo que necesitas', 'warn'); return }
    setSending(true)
    const item = await api.solicitudes.enviar({ ...f, cotizacion: q })
    setSending(false); setDone(item); setF(blank())
  }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} className="card flex flex-col items-center p-10 text-center">
        <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 10 }}><Limmy size={110} float acc="🛠️" /></motion.div>
        <h3 className="mt-4 font-display text-3xl font-extrabold text-forest">¡Solicitud enviada!</h3>
        <p className="mt-1 max-w-md text-sm text-black/55">Recibimos “<b>{done.titulo}</b>”. Nuestro analista de negocios revisará tu necesidad y te confirmará la cotización por {done.contacto} en menos de 48 horas.</p>
        <div className="mt-5 rounded-2xl bg-sage-soft px-6 py-3"><p className="text-xs font-bold uppercase tracking-wider text-black/45">Cotización preliminar</p><p className="font-display text-2xl font-extrabold">{money(done.cotizacion.min)} – {money(done.cotizacion.max)}</p></div>
        <div className="mt-6 flex gap-3"><button onClick={() => setDone(null)} className="btn-ghost">Cotizar otra</button><button onClick={onSent} className="btn-lime">Ver mis solicitudes</button></div>
      </motion.div>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="card space-y-5 p-6">
        <div>
          <p className="font-display text-xl font-extrabold">¿Qué necesita tu escuela?</p>
          <p className="text-sm text-black/50">Descríbelo con tus palabras, sin tecnicismos. Nosotros lo convertimos en una funcionalidad.</p>
        </div>
        <Field label="Nombre de la funcionalidad (ej. Recordatorios por WhatsApp)" icon={Lightbulb} value={f.titulo} onChange={(v) => set({ titulo: v.slice(0, 70) })} />
        <label className="block">
          <span className="mb-1 block pl-1 text-xs font-semibold text-forest-dark/80">Descríbela: ¿qué problema resuelve y quién la usaría?</span>
          <textarea value={f.descripcion} onChange={(e) => set({ descripcion: e.target.value.slice(0, 500) })} rows={4}
            placeholder="Ej. Queremos que a los papás les llegue un mensaje antes de la fecha de pago para no tener que llamarles uno por uno…"
            className="w-full rounded-2xl border border-black/[.06] p-4 text-sm outline-none transition focus:border-lime focus:ring-4 focus:ring-lime/15" />
          <span className="block text-right text-[11px] text-black/35">{f.descripcion.length}/500</span>
        </label>
        <div><p className="mb-2 pl-1 text-xs font-bold uppercase tracking-wider text-forest-dark">Área del sistema</p><Chips options={AREAS} value={f.area} onChange={(v) => set({ area: v })} /></div>
        <div>
          <p className="mb-2 pl-1 text-xs font-bold uppercase tracking-wider text-forest-dark">Tamaño estimado</p>
          <Chips options={Object.keys(SIZES)} value={f.complejidad} onChange={(v) => set({ complejidad: v })} render={(o) => <span><span className="block">{o}</span><span className="block text-[11px] font-normal opacity-70">{SIZES[o].hint}</span></span>} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><p className="mb-2 pl-1 text-xs font-bold uppercase tracking-wider text-forest-dark">¿Cuántas personas la usarán?</p><Chips options={Object.keys(USERS)} value={f.usuarios} onChange={(v) => set({ usuarios: v })} /></div>
          <div><p className="mb-2 pl-1 text-xs font-bold uppercase tracking-wider text-forest-dark">Urgencia</p><Chips options={['Normal', 'Urgente']} value={f.urgencia} onChange={(v) => set({ urgencia: v })} /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Responsable en la escuela" icon={UserRound} value={f.responsable} onChange={(v) => set({ responsable: v })} />
          <div><p className="mb-2 pl-1 text-xs font-bold uppercase tracking-wider text-forest-dark">Contactarme por</p><Chips options={['WhatsApp', 'Correo', 'Videollamada']} value={f.contacto} onChange={(v) => set({ contacto: v })} /></div>
        </div>
      </div>

      {/* Estimación en vivo */}
      <div className="xl:sticky xl:top-5 xl:h-fit">
        <motion.div layout className="overflow-hidden rounded-[28px] bg-gradient-to-br from-forest-deep via-forest to-forest-dark p-6 text-white shadow-card">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-lime">Cotización preliminar</p>
          <AnimatePresence mode="wait">
            <motion.p key={q.min + '-' + q.max} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-2 font-display text-3xl font-extrabold leading-tight">
              {money(q.min)}<span className="text-white/50"> – </span>{money(q.max)}
            </motion.p>
          </AnimatePresence>
          <p className="text-xs text-white/60">Pago único de desarrollo (MXN)</p>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3"><Clock size={17} className="text-lime" /><span className="flex-1">Entrega</span><b>{q.semanas} sem.</b></div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3"><Wrench size={17} className="text-lime" /><span className="flex-1">Mantenimiento</span><b>+{money(q.mensual)}/mes</b></div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3"><Users size={17} className="text-lime" /><span className="flex-1">Usuarios</span><b>{f.usuarios}</b></div>
            {f.urgencia === 'Urgente' && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex items-center gap-3 rounded-2xl bg-lemon/20 px-4 py-3 text-lemon"><Zap size={17} /><span className="flex-1">Prioridad urgente</span><b>+20%</b></motion.div>}
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-white/55">Es una estimación automática. Nuestro analista de negocios la confirma contigo en menos de 48 h. Al entregarla, la funcionalidad se activa como un módulo más de tu plan.</p>
          <button onClick={send} disabled={sending} className="btn-lime mt-5 w-full !py-3">{sending ? 'Enviando…' : <><Send size={16} /> Enviar solicitud a {PLATFORM.name}</>}</button>
        </motion.div>
      </div>
    </div>
  )
}

function Solicitudes() {
  const { db, api, toast } = useApp()
  if (!db.solicitudes.length) return <p className="card p-10 text-center text-sm text-black/50">Aún no has enviado solicitudes.</p>
  return (
    <div className="space-y-4">
      <AnimatePresence>
        {db.solicitudes.map((s, i) => {
          const idx = STEPS.findIndex((x) => x.k === s.estado)
          return (
            <motion.div key={s.id} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .05 }} className="card p-6">
              <div className="flex flex-wrap items-start gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lime/25 text-forest"><Lightbulb size={20} /></span>
                <div className="min-w-[200px] flex-1">
                  <p className="font-display text-lg font-extrabold leading-tight">{s.titulo}</p>
                  <p className="text-xs text-black/45">{s.area} · {s.complejidad} · enviada {s.fecha}</p>
                  <p className="mt-2 text-sm text-black/65">{s.descripcion}</p>
                </div>
                <div className="rounded-2xl bg-sage-soft px-4 py-2 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-black/45">{idx >= 2 ? 'Cotización' : 'Estimado'}</p>
                  <p className="font-display text-lg font-extrabold">{money(s.cotizacion.min)} – {money(s.cotizacion.max)}</p>
                  <p className="text-[11px] text-black/45">{s.cotizacion.semanas} sem. · +{money(s.cotizacion.mensual)}/mes</p>
                </div>
              </div>
              {/* Línea de tiempo */}
              <div className="mt-6 flex items-center">
                {STEPS.map((st, k) => (
                  <div key={st.k} className="flex flex-1 items-center last:flex-none">
                    <div className="flex flex-col items-center">
                      <motion.span initial={false} animate={{ scale: k === idx ? [1, 1.15, 1] : 1 }} transition={{ repeat: k === idx ? Infinity : 0, duration: 1.6 }}
                        className={`grid h-9 w-9 place-items-center rounded-full ${k < idx ? 'bg-forest text-white' : k === idx ? 'bg-lime text-ink ring-4 ring-lime/25' : 'bg-black/5 text-black/30'}`}>
                        {k < idx ? <Check size={16} /> : <st.Icon size={15} />}
                      </motion.span>
                      <span className={`mt-1 whitespace-nowrap text-[10px] font-bold ${k <= idx ? 'text-forest-dark' : 'text-black/35'}`}>{st.k}</span>
                    </div>
                    {k < STEPS.length - 1 && <div className="mx-1 mb-4 h-1 flex-1 overflow-hidden rounded-full bg-black/5"><motion.div className="h-full bg-forest" initial={{ width: 0 }} animate={{ width: k < idx ? '100%' : '0%' }} transition={{ duration: .6 }} /></div>}
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap justify-end gap-2">
                {s.estado === 'Cotizada' && <>
                  <button onClick={() => toast('Te contactaremos para ajustar la propuesta 💬', 'info')} className="btn-ghost !py-2 text-sm"><MessageSquareText size={15} /> Pedir ajustes</button>
                  <button onClick={async () => { await api.solicitudes.avanzar(s.id, 'En desarrollo'); toast('¡Cotización aceptada! Iniciamos el desarrollo 🚀') }} className="btn-lime !py-2 text-sm"><Check size={15} /> Aceptar cotización</button>
                </>}
                {s.estado !== 'Cotizada' && s.estado !== 'Entregada' && (
                  <button onClick={async () => { await api.solicitudes.avanzar(s.id, STEPS[idx + 1].k); toast(`Estado actualizado: ${STEPS[idx + 1].k}`) }} className="chip bg-black/5 px-3 py-1.5 text-black/50 hover:bg-lime/20">Simular respuesta de {PLATFORM.name} →</button>
                )}
                {s.estado === 'Entregada' && <Badge>Activa en tu plan ✨</Badge>}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export default function Plataforma() {
  const { db, api, toast } = useApp()
  const [tab, setTab] = useState('Módulos')
  const total = MODULES.filter((m) => db.modulos.includes(m.key)).reduce((s, m) => s + m.price, 0) + 1500
  const extras = db.solicitudes.filter((s) => s.estado === 'Entregada').reduce((a, s) => a + s.cotizacion.mensual, 0)

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-ink via-forest-deep to-forest p-8 text-white shadow-card">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-lime/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-lime text-ink"><Blocks size={30} /></div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-lime">{PLATFORM.name} · Software modular a la medida</p>
            <h2 className="font-display text-3xl font-extrabold">Mi plan: {TENANT.fullName}</h2>
            <p className="text-sm text-white/70">Activa solo lo que usas. ¿Necesitas algo más? Lo cotizamos y lo construimos para ti.</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-6 py-4 text-right">
            <p className="text-xs uppercase tracking-wider text-white/60">Mensualidad actual</p>
            <motion.p key={total + extras} initial={{ scale: 1.2, color: '#badb24' }} animate={{ scale: 1, color: '#fff' }} className="font-display text-4xl font-extrabold">{money(total + extras)}</motion.p>
            <p className="text-[11px] text-white/50">Plan base {money(1500)} + módulos{extras ? ' + a la medida' : ''}</p>
          </div>
        </div>
      </motion.div>

      {/* Cómo funciona */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[[Blocks, '1. Elige tus módulos', 'Pagas solo por lo que tu escuela usa hoy.'], [Lightbulb, '2. Pide lo que te falte', 'Cotiza una funcionalidad nueva en 2 minutos.'], [PackageCheck, '3. Crecemos juntos', 'La desarrollamos y se activa como un módulo más.']].map(([I, t, d], i) => (
          <motion.div key={t} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 + i * .08 }} className="flex items-start gap-3 rounded-[22px] bg-white/80 p-4 shadow-sm">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-lime/25 text-forest"><I size={19} /></span>
            <div><p className="font-display font-bold">{t}</p><p className="text-xs text-black/50">{d}</p></div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Segmented options={['Módulos', 'Cotizar funcionalidad', 'Mis solicitudes']} value={tab} onChange={setTab} />
        {tab === 'Mis solicitudes' && <Badge tone="gray"><CountUp to={db.solicitudes.length} /> solicitud(es)</Badge>}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .25 }}>
          {tab === 'Módulos' && <Modulos />}
          {tab === 'Cotizar funcionalidad' && <Cotizador onSent={() => setTab('Mis solicitudes')} />}
          {tab === 'Mis solicitudes' && <Solicitudes />}
        </motion.div>
      </AnimatePresence>

      <div className="card flex flex-wrap items-center gap-5 p-6">
        <Limmy size={60} float />
        <div className="flex-1">
          <p className="font-display text-lg font-bold">Acompañamiento {PLATFORM.name}</p>
          <p className="text-sm text-black/55">No te adaptas al sistema: el sistema se adapta a tu escuela.</p>
        </div>
        <button onClick={async () => { await api.reset(); toast('Datos de demostración restablecidos') }} className="btn-ghost text-sm"><RotateCcw size={15} /> Restablecer datos demo</button>
      </div>
    </div>
  )
}
