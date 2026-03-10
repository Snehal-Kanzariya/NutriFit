/**
 * SkippedMealBanner.jsx
 * Amber warning banner listing skipped meals and how protein was redistributed.
 * Reads from useMealPlanStore.skipHistory.
 */
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { useMealPlanStore } from '../../stores/useMealPlanStore'

const SLOT_LABELS = {
  breakfast:    'Breakfast',
  lunch:        'Lunch',
  dinner:       'Dinner',
  snack:        'Snack',
  'pre-workout':  'Pre-Workout',
  'post-workout': 'Post-Workout',
}

export default function SkippedMealBanner() {
  const skipHistory = useMealPlanStore((s) => s.skipHistory)
  const [expanded, setExpanded] = useState(true)

  if (!skipHistory.length) return null

  const lastSkip = skipHistory[skipHistory.length - 1]
  const boostedSlots = Object.entries(lastSkip.boosts ?? {})
    .filter(([, g]) => g > 0)
    .sort((a, b) => b[1] - a[1])

  return (
    <div className="bg-amber-950/60 border border-amber-800/60 rounded-2xl overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-2.5 px-4 py-3"
      >
        <AlertTriangle size={15} className="text-amber-400 shrink-0" />
        <span className="flex-1 text-left text-sm font-semibold text-amber-300">
          {skipHistory.length === 1
            ? `Skipped ${lastSkip.label} (${lastSkip.proteinWas}g protein)`
            : `${skipHistory.length} meals skipped`}
        </span>
        {expanded ? (
          <ChevronUp size={14} className="text-amber-600" />
        ) : (
          <ChevronDown size={14} className="text-amber-600" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-2.5">
          {/* All skipped items */}
          {skipHistory.map((skip, i) => (
            <div key={i} className="text-xs text-amber-200/80 space-y-1">
              {i > 0 && <div className="border-t border-amber-800/40 pt-2" />}
              <p className="font-semibold text-amber-300">
                ✕ {skip.label} skipped — {skip.proteinWas}g redistributed
              </p>
              {Object.entries(skip.boosts ?? {})
                .filter(([, g]) => g > 0)
                .map(([slot, g]) => (
                  <p key={slot} className="pl-3 text-amber-400/70">
                    ↑ {SLOT_LABELS[slot] ?? slot} boosted +{g}g
                  </p>
                ))}
            </div>
          ))}

          {/* Summary of latest boost */}
          {boostedSlots.length > 0 && skipHistory.length === 1 && (
            <p className="text-[11px] text-amber-600 italic">
              Protein ring stays accurate — meals updated automatically.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
