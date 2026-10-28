// Datos de demostración. Simulan lo que en producción vendrá de la base de datos.
const today = new Date()
const pad = (n) => String(n).padStart(2, '0')
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const addDays = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return iso(d) }
const bdayToday = (year) => `${year}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`

export const cursos = [
  { id: 1, nombre: 'CURSO BABIES (3-4 AÑOS)', tipo: 'Grupal', precio: 1300, edadMin: 3, edadMax: 4, horas: 2, activo: true },
  { id: 2, nombre: 'CURSO PRESCHOOL (5-6 AÑOS)', tipo: 'Grupal', precio: 1300, edadMin: 5, edadMax: 6, horas: 2, activo: true },
  { id: 3, nombre: 'CURSO KIDS (7-11 AÑOS)', tipo: 'Grupal', precio: 1500, edadMin: 7, edadMax: 11, horas: 3, activo: true },
  { id: 4, nombre: 'CURSO TEENS AND ADULTS (+16 AÑOS)', tipo: 'Grupal', precio: 1800, edadMin: 16, edadMax: 99, horas: null, activo: true },
  { id: 5, nombre: 'CURSO 2 HORAS SEMANALES', tipo: 'Personalizado', precio: 2100, edadMin: 3, edadMax: 99, horas: 2, activo: true },
  { id: 6, nombre: 'CURSO 3 HORAS SEMANALES', tipo: 'Personalizado', precio: 2900, edadMin: 3, edadMax: 99, horas: 3, activo: true },
  { id: 7, nombre: 'CURSO 5 HORAS SEMANALES', tipo: 'Personalizado', precio: 3400, edadMin: 3, edadMax: 99, horas: 5, activo: true },
]

const alumno = (id, nombre, apPaterno, apMaterno, fechaNac, nivel, cursoId, extra = {}) => ({
  id, rol: 'Alumno', matricula: `STUD-${pad(id - 100).padStart(3, '0')}`,
  usuario: `alu_${nombre[0].toLowerCase()}_${apPaterno.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')}_${String(id - 100).padStart(3, '0')}`,
  nombre, apPaterno, apMaterno, fechaNac, correo: `${nombre.split(' ')[0].toLowerCase()}@lemon.com`, password: 'Lemon123',
  foto: null, estado: true, fechaReg: '2026-08-01', nivel, modulo: 2, cursoId, tipoCurso: 'Grupal', diaPago: 15,
  lemonDollars: 0, racha: 0, xp: 0, progreso: 40, misionesHechas: 0, limmys: ['classic'], insignias: [], ...extra,
})

