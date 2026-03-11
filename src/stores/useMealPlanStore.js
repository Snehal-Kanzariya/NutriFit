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

      // Timestamp set whenever the plan was auto-regenerated from a Profile save.
      autoRegenAt: null,

      // ── Meal tracker state ───────────────────────────────────────────────
      // checkedMeals: { [slotType]: { checkedAt: timestamp, protein: number } }
      checkedMeals: {},
      // trackerSkipped: { [slotType]: true } — user chose not to eat this meal
      trackerSkipped: {},

      // ── Plan lifecycle ───────────────────────────────────────────────────
      setTodayPlan: (plan) =>
        set({ todayPlan: plan, skippedTypes: [], skipHistory: [], addedBoosters: [],
              checkedMeals: {}, trackerSkipped: {} }),

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
    }),
    { name: 'nutrifit-mealplan' }
  )
)
