import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useNutritionStore = create(
  persist(
    (set) => ({
      // Daily totals
      dailyTotals: {
        protein: 0,
        carbs: 0,
        fat: 0,
        calories: 0,
        fiber: 0,
      },

      // Weekly history: array of { date, protein, carbs, fat, calories, proteinTarget, hit }
      weeklyHistory: [],

      // Glow nutrients tracking
      glowNutrients: {
        iron: 0,
        vitaminC: 0,
        zinc: 0,
        b12: 0,
        biotin: 0,
        omega3: 0,
      },

      setDailyTotals: (totals) => set({ dailyTotals: totals }),

      addToDaily: (macros) =>
        set((s) => ({
          dailyTotals: {
            protein: s.dailyTotals.protein + (macros.protein || 0),
            carbs: s.dailyTotals.carbs + (macros.carbs || 0),
            fat: s.dailyTotals.fat + (macros.fat || 0),
            calories: s.dailyTotals.calories + (macros.calories || 0),
            fiber: s.dailyTotals.fiber + (macros.fiber || 0),
          },
        })),

      saveDayToHistory: (entry) =>
        set((s) => {
          const history = [...s.weeklyHistory]
          const idx = history.findIndex((h) => h.date === entry.date)
          if (idx >= 0) history[idx] = entry
          else history.push(entry)
          // Keep last 30 days
          history.sort((a, b) => new Date(b.date) - new Date(a.date))
          return { weeklyHistory: history.slice(0, 30) }
        }),

      resetDaily: () =>
        set({
          dailyTotals: { protein: 0, carbs: 0, fat: 0, calories: 0, fiber: 0 },
          glowNutrients: { iron: 0, vitaminC: 0, zinc: 0, b12: 0, biotin: 0, omega3: 0 },
        }),
    }),
    { name: 'nutrifit-nutrition' }
  )
)
