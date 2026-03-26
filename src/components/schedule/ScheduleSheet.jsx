/**
 * ScheduleSheet.jsx
 * Bottom sheet (mobile) / centered modal (desktop) for changing today's plan.
 * Exposes: activity, workout time, cook toggle, protein target.
 * On confirm → re-runs generateDayPlan() and replaces todayPlan.
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, X, ChevronRight, Clock } from 'lucide-react'
import ProteinTargetPicker from '../protein/ProteinTargetPicker'
import { useProfileStore }  from '../../stores/useProfileStore'
import { useScheduleStore } from '../../stores/useScheduleStore'
import { useMealPlanStore } from '../../stores/useMealPlanStore'
import { generateDayPlan }  from '../../services/mealEngine'

import mealsNonveg     from '../../data/meals-nonveg.json'
import mealsVeg        from '../../data/meals-veg.json'
import mealsVegan      from '../../data/meals-vegan.json'
import mealsEggetarian from '../../data/meals-eggetarian.json'

const MEAL_DB = {
  nonveg: mealsNonveg, veg: mealsVeg, vegan: mealsVegan, eggetarian: mealsEggetarian,
}

const ACTIVITIES = [
  { id: 'gym',     emoji: '🏋️', label: 'Gym',    workoutType: 'weights' },
  { id: 'yoga',    emoji: '🧘', label: 'Yoga',   workoutType: 'yoga'    },
  { id: 'running', emoji: '🏃', label: 'Run',    workoutType: 'cardio'  },
  { id: 'sports',  emoji: '⚽', label: 'Sports', workoutType: 'sports'  },
  { id: 'home',    emoji: '🏠', label: 'Home',   workoutType: 'home'    },
  { id: 'rest',    emoji: '😴', label: 'Rest',   workoutType: 'rest'    },
]

const PRESET_MAP = {
  student: 'student', office: 'office', wfh: 'wfh',
  early_bird: 'early-bird', night_shift: 'night-shift',
}

export default function ScheduleSheet() {
  const [open, setOpen] = useState(false)

  const { proteinTarget, recommendedProtein, diet, canCook,
          weight, height, age, gender, activityLevel, goal,
          setProteinTarget } = useProfileStore()
  const { activePreset, todayActivity, todayWorkoutTime, todayWorkoutDuration, todayCanCook,
          setTodayActivity } = useScheduleStore()
  const { setTodayPlan, setGenerating } = useMealPlanStore()

  const [protein,     setProtein]     = useState(proteinTarget)
  const [activity,    setActivity]    = useState(todayActivity || 'gym')
  const [woTime,      setWoTime]      = useState(todayWorkoutTime || '07:00')
  const [cookToggle,  setCookToggle]  = useState(todayCanCook ?? canCook ?? true)
  const [saving,      setSaving]      = useState(false)

  const isRest      = activity === 'rest'
  const selectedAct = ACTIVITIES.find((a) => a.id === activity) ?? ACTIVITIES[0]

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') setOpen(false) }
    if (open) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [open])

  function handleOpen() {
    setProtein(proteinTarget)
    setActivity(todayActivity || 'gym')
    setWoTime(todayWorkoutTime || '07:00')
    setCookToggle(todayCanCook ?? canCook ?? true)
    setOpen(true)
  }

  async function handleConfirm() {
    setSaving(true)
    setGenerating(true)

    setTodayActivity({
      todayActivity: activity,
      todayWorkoutTime: woTime,
      todayCanCook: cookToggle,
    })
    setProteinTarget(protein)

    const scheduleType = PRESET_MAP[activePreset] || 'wfh'
    const mealDB       = MEAL_DB[diet] || mealsVeg
    const profile      = { diet, canCook: cookToggle, weight, height, age, gender, activityLevel, goal }

    const plan = generateDayPlan(
      profile,
      { scheduleType },
      protein,
      isRest ? null : woTime,
      todayWorkoutDuration || 60,
      selectedAct.workoutType,
      mealDB
    )

    setTodayPlan(plan)
    setSaving(false)
    setGenerating(false)
    setOpen(false)
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 w-full bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-2xl px-4 py-3 transition-colors"
      >
        <Calendar size={16} className="text-violet-400" />
        <span className="text-sm text-gray-300 font-medium flex-1 text-left">Change today's plan</span>
        <ChevronRight size={14} className="text-gray-600" />
      </button>

      {/* Overlay + Sheet */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop overlay — covers entire screen */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/70 z-50"
            />

            {/* Modal box — positioned container */}
            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed z-50 inset-x-0 bottom-0
                md:inset-x-auto md:bottom-[5%] md:left-1/2 md:-translate-x-1/2
                md:w-full md:max-w-lg"
            >
              <div className="bg-gray-900 rounded-t-2xl md:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col">

                {/* Drag handle — mobile only */}
                <div className="flex justify-center pt-3 md:hidden">
                  <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
                </div>

                {/* Fixed header with close button */}
                <div className="flex justify-between items-center px-5 pt-4 pb-2">
                  <h2 className="text-lg font-bold text-white">Change Today's Plan</h2>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* SCROLLABLE content area */}
                <div className="overflow-y-auto flex-1 px-5 pb-6 max-h-[80vh]">

                  {/* Protein target */}
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Protein Target</p>
                    <ProteinTargetPicker value={protein} onChange={setProtein} recommended={recommendedProtein} />
                  </div>

                  {/* Activity — 3x2 grid */}
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Activity</p>
                    <div className="grid grid-cols-3 gap-2">
                      {ACTIVITIES.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => setActivity(a.id)}
                          className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all text-sm ${
                            activity === a.id
                              ? 'bg-violet-600/20 border-violet-500 text-white'
                              : 'bg-gray-800 border-gray-700 text-gray-400'
                          }`}
                        >
                          <span className="text-xl">{a.emoji}</span>
                          <span className="text-[11px] font-semibold">{a.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Workout time */}
                  {!isRest && (
                    <div className="flex justify-between items-center mb-4 bg-gray-800/50 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Clock size={15} className="text-gray-400" />
                        <span className="text-sm text-gray-300">Workout Time</span>
                      </div>
                      <input
                        type="time"
                        value={woTime}
                        onChange={(e) => setWoTime(e.target.value)}
                        className="bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  )}

                  {/* Cook toggle */}
                  <div className="flex justify-between items-center mb-6 bg-gray-800/50 rounded-xl px-4 py-3">
                    <div>
                      <span className="text-sm text-gray-300">Can Cook Today?</span>
                      <p className="text-xs text-gray-500">Off = quick meals only</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={cookToggle}
                      onClick={() => setCookToggle(!cookToggle)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${cookToggle ? 'bg-violet-500' : 'bg-gray-700'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${cookToggle ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>

                  {/* Rebuild button — full width, always reachable by scrolling */}
                  <button
                    onClick={handleConfirm}
                    disabled={saving}
                    className={`w-full py-3.5 font-bold rounded-xl text-base transition-all ${
                      saving
                        ? 'bg-violet-800 text-violet-300 cursor-wait'
                        : 'bg-violet-500 hover:bg-violet-400 text-white'
                    }`}
                  >
                    {saving ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin w-4 h-4 border-2 border-violet-300 border-t-transparent rounded-full" />
                        Rebuilding plan…
                      </span>
                    ) : (
                      'Rebuild My Plan →'
                    )}
                  </button>

                  {/* Extra bottom padding for mobile safe area */}
                  <div className="h-6" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
