/**
 * MealSwapSheet.jsx
 * Bottom sheet showing 3 alternative meals sorted by protein-match closeness.
 * Called from MealCard — receives slot info and fires onSwap(mealResult) callback.
 */
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle } from 'lucide-react'
import { getSwapAlternatives }  from '../../services/mealEngine'

import mealsNonveg     from '../../data/meals-nonveg.json'
import mealsVeg        from '../../data/meals-veg.json'
import mealsVegan      from '../../data/meals-vegan.json'
import mealsEggetarian from '../../data/meals-eggetarian.json'

const MEAL_DB = {
  nonveg: mealsNonveg, veg: mealsVeg, vegan: mealsVegan, eggetarian: mealsEggetarian,
}

const MATCH_STYLE = {
  exact: { text: '✅ Exact',         cls: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' },
  close: { text: '≈ Close',          cls: 'text-violet-400  bg-violet-950/60  border-violet-800'  },
  over:  { text: '⚠️ Over target',   cls: 'text-amber-400   bg-amber-950/60   border-amber-800'   },
  under: { text: '⚠️ Under target',  cls: 'text-red-400     bg-red-950/60     border-red-800'     },
}

const COOK_LABELS = {
  quick: { text: 'Quick', cls: 'text-emerald-400 bg-emerald-950/50' },
  cook:  { text: 'Cook',  cls: 'text-amber-400   bg-amber-950/50'   },
}

/**
 * @param {{
 *   open:          boolean,
 *   onClose:       () => void,
 *   slot:          { type, label, proteinTarget },
 *   currentMeal:   object,
 *   diet:          string,
 *   canCook:       boolean,
 *   onSwap:        (mealResult) => void,
 * }} props
 */
export default function MealSwapSheet({ open, onClose, slot, currentMeal, diet, canCook, onSwap }) {
  if (!open || !slot || !currentMeal) return null

  const mealDB = MEAL_DB[diet] || mealsVeg

  const alternatives = getSwapAlternatives(
    mealDB,
    currentMeal,
    slot.proteinTarget,
    diet,
    canCook,
    3
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40"
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-gray-900 border-t border-gray-800 rounded-t-3xl z-50 pb-8"
          >
            {/* Handle + header */}
            <div className="pt-3 pb-3 px-4 border-b border-gray-800">
              <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-base">Swap {slot.label}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Target: {slot.proteinTarget}g protein — sorted by best match
                  </p>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {alternatives.length === 0 ? (
                <p className="text-center text-gray-500 py-6 text-sm">
                  No alternatives found for this slot.
                </p>
              ) : (
                alternatives.map(({ meal, proteinMatch, deltaLabel, inTolerance }) => {
                  const matchStyle = MATCH_STYLE[proteinMatch] ?? MATCH_STYLE.close
                  const isQuick    = meal.tags?.includes('quick')
                  const cookLabel  = COOK_LABELS[isQuick ? 'quick' : 'cook']

                  return (
                    <button
                      key={meal.id}
                      onClick={() => {
                        onSwap({ meal, proteinMatch, deltaLabel, inTolerance, fallback: !inTolerance })
                        onClose()
                      }}
                      className="w-full flex items-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-violet-700 rounded-2xl px-4 py-3.5 transition-all text-left active:scale-[0.98]"
                    >
                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm leading-tight truncate">
                          {meal.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {/* Protein match badge */}
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${matchStyle.cls}`}>
                            {matchStyle.text}
                            {deltaLabel !== 'exact' && ` (${deltaLabel})`}
                          </span>
                          {/* Cook tag */}
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cookLabel.cls}`}>
                            {cookLabel.text}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">
                          {meal.cal} cal · ⏱ {meal.prepTime}m
                        </p>
                      </div>

                      {/* Protein */}
                      <div className="text-right shrink-0">
                        <span className="text-2xl font-black text-violet-400">{meal.protein}</span>
                        <span className="text-xs text-gray-500 ml-0.5">g</span>
                        <p className="text-[10px] text-gray-600">protein</p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
