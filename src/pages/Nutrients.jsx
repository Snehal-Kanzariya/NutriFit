/**
 * Nutrients.jsx
 * Three-section nutrition dashboard:
 *   1. Protein — ring, stats, per-meal bars, protein sources, booster
 *   2. Macros  — NutrientBar for calories / protein / carbs / fat / fiber
 *   3. Glow    — GlowNutrients 2-column grid
 *   4. Weekly  — WeeklyChart 7-day trend
 *
 * All data is derived live from useMealPlanStore via calculateDayTotals().
 */
import { useMemo }             from 'react'
import { motion }              from 'framer-motion'

import { useProfileStore }     from '../stores/useProfileStore'
import { useMealPlanStore }    from '../stores/useMealPlanStore'

import { calculateDayTotals }  from '../services/mealEngine'
import { calcMacroTargets }    from '../services/nutritionCalc'

import ProteinProgressRing     from '../components/protein/ProteinProgressRing'
import ProteinPerMealBar       from '../components/protein/ProteinPerMealBar'
import ProteinBooster          from '../components/protein/ProteinBooster'
import GlowNutrients           from '../components/nutrition/GlowNutrients'
import WeeklyChart             from '../components/nutrition/WeeklyChart'

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Distributes each meal's protein equally across its proteinSources,
 * then aggregates by source name across all non-skipped meals.
 *
 * @param {Array}   slots      - plan.slots
 * @param {Set}     skippedSet - skipped slot types
 * @returns {Array<{ name: string, grams: number }>} sorted descending
 */
function buildProteinSources(slots, skippedSet) {
  const map = {}

  for (const slot of slots) {
    if (skippedSet.has(slot.type)) continue
    const meal = slot.meal
    if (!meal?.protein || !meal.proteinSources?.length) continue

    const perSource = meal.protein / meal.proteinSources.length
    for (const raw of meal.proteinSources) {
      const key = raw.toLowerCase().trim()
      map[key] = (map[key] ?? 0) + perSource
    }
  }

  return Object.entries(map)
    .map(([name, grams]) => ({
      name:  name.replace(/\b\w/g, (c) => c.toUpperCase()),   // title-case
      grams: Math.round(grams),
    }))
    .filter((s) => s.grams > 0)
    .sort((a, b) => b.grams - a.grams)
    .slice(0, 6)
}

// ── Local sub-components ──────────────────────────────────────────────────────

/**
 * A labelled progress bar row for one macro.
 *
 * @param {{ label, value, unit, target, color, trackColor, bold }} props
 */
