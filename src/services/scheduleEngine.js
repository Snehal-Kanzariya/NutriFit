/**
 * scheduleEngine.js
 * Generates an ordered list of meal slots for a given day based on the user's
 * life schedule, workout time, and workout type.
 *
 * Output slots drive both proteinAllocator (what % each gets) and mealEngine
 * (which meal type to look up in the DB).
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Preset schedule templates — meal times keyed by schedule type.
 * All times are stored as 24-hour integers for easy arithmetic,
 * then formatted to 12-hour AM/PM for display.
 */
const SCHEDULE_PRESETS = {
  student: {
    breakfast:  8,
    lunch:     13,
    snack:     17,
    dinner:    20,
  },
  office: {
    breakfast:  8,
    lunch:     13,
    snack:     16,
    dinner:    21,
  },
  wfh: {
    breakfast:  9,
    lunch:     13,
    snack:     16,
    dinner:    20,
  },
  'early-bird': {
    breakfast:  6,
    lunch:     12,
    snack:     15,
    dinner:    19,
  },
  'night-shift': {
    breakfast: 18, // their "morning"
    lunch:     23,
    snack:      2, // next-day 2 AM
    dinner:     8, // next-day 8 AM
  },
};

/** Minimum gap (minutes) between any two slots to avoid overlap */
const MIN_GAP_MINUTES = 60;

/** Gap (minutes) before a workout for the pre-workout slot */
const PRE_WORKOUT_GAP_BEFORE = 60; // 60 min before workout

/** Gap (minutes) after a workout for the post-workout slot */
const POST_WORKOUT_GAP_AFTER = 30; // 30 min after workout ends

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Converts a 24-hour integer (e.g. 13) to "1:00 PM" format.
 *
 * @param {number} hour24 - Hour in 24-hour format (0–23)
 * @param {number} [minutes=0]
 * @returns {string}  e.g. "1:00 PM", "12:30 PM", "8:00 AM"
 */
export function formatTime(hour24, minutes = 0) {
  const h    = ((hour24 % 24) + 24) % 24; // normalise negative/overflow
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const mm   = String(minutes).padStart(2, '0');
  return `${h12}:${mm} ${ampm}`;
}

/**
 * Parses a time string "HH:MM" (24-hr) or "H:MM AM/PM" into
 * { hour: number (0–23), minutes: number }.
 *
 * @param {string} timeStr
 * @returns {{ hour: number, minutes: number }}
 */
export function parseTime(timeStr) {
  if (!timeStr) return { hour: 8, minutes: 0 };

  // "HH:MM" 24-hour
  const match24 = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    return { hour: parseInt(match24[1], 10), minutes: parseInt(match24[2], 10) };
  }

  // "H:MM AM/PM"
  const match12 = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hour = parseInt(match12[1], 10);
    const min = parseInt(match12[2], 10);
    const period = match12[3].toUpperCase();
    if (period === 'AM' && hour === 12) hour = 0;
    if (period === 'PM' && hour !== 12) hour += 12;
    return { hour, minutes: min };
  }

  return { hour: 8, minutes: 0 };
}

/**
 * Converts hour + minutes to total minutes since midnight.
 * @param {number} hour
 * @param {number} minutes
 * @returns {number}
 */
function toMinutes(hour, minutes = 0) {
  return ((hour % 24) + 24) % 24 * 60 + minutes;
}

/**
 * Checks whether two time points are at least MIN_GAP_MINUTES apart.
 * @param {number} minsA
 * @param {number} minsB
 * @returns {boolean}
 */
function hasGap(minsA, minsB) {
  return Math.abs(minsA - minsB) >= MIN_GAP_MINUTES;
}

// ─── Core Builder ─────────────────────────────────────────────────────────────

/**
 * Generates an ordered array of meal slot objects for the day.
 *
 * Each slot:
 * ```
 * {
 *   type:        'breakfast'|'lunch'|'dinner'|'snack'|'pre-workout'|'post-workout',
 *   time:        '7:30 AM',   // display string
 *   hour:        7,            // 24-hr for sorting
 *   minutes:     30,
 *   label:       'Breakfast', // UI label
 * }
 * ```
 *
 * Rules:
 *  - On a rest day (workoutType === 'rest' or no workoutTime) → no pre/post slots
 *  - Pre-workout slot: 60 min before workout, but only if ≥ 60 min after breakfast
 *  - Post-workout slot: 30 min after workout ends
 *  - Any slot that conflicts (< MIN_GAP_MINUTES) with an adjacent slot is dropped
 *  - Result is sorted chronologically
 *
 * @param {{ scheduleType?: string, breakfastTime?: string, lunchTime?: string, dinnerTime?: string, snackTime?: string }} schedule
 * @param {string|null}  workoutTime     - "07:00" | "18:30" | null
 * @param {number}       workoutDuration - Duration in minutes (default 60)
 * @param {string}       workoutType     - 'weights'|'cardio'|'yoga'|'sports'|'home'|'rest'
 * @returns {Array<{ type: string, time: string, hour: number, minutes: number, label: string }>}
 */
