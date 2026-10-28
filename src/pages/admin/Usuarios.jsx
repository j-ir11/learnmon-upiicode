import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, EyeOff, Eye, Pencil, FolderOpen, Trash2, UserRound, Ticket, IdCard, CalendarDays, Mail, Lock, KeyRound, GraduationCap, Layers, DollarSign, Camera, ImagePlus, ChevronLeft, ChevronRight, Plus, ChevronUp, CheckCircle2, Circle, RotateCcw, Flame, Coins } from 'lucide-react'
import { PhraseBanner, Field, SelectField, Modal, ConfirmDialog, Segmented, Badge, Avatar } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { TENANT } from '../../config/tenant'
import { genUsuario, money } from '../../utils/format'

const ROLES = ['Administrador', 'Profesor', 'Alumno']
const up = (v) => v.toUpperCase()
const lettersUp = (max) => (v) => v.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑÜ ]/g, '').slice(0, max)
const empty = (rol, cursos) => ({ rol, matricula: '', nombre: '', apPaterno: '', apMaterno: '', fechaNac: '', correo: '', password: '', foto: null, cursoId: cursos[0]?.id, tipoCurso: 'Grupal', nivel: 'Elementary', diaPago: 15, sueldo: '' })

function validate(f) {
  const e = {}
  if (f.matricula.length < 3 || f.matricula.length > 8) e.matricula = 'Debe tener entre 3 y 8 caracteres.'
  if (f.nombre.length < 3) e.nombre = 'Mínimo 3 letras.'
  if (f.apPaterno.length < 3) e.apPaterno = 'Mínimo 3 letras.'
  if (!f.fechaNac) e.fechaNac = 'Selecciona la fecha.'
  if (!/^\S+@\S+\.\S+$/.test(f.correo)) e.correo = 'Correo no válido.'
  if (!(f.password.length >= 6 && /[A-Z]/.test(f.password) && /\d/.test(f.password))) e.password = 'La contraseña no cumple los requisitos.'
  if (f.rol === 'Profesor' && !f.sueldo) e.sueldo = 'Indica el sueldo base.'
  return e
}

