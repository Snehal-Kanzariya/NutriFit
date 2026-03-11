/**
 * mealEngine.js
 * Protein-target-first meal selection engine — the brain of NutriFit.
 *
 * Algorithm (SPEC.md F0 — Protein-Aware Meal Selection):
 *   1. Filter by diet type → meal type → cooking ability
 *   2. Sort by |meal.protein − slotTarget| ascending (closest match first)
 *   3. Apply ±15% tolerance window
 *   4. From top 5 in-tolerance → pick random for variety
 *   5. If no match in range → pick absolute closest + flag warning
 */

import { generateMealSlots, getRemainingSlotTypes } from './scheduleEngine.js';
import {
  distributeProtein,
  redistributeOnSkip,
  getProteinMatchQuality,
  getProteinDeltaLabel,
  isWithinTolerance,
} from './proteinAllocator.js';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Maximum candidates to randomly pick from (SPEC.md: "top 5 matches") */
const TOP_N_CANDIDATES = 5;

/** ±15% tolerance for in-range matching */
const TOLERANCE = 0.15;

// ─── Internal Helpers ─────────────────────────────────────────────────────────

/**
 * Returns a deterministic-ish pseudo-random element from an array.
 * Using Math.random() so every app load yields variety; pass a seeded
 * RNG via the `rng` param for testing.
 *
 * @template T
 * @param {T[]} arr
 * @param {() => number} [rng=Math.random]
 * @returns {T|null}
 */
function pickRandom(arr, rng = Math.random) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(rng() * arr.length)];
}

/**
 * Checks whether a meal matches the user's cooking ability constraint.
 *
 * @param {{ tags: string[] }} meal
 * @param {boolean} canCook - true: all meals ok; false: only "quick" tagged meals
 * @returns {boolean}
 */
function matchesCookingAbility(meal, canCook) {
  if (canCook) return true;
  return meal.tags?.includes('quick') ?? false;
}

/**
 * Computes absolute protein distance from target.
 * @param {{ protein: number }} meal
 * @param {number} target
 * @returns {number}
 */
function proteinDistance(meal, target) {
  return Math.abs(meal.protein - target);
}

// ─── Primary Exports ──────────────────────────────────────────────────────────

/**
 * Selects the best meal for a slot using protein-target-first matching.
 *
 * @param {Object[]} mealDB         - Full meal array (one diet file loaded)
 * @param {string}   slotType       - e.g. 'breakfast', 'post-workout'
 * @param {number}   proteinTarget  - Protein target for this slot in grams
 * @param {string}   diet           - 'veg'|'nonveg'|'vegan'|'eggetarian'
 * @param {boolean}  canCook        - Whether user can cook (affects tag filter)
 * @param {Set<string>} usedMeals   - Set of meal IDs already used today (avoid repeats)
 * @param {() => number} [rng]      - Optional RNG for testing
 *
 * @returns {{
 *   meal:         Object,
 *   proteinMatch: 'exact'|'close'|'over'|'under',
 *   deltaLabel:   string,
 *   inTolerance:  boolean,
 *   fallback:     boolean,
 * }}
 */
