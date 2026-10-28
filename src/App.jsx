import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LayoutDashboard, Users, FolderOpen, Sparkles, Shapes, GraduationCap, Home, ClipboardCheck, Target, Award, School } from 'lucide-react'
import { AppProvider, useApp } from './context/AppContext'
import Layout from './components/Layout'
import Splash from './pages/Splash'
import Login, { homeFor } from './pages/Login'
import Dashboard from './pages/admin/Dashboard'
import Usuarios from './pages/admin/Usuarios'
import Expedientes from './pages/admin/Expedientes'
import Promociones from './pages/admin/Promociones'
import Grupos from './pages/admin/Grupos'
import Cursos from './pages/admin/Cursos'
import Perfil from './pages/admin/Perfil'
import Actividad from './pages/admin/Actividad'
import Plataforma from './pages/admin/Plataforma'
import ProfInicio from './pages/profesor/Inicio'
import ProfGrupos from './pages/profesor/Grupos'
import ProfAsistencia from './pages/profesor/Asistencia'
import ProfMisiones from './pages/profesor/Misiones'
import ProfReconocimientos from './pages/profesor/Reconocimientos'
import AlumnoApp from './pages/alumno/AlumnoApp'

const adminNav = [
  { to: '/admin', label: 'Dashboard', title: 'Dashboard Principal', icon: LayoutDashboard },
  { to: '/admin/usuarios', label: 'Usuarios', title: 'Control de Usuarios', icon: Users, module: 'usuarios' },
  { to: '/admin/expedientes', label: 'Expedientes', title: 'Expedientes Digitales', icon: FolderOpen, module: 'expedientes' },
  { to: '/admin/promociones', label: 'Promociones', title: 'Marketing y Promos', icon: Sparkles, module: 'promociones' },
  { to: '/admin/grupos', label: 'Grupos', title: 'Gestión de Grupos', icon: Shapes, module: 'grupos' },
  { to: '/admin/cursos', label: 'Cursos', title: 'Gestión de Cursos', icon: GraduationCap, module: 'grupos' },
]
const adminExtra = [
  { to: '/admin/perfil', title: 'Configuración Perfil' },
  { to: '/admin/actividad', title: 'Historial de Actividad' },
  { to: '/admin/plataforma', title: 'Mi plan UPIICODE' },
]
const profNav = [
  { to: '/profesor', label: 'Inicio', title: 'Centro de Control', icon: Home },
  { to: '/profesor/grupos', label: 'Mis Grupos', title: 'Mis Grupos', icon: School },
  { to: '/profesor/asistencia', label: 'Asistencia', title: 'Pase de Lista', icon: ClipboardCheck },
  { to: '/profesor/misiones', label: 'Misiones', title: 'Misiones y Actividades', icon: Target },
  { to: '/profesor/reconocimientos', label: 'Reconocimientos', title: 'Motivación', icon: Award },
]

function Guard({ rol, children }) {
  const { user, db, logout } = useApp()
  if (!user) return <Navigate to="/login" replace />
  if (user.rol !== rol) return <Navigate to={homeFor(user.rol)} replace />
  if (rol === 'Profesor' && !db.modulos.includes('profesor')) {
    return (
      <div className="grid min-h-full place-items-center bg-[#fbfbf4] p-6 text-center">
        <div><p className="font-display text-2xl font-bold">El panel del profesor no está activo</p><p className="text-sm text-black/50">La escuela aún no contrata este módulo de UPIICODE.</p>
          <button onClick={logout} className="btn-lime mt-5">Volver</button></div>
      </div>
    )
  }
  return children
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Guard rol="Administrador"><Layout nav={adminNav} extraMenu={adminExtra} center="Admin Center" roleLabel="Administrador" base="/admin" /></Guard>}>
            <Route index element={<Dashboard />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="expedientes" element={<Expedientes />} />
            <Route path="promociones" element={<Promociones />} />
            <Route path="grupos" element={<Grupos />} />
            <Route path="cursos" element={<Cursos />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="actividad" element={<Actividad />} />
            <Route path="plataforma" element={<Plataforma />} />
          </Route>
          <Route path="/profesor" element={<Guard rol="Profesor"><Layout nav={profNav} extraMenu={[{ to: '/profesor/perfil', title: 'Configuración Perfil' }]} center="Teacher Center" roleLabel="Profesor" base="/profesor" /></Guard>}>
            <Route index element={<ProfInicio />} />
            <Route path="grupos" element={<ProfGrupos />} />
            <Route path="asistencia" element={<ProfAsistencia />} />
            <Route path="misiones" element={<ProfMisiones />} />
            <Route path="reconocimientos" element={<ProfReconocimientos />} />
            <Route path="perfil" element={<Perfil />} />
          </Route>
          <Route path="/alumno/*" element={<Guard rol="Alumno"><AlumnoApp /></Guard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  )
}
