/**
 * GlowNutrients.jsx
 * 2-column grid of 6 glow nutrient cards derived from the day's meal plan.
 *
 * Iron, Zinc, Vit C, B12 come from summed meal.vitamins / meal.minerals.
 * Biotin and Omega-3 are estimated from meal.glowNutrients tags
 * (each tagged meal contributes a fixed per-meal estimate).
 */
import { motion } from 'framer-motion'

// ── RDA + display config ──────────────────────────────────────────────────────

const GLOW_CONFIG = [
  {
    key:     'iron',
    label:   'Iron',
    emoji:   '🩸',
    benefit: 'Energy & Hair',
    rda:     18,
    unit:    'mg',
    color:   { bar: 'bg-red-500',    text: 'text-red-400',    bg: 'bg-red-950/40',    border: 'border-red-900/50'    },
    /** @param {{ minerals: object }} totals */
    getValue: (totals)         => totals.minerals?.iron  ?? 0,
  },
  {
    key:     'vitaminC',
    label:   'Vitamin C',
    emoji:   '🍊',
    benefit: 'Skin Glow',
    rda:     90,
    unit:    'mg',
    color:   { bar: 'bg-orange-500', text: 'text-orange-400', bg: 'bg-orange-950/40', border: 'border-orange-900/50' },
    getValue: (totals)         => totals.vitamins?.C     ?? 0,
  },
  {
    key:     'zinc',
    label:   'Zinc',
    emoji:   '💎',
    benefit: 'Immunity & Skin',
    rda:     11,
    unit:    'mg',
    color:   { bar: 'bg-blue-500',   text: 'text-blue-400',   bg: 'bg-blue-950/40',   border: 'border-blue-900/50'   },
    getValue: (totals)         => totals.minerals?.zinc  ?? 0,
  },
  {
    key:     'b12',
    label:   'Vitamin B12',
    emoji:   '🧬',
    benefit: 'Energy',
    rda:     2.4,
    unit:    'μg',
    color:   { bar: 'bg-purple-500', text: 'text-purple-400', bg: 'bg-purple-950/40', border: 'border-purple-900/50' },
    getValue: (totals)         => totals.vitamins?.B12   ?? 0,
  },
  {
    key:     'biotin',
    label:   'Biotin',
    emoji:   '💅',
    benefit: 'Hair & Nails',
    rda:     30,
    unit:    'μg',
    // ~8 μg per meal that flags biotin in glowNutrients
    getValue: (_totals, slots) => estimateFromTags(slots, 'biotin', 8),
    color:   { bar: 'bg-pink-500',   text: 'text-pink-400',   bg: 'bg-pink-950/40',   border: 'border-pink-900/50'   },
  },
  {
    key:     'omega3',
    label:   'Omega-3',
    emoji:   '🐟',
    benefit: 'Skin & Brain',
    rda:     1600,
    unit:    'mg',
    // ~500 mg per meal that flags omega3 in glowNutrients
    getValue: (_totals, slots) => estimateFromTags(slots, 'omega3', 500),
    color:   { bar: 'bg-cyan-500',   text: 'text-cyan-400',   bg: 'bg-cyan-950/40',   border: 'border-cyan-900/50'   },
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Estimates a nutrient from the meal.glowNutrients tag array.
 * Returns perMeal × (number of non-skipped meals containing that tag).
 *
 * @param {Array}  slots    - Non-skipped slot objects (must have .meal)
 * @param {string} tag      - e.g. 'biotin' | 'omega3'
 * @param {number} perMeal  - Contribution per tagged meal
 */
function estimateFromTags(slots, tag, perMeal) {
  if (!slots?.length) return 0
  return slots.reduce((sum, slot) => {
    const tags = slot.meal?.glowNutrients ?? []
    return sum + (tags.includes(tag) ? perMeal : 0)
  }, 0)
}

/** Round to 1 decimal for display. */
function round1(v) {
  return Math.round(v * 10) / 10
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * @param {{
 *   totals: { vitamins: object, minerals: object },
 *   slots:  Array<{ type: string, meal: object|null }>,
 * }} props
 *   slots should be the NON-SKIPPED slots (already filtered by caller)
 */
export default function GlowNutrients({ totals = {}, slots = [] }) {
  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Glow Nutrients
        </h3>
        <span className="text-[10px] text-gray-600">% of daily RDA</span>
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {GLOW_CONFIG.map((nutrient, i) => {
          const raw   = nutrient.getValue(totals, slots)
          const value = round1(raw)
          const pct   = nutrient.rda > 0 ? Math.min(1, raw / nutrient.rda) : 0
          const pctNum = Math.round(pct * 100)
          const { color } = nutrient
          const hit = pct >= 1

          return (
            <motion.div
              key={nutrient.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`${color.bg} border ${color.border} rounded-2xl p-3 space-y-2`}
            >
              {/* Top row: emoji + name + pct */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-base leading-none shrink-0">{nutrient.emoji}</span>
                  <span className={`text-xs font-bold truncate ${color.text}`}>
                    {nutrient.label}
                  </span>
                </div>
                <span className={`text-[10px] font-bold shrink-0 ml-1 ${hit ? 'text-emerald-400' : color.text}`}>
                  {pctNum}%
                </span>
              </div>

              {/* Benefit */}
              <p className="text-[10px] text-gray-500 leading-tight">{nutrient.benefit}</p>

              {/* Progress bar */}
              <div className="h-1.5 bg-gray-800/80 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${hit ? 'bg-emerald-500' : color.bar}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pctNum}%` }}
                  transition={{ duration: 0.8, delay: i * 0.06 + 0.2, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>

              {/* Value / RDA */}
              <div className="flex items-baseline justify-between">
                <span className={`text-sm font-black ${hit ? 'text-emerald-400' : color.text}`}>
                  {value}
                  <span className="text-[10px] font-medium ml-0.5">{nutrient.unit}</span>
                </span>
                <span className="text-[10px] text-gray-600">
                  / {nutrient.rda}{nutrient.unit}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
