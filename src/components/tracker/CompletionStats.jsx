/**
 * CompletionStats.jsx
 * Shows: meals done (dots), protein %, next meal countdown.
 */
import { useState, useEffect }   from 'react'
import { motion }                from 'framer-motion'
import { useMealPlanStore }  from '../../stores/useMealPlanStore'
import { parseSlotTime }    from './trackerUtils'
import { loadWeekHistory }       from '../../services/storage'

function useStreak() {
  const [streak, setStreak] = useState(0)
  useEffect(() => {
    loadWeekHistory().then((days) => {
      if (!days?.length) return
      let s = 0
      const today = new Date().toISOString().slice(0, 10)
      for (let i = days.length - 1; i >= 0; i--) {
        const d = days[i]
        if (d.date === today) continue
        const ratio = d.proteinTarget > 0 ? (d.proteinEaten ?? 0) / d.proteinTarget : 0
        if (ratio >= 0.9) s++; else break
      }
      setStreak(s)
    }).catch(() => {})
  }, [])
  return streak
}

export default function CompletionStats({ slots = [], proteinAccumulated = 0, proteinTarget = 80 }) {
  const { checkedMeals, trackerSkipped } = useMealPlanStore()
  const [now, setNow] = useState(new Date())
  const streak = useStreak()

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const activeMeals  = slots.filter((s) => s.meal && !trackerSkipped[s.type])
  const checkedCount = Object.keys(checkedMeals).filter((t) => slots.find((s) => s.type === t)).length
  const totalCount   = activeMeals.length || 1
  const proteinPct   = Math.min(100, Math.round((proteinAccumulated / proteinTarget) * 100))

  // Next meal countdown
  const nextSlot = slots
    .filter((s) => s.meal && !checkedMeals[s.type] && !trackerSkipped[s.type])
    .map((s) => ({ ...s, t: parseSlotTime(s.time) }))
    .filter((s) => s.t && s.t > now)
    .sort((a, b) => a.t - b.t)[0]

  const nextInMin = nextSlot ? Math.max(0, Math.round((nextSlot.t - now) / 60_000)) : null
  const nextLabel = nextInMin == null
    ? null
    : nextInMin < 60
      ? `${nextInMin}m`
      : `${Math.floor(nextInMin / 60)}h ${nextInMin % 60}m`

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 space-y-3">
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Today's Progress</p>

      {/* Dot indicators */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          {Array.from({ length: totalCount }).map((_, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                i < checkedCount ? 'bg-violet-500' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-semibold text-white">
          {checkedCount}/{totalCount} meals
        </span>
        {streak > 0 && (
          <span className="ml-auto text-xs text-orange-400 font-semibold">🔥 {streak}d streak</span>
        )}
      </div>

      {/* Protein progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] text-gray-500">
          <span>{proteinAccumulated}g eaten</span>
          <span>{proteinPct}% of {proteinTarget}g</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-violet-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${proteinPct}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* Next meal */}
      {nextLabel && (
        <p className="text-[11px] text-gray-500">
          Next meal in <span className="text-white font-semibold">{nextLabel}</span>
          {' '}· {nextSlot.label}
        </p>
      )}
      {!nextLabel && checkedCount === totalCount && (
        <p className="text-[11px] text-emerald-400 font-semibold">🎉 All meals done for today!</p>
      )}
    </div>
  )
}
