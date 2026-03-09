/**
 * ScheduleSheet.jsx
 * Bottom sheet for changing today's plan mid-day.
 * Exposes: activity, workout time, cook toggle, protein target.
 * On confirm → re-runs generateDayPlan() and replaces todayPlan.
 */
import { useState } from 'react'
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

  function handleOpen() {
    // Reset local state to current values
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

      {/* Backdrop + Sheet */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/60 z-40"
            />

            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-gray-900 border-t border-gray-800 rounded-t-3xl z-50 pb-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Handle + header */}
              <div className="sticky top-0 bg-gray-900 pt-3 pb-3 px-4 border-b border-gray-800 z-10">
                <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-3" />
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-base">Change Today's Plan</h3>
                  <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-300">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-5">
                {/* Protein target */}
                <div className="bg-gray-800/50 rounded-2xl p-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Protein Target</h4>
                  <ProteinTargetPicker value={protein} onChange={setProtein} recommended={recommendedProtein} />
                </div>

                {/* Activity */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Activity</h4>
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
                  <div className="flex items-center justify-between bg-gray-800/50 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Clock size={15} className="text-gray-400" />
                      <span className="text-sm text-gray-300">Workout Time</span>
                    </div>
                    <input
                      type="time"
                      value={woTime}
                      onChange={(e) => setWoTime(e.target.value)}
                      className="bg-gray-700 text-white text-sm px-3 py-1.5 rounded-lg border border-gray-600 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                )}

                {/* Cook toggle */}
                <div className="flex items-center justify-between bg-gray-800/50 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm text-gray-300 font-medium">Can Cook Today?</p>
                    <p className="text-[11px] text-gray-600">Off = quick meals only</p>
                  </div>
                  <button
                    onClick={() => setCookToggle(!cookToggle)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${cookToggle ? 'bg-emerald-500' : 'bg-gray-600'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${cookToggle ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                {/* Confirm */}
                <button
                  onClick={handleConfirm}
                  disabled={saving}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all ${
                    saving
                      ? 'bg-violet-800 text-violet-300 cursor-wait'
                      : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25'
                  }`}
                >
                  {saving ? (
                    <><span className="animate-spin w-4 h-4 border-2 border-violet-300 border-t-transparent rounded-full" /> Rebuilding plan…</>
                  ) : (
                    <>Rebuild My Plan <ChevronRight size={18} /></>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
