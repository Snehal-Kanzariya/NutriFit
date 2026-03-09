/**
 * Dashboard.jsx
 * Main daily view.
 *
 * States:
 *  A) Not checked in today → show MorningCheckin
 *  B) Checked in           → show ProteinProgressRing (hero) + DailyOverview +
 *                            tab bar (Meals | Nutrients | AI Coach)
 */
import { useState }            from 'react'
import { useNavigate }         from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Zap }      from 'lucide-react'

import { useProfileStore }   from '../stores/useProfileStore'
import { useScheduleStore }  from '../stores/useScheduleStore'
import { useMealPlanStore }  from '../stores/useMealPlanStore'

import MorningCheckin        from '../components/schedule/MorningCheckin'
import ProteinProgressRing   from '../components/protein/ProteinProgressRing'
import ProteinPerMealBar     from '../components/protein/ProteinPerMealBar'
import DailyOverview         from '../components/nutrition/DailyOverview'
import ScheduleSheet         from '../components/schedule/ScheduleSheet'

// ── Tab definitions ─────────────────────────────────────────────────────────
const TABS = [
  { id: 'meals',     label: 'Meals'     },
  { id: 'nutrients', label: 'Nutrients' },
  { id: 'ai',        label: 'AI Coach'  },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('meals')

  const { name, proteinTarget, goalCalories } = useProfileStore()
  const { todayCheckedIn, todayActivity }     = useScheduleStore()
  const { todayPlan }                         = useMealPlanStore()

  // ── Greeting ──────────────────────────────────────────────────────────────
  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // ── Gate: show check-in if not done yet ───────────────────────────────────
  if (!todayCheckedIn) {
    return <MorningCheckin />
  }

  // ── Derive totals from plan ───────────────────────────────────────────────
  const plan         = todayPlan   // { slots, totalProtein, proteinTarget, hasWorkout, date }
  const slots        = plan?.slots ?? []
  const eaten        = plan?.totalProtein ?? 0
  const target       = plan?.proteinTarget ?? proteinTarget ?? 80

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 pt-5 pb-2">
        <div>
          <p className="text-xs text-gray-500 font-medium">{greeting}</p>
          <h1 className="text-lg font-bold text-white leading-tight">
            {name ? name : 'Your'} Dashboard
          </h1>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="w-9 h-9 flex items-center justify-center bg-gray-800 rounded-full border border-gray-700 hover:border-gray-600 transition-colors"
        >
          <Settings size={16} className="text-gray-400" />
        </button>
      </header>

      {/* ── Hero: Protein Progress Ring ────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center py-6 px-4"
      >
        <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-4">
          🎯 Today's Protein
        </p>
        <ProteinProgressRing eaten={eaten} target={target} size={220} />
      </motion.section>

      {/* ── Daily Overview card ────────────────────────────────────────────── */}
      <div className="px-4">
        <DailyOverview
          plan={plan}
          goalCalories={goalCalories ?? 2000}
          activity={todayActivity}
        />
      </div>

      {/* ── Tab bar ───────────────────────────────────────────────────────── */}
      <div className="flex gap-1 mx-4 mt-5 bg-gray-900 rounded-xl p-1 border border-gray-800">
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

      {/* ── Tab content ───────────────────────────────────────────────────── */}
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
            <MealsTab slots={slots} target={target} />
          )}
          {activeTab === 'nutrients' && (
            <NutrientsTab plan={plan} />
          )}
          {activeTab === 'ai' && (
            <AiTab />
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Change plan button ─────────────────────────────────────────────── */}
      <div className="px-4 mt-5 mb-2">
        <ScheduleSheet />
      </div>
    </div>
  )
}

// ── Sub-panels ───────────────────────────────────────────────────────────────

function MealsTab({ slots, target }) {
  if (!slots.length) {
    return (
      <div className="text-center py-8 text-gray-600">
        <p>No meals generated yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Per-Meal Protein
        </h3>
        <ProteinPerMealBar slots={slots} dailyTarget={target} />
      </div>

      {/* Quick meal list */}
      <div className="space-y-2">
        {slots.map((slot) => (
          <div key={slot.type} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-gray-500 uppercase">{slot.label}</span>
                <span className="text-[10px] text-gray-600">· {slot.time}</span>
              </div>
              <p className="text-sm text-white font-medium truncate mt-0.5">
                {slot.meal?.name ?? <span className="text-gray-600 italic">No meal found</span>}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm font-bold text-violet-400">{slot.meal?.protein ?? 0}g</span>
              {slot.fallback && (
                <p className="text-[10px] text-amber-500">{slot.deltaLabel}</p>
              )}
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
    <div className="text-center py-8 space-y-2 text-gray-500">
      <span className="text-3xl">🤖</span>
      <p className="text-sm">AI Coach</p>
      <p className="text-xs text-gray-600">Personalized tips coming soon</p>
    </div>
  )
}
