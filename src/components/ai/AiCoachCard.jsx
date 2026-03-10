/**
 * AiCoachCard.jsx
 * Purple gradient card that shows a live AI protein coaching tip.
 *
 * States:
 *  - loading  : spinner + "Analyzing your protein plan..."
 *  - tip      : tip text + provider badge + refresh button
 *  - error    : falls back to a local tip (never shown as an error to user)
 */
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence }           from 'framer-motion'
import { Sparkles, RefreshCw }               from 'lucide-react'

import { getProteinTip }     from '../../services/ai'
import { useProfileStore }   from '../../stores/useProfileStore'
import { useMealPlanStore }  from '../../stores/useMealPlanStore'

// ── Provider label map ────────────────────────────────────────────────────────

const PROVIDER_LABELS = {
  gemini:      'via Gemini',
  groq:        'via Groq',
  openrouter:  'via OpenRouter',
  local:       'local tip',
}

const PROVIDER_COLORS = {
  gemini:      'bg-blue-900/60 text-blue-300 border-blue-700/50',
  groq:        'bg-orange-900/60 text-orange-300 border-orange-700/50',
  openrouter:  'bg-emerald-900/60 text-emerald-300 border-emerald-700/50',
  local:       'bg-gray-800/80 text-gray-400 border-gray-700/50',
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AiCoachCard() {
  const profile   = useProfileStore()
  const { todayPlan, skippedTypes, addedBoosters } = useMealPlanStore()

  const [tip,      setTip]      = useState(null)
  const [provider, setProvider] = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [fetched,  setFetched]  = useState(false)

  // Build totals from plan (protein eaten + boosters)
  const totals = (() => {
    const slots  = todayPlan?.slots ?? []
    const skipped = new Set(skippedTypes)
    const base   = slots
      .filter((s) => !skipped.has(s.type))
      .reduce((sum, s) => sum + (s.meal?.protein ?? 0), 0)
    const boost  = addedBoosters.reduce((s, b) => s + (b.protein ?? 0), 0)
    return { protein: base + boost }
  })()

  const fetchTip = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getProteinTip(
        profile,
        { slots: todayPlan?.slots, skippedTypes },
        totals
      )
      setTip(result.text)
      setProvider(result.provider)
    } catch {
      // getProteinTip never throws, but guard anyway
      setTip("Focus on adding a protein-rich food to each meal — like paneer, dal, or eggs — to hit your target today!")
      setProvider('local')
    } finally {
      setLoading(false)
      setFetched(true)
    }
  }, [profile, todayPlan, skippedTypes, totals.protein])

  // Auto-fetch once on mount
  useEffect(() => {
    if (!fetched) fetchTip()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const providerLabel = PROVIDER_LABELS[provider] ?? provider
  const providerColor = PROVIDER_COLORS[provider] ?? PROVIDER_COLORS.local

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl overflow-hidden border border-purple-800/50"
      style={{ background: 'linear-gradient(135deg, #1a0533 0%, #111827 100%)' }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <span className="text-sm font-bold text-white">AI Protein Coach</span>
        </div>

        {/* Provider badge */}
        {provider && !loading && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${providerColor}`}>
            {providerLabel}
          </span>
        )}
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="px-4 pb-4">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 py-4"
            >
              <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin shrink-0" />
              <p className="text-sm text-purple-300 italic">
                Analyzing your protein plan...
              </p>
            </motion.div>
          ) : tip ? (
            <motion.div
              key="tip"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Tip text */}
              <p className="text-sm text-gray-200 leading-relaxed py-3 border-t border-purple-900/60">
                {tip}
              </p>

              {/* Refresh button */}
              <button
                onClick={fetchTip}
                className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors group"
              >
                <Sparkles size={12} className="group-hover:scale-110 transition-transform" />
                Get new tip
                <RefreshCw size={11} className="ml-0.5 opacity-60" />
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
