/**
 * MealCard.jsx
 * CRITICAL COMPONENT — displays a single meal slot with protein bar,
 * match quality badge, macros, tags, and swap/skip actions.
 * Tapping expands to show ingredients and protein sources.
 */
import { useState }  from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, RefreshCw, X } from 'lucide-react'
import MealSwapSheet from './MealSwapSheet'

// ── Slot type colors ─────────────────────────────────────────────────────────
const SLOT_STYLE = {
  breakfast:      { label: 'text-orange-400',  dot: 'bg-orange-400',  line: 'bg-orange-900/40'  },
  lunch:          { label: 'text-sky-400',      dot: 'bg-sky-400',     line: 'bg-sky-900/40'     },
  dinner:         { label: 'text-indigo-400',   dot: 'bg-indigo-400',  line: 'bg-indigo-900/40'  },
  snack:          { label: 'text-pink-400',     dot: 'bg-pink-400',    line: 'bg-pink-900/40'    },
  'pre-workout':  { label: 'text-yellow-400',   dot: 'bg-yellow-400',  line: 'bg-yellow-900/40'  },
  'post-workout': { label: 'text-emerald-400',  dot: 'bg-emerald-400', line: 'bg-emerald-900/40' },
}

// ── Protein match badge ───────────────────────────────────────────────────────
const MATCH_BADGE = {
  exact: { icon: '✅', label: 'Exact match',   cls: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' },
  close: { icon: '≈',  label: 'Close',          cls: 'text-violet-400  bg-violet-950/60  border-violet-800'  },
  over:  { icon: '⚠️', label: 'Over target',   cls: 'text-amber-400   bg-amber-950/60   border-amber-800'   },
  under: { icon: '⚠️', label: 'Under target',  cls: 'text-red-400     bg-red-950/60     border-red-800'     },
}

// ── Glow nutrient labels ──────────────────────────────────────────────────────
const GLOW_LABELS = {
  iron:     { label: 'Iron 🩸',      cls: 'text-red-300    bg-red-950/50'    },
  zinc:     { label: 'Zinc 💎',      cls: 'text-blue-300   bg-blue-950/50'   },
  calcium:  { label: 'Calcium 🦴',   cls: 'text-gray-300   bg-gray-800'      },
  vitaminC: { label: 'Vit C 🍊',     cls: 'text-orange-300 bg-orange-950/50' },
  omega3:   { label: 'Omega-3 🐟',   cls: 'text-cyan-300   bg-cyan-950/50'   },
  b12:      { label: 'B12 🧬',       cls: 'text-purple-300 bg-purple-950/50' },
  biotin:   { label: 'Biotin 💅',    cls: 'text-pink-300   bg-pink-950/50'   },
}

/**
 * @param {{
 *   slot:        { type, time, label, proteinTarget, meal, proteinMatch, deltaLabel, fallback },
 *   dailyTarget: number,
 *   diet:        string,
 *   canCook:     boolean,
 *   onSkip:      (slotType: string) => void,
 *   onSwap:      (slotType: string, mealResult: object) => void,
 * }} props
 */
export default function MealCard({ slot, dailyTarget = 80, diet, canCook, onSkip, onSwap }) {
  const [expanded,  setExpanded]  = useState(false)
  const [swapOpen,  setSwapOpen]  = useState(false)
  const [skipping,  setSkipping]  = useState(false)

  if (!slot) return null
  const { type, time, label, proteinTarget, meal, proteinMatch, deltaLabel, fallback } = slot

  const style    = SLOT_STYLE[type]   ?? SLOT_STYLE.snack
  const badge    = MATCH_BADGE[proteinMatch] ?? MATCH_BADGE.close
  const isQuick  = meal?.tags?.includes('quick')
  const protein  = meal?.protein ?? 0

  // Protein bar width: meal.protein as % of daily target (capped at 100%)
  const barPct   = dailyTarget > 0 ? Math.min(100, Math.round((protein / dailyTarget) * 100)) : 0
  const pctOfDay = barPct

  async function handleSkip() {
    setSkipping(true)
    onSkip(type)
    setSkipping(false)
  }

  // Empty / no-meal fallback
  if (!meal) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-4 opacity-60">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${style.label}`}>{label}</span>
          <span className="text-gray-600 text-xs">· {time}</span>
        </div>
        <p className="text-gray-600 text-sm mt-1 italic">No meal found for this slot.</p>
      </div>
    )
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden"
      >
        {/* Top color accent line */}
        <div className={`h-0.5 w-full ${style.line}`} />

        <div className="px-4 pt-3.5 pb-3">
          {/* ── Row 1: Time + Label + match badge ─────────────────────────── */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${style.label}`}>{label}</span>
            <span className="text-gray-600 text-xs">· {time}</span>
            {fallback && (
              <span className="ml-auto text-[10px] text-amber-500 font-medium">
                {deltaLabel} fallback
              </span>
            )}
          </div>

          {/* ── Row 2: Meal name ───────────────────────────────────────────── */}
          <p className="text-white font-bold text-base leading-snug mb-3">{meal.name}</p>

          {/* ── Protein bar ───────────────────────────────────────────────── */}
          <div className="space-y-1 mb-3">
            <div className="h-5 bg-gray-800 rounded-lg overflow-hidden relative">
              <motion.div
                className="h-full bg-violet-600 rounded-lg"
                initial={{ width: 0 }}
                animate={{ width: `${barPct}%` }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              />
              {/* Inline label */}
              <div className="absolute inset-0 flex items-center px-2 justify-between pointer-events-none">
                <span className="text-[11px] font-bold text-white drop-shadow">
                  {protein}g protein
                </span>
                <span className="text-[11px] text-gray-400">
                  {pctOfDay}% of {dailyTarget}g
                </span>
              </div>
            </div>

            {/* Match quality badge */}
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.cls}`}>
                {badge.icon} {badge.label}
                {proteinMatch !== 'exact' && deltaLabel !== 'exact' && ` (${deltaLabel})`}
              </span>
              <span className="text-[10px] text-gray-600">target: {proteinTarget}g</span>
            </div>
          </div>

          {/* ── Quick stats ───────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 text-[11px] text-gray-400 flex-wrap mb-3">
            <span className="text-emerald-400 font-medium">{meal.cal} cal</span>
            <span>C: {meal.carbs}g</span>
            <span>F: {meal.fat}g</span>
            <span>⏱ {meal.prepTime}m</span>
          </div>

          {/* ── Tags ─────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {isQuick ? (
              <Tag text="⚡ Quick" cls="text-emerald-400 bg-emerald-950/50 border-emerald-800" />
            ) : (
              <Tag text="🍳 Cook" cls="text-amber-400 bg-amber-950/50 border-amber-800" />
            )}
            {meal.tags?.includes('high-protein') && (
              <Tag text="💪 High Protein" cls="text-violet-400 bg-violet-950/50 border-violet-800" />
            )}
            {meal.costTier === 'budget' && (
              <Tag text="💰 Budget" cls="text-gray-400 bg-gray-800 border-gray-700" />
            )}
            {meal.proteinLevel === 'high' && !meal.tags?.includes('high-protein') && (
              <Tag text="💪 High Protein" cls="text-violet-400 bg-violet-950/50 border-violet-800" />
            )}
          </div>

          {/* ── Action row: Swap + Skip + Expand ─────────────────────────── */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSwapOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-xs font-semibold text-gray-300 transition-colors"
            >
              <RefreshCw size={12} />
              Swap
            </button>

            <button
              onClick={handleSkip}
              disabled={skipping}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-red-950/50 border border-gray-700 hover:border-red-800 rounded-xl text-xs font-semibold text-gray-500 hover:text-red-400 transition-colors"
            >
              <X size={12} />
              Skip
            </button>

            <button
              onClick={() => setExpanded((e) => !e)}
              className="ml-auto flex items-center gap-1 text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              {expanded ? (
                <><ChevronUp size={14} /> Less</>
              ) : (
                <><ChevronDown size={14} /> Details</>
              )}
            </button>
          </div>
        </div>

        {/* ── Expanded details ──────────────────────────────────────────────── */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              key="details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="border-t border-gray-800 px-4 py-3 space-y-3">
                {/* Ingredients */}
                {meal.ingredients?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Ingredients
                    </p>
                    <ul className="space-y-0.5">
                      {meal.ingredients.map((ing, i) => (
                        <li key={i} className="text-xs text-gray-400 flex items-start gap-1.5">
                          <span className="text-gray-700 mt-0.5">•</span>
                          <span
                            className={
                              meal.proteinSources?.some((src) =>
                                ing.toLowerCase().includes(src.toLowerCase())
                              )
                                ? 'text-violet-300 font-medium'
                                : ''
                            }
                          >
                            {ing}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {meal.proteinSources?.length > 0 && (
                      <p className="text-[10px] text-violet-500 mt-1.5">
                        💪 Protein sources highlighted in violet
                      </p>
                    )}
                  </div>
                )}

                {/* Glow nutrients */}
                {meal.glowNutrients?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Glow Nutrients ✨
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {meal.glowNutrients.map((n) => {
                        const g = GLOW_LABELS[n]
                        return g ? (
                          <span key={n} className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${g.cls}`}>
                            {g.label}
                          </span>
                        ) : (
                          <span key={n} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 capitalize">
                            {n}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Micro-macros */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-gray-500">
                  <span>Fiber: <strong className="text-gray-300">{meal.fiber}g</strong></span>
                  <span>Cuisine: <strong className="text-gray-300 capitalize">{meal.cuisine?.replace('-', ' ')}</strong></span>
                  {meal.vitamins?.C > 0 && <span>Vit C: <strong className="text-gray-300">{meal.vitamins.C}mg</strong></span>}
                  {meal.minerals?.iron > 0 && <span>Iron: <strong className="text-gray-300">{meal.minerals.iron}mg</strong></span>}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Swap sheet — portal-like, rendered outside the card layout */}
      <MealSwapSheet
        open={swapOpen}
        onClose={() => setSwapOpen(false)}
        slot={slot}
        currentMeal={meal}
        diet={diet}
        canCook={canCook}
        onSwap={(mealResult) => onSwap(type, mealResult)}
      />
    </>
  )
}

function Tag({ text, cls }) {
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
      {text}
    </span>
  )
}
