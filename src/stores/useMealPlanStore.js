import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * todayPlan shape (from generateDayPlan()):
 *   { slots: SlotResult[], totalProtein, proteinTarget, hasWorkout, date }
 *
 * SlotResult: { type, time, label, proteinTarget, meal, proteinMatch, deltaLabel, fallback }
 */
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

      // ── Plan lifecycle ───────────────────────────────────────────────────
      setTodayPlan: (plan) =>
        set({ todayPlan: plan, skippedTypes: [], skipHistory: [], addedBoosters: [] }),

      // Called after mealEngine.applySkip() resolves
      applySkipResult: (updatedPlan, skippedType, skippedLabel, proteinWas, boosts) =>
        set((s) => ({
          todayPlan:    updatedPlan,
          skippedTypes: [...s.skippedTypes, skippedType],
          skipHistory:  [...s.skipHistory, { type: skippedType, label: skippedLabel, proteinWas, boosts }],
        })),

      // Swap a meal in a slot with a getSwapAlternatives() result
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

      clearPlan: () =>
        set({ todayPlan: null, skippedTypes: [], skipHistory: [], addedBoosters: [], isGenerating: false }),
    }),
    { name: 'nutrifit-mealplan' }
  )
)
