import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, animate } from 'framer-motion'
import { Eye, EyeOff, Lock, CalendarDays, ChevronDown, Play, Navigation, X } from 'lucide-react'
import limmyImg from '../assets/limmy.png'
import { ICONS } from './icons'
import { TENANT } from '../config/tenant'

// ── Limmy ───────────────────────────────────────────────────
export function Limmy({ size = 120, float = false, className = '', acc = '' }) {
  return (
    <motion.div className={`relative inline-block select-none ${className}`} style={{ width: size }}
      animate={float ? { y: [0, -8, 0] } : undefined}
      transition={float ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : undefined}>
      <img src={limmyImg} alt={TENANT.mascot} draggable={false} className="w-full drop-shadow-[0_10px_14px_rgba(160,140,0,.25)]" />
      {acc && ICONS[acc] && (() => { const I = ICONS[acc]; const d = Math.max(18, size * 0.36); return (
        <span className="absolute -right-[6%] -top-[6%] grid place-items-center rounded-full border-2 border-white bg-forest text-white shadow-md" style={{ width: d, height: d }}><I size={d * 0.55} /></span>) })()}
    </motion.div>
  )
}

// ── Fondo con burbujas desenfocadas ─────────────────────────
export function Blobs({ dark = false }) {
  const c = dark ? ['rgba(186,219,36,.35)', 'rgba(255,255,255,.08)', 'rgba(186,219,36,.25)'] : ['rgba(212,223,156,.6)', 'rgba(255,244,150,.45)', 'rgba(212,223,156,.45)']
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {[{ s: 380, x: '-6%', y: '-10%', d: 14 }, { s: 300, x: '78%', y: '-6%', d: 18 }, { s: 420, x: '70%', y: '62%', d: 16 }, { s: 260, x: '-4%', y: '70%', d: 20 }].map((b, i) => (
        <motion.div key={i} className="absolute rounded-full blur-2xl"
          style={{ width: b.s, height: b.s, left: b.x, top: b.y, background: c[i % 3] }}
          animate={{ x: [0, 30, -10, 0], y: [0, -20, 15, 0] }}
          transition={{ duration: b.d, repeat: Infinity, ease: 'easeInOut' }} />
      ))}
    </div>
  )
}

// ── Contador animado ────────────────────────────────────────
export function CountUp({ to, prefix = '', suffix = '', format = (n) => Math.round(n).toLocaleString('es-MX') }) {
  const ref = useRef(null)
  useEffect(() => {
    const c = animate(0, to, { duration: 1.2, ease: 'easeOut', onUpdate: (v) => { if (ref.current) ref.current.textContent = prefix + format(v) + suffix } })
    return () => c.stop()
  }, [to]) // eslint-disable-line
  return <span ref={ref}>{prefix}0{suffix}</span>
}

// ── Banner de frases (rota con barra de progreso) ───────────
export function PhraseBanner({ variant = 'light', label = 'Frases Lemon Tree', title, showLimmy = false }) {
  const [i, setI] = useState(0)
  const phrases = TENANT.phrases
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % phrases.length), 6000); return () => clearInterval(t) }, [phrases.length])
  const speak = () => {
    try { const u = new SpeechSynthesisUtterance(phrases[i]); u.lang = 'en-US'; u.rate = .9; speechSynthesis.cancel(); speechSynthesis.speak(u) } catch { /* */ }
  }
  const inner = (dark) => (
    <div className={`relative overflow-hidden rounded-[22px] border px-5 py-4 ${dark ? 'border-white/25 bg-white/10' : 'border-lime/30 bg-gradient-to-r from-sage/70 via-sage-soft to-white/60'}`}>
      <div className="flex items-center gap-3">
        <span className={`grid h-7 w-7 place-items-center rounded-full ${dark ? 'bg-lime text-forest-deep' : 'bg-forest text-white'}`}><Play size={13} fill="currentColor" /></span>
        <span className={`text-[11px] font-bold uppercase tracking-[.16em] ${dark ? 'text-lime' : 'text-forest-dark'}`}>{label}</span>
        <button onClick={speak} title="Escuchar" className={`ml-auto transition hover:scale-110 ${dark ? 'text-white' : 'text-forest'}`}><Navigation size={18} fill="currentColor" className="rotate-[-45deg] scale-x-[-1]" /></button>
      </div>
      <div className="relative mt-2 h-7 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p key={i} initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -18, opacity: 0 }} transition={{ duration: .45 }}
            className={`font-sans text-lg font-semibold italic ${dark ? 'text-white' : 'text-forest-dark'}`}>“{phrases[i]}”</motion.p>
        </AnimatePresence>
      </div>
      <motion.div key={'bar' + i} className={`absolute bottom-0 left-0 h-[3px] ${dark ? 'bg-lime' : 'bg-forest'}`} initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 6, ease: 'linear' }} />
    </div>
  )
  if (variant === 'glass') return inner(true)
  if (variant === 'dark') {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-forest-dark via-forest to-forest-dark p-6 shadow-card">
        <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-lime/10 blur-2xl" />
        <div className="relative flex items-center gap-5">
          {showLimmy && <Limmy size={56} float className="hidden sm:block" />}
          <div className="flex-1">
            {title && <p className="mb-3 text-[12px] font-bold uppercase tracking-[.16em] text-lime">{title}</p>}
            {inner(true)}
          </div>
        </div>
      </motion.div>
    )
  }
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>{inner(false)}</motion.div>
}

