// ─────────────────────────────────────────────────────────────
//  CAPA DE SERVICIOS (backend simulado)
//  Todas las pantallas leen y escriben datos SOLO a través de este archivo.
//  Hoy guarda en localStorage del navegador; cuando exista la base de datos,
//  cada función se reemplaza por un fetch() al API real sin tocar las pantallas.
// ─────────────────────────────────────────────────────────────
import * as seed from '../data/seed'
import { LIMMYS } from '../data/catalogs'

const KEY = 'upiicode_lemontree_db_v2'
const listeners = new Set()
const wait = (ms = 350) => new Promise((r) => setTimeout(r, ms))
const clone = (o) => JSON.parse(JSON.stringify(o))
const todayISO = () => new Date().toISOString().slice(0, 10)

function freshDB() {
  return clone({
    cursos: seed.cursos, usuarios: seed.usuarios, grupos: seed.grupos, promociones: seed.promociones,
    pagos: seed.pagos, actividad: seed.actividad, misiones: seed.misiones, asistencias: seed.asistencias,
    observaciones: seed.observaciones, reservas: seed.reservas, notificaciones: seed.notificaciones, solicitudes: seed.solicitudes,
    modulos: ['usuarios', 'cobranza', 'expedientes', 'promociones', 'grupos', 'profesor', 'gamificacion', 'conversacion'],
  })
}

let db
try { db = JSON.parse(localStorage.getItem(KEY)) || freshDB() } catch { db = freshDB() }

function commit() {
  try { localStorage.setItem(KEY, JSON.stringify(db)) } catch { /* modo privado */ }
  listeners.forEach((fn) => fn(clone(db)))
}
const nextId = (arr) => (arr.length ? Math.max(...arr.map((x) => x.id)) + 1 : 1)
const log = (tipo, titulo, desc) => {
  const now = new Date()
  db.actividad.unshift({ id: nextId(db.actividad), tipo, titulo, desc, fecha: `${todayISO()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`, leida: false })
}

// Sincroniza en vivo entre pestañas del mismo navegador (ej. profesor y alumno lado a lado)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY || !e.newValue) return
    try { db = JSON.parse(e.newValue); listeners.forEach((fn) => fn(clone(db))) } catch { /* */ }
  })
}

export const store = {
  get: () => clone(db),
  subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn) },
}

// ── CRUD genérico ───────────────────────────────────────────
const crud = (col) => ({
  async list() { await wait(150); return clone(db[col]) },
  async create(data) {
    await wait()
    const item = { ...data, id: nextId(db[col]) }
    db[col].push(item); commit(); return clone(item)
  },
  async update(id, patch) {
    await wait()
    db[col] = db[col].map((x) => (x.id === id ? { ...x, ...patch } : x)); commit()
    return clone(db[col].find((x) => x.id === id))
  },
  async remove(id) { await wait(); db[col] = db[col].filter((x) => x.id !== id); commit() },
})

