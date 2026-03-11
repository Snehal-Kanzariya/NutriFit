/**
 * Dashboard.jsx
 * Main daily view with live tracking system.
 *
 * States:
 *  A) Not checked in today → show MorningCheckin
 *  B) Checked in           → DayHeader + live protein ring (checked meals only)
 *                            + CompletionStats + ProteinVelocity
 *                            + tab bar (Meals | Nutrients | AI Coach)
 */
import { useState, useEffect, useRef } from 'react'
import { useNavigate }                  from 'react-router-dom'
import { motion, AnimatePresence }      from 'framer-motion'
import { Settings, Zap }               from 'lucide-react'

import { useProfileStore }  from '../stores/useProfileStore'
import { useScheduleStore } from '../stores/useScheduleStore'
import { useMealPlanStore } from '../stores/useMealPlanStore'

import MorningCheckin      from '../components/schedule/MorningCheckin'
import ProteinProgressRing from '../components/protein/ProteinProgressRing'
import ProteinPerMealBar   from '../components/protein/ProteinPerMealBar'
import DailyOverview       from '../components/nutrition/DailyOverview'
import ScheduleSheet       from '../components/schedule/ScheduleSheet'
import AiCoachCard         from '../components/ai/AiCoachCard'

import DayHeader       from '../components/tracker/DayHeader'
import CompletionStats from '../components/tracker/CompletionStats'
import ProteinVelocity from '../components/tracker/ProteinVelocity'

// ── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'meals',     label: 'Meals'     },
  { id: 'nutrients', label: 'Nutrients' },
  { id: 'ai',        label: 'AI Coach'  },
]

// ── Celebration confetti ─────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#8b5cf6','#10b981','#f59e0b','#3b82f6','#ec4899','#ef4444']