export function generateMealSlots(
  schedule = {},
  workoutTime = null,
  workoutDuration = 60,
  workoutType = 'rest'
) {
  const isRestDay = !workoutTime || workoutType === 'rest';

  // ── 1. Base meal times from preset or custom overrides ───────────────────
  const preset = SCHEDULE_PRESETS[schedule.scheduleType] ?? SCHEDULE_PRESETS.wfh;

  const baseTimes = {
    breakfast: parseTime(schedule.breakfastTime ?? `${preset.breakfast}:00`),
    lunch:     parseTime(schedule.lunchTime     ?? `${preset.lunch}:00`),
    snack:     parseTime(schedule.snackTime     ?? `${preset.snack}:00`),
    dinner:    parseTime(schedule.dinnerTime    ?? `${preset.dinner}:00`),
  };

  const slots = [];

  // ── 2. Breakfast ─────────────────────────────────────────────────────────
  slots.push({
    type:    'breakfast',
    label:   'Breakfast',
    hour:    baseTimes.breakfast.hour,
    minutes: baseTimes.breakfast.minutes,
  });

  // ── 3. Workout-dependent slots ────────────────────────────────────────────
  if (!isRestDay && workoutTime) {
    const wo = parseTime(workoutTime);
    const woStartMins  = toMinutes(wo.hour, wo.minutes);
    const woEndMins    = woStartMins + workoutDuration;
    const preMins      = woStartMins - PRE_WORKOUT_GAP_BEFORE;
    const postMins     = woEndMins   + POST_WORKOUT_GAP_AFTER;

    const bfMins       = toMinutes(baseTimes.breakfast.hour, baseTimes.breakfast.minutes);
    const lunchMins    = toMinutes(baseTimes.lunch.hour,     baseTimes.lunch.minutes);
    const snackMins    = toMinutes(baseTimes.snack.hour,     baseTimes.snack.minutes);
    const dinnerMins   = toMinutes(baseTimes.dinner.hour,    baseTimes.dinner.minutes);

    // Pre-workout: only if at least MIN_GAP after breakfast and before lunch
    if (preMins > bfMins + MIN_GAP_MINUTES && preMins < lunchMins - MIN_GAP_MINUTES) {
      const preHour = Math.floor(((preMins % 1440) + 1440) % 1440 / 60);
      const preMinsRem = preMins % 60;
      slots.push({
        type:    'pre-workout',
        label:   'Pre-Workout',
        hour:    preHour,
        minutes: Math.max(0, preMinsRem),
      });
    }

    // Post-workout: placed after workout ends
    const postHour    = Math.floor(((postMins % 1440) + 1440) % 1440 / 60);
    const postMinsRem = postMins % 60;
    slots.push({
      type:    'post-workout',
      label:   'Post-Workout',
      hour:    postHour,
      minutes: Math.max(0, postMinsRem),
    });
  }

  // ── 4. Lunch ─────────────────────────────────────────────────────────────
  slots.push({
    type:    'lunch',
    label:   'Lunch',
    hour:    baseTimes.lunch.hour,
    minutes: baseTimes.lunch.minutes,
  });

  // ── 5. Snack ─────────────────────────────────────────────────────────────
  slots.push({
    type:    'snack',
    label:   'Snack',
    hour:    baseTimes.snack.hour,
    minutes: baseTimes.snack.minutes,
  });

  // ── 6. Dinner ────────────────────────────────────────────────────────────
  slots.push({
    type:    'dinner',
    label:   'Dinner',
    hour:    baseTimes.dinner.hour,
    minutes: baseTimes.dinner.minutes,
  });

  // ── 7. Sort chronologically ───────────────────────────────────────────────
  slots.sort((a, b) => toMinutes(a.hour, a.minutes) - toMinutes(b.hour, b.minutes));

  // ── 8. Drop slots that are too close together (dedup on type first) ───────
  const seen = new Set();
  const deduped = slots.filter(slot => {
    if (seen.has(slot.type)) return false;
    seen.add(slot.type);
    return true;
  });

  // Conflict check: if adjacent slots are < MIN_GAP_MINUTES apart,
  // the lower-priority one (snack, pre-workout) is removed.
  const LOW_PRIORITY = new Set(['snack', 'pre-workout']);
  const final = [];

  for (const slot of deduped) {
    const lastSlot = final[final.length - 1];
    if (lastSlot) {
      const gap = toMinutes(slot.hour, slot.minutes) - toMinutes(lastSlot.hour, lastSlot.minutes);
      if (gap < MIN_GAP_MINUTES) {
        if (LOW_PRIORITY.has(slot.type)) continue;     // drop incoming low-priority
        if (LOW_PRIORITY.has(lastSlot.type)) final.pop(); // drop previous low-priority
      }
    }
    final.push(slot);
  }

  // ── 9. Attach formatted time string ──────────────────────────────────────
  return final.map(slot => ({
    ...slot,
    time: formatTime(slot.hour, slot.minutes),
  }));
}

/**
 * Returns just the ordered list of slot type strings (used by proteinAllocator).
 *
 * @param {Parameters<typeof generateMealSlots>} args
 * @returns {string[]}  e.g. ['breakfast','pre-workout','lunch','post-workout','snack','dinner']
 */
export function getSlotTypes(...args) {
  return generateMealSlots(...args).map(s => s.type);
}

/**
 * Given an existing slot array and a skipped slot type,
 * returns the remaining slot types in order.
 *
 * @param {Array<{ type: string }>} slots
 * @param {string} skippedType
 * @returns {string[]}
 */
export function getRemainingSlotTypes(slots, skippedType) {
  return slots
    .filter(s => s.type !== skippedType)
    .map(s => s.type);
}