export const api = {
  cursos: crud('cursos'),
  grupos: crud('grupos'),
  promociones: crud('promociones'),
  actividad: crud('actividad'),
  misiones: crud('misiones'),
  observaciones: crud('observaciones'),

  auth: {
    async login(user, pass) {
      await wait(900)
      const u = db.usuarios.find((x) => (x.usuario.toLowerCase() === user.trim().toLowerCase() || x.matricula.toLowerCase() === user.trim().toLowerCase()))
      if (!u || u.password !== pass) throw new Error('Usuario o contraseña incorrectos')
      if (!u.estado) throw new Error('Tu cuenta está inhabilitada. Contacta a administración.')
      return clone(u)
    },
    demoUser(rol) {
      const id = { Administrador: 1, Profesor: 11, Alumno: 101 }[rol]
      return clone(db.usuarios.find((u) => u.id === id))
    },
  },

  usuarios: {
    ...crud('usuarios'),
    async create(data) {
      await wait(600)
      const id = nextId(db.usuarios)
      const u = { ...data, id, estado: true, fechaReg: todayISO() }
      if (u.rol === 'Alumno') Object.assign(u, { modulo: 1, lemonDollars: 0, racha: 0, xp: 0, progreso: 0, misionesHechas: 0, limmys: ['classic'], insignias: [] })
      db.usuarios.push(u)
      if (u.rol === 'Alumno') {
        const curso = db.cursos.find((c) => c.id === u.cursoId)
        db.pagos.push({ id: nextId(db.pagos), alumnoId: id, modulo: 1, cursoId: u.cursoId, monto: curso?.precio || 0, fecha: `${todayISO().slice(0, 8)}${String(u.diaPago).padStart(2, '0')}`, estado: 'Pendiente' })
      }
      log('alumno', `Nuevo ${u.rol} registrado`, `${u.nombre} ${u.apPaterno} se ha unido a la plataforma.`)
      commit(); return clone(u)
    },
    async inhabilitar(id) {
      await wait()
      const u = db.usuarios.find((x) => x.id === id); u.estado = !u.estado
      log('sistema', u.estado ? 'Usuario habilitado' : 'Usuario inhabilitado', `${u.nombre} ${u.apPaterno} (${u.usuario})`)
      commit()
    },
  },

  pagos: {
    ...crud('pagos'),
    async registrar(id) {
      await wait()
      const p = db.pagos.find((x) => x.id === id); p.estado = 'Pagado'
      const a = db.usuarios.find((u) => u.id === p.alumnoId)
      log('pago', 'Pago registrado', `${a.nombre} ${a.apPaterno} pagó $${p.monto.toLocaleString('es-MX')}.`)
      commit()
    },
  },

  asistencia: {
    async guardar(grupoId, fecha, registros) {
      await wait(500)
      const ex = db.asistencias.find((a) => a.grupoId === grupoId && a.fecha === fecha)
      if (ex) ex.registros = registros
      else db.asistencias.push({ id: nextId(db.asistencias), grupoId, fecha, registros })
      const g = db.grupos.find((x) => x.id === grupoId)
      const prof = db.usuarios.find((u) => u.id === g.profesorId)
      if (!ex && prof) prof.horasMes = (prof.horasMes || 0) + 2
      commit()
    },
  },

  reconocimientos: {
    async lemonDollars(alumnoId, cantidad) {
      await wait(250)
      const a = db.usuarios.find((u) => u.id === alumnoId)
      a.lemonDollars = Math.max(0, (a.lemonDollars || 0) + cantidad)
      db.notificaciones.push({ id: nextId(db.notificaciones), alumnoId, texto: `¡Tu profesor te dio ${cantidad} Lemon Dollars!`, fecha: todayISO() })
      commit()
    },
    async insignia(alumnoId, key) {
      await wait(300)
      const a = db.usuarios.find((u) => u.id === alumnoId)
      if (!a.insignias.includes(key)) a.insignias.push(key)
      db.notificaciones.push({ id: nextId(db.notificaciones), alumnoId, texto: '¡Ganaste una nueva insignia!', fecha: todayISO() })
      commit()
    },
  },

  alumno: {
    async completarMision(alumnoId, misionId, score) {
      await wait(400)
      const m = db.misiones.find((x) => x.id === misionId)
      const a = db.usuarios.find((u) => u.id === alumnoId)
      const first = m.completadas[alumnoId] === undefined
      m.completadas[alumnoId] = score
      let unlocked = null
      if (first) {
        a.misionesHechas += 1
        a.lemonDollars += Math.round(m.recompensa * (score / 100))
        a.xp += m.xp
        a.progreso = Math.min(100, a.progreso + 6)
        a.racha = Math.max(1, a.racha + (a.ultimaPractica === todayISO() ? 0 : 1))
        a.ultimaPractica = todayISO()
        if (!a.insignias.includes('primera')) a.insignias.push('primera')
        if (score === 100 && !a.insignias.includes('perfecto')) a.insignias.push('perfecto')
        if (m.tipo === 'Pronunciation' && !a.insignias.includes('pronun')) a.insignias.push('pronun')
        const next = LIMMYS.find((l) => !a.limmys.includes(l.key) && a.misionesHechas >= l.need)
        if (next) { a.limmys.push(next.key); unlocked = next }
      }
      commit()
      return { unlocked, alumno: clone(a) }
    },
    async reservar(alumnoId, fecha, hora) {
      await wait(400)
      db.reservas.push({ id: nextId(db.reservas), alumnoId, fecha, hora }); commit()
    },
    async cancelarReserva(id) { await wait(300); db.reservas = db.reservas.filter((r) => r.id !== id); commit() },
    async leerNotificaciones(alumnoId) { db.notificaciones = db.notificaciones.filter((n) => n.alumnoId !== alumnoId); commit() },
  },

  solicitudes: {
    ...crud('solicitudes'),
    async enviar(data) {
      await wait(900)
      const item = { ...data, id: nextId(db.solicitudes), fecha: todayISO(), estado: 'Recibida' }
      db.solicitudes.unshift(item)
      log('sistema', 'Solicitud enviada a UPIICODE', `"${data.titulo}" · cotización preliminar ${'$'}${data.cotizacion.min.toLocaleString('es-MX')} - ${'$'}${data.cotizacion.max.toLocaleString('es-MX')}`)
      commit(); return clone(item)
    },
    async avanzar(id, estado) {
      await wait(500)
      const s = db.solicitudes.find((x) => x.id === id); s.estado = estado; commit()
    },
  },

  plataforma: {
    async toggleModulo(key) {
      await wait(250)
      db.modulos = db.modulos.includes(key) ? db.modulos.filter((m) => m !== key) : [...db.modulos, key]
      commit()
    },
  },

  async reset() { db = freshDB(); commit() },
}
