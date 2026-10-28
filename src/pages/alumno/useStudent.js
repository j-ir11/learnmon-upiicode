import { useState } from 'react'
import { useApp } from '../../context/AppContext'

export function useStudent() {
  const { db, user, api, toast } = useApp()
  const grupo = db.grupos.find((g) => g.alumnos.includes(user.id))
  const misiones = db.misiones.filter((m) => (m.alumnos?.length ? m.alumnos.includes(user.id) : m.grupoId === grupo?.id))
  const pendientes = misiones.filter((m) => m.completadas[user.id] === undefined)
  const hechas = misiones.filter((m) => m.completadas[user.id] !== undefined)
  const [playing, setPlaying] = useState(null)
  const finish = async (score) => {
    const r = await api.alumno.completarMision(user.id, playing.id, score)
    return { unlocked: r.unlocked }
  }
  return { db, user, api, toast, grupo, misiones, pendientes, hechas, playing, setPlaying, finish }
}
