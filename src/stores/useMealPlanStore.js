import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * todayPlan shape (from generateDayPlan()):
 *   { slots: SlotResult[], totalProtein, proteinTarget, hasWorkout, date }
 *
 * SlotResult: { type, time, label, proteinTarget, meal, proteinMatch, deltaLabel, fallback }
 */

// ── Trainer utilities (exported for component use) ────────────────────────────

function formatSlotLabel(slotType) {
  if (!slotType) return 'Extra'
  return slotType.split(/[_-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export function getEffectiveSlots(todayPlan, trainerEdits) {
  if (!todayPlan?.slots) return []
  const { replacedMeals = {}, removedSlots = [], addedMeals = [], notes = {} } = trainerEdits

  const baseSlots = todayPlan.slots.map((slot, i) => {
    const removed     = removedSlots.includes(i)
    const replacement = replacedMeals[String(i)]
    return {
      ...slot,
      meal:           removed ? null : (replacement || slot.meal),
      trainerRemoved: removed,
      trainerReplaced: !removed && !!replacement,
      trainerAdded:   false,
      trainerNote:    notes.perMeal?.[String(i)] || null,
      originalIndex:  i,
    }
  })

  const extraSlots = (addedMeals || []).map((meal, j) => ({
    type:           meal.slotType || 'extra',
    label:          formatSlotLabel(meal.slotType),
    time:           '',
    proteinTarget:  0,
    meal,
    trainerAdded:   true,
    trainerRemoved: false,
    trainerReplaced: false,
    trainerNote:    meal.trainerNote || null,
    originalIndex:  (todayPlan.slots?.length || 0) + j,
  }))

  return [...baseSlots, ...extraSlots]
}

export function computeVerification(effectiveSlots, supplements, target) {
  const safeTarget  = target || 80
  const foodProtein = effectiveSlots
    .filter(s => !s.trainerRemoved)
    .reduce((sum, s) => sum + (s.meal?.protein || 0), 0)
  const suppProtein = (supplements || []).reduce(
    (sum, s) => sum + (s.protein || s.totalProtein || 0), 0
  )
  const totalProtein = foodProtein + suppProtein
  const pct          = Math.round((totalProtein / safeTarget) * 100)

  let status, color
  if (pct >= 95)      { status = 'PASS';    color = 'emerald' }
  else if (pct >= 80) { status = 'WARNING'; color = 'amber'   }
  else                { status = 'FAIL';    color = 'red'      }

  const shortfall = Math.max(0, safeTarget - totalProtein)
  const excess    = Math.max(0, totalProtein - safeTarget)
  let message
  if (pct >= 95 && pct <= 110) message = '✅ On target!'
  else if (pct > 110)          message = `⚠️ ${excess}g over target`
  else if (pct >= 80)          message = `⚠️ ${shortfall}g short`
  else                         message = `❌ ${shortfall}g short`

  const slotAnalysis = effectiveSlots.map((slot, i) => {
    const slotTarget = slot.proteinTarget || 0
    const slotActual = slot.trainerRemoved ? 0 : (slot.meal?.protein || 0)
    const diff       = slotActual - slotTarget
    let slotColor
    if (slot.trainerRemoved)       slotColor = 'gray'
    else if (Math.abs(diff) <= 3)  slotColor = 'emerald'
    else if (Math.abs(diff) <= 10) slotColor = 'amber'
    else                           slotColor = 'red'
    return {
      index: i, slotType: slot.type, label: slot.label,
      target: slotTarget, actual: slotActual, diff, color: slotColor,
      trainerRemoved: slot.trainerRemoved, trainerAdded: slot.trainerAdded,
    }
  })

  return { foodProtein, suppProtein, totalProtein, percentage: pct, status, color, message, slotAnalysis }
}

function initialTrainerEdits() {
  return {
    replacedMeals:  {},
    addedMeals:     [],
    removedSlots:   [],
    notes:          { general: '', perMeal: {} },
    proteinOverride: null,
    supplements:    [],
  }
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useMealPlanStore = create(
  persist(
    (set, get) => ({
      // Full plan object from mealEngine.generateDayPlan()
      todayPlan: null,

      // Slots that have been skipped (type strings)
      skippedTypes: [],

      // History entry per skip: [{ type, label, proteinWas, boosts }]
      skipHistory: [],

      // Protein boosters the user has "added" to their day
      addedBoosters: [],

      // Loading flag
      isGenerating: false,

      // Timestamp set whenever the plan was auto-regenerated from a Profile save.
      autoRegenAt: null,

      // ── Meal tracker state ───────────────────────────────────────────────
      checkedMeals:  {},
      trackerSkipped: {},

      // ── Trainer state ────────────────────────────────────────────────────
      trainerEdits:       initialTrainerEdits(),
      modifiedByTrainer:  false,
      verificationResult: null,

      // ── Plan lifecycle ───────────────────────────────────────────────────
      setTodayPlan: (plan) =>
        set({ todayPlan: plan, skippedTypes: [], skipHistory: [], addedBoosters: [],
              checkedMeals: {}, trackerSkipped: {} }),

      applySkipResult: (updatedPlan, skippedType, skippedLabel, proteinWas, boosts) =>
        set((s) => ({
          todayPlan:    updatedPlan,
          skippedTypes: [...s.skippedTypes, skippedType],
          skipHistory:  [...s.skipHistory, { type: skippedType, label: skippedLabel, proteinWas, boosts }],
        })),

      swapMealInSlot: (slotType, mealResult) =>
        set((s) => {
          if (!s.todayPlan?.slots) return s
          const slots = s.todayPlan.slots.map((slot) =>
            slot.type === slotType
              ? {
                  ...slot,
                  meal:         mealResult.meal,
                  proteinMatch: mealResult.proteinMatch,
                  deltaLabel:   mealResult.deltaLabel,
                  fallback:     mealResult.fallback,
                  inTolerance:  mealResult.inTolerance,
                }
              : slot
          )
          const totalProtein = slots.reduce((sum, sl) => sum + (sl.meal?.protein ?? 0), 0)
          return { todayPlan: { ...s.todayPlan, slots, totalProtein } }
        }),

      // ── Protein boosters ─────────────────────────────────────────────────
      addBooster: (booster) =>
        set((s) => ({ addedBoosters: [...s.addedBoosters, booster] })),

      removeBooster: (boosterId) =>
        set((s) => ({ addedBoosters: s.addedBoosters.filter((b) => b.id !== boosterId) })),

      // ── Misc ─────────────────────────────────────────────────────────────
      setGenerating: (val) => set({ isGenerating: val }),

      setAutoRegenAt: (ts) => set({ autoRegenAt: ts }),

      // ── Tracker actions ──────────────────────────────────────────────────
      checkMeal: (slotType, protein) =>
        set((s) => ({
          checkedMeals: { ...s.checkedMeals, [slotType]: { checkedAt: Date.now(), protein } },
        })),

      uncheckMeal: (slotType) =>
        set((s) => {
          const { [slotType]: _, ...rest } = s.checkedMeals
          return { checkedMeals: rest }
        }),

      trackerSkipMeal: (slotType) =>
        set((s) => ({ trackerSkipped: { ...s.trackerSkipped, [slotType]: true } })),

      restoreTrackerMeal: (slotType) =>
        set((s) => {
          const { [slotType]: _, ...rest } = s.trackerSkipped
          return { trackerSkipped: rest }
        }),

      clearPlan: () =>
        set({ todayPlan: null, skippedTypes: [], skipHistory: [], addedBoosters: [],
              isGenerating: false, checkedMeals: {}, trackerSkipped: {} }),

      // ── Trainer actions ──────────────────────────────────────────────────
      trainerReplaceMeal: (index, meal) =>
        set((s) => {
          const edits  = { ...s.trainerEdits, replacedMeals: { ...s.trainerEdits.replacedMeals, [String(index)]: meal } }
          const target = edits.proteinOverride ?? s.todayPlan?.proteinTarget ?? 80
          return { trainerEdits: edits, verificationResult: computeVerification(getEffectiveSlots(s.todayPlan, edits), edits.supplements, target) }
        }),

      trainerAddCustomMeal: (meal) =>
        set((s) => {
          const edits  = { ...s.trainerEdits, addedMeals: [...s.trainerEdits.addedMeals, meal] }
          const target = edits.proteinOverride ?? s.todayPlan?.proteinTarget ?? 80
          return { trainerEdits: edits, verificationResult: computeVerification(getEffectiveSlots(s.todayPlan, edits), edits.supplements, target) }
        }),

      trainerRemoveMeal: (index) =>
        set((s) => {
          const edits  = { ...s.trainerEdits, removedSlots: [...s.trainerEdits.removedSlots.filter(i => i !== index), index] }
          const target = edits.proteinOverride ?? s.todayPlan?.proteinTarget ?? 80
          return { trainerEdits: edits, verificationResult: computeVerification(getEffectiveSlots(s.todayPlan, edits), edits.supplements, target) }
        }),

      trainerRestoreMeal: (index) =>
        set((s) => {
          const edits  = { ...s.trainerEdits, removedSlots: s.trainerEdits.removedSlots.filter(i => i !== index) }
          const target = edits.proteinOverride ?? s.todayPlan?.proteinTarget ?? 80
          return { trainerEdits: edits, verificationResult: computeVerification(getEffectiveSlots(s.todayPlan, edits), edits.supplements, target) }
        }),

      trainerAddNote: (index, note) =>
        set((s) => ({
          trainerEdits: {
            ...s.trainerEdits,
            notes: { ...s.trainerEdits.notes, perMeal: { ...s.trainerEdits.notes.perMeal, [String(index)]: note } },
          },
        })),

      trainerSetGeneralNote: (note) =>
        set((s) => ({ trainerEdits: { ...s.trainerEdits, notes: { ...s.trainerEdits.notes, general: note } } })),

      trainerOverrideProtein: (target) =>
        set((s) => {
          const edits = { ...s.trainerEdits, proteinOverride: target }
          const eff   = getEffectiveSlots(s.todayPlan, edits)
          return { trainerEdits: edits, verificationResult: computeVerification(eff, edits.supplements, target ?? s.todayPlan?.proteinTarget ?? 80) }
        }),

      trainerAddSupplement: (supp) =>
        set((s) => {
          const edits  = { ...s.trainerEdits, supplements: [...s.trainerEdits.supplements, supp] }
          const target = edits.proteinOverride ?? s.todayPlan?.proteinTarget ?? 80
          return { trainerEdits: edits, verificationResult: computeVerification(getEffectiveSlots(s.todayPlan, edits), edits.supplements, target) }
        }),

      trainerRemoveSupplement: (suppId) =>
        set((s) => {
          const edits  = { ...s.trainerEdits, supplements: s.trainerEdits.supplements.filter(x => x.id !== suppId) }
          const target = edits.proteinOverride ?? s.todayPlan?.proteinTarget ?? 80
          return { trainerEdits: edits, verificationResult: computeVerification(getEffectiveSlots(s.todayPlan, edits), edits.supplements, target) }
        }),

      verifyPlan: () => {
        const s      = get()
        const target = s.trainerEdits.proteinOverride ?? s.todayPlan?.proteinTarget ?? 80
        const result = computeVerification(getEffectiveSlots(s.todayPlan, s.trainerEdits), s.trainerEdits.supplements, target)
        set({ verificationResult: result })
        return result
      },

      trainerSavePlan: (withWarning = false) =>
        set((s) => {
          const target        = s.trainerEdits.proteinOverride ?? s.todayPlan?.proteinTarget ?? 80
          const effectiveSlots = getEffectiveSlots(s.todayPlan, s.trainerEdits)
          const result        = computeVerification(effectiveSlots, s.trainerEdits.supplements, target)
          const newSlots      = effectiveSlots.map((slot) => ({
            ...slot,
            meal: slot.meal ? { ...slot.meal, trainerNote: slot.trainerNote } : null,
          }))
          const newPlan = {
            ...(s.todayPlan || {}),
            slots:                   newSlots,
            modifiedByTrainer:       true,
            trainerVerified:         result.status === 'PASS',
            trainerVerificationWarn: withWarning,
            trainerGeneralNote:      s.trainerEdits.notes.general,
            trainerSupplements:      s.trainerEdits.supplements,
          }
          return { todayPlan: newPlan, modifiedByTrainer: true, verificationResult: result, trainerEdits: initialTrainerEdits() }
        }),

      resetTrainerEdits: () =>
        set((s) => {
          const edits  = initialTrainerEdits()
          const target = s.todayPlan?.proteinTarget ?? 80
          return { trainerEdits: edits, verificationResult: computeVerification(getEffectiveSlots(s.todayPlan, edits), [], target) }
        }),
    }),
    { name: 'nutrifit-mealplan' }
  )
)