function PhotoPicker({ value, onChange }) {
  const [sheet, setSheet] = useState(false)
  const cam = useRef(), gal = useRef()
  const read = (file) => { if (!file) return; const r = new FileReader(); r.onload = () => onChange(r.result); r.readAsDataURL(file); setSheet(false) }
  return (
    <div className="relative flex flex-col items-center">
      <button type="button" onClick={() => setSheet(true)} className="relative grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-lime/25 transition hover:scale-105">
        {value ? <img src={value} className="h-full w-full object-cover" /> : <UserRound size={34} className="text-forest" />}
        <span className="absolute bottom-0 right-0 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-lime"><Camera size={13} /></span>
      </button>
      <p className="mt-2 text-[11px] font-semibold text-forest-dark/70">Foto de Perfil (Cámara / Galería)</p>
      <input ref={cam} type="file" accept="image/*" capture="user" hidden onChange={(e) => read(e.target.files[0])} />
      <input ref={gal} type="file" accept="image/*" hidden onChange={(e) => read(e.target.files[0])} />
      <AnimatePresence>
        {sheet && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)}>
            <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} transition={{ type: 'spring', damping: 24 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-3xl bg-white p-4 shadow-2xl">
              <p className="mb-3 text-center font-display font-bold">Foto de Perfil</p>
              <button type="button" onClick={() => cam.current.click()} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm hover:bg-sage-soft"><Camera size={18} /> Tomar Foto con Cámara</button>
              <button type="button" onClick={() => gal.current.click()} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm hover:bg-sage-soft"><ImagePlus size={18} /> Cargar desde Archivos / Galería</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function UserForm({ f, set, errors, nextId, cursos, editing }) {
  const curso = cursos.find((c) => c.id === Number(f.cursoId))
  const rules = [['Mínimo 6 caracteres', f.password?.length >= 6], ['Una letra mayúscula', /[A-Z]/.test(f.password || '')], ['Al menos un número', /\d/.test(f.password || '')]]
  return (
    <div className="space-y-4">
      <PhotoPicker value={f.foto} onChange={(v) => set({ foto: v })} />
      {editing && <Field label="ID de Usuario" icon={KeyRound} value={f.id} locked />}
      <Field label="Matrícula (3-8 caracteres, MAYÚSCULAS)" icon={Ticket} value={f.matricula} onChange={(v) => set({ matricula: up(v).replace(/\s/g, '').slice(0, 8) })} error={errors.matricula} />
      <Field label="Nombre de Usuario (Auto-generado)" icon={IdCard} value={editing ? f.usuario : genUsuario(f.rol, f.nombre, f.apPaterno, nextId)} locked hint={!editing && 'Generado automáticamente según el rol, iniciales y consecutivo'} />
      <Field label="Nombre(s) (3-20 letras, MAYÚSCULAS)" icon={UserRound} value={f.nombre} onChange={(v) => set({ nombre: lettersUp(20)(v) })} error={errors.nombre} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ap. Paterno (3-10 letras, MAYÚSCULAS)" icon={UserRound} value={f.apPaterno} onChange={(v) => set({ apPaterno: lettersUp(10)(v) })} error={errors.apPaterno} />
        <Field label="Ap. Materno (3-10 letras, MAYÚSCULAS)" icon={UserRound} value={f.apMaterno} onChange={(v) => set({ apMaterno: lettersUp(10)(v) })} />
      </div>
      <Field label="Fecha de Nacimiento" icon={CalendarDays} type="date" value={f.fechaNac} onChange={(v) => set({ fechaNac: v })} error={errors.fechaNac} />
      <Field label="Correo Electrónico (3-30 caracteres)" icon={Mail} value={f.correo} onChange={(v) => set({ correo: v.slice(0, 30).toLowerCase() })} error={errors.correo} />
      {!editing && (
        <div>
          <Field label="Contraseña Temporal (6-30 caracteres, sin espacios)" icon={Lock} type="password" value={f.password} onChange={(v) => set({ password: v.replace(/\s/g, '').slice(0, 30) })} error={errors.password} />
          <div className="mt-2 space-y-0.5 pl-3">
            {rules.map(([t, ok]) => (
              <p key={t} className={`flex items-center gap-1.5 text-[11px] transition-colors ${ok ? 'font-semibold text-forest' : 'text-black/40'}`}>{ok ? <CheckCircle2 size={12} /> : <Circle size={12} />}{t}</p>
            ))}
          </div>
        </div>
      )}

      {f.rol === 'Alumno' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 border-t border-black/10 pt-5">
          <p className="text-sm font-bold text-forest-dark">Curso Inicial y Tipo</p>
          <SelectField label="Selecciona el Curso" icon={GraduationCap} value={f.cursoId} onChange={(v) => { const c = cursos.find((x) => x.id === Number(v)); set({ cursoId: Number(v), tipoCurso: c.tipo }) }}
            options={cursos.filter((c) => c.activo).map((c) => ({ value: c.id, label: `${c.nombre} - ${money(c.precio)}` }))} />
          <div className="flex gap-8 px-1">
            {['Grupal', 'Personalizado'].map((t) => (
              <label key={t} className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" readOnly checked={curso?.tipo === t} className="h-5 w-5 accent-lime" /> Curso {t}</label>
            ))}
          </div>
          <SelectField label="Nivel del Idioma (Catálogo)" icon={Layers} value={f.nivel} onChange={(v) => set({ nivel: v })} options={TENANT.levels} />
          <Field label="Mensualidad / Precio ($ - Solo lectura)" icon={DollarSign} value={curso?.precio?.toFixed(2)} locked />
          <SelectField label="Día de Pago de Mensualidad" icon={CalendarDays} value={f.diaPago} onChange={(v) => set({ diaPago: Number(v) })} options={[{ value: 15, label: '15 de cada mes' }, { value: 28, label: '28 de cada mes' }]} />
        </motion.div>
      )}
      {f.rol === 'Profesor' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 border-t border-black/10 pt-5">
          <p className="text-sm font-bold text-forest-dark">Datos del Profesor</p>
          <Field label="Sueldo base ($, ej. 12000.00)" icon={DollarSign} type="number" value={f.sueldo} onChange={(v) => set({ sueldo: v })} error={errors.sueldo} />
          <SelectField label="Día de Pago de Honorarios" icon={CalendarDays} value={f.diaPago} onChange={(v) => set({ diaPago: Number(v) })} options={[{ value: 15, label: '15 de cada mes' }, { value: 30, label: '30 de cada mes' }]} />
        </motion.div>
      )}
    </div>
  )
}

