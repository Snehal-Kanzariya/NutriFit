/**
 * MealPlan.jsx
 * Full meal plan page — lists all meal slots with MealCards,
 * handles skip/swap interactions, shows shortfall booster + skipped banners.
 */
import { useNavigate }        from 'react-router-dom'
import { RefreshCw }          from 'lucide-react'
import { motion }             from 'framer-motion'

import { useProfileStore }    from '../stores/useProfileStore'
import { useScheduleStore }   from '../stores/useScheduleStore'
import { useMealPlanStore }   from '../stores/useMealPlanStore'

import SkippedMealBanner     from '../components/meals/SkippedMealBanner'
import ProteinBooster        from '../components/protein/ProteinBooster'
import { MealCardSkeleton }  from '../components/ui/SkeletonCard'
import MealTimeline          from '../components/tracker/MealTimeline'

import { applySkip, generateDayPlan }    from '../services/mealEngine'
import { getAchievableProtein }           from '../services/proteinAllocator'

import mealsNonveg     from '../data/meals-nonveg.json'
import mealsVeg        from '../data/meals-veg.json'
import mealsVegan      from '../data/meals-vegan.json'
import mealsEggetarian from '../data/meals-eggetarian.json'

const MEAL_DB = {
  nonveg: mealsNonveg, veg: mealsVeg, vegan: mealsVegan, eggetarian: mealsEggetarian,
}

const PRESET_MAP = {
  student: 'student', office: 'office', wfh: 'wfh',
  early_bird: 'early-bird', night_shift: 'night-shift',
}

const ACTIVITY_MAP = {
  gym: 'weights', yoga: 'yoga', running: 'cardio', sports: 'sports', home: 'home', rest: 'rest',
}

export default function MealPlan() {
  const navigate = useNavigate()

  const { diet, canCook, proteinTarget, weight, height, age, gender, activityLevel, goal,
          goalCalories, setProteinTarget } = useProfileStore()
  const { activePreset, todayActivity, todayWorkoutTime, todayWorkoutDuration, todayCanCook,
          setCheckedIn } = useScheduleStore()
  const { todayPlan, skippedTypes, addedBoosters, checkedMeals, setTodayPlan, applySkipResult,
          swapMealInSlot, setGenerating } = useMealPlanStore()

  const plan    = todayPlan
  const slots   = plan?.slots ?? []
  const target  = plan?.proteinTarget ?? proteinTarget ?? 80
  const mealDB  = MEAL_DB[diet] || mealsVeg
  const effectiveCanCook = todayCanCook ?? canCook ?? true
  const boosterProtein    = addedBoosters.reduce((s, b) => s + (b.protein ?? 0), 0)
  const checkedProtein    = Object.values(checkedMeals).reduce((s, v) => s + (v.protein ?? 0), 0)
  const eaten             = checkedProtein + boosterProtein

  // ── Meal check handler (no celebration on this page) ─────────────────────
  function handleMealCheck(_protein) {
    return false
  }

  // ── Skip handler ────────────────────────────────────────────────────────
  function handleSkip(slotType) {
    if (!plan) return
    const slotMeta = slots.find((s) => s.type === slotType)
    if (!slotMeta) return

    const { updatedPlan, boosts } = applySkip(
      plan,
      slotType,
      mealDB,
      diet,
      effectiveCanCook
    )

    applySkipResult(
      updatedPlan,
      slotType,
      slotMeta.label,
      slotMeta.proteinTarget,
      boosts
    )
  }

  // ── Swap handler ─────────────────────────────────────────────────────────
  function handleSwap(slotType, mealResult) {
    swapMealInSlot(slotType, mealResult)
  }

  // ── Regenerate entire plan ────────────────────────────────────────────────
  function handleRegenerate() {
    try {
      setGenerating(true)
      // Use getState() to guarantee we read the latest store values, not stale closure
      const prof  = useProfileStore.getState()
      const sched = useScheduleStore.getState()

      const scheduleType  = PRESET_MAP[sched.activePreset] || 'wfh'
      const workoutType   = ACTIVITY_MAP[sched.todayActivity] || 'rest'
      const hasWorkout    = workoutType !== 'rest'
      const cookable      = sched.todayCanCook ?? prof.canCook ?? true
      const currentTarget = prof.proteinTarget ?? 80
      const db            = MEAL_DB[prof.diet] || mealsVeg
      const profileObj    = {
        diet: prof.diet, canCook: cookable,
        weight: prof.weight, height: prof.height,
        age: prof.age, gender: prof.gender,
        activityLevel: prof.activityLevel, goal: prof.goal,
      }

      const newPlan = generateDayPlan(
        profileObj,
        { scheduleType },
        currentTarget,
        hasWorkout ? sched.todayWorkoutTime : null,
        sched.todayWorkoutDuration || 60,
        workoutType,
        db
      )
      setTodayPlan(newPlan)
    } catch (err) {
      console.error('[MealPlan] regenerate failed:', err)
    } finally {
      setGenerating(false)
    }
  }

  // ── Generating skeleton ───────────────────────────────────────────────────
  const { isGenerating } = useMealPlanStore()
  if (isGenerating) {
    return (
      <div className="px-4 pt-5 pb-8 space-y-3">
        <div className="h-6 w-40 bg-gray-800 rounded-full animate-pulse mb-4" />
        {[1, 2, 3, 4].map((i) => <MealCardSkeleton key={i} />)}
      </div>
    )
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!plan || !slots.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-4">
        <span className="text-5xl">🍽️</span>
        <h2 className="text-white font-bold text-xl">No plan yet</h2>
        <p className="text-gray-500 text-sm">Complete your morning check-in to generate today's meals.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-2xl transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 pt-5 pb-3">
        <div>
          <h1 className="text-lg font-bold text-white">Today's Meals</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {eaten}g / {target}g protein
            {boosterProtein > 0 && (
              <span className="text-violet-400 ml-1">(+{boosterProtein}g from boosters)</span>
            )}
          </p>
        </div>
        <button
          onClick={handleRegenerate}
          className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
        >
          <RefreshCw size={12} />
          Regenerate
        </button>
      </header>

      <div className="px-4 pb-8 space-y-3">
        {/* ── Skipped meal banner (plan-level skips) ────────────────────── */}
        <SkippedMealBanner />

        {/* ── Live meal timeline with trackable cards ────────────────────── */}
        <MealTimeline
          slots={slots}
          dailyTarget={target}
          onCheck={handleMealCheck}
          onTargetHit={() => {}}
        />

        {/* ── Supplement note (shown when target exceeds DB capacity) ──── */}
        {(() => {
          const slotTypes = slots.map(s => s.type)
          const { needsSupplement, achievable } = getAchievableProtein(target, slotTypes)
          if (!needsSupplement) return null
          return (
            <div className="bg-blue-950/40 border border-blue-800/50 rounded-2xl px-4 py-3 flex gap-3 items-start">
              <span className="text-lg mt-0.5">💊</span>
              <div>
                <p className="text-blue-300 text-xs font-semibold">High protein target</p>
                <p className="text-blue-400/80 text-[11px] mt-0.5">
                  Food covers ~{achievable}g. Add protein powder or supplements to reach your {target}g goal.
                </p>
              </div>
            </div>
          )
        })()}

        {/* ── Protein booster card ───────────────────────────────────────── */}
        <ProteinBooster
          slots={slots}
          skippedTypes={skippedTypes}
          dailyTarget={target}
        />
      </div>
    </div>
  )
}
