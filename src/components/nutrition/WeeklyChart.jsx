/**
 * WeeklyChart.jsx
 * 7-day protein + calorie line chart using Recharts.
 *
 * Data sources:
 *  - useNutritionStore.weeklyHistory → saved past days
 *  - todayLive props → live calculated values for today (not yet saved)
 *
 * Left Y-axis:  Protein in grams  (violet, strokeWidth 3 — PRIMARY)
 * Right Y-axis: Calories in kcal  (emerald, strokeWidth 1.5 — secondary, no tick labels)
 */
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { useNutritionStore } from '../../stores/useNutritionStore'

// ── Helpers ───────────────────────────────────────────────────────────────────

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * Builds an ISO date string (YYYY-MM-DD) for `daysAgo` days before today.
 * @param {number} daysAgo
 * @returns {string}
 */
function isoDateOffset(daysAgo) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

/**
 * Returns an array of the last 7 dates, oldest first (index 0 = 6 days ago).
 * @returns {{ iso: string, label: string }[]}
 */
function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const daysAgo = 6 - i
    const iso = isoDateOffset(daysAgo)
    const d = new Date(iso + 'T00:00:00')   // parse as local
    return { iso, label: DAY_SHORT[d.getDay()] }
  })
}

/**
 * Counts the current protein streak:
 * consecutive days (working backwards from yesterday) where `hit === true`.
 * Today is added to the streak if todayHit is true.
 *
 * @param {Array}   history  - weeklyHistory entries sorted newest-first
 * @param {boolean} todayHit - whether today's protein target is hit
 * @returns {number}
 */
