/**
 * ProteinProgressRing.jsx
 * Large animated circular progress ring — hero element on the Dashboard.
 * violet-500 fill on a violet-950 track. Framer Motion entrance animation.
 */
import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

const R = 80          // circle radius
const CX = 100        // viewBox center x
const CY = 100        // viewBox center y
const STROKE_W = 14   // stroke width
const CIRCUMFERENCE = 2 * Math.PI * R

/**
 * @param {{ eaten: number, target: number, size?: number }} props
 *   size — rendered pixel size of the SVG (default 220)
 */
export default function ProteinProgressRing({ eaten = 0, target = 80, size = 220 }) {
  const pct      = target > 0 ? Math.min(1, eaten / target) : 0
  const dashOffset = CIRCUMFERENCE * (1 - pct)

  // Animate the strokeDashoffset from full (empty ring) to target value on mount
  const motionOffset = useMotionValue(CIRCUMFERENCE)

  useEffect(() => {
    const controls = animate(motionOffset, dashOffset, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1], // expo out
    })
    return controls.stop
  }, [dashOffset]) // re-animate when eaten/target changes

  const percentLabel = Math.round(pct * 100)
  const remaining    = Math.max(0, target - eaten)

  return (
    <div className="flex flex-col items-center gap-3">
      <div style={{ width: size, height: size }} className="relative">
        <svg
          viewBox="0 0 200 200"
          width={size}
          height={size}
          className="rotate-[-90deg]"   // start arc from top
        >
          {/* Track ring */}
          <circle
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke="#2e1065"            // violet-950
            strokeWidth={STROKE_W}
          />
          {/* Progress arc */}
          <motion.circle
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke="#8b5cf6"            // violet-500
            strokeWidth={STROKE_W}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            style={{ strokeDashoffset: motionOffset }}
          />
        </svg>

        {/* Center text (counter-rotate to cancel SVG rotation) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
          <span className="text-[11px] font-medium text-gray-400 tracking-widest uppercase mb-0.5">
            Protein
          </span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-4xl font-black text-white tabular-nums leading-none">
              {eaten}
            </span>
            <span className="text-lg font-semibold text-gray-400">
              /{target}g
            </span>
          </div>
          <span className="text-[11px] text-gray-500 mt-1">
            {remaining > 0 ? `${remaining}g left` : 'Goal hit! 🎉'}
          </span>
        </div>
      </div>

      {/* Percentage bar below ring */}
      <div className="w-full max-w-[200px] space-y-1">
        <div className="h-1.5 w-full bg-violet-950 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-violet-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentLabel}%` }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <p className="text-center text-sm font-semibold text-violet-400">
          {percentLabel}% of daily goal
        </p>
      </div>
    </div>
  )
}
