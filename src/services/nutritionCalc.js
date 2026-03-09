/**
 * nutritionCalc.js
 * Pure nutrition calculation functions — BMR, TDEE, protein targets, macros.
 * All formulas follow SPEC.md exactly (Mifflin-St Jeor, per-goal multipliers).
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/** Activity level → TDEE multiplier */
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,   // desk job, no exercise
  light:     1.375, // light exercise 1–3 days/week
  moderate:  1.55,  // moderate exercise 3–5 days/week
  active:    1.725, // hard exercise 6–7 days/week
  intense:   1.9,   // very hard exercise / physical job
};

/** Fitness goal → protein g/kg of bodyweight (SPEC.md Key Formulas) */
const PROTEIN_MULTIPLIERS = {
  'muscle-gain': 2.2,
  'fat-loss':    2.4,
  maintain:      1.8,
  recomp:        2.0,
};

/** Goal → caloric adjustment relative to TDEE */
const CALORIE_ADJUSTMENTS = {
  'muscle-gain': +300,  // mild surplus
  'fat-loss':    -400,  // moderate deficit
  maintain:      0,
  recomp:        -100,  // slight deficit
};

/** Macro split ratios (% of goal calories) by goal */
const MACRO_SPLITS = {
  'muscle-gain': { protein: 0.30, carbs: 0.45, fat: 0.25 },
  'fat-loss':    { protein: 0.35, carbs: 0.35, fat: 0.30 },
  maintain:      { protein: 0.25, carbs: 0.50, fat: 0.25 },
  recomp:        { protein: 0.30, carbs: 0.40, fat: 0.30 },
};

// ─── Exported Functions ───────────────────────────────────────────────────────

/**
 * Calculates Basal Metabolic Rate using Mifflin-St Jeor equation.
 *
 * @param {number} weight - Body weight in kilograms
 * @param {number} height - Height in centimetres
 * @param {number} age    - Age in years
 * @param {'male'|'female'|'other'} gender
 * @returns {number} BMR in kcal/day (rounded to nearest integer)
 *
 * Formula (SPEC.md):
 *   Male:   (10 × weight) + (6.25 × height) − (5 × age) + 5
 *   Female: (10 × weight) + (6.25 × height) − (5 × age) − 161
 *   Other:  average of male and female values
 */
export function calcBMR(weight, height, age, gender) {
  const base = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'male')   return Math.round(base + 5);
  if (gender === 'female') return Math.round(base - 161);
  // 'other' → midpoint
  return Math.round(base - 78);
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE).
 *
 * @param {number} bmr - BMR from calcBMR()
 * @param {'sedentary'|'light'|'moderate'|'active'|'intense'} activityLevel
 * @returns {number} TDEE in kcal/day (rounded to nearest integer)
 */
export function calcTDEE(bmr, activityLevel) {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? ACTIVITY_MULTIPLIERS.moderate;
  return Math.round(bmr * multiplier);
}

/**
 * Calculates daily goal calories based on TDEE and fitness goal.
 *
 * @param {number} tdee - TDEE from calcTDEE()
 * @param {'muscle-gain'|'fat-loss'|'maintain'|'recomp'} goal
 * @returns {number} Target calories per day
 */
export function calcGoalCalories(tdee, goal) {
  const adjustment = CALORIE_ADJUSTMENTS[goal] ?? 0;
  return Math.max(1200, tdee + adjustment); // never below 1200 kcal floor
}

/**
 * Calculates recommended daily protein intake based on bodyweight and goal.
 *
 * @param {number} weight - Body weight in kilograms
 * @param {'muscle-gain'|'fat-loss'|'maintain'|'recomp'} goal
 * @returns {{ grams: number, gPerKg: number }} Protein target with multiplier
 *
 * Multipliers (SPEC.md):
 *   Muscle Gain: 2.2 g/kg | Fat Loss: 2.4 g/kg
 *   Maintain:    1.8 g/kg | Recomp:   2.0 g/kg
 */
export function calcRecommendedProtein(weight, goal) {
  const gPerKg = PROTEIN_MULTIPLIERS[goal] ?? PROTEIN_MULTIPLIERS.maintain;
  return {
    grams: Math.round(weight * gPerKg),
    gPerKg,
  };
}

/**
 * Calculates full macro targets (protein, carbs, fat) in grams.
 * Protein grams are pinned to the user's chosen proteinTarget;
 * remaining calories are split between carbs and fat per goal ratios.
 *
 * @param {number} weight        - Body weight in kg (used for calorie floor check)
 * @param {'muscle-gain'|'fat-loss'|'maintain'|'recomp'} goal
 * @param {number} proteinTarget - User's chosen protein target in grams
 * @param {number} goalCalories  - From calcGoalCalories()
 * @returns {{ protein: number, carbs: number, fat: number, calories: number }}
 */
export function calcMacroTargets(weight, goal, proteinTarget, goalCalories) {
  const proteinCals = proteinTarget * 4;
  const remaining   = Math.max(0, goalCalories - proteinCals);

  const split = MACRO_SPLITS[goal] ?? MACRO_SPLITS.maintain;
  // Distribute remaining calories between carbs and fat using relative ratio
  const carbRatio = split.carbs / (split.carbs + split.fat);
  const fatRatio  = split.fat  / (split.carbs + split.fat);

  const carbCals = remaining * carbRatio;
  const fatCals  = remaining * fatRatio;

  return {
    protein:  Math.round(proteinTarget),
    carbs:    Math.round(carbCals / 4),
    fat:      Math.round(fatCals  / 9),
    calories: goalCalories,
  };
}

/**
 * Convenience: runs the full calculation chain from raw profile data.
 *
 * @param {{ weight, height, age, gender, activityLevel, goal }} profile
 * @param {number} [overrideProtein] - If provided, uses this instead of recommended
 * @returns {{ bmr, tdee, goalCalories, recommendedProtein, macros }}
 */
export function calcFullProfile(profile, overrideProtein) {
  const { weight, height, age, gender, activityLevel, goal } = profile;

  const bmr              = calcBMR(weight, height, age, gender);
  const tdee             = calcTDEE(bmr, activityLevel);
  const goalCalories     = calcGoalCalories(tdee, goal);
  const recommendedProtein = calcRecommendedProtein(weight, goal);
  const proteinTarget    = overrideProtein ?? recommendedProtein.grams;
  const macros           = calcMacroTargets(weight, goal, proteinTarget, goalCalories);

  return { bmr, tdee, goalCalories, recommendedProtein, macros };
}

/**
 * Returns a human-readable protein tooltip string.
 * Used in Step 3 of onboarding.
 *
 * @param {number} weight
 * @param {'muscle-gain'|'fat-loss'|'maintain'|'recomp'} goal
 * @returns {string}
 */
export function getProteinTooltip(weight, goal) {
  const { grams, gPerKg } = calcRecommendedProtein(weight, goal);
  const goalLabel = {
    'muscle-gain': 'muscle gain',
    'fat-loss':    'fat loss',
    maintain:      'maintenance',
    recomp:        'body recomposition',
  }[goal] ?? goal;
  return `At ${weight}kg for ${goalLabel}, ${gPerKg}g/kg = ${grams}g protein is optimal`;
}
