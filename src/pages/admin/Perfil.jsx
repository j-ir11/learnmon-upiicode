import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserRound, CalendarDays, Mail, IdCard, Camera } from 'lucide-react'
import { Field } from '../../components/ui'
import { useApp } from '../../context/AppContext'

export default function Perfil() {
  const { user, api, toast } = useApp()
  const [f, setF] = useState({ ...user })
  const [busy, setBusy] = useState(false)
  const set = (p) => setF((x) => ({ ...x, ...p }))
  const save = async () => { setBusy(true); await api.usuarios.update(user.id, { nombre: f.nombre, apPaterno: f.apPaterno, apMaterno: f.apMaterno, fechaNac: f.fechaNac, correo: f.correo, foto: f.foto }); setBusy(false); toast('Perfil actualizado') }
  const photo = (file) => { if (!file) return; const r = new FileReader(); r.onload = () => set({ foto: r.result }); r.readAsDataURL(file) }

  return (
    <div className="space-y-6">
      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-extrabold">Perfil de Usuario</motion.h2>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} className="h-fit rounded-[28px] bg-gradient-to-br from-forest to-forest-dark p-8 text-center text-white shadow-card">
          <label className="relative mx-auto grid h-28 w-28 cursor-pointer place-items-center overflow-hidden rounded-full bg-white text-5xl font-bold text-forest">
            {f.foto ? <img src={f.foto} className="h-full w-full object-cover" /> : f.nombre?.[0]}
            <span className="absolute bottom-1 right-1 grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-lime text-forest-deep"><Camera size={14} /></span>
            <input type="file" accept="image/*" hidden onChange={(e) => photo(e.target.files[0])} />
          </label>
          <p className="mt-4 font-display text-xl font-extrabold">{f.nombre} {f.apPaterno}</p>
          <p className="text-sm font-semibold text-lime">{user.usuario}</p>
          <p className="mt-1 text-xs font-bold text-lime">Nivel de Acceso: {user.rol}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }} className="card space-y-4 p-6">
          <h3 className="font-display text-lg font-extrabold text-forest">Datos del Usuario</h3>
          <Field label="Nombre" icon={UserRound} value={f.nombre} onChange={(v) => set({ nombre: v })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Apellido Paterno" icon={UserRound} value={f.apPaterno} onChange={(v) => set({ apPaterno: v })} />
            <Field label="Apellido Materno" icon={UserRound} value={f.apMaterno} onChange={(v) => set({ apMaterno: v })} />
          </div>
          <Field label="Fecha de Nacimiento" icon={CalendarDays} type="date" value={f.fechaNac} onChange={(v) => set({ fechaNac: v })} />
          <Field label="Correo Electrónico" icon={Mail} value={f.correo} onChange={(v) => set({ correo: v })} />
          <Field label="Nombre de Usuario (Solo Lectura)" icon={IdCard} value={f.usuario} locked />
          <button onClick={save} disabled={busy} className="btn-lime w-full !py-3">{busy ? 'Guardando…' : 'Guardar Cambios de Perfil'}</button>
        </motion.div>
      </div>
    </div>
  )
}
