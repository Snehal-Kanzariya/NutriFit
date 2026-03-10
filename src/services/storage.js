/**
 * storage.js — Dexie.js (IndexedDB) persistence layer.
 *
 * Tables:
 *   profile       — singleton row (id=1) mirroring useProfileStore
 *   schedules     — schedule presets
 *   routines      — saved user routines
 *   mealHistory   — one row per date { date, plan, proteinTarget, proteinActual, calories }
 *   weeklyData    — pre-aggregated weekly summaries (optional cache)
 *
 * All functions are async and swallow errors gracefully so they never crash the app.
 */

import Dexie from 'dexie'

// ── DB instance ───────────────────────────────────────────────────────────────

const db = new Dexie('NutriFit')

db.version(1).stores({
  profile:     '++id',
  schedules:   '++id, presetKey',
  routines:    '++id, name',
  mealHistory: 'date',          // date = "YYYY-MM-DD" primary key
  weeklyData:  'weekStart',
})

export default db

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

/** Returns "YYYY-MM-DD" for a Date object or ISO string */
function toDateStr(d) {
  if (!d) return todayStr()
  return (d instanceof Date ? d : new Date(d)).toISOString().slice(0, 10)
}

/** Last N dates as "YYYY-MM-DD" strings, today first */
function lastNDates(n) {
  const dates = []
  for (let i = 0; i < n; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(toDateStr(d))
  }
  return dates
}

// ── Profile ───────────────────────────────────────────────────────────────────

/**
 * Persist the full profile store snapshot.
 * @param {object} profileData
 */
export async function saveProfile(profileData) {
  try {
    await db.profile.put({ ...profileData, id: 1 })
  } catch (e) {
    console.warn('[storage] saveProfile failed:', e)
  }
}

/**
 * Load the saved profile snapshot.
 * @returns {object|null}
 */
export async function loadProfile() {
  try {
    const row = await db.profile.get(1)
    return row ?? null
  } catch (e) {
    console.warn('[storage] loadProfile failed:', e)
    return null
  }
}

// ── Meal History ──────────────────────────────────────────────────────────────

/**
 * Save a day's plan and nutrition totals.
 *
 * @param {string}  date           "YYYY-MM-DD"
 * @param {object}  plan           full todayPlan object from useMealPlanStore
 * @param {number}  proteinTarget  daily target (g)
 * @param {number}  proteinActual  actual eaten (g)
 * @param {number}  [calories]     total kcal
 */
export async function saveDayPlan(date, plan, proteinTarget, proteinActual, calories = 0) {
  try {
    const dateKey = date ?? todayStr()
    await db.mealHistory.put({
      date:          dateKey,
      plan:          plan ?? null,
      proteinTarget: proteinTarget ?? 0,
      proteinActual: proteinActual ?? 0,
      calories:      calories ?? 0,
      savedAt:       Date.now(),
    })
  } catch (e) {
    console.warn('[storage] saveDayPlan failed:', e)
  }
}

/**
 * Load a single day's record.
 * @param {string} date "YYYY-MM-DD"
 * @returns {{ date, plan, proteinTarget, proteinActual, calories }|null}
 */
export async function loadDayPlan(date) {
  try {
    const row = await db.mealHistory.get(date ?? todayStr())
    return row ?? null
  } catch (e) {
    console.warn('[storage] loadDayPlan failed:', e)
    return null
  }
}

/**
 * Returns the last 7 days of history, sorted newest-first.
 * Missing days are returned as null-filled placeholders.
 *
 * @returns {Array<{ date, proteinTarget, proteinActual, calories, plan }|null>}
 */
export async function loadWeekHistory() {
  try {
    const dates = lastNDates(7)
    const rows  = await db.mealHistory
      .where('date')
      .anyOf(dates)
      .toArray()

    const byDate = Object.fromEntries(rows.map((r) => [r.date, r]))

    return dates.map((d) => byDate[d] ?? {
      date:          d,
      proteinTarget: 0,
      proteinActual: 0,
      calories:      0,
      plan:          null,
    })
  } catch (e) {
    console.warn('[storage] loadWeekHistory failed:', e)
    return lastNDates(7).map((d) => ({ date: d, proteinTarget: 0, proteinActual: 0, calories: 0, plan: null }))
  }
}

// ── Protein Streak ────────────────────────────────────────────────────────────

/**
 * Count consecutive days (ending today) where proteinActual >= proteinTarget × 0.9.
 * Tolerance: ±10% of target counts as "hit".
 *
 * @returns {number}
 */
export async function getProteinStreak() {
  try {
    // Load last 30 days
    const dates = lastNDates(30)
    const rows  = await db.mealHistory
      .where('date')
      .anyOf(dates)
      .toArray()

    const byDate = Object.fromEntries(rows.map((r) => [r.date, r]))

    let streak = 0
    for (const d of dates) {
      const row = byDate[d]
      if (!row || !row.proteinTarget) break
      const hit = row.proteinActual >= row.proteinTarget * 0.9
      if (hit) streak++
      else break
    }
    return streak
  } catch (e) {
    console.warn('[storage] getProteinStreak failed:', e)
    return 0
  }
}

// ── Routines ──────────────────────────────────────────────────────────────────

export async function saveRoutine(routine) {
  try {
    if (routine.id) {
      await db.routines.put(routine)
    } else {
      await db.routines.add({ ...routine, createdAt: Date.now() })
    }
  } catch (e) {
    console.warn('[storage] saveRoutine failed:', e)
  }
}

export async function deleteRoutine(id) {
  try {
    await db.routines.delete(id)
  } catch (e) {
    console.warn('[storage] deleteRoutine failed:', e)
  }
}

export async function loadRoutines() {
  try {
    return await db.routines.toArray()
  } catch (e) {
    console.warn('[storage] loadRoutines failed:', e)
    return []
  }
}

// ── Export / Reset ────────────────────────────────────────────────────────────

/**
 * Export all app data as a JSON blob.
 * @returns {string} JSON string
 */
export async function exportAllData() {
  try {
    const [profile, routines, mealHistory] = await Promise.all([
      db.profile.toArray(),
      db.routines.toArray(),
      db.mealHistory.toArray(),
    ])
    return JSON.stringify({ profile, routines, mealHistory, exportedAt: new Date().toISOString() }, null, 2)
  } catch (e) {
    console.warn('[storage] exportAllData failed:', e)
    return '{}'
  }
}

/**
 * Delete ALL IndexedDB data. Irreversible.
 */
export async function resetAllData() {
  try {
    await Promise.all([
      db.profile.clear(),
      db.schedules.clear(),
      db.routines.clear(),
      db.mealHistory.clear(),
      db.weeklyData.clear(),
    ])
  } catch (e) {
    console.warn('[storage] resetAllData failed:', e)
  }
}
