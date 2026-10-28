import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, FileSearch, GraduationCap, Wallet, Flame, Coins, NotebookPen, Printer, BadgeCheck } from 'lucide-react'
import { PhraseBanner, Badge, Avatar, Empty, Progress } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { money, fullName, age } from '../../utils/format'

export default function Expedientes() {
  const { db, api, toast } = useApp()
  const [params] = useSearchParams()
  const [q, setQ] = useState(params.get('q') || '')
  const [found, setFound] = useState(null)
  const [loading, setLoading] = useState(false)
  const [miss, setMiss] = useState(false)

  const consultar = async (term = q) => {
    if (!term.trim()) return
    setLoading(true); setMiss(false)
    await new Promise((r) => setTimeout(r, 600))
    const t = term.toLowerCase().trim()
    const a = db.usuarios.find((u) => u.rol === 'Alumno' && [u.matricula, u.usuario, u.correo, String(u.id), `${u.nombre} ${u.apPaterno}`].some((x) => x.toLowerCase().includes(t)))
    setFound(a?.id || null); setMiss(!a); setLoading(false)
  }
  useEffect(() => { if (params.get('q')) consultar(params.get('q')) }, []) // eslint-disable-line

  const a = db.usuarios.find((u) => u.id === found)
  const curso = a && db.cursos.find((c) => c.id === a.cursoId)
  const pagos = a ? db.pagos.filter((p) => p.alumnoId === a.id) : []
  const grupo = a && db.grupos.find((g) => g.alumnos.includes(a.id))
  const asist = a ? db.asistencias.filter((x) => x.registros[a.id]) : []
  const pctAsist = asist.length ? Math.round((asist.filter((x) => x.registros[a.id] !== 'A').length / asist.length) * 100) : 100
  const obs = a ? db.observaciones.filter((o) => o.alumnoId === a.id) : []
  const adeudo = pagos.filter((p) => p.estado === 'Vencido')
  const proximo = pagos.find((p) => p.estado !== 'Pagado')

  return (
    <div className="space-y-6">
      <div>
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-extrabold">Expedientes Digitales</motion.h2>
        <p className="text-sm text-black/50">Consulta completa del expediente del alumno: trayectoria, estado de pago, racha y colegiatura.</p>
      </div>
      <PhraseBanner />
      <form onSubmit={(e) => { e.preventDefault(); consultar() }} className="card flex flex-wrap items-center gap-3 p-3 pl-5">
        <Search size={18} className="text-lime-dark" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar Expediente (Matrícula, Nombre, Correo o ID)" className="min-w-[200px] flex-1 bg-transparent py-2 outline-none placeholder:text-black/70" />
        <button className="btn-lime !py-2 text-sm">{loading ? 'Consultando…' : 'Consultar Expediente'}</button>
      </form>

      <AnimatePresence mode="wait">
        {!a ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="card">
            {loading ? <div className="grid place-items-center py-20"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="h-10 w-10 rounded-full border-4 border-lime border-t-transparent" /></div>
              : <Empty icon={FileSearch} title={miss ? 'Sin coincidencias' : 'Consulta de Expediente Digital'} text={miss ? 'No encontramos un alumno con ese dato. Intenta con la matrícula (ej. STUD-001).' : 'Ingresa una matrícula, nombre, usuario o correo en la barra superior para consultar el expediente del alumno.'} />}
          </motion.div>
        ) : (
          <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-6 xl:grid-cols-[340px_1fr]">
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-forest to-forest-dark p-6 text-center text-white shadow-card">
                <div className="mx-auto w-fit rounded-full border-4 border-white/20"><Avatar u={a} size={92} className="!bg-white !text-forest" /></div>
                <p className="mt-3 font-display text-xl font-extrabold">{fullName(a)}</p>
                <p className="text-sm font-semibold text-lime">{a.matricula} · {a.usuario}</p>
                <div className="mt-4 flex justify-center gap-2"><Badge tone={a.estado ? 'lime' : 'red'}>{a.estado ? 'Activo' : 'Inactivo'}</Badge><span className="chip bg-white/15 text-white">{a.nivel}</span></div>
                <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                  {[[Coins, a.lemonDollars, 'Lemon $'], [Flame, a.racha, 'Racha'], [BadgeCheck, a.insignias.length, 'Insignias']].map(([I, v, l]) => (
                    <div key={l} className="rounded-2xl bg-white/10 py-3"><I size={16} className="mx-auto text-lime" /><p className="mt-1 text-lg font-bold">{v}</p><p className="text-[10px] uppercase tracking-wider text-white/60">{l}</p></div>
                  ))}
                </div>
              </div>
              <div className="card space-y-3 p-6 text-sm">
                {[['Fecha de Registro', a.fechaReg], ['Fecha de Nacimiento', `${a.fechaNac} (${age(a.fechaNac)} años)`], ['Correo Electrónico', a.correo], ['Grupo', grupo?.nombre || 'Sin grupo'], ['Asistencia', `${pctAsist}%`]].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3"><span className="font-semibold text-black/50">{k}</span><span className="text-right font-bold">{v}</span></div>
                ))}
                <div><p className="mb-1 font-semibold text-black/50">Progreso del nivel</p><Progress value={a.progreso} /></div>
                <button onClick={() => window.print()} className="btn-ghost mt-2 w-full !py-2 text-sm"><Printer size={15} /> Imprimir expediente</button>
              </div>
            </div>

            <div className="min-w-0 space-y-6">
              <div className="card p-6">
                <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-extrabold uppercase tracking-wide"><GraduationCap size={20} /> Historial Académico</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-sage-soft p-4"><p className="text-xs font-semibold text-black/50">Mensualidad</p><p className="font-display text-2xl font-extrabold">{money(curso?.precio)}</p><p className="text-xs text-black/50">{curso?.nombre}</p></div>
                  <div className="rounded-2xl bg-lemon-pale p-4"><p className="text-xs font-semibold text-black/50">Próxima Fecha de Pago</p><p className="font-display text-2xl font-extrabold">{a.diaPago} de cada mes</p><p className="text-xs text-black/50">{proximo ? `Módulo ${proximo.modulo} · ${money(proximo.monto)}` : 'Sin pendientes'}</p></div>
                  <div className={`rounded-2xl p-4 ${adeudo.length ? 'bg-red-50' : 'bg-lime/20'}`}><p className="text-xs font-semibold text-black/50">Estado de Colegiatura</p><p className={`font-display text-2xl font-extrabold ${adeudo.length ? 'text-red-500' : 'text-forest'}`}>{adeudo.length ? 'Con adeudo' : 'Al corriente'}</p><p className="text-xs text-black/50">{adeudo.length ? `${money(adeudo.reduce((s, p) => s + p.monto, 0))} vencido` : 'Al día'}</p></div>
                </div>
                <p className="mb-2 mt-6 text-sm font-bold text-forest-dark">Módulos y Cursos Inscritos</p>
                <div className="nice-scroll overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead className="border-b-2 border-ink/70"><tr>{['Módulo', 'Grupo', 'Tipo curso', 'Nombre curso', 'Fecha pago', 'Monto', 'Estado de pago', 'Estado módulo', ''].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
                    <tbody>
                      {pagos.map((p, i) => (
                        <motion.tr key={p.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .06 }} className="border-b border-black/5">
                          <td className="td font-bold">MÓDULO {p.modulo}</td>
                          <td className="td">{grupo?.nombre || '—'}</td>
                          <td className="td text-black/60">{curso?.tipo}</td>
                          <td className="td font-semibold">{curso?.nombre}</td>
                          <td className="td text-black/60">{p.fecha}</td>
                          <td className="td font-semibold">{money(p.monto)}</td>
                          <td className="td"><Badge tone={p.estado === 'Pagado' ? 'lime' : p.estado === 'Vencido' ? 'red' : 'yellow'}>{p.estado}</Badge></td>
                          <td className="td"><Badge tone={p.estado === 'Pagado' && i < pagos.length - 2 ? 'green' : i === pagos.length - 1 ? 'blue' : 'lime'}>{i < pagos.length - 2 ? 'Aprobado' : i === pagos.length - 1 ? 'Programado' : 'En Curso'}</Badge></td>
                          <td className="td">{p.estado !== 'Pagado' && <button onClick={async () => { await api.pagos.registrar(p.id); toast('Pago registrado') }} className="chip bg-lime px-3 py-1 text-ink"><Wallet size={12} /> Registrar pago</button>}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card p-6">
                <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-extrabold"><NotebookPen size={20} /> Observaciones del profesor</h3>
                {obs.length ? obs.map((o) => <div key={o.id} className="mb-2 rounded-2xl bg-sage-soft p-4 text-sm"><p>{o.texto}</p><p className="mt-1 text-xs text-black/40">{o.fecha}</p></div>) : <p className="text-sm text-black/50">Sin observaciones registradas.</p>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
