/**
 * proteinAllocator.js
 * THE CORE ALGORITHM — distributes a daily protein target across meal slots,
 * handles skip-and-redistribute, and evaluates match quality.
 *
 * All percentages follow SPEC.md F0 exactly.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Slot weights when the user HAS a workout today.
 * Keys must match the slot `type` strings used in scheduleEngine.
 */
const WORKOUT_DAY_WEIGHTS = {
  'post-workout': 0.30, // 30% — recovery priority
  lunch:          0.25, // 25% — main meal
  breakfast:      0.20, // 20% — start the day
  dinner:         0.15, // 15% — lighter at night
  'pre-workout':  0.05, // 5%  — light fuel
  snack:          0.05, // 5%  — bridge gaps
};

/**
 * Slot weights on a rest day (no workout).
 */
const REST_DAY_WEIGHTS = {
  lunch:     0.35, // 35%
  breakfast: 0.25, // 25%
  dinner:    0.25, // 25%
  snack:     0.15, // 15%
};

/** ±15% tolerance window for "close enough" matching (SPEC.md) */
const MATCH_TOLERANCE = 0.15;

/**
 * Maximum per-meal protein achievable from the recipe database.
 * Prevents absurd slot targets (e.g. 60g) that no single meal can hit.
 */
export const SLOT_PROTEIN_CAPS = {
  breakfast:      30,
  lunch:          45,
  dinner:         38,
  snack:          20,
  'pre-workout':  15,
  'post-workout': 35,
};

/** Sum of all slot caps — the max protein achievable from food alone */
const MAX_FOOD_PROTEIN = Object.values(SLOT_PROTEIN_CAPS).reduce((s, v) => s + v, 0);

/** Inner ±5% window for "exact" match */
const EXACT_TOLERANCE = 0.05;

// ─── Exported Functions ───────────────────────────────────────────────────────

/**
 * Distributes a daily protein target across the active meal slots.
 *
 * Slots not present in the weights table (e.g. a second snack) receive
 * an equal share of whatever percentage remains after known slots are allocated.
 *
 * @param {number}   targetProtein  - Daily protein goal in grams (e.g. 60)
 * @param {string[]} mealSlots      - Ordered array of slot types present today
 *                                    e.g. ['breakfast','snack','lunch','post-workout','dinner']
 * @param {boolean}  hasWorkout     - true → workout-day weights, false → rest-day weights
 * @returns {Object.<string, number>} Map of slotType → protein grams (rounded)
 *
 * @example
 * distributeProtein(60, ['breakfast','lunch','dinner','snack'], false)
 * // → { breakfast: 15, lunch: 21, dinner: 15, snack: 9 }
 */
export function distributeProtein(targetProtein, mealSlots, hasWorkout) {
  const weights = hasWorkout ? WORKOUT_DAY_WEIGHTS : REST_DAY_WEIGHTS;

  // Build distribution for slots that appear in the weight table
  const distribution = {};
  let allocatedGrams = 0;
  let unmappedSlots  = [];

  for (const slot of mealSlots) {
    if (weights[slot] !== undefined) {
      const grams = targetProtein * weights[slot];
      distribution[slot] = grams;
      allocatedGrams += grams;
    } else {
      unmappedSlots.push(slot);
    }
  }

  // Spread any remainder evenly across unmapped slots
  if (unmappedSlots.length > 0) {
    const remaining = targetProtein - allocatedGrams;
    const perSlot   = remaining / unmappedSlots.length;
    for (const slot of unmappedSlots) {
      distribution[slot] = perSlot;
      allocatedGrams += perSlot;
    }
  }

  // If not all SPEC slots are present today, re-normalise so we still hit target.
  // E.g. user has no post-workout → redistribute its 30% to the remaining slots.
  const presentSlotWeightSum = mealSlots.reduce((sum, slot) => {
    return sum + (weights[slot] ?? 0);
  }, 0);

  if (presentSlotWeightSum > 0 && presentSlotWeightSum < 1) {
    const scaleFactor = 1 / presentSlotWeightSum;
    for (const slot of mealSlots) {
      if (weights[slot] !== undefined) {
        distribution[slot] = targetProtein * weights[slot] * scaleFactor;
      }
    }
  }

  // Round, then cap each slot to what the meal DB can actually provide
  const rounded = {};
  const slotKeys = Object.keys(distribution);

  for (const key of slotKeys) {
    const raw = Math.round(distribution[key]);
    const cap = SLOT_PROTEIN_CAPS[key] ?? 35;
    rounded[key] = Math.min(raw, cap);
  }

  return rounded;
}

/**
 * Returns how much protein is achievable from food alone given a set of active slots.
 * If target > achievable, the UI should suggest supplements.
 *
 * @param {number}   targetProtein
 * @param {string[]} mealSlots
 * @returns {{ achievable: number, needsSupplement: boolean, shortfall: number }}
 */