export const usuarios = [
  { id: 1, rol: 'Administrador', matricula: 'ADM-001', usuario: 'admin_root', nombre: 'Admin', apPaterno: 'Lemon', apMaterno: 'Tree', fechaNac: '1990-08-15', correo: 'admin@lemon.com', password: 'Admin123', foto: null, estado: true, fechaReg: '2026-01-10' },
  { id: 2, rol: 'Administrador', matricula: 'ADM-002', usuario: 'adm_v_rocha_002', nombre: 'Valeria', apPaterno: 'Rocha', apMaterno: 'Quiroz', fechaNac: '2003-02-11', correo: 'valeria@lemon.com', password: 'Admin123', foto: null, estado: true, fechaReg: '2026-02-01' },
  { id: 11, rol: 'Profesor', matricula: 'PROF-001', usuario: 'prof_r_sosa_001', nombre: 'Roberto', apPaterno: 'Sosa', apMaterno: 'Luna', fechaNac: '1994-04-02', correo: 'roberto@lemon.com', password: 'Lemon123', foto: null, estado: true, fechaReg: '2026-03-01', sueldo: 12000, diaPago: 15, horasMes: 46 },
  { id: 12, rol: 'Profesor', matricula: 'PROF-002', usuario: 'prof_l_mendoza_002', nombre: 'Laura', apPaterno: 'Mendoza', apMaterno: 'Ríos', fechaNac: '1997-11-23', correo: 'laura@lemon.com', password: 'Lemon123', foto: null, estado: true, fechaReg: '2026-03-15', sueldo: 11000, diaPago: 15, horasMes: 38 },
  alumno(101, 'ANA', 'GÓMEZ', 'SOSA', '2018-05-14', 'Elementary', 1, { lemonDollars: 35, racha: 4, xp: 320, progreso: 62, misionesHechas: 5, limmys: ['classic', 'teacher'], insignias: ['primera'] }),
  alumno(102, 'CARLOS', 'RUIZ', 'MESA', '2015-09-20', 'Basal', 3, { diaPago: 28, lemonDollars: 12, racha: 0, xp: 90, progreso: 21, misionesHechas: 1 }),
  alumno(103, 'AMED', 'GARCÍA', 'NÚÑEZ', '2010-03-11', 'Average', 3, { lemonDollars: 58, racha: 9, xp: 610, progreso: 88, misionesHechas: 11, limmys: ['classic', 'teacher', 'astro'], insignias: ['primera', 'racha7', 'pronun'] }),
  alumno(104, 'MIGUEL ANGEL', 'FLORES', 'VIDAL', bdayToday(2012), 'Elementary', 4, { diaPago: 28, lemonDollars: 24, racha: 3, xp: 260, progreso: 45, misionesHechas: 4, limmys: ['classic'], insignias: ['primera'] }),
  alumno(105, 'ADRIAN', 'MIGUEL', 'ALARCÓN', '2011-01-19', 'Elementary', 1, { lemonDollars: 8, racha: 1, xp: 120, progreso: 30, misionesHechas: 2 }),
  alumno(106, 'MANUEL', 'MIGUEL', 'ALARCÓN', '2014-06-02', 'Elementary', 1, { lemonDollars: 0, racha: 0, xp: 20, progreso: 12, misionesHechas: 0 }),
  alumno(107, 'JAIR', 'IBARRA', 'LIMA', '2013-10-30', 'Elementary', 1, { lemonDollars: 44, racha: 12, xp: 540, progreso: 81, misionesHechas: 9, limmys: ['classic', 'teacher', 'astro'], insignias: ['primera', 'racha7'] }),
  alumno(108, 'SOFÍA', 'HERNÁNDEZ', 'PAZ', '2008-12-05', 'Basal', 4, { lemonDollars: 30, racha: 5, xp: 380, progreso: 55, misionesHechas: 6, insignias: ['primera'] }),
  alumno(109, 'DIEGO', 'TORRES', 'VEGA', '2007-07-17', 'Evolved', 4, { lemonDollars: 15, racha: 0, xp: 150, progreso: 25, misionesHechas: 2 }),
  alumno(110, 'REGINA', 'CRUZ', 'MORA', '2009-03-28', 'Average', 4, { lemonDollars: 66, racha: 15, xp: 720, progreso: 92, misionesHechas: 13, limmys: ['classic', 'teacher', 'astro', 'futbol'], insignias: ['primera', 'racha7', 'lector'] }),
]

export const grupos = [
  { id: 1, nombre: '8NV80', profesorId: 11, cursoId: 1, fechaCreacion: '2026-08-10', alumnos: [101, 105, 106, 107], horario: [{ dia: 'Lunes', hora: '16:00' }, { dia: 'Miércoles', hora: '16:00' }] },
  { id: 2, nombre: '8NV81', profesorId: 12, cursoId: 4, fechaCreacion: '2026-08-11', alumnos: [], horario: [{ dia: 'Martes', hora: '18:00' }] },
  { id: 3, nombre: '8NV82', profesorId: 11, cursoId: 4, fechaCreacion: '2026-08-12', alumnos: [104, 108, 109, 110], horario: [{ dia: 'Martes', hora: '19:00' }, { dia: 'Jueves', hora: '19:00' }] },
  { id: 4, nombre: '8NV83', profesorId: 12, cursoId: 3, fechaCreacion: '2026-08-13', alumnos: [102, 103], horario: [{ dia: 'Viernes', hora: '17:00' }] },
]

export const promociones = [
  { id: 1, titulo: 'Semana de promoción', descripcion: 'Obtén 15% de descuento en colegiatura mensual al pagar por adelantado.', tipoPromo: 'Descuento General', tipoDesc: 'Porcentaje (%)', valor: 15, inicio: '2026-06-01', fin: '2026-12-31', activa: true },
  { id: 2, titulo: 'Hermanos Lemon', descripcion: 'Descuento especial del 20% para cursos grupales de verano.', tipoPromo: 'Descuento General', tipoDesc: 'Porcentaje (%)', valor: 20, inicio: '2026-06-01', fin: '2026-06-30', activa: true },
  { id: 3, titulo: 'Inscripción $0', descripcion: 'Inscripción 100% gratuita para alumnos de nuevo ingreso.', tipoPromo: 'Inscripción $0', tipoDesc: 'Monto Fijo ($)', valor: 1500, inicio: '2026-08-01', fin: '2026-08-15', activa: false },
]

const meses = [['2026-08', 'Pagado'], ['2026-09', 'Pagado'], ['2026-10', 'Pagado'], ['2026-11', 'Pendiente']]
let pid = 1
export const pagos = usuarios.filter((u) => u.rol === 'Alumno').flatMap((a) =>
  meses.map(([m, est], i) => {
    const curso = cursos.find((c) => c.id === a.cursoId)
    let estado = est
    if ((a.id === 102 || a.id === 106) && i === 2) estado = 'Vencido'
    return { id: pid++, alumnoId: a.id, modulo: i + 1, cursoId: a.cursoId, monto: curso.precio, fecha: `${m}-${pad(a.diaPago)}`, estado }
  }))

