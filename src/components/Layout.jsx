import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, ChevronDown, LogOut, Menu, ArrowUp, UserRound, History, PanelLeftClose, X, Blocks } from 'lucide-react'
import { Limmy } from './ui'
import { useApp } from '../context/AppContext'
import { PLATFORM, TENANT } from '../config/tenant'

export default function Layout({ nav, center, roleLabel, base, extraMenu = [] }) {
  const { user, logout, db } = useApp()
  const [collapsed, setCollapsed] = useState(false)
  const [mobile, setMobile] = useState(false)
  const [menu, setMenu] = useState(false)
  const [bell, setBell] = useState(false)
  const [showTop, setShowTop] = useState(false)
  const loc = useLocation()
  const navigate = useNavigate()

  const items = nav.filter((n) => !n.module || db.modulos.includes(n.module))
  const all = [...items, ...extraMenu]
  const current = all.find((n) => loc.pathname === n.to) || all.find((n) => n.to !== base && loc.pathname.startsWith(n.to)) || items[0]

  useEffect(() => { const f = () => setShowTop(window.scrollY > 260); window.addEventListener('scroll', f); return () => window.removeEventListener('scroll', f) }, [])
  useEffect(() => { window.scrollTo({ top: 0 }); setMobile(false); setMenu(false); setBell(false) }, [loc.pathname])

  const doLogout = () => { logout(); navigate('/login') }
  const unread = db.actividad.filter((a) => !a.leida).length

  const Side = ({ compact }) => (
    <div className={`flex h-full flex-col rounded-[30px] bg-gradient-to-b from-[#6f8f52] via-[#5e7e45] to-[#4c6a37] p-4 shadow-[0_30px_60px_-30px_rgba(47,68,35,.8)] transition-all duration-300 ${compact ? 'w-[88px]' : 'w-[262px]'}`}>
      <div className={`mb-6 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-3 ${compact ? 'justify-center' : ''}`}>
        <Limmy size={34} />
        {!compact && (
          <div className="leading-tight">
            <p className="font-display text-[15px] font-extrabold tracking-wide text-white">{TENANT.name.toUpperCase()}</p>
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-lime">{center}</p>
          </div>
        )}
      </div>
      <nav className="flex flex-1 flex-col gap-1.5">
        {items.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === base} title={n.label}
            className={({ isActive }) => `relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-medium transition-colors ${compact ? 'justify-center' : ''} ${isActive ? 'text-forest-deep' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}>
            {({ isActive }) => (
              <>
                {isActive && <motion.span layoutId="activePill" className="absolute inset-0 rounded-2xl bg-gradient-to-r from-lime to-[#a9c91c] shadow-lime" transition={{ type: 'spring', damping: 26, stiffness: 300 }} />}
                <n.icon size={20} className="relative" />
                {!compact && <span className="relative">{n.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <button onClick={doLogout} className={`mt-4 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3.5 text-[12px] font-bold uppercase tracking-[.14em] text-white transition hover:bg-white/20 ${compact ? 'justify-center' : ''}`}>
        <LogOut size={18} className="text-[#ff7a5c]" />{!compact && 'Cerrar sesión'}
      </button>
      {!compact && <p className="mt-3 text-center text-[10px] font-semibold tracking-[.12em] text-white/50">POWERED BY <span className="text-lime">{PLATFORM.name}</span></p>}
    </div>
  )

  return (
    <div className="app-bg min-h-full">
      <div className="mx-auto flex max-w-[1600px] gap-6 p-4 lg:p-5">
        {/* Sidebar escritorio */}
        <aside className="sticky top-5 hidden h-[calc(100vh-40px)] lg:block"><Side compact={collapsed} /></aside>

        {/* Sidebar móvil */}
        <AnimatePresence>
          {mobile && (
            <motion.div className="fixed inset-0 z-40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/30" onClick={() => setMobile(false)} />
              <motion.div className="absolute left-3 top-3 h-[calc(100%-24px)]" initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: 'spring', damping: 26 }}>
                <Side compact={false} />
                <button onClick={() => setMobile(false)} className="absolute -right-12 top-2 grid h-10 w-10 place-items-center rounded-full bg-white"><X size={18} /></button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="min-w-0 flex-1">
          {/* Header */}
          <header className="mb-5 flex items-center gap-4 py-2">
            <button onClick={() => (window.innerWidth < 1024 ? setMobile(true) : setCollapsed((c) => !c))}
              className="grid h-10 w-10 place-items-center rounded-xl bg-white text-forest shadow-sm transition hover:scale-105">
              {collapsed ? <Menu size={18} /> : <PanelLeftClose size={18} />}
            </button>
            <AnimatePresence mode="wait">
              <motion.h1 key={current?.title || current?.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="title-caps truncate text-base sm:text-lg">
                {current?.title || current?.label}
              </motion.h1>
            </AnimatePresence>
            <div className="ml-auto flex items-center gap-3">
              <div className="relative">
                <button onClick={() => { setBell((b) => !b); setMenu(false) }} className="relative grid h-10 w-10 place-items-center rounded-xl bg-white shadow-sm transition hover:scale-105">
                  <Bell size={18} />
                  {unread > 0 && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-lime" />}
                </button>
                <AnimatePresence>
                  {bell && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} className="absolute right-0 top-12 z-30 w-80 rounded-2xl bg-white p-3 shadow-2xl">
                      <p className="px-2 pb-2 text-xs font-bold uppercase tracking-[.14em] text-forest">Notificaciones</p>
                      {db.actividad.slice(0, 4).map((a) => (
                        <div key={a.id} className="rounded-xl px-2 py-2 hover:bg-sage-soft">
                          <p className="text-sm font-semibold">{a.titulo}</p><p className="text-xs text-black/50">{a.desc}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="relative">
                <button onClick={() => { setMenu((m) => !m); setBell(false) }} className="flex items-center gap-2 rounded-full border border-lime/40 bg-white py-1.5 pl-1.5 pr-3 shadow-sm transition hover:shadow-md">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-lime/80 text-sm font-bold text-forest-deep">{user?.nombre?.[0]}</span>
                  <span className="hidden text-sm font-bold sm:inline">{roleLabel}</span>
                  <ChevronDown size={16} className={`transition ${menu ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {menu && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} className="absolute right-0 top-12 z-30 w-60 rounded-2xl bg-white p-2 shadow-2xl">
                      <div className="border-b border-black/5 px-3 pb-2 pt-1">
                        <p className="text-sm font-bold">{user?.nombre} {user?.apPaterno}</p>
                        <p className="text-xs text-black/45">{user?.usuario}</p>
                      </div>
                      <button onClick={() => navigate(`${base}/perfil`)} className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-sage-soft"><UserRound size={16} /> Mi perfil</button>
                      {base === '/admin' && <button onClick={() => navigate('/admin/actividad')} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-sage-soft"><History size={16} /> Historial de actividad</button>}
                      {base === '/admin' && <button onClick={() => navigate('/admin/plataforma')} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-sage-soft"><Blocks size={16} /> Mi plan UPIICODE</button>}
                      <button onClick={doLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-500 hover:bg-red-50"><LogOut size={16} /> Cerrar sesión</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          <motion.div key={loc.pathname} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }}>
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Botón flotante Volver arriba */}
      <AnimatePresence>
        {showTop && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-2xl bg-forest p-2 shadow-soft">
            <button onClick={() => (window.innerWidth < 1024 ? setMobile(true) : setCollapsed((c) => !c))} className="grid h-9 w-9 place-items-center rounded-xl text-lime hover:bg-white/10"><Menu size={18} /></button>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 rounded-xl bg-lime px-4 py-2 text-sm font-semibold text-forest-deep"><ArrowUp size={16} /> Volver Arriba</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
