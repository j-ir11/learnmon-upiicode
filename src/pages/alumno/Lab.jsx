import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PronounceWord } from './MissionPlayer'
import { useApp } from '../../context/AppContext'

const SETS = {
  Elementary: ['apple', 'lemon', 'happy', 'school', 'yellow', 'teacher'],
  Basal: ['beautiful', 'weather', 'Wednesday', 'kitchen', 'thirsty'],
  Average: ['comfortable', 'vegetable', 'through', 'thought', 'squirrel'],
  Evolved: ['entrepreneur', 'rural', 'sixth', 'specific', 'anemone'],
}

export default function Lab() {
  const { user } = useApp()
  const [lvl, setLvl] = useState(user.nivel)
  const [i, setI] = useState(0)
  const [okSet, setOkSet] = useState({})
  const words = SETS[lvl]
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-extrabold">Pronunciation Lab</h2>
        <p className="text-sm text-black/50">Escucha la palabra, repítela en voz alta y el asistente te dice si la pronunciaste bien.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.keys(SETS).map((l) => <button key={l} onClick={() => { setLvl(l); setI(0) }} className={`rounded-2xl border-2 px-4 py-2 text-sm font-bold ${lvl === l ? 'border-lime bg-lime/20 text-forest' : 'border-black/10 bg-white text-black/50'}`}>{l}</button>)}
      </div>
      <div className="card p-8">
        <div className="mb-8 flex justify-center gap-1.5">{words.map((w, k) => <span key={w} className={`h-2.5 w-8 rounded-full ${okSet[lvl + w] ? 'bg-lime' : k === i ? 'bg-forest' : 'bg-black/10'}`} />)}</div>
        <AnimatePresence mode="wait">
          <motion.div key={lvl + i} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <PronounceWord word={words[i]} onResult={(ok) => ok && setOkSet((s) => ({ ...s, [lvl + words[i]]: true }))} />
          </motion.div>
        </AnimatePresence>
        <div className="mt-8 flex justify-between">
          <button disabled={!i} onClick={() => setI(i - 1)} className="btn-ghost disabled:opacity-30"><ChevronLeft size={18} /> Anterior</button>
          <button disabled={i === words.length - 1} onClick={() => setI(i + 1)} className="btn-lime disabled:opacity-30">Siguiente <ChevronRight size={18} /></button>
        </div>
      </div>
    </div>
  )
}