export function selectMealByProtein(
  mealDB,
  slotType,
  proteinTarget,
  diet,
  canCook,
  usedMeals = new Set(),
  rng = Math.random
) {
  // ── Step 1: Multi-layer fallback pool — NEVER return null ─────────────────
  // Layer 1: strict — diet + type + cooking + unused
  let pool = mealDB.filter(
    m => m.diet === diet && m.type === slotType && matchesCookingAbility(m, canCook) && !usedMeals.has(m.id)
  );

  // Layer 2: lift cooking constraint (can happen when canCook=false and no quick meals exist)
  if (pool.length === 0) {
    pool = mealDB.filter(m => m.diet === diet && m.type === slotType && !usedMeals.has(m.id));
  }

  // Layer 3: allow already-used meals (all meals of this diet+type)
  if (pool.length === 0) {
    pool = mealDB.filter(m => m.diet === diet && m.type === slotType);
  }

  // Layer 4: any meal of this diet (different slot type is ok)
  if (pool.length === 0) {
    console.warn(`[mealEngine] No ${slotType} meals for diet=${diet} — using any ${diet} meal`);
    pool = mealDB.filter(m => m.diet === diet && !usedMeals.has(m.id));
    if (pool.length === 0) pool = mealDB.filter(m => m.diet === diet);
  }

  // Layer 5: absolute last resort — any meal in DB
  if (pool.length === 0) {
    console.warn(`[mealEngine] Absolute fallback for slot=${slotType} diet=${diet}`);
    pool = [...mealDB];
  }

  if (pool.length === 0) return null; // mealDB itself is empty — caller's problem

  // ── Step 2: Sort by protein distance ─────────────────────────────────────
  const sorted = [...pool].sort((a, b) => proteinDistance(a, proteinTarget) - proteinDistance(b, proteinTarget));

  // ── Step 3 & 4: Apply ±15% tolerance, take top 5 → pick random ───────────
  const inTolerance = sorted.filter(meal => isWithinTolerance(proteinTarget, meal.protein));
  const candidates  = inTolerance.slice(0, TOP_N_CANDIDATES);

  let selectedMeal;
  let fallback = false;

  if (candidates.length > 0) {
    selectedMeal = pickRandom(candidates, rng);
  } else {
    // ── Step 5: No match in range → pick closest + flag ─────────────────
    selectedMeal = sorted[0];
    fallback = true;
  }

  return {
    meal:         selectedMeal,
    proteinMatch: getProteinMatchQuality(proteinTarget, selectedMeal.protein),
    deltaLabel:   getProteinDeltaLabel(proteinTarget, selectedMeal.protein),
    inTolerance:  !fallback,
    fallback,
  };
}

/**
 * Generates a complete day meal plan hitting the user's protein target.
 *
 * @param {{
 *   weight: number, height: number, age: number, gender: string,
 *   activityLevel: string, goal: string, diet: string, canCook: boolean
 * }} profile
 * @param {{
 *   scheduleType?: string,
 *   breakfastTime?: string, lunchTime?: string, dinnerTime?: string, snackTime?: string
 * }} schedule
 * @param {number}   proteinTarget  - User's chosen daily protein goal
 * @param {string|null} workoutTime - "07:30" | null
 * @param {number}   workoutDuration
 * @param {string}   workoutType    - 'weights'|'cardio'|'rest'|…
 * @param {Object[]} mealDB         - The loaded meal array for user's diet
 * @param {() => number} [rng]
 *
 * @returns {{
 *   slots:      Array<SlotResult>,
 *   totalProtein: number,
 *   proteinTarget: number,
 *   hasWorkout: boolean,
 *   date:       string,
 * }}
 *
 * Where SlotResult = {
 *   type, time, label, proteinTarget, meal, proteinMatch, deltaLabel, fallback
 * }
 */
export function generateDayPlan(
  profile,
  schedule,
  proteinTarget,
  workoutTime,
  workoutDuration = 60,
  workoutType     = 'rest',
  mealDB          = [],
  rng             = Math.random
) {
  const hasWorkout = Boolean(workoutTime) && workoutType !== 'rest';

  // ── 1. Get ordered slot objects from schedule engine ──────────────────────
  const slots = generateMealSlots(schedule, workoutTime, workoutDuration, workoutType);
  const slotTypes = slots.map(s => s.type);

  // ── 2. Distribute protein across slots ────────────────────────────────────
  const proteinPerSlot = distributeProtein(proteinTarget, slotTypes, hasWorkout);

  // ── 3. Select best meal for each slot ─────────────────────────────────────
  const usedMeals = new Set();
  const slotResults = slots.map(slot => {
    const slotProteinTarget = proteinPerSlot[slot.type] ?? 0;
    const result = selectMealByProtein(
      mealDB,
      slot.type,
      slotProteinTarget,
      profile.diet,
      profile.canCook,
      usedMeals,
      rng
    );

    if (result?.meal) usedMeals.add(result.meal.id);

    return {
      type:          slot.type,
      time:          slot.time,
      label:         slot.label,
      proteinTarget: slotProteinTarget,
      meal:          result?.meal ?? null,
      proteinMatch:  result?.proteinMatch ?? 'under',
      deltaLabel:    result?.deltaLabel   ?? '–',
      fallback:      result?.fallback     ?? false,
    };
  });

  // ── 4. Sum actual protein from selected meals ─────────────────────────────
  const totalProtein = slotResults.reduce(
    (sum, s) => sum + (s.meal?.protein ?? 0),
    0
  );

  return {
    slots:         slotResults,
    totalProtein,
    proteinTarget,
    hasWorkout,
    date: new Date().toISOString().slice(0, 10),
  };
}

