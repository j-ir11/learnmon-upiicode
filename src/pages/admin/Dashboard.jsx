import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PiggyBank, BarChart3, Users, AlertTriangle, TrendingUp, TrendingDown, Wallet, Megaphone, CalendarClock, UserPlus, Plus } from 'lucide-react'
import { CountUp, PhraseBanner, Section, Badge, Avatar } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { money, fullName, fmtDate } from '../../utils/format'
import { TENANT } from '../../config/tenant'

const days = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']
const series = {
  Cobranza: { goal: 4500, unit: 'k', now: [1600, 2300, 1800, 5300, 2900, 4200, 3400], prev: [1300, 1900, 2100, 3800, 2600, 3300, 3000], note: 'Tendencia Alcista: Proyectando superar la meta semanal un 12% (+ $14.8k vs Semana Pasada)' },
  Facturas: { goal: 4000, unit: 'k', now: [2100, 2600, 2400, 4400, 3900, 4800, 4100], prev: [1800, 2300, 2500, 3600, 3100, 3900, 3500], note: 'Facturación estable: 9% arriba de la semana pasada.' },
  Alumnos: { goal: 4, unit: '', now: [1, 0, 3, 2, 4, 6, 2], prev: [0, 1, 1, 2, 2, 3, 1], note: 'Nuevos registros: 18 alumnos esta semana gracias a la semana de promoción.' },
}

