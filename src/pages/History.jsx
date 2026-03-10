/**
 * History.jsx
 * 7-day protein history:
 *   - Recharts BarChart (violet bars + target dashed line)
 *   - Protein streak counter
 *   - Per-day rows — expand to see meal plan summary
 *   - Weekly protein average
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts'
import { ChevronDown, ChevronUp, Flame } from 'lucide-react'

import { useNutritionStore } from '../stores/useNutritionStore'
import { useMealPlanStore }  from '../stores/useMealPlanStore'
import { useProfileStore }   from '../stores/useProfileStore'
import { loadWeekHistory, getProteinStreak, saveDayPlan } from '../services/storage'

// ── Helpers ───────────────────────────────────────────────────────────────────

function shortDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { weekday: 'short' })
}

function shortDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function hitTarget(actual, target) {
  return target > 0 && actual >= target * 0.9
}

// ── Custom tooltip for Recharts ───────────────────────────────────────────────

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const { actual, target } = payload[0].payload
  const hit = hitTarget(actual, target)
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs">
      <p className="text-gray-400 font-medium mb-1">{label}</p>
      <p className={`font-bold ${hit ? 'text-emerald-400' : 'text-rose-400'}`}>
        {actual}g protein
      </p>
      {target > 0 && (
        <p className="text-gray-500">Target: {target}g</p>
      )}
    </div>
  )
}

// ── Day row ───────────────────────────────────────────────────────────────────

function DayRow({ day, isToday }) {
  const [open, setOpen] = useState(false)
  const hit    = hitTarget(day.proteinActual, day.proteinTarget)
  const missed = day.proteinTarget > 0 && day.proteinActual < day.proteinTarget * 0.9
  const missedBy = Math.max(0, day.proteinTarget - day.proteinActual)

  const slots = day.plan?.slots ?? []

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        {/* Date */}
        <div className="w-12 shrink-0">
          <p className="text-xs font-bold text-white">{shortDay(day.date)}</p>
          <p className="text-[10px] text-gray-500">{shortDate(day.date)}</p>
          {isToday && (
            <span className="inline-block mt-0.5 text-[9px] font-bold text-violet-400 bg-violet-900/40 px-1.5 py-0.5 rounded-full">
              Today
            </span>
          )}
        </div>

        {/* Protein result */}
        <div className="flex-1 min-w-0">
          {day.proteinTarget > 0 ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className={`text-sm font-black tabular-nums ${hit ? 'text-emerald-400' : missed ? 'text-rose-400' : 'text-gray-400'}`}>
                  {day.proteinActual}g
                </span>
                <span className="text-xs text-gray-600">/ {day.proteinTarget}g</span>
                <span className="text-base">{hit ? '✅' : missed ? '⚠️' : '—'}</span>
              </div>
              {missed && (
                <p className="text-[11px] text-rose-500 mt-0.5">missed by {missedBy}g</p>
              )}
              {hit && (
                <p className="text-[11px] text-emerald-600 mt-0.5">target hit!</p>
              )}
            </>
          ) : (
            <p className="text-xs text-gray-600 italic">No data</p>
          )}
        </div>

        {/* Calories + expand icon */}
        <div className="text-right shrink-0 flex flex-col items-end gap-1">
          {day.calories > 0 && (
            <span className="text-xs text-gray-500">{day.calories} kcal</span>
          )}
          {slots.length > 0 && (
            open ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />
          )}
        </div>
      </button>

      {/* Expanded meal summary */}
      <AnimatePresence>
        {open && slots.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-800 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-2">
              {slots.map((slot) => (
                <div key={slot.type} className="flex items-center gap-2 text-xs">
                  <span className="w-20 text-gray-500 font-medium truncate shrink-0">{slot.label}</span>
                  <span className="flex-1 text-gray-300 truncate">{slot.meal?.name ?? '—'}</span>
                  <span className="text-violet-400 font-bold shrink-0">{slot.meal?.protein ?? 0}g</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function History() {
  const { weeklyHistory }          = useNutritionStore()
  const { todayPlan, addedBoosters, skippedTypes } = useMealPlanStore()
  const { proteinTarget }          = useProfileStore()

  const [history, setHistory] = useState([])
  const [streak,  setStreak]  = useState(0)
  const [loading, setLoading] = useState(true)

  // Build today's actual protein from the live plan
  const todayProtein = (() => {
    const slots   = todayPlan?.slots ?? []
    const skipped = new Set(skippedTypes)
    const base    = slots.filter((s) => !skipped.has(s.type)).reduce((sum, s) => sum + (s.meal?.protein ?? 0), 0)
    const boost   = addedBoosters.reduce((s, b) => s + (b.protein ?? 0), 0)
    return base + boost
  })()

  const todayCalories = (() => {
    const slots   = todayPlan?.slots ?? []
    const skipped = new Set(skippedTypes)
    return slots.filter((s) => !skipped.has(s.type)).reduce((sum, s) => sum + (s.meal?.cal ?? 0), 0)
  })()

  const todayStr = new Date().toISOString().slice(0, 10)
  const todayTarget = todayPlan?.proteinTarget ?? proteinTarget ?? 80

  useEffect(() => {
    async function load() {
      // Auto-save today's data into IndexedDB so history stays fresh
      if (todayPlan) {
        await saveDayPlan(todayStr, todayPlan, todayTarget, todayProtein, todayCalories)
      }

      const [dbHistory, dbStreak] = await Promise.all([
        loadWeekHistory(),
        getProteinStreak(),
      ])

      // Merge Zustand weeklyHistory (which has today) with IndexedDB data
      const byDate = Object.fromEntries(dbHistory.map((d) => [d.date, d]))

      // Overlay Zustand entries (may have richer data)
      for (const entry of weeklyHistory) {
        if (byDate[entry.date]) {
          byDate[entry.date] = {
            ...byDate[entry.date],
            proteinActual: entry.protein ?? byDate[entry.date].proteinActual,
            proteinTarget: entry.proteinTarget ?? byDate[entry.date].proteinTarget,
            calories:      entry.calories ?? byDate[entry.date].calories,
          }
        }
      }

      // Always use live store values for today
      if (todayPlan) {
        byDate[todayStr] = {
          ...(byDate[todayStr] ?? {}),
          date:          todayStr,
          proteinActual: todayProtein,
          proteinTarget: todayTarget,
          calories:      todayCalories,
          plan:          todayPlan,
        }
      }

      const sorted = Object.values(byDate).sort((a, b) => b.date.localeCompare(a.date))
      setHistory(sorted)
      setStreak(dbStreak)
      setLoading(false)
    }

    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Chart data — oldest to newest for left-to-right display
  const chartData = [...history].reverse().map((d) => ({
    day:    shortDay(d.date),
    actual: d.proteinActual ?? 0,
    target: d.proteinTarget ?? 0,
  }))

  const weeklyAvg = history.length
    ? Math.round(history.reduce((s, d) => s + (d.proteinActual ?? 0), 0) / history.length)
    : 0

  const maxTarget = Math.max(...history.map((d) => d.proteinTarget ?? 0), 80)

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="px-4 pt-5 pb-3">
        <h1 className="text-lg font-bold text-white">History</h1>
        <p className="text-xs text-gray-500 mt-0.5">Last 7 days</p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="px-4 pb-8 space-y-6">

          {/* ── PROTEIN STREAK ──────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-orange-950/60 to-gray-900 border border-orange-800/50 rounded-2xl p-4 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-orange-900/50 border border-orange-700/50 flex items-center justify-center shrink-0">
              <Flame size={22} className="text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">
                {streak > 0 ? `🔥 ${streak} day${streak !== 1 ? 's' : ''}` : '—'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {streak > 0
                  ? 'protein streak! Keep it going!'
                  : 'Hit your target today to start a streak!'}
              </p>
            </div>
          </motion.div>

          {/* ── WEEKLY AVERAGE ──────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
              <p className="text-2xl font-black text-violet-400 tabular-nums">{weeklyAvg}g</p>
              <p className="text-xs text-gray-500 mt-1">Avg protein / day</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
              <p className="text-2xl font-black text-emerald-400 tabular-nums">
                {history.filter((d) => hitTarget(d.proteinActual, d.proteinTarget)).length}
                <span className="text-base font-bold text-gray-500">/{history.length}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">Days target hit</p>
            </div>
          </div>

          {/* ── BAR CHART ───────────────────────────────────────────────── */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              7-Day Protein
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barCategoryGap="35%" margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#1f2937" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, Math.max(maxTarget * 1.2, 100)]}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139,92,246,0.08)' }} />
                <ReferenceLine
                  y={maxTarget}
                  stroke="#8b5cf6"
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                  label={{ value: `${maxTarget}g`, fill: '#8b5cf6', fontSize: 10, position: 'insideTopRight' }}
                />
                <Bar dataKey="actual" radius={[5, 5, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={hitTarget(entry.actual, entry.target)
                        ? '#7c3aed'
                        : entry.actual > 0
                          ? '#be123c'
                          : '#1f2937'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 justify-center">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-violet-600" />
                <span className="text-[10px] text-gray-500">Hit target</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-rose-700" />
                <span className="text-[10px] text-gray-500">Missed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 border-t-2 border-dashed border-violet-500/60" />
                <span className="text-[10px] text-gray-500">Target</span>
              </div>
            </div>
          </div>

          {/* ── DAY LIST ────────────────────────────────────────────────── */}
          <div className="space-y-2">
            {history.map((day) => (
              <DayRow key={day.date} day={day} isToday={day.date === todayStr} />
            ))}
          </div>

        </div>
      )}
    </div>
  )
}
