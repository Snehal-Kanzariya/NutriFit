import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Info, Check } from 'lucide-react'
import { useProfileStore } from '../stores/useProfileStore'

// ─── Constants ────────────────────────────────────────────────────────────────

const GOALS = [
  { id: 'muscle_gain', emoji: '💪', label: 'Muscle Gain', multiplier: 2.2 },
  { id: 'fat_loss',    emoji: '🔥', label: 'Fat Loss',    multiplier: 2.4 },
  { id: 'maintain',    emoji: '⚖️', label: 'Maintain',    multiplier: 1.8 },
  { id: 'recomp',      emoji: '🔄', label: 'Recomposition', multiplier: 2.0 },
]

const DIETS = [
  { id: 'nonveg',      emoji: '🍗', label: 'Non-Veg'    },
  { id: 'veg',         emoji: '🥦', label: 'Veg'        },
  { id: 'vegan',       emoji: '🌱', label: 'Vegan'      },
  { id: 'eggetarian',  emoji: '🥚', label: 'Eggetarian' },
]

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary',  desc: 'Little or no exercise',        multiplier: 1.2   },
  { id: 'light',     label: 'Light',      desc: '1–3 days/week exercise',        multiplier: 1.375 },
  { id: 'moderate',  label: 'Moderate',   desc: '3–5 days/week exercise',        multiplier: 1.55  },
  { id: 'active',    label: 'Active',     desc: '6–7 days/week hard exercise',   multiplier: 1.725 },
  { id: 'intense',   label: 'Intense',    desc: 'Very hard exercise, physical job', multiplier: 1.9 },
]

const SCHEDULE_PRESETS = [
  { id: 'student',     label: 'Student',    wake: '07:00', sleep: '00:00', workout: '06:00' },
  { id: 'office',      label: 'Office 9-6', wake: '07:00', sleep: '23:00', workout: '07:00' },
  { id: 'wfh',         label: 'WFH',        wake: '08:00', sleep: '00:00', workout: '09:00' },
  { id: 'early_bird',  label: 'Early Bird', wake: '05:00', sleep: '21:00', workout: '05:30' },
  { id: 'night_shift', label: 'Night Shift',wake: '15:00', sleep: '08:00', workout: '16:00' },
]

const WORKOUT_TYPES = [
  { id: 'gym',     emoji: '🏋️', label: 'Gym'        },
  { id: 'yoga',    emoji: '🧘', label: 'Yoga'       },
  { id: 'running', emoji: '🏃', label: 'Running'    },
  { id: 'sports',  emoji: '⚽', label: 'Sports'     },
  { id: 'home',    emoji: '🏠', label: 'Home WO'   },
  { id: 'rest',    emoji: '😴', label: 'Rest Day'   },
]

const PROTEIN_PRESETS = [
  { id: 'light',    label: 'Light',    value: 40  },
  { id: 'moderate', label: 'Moderate', value: 80  },
  { id: 'high',     label: 'High',     value: 120 },
  { id: 'max',      label: 'Max',      value: 160 },
]

const TOTAL_STEPS = 5

// ─── Slide animation variants ─────────────────────────────────────────────────

