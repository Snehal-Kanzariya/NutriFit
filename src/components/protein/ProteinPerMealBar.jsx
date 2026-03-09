/**
 * ProteinPerMealBar.jsx
 * Horizontal bar chart showing protein contribution per meal slot.
 * Bars are violet-500, widths proportional to max protein among slots.
 */
import { motion } from 'framer-motion'

const SLOT_SHORT = {
  breakfast:    'BF',
  lunch:        'LN',
  dinner:       'DN',
  snack:        'SN',
  'pre-workout':  'PW',
  'post-workout': 'PO',
}

/**
 * @param {{
 *   slots: Array<{ type: string, label: string, meal: object|null, proteinTarget: number }>,
 *   dailyTarget: number,
 * }} props
 */
export default function ProteinPerMealBar({ slots = [], dailyTarget = 1 }) {
  if (!slots.length) return null

  const maxProtein = Math.max(...slots.map((s) => s.meal?.protein ?? 0), 1)

  return (
    <div className="space-y-2.5">
      {slots.map((slot, i) => {
        const protein   = slot.meal?.protein ?? 0
        const pct       = Math.round((protein / dailyTarget) * 100)
        const barWidth  = (protein / maxProtein) * 100
        const skipped   = slot.skipped

        return (
          <div key={slot.type} className="flex items-center gap-3">
            {/* Slot abbreviation */}
            <span className="w-7 text-right text-[11px] font-bold text-gray-500 shrink-0">
              {SLOT_SHORT[slot.type] ?? slot.type.slice(0, 2).toUpperCase()}
            </span>

            {/* Bar track */}
            <div className="flex-1 h-5 bg-gray-800 rounded-md overflow-hidden relative">
              <motion.div
                className={`h-full rounded-md ${skipped ? 'bg-gray-700' : 'bg-violet-600'}`}
                initial={{ width: 0 }}
                animate={{ width: `${barWidth}%` }}
                transition={{ duration: 0.8, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              />
              {skipped && (
                <span className="absolute inset-0 flex items-center px-2 text-[10px] text-gray-500 italic">
                  skipped
                </span>
              )}
            </div>

            {/* Protein value + % */}
            <div className="text-right shrink-0 w-16">
              <span className="text-sm font-bold text-white">{protein}g</span>
              {pct > 0 && (
                <span className="text-[10px] text-gray-500 ml-1">{pct}%</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