// ── Inputs con etiqueta flotante (estilo del sistema) ───────
export function Field({ label, icon: Icon, type = 'text', value, onChange, locked, hint, error, className = '', right, ...rest }) {
  const [show, setShow] = useState(false)
  const [focus, setFocus] = useState(false)
  const filled = value !== undefined && value !== null && String(value) !== ''
  const up = focus || filled || type === 'date'
  const t = type === 'password' ? (show ? 'text' : 'password') : type
  return (
    <div className={className}>
      <label className={`group relative flex items-center gap-3 rounded-2xl border bg-white px-4 transition-all
        ${locked ? 'border-transparent bg-[#eef0ec]' : focus ? 'border-lime ring-4 ring-lime/15' : error ? 'border-red-300' : 'border-black/[.06] hover:border-lime/50'}`}
        style={{ minHeight: 54 }}>
        {Icon && <Icon size={18} className={locked ? 'text-black/40' : 'text-lime-dark'} />}
        <div className="relative flex-1 pt-2">
          <span className={`pointer-events-none absolute left-0 transition-all duration-200 ${up ? '-top-2 text-[11px] font-medium text-forest-dark/80' : 'top-[13px] text-[14px] text-black/70'}`}>{label}</span>
          <input type={t} value={value ?? ''} onChange={(e) => onChange?.(e.target.value)} readOnly={locked}
            onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
            className={`w-full bg-transparent pb-2 pt-3 text-[15px] outline-none ${locked ? 'cursor-not-allowed font-semibold text-black/80' : ''} ${!up ? 'text-transparent' : ''}`} {...rest} />
        </div>
        {type === 'password' && <button type="button" onClick={() => setShow((s) => !s)} className="text-black/40 hover:text-forest">{show ? <Eye size={18} /> : <EyeOff size={18} />}</button>}
        {type === 'date' && <CalendarDays size={18} className="pointer-events-none text-lime-dark" />}
        {locked && <Lock size={15} className="text-black/40" />}
        {right}
      </label>
      {hint && <p className="mt-1 pl-2 text-[11px] font-medium text-lime-dark">{hint}</p>}
      {error && <p className="mt-1 pl-2 text-[11px] font-medium text-red-500">{error}</p>}
    </div>
  )
}

