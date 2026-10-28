import { todayISO } from '../../utils/format'

export function teacherData(db, user) {
  const grupos = db.grupos.filter((g) => g.profesorId === user.id)
  const ids = grupos.flatMap((g) => g.alumnos)
  const alumnos = db.usuarios.filter((u) => ids.includes(u.id) && u.estado)
  const grupoDe = (aid) => grupos.find((g) => g.alumnos.includes(aid))
  const misiones = db.misiones.filter((m) => grupos.some((g) => g.id === m.grupoId))
  const destinatarios = (m) => (m.alumnos?.length ? m.alumnos : db.grupos.find((g) => g.id === m.grupoId)?.alumnos || [])
  const pendientesDe = (aid) => misiones.filter((m) => destinatarios(m).includes(aid) && m.completadas[aid] === undefined)
  const ultimaAsistencia = (aid) => {
    const rec = db.asistencias.filter((a) => a.registros[aid]).sort((a, b) => b.fecha.localeCompare(a.fecha))[0]
    return rec?.registros[aid]
  }
  const alertas = []
  alumnos.forEach((a) => {
    const pend = pendientesDe(a.id)
    if (ultimaAsistencia(a.id) === 'A' && a.progreso < 30) alertas.push({ tipo: 'atencion', a, texto: 'Necesita atención inmediata', det: `Faltó a la última clase y su progreso es de ${a.progreso}%.` })
    else if (pend.length && a.racha === 0) alertas.push({ tipo: 'misiones', a, texto: 'No ha hecho sus misiones', det: `${pend.length} misión(es) pendiente(s) · racha en 0 días.` })
    if (a.progreso >= 80 || a.racha >= 9) alertas.push({ tipo: 'sobresaliente', a, texto: 'Alumno sobresaliente', det: `Progreso ${a.progreso}% · racha de ${a.racha} días.` })
  })
  const order = { atencion: 0, misiones: 1, sobresaliente: 2 }
  alertas.sort((x, y) => order[x.tipo] - order[y.tipo])
  return { grupos, alumnos, grupoDe, misiones, destinatarios, pendientesDe, ultimaAsistencia, alertas }
}

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
export function proximasClases(grupos, n = 4) {
  const out = []
  const now = new Date()
  for (let d = 0; d < 8 && out.length < 12; d++) {
    const date = new Date(now); date.setDate(now.getDate() + d)
    const dia = DIAS[date.getDay()]
    grupos.forEach((g) => g.horario?.forEach((h) => {
      if (h.dia === dia) {
        const [hh, mm] = h.hora.split(':').map(Number)
        const when = new Date(date); when.setHours(hh, mm, 0, 0)
        if (when > now) out.push({ g, when, hora: h.hora })
      }
    }))
  }
  return out.sort((a, b) => a.when - b.when).slice(0, n)
}

export const isToday = (d) => d.toISOString().slice(0, 10) === todayISO()
