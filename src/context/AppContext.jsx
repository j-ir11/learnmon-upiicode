import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import { api, store } from '../services/api'

const Ctx = createContext(null)
const SESSION = 'upiicode_session'

export function AppProvider({ children }) {
  const [db, setDb] = useState(store.get())
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(SESSION)) } catch { return null }
  })
  const [toasts, setToasts] = useState([])

  useEffect(() => store.subscribe(setDb), [])

  const login = (u) => { setUser(u); try { sessionStorage.setItem(SESSION, JSON.stringify(u)) } catch { /* */ } }
  const logout = () => { setUser(null); try { sessionStorage.removeItem(SESSION) } catch { /* */ } }

  const toast = useCallback((msg, type = 'ok') => {
    const id = Math.random()
    setToasts((t) => [...t, { id, msg, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  // Usuario siempre actualizado desde la "BD"
  const me = user ? db.usuarios.find((u) => u.id === user.id) || user : null

  return (
    <Ctx.Provider value={{ db, api, user: me, login, logout, toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id}
              initial={{ opacity: 0, y: 24, scale: .9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .95 }}
              className="pointer-events-auto flex items-center gap-2 rounded-full bg-forest-deep px-5 py-3 text-sm font-medium text-white shadow-soft">
              {t.type === 'ok' && <CheckCircle2 size={18} className="text-lime" />}
              {t.type === 'warn' && <AlertTriangle size={18} className="text-lemon" />}
              {t.type === 'info' && <Info size={18} className="text-sage" />}
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  )
}

export const useApp = () => useContext(Ctx)
