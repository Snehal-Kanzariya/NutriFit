/**
 * trackerUtils.js
 * Shared helpers for the Meal Check-Off & Live Tracking System.
 */

/**
 * Parses a time string like "7:30 AM" into today's Date object.
 * Returns null if the string is invalid.
 */
export function parseSlotTime(timeStr) {
  if (!timeStr) return null
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!match) return null
  let [, h, m, period] = match
  h = parseInt(h, 10)
  m = parseInt(m, 10)
  if (period.toUpperCase() === 'PM' && h !== 12) h += 12
  if (period.toUpperCase() === 'AM' && h === 12) h = 0
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d
}

/**
 * Formats a Date object to "h:mm AM/PM" (12-hr clock).
 */
export function formatTime(date) {
  if (!date) return ''
  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(date).replace('am', 'AM').replace('pm', 'PM')
}

/**
 * Derives the current tracking state for a meal slot.
 *
 * States:
 *   'upcoming'  – meal time is in the future, no prep alert yet
 *   'prep'      – cook meal whose prep should start now
 *   'eat-now'   – time >= meal time, not yet checked/skipped
 *   'done'      – user checked "Mark as Eaten"
 *   'skipped'   – user tapped Skip
 *
 * @param {object} slot          - plan slot ({ type, time, meal })
 * @param {object} checkedMeals  - store.checkedMeals
 * @param {object} trackerSkipped- store.trackerSkipped
 * @param {Date}   [now]         - override for testing
 */
export function getMealState(slot, checkedMeals, trackerSkipped, now = new Date()) {
  const { type, time, meal } = slot
  if (!meal) return 'upcoming'
  if (checkedMeals[type]) return 'done'
  if (trackerSkipped[type]) return 'skipped'

  const mealTime = parseSlotTime(time)
  if (!mealTime) return 'upcoming'

  // Already past meal time → eat-now
  if (now >= mealTime) return 'eat-now'

  // Prep alert: cook meals whose prep window has started
  const prepTime = meal.prepTime ?? 0
  const isCook = !meal.tags?.includes('quick') && prepTime > 5
  if (isCook) {
    const prepStart = new Date(mealTime.getTime() - prepTime * 60_000)
    if (now >= prepStart) return 'prep'
  }

  return 'upcoming'
}

/**
 * Calculates protein velocity and projection from checked meals.
 * Returns null if fewer than 1 meal is checked.
 *
 * @param {object} checkedMeals  - store.checkedMeals
 * @param {object[]} slots       - plan slots (to get meal times)
 * @param {number} proteinTarget
 */
export function calcVelocity(checkedMeals, slots, proteinTarget) {
  const checked = Object.entries(checkedMeals)
  if (checked.length === 0) return null

  const now = new Date()

  // Earliest checked time
  const firstCheckedTs = Math.min(...checked.map(([, v]) => v.checkedAt))
  const hoursElapsed = Math.max(0.25, (now - firstCheckedTs) / 3_600_000)
  const proteinEaten = checked.reduce((s, [, v]) => s + v.protein, 0)
  const velocity = proteinEaten / hoursElapsed  // g/hr

  // Last unchecked upcoming meal time for projection
  const remainingSlots = slots.filter(
    (s) => !checkedMeals[s.type] && s.meal
  )
  const lastSlot = remainingSlots[remainingSlots.length - 1]
  const lastMealTime = lastSlot ? parseSlotTime(lastSlot.time) : null
  const remainingHours = lastMealTime
    ? Math.max(0, (lastMealTime - now) / 3_600_000)
    : 0

  const projected = Math.round(proteinEaten + velocity * remainingHours)
  const onTrack = projected >= proteinTarget

  return {
    velocity: Math.round(velocity * 10) / 10,
    proteinEaten,
    hoursElapsed: Math.round(hoursElapsed * 10) / 10,
    projected,
    onTrack,
    lastMealTime,
  }
}
