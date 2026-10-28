// ─────────────────────────────────────────────────────────────
//  Configuración del cliente (tenant) dentro de la plataforma UPIICODE.
//  Cambiando este archivo, el mismo sistema se adapta a otra escuela:
//  nombre, frases, colores y módulos contratados.
// ─────────────────────────────────────────────────────────────
export const PLATFORM = {
  name: 'UPIICODE',
  tagline: 'Software modular para escuelas que van creciendo',
}

export const TENANT = {
  id: 'lemon-tree',
  name: 'Lemon Tree',
  fullName: 'Lemon Tree Language Academy',
  appName: 'Learnmon',
  mascot: 'Limmy',
  heroTitle: 'Aprender idiomas también puede sentirse simple.',
  heroSubtitle: 'Una plataforma fresca para conectar alumnos, profesores y administración en un solo lugar.',
  heroCta: 'Comenzar mi Aventura',
  heroFoot: 'La frescura que tu aprendizaje necesita.',
  phrases: [
    'Welcome to the tree, lemon.',
    'Bright minds, happy lemons.',
    'Be bright. Be Lemon Tree.',
    'Be creative. Be bright. Be Lemon Tree.',
  ],
  levels: ['Elementary', 'Basal', 'Average', 'Evolved'],
  conversationHoursPerMonth: 10,
}

// Catálogo de módulos UPIICODE: la escuela paga solo los que usa.
export const MODULES = [
  { key: 'usuarios', name: 'Usuarios y roles', desc: 'Alta de alumnos, profesores y administradores.', price: 0, base: true },
  { key: 'cobranza', name: 'Cobranza y pagos', desc: 'Mensualidades, adeudos, alertas de vencimiento.', price: 0, base: true },
  { key: 'expedientes', name: 'Expedientes digitales', desc: 'Historial académico y de pagos por alumno.', price: 300 },
  { key: 'promociones', name: 'Promociones y descuentos', desc: 'Semana de promoción, becas y campañas.', price: 99 },
  { key: 'grupos', name: 'Grupos y cursos', desc: 'Catálogo de cursos, grupos, horarios.', price: 0, base: true },
  { key: 'profesor', name: 'Panel del profesor', desc: 'Asistencia, misiones, alertas inteligentes.', price: 500 },
  { key: 'gamificacion', name: 'App del alumno (gamificación)', desc: 'Misiones, árbol, sistema de recompensas, racha.', price: 650 },
  { key: 'conversacion', name: 'Reservas de conversación', desc: 'Agenda de horas de conversación.', price: 99 },
]
