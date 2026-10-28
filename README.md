# Learnmon · Lemon Tree — Prototipo UPIICODE

Prototipo funcional del sistema de gestión escolar modular de **UPIICODE**, configurado para su primer cliente: **Lemon Tree Language Academy**.

## Módulos
| Rol | Pantallas |
|---|---|
| **Administrador** | Dashboard (cobranza, facturación, alumnos, vencidos, gráfica), Usuarios (alta/edición/borrado lógico), Expedientes digitales, Promociones, Grupos, Cursos, Perfil, Historial de actividad, **Mi plan UPIICODE** (activar/desactivar módulos) |
| **Profesor** | Centro de control con alertas inteligentes, Mis grupos (seguimiento y observaciones), Pase de lista, Misiones (crear quizzes, lecturas y pronunciación), Lemon Dollars y reconocimientos |
| **Alumno (Learnmon)** | Árbol que crece, racha, Lemon Dollars, misiones jugables, Limmys coleccionables, insignias, Pronunciation Lab con reconocimiento de voz, reservas de conversación (10 h/mes), pagos y semana de promoción, mensaje de cumpleaños |

## Usuarios de prueba
| Rol | Usuario | Contraseña |
|---|---|---|
| Administrador | `admin_root` | `Admin123` |
| Profesor | `prof_r_sosa_001` | `Lemon123` |
| Alumno | `alu_m_flores_004` (o matrícula `STUD-004`) | `Lemon123` |

También está el botón **ACCESO RÁPIDO DEMO** en el login.

## Datos
Por ahora **no hay base de datos**: todo pasa por `src/services/api.js` (backend simulado) y se guarda en el `localStorage` del navegador. Los datos de ejemplo están en `src/data/seed.js`.
Cuando exista el API real, solo se reemplaza el cuerpo de cada función de `api.js` por un `fetch()`; las pantallas no cambian.
Para volver a los datos originales: Admin → menú de usuario → *Mi plan UPIICODE* → **Restablecer datos demo**.

## Personalización (modelo UPIICODE)
`src/config/tenant.js` define el cliente: nombre, frases, niveles, horas de conversación y el catálogo de módulos con precio. Cambiando este archivo el sistema se adapta a otra escuela.

## Correr en local
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # genera /dist
SINGLE=1 npm run build   # genera un solo index.html portátil
```

## Desplegar
- **Vercel**: importar el repositorio de GitHub → framework *Vite* → Deploy (sin configuración extra).
- **GitHub Pages**: Settings → Pages → Source: *GitHub Actions*. El workflow `.github/workflows/deploy.yml` publica en cada push a `main`.

Stack: React 18 · Vite · Tailwind CSS · Framer Motion · Recharts · Lucide.
