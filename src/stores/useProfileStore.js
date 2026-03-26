import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useProfileStore = create(
  persist(
    (set, get) => ({
      // Onboarding flag
      isOnboarded: false,

      // Step 1 — About You
      name: '',
      age: '',
      gender: 'male',
      weight: '',   // kg
      height: '',   // cm

      // Step 2 — Goal & Diet
      goal: '',           // 'muscle_gain' | 'fat_loss' | 'maintain' | 'recomp'
      diet: '',           // 'nonveg' | 'veg' | 'vegan' | 'eggetarian'
      activityLevel: '',  // 'sedentary' | 'light' | 'moderate' | 'active' | 'intense'

      // Step 3 — Protein Target (HERO)
      proteinTarget: 80,          // user-chosen daily protein (g)
      recommendedProtein: 80,     // calculated from weight × goal multiplier
      proteinPreset: 'moderate',  // 'light' | 'moderate' | 'high' | 'max'

      // Step 4 — Life Schedule
      schedulePreset: '',   // 'student' | 'office' | 'wfh' | 'early_bird' | 'night_shift'
      wakeTime: '07:00',
      sleepTime: '23:00',
      workoutTime: '07:00',
      workoutDuration: 60,  // minutes
      workoutType: 'gym',
      canCook: true,
      budget: '',           // ₹/day, optional

      // Computed values (cached)
      bmr: null,
      tdee: null,
      goalCalories: null,

      // Trainer mode
      trainerMode: false,

      // Actions
      setProfile: (data) => set(data),
      setTrainerMode: (val) => set({ trainerMode: val }),

      setProteinTarget: (val) => set({ proteinTarget: val }),

      setOnboarded: () => set({ isOnboarded: true }),

      computeNutrition: () => {
        const { weight, height, age, gender, activityLevel, goal } = get()
        const w = parseFloat(weight)
        const h = parseFloat(height)
        const a = parseFloat(age)
        if (!w || !h || !a) return

        // Mifflin-St Jeor BMR
        const bmr = gender === 'male'
          ? (10 * w) + (6.25 * h) - (5 * a) + 5
          : (10 * w) + (6.25 * h) - (5 * a) - 161

        const activityMultipliers = {
          sedentary: 1.2,
          light: 1.375,
          moderate: 1.55,
          active: 1.725,
          intense: 1.9,
        }
        const tdee = bmr * (activityMultipliers[activityLevel] || 1.55)

        const goalAdjustments = {
          muscle_gain: 300,
          fat_loss: -500,
          maintain: 0,
          recomp: -200,
        }
        const goalCalories = tdee + (goalAdjustments[goal] || 0)

        // Recommended protein
        const multipliers = {
          muscle_gain: 2.2,
          fat_loss: 2.4,
          maintain: 1.8,
          recomp: 2.0,
        }
        const recommendedProtein = Math.round(w * (multipliers[goal] || 2.0))

        set({
          bmr: Math.round(bmr),
          tdee: Math.round(tdee),
          goalCalories: Math.round(goalCalories),
          recommendedProtein,
        })
      },

      reset: () => set({
        isOnboarded: false,
        name: '', age: '', gender: 'male', weight: '', height: '',
        goal: '', diet: '', activityLevel: '',
        proteinTarget: 80, recommendedProtein: 80, proteinPreset: 'moderate',
        schedulePreset: '', wakeTime: '07:00', sleepTime: '23:00',
        workoutTime: '07:00', workoutDuration: 60, workoutType: 'gym',
        canCook: true, budget: '',
        bmr: null, tdee: null, goalCalories: null,
      }),
    }),
    { name: 'nutrifit-profile' }
  )
)