function calcStreak(history, todayHit) {
  let streak = todayHit ? 1 : 0
  const sortedDesc = [...history].sort((a, b) => b.date.localeCompare(a.date))
  // Start from yesterday
  const yesterday = isoDateOffset(1)

  for (const entry of sortedDesc) {
    if (entry.date >= new Date().toISOString().slice(0, 10)) continue // skip today's saved
    if (entry.date > yesterday) continue
    if (!entry.hit) break
    streak++
  }
  return streak
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  const protein  = payload.find((p) => p.dataKey === 'protein')
  const calories = payload.find((p) => p.dataKey === 'calories')
  const target   = payload[0]?.payload?.proteinTarget

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 shadow-xl text-xs space-y-1 min-w-[120px]">
      <p className="font-bold text-gray-300 mb-1">{label}</p>
      {protein && (
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
            <span className="text-gray-400">Protein</span>
          </span>
          <span className="font-bold text-violet-300">
            {protein.value ?? '—'}g
            {target && (
              <span className="text-gray-600 font-normal ml-1">/ {target}g</span>
            )}
          </span>
        </div>
      )}
      {calories && (
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-gray-400">Calories</span>
          </span>
          <span className="font-bold text-emerald-300">
            {calories.value ?? '—'} kcal
          </span>
        </div>
      )}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * @param {{
 *   todayProtein:  number,
 *   todayCalories: number,
 *   proteinTarget: number,
 *   goalCalories:  number,
 * }} props
 */
export default function WeeklyChart({ todayProtein = 0, todayCalories = 0, proteinTarget = 80, goalCalories = 2000 }) {
  const weeklyHistory = useNutritionStore((s) => s.weeklyHistory)

  const today = new Date().toISOString().slice(0, 10)

  // Build lookup map from history
  const historyMap = {}
  for (const entry of weeklyHistory) {
    historyMap[entry.date] = entry
  }

  const days = getLast7Days()

  // Build chart data: merge history + today's live data
  const chartData = days.map(({ iso, label }) => {
    if (iso === today) {
      return {
        day:           label,
        date:          iso,
        protein:       todayProtein  > 0 ? todayProtein  : null,
        calories:      todayCalories > 0 ? todayCalories : null,
        proteinTarget,
        hit:           todayProtein >= proteinTarget,
      }
    }

    const entry = historyMap[iso]
    if (!entry) return { day: label, date: iso, protein: null, calories: null, proteinTarget: null, hit: false }

    return {
      day:           label,
      date:          iso,
      protein:       entry.protein,
      calories:      entry.calories,
      proteinTarget: entry.proteinTarget ?? proteinTarget,
      hit:           entry.hit ?? (entry.protein >= (entry.proteinTarget ?? proteinTarget)),
    }
  })

  // Stats: how many of the 7 days had protein target hit
  const daysWithData = chartData.filter((d) => d.protein !== null)
  const daysHit      = daysWithData.filter((d) => d.hit).length
  const totalDays    = daysWithData.length

  // Streak
  const todayHit = todayProtein >= proteinTarget
  const streak   = calcStreak(weeklyHistory, todayHit)

  // Y-axis max for protein: slightly above max value or target (whichever is larger)
  const proteinValues = chartData.map((d) => d.protein).filter(Boolean)
  const proteinMax    = Math.max(proteinTarget, ...proteinValues, 1)
  const yProteinMax   = Math.ceil(proteinMax * 1.15 / 10) * 10  // round up to nearest 10

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Weekly Trend
        </h3>
        {streak > 0 && (
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
            🔥 {streak}-day streak
          </span>
        )}
      </div>

      {/* Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 pt-5">
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1f2937"
              vertical={false}
            />

            {/* X-axis: day labels */}
            <XAxis
              dataKey="day"
              tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              dy={6}
            />

            {/* Left Y-axis: protein (primary) */}
            <YAxis
              yAxisId="protein"
              domain={[0, yProteinMax]}
              tick={{ fill: '#6b7280', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickCount={4}
            />

            {/* Right Y-axis: calories (hidden labels — scale only) */}
            <YAxis
              yAxisId="calories"
              orientation="right"
              tick={false}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#374151', strokeWidth: 1.5, strokeDasharray: '4 2' }}
            />

            {/* Protein target reference line */}
            <ReferenceLine
              yAxisId="protein"
              y={proteinTarget}
              stroke="#6d28d9"
              strokeDasharray="4 3"
              strokeWidth={1}
            />

            {/* Calorie line — emerald, thin */}
            <Line
              yAxisId="calories"
              type="monotone"
              dataKey="calories"
              stroke="#10b981"
              strokeWidth={1.5}
              dot={{ fill: '#10b981', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#10b981', stroke: '#064e3b', strokeWidth: 2 }}
              connectNulls={false}
            />

            {/* Protein line — violet, BOLD primary */}
            <Line
              yAxisId="protein"
              type="monotone"
              dataKey="protein"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={({ cx, cy, payload }) => (
                payload.protein !== null ? (
                  <circle
                    key={`dot-${payload.date}`}
                    cx={cx} cy={cy} r={4}
                    fill={payload.hit ? '#8b5cf6' : '#4c1d95'}
                    stroke="#8b5cf6"
                    strokeWidth={2}
                  />
                ) : null
              )}
              activeDot={{ r: 6, fill: '#a78bfa', stroke: '#2e1065', strokeWidth: 2 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 px-1">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-0.5 bg-violet-500 rounded-full" style={{ height: 3 }} />
            <span className="text-[10px] text-gray-500 font-medium">Protein</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 bg-emerald-500 rounded-full" style={{ height: 1.5 }} />
            <span className="text-[10px] text-gray-500 font-medium">Calories</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 border-t border-dashed border-violet-800" />
            <span className="text-[10px] text-gray-500 font-medium">Target</span>
          </div>
        </div>
      </div>

      {/* Hit summary */}
      {totalDays > 0 && (
        <div className={`rounded-2xl px-4 py-3 border text-sm font-medium ${
          daysHit === totalDays
            ? 'bg-emerald-950/50 border-emerald-800/50 text-emerald-300'
            : daysHit >= Math.ceil(totalDays / 2)
              ? 'bg-violet-950/50 border-violet-800/50 text-violet-300'
              : 'bg-gray-900 border-gray-800 text-gray-400'
        }`}>
          {daysHit === totalDays
            ? `Perfect week! Hit protein target all ${totalDays} days.`
            : `Hit protein target ${daysHit}/${totalDays} days this week${daysHit >= Math.ceil(totalDays / 2) ? ' — keep going!' : '. Keep pushing!'}`
          }
          {daysHit >= Math.ceil(totalDays / 2) && ' 🔥'}
        </div>
      )}
    </div>
  )
}