function getVariants(direction) {
  return {
    enter: { x: direction > 0 ? 60 : -60, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit:  { x: direction > 0 ? -60 : 60, opacity: 0 },
  }
}

// ─── Shared UI helpers ────────────────────────────────────────────────────────

function Label({ children, required }) {
  return (
    <label className="block text-sm font-medium text-gray-300 mb-1.5">
      {children}{required && <span className="text-violet-400 ml-1">*</span>}
    </label>
  )
}

function TextInput({ label, required, error, ...props }) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <input
        {...props}
        className={`w-full bg-gray-800 border ${
          error ? 'border-red-500' : 'border-gray-700'
        } rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors text-base`}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

function SectionTitle({ children }) {
  return <h2 className="text-xl font-bold text-white mb-6">{children}</h2>
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
            i < step ? 'bg-violet-500' : i === step ? 'bg-violet-500/50' : 'bg-gray-800'
          }`}
        />
      ))}
    </div>
  )
}

// ─── STEP 1 — About You ───────────────────────────────────────────────────────

function StepAboutYou({ data, onChange, errors }) {
  return (
    <div className="space-y-5">
      <SectionTitle>Tell us about yourself 👋</SectionTitle>

      <TextInput
        label="Your name"
        required
        placeholder="e.g. Arjun"
        value={data.name}
        onChange={(e) => onChange('name', e.target.value)}
        error={errors.name}
      />

      <TextInput
        label="Age"
        required
        type="number"
        placeholder="e.g. 25"
        inputMode="numeric"
        value={data.age}
        onChange={(e) => onChange('age', e.target.value)}
        error={errors.age}
      />

      {/* Gender toggle */}
      <div>
        <Label required>Gender</Label>
        <div className="flex gap-3">
          {['male', 'female'].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onChange('gender', g)}
              className={`flex-1 py-3 rounded-xl font-semibold capitalize transition-all ${
                data.gender === g
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
              }`}
            >
              {g === 'male' ? '♂ Male' : '♀ Female'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TextInput
          label="Weight (kg)"
          required
          type="number"
          inputMode="decimal"
          placeholder="e.g. 70"
          value={data.weight}
          onChange={(e) => onChange('weight', e.target.value)}
          error={errors.weight}
        />
        <TextInput
          label="Height (cm)"
          required
          type="number"
          inputMode="decimal"
          placeholder="e.g. 175"
          value={data.height}
          onChange={(e) => onChange('height', e.target.value)}
          error={errors.height}
        />
      </div>
    </div>
  )
}

// ─── STEP 2 — Goal & Diet ────────────────────────────────────────────────────

function StepGoalDiet({ data, onChange, errors }) {
  return (
    <div className="space-y-6">
      <SectionTitle>Your goal & diet 🎯</SectionTitle>

      {/* Goals */}
      <div>
        <Label required>Primary Goal</Label>
        <div className="grid grid-cols-2 gap-3">
          {GOALS.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => onChange('goal', g.id)}
              className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all ${
                data.goal === g.id
                  ? 'border-violet-500 bg-violet-950/60 text-white shadow-lg shadow-violet-900/30'
                  : 'border-gray-700 bg-gray-800/60 text-gray-400 hover:border-gray-600'
              }`}
            >
              <span className="text-2xl">{g.emoji}</span>
              <span className="text-sm font-semibold">{g.label}</span>
            </button>
          ))}
        </div>
        {errors.goal && <p className="text-red-400 text-xs mt-1">{errors.goal}</p>}
      </div>

      {/* Diet */}
      <div>
        <Label required>Diet Type</Label>
        <div className="grid grid-cols-2 gap-3">
          {DIETS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => onChange('diet', d.id)}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl border-2 transition-all ${
                data.diet === d.id
                  ? 'border-violet-500 bg-violet-950/60 text-white shadow-lg shadow-violet-900/30'
                  : 'border-gray-700 bg-gray-800/60 text-gray-400 hover:border-gray-600'
              }`}
            >
              <span className="text-xl">{d.emoji}</span>
              <span className="text-sm font-semibold">{d.label}</span>
            </button>
          ))}
        </div>
        {errors.diet && <p className="text-red-400 text-xs mt-1">{errors.diet}</p>}
      </div>

      {/* Activity Level */}
      <div>
        <Label required>Activity Level</Label>
        <div className="space-y-2">
          {ACTIVITY_LEVELS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => onChange('activityLevel', a.id)}
              className={`w-full flex items-center justify-between py-3 px-4 rounded-xl border-2 transition-all ${
                data.activityLevel === a.id
                  ? 'border-violet-500 bg-violet-950/60 text-white'
                  : 'border-gray-700 bg-gray-800/60 text-gray-400 hover:border-gray-600'
              }`}
            >
              <div className="text-left">
                <p className={`font-semibold text-sm ${data.activityLevel === a.id ? 'text-white' : 'text-gray-300'}`}>
                  {a.label}
                </p>
                <p className="text-xs text-gray-500">{a.desc}</p>
              </div>
              {data.activityLevel === a.id && (
                <Check size={18} className="text-violet-400 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
        {errors.activityLevel && <p className="text-red-400 text-xs mt-1">{errors.activityLevel}</p>}
      </div>
    </div>
  )
}

// ─── STEP 3 — Protein Target ─────────────────────────────────────────────────

function StepProteinTarget({ data, onChange }) {
  const goal = GOALS.find((g) => g.id === data.goal)
  const weight = parseFloat(data.weight) || 70
  const multiplier = goal?.multiplier || 2.0
  const recommended = Math.round(weight * multiplier)

  const pct = ((data.proteinTarget - 30) / (200 - 30)) * 100

  return (
    <div className="space-y-6">
      <SectionTitle>Set your protein target 🎯</SectionTitle>

      {/* Recommended card */}
      <div className="bg-violet-950/60 border border-violet-500/40 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-violet-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-300">
              Based on your profile, we recommend
            </p>
            <p className="text-3xl font-bold text-violet-400 mt-1">
              {recommended}g
              <span className="text-base font-normal text-gray-400 ml-2">protein/day</span>
            </p>
          </div>
        </div>
      </div>

      {/* Slider + number input */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>Your protein target</Label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={30}
              max={200}
              value={data.proteinTarget}
              onChange={(e) => {
                const v = Math.min(200, Math.max(30, parseInt(e.target.value) || 30))
                onChange('proteinTarget', v)
              }}
              className="w-20 text-center bg-gray-800 border border-violet-500/50 rounded-lg px-2 py-1.5 text-violet-300 font-bold text-lg focus:outline-none focus:border-violet-400"
            />
            <span className="text-gray-400 font-medium">g</span>
          </div>
        </div>

        {/* Slider track */}
        <div className="relative h-6 flex items-center">
          <div className="absolute inset-x-0 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <input
            type="range"
            min={30}
            max={200}
            step={5}
            value={data.proteinTarget}
            onChange={(e) => onChange('proteinTarget', parseInt(e.target.value))}
            className="protein-slider absolute inset-0 w-full opacity-0 cursor-pointer h-6"
            style={{ zIndex: 2 }}
          />
          {/* Visual thumb */}
          <div
            className="absolute w-6 h-6 rounded-full bg-violet-500 shadow-lg shadow-violet-900/60 border-2 border-gray-950 pointer-events-none transition-all"
            style={{ left: `calc(${pct}% - ${pct * 0.24}px)` }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>30g</span>
          <span>200g</span>
        </div>
      </div>

      {/* Presets */}
      <div>
        <Label>Quick presets</Label>
        <div className="grid grid-cols-4 gap-2">
          {PROTEIN_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                onChange('proteinTarget', p.value)
                onChange('proteinPreset', p.id)
              }}
              className={`py-2.5 px-1 rounded-xl text-xs font-semibold text-center transition-all border-2 ${
                data.proteinTarget === p.value
                  ? 'border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-900/40'
                  : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
              }`}
            >
              <span className="block text-sm font-bold">{p.label}</span>
              <span className="block text-gray-400 text-[11px]">{p.value}g</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-3 flex gap-2">
        <span className="text-lg flex-shrink-0">💡</span>
        <p className="text-xs text-gray-400 leading-relaxed">
          For <span className="text-white font-medium">{goal?.label || 'your goal'}</span> at{' '}
          <span className="text-white font-medium">{weight}kg</span>, the optimal protein is{' '}
          <span className="text-violet-400 font-semibold">{multiplier}g/kg = {recommended}g/day</span>.
          {' '}This preserves muscle, fuels performance, and keeps you satiated.
        </p>
      </div>
    </div>
  )
}

// ─── STEP 4 — Life Schedule ──────────────────────────────────────────────────

function StepSchedule({ data, onChange }) {
  const applyPreset = (preset) => {
    onChange('schedulePreset', preset.id)
    onChange('wakeTime', preset.wake)
    onChange('sleepTime', preset.sleep)
    onChange('workoutTime', preset.workout)
  }

  return (
    <div className="space-y-6">
      <SectionTitle>Your daily schedule 🕐</SectionTitle>

      {/* Presets */}
      <div>
        <Label>Quick presets</Label>
        <div className="flex gap-2 flex-wrap">
          {SCHEDULE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p)}
              className={`py-2 px-4 rounded-full text-sm font-medium transition-all border ${
                data.schedulePreset === p.id
                  ? 'border-violet-500 bg-violet-600 text-white'
                  : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Wake / Sleep times */}
      <div className="grid grid-cols-2 gap-3">
        <TextInput
          label="Wake time"
          type="time"
          value={data.wakeTime}
          onChange={(e) => onChange('wakeTime', e.target.value)}
        />
        <TextInput
          label="Sleep time"
          type="time"
          value={data.sleepTime}
          onChange={(e) => onChange('sleepTime', e.target.value)}
        />
      </div>

      {/* Workout section */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 space-y-4">
        <p className="text-sm font-semibold text-gray-300">Workout Details</p>

        <div className="grid grid-cols-2 gap-3">
          <TextInput
            label="Workout time"
            type="time"
            value={data.workoutTime}
            onChange={(e) => onChange('workoutTime', e.target.value)}
          />
          <div>
            <Label>Duration (min)</Label>
            <input
              type="number"
              inputMode="numeric"
              min={15}
              max={180}
              step={15}
              value={data.workoutDuration}
              onChange={(e) => onChange('workoutDuration', parseInt(e.target.value) || 60)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
        </div>

        {/* Workout type */}
        <div>
          <Label>Workout type</Label>
          <div className="grid grid-cols-3 gap-2">
            {WORKOUT_TYPES.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => onChange('workoutType', w.id)}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all ${
                  data.workoutType === w.id
                    ? 'border-violet-500 bg-violet-950/60 text-white'
                    : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                }`}
              >
                <span className="text-xl">{w.emoji}</span>
                <span className="text-[11px] font-medium">{w.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cooking toggle */}
      <div className="flex items-center justify-between bg-gray-800/60 border border-gray-700 rounded-2xl p-4">
        <div>
          <p className="font-semibold text-white text-sm">Can cook today?</p>
          <p className="text-xs text-gray-500 mt-0.5">We'll include quick meals if not</p>
        </div>
        <button
          type="button"
          onClick={() => onChange('canCook', !data.canCook)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            data.canCook ? 'bg-violet-600' : 'bg-gray-700'
          }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow ${
              data.canCook ? 'left-7' : 'left-1'
            }`}
          />
        </button>
      </div>

      {/* Budget */}
      <TextInput
        label="Daily budget (₹, optional)"
        type="number"
        inputMode="numeric"
        placeholder="e.g. 200"
        value={data.budget}
        onChange={(e) => onChange('budget', e.target.value)}
      />
    </div>
  )
}

