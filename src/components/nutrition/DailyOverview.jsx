/**
 * DailyOverview.jsx
 * Compact nutrition summary card below the ProteinProgressRing.
 * Shows calories, carbs, fat progress and today's activity badge.
 */
import { calculateDayTotals } from '../../services/mealEngine'

const ACTIVITY_LABELS = {
  gym:     { label: 'Gym',    emoji: '🏋️' },
  yoga:    { label: 'Yoga',   emoji: '🧘' },
  running: { label: 'Run',    emoji: '🏃' },
  sports:  { label: 'Sports', emoji: '⚽' },
  home:    { label: 'Home WO',emoji: '🏠' },
  rest:    { label: 'Rest',   emoji: '😴' },
}

/**
 * @param {{
 *   plan:         { slots: Array, totalProtein: number, proteinTarget: number },
 *   goalCalories: number,
 *   activity:     string,
 * }} props
 */
export default function DailyOverview({ plan, goalCalories = 2000, activity = 'rest' }) {
  if (!plan?.slots) return null

  const totals = calculateDayTotals(plan.slots)
  const act    = ACTIVITY_LABELS[activity] ?? ACTIVITY_LABELS.rest

  const calPct  = Math.min(1, totals.calories / goalCalories)

  return (
    <div className="bg-gray-900 rounded-2xl p-4 space-y-4 border border-gray-800">
      {/* Activity badge */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Today's Overview
        </span>
        <span className="flex items-center gap-1.5 bg-gray-800 px-3 py-1 rounded-full text-xs font-medium text-gray-200">
          <span>{act.emoji}</span>
          <span>{act.label}</span>
        </span>
      </div>

      {/* Calorie bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400 font-medium">Calories</span>
          <span className="text-emerald-400 font-bold">
            {totals.calories} <span className="text-gray-600 font-normal">/ {goalCalories} kcal</span>
          </span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${Math.round(calPct * 100)}%` }}
          />
        </div>
      </div>

      {/* Macro pills */}
      <div className="grid grid-cols-3 gap-2">
        <MacroPill label="Carbs"   value={totals.carbs}   unit="g" color="text-amber-400"   bg="bg-amber-950/40"  border="border-amber-900" />
        <MacroPill label="Fat"     value={totals.fat}     unit="g" color="text-pink-400"    bg="bg-pink-950/40"   border="border-pink-900"  />
        <MacroPill label="Fiber"   value={totals.fiber}   unit="g" color="text-lime-400"    bg="bg-lime-950/40"   border="border-lime-900"  />
      </div>
    </div>
  )
}

function MacroPill({ label, value, unit, color, bg, border }) {
  return (
    <div className={`${bg} border ${border} rounded-xl py-2 px-1 text-center`}>
      <div className={`text-lg font-black ${color}`}>{value}<span className="text-xs font-medium ml-0.5">{unit}</span></div>
      <div className="text-[10px] text-gray-500 font-medium">{label}</div>
    </div>
  )
}
