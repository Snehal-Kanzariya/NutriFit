import { useEffect }                                         from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence }                            from 'framer-motion'

import { useProfileStore }  from './stores/useProfileStore'
import { useMealPlanStore } from './stores/useMealPlanStore'
import { saveDayPlan }      from './services/storage'

import ErrorBoundary from './components/ErrorBoundary'
import OfflineBadge  from './components/ui/OfflineBadge'
import BottomNav     from './components/layout/BottomNav'

import Onboarding from './pages/Onboarding'
import Dashboard  from './pages/Dashboard'
import MealPlan   from './pages/MealPlan'
import Nutrients  from './pages/Nutrients'
import Profile    from './pages/Profile'
import History    from './pages/History'
import Settings   from './pages/Settings'

// ── Auto-save today's plan to IndexedDB on every change ──────────────────────

function PlanPersistence() {
  const { todayPlan, skippedTypes, addedBoosters } = useMealPlanStore()
  const { proteinTarget } = useProfileStore()

  useEffect(() => {
    if (!todayPlan) return
    const todayStr = new Date().toISOString().slice(0, 10)
    const skipped  = new Set(skippedTypes)
    const base     = (todayPlan.slots ?? [])
      .filter((s) => !skipped.has(s.type))
      .reduce((sum, s) => sum + (s.meal?.protein ?? 0), 0)
    const boost    = addedBoosters.reduce((s, b) => s + (b.protein ?? 0), 0)
    const protein  = base + boost
    const calories = (todayPlan.slots ?? [])
      .filter((s) => !skipped.has(s.type))
      .reduce((sum, s) => sum + (s.meal?.cal ?? 0), 0)
    const target   = todayPlan.proteinTarget ?? proteinTarget ?? 80

    saveDayPlan(todayStr, todayPlan, target, protein, calories)
  }, [todayPlan, skippedTypes, addedBoosters]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

// ── Page transition wrapper ───────────────────────────────────────────────────

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0,  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
}

function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={PAGE_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-full"
    >
      {children}
    </motion.div>
  )
}

// ── App shell with animated routes ───────────────────────────────────────────

function AppShell() {
  const location    = useLocation()
  const isOnboarded = useProfileStore((s) => s.isOnboarded)

  const showNav = isOnboarded && location.pathname !== '/onboarding'

  return (
    <div className="min-h-screen bg-gray-950">
      <PlanPersistence />
      <OfflineBadge />

      <div className={`flex min-h-screen ${showNav ? 'lg:pl-56' : ''}`}>
        {/* Sidebar nav — lg and up */}
        {showNav && <BottomNav />}

        <main className="flex-1 pb-20 lg:pb-0 overflow-x-hidden w-full">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait" initial={false}>
              <Routes location={location} key={location.pathname}>
                {/* Onboarding — no shell chrome */}
                <Route
                  path="/onboarding"
                  element={
                    <AnimatedPage><Onboarding /></AnimatedPage>
                  }
                />

                {/* Protected routes — with BottomNav */}
                <Route
                  path="/"
                  element={
                    isOnboarded
                      ? <AnimatedPage><Dashboard /></AnimatedPage>
                      : <Navigate to="/onboarding" replace />
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    isOnboarded
                      ? <AnimatedPage><Dashboard /></AnimatedPage>
                      : <Navigate to="/onboarding" replace />
                  }
                />
                <Route
                  path="/meals"
                  element={
                    isOnboarded
                      ? <AnimatedPage><MealPlan /></AnimatedPage>
                      : <Navigate to="/onboarding" replace />
                  }
                />
                <Route
                  path="/nutrients"
                  element={
                    isOnboarded
                      ? <AnimatedPage><Nutrients /></AnimatedPage>
                      : <Navigate to="/onboarding" replace />
                  }
                />
                <Route
                  path="/profile"
                  element={
                    isOnboarded
                      ? <AnimatedPage><Profile /></AnimatedPage>
                      : <Navigate to="/onboarding" replace />
                  }
                />
                <Route
                  path="/history"
                  element={
                    isOnboarded
                      ? <AnimatedPage><History /></AnimatedPage>
                      : <Navigate to="/onboarding" replace />
                  }
                />
                <Route
                  path="/settings"
                  element={
                    isOnboarded
                      ? <AnimatedPage><Settings /></AnimatedPage>
                      : <Navigate to="/onboarding" replace />
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}

// ── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
