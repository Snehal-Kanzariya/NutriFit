/**
 * MealTimeline.jsx
 * Vertical timeline with a live NOW marker separating past from future meals.
 */
import { useState, useEffect, useRef } from 'react'
import { motion }                       from 'framer-motion'
import { useMealPlanStore }             from '../../stores/useMealPlanStore'
import { getMealState, parseSlotTime, formatTime } from './trackerUtils'
import TrackableMealCard                from './TrackableMealCard'

const SLOT_DOT = {
  breakfast:      'bg-orange-400',
  lunch:          'bg-sky-400',
  dinner:         'bg-indigo-400',
  snack:          'bg-pink-400',
  'pre-workout':  'bg-yellow-400',
  'post-workout': 'bg-emerald-400',
}

export default function MealTimeline({ slots = [], dailyTarget, onCheck, onTargetHit }) {
  const { checkedMeals, trackerSkipped } = useMealPlanStore()
  const [now, setNow]   = useState(new Date())
  const nowRef          = useRef(null)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  // Auto-scroll NOW marker into view on mount and every minute
  useEffect(() => {
    nowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [now])

  if (!slots.length) return null

  // Sort slots by parsed time
  const sorted = [...slots].sort((a, b) => {
    const ta = parseSlotTime(a.time)?.getTime() ?? 0
    const tb = parseSlotTime(b.time)?.getTime() ?? 0
    return ta - tb
  })

  const timeStr = new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric', minute: '2-digit', hour12: true,
    timeZone: 'Asia/Kolkata',
  }).format(now).toUpperCase()

  // Find index where NOW marker sits (first slot whose time > now)
  const nowInsertIdx = sorted.findIndex((s) => {
    const t = parseSlotTime(s.time)
    return t && t > now
  })
  const insertAt = nowInsertIdx === -1 ? sorted.length : nowInsertIdx

  return (
    <div className="relative">
      {/* Vertical spine */}
      <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gray-800" />

      <div className="space-y-1">
        {sorted.map((slot, idx) => {
          const state  = getMealState(slot, checkedMeals, trackerSkipped, now)
          const dotCls = SLOT_DOT[slot.type] ?? 'bg-gray-500'
          const isDone = state === 'done'
          const isCurrent = state === 'eat-now' || state === 'prep'

          return (
            <div key={slot.type}>
              {/* NOW marker inserted before first future slot */}
              {idx === insertAt && (
                <div ref={nowRef} className="flex items-center gap-2 my-3 relative z-10">
                  <div className="w-10 flex justify-center">
                    <div className="w-3 h-3 rounded-full bg-violet-500 ring-4 ring-violet-500/20 animate-pulse" />
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="h-px flex-1 bg-violet-500/50" />
                    <span className="text-[11px] font-bold text-violet-400 whitespace-nowrap">
                      NOW · {timeStr}
                    </span>
                    <div className="h-px flex-1 bg-violet-500/50" />
                  </div>
                </div>
              )}

              {/* Slot row */}
              <div className={`flex gap-3 transition-opacity duration-300 ${isDone ? 'opacity-50' : 'opacity-100'}`}>
                {/* Dot on spine */}
                <div className="w-10 flex flex-col items-center shrink-0 pt-4">
                  <div className={`w-3 h-3 rounded-full border-2 border-gray-950 shrink-0 z-10 ${
                    isDone ? 'bg-emerald-500' : isCurrent ? dotCls + ' animate-pulse' : dotCls
                  }`} />
                </div>

                {/* Card */}
                <div className="flex-1 pb-3">
                  <TrackableMealCard
                    slot={slot}
                    onCheck={onCheck}
                    onTargetHit={onTargetHit}
                  />
                </div>
              </div>
            </div>
          )
        })}

        {/* NOW marker if all meals are in the past */}
        {insertAt === sorted.length && (
          <div ref={nowRef} className="flex items-center gap-2 my-3">
            <div className="w-10 flex justify-center">
              <div className="w-3 h-3 rounded-full bg-violet-500 ring-4 ring-violet-500/20 animate-pulse" />
            </div>
            <div className="flex-1 flex items-center gap-2">
              <div className="h-px flex-1 bg-violet-500/50" />
              <span className="text-[11px] font-bold text-violet-400">NOW · {timeStr}</span>
              <div className="h-px flex-1 bg-violet-500/50" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
