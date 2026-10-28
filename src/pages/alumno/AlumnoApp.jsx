import { useState } from 'react'
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Target, Sparkles, MessagesSquare, Mic, Wallet, Flame, Coins, LogOut, Bell, Zap } from 'lucide-react'
import { Limmy, Blobs } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { PLATFORM, TENANT } from '../../config/tenant'
import Inicio from './Inicio'
import Misiones from './Misiones'
import Coleccion from './Coleccion'
import Conversacion from './Conversacion'
import Lab from './Lab'
import Pagos from './Pagos'

const NAV = [
  { to: '/alumno', label: 'Inicio', icon: Home },
  { to: '/alumno/misiones', label: 'Misiones', icon: Target },
  { to: '/alumno/coleccion', label: 'Colección', icon: Sparkles },
  { to: '/alumno/lab', label: 'Pronunciation Lab', short: 'Lab', icon: Mic },
  { to: '/alumno/conversacion', label: 'Conversación', short: 'Speak', icon: MessagesSquare, module: 'conversacion' },
  { to: '/alumno/pagos', label: 'Mis pagos', short: 'Pagos', icon: Wallet },
]

export default function AlumnoApp() {
  const { user, db, logout, api } = useApp()
  const loc = useLocation()
  const navigate = useNavigate()
  const [bell, setBell] = useState(false)
  const notis = db.notificaciones.filter((n) => n.alumnoId === user.id)
  const nav = NAV.filter((n) => !n.module || db.modulos.includes(n.module))

  if (!db.modulos.includes('gamificacion')) {
    return (
      <div className="grid min-h-full place-items-center bg-[#fbfbf4] p-6 text-center">
        <div><Limmy size={110} /><p className="mt-4 font-display text-2xl font-bold">La app del alumno no está activa</p><p className="text-sm text-black/50">Tu escuela aún no contrata el módulo de gamificación de {PLATFORM.name}.</p>
          <button onClick={() => { logout(); navigate('/login') }} className="btn-lime mt-5">Volver</button></div>
      </div>
    )
  }

  return (
    <div className="relative min-h-full bg-[#fbfbf2]">
      <div className="fixed inset-0"><Blobs /></div>
      {/* Barra superior */}
      <header className="sticky top-0 z-30 border-b border-black/5 bg-[#fbfbf2]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Limmy size={38} />
          <div className="leading-none">
            <p className="font-display text-2xl font-extrabold text-forest">{TENANT.appName.slice(0, 5)}<span className="text-lime-dark">{TENANT.appName.slice(5)}</span></p>
            <p className="text-[9px] font-bold tracking-[.2em] text-black/35">BY {TENANT.name.toUpperCase()}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <motion.span key={user.racha} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="chip bg-orange-100 !px-3 !py-1.5 !text-sm text-orange-600"><Flame size={16} fill="currentColor" /> {user.racha}</motion.span>
            <motion.span key={user.lemonDollars} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="chip bg-lemon/40 !px-3 !py-1.5 !text-sm text-[#7a6500]"><Coins size={16} /> {user.lemonDollars}</motion.span>
            <span className="chip hidden bg-lime/25 !px-3 !py-1.5 !text-sm text-forest sm:inline-flex"><Zap size={16} fill="currentColor" /> {user.xp} XP</span>
            <div className="relative">
              <button onClick={() => { setBell((b) => !b); if (!bell) setTimeout(() => api.alumno.leerNotificaciones(user.id), 2500) }} className="relative grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm"><Bell size={18} />
                {notis.length > 0 && <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.4 }} className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white">{notis.length}</motion.span>}
              </button>
              <AnimatePresence>{bell && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute right-0 top-12 w-72 rounded-2xl bg-white p-3 shadow-2xl">
                  <p className="px-1 pb-2 text-xs font-bold uppercase tracking-wider text-forest">Mensajes de Limmy</p>
                  {notis.length ? notis.map((n) => <p key={n.id} className="rounded-xl px-2 py-2 text-sm hover:bg-sage-soft">{n.texto}</p>) : <p className="px-2 py-3 text-sm text-black/50">¡Estás al día!</p>}
                </motion.div>)}
              </AnimatePresence>
            </div>
            <button onClick={() => { logout(); navigate('/login') }} title="Cerrar sesión" className="grid h-10 w-10 place-items-center rounded-full bg-white text-black/50 shadow-sm hover:text-red-500"><LogOut size={17} /></button>
          </div>
        </div>
      </header>

      <div className="relative mx-auto flex max-w-6xl gap-6 px-4 pb-28 pt-6 lg:pb-10">
        {/* Navegación lateral */}
        <nav className="sticky top-24 hidden h-fit w-56 shrink-0 flex-col gap-1 lg:flex">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/alumno'} className={({ isActive }) => `relative flex items-center gap-3 rounded-2xl border-2 px-4 py-3 font-display text-[15px] font-bold uppercase tracking-wide transition ${isActive ? 'border-lime bg-lime/15 text-forest' : 'border-transparent text-black/45 hover:bg-black/[.03]'}`}>
              <n.icon size={22} /> {n.label}
            </NavLink>
          ))}
          <p className="mt-6 px-4 text-[10px] font-bold tracking-[.16em] text-black/30">POWERED BY {PLATFORM.name}</p>
        </nav>

        <main className="min-w-0 flex-1">
          <motion.div key={loc.pathname} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }}>
            <Routes>
              <Route index element={<Inicio />} />
              <Route path="misiones" element={<Misiones />} />
              <Route path="coleccion" element={<Coleccion />} />
              <Route path="lab" element={<Lab />} />
              <Route path="conversacion" element={<Conversacion />} />
              <Route path="pagos" element={<Pagos />} />
            </Routes>
          </motion.div>
        </main>
      </div>

      {/* Barra inferior móvil */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-black/5 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
        {nav.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/alumno'} className={({ isActive }) => `flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[10px] font-bold ${isActive ? 'text-forest' : 'text-black/35'}`}>
            {({ isActive }) => (<><motion.span animate={{ scale: isActive ? 1.15 : 1 }}><n.icon size={22} /></motion.span>{n.short || n.label}</>)}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
