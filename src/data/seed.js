// Datos de demostración: UN ejemplo de cada cosa para que la demo sea clara.
// En producción esto vendrá de la base de datos.
const today = new Date()
const pad = (n) => String(n).padStart(2, '0')
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const addDays = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return iso(d) }
const monthOffset = (k) => { const d = new Date(today.getFullYear(), today.getMonth() + k, 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}` }

// Catálogo real de cursos de Lemon Tree
export const cursos = [
  { id: 1, nombre: 'CURSO BABIES (3-4 AÑOS)', tipo: 'Grupal', precio: 1300, edadMin: 3, edadMax: 4, horas: 2, activo: true },
  { id: 2, nombre: 'CURSO PRESCHOOL (5-6 AÑOS)', tipo: 'Grupal', precio: 1300, edadMin: 5, edadMax: 6, horas: 2, activo: true },
  { id: 3, nombre: 'CURSO KIDS (7-11 AÑOS)', tipo: 'Grupal', precio: 1500, edadMin: 7, edadMax: 11, horas: 3, activo: true },
  { id: 4, nombre: 'CURSO TEENS AND ADULTS (+16 AÑOS)', tipo: 'Grupal', precio: 1800, edadMin: 16, edadMax: 99, horas: null, activo: true },
  { id: 5, nombre: 'CURSO 2 HORAS SEMANALES', tipo: 'Personalizado', precio: 2100, edadMin: 3, edadMax: 99, horas: 2, activo: true },
  { id: 6, nombre: 'CURSO 3 HORAS SEMANALES', tipo: 'Personalizado', precio: 2900, edadMin: 3, edadMax: 99, horas: 3, activo: true },
  { id: 7, nombre: 'CURSO 5 HORAS SEMANALES', tipo: 'Personalizado', precio: 3400, edadMin: 3, edadMax: 99, horas: 5, activo: true },
]

export const usuarios = [
  { id: 1, rol: 'Administrador', matricula: 'ADM-001', usuario: 'admin_root', nombre: 'Admin', apPaterno: 'Lemon', apMaterno: 'Tree', fechaNac: '1990-08-15', correo: 'admin@lemon.com', password: 'Admin123', foto: null, estado: true, fechaReg: '2026-01-10' },
  { id: 11, rol: 'Profesor', matricula: 'PROF-001', usuario: 'prof_r_sosa_001', nombre: 'Roberto', apPaterno: 'Sosa', apMaterno: 'Luna', fechaNac: '1994-04-02', correo: 'roberto@lemon.com', password: 'Lemon123', foto: null, estado: true, fechaReg: '2026-03-01', sueldo: 12000, diaPago: 15, horasMes: 24 },
  {
    id: 101, rol: 'Alumno', matricula: 'STUD-001', usuario: 'alu_m_flores_001', nombre: 'MIGUEL ANGEL', apPaterno: 'FLORES', apMaterno: 'VIDAL',
    // Su cumpleaños es "hoy" para mostrar el mensaje sorpresa en la demo
    fechaNac: `2012-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`,
    correo: 'miguel@lemon.com', password: 'Lemon123', foto: null, estado: true, fechaReg: '2026-08-01',
    nivel: 'Elementary', modulo: 2, cursoId: 3, tipoCurso: 'Grupal', diaPago: 15,
    lemonDollars: 24, racha: 0, xp: 260, progreso: 45, misionesHechas: 2, limmys: ['classic'], insignias: ['primera'],
  },
]

export const grupos = [
  { id: 1, nombre: '8NV80', profesorId: 11, cursoId: 3, fechaCreacion: '2026-08-10', alumnos: [101], horario: [{ dia: 'Martes', hora: '17:00' }, { dia: 'Jueves', hora: '17:00' }] },
]

export const promociones = [
  { id: 1, titulo: 'Semana de promoción', descripcion: 'Obtén 15% de descuento en colegiatura mensual al pagar por adelantado.', tipoPromo: 'Descuento General', tipoDesc: 'Porcentaje (%)', valor: 15, inicio: '2026-06-01', fin: '2026-12-31', activa: true },
]

// Pagos del alumno: dos pagados, uno vencido (para la demo de "Cobrar") y uno pendiente
export const pagos = [
  { id: 1, alumnoId: 101, modulo: 1, cursoId: 3, monto: 1500, fecha: `${monthOffset(-2)}-15`, estado: 'Pagado' },
  { id: 2, alumnoId: 101, modulo: 2, cursoId: 3, monto: 1500, fecha: `${monthOffset(-1)}-15`, estado: 'Pagado' },
  { id: 3, alumnoId: 101, modulo: 3, cursoId: 3, monto: 1500, fecha: `${monthOffset(0)}-15`, estado: 'Vencido' },
  { id: 4, alumnoId: 101, modulo: 4, cursoId: 3, monto: 1500, fecha: `${monthOffset(1)}-15`, estado: 'Pendiente' },
]

export const actividad = [
  { id: 1, tipo: 'alumno', titulo: 'Nuevo Alumno registrado', desc: 'Miguel Angel Flores se unió al grupo 8NV80.', fecha: addDays(-1) + ' 10:30', leida: false },
  { id: 2, tipo: 'pago', titulo: 'Pago vencido', desc: 'Miguel Angel Flores tiene un pago vencido de $1,500.', fecha: addDays(-1) + ' 09:15', leida: false },
]

// Una misión de cada tipo
export const misiones = [
  {
    id: 1, titulo: 'Colors & Fruits', tipo: 'Quiz', grupoId: 1, alumnos: [], fechaLimite: addDays(2), recompensa: 5, xp: 40, creada: addDays(-1),
    preguntas: [
      { q: 'What color is a lemon?', opts: ['Blue', 'Yellow', 'Purple'], a: 1 },
      { q: '"Manzana" in English is…', opts: ['Apple', 'Orange', 'Grape'], a: 0 },
      { q: 'Choose the correct sentence', opts: ['I has a lemon', 'I have a lemon', 'I haves a lemon'], a: 1 },
    ],
    completadas: {},
  },
  {
    id: 2, titulo: 'Reading Tree: The Lost Lemon', tipo: 'Reading', grupoId: 1, alumnos: [], fechaLimite: addDays(5), recompensa: 10, xp: 80, creada: addDays(-2),
    lectura: 'Limmy was a small lemon who lived in a big tree. One windy day, Limmy fell from the tree and rolled into the city. He met a friendly dog, a busy bee and a kind girl named Lucy. Lucy helped Limmy go back home. Since that day, Limmy always says: "Be bright, be kind!"',
    preguntas: [
      { q: 'Where did Limmy live?', opts: ['In a big tree', 'In a house', 'In the sea'], a: 0 },
      { q: 'Who helped Limmy go home?', opts: ['A bee', 'Lucy', 'A dog'], a: 1 },
      { q: 'What does Limmy always say?', opts: ['Be fast!', 'Be bright, be kind!', 'Be quiet!'], a: 1 },
    ],
    completadas: {},
  },
  {
    id: 3, titulo: 'Pronunciation: TH sounds', tipo: 'Pronunciation', grupoId: 1, alumnos: [], fechaLimite: addDays(4), recompensa: 6, xp: 50, creada: addDays(0),
    palabras: ['think', 'three', 'mother'], preguntas: [], completadas: {},
  },
]

export const asistencias = [
  { id: 1, grupoId: 1, fecha: addDays(-2), registros: { 101: 'P' } },
]

export const observaciones = []

export const reservas = [
  { id: 1, alumnoId: 101, fecha: addDays(1), hora: '17:00' },
]

export const notificaciones = []

// Solicitudes de funcionalidades a la medida (cotizador UPIICODE)
export const solicitudes = [
  {
    id: 1, titulo: 'Recordatorios de pago por WhatsApp a padres', area: 'Pagos y cobranza',
    descripcion: 'Que el sistema mande un WhatsApp automático a los papás 3 días antes de la fecha de pago y el día que vence.',
    complejidad: 'Mediana', urgencia: 'Normal', usuarios: '11 a 50', fecha: addDays(-6), estado: 'Cotizada',
    cotizacion: { min: 4000, max: 8000, semanas: '2 a 3', mensual: 99 },
  },
]
