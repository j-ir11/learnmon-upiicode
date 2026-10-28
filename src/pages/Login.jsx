import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { IdCard, Lock, ShieldCheck, GraduationCap, Presentation, X } from 'lucide-react'
import { Blobs, Field, Limmy, PhraseBanner } from '../components/ui'
import { useApp } from '../context/AppContext'
import { PLATFORM, TENANT } from '../config/tenant'

export const homeFor = (rol) => ({ Administrador: '/admin', Profesor: '/profesor', Alumno: '/alumno' }[rol])

export default function Login() {
  const { api, login, toast } = useApp()
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [demo, setDemo] = useState(false)
  const [shake, setShake] = useState(0)
  const navigate = useNavigate()

  const enter = (u) => {
    setTimeout(() => { login(u); navigate(homeFor(u.rol)) }, 1500)
  }

  const submit = async (e) => {
    e.preventDefault(); setError('')
    if (!user || !pass) { setError('Ingresa tu matrícula/usuario y contraseña.'); setShake((s) => s + 1); return }
    setVerifying(true)
    try { const u = await api.auth.login(user, pass); enter(u) } catch (err) { setVerifying(false); setError(err.message); setShake((s) => s + 1); toast(err.message, 'warn') }
  }

  const quick = (rol) => { setDemo(false); setVerifying(true); enter(api.auth.demoUser(rol)) }

  return (
    <div className="relative grid min-h-full place-items-center overflow-hidden bg-gradient-to-br from-[#3f5f2d] via-[#58782f] to-[#a8c92a] p-4">
      <Blobs dark />
      <AnimatePresence mode="wait">
        {!verifying ? (
          <motion.div key="card" initial={{ opacity: 0, scale: .92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0, x: shake ? [0, -10, 10, -6, 6, 0] : 0 }}
            exit={{ opacity: 0, scale: .96 }} transition={{ type: 'spring', damping: 20, stiffness: 180, x: { duration: .4 } }}
            className="relative grid w-full max-w-[880px] overflow-hidden rounded-[34px] shadow-[0_40px_80px_-30px_rgba(0,0,0,.5)] md:grid-cols-[1fr_1.1fr]">
            {/* Lado izquierdo */}
            <div className="relative hidden flex-col bg-gradient-to-br from-[#4d6b37]/95 to-[#3c5529]/95 p-10 backdrop-blur md:flex">
              <span className="self-start rounded-full border border-lime/60 bg-lime/10 px-4 py-1.5 text-[11px] font-bold tracking-[.16em] text-lime">{TENANT.fullName.toUpperCase()}</span>
              <div className="mt-8 self-center"><Limmy size={140} float /></div>
              <h2 className="mt-6 font-display text-[28px] font-extrabold leading-tight text-white">“Welcome to the tree, lemon.”</h2>
              <div className="mt-6"><PhraseBanner variant="glass" /></div>
            </div>

            {/* Formulario */}
            <form onSubmit={submit} className="flex flex-col justify-center bg-white p-8 sm:p-11">
              <div className="mb-6 flex justify-center md:hidden"><Limmy size={84} float /></div>
              <h1 className="font-display text-3xl font-extrabold text-ink">Inicia Sesión</h1>
              <p className="mb-7 text-sm font-semibold text-forest/80">Tu portal de aprendizaje fresco.</p>
              <div className="space-y-4">
                <Field label="Matrícula o Usuario" icon={IdCard} value={user} onChange={setUser} autoComplete="username" />
                <Field label="Contraseña" icon={Lock} type="password" value={pass} onChange={setPass} autoComplete="current-password" />
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <label className="flex cursor-pointer items-center gap-2 font-semibold text-black/60">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-5 w-5 rounded-md accent-lime" /> Recordarme
                </label>
                <button type="button" onClick={() => toast('Te enviamos un enlace a tu correo registrado 📩', 'info')} className="font-bold text-forest hover:underline">¿Olvidaste tu clave?</button>
              </div>
              <AnimatePresence>{error && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-500">{error}</motion.p>}</AnimatePresence>
              <motion.button whileHover={{ y: -2 }} whileTap={{ scale: .98 }} className="mt-6 rounded-full bg-lime py-3 font-bold text-ink shadow-lime">Iniciar Sesión</motion.button>
              <button type="button" onClick={() => setDemo(true)} className="mt-5 text-xs font-bold tracking-[.2em] text-lime-dark hover:text-forest">ACCESO RÁPIDO DEMO</button>
              <p className="mt-6 text-center text-[10px] font-semibold tracking-[.16em] text-black/30">POWERED BY {PLATFORM.name}</p>
            </form>

            {/* Panel de acceso rápido */}
            <AnimatePresence>
              {demo && (
                <motion.div className="absolute inset-0 z-10 grid place-items-center bg-black/30 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.div initial={{ scale: .9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .9, y: 20 }} className="relative w-[340px] rounded-3xl bg-white p-6 shadow-2xl">
                    <button onClick={() => setDemo(false)} className="absolute right-4 top-4 text-black/40"><X size={18} /></button>
                    <p className="font-display text-xl font-bold">Acceso rápido demo</p>
                    <p className="mb-4 text-xs text-black/50">Elige un rol para explorar el prototipo.</p>
                    {[['Administrador', ShieldCheck, 'Gestión de la escuela'], ['Profesor', Presentation, 'Grupos, asistencia y misiones'], ['Alumno', GraduationCap, 'App Learnmon gamificada']].map(([r, I, d], i) => (
                      <motion.button key={r} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .08 * i }} onClick={() => quick(r)}
                        className="mb-2 flex w-full items-center gap-3 rounded-2xl border border-black/5 p-3 text-left transition hover:border-lime hover:bg-lime/10">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime/25 text-forest"><I size={20} /></span>
                        <span><span className="block text-sm font-bold">{r}</span><span className="text-xs text-black/50">{d}</span></span>
                      </motion.button>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div key="verify" className="fixed inset-0 grid place-items-center bg-[#fbfbf4]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Blobs />
            <div className="relative flex flex-col items-center">
              <motion.div animate={{ scale: [1, 1.08, 1], rotate: [0, -4, 4, 0] }} transition={{ duration: 1.1, repeat: Infinity }}><Limmy size={110} /></motion.div>
              <p className="mt-6 text-sm font-bold tracking-[.12em] text-forest">VERIFICANDO CREDENCIALES<motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>…</motion.span></p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
