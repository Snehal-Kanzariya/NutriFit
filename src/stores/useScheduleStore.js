import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useScheduleStore = create(
  persist(
    (set) => ({
      // Schedule modes
      scheduleMode: 'standard', // 'standard' | 'custom'
      activePreset: null,       // 'student' | 'office' | 'wfh' | 'early_bird' | 'night_shift'

      // Routines
      routines: [],             // saved routine objects

      // Today's activity
      todayActivity: 'gym',     // 'gym' | 'yoga' | 'running' | 'sports' | 'home' | 'rest'
      todayWorkoutTime: '07:00',
      todayWorkoutDuration: 60,
      todayCanCook: true,
      todayCheckedIn: false,

      // Meal timing slots
      mealSlots: [
        { id: 'breakfast', label: 'Breakfast', time: '07:30' },
        { id: 'pre_workout', label: 'Pre-Workout', time: '06:30' },
        { id: 'post_workout', label: 'Post-Workout', time: '09:00' },
        { id: 'lunch', label: 'Lunch', time: '13:00' },
        { id: 'snack', label: 'Snack', time: '16:00' },
        { id: 'dinner', label: 'Dinner', time: '20:00' },
      ],

      setScheduleMode: (mode) => set({ scheduleMode: mode }),
      setActivePreset: (preset) => set({ activePreset: preset }),
      setTodayActivity: (data) => set(data),
      setCheckedIn: (val) => set({ todayCheckedIn: val }),
      setMealSlots: (slots) => set({ mealSlots: slots }),
      addRoutine: (routine) => set((s) => ({ routines: [...s.routines, routine] })),
    }),
    { name: 'nutrifit-schedule' }
  )
)
