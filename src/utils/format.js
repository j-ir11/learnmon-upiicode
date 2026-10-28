export const money = (n) => `$${Number(n || 0).toLocaleString('es-MX')}`
export const moneyK = (n) => (n >= 1000 ? `$${Math.round(n / 1000)}k` : money(n))
export const fullName = (u) => (u ? `${u.nombre} ${u.apPaterno} ${u.apMaterno || ''}`.trim() : '')
export const shortName = (u) => (u ? `${u.nombre.split(' ')[0]} ${u.apPaterno}` : '')
export const cap = (s = '') => s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase())
export const todayISO = () => new Date().toISOString().slice(0, 10)
export const fmtDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
}
export const fmtLong = (iso) => {
  if (!iso) return ''
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
}
export const age = (iso) => {
  const b = new Date(iso + 'T12:00:00'), n = new Date()
  let a = n.getFullYear() - b.getFullYear()
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--
  return a
}
export const isBirthday = (iso) => {
  if (!iso) return false
  const n = new Date()
  return Number(iso.slice(5, 7)) === n.getMonth() + 1 && Number(iso.slice(8, 10)) === n.getDate()
}
export const daysLeftInMonth = () => {
  const n = new Date()
  return new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate() - n.getDate()
}
// Generador de usuario: rol + inicial + apellido + consecutivo
export const genUsuario = (rol, nombre, apP, id) => {
  const pre = { Alumno: 'alu', Profesor: 'prof', Administrador: 'adm' }[rol] || 'usr'
  const clean = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '')
  if (!nombre || !apP) return ''
  return `${pre}_${clean(nombre)[0] || ''}_${clean(apP)}_${String(id).padStart(3, '0')}`
}