export const actividad = [
  { id: 1, tipo: 'alumno', titulo: 'Nuevo Alumno registrado', desc: 'Ana Gómez se ha unido al curso Inglés B1.', fecha: addDays(-1) + ' 10:30', leida: false },
  { id: 2, tipo: 'pago', titulo: 'Pago pendiente', desc: 'Carlos Ruiz tiene un pago vencido de $1,500.', fecha: addDays(-1) + ' 09:15', leida: true },
  { id: 3, tipo: 'sistema', titulo: 'Mantenimiento del sistema', desc: 'El servidor entrará en mantenimiento a las 11:00 PM.', fecha: addDays(-3) + ' 22:00', leida: false },
  { id: 4, tipo: 'promo', titulo: 'Promoción Creada', desc: 'Se ha publicado la oferta "Verano Lemon".', fecha: addDays(-4) + ' 16:20', leida: true },
]

export const misiones = [
  {
    id: 1, titulo: 'Colors & Fruits', tipo: 'Quiz', grupoId: 1, alumnos: [], fechaLimite: addDays(2), recompensa: 5, xp: 40, creada: addDays(-2),
    preguntas: [
      { q: 'What color is a lemon?', opts: ['Blue', 'Yellow', 'Purple'], a: 1 },
      { q: '"Manzana" in English is…', opts: ['Apple', 'Orange', 'Grape'], a: 0 },
      { q: 'Choose the correct sentence', opts: ['I has a lemon', 'I have a lemon', 'I haves a lemon'], a: 1 },
    ],
    completadas: { 101: 100, 107: 67 },
  },
  {
    id: 2, titulo: 'Present Simple Challenge', tipo: 'Quiz', grupoId: 3, alumnos: [], fechaLimite: addDays(1), recompensa: 8, xp: 60, creada: addDays(-1),
    preguntas: [
      { q: 'She ___ to school every day.', opts: ['go', 'goes', 'going'], a: 1 },
      { q: 'They ___ English on Tuesdays.', opts: ['study', 'studies', 'studying'], a: 0 },
      { q: '___ you like pizza?', opts: ['Does', 'Do', 'Are'], a: 1 },
      { q: 'My dog ___ not like cats.', opts: ['do', 'does', 'is'], a: 1 },
    ],
    completadas: { 110: 100 },
  },
  {
    id: 3, titulo: 'Reading Tree: The Lost Lemon', tipo: 'Reading', grupoId: 3, alumnos: [], fechaLimite: addDays(5), recompensa: 10, xp: 80, creada: addDays(-3),
    lectura: 'Limmy was a small lemon who lived in a big tree. One windy day, Limmy fell from the tree and rolled into the city. He met a friendly dog, a busy bee and a kind girl named Lucy. Lucy helped Limmy go back home. Since that day, Limmy always says: "Be bright, be kind!"',
    preguntas: [
      { q: 'Where did Limmy live?', opts: ['In a big tree', 'In a house', 'In the sea'], a: 0 },
      { q: 'Who helped Limmy go home?', opts: ['A bee', 'Lucy', 'A dog'], a: 1 },
      { q: 'What does Limmy always say?', opts: ['Be fast!', 'Be bright, be kind!', 'Be quiet!'], a: 1 },
    ],
    completadas: { 110: 100, 108: 67 },
  },
  {
    id: 4, titulo: 'Pronunciation: TH sounds', tipo: 'Pronunciation', grupoId: 3, alumnos: [104], fechaLimite: addDays(4), recompensa: 6, xp: 50, creada: addDays(0),
    palabras: ['think', 'three', 'mother', 'weather'],
    preguntas: [],
    completadas: {},
  },
]

export const asistencias = [
  { id: 1, grupoId: 1, fecha: addDays(-2), registros: { 101: 'P', 105: 'P', 106: 'A', 107: 'P' } },
  { id: 2, grupoId: 3, fecha: addDays(-1), registros: { 104: 'P', 108: 'R', 109: 'A', 110: 'P' } },
]

export const observaciones = [
  { id: 1, alumnoId: 106, profesorId: 11, texto: 'Le cuesta participar en voz alta, reforzar con actividades en pareja.', fecha: addDays(-2) },
]

export const reservas = [
  { id: 1, alumnoId: 104, fecha: addDays(1), hora: '17:00' },
  { id: 2, alumnoId: 104, fecha: addDays(3), hora: '18:00' },
]

export const notificaciones = []