function Stat({ bg, text, iconBg, Icon, BigIcon, value, label, trend, up = true, delay, onClick }) {
  return (
    <motion.button onClick={onClick} initial={{ opacity: 0, y: 24, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay, type: 'spring', damping: 18 }}
      whileHover={{ y: -6, transition: { duration: .2 } }} className={`relative overflow-hidden rounded-[26px] border-2 p-5 text-left ${bg}`} style={{ minHeight: 190 }}>
      <div className="flex items-start justify-between">
        <span className={`grid h-12 w-12 place-items-center rounded-2xl ${iconBg}`}><Icon size={22} /></span>
        <span className={`chip gap-1 bg-black/10 !text-xs ${text}`}>{up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{trend}</span>
      </div>
      <BigIcon className="absolute bottom-5 right-4 opacity-[.13]" size={92} strokeWidth={2.2} />
      <p className={`mt-9 font-display text-[38px] font-extrabold leading-none ${text}`}>{value}</p>
      <p className={`mt-2 text-[12px] font-bold uppercase tracking-[.14em] ${text}`}>{label}</p>
    </motion.button>
  )
}

export default function Dashboard() {
  const { db, api, toast } = useApp()
  const [tab, setTab] = useState('Cobranza')
  const navigate = useNavigate()
  const s = series[tab]
  const data = days.map((d, i) => ({ d, v: s.now[i], p: s.prev[i] }))

  const st = useMemo(() => {
    const alumnos = db.usuarios.filter((u) => u.rol === 'Alumno' && u.estado)
    const mes = new Date().toISOString().slice(0, 7)
    const delMes = db.pagos.filter((p) => p.fecha.startsWith(mes))
    return {
      alumnos: alumnos.length,
      cobranza: db.pagos.filter((p) => p.estado === 'Pagado').reduce((a, p) => a + p.monto, 0),
      facturacion: db.pagos.reduce((a, p) => a + p.monto, 0),
      vencidos: db.pagos.filter((p) => p.estado === 'Vencido').length,
      delMes,
    }
  }, [db])

  const porCobrar = db.pagos.filter((p) => p.estado !== 'Pagado').sort((a, b) => (a.estado === 'Vencido' ? -1 : 1) - (b.estado === 'Vencido' ? -1 : 1)).slice(0, 5)
  const promo = db.promociones.find((p) => p.activa)
  const niveles = TENANT.levels.map((n) => ({ n, c: db.usuarios.filter((u) => u.rol === 'Alumno' && u.nivel === n).length }))
  const maxN = Math.max(...niveles.map((x) => x.c), 1)

  return (
    <div className="space-y-6">
      <PhraseBanner />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Stat delay={.05} bg="bg-lemon border-[#e6c200]" text="text-forest-deep" iconBg="bg-black/10 text-forest-deep" Icon={PiggyBank} BigIcon={PiggyBank} value={<CountUp to={st.cobranza / 1000} prefix="$" suffix="k" format={(n) => n.toFixed(1)} />} label="Cobranza" trend="+12%" onClick={() => navigate('/admin/expedientes')} />
        <Stat delay={.12} bg="bg-forest border-forest-dark" text="text-white" iconBg="bg-white/15 text-white" Icon={BarChart3} BigIcon={BarChart3} value={<CountUp to={st.facturacion / 1000} prefix="$" suffix="k" format={(n) => n.toFixed(1)} />} label="Facturación" trend="+9%" />
        <Stat delay={.19} bg="bg-lime border-[#97b50f]" text="text-forest-deep" iconBg="bg-black/10 text-forest-deep" Icon={Users} BigIcon={Users} value={<CountUp to={st.alumnos} />} label="Alumnos" trend="+5%" onClick={() => navigate('/admin/usuarios')} />
        <Stat delay={.26} bg="bg-[#fff1a8] border-[#f4dc6a]" text="text-[#c62828]" iconBg="bg-orange-200/70 text-[#c62828]" Icon={AlertTriangle} BigIcon={AlertTriangle} value={<CountUp to={st.vencidos} />} label="Vencidos" trend="-2%" up={false} />
      </div>

      <Section delay={.2} title={<span className="text-forest">Análisis de Rendimiento</span>}
        right={<div className="inline-flex rounded-2xl bg-[#eef0ec] p-1">{Object.keys(series).map((k) => (
          <button key={k} onClick={() => setTab(k)} className="relative rounded-xl px-4 py-1.5 text-sm font-semibold">
            {tab === k && <motion.span layoutId="charttab" className="absolute inset-0 rounded-xl bg-white shadow" />}
            <span className={`relative ${tab === k ? 'text-forest-dark' : 'text-black/50'}`}>{k}</span>
          </button>))}</div>}>
        <motion.div key={tab} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-2 text-[13px] font-semibold text-forest-dark shadow-sm">
          <TrendingUp size={16} /> {s.note}
        </motion.div>
        <div className="h-[320px]">
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 20, right: 20, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#badb24" stopOpacity={.45} /><stop offset="100%" stopColor="#badb24" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#00000010" />
              <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#555', fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#555', fontWeight: 600 }} tickFormatter={(v) => (s.unit ? `${+(v / 1000).toFixed(1)}k` : v)} />
              <Tooltip contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,.2)' }} formatter={(v, n) => [s.unit ? money(v) : v, n === 'v' ? 'Esta semana' : 'Semana pasada']} />
              <ReferenceLine y={s.goal} stroke="#444" strokeDasharray="6 6" label={{ value: `OBJETIVO (${s.unit ? s.goal / 1000 + ' k' : s.goal})`, position: 'insideTopRight', fontSize: 11, fontWeight: 700, fill: '#333' }} />
              <Line type="monotone" dataKey="p" stroke="#e8cf2a" strokeOpacity={.7} strokeWidth={2} strokeDasharray="2 0" dot={false} isAnimationActive animationDuration={1200} />
              <Area type="monotone" dataKey="v" stroke="#52723e" strokeWidth={3.5} fill="url(#g1)" dot={{ r: 6, fill: '#fff', stroke: '#52723e', strokeWidth: 2.5 }} activeDot={{ r: 8, fill: '#badb24' }} animationDuration={1300} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Section delay={.3} title="Cobros pendientes" right={<Badge tone="red">{st.vencidos} vencidos</Badge>}>
          <div className="divide-y divide-black/5">
            {porCobrar.map((p, i) => {
              const a = db.usuarios.find((u) => u.id === p.alumnoId)
              return (
                <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .35 + i * .05 }} className="flex items-center gap-3 py-3">
                  <Avatar u={a} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{fullName(a)}</p>
                    <p className="text-xs text-black/45">Módulo {p.modulo} · vence {fmtDate(p.fecha)}</p>
                  </div>
                  <Badge tone={p.estado === 'Vencido' ? 'red' : 'yellow'}>{p.estado}</Badge>
                  <span className="w-20 text-right text-sm font-bold">{money(p.monto)}</span>
                  <button onClick={async () => { await api.pagos.registrar(p.id); toast('Pago registrado correctamente') }} className="rounded-full bg-lime/30 px-3 py-1.5 text-xs font-bold text-forest-dark transition hover:bg-lime"><Wallet size={14} className="mr-1 inline" />Cobrar</button>
                </motion.div>
              )
            })}
            {!porCobrar.length && <p className="py-6 text-center text-sm text-black/50">Sin cobros pendientes 🎉</p>}
          </div>
        </Section>

        <div className="space-y-6">
          {promo && (
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .35 }} className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-lemon to-[#f9e25a] p-6 shadow-card">
              <Megaphone className="absolute -right-3 -top-3 opacity-15" size={110} />
              <p className="text-[11px] font-bold uppercase tracking-[.16em] text-forest-dark">Promoción activa</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-forest-deep">{promo.titulo}</p>
              <p className="mt-1 text-sm text-forest-deep/80">{promo.descripcion}</p>
              <button onClick={() => toast('Recordatorio enviado a 10 alumnos por notificación 📲')} className="mt-4 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-forest-dark">Notificar a alumnos</button>
            </motion.div>
          )}
          <Section delay={.4} title="Alumnos por nivel">
            <div className="space-y-3">
              {niveles.map((n, i) => (
                <div key={n.n} className="flex items-center gap-3">
                  <span className="w-24 text-sm font-semibold">{n.n}</span>
                  <div className="h-7 flex-1 overflow-hidden rounded-xl bg-black/[.04]">
                    <motion.div className="flex h-full items-center justify-end rounded-xl bg-gradient-to-r from-sage to-lime pr-2 text-xs font-bold text-forest-deep" initial={{ width: 0 }} animate={{ width: `${(n.c / maxN) * 100}%` }} transition={{ delay: .5 + i * .1, duration: .8 }}>{n.c}</motion.div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate('/admin/usuarios')} className="card flex items-center gap-2 p-4 text-sm font-semibold transition hover:-translate-y-1"><UserPlus size={18} className="text-lime-dark" /> Inscribir alumno</button>
            <button onClick={() => navigate('/admin/grupos')} className="card flex items-center gap-2 p-4 text-sm font-semibold transition hover:-translate-y-1"><Plus size={18} className="text-lime-dark" /> Crear grupo</button>
            <button onClick={() => navigate('/admin/promociones')} className="card flex items-center gap-2 p-4 text-sm font-semibold transition hover:-translate-y-1"><Megaphone size={18} className="text-lime-dark" /> Nueva promo</button>
            <button onClick={() => navigate('/admin/actividad')} className="card flex items-center gap-2 p-4 text-sm font-semibold transition hover:-translate-y-1"><CalendarClock size={18} className="text-lime-dark" /> Actividad</button>
          </div>
        </div>
      </div>
    </div>
  )
}