export function SelectField({ label, icon: Icon, value, onChange, options, className = '', locked }) {
  return (
    <div className={className}>
      <label className={`relative flex items-center gap-3 rounded-2xl border px-4 transition-all focus-within:border-lime focus-within:ring-4 focus-within:ring-lime/15 ${locked ? 'border-transparent bg-[#eef0ec]' : 'border-black/[.06] bg-white hover:border-lime/50'}`} style={{ minHeight: 54 }}>
        {Icon && <Icon size={18} className="text-lime-dark" />}
        <div className="relative flex-1 pt-2">
          <span className="pointer-events-none absolute -top-2 left-0 text-[11px] font-medium text-forest-dark/80">{label}</span>
          <select value={value ?? ''} disabled={locked} onChange={(e) => onChange?.(e.target.value)} className="w-full appearance-none bg-transparent pb-2 pt-3 text-[15px] outline-none">
            {options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
          </select>
        </div>
        <ChevronDown size={18} className="pointer-events-none text-black/50" />
      </label>
    </div>
  )
}

// ── Modal con confirmación al cancelar ──────────────────────
export function Modal({ open, onClose, title, children, footer, width = 'max-w-xl', dirty = false }) {
  const [ask, setAsk] = useState(false)
  const tryClose = () => (dirty ? setAsk(true) : onClose())
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-[#2f3a28]/40 backdrop-blur-[3px]" onClick={tryClose} />
          <motion.div initial={{ opacity: 0, y: 30, scale: .94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: .96 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className={`relative flex max-h-[92vh] w-full ${width} flex-col rounded-[28px] bg-white shadow-2xl`}>
            <div className="flex items-center justify-between px-6 pb-2 pt-6">
              <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
              <button onClick={tryClose} className="grid h-8 w-8 place-items-center rounded-full text-black/40 hover:bg-black/5"><X size={18} /></button>
            </div>
            <div className="thin-scroll flex-1 overflow-y-auto px-6 pb-4 pt-2">{children}</div>
            {footer && <div className="px-6 pb-6 pt-2">{typeof footer === 'function' ? footer(tryClose) : footer}</div>}
            <ConfirmCancel open={ask} onNo={() => setAsk(false)} onYes={() => { setAsk(false); onClose() }} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function ConfirmCancel({ open, onNo, onYes }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="absolute inset-0 z-10 grid place-items-center rounded-[28px] bg-black/25 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div initial={{ scale: .85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: .9, opacity: 0 }} transition={{ type: 'spring', damping: 18, stiffness: 320 }}
            className="w-[300px] rounded-3xl bg-white p-5 text-center shadow-2xl">
            <p className="font-display text-lg font-bold">¿Seguro que quieres cancelar?</p>
            <p className="mt-1 text-xs text-black/50">Se descartarán las modificaciones no guardadas.</p>
            <div className="mt-4 flex gap-2">
              <button onClick={onNo} className="btn-ghost flex-1 !py-2 text-sm">No, Regresar</button>
              <button onClick={onYes} className="btn-lime flex-1 !py-2 text-sm">Sí, Cancelar</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function ConfirmDialog({ open, title, text, note, confirmText = 'Confirmar', danger, onCancel, onConfirm, loading }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-[#2f3a28]/45 backdrop-blur-[3px]" onClick={onCancel} />
          <motion.div initial={{ scale: .88, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: .94, opacity: 0 }} transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative w-full max-w-md rounded-[26px] bg-white p-6 shadow-2xl">
            <h3 className="font-display text-xl font-bold">{title}</h3>
            <p className="mt-2 text-sm text-black/60">{text}</p>
            {note && <p className="mt-2 text-xs text-black/40">{note}</p>}
            <div className="mt-6 flex gap-3">
              <button onClick={onCancel} className="flex-1 rounded-full py-2.5 font-semibold text-black/60 hover:bg-black/5">Cancelar</button>
              <button onClick={onConfirm} disabled={loading} className={`${danger ? 'btn-danger' : 'btn-lime'} flex-1`}>{loading ? 'Procesando…' : confirmText}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Utilidades visuales ─────────────────────────────────────
export function Section({ title, right, children, className = '', delay = 0 }) {
  return (
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: .45, ease: 'easeOut' }} className={`card p-6 ${className}`}>
      {(title || right) && <div className="mb-4 flex flex-wrap items-center justify-between gap-3">{title && <h2 className="font-display text-xl font-extrabold text-ink">{title}</h2>}{right}</div>}
      {children}
    </motion.section>
  )
}

export function Segmented({ options, value, onChange, className = '' }) {
  return (
    <div className={`inline-flex rounded-2xl bg-[#eef0ec] p-1 ${className}`}>
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} className="relative rounded-xl px-5 py-2 text-sm font-semibold">
          {value === o && <motion.span layoutId={'seg' + options.join()} className="absolute inset-0 rounded-xl bg-lime shadow-lime" transition={{ type: 'spring', damping: 24, stiffness: 320 }} />}
          <span className={`relative ${value === o ? 'text-ink' : 'text-black/55'}`}>{o}</span>
        </button>
      ))}
    </div>
  )
}

export function Badge({ children, tone = 'lime' }) {
  const tones = {
    lime: 'bg-lime/25 text-forest-dark', green: 'bg-forest text-white', yellow: 'bg-lemon/50 text-[#7a6500]', red: 'bg-red-100 text-red-600',
    blue: 'bg-sky-100 text-sky-700', gray: 'bg-black/5 text-black/50', orange: 'bg-orange-100 text-orange-600',
  }
  return <span className={`chip ${tones[tone]}`}>{children}</span>
}

export function Avatar({ u, size = 36, className = '' }) {
  const letter = (u?.nombre || '?')[0]
  return u?.foto
    ? <img src={u.foto} className={`rounded-full object-cover ${className}`} style={{ width: size, height: size }} />
    : <span className={`grid place-items-center rounded-full bg-lime/30 font-bold text-forest-dark ${className}`} style={{ width: size, height: size, fontSize: size * .4 }}>{letter}</span>
}

export function Empty({ icon: Icon, title, text }) {
  return (
    <div className="grid place-items-center py-14 text-center">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-sage-soft"><Icon size={34} className="text-forest" /></div>
      <p className="mt-4 font-display text-lg font-bold">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-black/50">{text}</p>
    </div>
  )
}

export function Progress({ value, className = '', color = 'bg-lime' }) {
  return (
    <div className={`h-2.5 overflow-hidden rounded-full bg-black/[.06] ${className}`}>
      <motion.div className={`h-full rounded-full ${color}`} initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
    </div>
  )
}