function Celebration({ visible }) {
  const particles = Array.from({ length: 14 }, (_, i) => ({
    x: (Math.random() - 0.5) * 240,
    y: -(40 + Math.random() * 120),
    rotate: Math.random() * 720,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }))
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="celebration"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 2.5 }}
          className="fixed inset-0 flex flex-col items-center justify-center z-50 pointer-events-none"
        >
          {particles.map((p, i) => (
            <motion.span
              key={i}
              className="absolute w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: p.color, top: '50%', left: '50%' }}
              initial={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }}
              animate={{ x: p.x, y: p.y, scale: 0, opacity: 0, rotate: p.rotate }}
              transition={{ duration: 1.0, ease: 'easeOut', delay: i * 0.04 }}
            />
          ))}
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="text-3xl font-black text-white text-center drop-shadow-lg"
          >
            🎉 Protein target hit!
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function Dashboard() {
  const navigate    = useNavigate()
  const [activeTab, setActiveTab] = useState('meals')
  const [showCelebration, setShowCelebration] = useState(false)

  const { proteinTarget, goalCalories } = useProfileStore()
  const { todayCheckedIn, todayActivity } = useScheduleStore()
  const { todayPlan, autoRegenAt, checkedMeals, addedBoosters } = useMealPlanStore()

  // ── Profile-change toast ─────────────────────────────────────────────────
  const [showRegenToast, setShowRegenToast] = useState(false)
  const seenRegenAt = useRef(autoRegenAt)

  useEffect(() => {
    if (autoRegenAt && autoRegenAt !== seenRegenAt.current) {
      seenRegenAt.current = autoRegenAt
      setShowRegenToast(true)
      const t = setTimeout(() => setShowRegenToast(false), 3000)
      return () => clearTimeout(t)
    }
  }, [autoRegenAt])

  // ── Gate: show check-in if not done yet ──────────────────────────────────
  if (!todayCheckedIn) return <MorningCheckin />

  // ── Derive totals ─────────────────────────────────────────────────────────
  const plan   = todayPlan
  const slots  = plan?.slots ?? []
  const target = plan?.proteinTarget ?? proteinTarget ?? 80

  // Live protein = only CHECKED meals + boosters
  const checkedProtein  = Object.values(checkedMeals).reduce((s, v) => s + (v.protein ?? 0), 0)
  const boosterProtein  = addedBoosters.reduce((s, b) => s + (b.protein ?? 0), 0)
  const liveProtein     = checkedProtein + boosterProtein

  function handleMealCheck(protein) {
    const nextTotal = liveProtein + protein
    if (nextTotal >= target && liveProtein < target) {
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 3200)
      return true
    }
    return false
  }

  return (
    <div className="flex flex-col min-h-full">
      <Celebration visible={showCelebration} />

      {/* ── Day Header (date/time/greeting) ───────────────────────────────── */}
      <div className="flex items-start justify-between pr-4">
        <DayHeader />
        <button
          onClick={() => navigate('/settings')}
          className="mt-5 w-9 h-9 flex items-center justify-center bg-gray-800 rounded-full border border-gray-700 hover:border-gray-600 transition-colors shrink-0"
        >
          <Settings size={16} className="text-gray-400" />
        </button>
      </div>

      {/* ── Profile-change toast ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showRegenToast && (
          <motion.div
            key="regen-toast"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mx-4 mb-1 flex items-center gap-2 bg-emerald-900/60 border border-emerald-700/60 rounded-xl px-4 py-2.5"
          >
            <span className="text-base">✅</span>
            <p className="text-emerald-300 text-xs font-semibold">Plan updated with your new settings</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero: Live Protein Progress Ring (checked meals only) ────────── */}
      <motion.section
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center py-5 px-4"
      >
        <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-4">
          🎯 Today's Protein
        </p>
        <ProteinProgressRing eaten={liveProtein} target={target} size={200} />
      </motion.section>

      {/* ── Completion stats ──────────────────────────────────────────────── */}
      <div className="px-4 mb-3">
        <CompletionStats
          slots={slots}
          proteinAccumulated={liveProtein}
          proteinTarget={target}
        />
      </div>

      {/* ── Daily Overview ────────────────────────────────────────────────── */}
      <div className="px-4">
        <DailyOverview
          plan={plan}
          goalCalories={goalCalories ?? 2000}
          activity={todayActivity}
        />
      </div>

      {/* ── Tab bar ───────────────────────────────────────────────────────── */}
      <div className="flex gap-1 mx-4 mt-4 bg-gray-900 rounded-xl p-1 border border-gray-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ──────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="px-4 mt-4"
        >
          {activeTab === 'meals' && (
            <MealsTab slots={slots} target={target} onCheck={handleMealCheck} />
          )}
          {activeTab === 'nutrients' && <NutrientsTab plan={plan} />}
          {activeTab === 'ai'        && <AiTab />}
        </motion.div>
      </AnimatePresence>

      {/* ── Change plan button ────────────────────────────────────────────── */}
      <div className="px-4 mt-4 mb-2">
        <ScheduleSheet />
      </div>
    </div>
  )
}

// ── Sub-panels ────────────────────────────────────────────────────────────────

function MealsTab({ slots, target, onCheck }) {
  if (!slots.length) {
    return (
      <div className="text-center py-8 text-gray-600">
        <p>No meals generated yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Per-meal protein bars (quick overview) */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Per-Meal Protein
        </h3>
        <ProteinPerMealBar slots={slots} dailyTarget={target} />
      </div>

      {/* Protein velocity */}
      <ProteinVelocity slots={slots} proteinTarget={target} />

      {/* Quick meal summary list */}
      <div className="space-y-2">
        {slots.map((slot) => (
          <div key={slot.type} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-gray-500 uppercase">{slot.label}</span>
                <span className="text-[10px] text-gray-600">· {slot.time}</span>
              </div>
              <p className="text-sm text-white font-medium truncate mt-0.5">
                {slot.meal?.name ?? <span className="text-gray-600 italic">No meal</span>}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm font-bold text-violet-400">{slot.meal?.protein ?? 0}g</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function NutrientsTab({ plan }) {
  return (
    <div className="text-center py-8 space-y-2 text-gray-500">
      <Zap size={32} className="mx-auto text-gray-700" />
      <p className="text-sm">Full nutrient breakdown</p>
      <p className="text-xs text-gray-600">Coming in the Nutrients tab</p>
    </div>
  )
}

function AiTab() {
  return (
    <div className="pb-6">
      <AiCoachCard />
    </div>
  )
}