/**
 * Returns alternative meal options for a slot, sorted by protein-match closeness.
 * Used by the Swap sheet in MealCard.
 *
 * @param {Object[]} mealDB
 * @param {{ id: string, type: string, protein: number }} currentMeal
 * @param {number}   proteinTarget   - The slot's protein target
 * @param {string}   diet
 * @param {boolean}  canCook
 * @param {number}   [count=3]       - Number of alternatives to return
 *
 * @returns {Array<{
 *   meal: Object,
 *   proteinMatch: string,
 *   deltaLabel: string,
 *   inTolerance: boolean
 * }>}
 */
export function getSwapAlternatives(
  mealDB,
  currentMeal,
  proteinTarget,
  diet,
  canCook,
  count = 3
) {
  const candidates = mealDB.filter(
    meal =>
      meal.diet === diet &&
      meal.type === currentMeal.type &&
      meal.id   !== currentMeal.id &&
      matchesCookingAbility(meal, canCook)
  );

  // Sort by protein closeness to slot target
  const sorted = [...candidates].sort(
    (a, b) => proteinDistance(a, proteinTarget) - proteinDistance(b, proteinTarget)
  );

  return sorted.slice(0, count).map(meal => ({
    meal,
    proteinMatch: getProteinMatchQuality(proteinTarget, meal.protein),
    deltaLabel:   getProteinDeltaLabel(proteinTarget, meal.protein),
    inTolerance:  isWithinTolerance(proteinTarget, meal.protein),
  }));
}

/**
 * Calculates aggregate nutrition totals for all non-skipped meals in a plan.
 *
 * @param {Array<{ meal: Object|null, type: string }>} slots - Plan's slot array
 * @param {Set<string>} skippedTypes   - Set of slot types the user has skipped
 *
 * @returns {{
 *   protein: number, carbs: number, fat: number, fiber: number, calories: number,
 *   vitamins: Object, minerals: Object
 * }}
 */
export function calculateDayTotals(slots, skippedTypes = new Set()) {
  const totals = {
    protein:  0,
    carbs:    0,
    fat:      0,
    fiber:    0,
    calories: 0,
    vitamins: { C: 0, D: 0, B12: 0, A: 0, E: 0 },
    minerals: { iron: 0, zinc: 0, calcium: 0, magnesium: 0 },
  };

  for (const slot of slots) {
    if (skippedTypes.has(slot.type)) continue;
    const meal = slot.meal;
    if (!meal) continue;

    totals.protein  += meal.protein  ?? 0;
    totals.carbs    += meal.carbs    ?? 0;
    totals.fat      += meal.fat      ?? 0;
    totals.fiber    += meal.fiber    ?? 0;
    totals.calories += meal.cal      ?? 0;

    // Accumulate vitamins
    for (const [key, val] of Object.entries(meal.vitamins ?? {})) {
      totals.vitamins[key] = (totals.vitamins[key] ?? 0) + (val ?? 0);
    }

    // Accumulate minerals
    for (const [key, val] of Object.entries(meal.minerals ?? {})) {
      totals.minerals[key] = (totals.minerals[key] ?? 0) + (val ?? 0);
    }
  }

  // Round for clean display
  totals.protein  = Math.round(totals.protein);
  totals.carbs    = Math.round(totals.carbs);
  totals.fat      = Math.round(totals.fat);
  totals.fiber    = Math.round(totals.fiber);
  totals.calories = Math.round(totals.calories);

  for (const key in totals.vitamins) {
    totals.vitamins[key] = Math.round(totals.vitamins[key] * 10) / 10;
  }
  for (const key in totals.minerals) {
    totals.minerals[key] = Math.round(totals.minerals[key] * 10) / 10;
  }

  return totals;
}

