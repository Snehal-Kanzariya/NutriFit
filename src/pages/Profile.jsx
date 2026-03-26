/**
 * Profile.jsx
 * Edit profile, protein target, schedule, saved routines, allergies, budget.
 * Persists to Zustand stores + Dexie on "Save Changes".
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, ChevronRight, Plus, Trash2, Edit2, CheckCircle } from 'lucide-react'

import { useProfileStore }  from '../stores/useProfileStore'
import { useScheduleStore } from '../stores/useScheduleStore'
import { useMealPlanStore } from '../stores/useMealPlanStore'
import ProteinTargetPicker  from '../components/protein/ProteinTargetPicker'
import ScheduleSheet        from '../components/schedule/ScheduleSheet'
import { saveProfile }      from '../services/storage'
import { generateDayPlan }  from '../services/mealEngine'

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

// ── Option maps ───────────────────────────────────────────────────────────────

const GOALS = [
  { id: 'muscle_gain', label: 'Muscle Gain', emoji: '💪' },
  { id: 'fat_loss',    label: 'Fat Loss',    emoji: '🔥' },
  { id: 'maintain',    label: 'Maintain',    emoji: '⚖️' },
  { id: 'recomp',      label: 'Recomp',      emoji: '🔄' },
]

const DIETS = [
  { id: 'nonveg',     label: 'Non-Veg',    emoji: '🍗' },
  { id: 'veg',        label: 'Veg',         emoji: '🥦' },
  { id: 'vegan',      label: 'Vegan',       emoji: '🌱' },
  { id: 'eggetarian', label: 'Eggetarian',  emoji: '🥚' },
]

const ACTIVITIES = [
  { id: 'sedentary', label: 'Sedentary' },
  { id: 'light',     label: 'Light'     },
  { id: 'moderate',  label: 'Moderate'  },
  { id: 'active',    label: 'Active'    },
  { id: 'intense',   label: 'Intense'   },
]

// ── Shared UI primitives ──────────────────────────────────────────────────────

function Section({ title, accent = 'text-gray-400', children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      <h2 className={`text-xs font-bold uppercase tracking-widest px-1 ${accent}`}>{title}</h2>
      {children}
    </motion.section>
  )
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, type = 'text', unit }) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors pr-12"
      />
      {unit && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500">{unit}</span>
      )}
    </div>
  )
}

function PillGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition-all ${
            value === o.id
              ? 'bg-violet-600 border-violet-500 text-white'
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
          }`}
        >
          {o.emoji && <span>{o.emoji}</span>}
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ── Allergies tag input ───────────────────────────────────────────────────────

function AllergyInput({ tags, onChange }) {
  const [input, setInput] = useState('')

  function add() {
    const trimmed = input.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInput('')
  }

  function remove(tag) {
    onChange(tags.filter((t) => t !== tag))
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ',') && add()}
          placeholder="e.g. peanuts, dairy…"
          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
        />
        <button
          onClick={add}
          className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-gray-300 text-sm font-semibold transition-colors"
        >
          Add
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1.5 bg-rose-900/40 border border-rose-700/50 text-rose-300 text-xs font-medium px-2.5 py-1 rounded-full"
            >
              {tag}
              <button onClick={() => remove(tag)} className="text-rose-400 hover:text-rose-200">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Saved Routines manager ────────────────────────────────────────────────────

function RoutineManager({ routines, onAdd, onEdit, onDelete }) {
  const [name, setName]         = useState('')
  const [protein, setProtein]   = useState(80)
  const [editing, setEditing]   = useState(null)  // routine id being edited
  const [showForm, setShowForm] = useState(false)

  function handleSave() {
    if (!name.trim()) return
    if (editing !== null) {
      onEdit({ id: editing, name: name.trim(), proteinTarget: protein })
    } else {
      onAdd({ name: name.trim(), proteinTarget: protein, createdAt: Date.now() })
    }
    setName('')
    setProtein(80)
    setEditing(null)
    setShowForm(false)
  }

  function startEdit(r) {
    setName(r.name)
    setProtein(r.proteinTarget ?? 80)
    setEditing(r.id ?? r.createdAt)
    setShowForm(true)
  }

  return (
    <div className="space-y-3">
      {routines.map((r) => (
        <div
          key={r.id ?? r.createdAt}
          className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{r.name}</p>
            <p className="text-xs text-violet-400 mt-0.5">Protein target: {r.proteinTarget ?? 80}g</p>
          </div>
          <button
            onClick={() => startEdit(r)}
            className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(r.id ?? r.createdAt)}
            className="p-1.5 text-gray-600 hover:text-rose-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-900 border border-violet-700/50 rounded-2xl p-4 space-y-4"
          >
            <TextInput
              value={name}
              onChange={setName}
              placeholder="Routine name (e.g. Gym days)"
            />
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Protein Target</p>
              <ProteinTargetPicker value={protein} onChange={setProtein} />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl transition-colors"
              >
                {editing !== null ? 'Update' : 'Save Routine'}
              </button>
              <button
                onClick={() => { setShowForm(false); setEditing(null) }}
                className="px-4 py-2.5 bg-gray-800 text-gray-400 text-sm rounded-xl transition-colors hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 w-full py-3 border border-dashed border-gray-700 rounded-xl text-gray-500 hover:text-gray-300 hover:border-gray-600 transition-colors text-sm font-medium justify-center"
        >
          <Plus size={15} />
          New Routine
        </button>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Profile() {
  const profile = useProfileStore()
  const { routines, addRoutine } = useScheduleStore()
  const { todayPlan, setTodayPlan, setAutoRegenAt } = useMealPlanStore()

  // Local form state — mirrors the profile
  const [name,          setName]          = useState(profile.name          ?? '')
  const [age,           setAge]           = useState(String(profile.age   ?? ''))
  const [weight,        setWeight]        = useState(String(profile.weight ?? ''))
  const [height,        setHeight]        = useState(String(profile.height ?? ''))
  const [goal,          setGoal]          = useState(profile.goal          ?? 'maintain')
  const [diet,          setDiet]          = useState(profile.diet          ?? 'veg')
  const [activityLevel, setActivityLevel] = useState(profile.activityLevel ?? 'moderate')
  const [proteinTarget, setProteinTarget] = useState(profile.proteinTarget ?? 80)
  const [budget,        setBudget]        = useState(String(profile.budget ?? ''))
  const [allergies,     setAllergies]     = useState(profile.allergies     ?? [])
  const [localRoutines, setLocalRoutines] = useState(routines              ?? [])

  const [saved,  setSaved]  = useState(false)
  const [saving, setSaving] = useState(false)

  // Recompute recommended protein when weight/goal change
  const recommended = (() => {
    const w = parseFloat(weight)
    const multipliers = { muscle_gain: 2.2, fat_loss: 2.4, maintain: 1.8, recomp: 2.0 }
    if (!w) return profile.recommendedProtein ?? 80
    return Math.round(w * (multipliers[goal] || 2.0))
  })()

  async function handleSave() {
    setSaving(true)
    const updates = {
      name,
      age:           parseFloat(age) || profile.age,
      weight:        parseFloat(weight) || profile.weight,
      height:        parseFloat(height) || profile.height,
      goal,
      diet,
      activityLevel,
      proteinTarget,
      budget:        parseFloat(budget) || '',
      allergies,
      recommendedProtein: recommended,
    }
    profile.setProfile(updates)
    profile.computeNutrition()

    // Persist to Dexie
    await saveProfile({ ...profile, ...updates })

    // ── Auto-regenerate meal plan with new profile settings ──────────────────
    // Only regenerate if the user has already checked in and has an active plan.
    if (todayPlan?.slots?.length) {
      try {
        const sched        = useScheduleStore.getState()
        const scheduleType = PRESET_MAP[sched.activePreset] || 'wfh'
        const workoutType  = ACTIVITY_MAP[sched.todayActivity] || 'rest'
        const hasWorkout   = workoutType !== 'rest'
        const cookable     = sched.todayCanCook ?? updates.canCook ?? true
        const db           = MEAL_DB[updates.diet] || mealsVeg

        const newPlan = generateDayPlan(
          { ...updates, canCook: cookable },
          { scheduleType },
          updates.proteinTarget,
          hasWorkout ? sched.todayWorkoutTime : null,
          sched.todayWorkoutDuration || 60,
          workoutType,
          db
        )
        setTodayPlan(newPlan)
        setAutoRegenAt(Date.now())
      } catch (err) {
        console.error('[Profile] plan regen failed:', err)
      }
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function handleAddRoutine(r) {
    const withId = { ...r, id: Date.now() }
    setLocalRoutines((prev) => [...prev, withId])
    addRoutine(withId)
  }

  function handleEditRoutine(updated) {
    setLocalRoutines((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)))
  }

  function handleDeleteRoutine(id) {
    setLocalRoutines((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 md:px-6 pt-5 pb-3">
        <div className="w-9 h-9 rounded-full bg-violet-600/20 border border-violet-700/50 flex items-center justify-center">
          <User size={16} className="text-violet-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">{name || 'Your Profile'}</h1>
          <p className="text-xs text-gray-500">{diet ? `${diet} · ` : ''}{goal?.replace('_', ' ')}</p>
        </div>
      </header>

      <div className="px-4 md:px-6 pb-28 lg:pb-8 space-y-6">

        {/* ── Two-column layout on lg+ ────────────────────────────────────── */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-6 lg:space-y-0">
          {/* Left column */}
          <div className="space-y-6">
            {/* ── ABOUT YOU ────────────────────────────────────────────────── */}
            <Section title="About You">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-4">
                <Field label="Name">
                  <TextInput value={name} onChange={setName} placeholder="Your name" />
                </Field>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Age">
                    <TextInput value={age} onChange={setAge} placeholder="25" type="number" unit="yr" />
                  </Field>
                  <Field label="Weight">
                    <TextInput value={weight} onChange={setWeight} placeholder="70" type="number" unit="kg" />
                  </Field>
                  <Field label="Height">
                    <TextInput value={height} onChange={setHeight} placeholder="170" type="number" unit="cm" />
                  </Field>
                </div>
              </div>
            </Section>

            {/* ── GOAL & DIET ──────────────────────────────────────────────── */}
            <Section title="Goal & Diet">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-4">
                <Field label="Goal">
                  <PillGroup options={GOALS} value={goal} onChange={setGoal} />
                </Field>
                <Field label="Diet">
                  <PillGroup options={DIETS} value={diet} onChange={setDiet} />
                </Field>
                <Field label="Activity Level">
                  <PillGroup options={ACTIVITIES} value={activityLevel} onChange={setActivityLevel} />
                </Field>
              </div>
            </Section>

            {/* ── PROTEIN TARGET (prominent) ───────────────────────────────── */}
            <Section title="Protein Target" accent="text-violet-400">
              <div className="bg-gray-900 border border-violet-800/50 rounded-2xl p-5">
                <ProteinTargetPicker
                  value={proteinTarget}
                  onChange={setProteinTarget}
                  recommended={recommended}
                />
              </div>
            </Section>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* ── SCHEDULE ─────────────────────────────────────────────────── */}
            <Section title="Schedule">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Today's Plan</p>
                    <p className="text-xs text-gray-500 mt-0.5">Adjust activity, timing, cook toggle</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-600" />
                </div>
                <ScheduleSheet />
              </div>
            </Section>

            {/* ── SAVED ROUTINES ───────────────────────────────────────────── */}
            <Section title="Saved Routines">
              <RoutineManager
                routines={localRoutines}
                onAdd={handleAddRoutine}
                onEdit={handleEditRoutine}
                onDelete={handleDeleteRoutine}
              />
            </Section>

            {/* ── ALLERGIES ────────────────────────────────────────────────── */}
            <Section title="Allergies / Avoid">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <AllergyInput tags={allergies} onChange={setAllergies} />
              </div>
            </Section>

            {/* ── BUDGET ───────────────────────────────────────────────────── */}
            <Section title="Daily Budget">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <TextInput
                  value={budget}
                  onChange={setBudget}
                  placeholder="Optional — e.g. 200"
                  type="number"
                  unit="₹/day"
                />
              </div>
            </Section>
          </div>
        </div>

      </div>

      {/* ── Sticky save bar ──────────────────────────────────────────────── */}
      <div className="fixed bottom-20 lg:bottom-6 left-1/2 lg:left-auto lg:right-6 lg:translate-x-0 -translate-x-1/2 w-full max-w-md lg:max-w-xs px-4 lg:px-0 z-30">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base shadow-2xl transition-all ${
            saved
              ? 'bg-emerald-600 text-white'
              : saving
                ? 'bg-violet-800 text-violet-300 cursor-wait'
                : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-500/30'
          }`}
        >
          {saved ? (
            <><CheckCircle size={18} /> Saved!</>
          ) : saving ? (
            <><span className="w-4 h-4 border-2 border-violet-300 border-t-transparent rounded-full animate-spin" /> Saving…</>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </div>
  )
}
