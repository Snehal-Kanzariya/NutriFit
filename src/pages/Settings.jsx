/**
 * Settings.jsx
 * App-level settings: schedule mode, default protein, data export, reset, about.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Trash2, AlertTriangle, Info, CheckCircle } from 'lucide-react'

import { useProfileStore }  from '../stores/useProfileStore'
import { useScheduleStore } from '../stores/useScheduleStore'
import { useMealPlanStore } from '../stores/useMealPlanStore'
import { useNutritionStore } from '../stores/useNutritionStore'
import { exportAllData, resetAllData } from '../services/storage'

// ── Shared UI ─────────────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-2"
    >
      <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-1">{title}</h2>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden divide-y divide-gray-800">
        {children}
      </div>
    </motion.section>
  )
}

function Row({ label, sublabel, right, onClick, destructive = false }) {
  const base = 'flex items-center justify-between px-4 py-4 w-full text-left transition-colors'
  const hover = onClick
    ? destructive
      ? 'hover:bg-rose-900/20 cursor-pointer'
      : 'hover:bg-gray-800/60 cursor-pointer'
    : ''

  return (
    <div className={`${base} ${hover}`} onClick={onClick}>
      <div>
        <p className={`text-sm font-medium ${destructive ? 'text-rose-400' : 'text-white'}`}>{label}</p>
        {sublabel && <p className="text-xs text-gray-500 mt-0.5">{sublabel}</p>}
      </div>
      {right && <div className="shrink-0 ml-3">{right}</div>}
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${value ? 'bg-violet-500' : 'bg-gray-700'}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  )
}

// ── Confirmation modal ────────────────────────────────────────────────────────

function ConfirmModal({ open, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-40"
            onClick={onCancel}
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm bg-gray-900 border border-gray-700 rounded-2xl p-6 z-50"
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-rose-900/40 border border-rose-700/50 flex items-center justify-center">
                <AlertTriangle size={22} className="text-rose-400" />
              </div>
              <h3 className="text-white font-bold text-base">Reset All Data?</h3>
              <p className="text-sm text-gray-400">
                This will permanently delete your profile, meal history, routines, and all saved data.
                This cannot be undone.
              </p>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={onCancel}
                  className="flex-1 py-3 bg-gray-800 text-gray-300 font-semibold rounded-xl text-sm hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-sm transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Settings() {
  const profileStore   = useProfileStore()
  const { scheduleMode, setScheduleMode } = useScheduleStore()
  const { clearPlan }  = useMealPlanStore()
  const { resetDaily } = useNutritionStore()

  const defaultProtein = profileStore.proteinTarget ?? 80
  const appVersion     = import.meta.env.VITE_APP_VERSION ?? '1.0.0'

  const [askDaily,     setAskDaily]     = useState(scheduleMode !== 'saved_routines')
  const [exportDone,   setExportDone]   = useState(false)
  const [resetModal,   setResetModal]   = useState(false)
  const [resetting,    setResetting]    = useState(false)

  // ── Schedule mode ──────────────────────────────────────────────────────────
  function toggleAskDaily(val) {
    setAskDaily(val)
    setScheduleMode(val ? 'standard' : 'saved_routines')
  }

  // ── Export ─────────────────────────────────────────────────────────────────
  async function handleExport() {
    const json = await exportAllData()
    const blob = new Blob([json], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `nutrifit-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExportDone(true)
    setTimeout(() => setExportDone(false), 2500)
  }

  // ── Reset ──────────────────────────────────────────────────────────────────
  async function handleReset() {
    setResetting(true)
    await resetAllData()
    clearPlan()
    resetDaily()
    profileStore.reset()
    setResetting(false)
    setResetModal(false)
    // Navigate to onboarding by reloading
    window.location.href = '/onboarding'
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="px-4 pt-5 pb-3">
        <h1 className="text-lg font-bold text-white">Settings</h1>
        <p className="text-xs text-gray-500 mt-0.5">Preferences and data</p>
      </header>

      <div className="px-4 pb-8 space-y-5">

        {/* ── SCHEDULE ──────────────────────────────────────────────────── */}
        <Section title="Schedule">
          <Row
            label="Ask me daily"
            sublabel="Morning check-in picks activity and protein each day"
            right={<Toggle value={askDaily} onChange={toggleAskDaily} />}
          />
          <Row
            label="Use saved routines"
            sublabel="Auto-apply a routine without daily check-in"
            right={<Toggle value={!askDaily} onChange={(v) => toggleAskDaily(!v)} />}
          />
        </Section>

        {/* ── PROTEIN ───────────────────────────────────────────────────── */}
        <Section title="Protein">
          <Row
            label="Default protein target"
            sublabel="Used when no check-in is done"
            right={
              <span className="text-sm font-bold text-violet-400">{defaultProtein}g</span>
            }
          />
        </Section>

        {/* ── DATA ──────────────────────────────────────────────────────── */}
        <Section title="Data">
          <Row
            label={exportDone ? 'Exported!' : 'Export data as JSON'}
            sublabel="Download your profile, meals, and history"
            right={
              exportDone
                ? <CheckCircle size={18} className="text-emerald-400" />
                : <Download size={18} className="text-gray-400" />
            }
            onClick={handleExport}
          />
          <Row
            label={resetting ? 'Resetting…' : 'Reset all data'}
            sublabel="Permanently deletes everything. Cannot be undone."
            right={<Trash2 size={18} className="text-rose-400" />}
            onClick={() => setResetModal(true)}
            destructive
          />
        </Section>

        {/* ── ABOUT ─────────────────────────────────────────────────────── */}
        <Section title="About">
          <Row
            label="NutriFit"
            sublabel="AI-powered Indian protein nutrition guide"
            right={<Info size={16} className="text-gray-600" />}
          />
          <Row
            label="Version"
            right={<span className="text-xs text-gray-500 font-mono">{appVersion}</span>}
          />
          <Row
            label="AI Providers"
            sublabel="Gemini → Groq → OpenRouter → local fallback"
            right={<span className="text-xs text-emerald-500 font-semibold">FREE</span>}
          />
          <Row
            label="Storage"
            sublabel="All data stays on your device (IndexedDB)"
            right={<span className="text-xs text-gray-500">Local</span>}
          />
        </Section>

      </div>

      {/* Reset confirmation modal */}
      <ConfirmModal
        open={resetModal}
        onConfirm={handleReset}
        onCancel={() => setResetModal(false)}
      />
    </div>
  )
}