/**
 * Calculates end-of-day protein shortfall and suggests protein boosters.
 *
 * @param {Array<{ meal: Object|null, type: string }>} slots
 * @param {Set<string>} skippedTypes
 * @param {number}      dailyTarget     - User's protein goal for the day
 * @param {Object[]}    [boosterDB=[]]  - Loaded protein-boosters.json array
 *
 * @returns {{
 *   eaten:     number,
 *   target:    number,
 *   shortfall: number,
 *   surplus:   number,
 *   onTrack:   boolean,
 *   boosters:  Array<{ id, name, protein, cal, description, coversShortfall: boolean }>
 * }}
 */
export function getProteinShortfall(slots, skippedTypes, dailyTarget, boosterDB = []) {
  const { protein: eaten } = calculateDayTotals(slots, skippedTypes);
  const shortfall = Math.max(0, dailyTarget - eaten);
  const surplus   = Math.max(0, eaten - dailyTarget);
  const onTrack   = shortfall === 0;

  // Pick boosters that together cover the shortfall (greedily sorted by protein desc)
  const sortedBoosters = [...boosterDB].sort((a, b) => b.protein - a.protein);

  // Suggest up to 3 boosters whose protein is ≤ shortfall or is the closest single fix
  const suggestions = shortfall > 0
    ? sortedBoosters
        .map(b => ({
          ...b,
          coversShortfall: b.protein >= shortfall,
        }))
        .filter(b => b.protein <= shortfall + 5) // within 5g of shortfall
        .slice(0, 3)
    : [];

  // If no exact matches, show top 3 smallest boosters
  const boosters = suggestions.length > 0
    ? suggestions
    : sortedBoosters.slice(-3).map(b => ({ ...b, coversShortfall: false }));

  return { eaten, target: dailyTarget, shortfall, surplus, onTrack, boosters };
}

/**
 * Applies a skip to the current plan:
 *  - Removes the skipped slot's protein from the distribution
 *  - Redistributes to remaining slots
 *  - Re-selects meals for slots that received a protein boost
 *
 * @param {Object}   plan           - Result of generateDayPlan()
 * @param {string}   skippedSlotType
 * @param {Object[]} mealDB
 * @param {string}   diet
 * @param {boolean}  canCook
 * @param {() => number} [rng]
 *
 * @returns {{
 *   updatedPlan: Object,
 *   boosts: Object.<string, number>,
 *   rebookedSlots: string[],
 * }}
 */
export function applySkip(plan, skippedSlotType, mealDB, diet, canCook, rng = Math.random) {
  const remainingSlots = getRemainingSlotTypes(plan.slots, skippedSlotType);

  // Current distribution (from plan's slot proteinTargets)
  const currentDist = {};
  for (const slot of plan.slots) {
    currentDist[slot.type] = slot.proteinTarget;
  }

  const { distribution: newDist, boosts } = redistributeOnSkip(
    currentDist,
    skippedSlotType,
    remainingSlots
  );

  // Re-select meals for slots that got a protein boost (their target changed)
  const usedMeals = new Set(
    plan.slots
      .filter(s => s.type !== skippedSlotType && !boosts[s.type])
      .map(s => s.meal?.id)
      .filter(Boolean)
  );

  const updatedSlots = plan.slots
    .filter(s => s.type !== skippedSlotType)
    .map(slot => {
      if (!boosts[slot.type]) return slot; // no change

      const newTarget = newDist[slot.type];
      const result = selectMealByProtein(
        mealDB, slot.type, newTarget, diet, canCook, usedMeals, rng
      );
      if (result?.meal) usedMeals.add(result.meal.id);

      return {
        ...slot,
        proteinTarget: newTarget,
        meal:          result?.meal     ?? slot.meal,
        proteinMatch:  result?.proteinMatch ?? slot.proteinMatch,
        deltaLabel:    result?.deltaLabel   ?? slot.deltaLabel,
        fallback:      result?.fallback     ?? slot.fallback,
      };
    });

  const totalProtein = updatedSlots.reduce((s, slot) => s + (slot.meal?.protein ?? 0), 0);

  const updatedPlan = {
    ...plan,
    slots: updatedSlots,
    totalProtein,
  };

  return {
    updatedPlan,
    boosts,
    rebookedSlots: Object.keys(boosts),
  };
}
