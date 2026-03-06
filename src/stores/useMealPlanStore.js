import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useMealPlanStore = create(
  persist(
    (set, get) => ({
      // Today's plan: array of { slot, meal, proteinTarget, proteinActual, proteinMatch }
      todayPlan: [],

      // Protein booster suggestions
      boosters: [],

      // Loading state
      isGenerating: false,

      setTodayPlan: (plan) => set({ todayPlan: plan }),

      updateSlot: (slotId, updates) =>
        set((s) => ({
          todayPlan: s.todayPlan.map((item) =>
            item.slot === slotId ? { ...item, ...updates } : item
          ),
        })),

      skipSlot: (slotId) => {
        const plan = get().todayPlan
        const skipped = plan.find((i) => i.slot === slotId)
        if (!skipped) return
        const skippedProtein = skipped.proteinTarget
        const remaining = plan.filter((i) => i.slot !== slotId && !i.skipped)
        const totalRemaining = remaining.reduce((a, i) => a + i.proteinTarget, 0)

        const updated = plan.map((item) => {
          if (item.slot === slotId) return { ...item, skipped: true }
          if (remaining.find((r) => r.slot === item.slot)) {
            const extra = totalRemaining > 0
              ? Math.round((item.proteinTarget / totalRemaining) * skippedProtein)
              : 0
            return { ...item, proteinTarget: item.proteinTarget + extra }
          }
          return item
        })
        set({ todayPlan: updated })
      },

      markEaten: (slotId, actualProtein) =>
        set((s) => ({
          todayPlan: s.todayPlan.map((item) =>
            item.slot === slotId
              ? { ...item, eaten: true, proteinActual: actualProtein }
              : item
          ),
        })),

      setBoosters: (boosters) => set({ boosters }),
      setGenerating: (val) => set({ isGenerating: val }),
      clearPlan: () => set({ todayPlan: [], boosters: [] }),
    }),
    { name: 'nutrifit-mealplan' }
  )
)