export function getAchievableProtein(targetProtein, mealSlots) {
  const achievable = mealSlots.reduce((sum, slot) => {
    return sum + (SLOT_PROTEIN_CAPS[slot] ?? 35);
  }, 0);
  const needsSupplement = targetProtein > achievable;
  return { achievable, needsSupplement, shortfall: Math.max(0, targetProtein - achievable) };
}

/**
 * Redistributes a skipped slot's protein to the remaining active slots,
 * weighted proportionally by their current allocations.
 *
 * @param {Object.<string, number>} currentDistribution - Current per-slot protein map
 * @param {string}   skippedSlot     - The slot the user just skipped
 * @param {string[]} remainingSlots  - Slot types that are still active (not skipped)
 * @returns {{ distribution: Object.<string, number>, boosts: Object.<string, number> }}
 *   - distribution: updated per-slot protein map (skipped slot removed)
 *   - boosts: how many grams each remaining slot gained
 *
 * @example
 * redistributeOnSkip({ breakfast: 15, lunch: 21, dinner: 15, snack: 9 }, 'lunch', ['breakfast','dinner','snack'])
 * // → {
 * //     distribution: { breakfast: 19, dinner: 19, snack: 12 },
 * //     boosts:       { breakfast: +4, dinner: +4, snack: +3 }
 * //   }
 */
export function redistributeOnSkip(currentDistribution, skippedSlot, remainingSlots) {
  const skippedGrams = currentDistribution[skippedSlot] ?? 0;

  if (remainingSlots.length === 0 || skippedGrams === 0) {
    // Nothing to redistribute
    const dist = { ...currentDistribution };
    delete dist[skippedSlot];
    return { distribution: dist, boosts: {} };
  }

  // Total protein in remaining slots (used as weights for proportional spread)
  const remainingTotal = remainingSlots.reduce((sum, slot) => {
    return sum + (currentDistribution[slot] ?? 0);
  }, 0);

  const newDistribution = {};
  const boosts          = {};
  let   allocated       = 0;

  for (let i = 0; i < remainingSlots.length - 1; i++) {
    const slot         = remainingSlots[i];
    const current      = currentDistribution[slot] ?? 0;
    const proportion   = remainingTotal > 0 ? current / remainingTotal : 1 / remainingSlots.length;
    const boost        = Math.round(skippedGrams * proportion);
    newDistribution[slot] = current + boost;
    boosts[slot]          = boost;
    allocated            += boost;
  }

  // Last slot absorbs rounding remainder
  const lastSlot = remainingSlots[remainingSlots.length - 1];
  const lastCurrent = currentDistribution[lastSlot] ?? 0;
  const lastBoost   = skippedGrams - allocated;
  newDistribution[lastSlot] = lastCurrent + lastBoost;
  boosts[lastSlot]          = lastBoost;

  return { distribution: newDistribution, boosts };
}

/**
 * Evaluates how well a meal's actual protein matches the slot's target.
 *
 * @param {number} target - Protein target for the slot in grams
 * @param {number} actual - Meal's actual protein content in grams
 * @returns {'exact'|'close'|'over'|'under'} Match quality label
 *
 * Thresholds (SPEC.md ±15% tolerance):
 *   exact : |actual − target| / target ≤ 5%
 *   close : |actual − target| / target ≤ 15%
 *   over  : actual > target × 1.15
 *   under : actual < target × 0.85
 */
export function getProteinMatchQuality(target, actual) {
  if (target <= 0) return 'exact'; // edge-case guard

  const ratio = Math.abs(actual - target) / target;

  if (ratio <= EXACT_TOLERANCE)  return 'exact';
  if (ratio <= MATCH_TOLERANCE)  return 'close';
  if (actual > target)           return 'over';
  return 'under';
}

/**
 * Returns the ±grams deviation string shown in the UI when no in-range meal
 * is found (e.g. "+5g" or "−3g").
 *
 * @param {number} target
 * @param {number} actual
 * @returns {string}  e.g. "+5g" | "−3g" | "exact"
 */
export function getProteinDeltaLabel(target, actual) {
  const delta = actual - target;
  if (delta === 0) return 'exact';
  return delta > 0 ? `+${delta}g` : `${delta}g`;
}

/**
 * Checks whether a meal's protein falls within the ±15% tolerance window.
 *
 * @param {number} target
 * @param {number} actual
 * @returns {boolean}
 */
export function isWithinTolerance(target, actual) {
  if (target <= 0) return true;
  return Math.abs(actual - target) / target <= MATCH_TOLERANCE;
}

/**
 * Returns a preview of the protein split — useful for the onboarding
 * summary screen (Step 5) before a schedule is finalised.
 *
 * @param {number}  targetProtein
 * @param {boolean} hasWorkout
 * @returns {Array<{ slot: string, grams: number, percent: number }>}
 */
export function getProteinPreview(targetProtein, hasWorkout) {
  const weights = hasWorkout ? WORKOUT_DAY_WEIGHTS : REST_DAY_WEIGHTS;
  return Object.entries(weights).map(([slot, pct]) => ({
    slot,
    grams:   Math.round(targetProtein * pct),
    percent: Math.round(pct * 100),
  }));
}
