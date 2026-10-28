import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { X, Volume2, Mic, Check, Coins, Zap, BookOpen } from 'lucide-react'
import { Limmy } from '../../components/ui'
import { LIMMYS } from '../../data/catalogs'

const say = (txt, rate = .85) => { try { const u = new SpeechSynthesisUtterance(txt); u.lang = 'en-US'; u.rate = rate; speechSynthesis.cancel(); speechSynthesis.speak(u) } catch { /* */ } }
const Rec = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)

export function PronounceWord({ word, onResult }) {
  const [state, setState] = useState('idle') // idle | listening | ok | retry
  const [heard, setHeard] = useState('')
  const listen = () => {
    if (!Rec) { setState('ok'); onResult?.(true); return }
    const r = new Rec(); r.lang = 'en-US'; r.maxAlternatives = 3
    setState('listening'); setHeard('')
    r.onresult = (e) => {
      const alts = [...e.results[0]].map((x) => x.transcript.toLowerCase().trim())
      const ok = alts.some((a) => a.includes(word.toLowerCase()))
      setHeard(alts[0]); setState(ok ? 'ok' : 'retry'); onResult?.(ok)
    }
    r.onerror = () => setState('retry')
    r.onend = () => setState((s) => (s === 'listening' ? 'retry' : s))
    r.start()
  }
  return (
    <div className="flex flex-col items-center">
      <motion.p key={word} initial={{ scale: .6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-6xl font-extrabold text-forest">{word}</motion.p>
      <div className="mt-6 flex gap-3">
        <button onClick={() => say(word)} className="flex items-center gap-2 rounded-2xl border-2 border-black/10 bg-white px-5 py-3 font-bold"><Volume2 size={20} /> Escuchar</button>
        <button onClick={() => say(word, .45)} className="rounded-2xl border-2 border-black/10 bg-white px-4 py-3 text-sm font-bold">🐢 Lento</button>
      </div>
      <motion.button whileTap={{ scale: .92 }} onClick={listen} animate={state === 'listening' ? { scale: [1, 1.08, 1] } : {}} transition={{ repeat: state === 'listening' ? Infinity : 0, duration: 1 }}
        className={`mt-6 grid h-24 w-24 place-items-center rounded-full text-white shadow-xl ${state === 'listening' ? 'bg-red-500' : state === 'ok' ? 'bg-lime !text-ink' : 'bg-forest'}`}>
        {state === 'ok' ? <Check size={40} /> : <Mic size={38} />}
      </motion.button>
      <p className="mt-3 h-5 text-sm font-semibold text-black/50">
        {state === 'idle' && (Rec ? 'Toca el micrófono y di la palabra' : 'Tu navegador no tiene reconocimiento de voz: practica y toca el micrófono')}
        {state === 'listening' && 'Te escucho…'}
        {state === 'ok' && '¡Excelente pronunciación! 🎉'}
        {state === 'retry' && `Escuché "${heard || '…'}". ¡Inténtalo otra vez!`}
      </p>
    </div>
  )
}

export default function MissionPlayer({ mission, onClose, onFinish }) {
  const isPron = mission.tipo === 'Pronunciation'
  const steps = isPron ? mission.palabras.length : mission.preguntas.length
  const [reading, setReading] = useState(mission.tipo === 'Reading')
  const [i, setI] = useState(0)
  const [pick, setPick] = useState(null)
  const [correct, setCorrect] = useState(0)
  const [ok, setOk] = useState(false)
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)

  const q = mission.preguntas[i]
  const answered = pick !== null
  const right = answered && q && pick === q.a

  const next = async () => {
    const add = isPron ? (ok ? 1 : 0) : (right ? 1 : 0)
    const total = correct + add
    if (i + 1 < steps) { setCorrect(total); setI(i + 1); setPick(null); setOk(false); return }
    const score = Math.round((total / steps) * 100)
    setSaving(true)
    const res = await onFinish(score)
    setSaving(false)
    setResult({ score, ...res })
    confetti({ particleCount: 160, spread: 90, origin: { y: .55 }, colors: ['#badb24', '#f5d005', '#52723e', '#fff496'] })
  }
  useEffect(() => { if (answered && q) say(right ? 'Great job!' : 'Oops!', 1) }, [answered]) // eslint-disable-line

  return (
    <motion.div className="fixed inset-0 z-[60] flex flex-col bg-[#fbfbf2]" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 26, stiffness: 220 }}>
      <div className="mx-auto flex w-full max-w-3xl items-center gap-4 px-5 pt-6">
        <button onClick={onClose} className="text-black/40 hover:text-black"><X size={26} /></button>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-black/10">
          <motion.div className="h-full rounded-full bg-lime" animate={{ width: `${((result ? steps : i + (answered || ok ? 1 : 0)) / steps) * 100}%` }} transition={{ type: 'spring', damping: 20 }} />
        </div>
        <span className="chip bg-lemon/40 text-[#7a6500]"><Coins size={13} /> {mission.recompensa}</span>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-6">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div key="result" initial={{ scale: .8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              <Limmy size={130} float acc={result.unlocked?.acc} className="mx-auto" />
              <h2 className="mt-4 font-display text-4xl font-extrabold text-forest">{result.score >= 70 ? '¡Misión cumplida!' : '¡Buen intento!'}</h2>
              <p className="text-black/50">Obtuviste <b className="text-ink">{result.score}%</b> de aciertos</p>
              <div className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .2 }} className="rounded-2xl border-2 border-lemon bg-lemon-pale p-4"><Coins className="mx-auto text-amber-500" /><p className="font-display text-2xl font-extrabold">+{Math.round(mission.recompensa * result.score / 100)}</p><p className="text-xs font-bold text-black/50">LEMON DOLLARS</p></motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .35 }} className="rounded-2xl border-2 border-lime bg-lime/15 p-4"><Zap className="mx-auto text-forest" /><p className="font-display text-2xl font-extrabold">+{mission.xp}</p><p className="text-xs font-bold text-black/50">XP · TU ÁRBOL CRECE</p></motion.div>
              </div>
              {result.unlocked && (
                <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: .6, type: 'spring', damping: 10 }} className="mx-auto mt-5 max-w-sm rounded-2xl bg-forest p-4 text-white">
                  <p className="text-xs font-bold uppercase tracking-widest text-lime">¡Nuevo coleccionable!</p>
                  <p className="font-display text-xl font-bold">{result.unlocked.acc} {result.unlocked.name}</p>
                </motion.div>
              )}
              <button onClick={onClose} className="btn-lime mx-auto mt-8 w-full max-w-sm !py-4 text-lg">Continuar</button>
            </motion.div>
          ) : reading ? (
            <motion.div key="reading" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-sky-600"><BookOpen size={18} /> Reading Tree</p>
              <h2 className="font-display text-3xl font-extrabold">{mission.titulo.replace('Reading Tree: ', '')}</h2>
              <p className="mt-5 rounded-3xl bg-white p-6 text-lg leading-relaxed shadow-card">{mission.lectura}</p>
              <div className="mt-4 flex gap-3"><button onClick={() => say(mission.lectura, .85)} className="flex items-center gap-2 rounded-2xl border-2 border-black/10 bg-white px-5 py-3 font-bold"><Volume2 size={18} /> Escuchar lectura</button></div>
              <button onClick={() => setReading(false)} className="btn-lime mt-8 w-full !py-4 text-lg">¡Ya la leí! Responder</button>
            </motion.div>
          ) : isPron ? (
            <motion.div key={'p' + i} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <p className="mb-8 text-center font-display text-2xl font-bold">Pronuncia la palabra</p>
              <PronounceWord word={mission.palabras[i]} onResult={setOk} />
            </motion.div>
          ) : (
            <motion.div key={'q' + i} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <div className="mb-8 flex items-end gap-4">
                <Limmy size={80} />
                <div className="relative rounded-3xl border-2 border-black/10 bg-white px-5 py-4 font-display text-2xl font-bold">
                  {q.q}
                  <button onClick={() => say(q.q)} className="ml-2 inline align-middle text-sky-500"><Volume2 size={20} /></button>
                </div>
              </div>
              <div className="grid gap-3">
                {q.opts.map((o, k) => {
                  const st = !answered ? 'border-black/10 bg-white hover:bg-sage-soft' : k === q.a ? 'border-lime bg-lime/25' : k === pick ? 'border-red-300 bg-red-50' : 'border-black/10 bg-white opacity-50'
                  return (
                    <motion.button key={k} disabled={answered} onClick={() => setPick(k)} whileTap={{ scale: .97 }}
                      animate={answered && k === pick && k !== q.a ? { x: [0, -8, 8, -5, 5, 0] } : {}}
                      className={`flex items-center gap-4 rounded-2xl border-2 border-b-4 px-5 py-4 text-left text-lg font-semibold transition-colors ${st}`}>
                      <span className="grid h-8 w-8 place-items-center rounded-lg border-2 border-black/10 text-sm text-black/40">{k + 1}</span>{o}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!result && !reading && (
        <motion.div animate={{ backgroundColor: answered ? (right ? '#e6f4b8' : '#fde2e2') : isPron && ok ? '#e6f4b8' : '#ffffff' }} className="border-t border-black/5">
          <div className="mx-auto flex max-w-3xl items-center gap-4 px-5 py-5">
            <AnimatePresence>{answered && (
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex-1 font-display text-xl font-extrabold ${right ? 'text-forest' : 'text-red-500'}`}>
                {right ? '¡Correcto! 🍋' : `Respuesta: ${q.opts[q.a]}`}
              </motion.p>)}
            </AnimatePresence>
            {!answered && <span className="flex-1" />}
            <button disabled={(!answered && !isPron) || saving} onClick={next} className={`rounded-2xl border-b-4 px-10 py-3.5 font-display text-lg font-extrabold uppercase transition ${(answered || isPron) ? 'border-[#8fae12] bg-lime text-ink' : 'border-black/10 bg-black/10 text-black/30'}`}>
              {saving ? '…' : isPron && !ok ? 'Saltar' : 'Continuar'}
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export { LIMMYS }
