/**
 * ProteinBooster.jsx
 * Appears when daily protein total falls short of the target.
 * Suggests quick boosters from protein-boosters.json.
 * Added boosters count toward the daily protein total via the store.
 */
import { useState } from 'react'
import { Zap, Plus, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMealPlanStore }  from '../../stores/useMealPlanStore'
import { getProteinShortfall } from '../../services/mealEngine'
import boosterDB from '../../data/protein-boosters.json'

export default function ProteinBooster({ slots = [], skippedTypes = [], dailyTarget = 80 }) {
  const { addedBoosters, addBooster, removeBooster } = useMealPlanStore()
  const [expanded, setExpanded] = useState(false)

  const skippedSet = new Set(skippedTypes)
  const boosterProtein = addedBoosters.reduce((s, b) => s + (b.protein ?? 0), 0)

  const { shortfall, eaten } = getProteinShortfall(slots, skippedSet, dailyTarget, boosterDB)
  const effectiveShortfall   = Math.max(0, shortfall - boosterProtein)
  const onTrack              = effectiveShortfall === 0

  if (onTrack && addedBoosters.length === 0) return null

  // Suggest boosters whose protein ≤ effectiveShortfall + 5g, sorted by protein asc
  const suggestions = [...boosterDB]
    .sort((a, b) => a.protein - b.protein)
    .filter((b) => b.protein <= effectiveShortfall + 5 && b.protein > 0)
    .slice(0, 4)

  const displayList = suggestions.length > 0 ? suggestions : boosterDB.slice(0, 3)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-3 px-4 py-3.5"
      >
        <div className="w-8 h-8 bg-violet-600/20 border border-violet-700/50 rounded-xl flex items-center justify-center shrink-0">
          <Zap size={15} className="text-violet-400" />
        </div>
        <div className="flex-1 text-left">
          {onTrack ? (
            <p className="text-sm font-semibold text-emerald-400">🎉 Protein goal hit!</p>
          ) : (
            <>
              <p className="text-sm font-semibold text-white">
                You're <span className="text-violet-400">{effectiveShortfall}g</span> short of {dailyTarget}g
              </p>
              <p className="text-xs text-gray-500">Quick protein fixes →</p>
            </>
          )}
        </div>
        <span className="text-xs text-gray-600">{expanded ? '▲' : '▼'}</span>
      </button>

      {/* Added boosters chips */}
      {addedBoosters.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {addedBoosters.map((b) => (
            <button
              key={b.id}
              onClick={() => removeBooster(b.id)}
              className="flex items-center gap-1 bg-violet-900/40 border border-violet-700/50 text-violet-300 text-xs px-2.5 py-1 rounded-full"
            >
              <Check size={10} />
              {b.name} +{b.protein}g
              <span className="text-violet-500 ml-0.5">✕</span>
            </button>
          ))}
        </div>
      )}

      {/* Expanded booster list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {displayList.map((booster) => {
                const alreadyAdded = addedBoosters.some((b) => b.id === booster.id)
                return (
                  <div
                    key={booster.id}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-colors ${
                      alreadyAdded
                        ? 'bg-violet-900/30 border-violet-700/50'
                        : 'bg-gray-800/60 border-gray-700/60'
                    }`}
                  >
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{booster.name}</p>
                      <p className="text-[11px] text-gray-500 leading-tight mt-0.5 line-clamp-1">
                        {booster.description}
                      </p>
                    </div>

                    {/* Protein badge */}
                    <div className="text-center shrink-0">
                      <span className="text-lg font-black text-violet-400">+{booster.protein}g</span>
                      <p className="text-[10px] text-gray-600 leading-tight">{booster.cal} cal</p>
                    </div>

                    {/* Add / remove */}
                    <button
                      onClick={() =>
                        alreadyAdded ? removeBooster(booster.id) : addBooster(booster)
                      }
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        alreadyAdded
                          ? 'bg-violet-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-violet-700 hover:text-white'
                      }`}
                    >
                      {alreadyAdded ? <Check size={14} /> : <Plus size={14} />}
                    </button>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
