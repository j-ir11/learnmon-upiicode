import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Blobs, Limmy } from '../components/ui'
import { PLATFORM, TENANT } from '../config/tenant'

export default function Splash() {
  const [phase, setPhase] = useState(0) // 0 vacío · 1 logo · 2 bienvenida
  const [leaving, setLeaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const a = setTimeout(() => setPhase(1), 350)
    const b = setTimeout(() => setPhase(2), 2700)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, [])

  const go = () => { setLeaving(true); setTimeout(() => navigate('/login'), 450) }

  return (
    <motion.div className="relative grid min-h-full place-items-center overflow-hidden bg-[#fbfbf4]" animate={{ opacity: leaving ? 0 : 1 }} transition={{ duration: .45 }}>
      <Blobs />
      <div className="relative flex flex-col items-center px-6 text-center">
        <AnimatePresence>
          {phase >= 1 && (
            <motion.div layout initial={{ scale: 0, rotate: -25, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 11, stiffness: 160, layout: { duration: .7, ease: [.22, 1, .36, 1] } }}>
              <Limmy size={phase === 2 ? 120 : 150} float={phase === 2} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {phase === 1 && (
            <motion.div key="brand" className="mt-10 flex flex-col items-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ delay: .5 }}>
              <p className="text-[13px] font-semibold tracking-[.5em] text-forest/70">{TENANT.name.toUpperCase()}</p>
              <div className="mt-3 h-[3px] w-20 overflow-hidden rounded-full bg-sage/60">
                <motion.div className="h-full bg-lime" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.6, delay: .6 }} />
              </div>
            </motion.div>
          )}
          {phase === 2 && (
            <motion.div key="hero" className="mt-8 flex max-w-xl flex-col items-center" initial="h" animate="s" variants={{ s: { transition: { staggerChildren: .18 } } }}>
              <motion.h1 variants={{ h: { opacity: 0, y: 18 }, s: { opacity: 1, y: 0 } }} className="font-display text-4xl font-extrabold leading-[1.1] text-ink sm:text-5xl">
                {TENANT.heroTitle.split(' también ')[0]} también<br />{TENANT.heroTitle.split(' también ')[1]}
              </motion.h1>
              <motion.p variants={{ h: { opacity: 0, y: 14 }, s: { opacity: 1, y: 0 } }} className="mt-4 max-w-md text-sm text-black/50">{TENANT.heroSubtitle}</motion.p>
              <motion.button variants={{ h: { opacity: 0, y: 14, scale: .95 }, s: { opacity: 1, y: 0, scale: 1 } }} whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }}
                onClick={go} className="mt-8 w-full max-w-sm rounded-full bg-lime py-3.5 font-semibold text-ink shadow-lime">{TENANT.heroCta}</motion.button>
              <motion.p variants={{ h: { opacity: 0 }, s: { opacity: 1 } }} className="mt-4 text-sm font-semibold italic text-lime-dark">{TENANT.heroFoot}</motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: phase === 2 ? 1 : 0 }} transition={{ delay: 1 }}
        className="absolute bottom-6 text-[11px] font-semibold tracking-[.2em] text-forest/50">PLATAFORMA <span className="text-forest">{PLATFORM.name}</span></motion.p>
    </motion.div>
  )
}