// ─── STEP 5 — Summary ────────────────────────────────────────────────────────

function StepSummary({ data }) {
  const weight = parseFloat(data.weight) || 70
  const height = parseFloat(data.height) || 175
  const age    = parseFloat(data.age) || 25

  // BMR (Mifflin-St Jeor)
  const bmr = data.gender === 'male'
    ? Math.round((10 * weight) + (6.25 * height) - (5 * age) + 5)
    : Math.round((10 * weight) + (6.25 * height) - (5 * age) - 161)

  const actMult = ACTIVITY_LEVELS.find((a) => a.id === data.activityLevel)?.multiplier || 1.55
  const tdee = Math.round(bmr * actMult)

  const goalAdj = { muscle_gain: 300, fat_loss: -500, maintain: 0, recomp: -200 }
  const goalCalories = tdee + (goalAdj[data.goal] || 0)

  // Protein distribution
  const isWorkout = data.workoutType !== 'rest'
  const distributions = isWorkout
    ? [
        { slot: 'Breakfast',     pct: 20, color: 'bg-violet-600' },
        { slot: 'Pre-Workout',   pct: 5,  color: 'bg-violet-400' },
        { slot: 'Post-Workout',  pct: 30, color: 'bg-violet-500' },
        { slot: 'Lunch',         pct: 25, color: 'bg-violet-700' },
        { slot: 'Snack',         pct: 5,  color: 'bg-violet-300' },
        { slot: 'Dinner',        pct: 15, color: 'bg-violet-800' },
      ]
    : [
        { slot: 'Breakfast', pct: 25, color: 'bg-violet-600' },
        { slot: 'Lunch',     pct: 35, color: 'bg-violet-500' },
        { slot: 'Snack',     pct: 15, color: 'bg-violet-400' },
        { slot: 'Dinner',    pct: 25, color: 'bg-violet-700' },
      ]

  const protein = data.proteinTarget
  const goal = GOALS.find((g) => g.id === data.goal)

  return (
    <div className="space-y-5">
      <SectionTitle>Your nutrition plan 📊</SectionTitle>

      {/* Protein hero card */}
      <div className="bg-violet-950/70 border-2 border-violet-500/50 rounded-2xl p-5 text-center">
        <p className="text-sm text-violet-300 font-medium mb-1">Daily Protein Target</p>
        <p className="text-5xl font-black text-violet-400">{protein}g</p>
        <p className="text-xs text-gray-400 mt-1">
          {goal?.multiplier || 2.0}g × {weight}kg for {goal?.label || 'your goal'}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'BMR',          value: bmr,          unit: 'kcal', color: 'text-amber-400' },
          { label: 'TDEE',         value: tdee,         unit: 'kcal', color: 'text-emerald-400' },
          { label: 'Goal Calories',value: goalCalories, unit: 'kcal', color: 'text-blue-400' },
        ].map((s) => (
          <div key={s.label} className="bg-gray-800/80 border border-gray-700 rounded-xl p-3 text-center">
            <p className={`text-lg font-bold ${s.color}`}>{s.value.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500">{s.unit}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Protein distribution bar */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4">
        <p className="text-sm font-semibold text-gray-300 mb-3">
          Protein distribution across meals
        </p>

        {/* Stacked bar */}
        <div className="flex h-5 rounded-full overflow-hidden gap-0.5 mb-4">
          {distributions.map((d) => (
            <div
              key={d.slot}
              className={`${d.color} transition-all`}
              style={{ width: `${d.pct}%` }}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="space-y-2">
          {distributions.map((d) => {
            const g = Math.round((d.pct / 100) * protein)
            return (
              <div key={d.slot} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${d.color}`} />
                  <span className="text-gray-400">{d.slot}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden" style={{ width: 60 }}>
                    <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
                  </div>
                  <span className="text-gray-300 font-semibold w-8 text-right">{g}g</span>
                  <span className="text-gray-600 w-8">({d.pct}%)</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Profile summary */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 grid grid-cols-2 gap-y-2 text-sm">
        {[
          { label: 'Name',     value: data.name },
          { label: 'Goal',     value: goal?.label || '—' },
          { label: 'Diet',     value: DIETS.find((d) => d.id === data.diet)?.label || '—' },
          { label: 'Activity', value: ACTIVITY_LEVELS.find((a) => a.id === data.activityLevel)?.label || '—' },
          { label: 'Weight',   value: `${weight}kg` },
          { label: 'Height',   value: `${height}cm` },
        ].map((r) => (
          <div key={r.label}>
            <span className="text-gray-500 text-xs">{r.label}</span>
            <p className="text-white font-semibold text-sm">{r.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Onboarding Component ────────────────────────────────────────────────

export default function Onboarding() {
  const navigate = useNavigate()
  const { setProfile, setOnboarded, computeNutrition } = useProfileStore()

  const [step, setStep]         = useState(0)    // 0-indexed
  const [direction, setDirection] = useState(1)

  const [formData, setFormData] = useState({
    // Step 1
    name: '', age: '', gender: 'male', weight: '', height: '',
    // Step 2
    goal: '', diet: '', activityLevel: '',
    // Step 3
    proteinTarget: 80, proteinPreset: 'moderate',
    // Step 4
    schedulePreset: '', wakeTime: '07:00', sleepTime: '23:00',
    workoutTime: '07:00', workoutDuration: 60, workoutType: 'gym',
    canCook: true, budget: '',
  })

  const [errors, setErrors] = useState({})

  const onChange = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }, [])

  // ── Validation ──────────────────────────────────────────────────────────────

  const validateStep = (s) => {
    const errs = {}
    if (s === 0) {
      if (!formData.name.trim())                    errs.name   = 'Name is required'
      const age = parseInt(formData.age)
      if (!formData.age || age < 14 || age > 80)   errs.age    = 'Age must be 14–80'
      const wt = parseFloat(formData.weight)
      if (!formData.weight || wt < 30 || wt > 200) errs.weight = 'Weight must be 30–200 kg'
      const ht = parseFloat(formData.height)
      if (!formData.height || ht < 100 || ht > 250) errs.height = 'Height must be 100–250 cm'
    }
    if (s === 1) {
      if (!formData.goal)          errs.goal          = 'Please select a goal'
      if (!formData.diet)          errs.diet          = 'Please select a diet type'
      if (!formData.activityLevel) errs.activityLevel = 'Please select activity level'
    }
    return errs
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  const goNext = () => {
    const errs = validateStep(step)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setDirection(1)
    setStep((s) => s + 1)
  }

  const goBack = () => {
    setDirection(-1)
    setStep((s) => s - 1)
  }

  const handleComplete = () => {
    setProfile({
      ...formData,
      age: formData.age.toString(),
      weight: formData.weight.toString(),
      height: formData.height.toString(),
    })
    computeNutrition()
    setOnboarded()
    navigate('/dashboard', { replace: true })
  }

  // ── Step content ────────────────────────────────────────────────────────────

  const STEPS = [
    <StepAboutYou    key={0} data={formData} onChange={onChange} errors={errors} />,
    <StepGoalDiet    key={1} data={formData} onChange={onChange} errors={errors} />,
    <StepProteinTarget key={2} data={formData} onChange={onChange} />,
    <StepSchedule    key={3} data={formData} onChange={onChange} />,
    <StepSummary     key={4} data={formData} />,
  ]

  const stepTitles = ['About You', 'Goal & Diet', 'Protein Target', 'Schedule', 'Summary']

  const variants = getVariants(direction)

  return (
    <div className="flex justify-center min-h-screen bg-gray-950">
      <div className="w-full max-w-[480px] min-h-screen flex flex-col">

        {/* Header */}
        <div className="px-5 pt-12 pb-4 flex-shrink-0">
          {/* Back button */}
          {step > 0 && (
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors mb-4"
            >
              <ChevronLeft size={20} />
              <span className="text-sm">Back</span>
            </button>
          )}

          {/* App name */}
          {step === 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center text-sm font-black">N</div>
                <span className="text-lg font-black text-white tracking-tight">NutriFit</span>
              </div>
              <p className="text-gray-400 text-sm">Tell us your protein goal. We'll build your day.</p>
            </div>
          )}

          {/* Progress */}
          <ProgressBar step={step} />

          {/* Step label */}
          <p className="text-xs text-violet-400 font-semibold uppercase tracking-wider mb-1">
            Step {step + 1} of {TOTAL_STEPS}
          </p>
          <p className="text-sm text-gray-500">{stepTitles[step]}</p>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-8">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {STEPS[step]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer CTA */}
        <div className="px-5 pb-10 pt-4 flex-shrink-0 bg-gradient-to-t from-gray-950 via-gray-950/95 to-transparent">
          {step < TOTAL_STEPS - 1 ? (
            <button
              onClick={goNext}
              className="w-full bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-violet-900/40"
            >
              Continue
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-500 hover:to-emerald-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-900/40 text-base"
            >
              Generate My Meal Plan 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
