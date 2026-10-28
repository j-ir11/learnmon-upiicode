import { motion } from 'framer-motion'

// Árbol que crece con la XP del alumno
const SPOTS = [[100, 62], [70, 80], [132, 78], [52, 108], [150, 108], [88, 104], [116, 100], [72, 132], [128, 134], [100, 128], [44, 140], [158, 140]]
export const stageOf = (xp) => {
  const st = [[0, 'Semilla'], [100, 'Brote'], [250, 'Arbolito'], [450, 'Árbol'], [650, 'Árbol frondoso']]
  let i = 0; st.forEach(([min], k) => { if (xp >= min) i = k })
  const next = st[i + 1]
  return { idx: i, name: st[i][1], next: next?.[1], toNext: next ? next[0] - xp : 0, pct: next ? Math.round(((xp - st[i][0]) / (next[0] - st[i][0])) * 100) : 100 }
}

export default function Tree({ xp, size = 220 }) {
  const s = stageOf(xp)
  const scale = [0.35, 0.55, 0.75, 0.9, 1][s.idx]
  const lemons = Math.min(SPOTS.length, Math.floor(xp / 60))
  return (
    <svg viewBox="0 0 200 220" width={size} height={size * 1.1} className="overflow-visible">
      <ellipse cx="100" cy="205" rx="70" ry="10" fill="#d4df9c" opacity=".7" />
      <motion.g style={{ originX: '100px', originY: '205px' }} initial={{ scale: 0 }} animate={{ scale }} transition={{ type: 'spring', damping: 12, stiffness: 80, delay: .2 }}>
        <path d="M92 205 C94 170 90 150 96 125 L104 125 C110 150 106 170 108 205 Z" fill="#8a5a2b" />
        <path d="M98 160 C84 150 76 140 70 128" stroke="#8a5a2b" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M102 150 C116 142 124 132 130 120" stroke="#8a5a2b" strokeWidth="6" strokeLinecap="round" fill="none" />
        {[[100, 92, 58], [62, 112, 40], [138, 112, 40], [80, 70, 36], [122, 70, 36], [100, 128, 40]].map(([cx, cy, r], i) => (
          <motion.circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? '#7fa241' : '#6a8d3a'} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: .4 + i * .06, type: 'spring' }} style={{ originX: `${cx}px`, originY: `${cy}px` }} />
        ))}
        <motion.g animate={{ rotate: [0, 1.5, 0, -1.5, 0] }} transition={{ repeat: Infinity, duration: 6 }} style={{ originX: '100px', originY: '200px' }}>
          {SPOTS.slice(0, lemons).map(([x, y], i) => (
            <motion.g key={i} initial={{ scale: 0, y: -10 }} animate={{ scale: 1, y: 0 }} transition={{ delay: .9 + i * .08, type: 'spring', damping: 8 }} style={{ originX: `${x}px`, originY: `${y}px` }}>
              <ellipse cx={x} cy={y} rx="7.5" ry="6" fill="#f5d005" stroke="#e0b800" strokeWidth="1" />
              <ellipse cx={x - 2.5} cy={y - 2} rx="2" ry="1.3" fill="#fff6a8" />
              <path d={`M${x} ${y - 6} q2 -4 5 -3`} stroke="#52723e" strokeWidth="1.5" fill="none" />
            </motion.g>
          ))}
        </motion.g>
      </motion.g>
    </svg>
  )
}
