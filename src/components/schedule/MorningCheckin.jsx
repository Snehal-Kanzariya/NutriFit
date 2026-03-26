/**
 * MorningCheckin.jsx
 * Morning check-in card — first thing the user sees each day.
 * Sets protein target + activity, then calls generateDayPlan().
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Clock, Flame } from 'lucide-react'
import ProteinTargetPicker from '../protein/ProteinTargetPicker'
import { useProfileStore }   from '../../stores/useProfileStore'
import { useScheduleStore }  from '../../stores/useScheduleStore'
import { useMealPlanStore }  from '../../stores/useMealPlanStore'
import { generateDayPlan }   from '../../services/mealEngine'

import mealsNonveg     from '../../data/meals-nonveg.json'
import mealsVeg        from '../../data/meals-veg.json'
import mealsVegan      from '../../data/meals-vegan.json'
import mealsEggetarian from '../../data/meals-eggetarian.json'

const MEAL_DB = {
  nonveg:     mealsNonveg,
  veg:        mealsVeg,
  vegan:      mealsVegan,
  eggetarian: mealsEggetarian,
}

const ACTIVITIES = [
  { id: 'gym',     emoji: '🏋️', label: 'Gym',    workoutType: 'weights' },
  { id: 'yoga',    emoji: '🧘', label: 'Yoga',   workoutType: 'yoga'    },
  { id: 'running', emoji: '🏃', label: 'Run',    workoutType: 'cardio'  },
  { id: 'sports',  emoji: '⚽', label: 'Sports', workoutType: 'sports'  },
  { id: 'home',    emoji: '🏠', label: 'Home',   workoutType: 'home'    },
  { id: 'rest',    emoji: '😴', label: 'Rest',   workoutType: 'rest'    },
]

// Store preset key → scheduleEngine key
const PRESET_MAP = {
  student:     'student',
  office:      'office',
  wfh:         'wfh',
  early_bird:  'early-bird',
  night_shift: 'night-shift',
}

export default function MorningCheckin() {
  const { name, proteinTarget: savedProtein, recommendedProtein, diet, canCook,
          weight, height, age, gender, activityLevel, goal,
          goalCalories, setProteinTarget } = useProfileStore()
  const { activePreset, todayWorkoutTime, todayWorkoutDuration,
          setTodayActivity, setCheckedIn } = useScheduleStore()
  const { setTodayPlan, setGenerating } = useMealPlanStore()

  const [protein,      setProtein]      = useState(savedProtein || recommendedProtein || 80)
  const [activity,     setActivity]     = useState('gym')
  const [workoutTime,  setWorkoutTime]  = useState(todayWorkoutTime || '07:00')
  const [cookToggle,   setCookToggle]   = useState(canCook ?? true)
  const [generating,   setLocalGen]     = useState(false)

  const selectedAct = ACTIVITIES.find((a) => a.id === activity) ?? ACTIVITIES[0]
  const isRest      = activity === 'rest'

  async function handleGenerate() {
    setLocalGen(true)
    setGenerating(true)

    // Persist today's activity to schedule store
    setTodayActivity({
      todayActivity:         activity,
      todayWorkoutTime:      workoutTime,
      todayWorkoutDuration:  todayWorkoutDuration || 60,
      todayCanCook:          cookToggle,
    })

    // Persist chosen protein target
    setProteinTarget(protein)

    // Build schedule object for scheduleEngine
    const scheduleType = PRESET_MAP[activePreset] || 'wfh'
    const schedule     = { scheduleType }

    // Pick meal DB
    const mealDB = MEAL_DB[diet] || mealsVeg

    // Build lean profile for mealEngine
    const profile = { diet, canCook: cookToggle, weight, height, age, gender, activityLevel, goal }

    const plan = generateDayPlan(
      profile,
      schedule,
      protein,
      isRest ? null : workoutTime,
      todayWorkoutDuration || 60,
      selectedAct.workoutType,
      mealDB
    )

    setTodayPlan(plan)
    setCheckedIn(true)
    setLocalGen(false)
    setGenerating(false)
  }

  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? '☀️ Good morning' : hour < 17 ? '🌤️ Good afternoon' : '🌙 Good evening'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y:  0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="p-4 md:p-6 space-y-5 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-900/60 to-gray-900 border border-emerald-800/40 rounded-2xl px-4 py-3">
        <p className="text-emerald-400 text-sm font-medium">{greeting}{name ? `, ${name}` : ''}!</p>
        <h2 className="text-white text-xl font-bold mt-0.5">What's your plan today?</h2>
      </div>

      {/* Protein Target */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
            <Flame size={14} className="text-white" />
          </div>
          <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Protein Target</h3>
        </div>
        <ProteinTargetPicker
          value={protein}
          onChange={setProtein}
          recommended={recommendedProtein}
        />
      </div>

      {/* Activity */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider mb-3">Today's Activity</h3>
        <div className="grid grid-cols-3 gap-2">
          {ACTIVITIES.map((a) => (
            <button
              key={a.id}
              onClick={() => setActivity(a.id)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                activity === a.id
                  ? 'bg-violet-600/20 border-violet-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              <span className="text-2xl leading-none">{a.emoji}</span>
              <span className="text-[11px] font-semibold">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Workout time + cook toggle */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-4">
        {/* Workout time — hidden on rest day */}
        {!isRest && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-400" />
              <span className="text-sm text-gray-300 font-medium">Workout Time</span>
            </div>
            <input
              type="time"
              value={workoutTime}
              onChange={(e) => setWorkoutTime(e.target.value)}
              className="bg-gray-800 text-white text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-700 focus:outline-none focus:border-violet-500"
            />
          </div>
        )}

        {/* Cook toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-300 font-medium">Can Cook Today?</p>
            <p className="text-[11px] text-gray-600">Off = quick & no-cook meals only</p>
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
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={generating}
        className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all ${
          generating
            ? 'bg-violet-800 text-violet-300 cursor-wait'
            : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25 active:scale-[0.98]'
        }`}
      >
        {generating ? (
          <>
            <span className="animate-spin w-4 h-4 border-2 border-violet-300 border-t-transparent rounded-full" />
            Building your day…
          </>
        ) : (
          <>
            Generate My Day
            <ChevronRight size={20} />
          </>
        )}
      </button>
    </motion.div>
  )
}
