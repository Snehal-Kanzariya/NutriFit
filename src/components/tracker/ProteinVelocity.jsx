/**
 * ProteinVelocity.jsx
 * Shows protein intake rate (g/hr) and projected end-of-day total.
 * Only renders once at least 1 meal is checked.
 */
import { useMealPlanStore } from '../../stores/useMealPlanStore'
import { calcVelocity }     from './trackerUtils'

export default function ProteinVelocity({ slots = [], proteinTarget }) {
  const { checkedMeals } = useMealPlanStore()
  const v = calcVelocity(checkedMeals, slots, proteinTarget)

  if (!v) return null

  const lastTimeStr = v.lastMealTime
    ? new Intl.DateTimeFormat('en-IN', {
        hour: 'numeric', minute: '2-digit', hour12: true,
        timeZone: 'Asia/Kolkata',
      }).format(v.lastMealTime).toUpperCase()
    : null

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 space-y-1.5">
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Protein Velocity</p>
      <p className="text-xs text-gray-300">
        📈 <span className="font-semibold text-white">{v.proteinEaten}g</span> eaten in{' '}
        <span className="font-semibold text-white">{v.hoursElapsed}h</span> ={' '}
        <span className="font-semibold text-violet-400">{v.velocity} g/hr</span>
      </p>
      {lastTimeStr && (
        <p className={`text-xs font-semibold ${v.onTrack ? 'text-emerald-400' : 'text-amber-400'}`}>
          🎯 Projected: ~{v.projected}g by {lastTimeStr}{' '}
          {v.onTrack ? '✅' : '⚠️'}
        </p>
      )}
    </div>
  )
}
