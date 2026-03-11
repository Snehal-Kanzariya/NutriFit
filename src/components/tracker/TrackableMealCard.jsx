/**
 * TrackableMealCard.jsx
 * Meal card with 5 live states: upcoming | prep | eat-now | done | skipped.
 * Includes check-off animation, float-up protein text, and confetti burst.
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence }     from 'framer-motion'
import { Check, SkipForward, RotateCcw } from 'lucide-react'

import { useMealPlanStore } from '../../stores/useMealPlanStore'
import { getMealState, parseSlotTime, formatTime } from './trackerUtils'

// ── Confetti burst ────────────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#8b5cf6','#10b981','#f59e0b','#ef4444','#3b82f6','#ec4899']

function ConfettiBurst() {
  const particles = Array.from({ length: 10 }, (_, i) => {
    const angle  = (i / 10) * Math.PI * 2
    const dist   = 55 + Math.random() * 35
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      rotate: Math.random() * 360,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    }
  })

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{ backgroundColor: p.color }}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.y, scale: 0, opacity: 0, rotate: p.rotate }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

// ── Floating protein label ─────────────────────────────────────────────────────
function FloatUp({ protein, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 top-4 text-emerald-400 font-bold text-sm pointer-events-none z-10"
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -44 }}
          exit={{}}
          transition={{ duration: 1.0, ease: 'easeOut' }}
        >
          +{protein}g
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── State styles ──────────────────────────────────────────────────────────────
const STATE_BORDER = {
  upcoming:  'border-gray-800',
  prep:      'border-amber-600/70',
  'eat-now': 'border-violet-500',
  done:      'border-l-[3px] border-l-emerald-500 border-t-gray-800 border-r-gray-800 border-b-gray-800',
  skipped:   'border-dashed border-gray-700',
}

const SLOT_DOT = {
  breakfast:      'bg-orange-400',
  lunch:          'bg-sky-400',
  dinner:         'bg-indigo-400',
  snack:          'bg-pink-400',
  'pre-workout':  'bg-yellow-400',
  'post-workout': 'bg-emerald-400',
}

export default function TrackableMealCard({ slot, onCheck, onTargetHit }) {
  const { checkedMeals, trackerSkipped, checkMeal, uncheckMeal, trackerSkipMeal, restoreTrackerMeal } =
    useMealPlanStore()

  const [now, setNow]           = useState(new Date())
  const [showFloat, setShowFloat] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  if (!slot?.meal) return null
  const { type, time, label, meal } = slot

  const state    = getMealState(slot, checkedMeals, trackerSkipped, now)
  const mealTime = parseSlotTime(time)
  const dotCls   = SLOT_DOT[type] ?? 'bg-gray-400'
  const checkedEntry = checkedMeals[type]

  // Overdue minutes (eat-now state)
  const overdueMin = state === 'eat-now' && mealTime
    ? Math.max(0, Math.floor((now - mealTime) / 60_000))
    : 0

  function handleCheck() {
    checkMeal(type, meal.protein)
    setShowFloat(true)
    setTimeout(() => setShowFloat(false), 1100)
    const willHitTarget = onCheck?.(meal.protein) // returns true if target hit
    if (willHitTarget) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 1000)
      onTargetHit?.()
    }
  }

  function handleSkip() {
    trackerSkipMeal(type)
    onCheck?.(0)
  }

  return (
    <motion.div
      layout
      className={`relative bg-gray-900 border rounded-2xl overflow-hidden transition-all duration-300 ${
        STATE_BORDER[state]
      } ${state === 'done' ? 'opacity-60' : state === 'skipped' ? 'opacity-40' : ''}`}
    >
      {/* eat-now: pulsing violet glow */}
      {state === 'eat-now' && (
        <div className="absolute inset-0 rounded-2xl ring-1 ring-violet-500 animate-pulse pointer-events-none" />
      )}

      {/* prep: amber top bar */}
      {state === 'prep' && (
        <div className="h-0.5 w-full bg-amber-500/60" />
      )}

      {showConfetti && <ConfettiBurst />}
      <FloatUp protein={meal.protein} visible={showFloat} />

      <div className="px-4 pt-3.5 pb-3 space-y-2">
        {/* ── Row 1: dot + label + time + state badge ────────────────────── */}
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${dotCls}`} />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</span>
          <span className="text-[10px] text-gray-600">· {time}</span>

          {/* State badge */}
          {state === 'eat-now' && (
            <span className="ml-auto text-[10px] font-bold text-violet-400 bg-violet-950/60 border border-violet-700 px-2 py-0.5 rounded-full">
              ⚡ Eat now
            </span>
          )}
          {state === 'prep' && (
            <span className="ml-auto text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-700 px-2 py-0.5 rounded-full">
              🍳 Start cooking
            </span>
          )}
          {state === 'done' && (
            <span className="ml-auto text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-700 px-2 py-0.5 rounded-full">
              ✅ Done
            </span>
          )}
          {state === 'skipped' && (
            <span className="ml-auto text-[10px] font-bold text-gray-500 bg-gray-800 border border-gray-700 px-2 py-0.5 rounded-full">
              ⏭ Skipped
            </span>
          )}
        </div>

        {/* ── Meal name ──────────────────────────────────────────────────── */}
        <p className={`font-bold text-base leading-snug ${state === 'skipped' ? 'line-through text-gray-500' : 'text-white'}`}>
          {meal.name}
        </p>

        {/* ── Protein + cal ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-violet-400 font-bold">{meal.protein}g protein</span>
          <span className="text-gray-600">{meal.cal} cal</span>
          <span className="text-gray-600">⏱ {meal.prepTime}m</span>
        </div>

        {/* ── State-specific content ─────────────────────────────────────── */}

        {/* PREP: cooking guidance */}
        {state === 'prep' && (
          <p className="text-xs text-amber-400/90">
            🍳 Start cooking {meal.name} now! ({meal.prepTime} min prep)
          </p>
        )}

        {/* EAT-NOW: overdue warning + action buttons */}
        {state === 'eat-now' && (
          <>
            {overdueMin >= 30 && (
              <p className="text-xs text-amber-400">
                ⏰ {overdueMin} min overdue — eat soon!
              </p>
            )}
            <div className="flex gap-2 pt-1">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCheck}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-violet-500/20"
              >
                <Check size={15} strokeWidth={2.5} />
                Mark as Eaten
              </motion.button>
              <button
                onClick={handleSkip}
                className="px-3 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 text-xs font-semibold rounded-xl transition-colors"
              >
                <SkipForward size={13} />
              </button>
            </div>
          </>
        )}

        {/* UPCOMING with no prep: show prep-start hint for cook meals */}
        {state === 'upcoming' && !meal.tags?.includes('quick') && (meal.prepTime ?? 0) > 5 && mealTime && (
          <p className="text-[11px] text-gray-600">
            🍳 Start prep at {formatTime(new Date(mealTime - (meal.prepTime ?? 0) * 60_000))}
          </p>
        )}

        {/* DONE: timestamp + protein confirmation */}
        {state === 'done' && checkedEntry && (
          <p className="text-xs text-emerald-400/80">
            🟣 +{meal.protein}g added · Eaten at {formatTime(new Date(checkedEntry.checkedAt))}
          </p>
        )}

        {/* SKIPPED: restore button */}
        {state === 'skipped' && (
          <button
            onClick={() => { restoreTrackerMeal(type); onCheck?.(0) }}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <RotateCcw size={11} /> Restore
          </button>
        )}
      </div>
    </motion.div>
  )
}