export default function Usuarios() {
  const { db, api, toast } = useApp()
  const navigate = useNavigate()
  const cursos = db.cursos
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(() => empty('Alumno', cursos))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [rol, setRol] = useState('Alumno')
  const [q, setQ] = useState('')
  const [hideInactive, setHideInactive] = useState(false)
  const [page, setPage] = useState(1)
  const [edit, setEdit] = useState(null)
  const [editOrig, setEditOrig] = useState(null)
  const [del, setDel] = useState(null)
  const [busy, setBusy] = useState(false)
  const nextId = Math.max(...db.usuarios.map((u) => u.id)) + 1

  const list = useMemo(() => db.usuarios
    .filter((u) => u.rol === rol)
    .filter((u) => !hideInactive || u.estado)
    .filter((u) => `${u.nombre} ${u.apPaterno} ${u.apMaterno} ${u.matricula} ${u.usuario} ${u.correo}`.toLowerCase().includes(q.toLowerCase())), [db.usuarios, rol, q, hideInactive])
  const per = 6
  const pages = Math.max(1, Math.ceil(list.length / per))
  const rows = list.slice((page - 1) * per, page * per)

  const submit = async () => {
    const e = validate(form); setErrors(e)
    if (Object.keys(e).length) { toast('Revisa los campos marcados', 'warn'); return }
    setSaving(true)
    const usuario = genUsuario(form.rol, form.nombre, form.apPaterno, nextId)
    await api.usuarios.create({ ...form, usuario, sueldo: Number(form.sueldo) || undefined, correo: form.correo })
    setSaving(false); toast(`${form.rol} registrado: ${usuario}`)
    setForm(empty(form.rol, cursos)); setErrors({}); setRol(form.rol); setShowForm(false); setQ(form.nombre); setPage(1)
  }

  const saveEdit = async () => {
    setBusy(true); const { id, ...rest } = edit
    await api.usuarios.update(id, rest); setBusy(false); setEdit(null); toast('Cambios guardados')
  }

  const cols = {
    common: ['ID (ID_USUARIO)', 'Foto', 'Nombre completo', 'Ap. Paterno', 'Ap. Materno', 'Matrícula', 'Usuario', 'Correo'],
    Alumno: ['Nivel idioma', 'Fecha nac.', 'Fecha reg.', 'Fecha pago', 'Lemon Dollars', 'Racha'],
    Profesor: ['Fecha nac.', 'Fecha reg.', 'Sueldo', 'Pago honorarios', 'Horas mes'],
    Administrador: ['Fecha nac.', 'Fecha reg.'],
  }

  return (
    <div className="space-y-6">
      <PhraseBanner variant="dark" title="Control de Usuarios · Lemon Tree" showLimmy />

      {/* Registro */}
      <motion.div layout className="card overflow-hidden p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-xl font-extrabold">Nuevo Registro de Usuario</h2>
          <button onClick={() => setShowForm((s) => !s)} className={`chip !px-3 !py-1.5 transition ${showForm ? 'bg-sage-soft text-forest-dark' : 'bg-lime text-ink shadow-lime'}`}>
            {showForm ? <><ChevronUp size={14} /> Ocultar Formulario</> : <><Plus size={14} /> Mostrar Formulario</>}
          </button>
        </div>
        <AnimatePresence initial={false}>
          {showForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .4, ease: [.22, 1, .36, 1] }}>
              <div className="pt-5">
                <div className="mb-6 grid grid-cols-3 rounded-2xl bg-[#eef0ec] p-1">
                  {ROLES.map((r) => (
                    <button key={r} onClick={() => { setForm(empty(r, cursos)); setErrors({}) }} className="relative rounded-xl py-2 text-sm font-semibold">
                      {form.rol === r && <motion.span layoutId="formrole" className="absolute inset-0 rounded-xl bg-white shadow" />}
                      <span className={`relative ${form.rol === r ? 'text-forest-dark' : 'text-black/45'}`}>{r}</span>
                    </button>
                  ))}
                </div>
                <UserForm f={form} set={(p) => setForm((x) => ({ ...x, ...p }))} errors={errors} nextId={nextId} cursos={cursos} />
                <button onClick={submit} disabled={saving} className="btn-lime mt-6 w-full !py-3">{saving ? 'Registrando…' : 'Finalizar Registro'}</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Listado */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }} className="card p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Segmented options={ROLES} value={rol} onChange={(r) => { setRol(r); setPage(1) }} />
          <button onClick={() => setHideInactive((h) => !h)} className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition ${hideInactive ? 'border-lime bg-lime/20' : 'border-lime/50 bg-white hover:bg-lime/10'}`}>
            {hideInactive ? <Eye size={16} /> : <EyeOff size={16} />} {hideInactive ? 'Mostrar Todos' : 'Ocultar Filas'}
          </button>
        </div>
        <label className="mt-5 flex items-center gap-3 rounded-2xl border border-black/[.06] bg-white px-4 py-3.5 shadow-sm focus-within:border-lime focus-within:ring-4 focus-within:ring-lime/15">
          <Search size={18} className="text-lime-dark" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} placeholder={`Búsqueda Spotlight (${rol === 'Alumno' ? 'Alumnos' : rol === 'Profesor' ? 'Profesores' : 'Administradores'})`} className="w-full bg-transparent text-[15px] outline-none placeholder:text-black/70" />
        </label>

        <h3 className="mb-3 mt-7 font-display text-lg font-extrabold">Listado Maestro de {rol === 'Alumno' ? 'Alumnos' : rol === 'Profesor' ? 'Profesores' : 'Administradores'}</h3>
        <div className="nice-scroll overflow-x-auto pb-3">
          <table className="w-full min-w-[1400px]">
            <thead className="border-y-2 border-ink/80"><tr>{[...cols.common, ...cols[rol], 'Estado', 'Rol', 'Acciones'].map((c) => <th key={c} className="th">{c}</th>)}</tr></thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {rows.map((u, i) => (
                  <motion.tr key={u.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: i * .03 }}
                    className={`border-b border-black/[.06] transition-colors hover:bg-sage-soft/60 ${!u.estado ? 'opacity-50' : ''}`}>
                    <td className="td">{u.id}</td>
                    <td className="td"><Avatar u={u} size={30} /></td>
                    <td className="td font-bold">{u.nombre} {u.apPaterno} {u.apMaterno}</td>
                    <td className="td text-black/50">{u.apPaterno}</td>
                    <td className="td text-black/50">{u.apMaterno}</td>
                    <td className="td font-semibold">{u.matricula}</td>
                    <td className="td text-black/50">{u.usuario}</td>
                    <td className="td text-black/50">{u.correo}</td>
                    {rol === 'Alumno' && <>
                      <td className="td"><Badge>{u.nivel}</Badge></td>
                      <td className="td text-black/60">{u.fechaNac}</td>
                      <td className="td text-black/60">{u.fechaReg}</td>
                      <td className="td"><span className="chip bg-lime/25 text-forest-dark">{u.diaPago} de cada mes</span></td>
                      <td className="td font-semibold"><Coins size={14} className="mr-1 inline text-lemon" />{u.lemonDollars}</td>
                      <td className="td font-semibold"><Flame size={14} className="mr-1 inline text-orange-500" />{u.racha} días</td>
                    </>}
                    {rol === 'Profesor' && <>
                      <td className="td text-black/60">{u.fechaNac}</td>
                      <td className="td text-black/60">{u.fechaReg}</td>
                      <td className="td font-semibold">{money(u.sueldo)}</td>
                      <td className="td"><span className="chip bg-lime/25 text-forest-dark">{u.diaPago} de cada mes</span></td>
                      <td className="td font-semibold">{u.horasMes || 0} h</td>
                    </>}
                    {rol === 'Administrador' && <>
                      <td className="td text-black/60">{u.fechaNac}</td>
                      <td className="td text-black/60">{u.fechaReg}</td>
                    </>}
                    <td className="td"><Badge tone={u.estado ? 'lime' : 'red'}>{u.estado ? 'Sí' : 'No'}</Badge></td>
                    <td className="td text-black/50">{u.rol}</td>
                    <td className="td">
                      <div className="flex gap-1.5">
                        <button title="Editar" onClick={() => { setEdit({ ...u }); setEditOrig(JSON.stringify(u)) }} className="icon-btn bg-black/5 text-forest"><Pencil size={15} /></button>
                        {u.rol === 'Alumno' && <button title="Expediente" onClick={() => navigate(`/admin/expedientes?q=${u.matricula}`)} className="icon-btn bg-lime/25 text-forest"><FolderOpen size={15} /></button>}
                        <button title={u.estado ? 'Inhabilitar' : 'Habilitar'} onClick={() => setDel(u)} className={`icon-btn ${u.estado ? 'bg-red-50 text-red-500' : 'bg-lime/25 text-forest'}`}>{u.estado ? <Trash2 size={15} /> : <RotateCcw size={15} />}</button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {!rows.length && <p className="py-10 text-center text-sm text-black/50">No se encontraron registros.</p>}
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-black/60">
          <span>Mostrando {list.length ? (page - 1) * per + 1 : 0} - {Math.min(page * per, list.length)} de {list.length} registros</span>
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="disabled:opacity-30"><ChevronLeft size={18} /></button>
            <span className="font-semibold">Pág. {page} de {pages}</span>
            <button disabled={page === pages} onClick={() => setPage((p) => p + 1)} className="disabled:opacity-30"><ChevronRight size={18} /></button>
          </div>
        </div>
      </motion.div>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={`Editar ${edit?.rol || ''}`} dirty={edit && JSON.stringify(edit) !== editOrig}
        footer={(close) => (
          <div className="flex gap-3">
            <button onClick={close} className="btn-ghost flex-1">Cancelar</button>
            <button onClick={saveEdit} disabled={busy} className="btn-lime flex-1">{busy ? 'Guardando…' : 'Guardar'}</button>
          </div>
        )}>
        {edit && <UserForm f={edit} set={(p) => setEdit((x) => ({ ...x, ...p }))} errors={{}} cursos={cursos} editing />}
      </Modal>

      <ConfirmDialog open={!!del} danger={del?.estado} loading={busy}
        title={del?.estado ? 'Inhabilitar Usuario (Borrado Lógico)' : 'Habilitar Usuario'}
        text={`¿Estás seguro de ${del?.estado ? 'inhabilitar' : 'habilitar'} al usuario "${del?.nombre} ${del?.apPaterno} ${del?.apMaterno}"?`}
        note={del?.estado ? 'En la base de datos se aplicará un borrado lógico poniendo su estado como Inactivo.' : 'El usuario podrá volver a iniciar sesión.'}
        confirmText={del?.estado ? 'Inhabilitar' : 'Habilitar'} onCancel={() => setDel(null)}
        onConfirm={async () => { setBusy(true); await api.usuarios.inhabilitar(del.id); setBusy(false); toast(del.estado ? 'Usuario inhabilitado' : 'Usuario habilitado'); setDel(null) }} />
    </div>
  )
}