function NutrientBar({ label, value, unit, target, color, trackColor, bold = false }) {
  const pct = target > 0 ? Math.min(1, value / target) : 0
  const pctNum = Math.round(pct * 100)

  return (
    <div className={`space-y-1.5 ${bold ? 'py-1' : ''}`}>
      <div className="flex items-baseline justify-between">
        <span className={`font-semibold ${bold ? 'text-sm text-white' : 'text-xs text-gray-400'}`}>
          {label}
        </span>
        <span className={`tabular-nums ${bold ? 'text-sm font-black' : 'text-xs font-bold'} ${color}`}>
          {value}
          <span className={`font-normal ${bold ? 'text-gray-400 text-xs' : 'text-gray-600 text-[11px]'}`}>
            {' '}{unit}
          </span>
          <span className="text-gray-600 font-normal text-[11px] ml-1">
            / {target}{unit}
          </span>
        </span>
      </div>

      <div className={`${bold ? 'h-3' : 'h-2'} ${trackColor} rounded-full overflow-hidden`}>
        <motion.div
          className={`h-full rounded-full ${color.replace('text-', 'bg-')}`}
          initial={{ width: 0 }}
          animate={{ width: `${pctNum}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  )
}

/**
 * A single protein-source row.
 * @param {{ name: string, grams: number, maxGrams: number }} props
 */
function SourceRow({ name, grams, maxGrams }) {
  const pct = maxGrams > 0 ? (grams / maxGrams) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-xs text-gray-300 font-medium truncate shrink-0">{name}</span>
      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-violet-500/70 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <span className="w-10 text-right text-xs font-bold text-violet-300 shrink-0">{grams}g</span>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Nutrients() {
  const {
    proteinTarget,
    goalCalories,
    weight,
    goal,
  } = useProfileStore()

  const {
    todayPlan,
    skippedTypes,
    addedBoosters,
  } = useMealPlanStore()

  // ── Derived data ───────────────────────────────────────────────────────────
  const slots      = todayPlan?.slots ?? []
  const target     = todayPlan?.proteinTarget ?? proteinTarget ?? 80
  const skippedSet = useMemo(() => new Set(skippedTypes), [skippedTypes])

  const totals = useMemo(
    () => calculateDayTotals(slots, skippedSet),
    [slots, skippedSet]
  )

  const boosterProtein = addedBoosters.reduce((s, b) => s + (b.protein ?? 0), 0)
  const eaten          = totals.protein + boosterProtein

  // Macro targets from nutritionCalc (needs goalCalories)
  const macroTargets = useMemo(() => {
    if (!goalCalories || !weight || !goal) {
      return { protein: target, carbs: 180, fat: 60, calories: goalCalories ?? 2000, fiber: 25 }
    }
    return {
      ...calcMacroTargets(weight, goal, target, goalCalories),
      fiber: 30,
    }
  }, [weight, goal, target, goalCalories])

  // Non-skipped slots only (for protein sources and glow nutrients)
  const activeSlots = useMemo(
    () => slots.filter((s) => !skippedSet.has(s.type)),
    [slots, skippedSet]
  )

  const proteinSources = useMemo(
    () => buildProteinSources(slots, skippedSet),
    [slots, skippedSet]
  )

  // Empty-state guard
  if (!todayPlan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-3">
        <span className="text-5xl">🎯</span>
        <h2 className="text-white font-bold text-xl">Set your protein target to get started!</h2>
        <p className="text-gray-500 text-sm">
          Complete your morning check-in to generate your meal plan and see your full nutrition breakdown.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <header className="px-4 md:px-6 pt-5 pb-3">
        <h1 className="text-lg font-bold text-white">Nutrition</h1>
        <p className="text-xs text-gray-500 mt-0.5">Today's full breakdown</p>
      </header>

      <div className="px-4 md:px-6 pb-8 space-y-6">

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 1 — PROTEIN (hero)
        ════════════════════════════════════════════════════════════════════ */}
        <Section title="Protein" accent="text-violet-400">

          {/* Ring + stats — side by side on md+ */}
          <div className="md:grid md:grid-cols-2 md:gap-6 md:items-center">
            {/* Big ring */}
            <div className="flex flex-col items-center pt-2 pb-4">
              <ProteinProgressRing eaten={eaten} target={target} size={200} />
            </div>

            <div className="space-y-3">
              {/* Eaten | Remaining | Target stats row */}
              <div className="grid grid-cols-3 gap-2">
                <StatPill label="Eaten"     value={`${eaten}g`}                 color="text-violet-400" bg="bg-violet-950/40" border="border-violet-800/50" />
                <StatPill label="Remaining" value={`${Math.max(0, target - eaten)}g`} color="text-gray-300"   bg="bg-gray-800/60"    border="border-gray-700"      />
                <StatPill label="Target"    value={`${target}g`}                color="text-emerald-400" bg="bg-emerald-950/40" border="border-emerald-800/50" />
              </div>

              {/* Protein sources */}
              {proteinSources.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-2.5">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Protein Sources
                  </p>
                  {proteinSources.map((src) => (
                    <SourceRow
                      key={src.name}
                      name={src.name}
                      grams={src.grams}
                      maxGrams={proteinSources[0].grams}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Per-meal bars + booster — side by side on md+ */}
          <div className="md:grid md:grid-cols-2 md:gap-4 space-y-3 md:space-y-0">
            {slots.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Per-Meal Breakdown
                </p>
                <ProteinPerMealBar slots={slots} dailyTarget={target} />
              </div>
            )}

            <ProteinBooster
              slots={slots}
              skippedTypes={skippedTypes}
              dailyTarget={target}
            />
          </div>
        </Section>

        {/* ═══ SECTION 2 & 3 — Macros + Glow side by side on lg+ ═══════════ */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-6 lg:space-y-0">
          <Section title="Macros">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-4">
              <NutrientBar label="Calories" value={totals.calories} unit="kcal" target={macroTargets.calories} color="text-emerald-400" trackColor="bg-emerald-950/50" />
              <NutrientBar label="Protein" value={eaten} unit="g" target={target} color="text-violet-400" trackColor="bg-violet-950/50" bold />
              <NutrientBar label="Carbs" value={totals.carbs} unit="g" target={macroTargets.carbs} color="text-amber-400" trackColor="bg-amber-950/40" />
              <NutrientBar label="Fat" value={totals.fat} unit="g" target={macroTargets.fat} color="text-pink-400" trackColor="bg-pink-950/40" />
              <NutrientBar label="Fiber" value={totals.fiber} unit="g" target={macroTargets.fiber ?? 30} color="text-blue-400" trackColor="bg-blue-950/40" />
            </div>
          </Section>

          <Section title="Glow Nutrients">
            <GlowNutrients totals={totals} slots={activeSlots} />
          </Section>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 4 — WEEKLY TREND
        ════════════════════════════════════════════════════════════════════ */}
        <Section title="Weekly Trend">
          <WeeklyChart
            todayProtein={eaten}
            todayCalories={totals.calories}
            proteinTarget={target}
            goalCalories={macroTargets.calories}
          />
        </Section>

      </div>
    </div>
  )
}

// ── Shared layout helpers ─────────────────────────────────────────────────────

function Section({ title, accent = 'text-gray-400', children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-3"
    >
      <h2 className={`text-xs font-bold uppercase tracking-widest px-1 ${accent}`}>
        {title}
      </h2>
      {children}
    </motion.section>
  )
}

function StatPill({ label, value, color, bg, border }) {
  return (
    <div className={`${bg} border ${border} rounded-xl py-2.5 px-1 text-center`}>
      <div className={`text-base font-black tabular-nums ${color}`}>{value}</div>
      <div className="text-[10px] text-gray-500 font-medium mt-0.5">{label}</div>
    </div>
  )
}
