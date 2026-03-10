import { useEffect }                          from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useProfileStore }  from './stores/useProfileStore'
import { useMealPlanStore } from './stores/useMealPlanStore'
import { saveDayPlan }      from './services/storage'
import Onboarding from './pages/Onboarding'
import Dashboard  from './pages/Dashboard'
import MealPlan   from './pages/MealPlan'
import Nutrients  from './pages/Nutrients'
import Profile    from './pages/Profile'
import History    from './pages/History'
import Settings   from './pages/Settings'
import BottomNav  from './components/layout/BottomNav'

/** Auto-save today's plan to IndexedDB whenever it changes */
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
  }, [todayPlan, skippedTypes, addedBoosters])

  return null
}

function AppLayout({ children }) {
  return (
    <div className="flex justify-center min-h-screen bg-gray-950">
      <div className="relative w-full max-w-[480px] min-h-screen bg-gray-950 flex flex-col">
        <PlanPersistence />
        <main className="flex-1 pb-20">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const isOnboarded = useProfileStore((s) => s.isOnboarded)
  return isOnboarded ? children : <Navigate to="/onboarding" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout><Dashboard /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout><Dashboard /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/meals"
          element={
            <ProtectedRoute>
              <AppLayout><MealPlan /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/nutrients"
          element={
            <ProtectedRoute>
              <AppLayout><Nutrients /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout><Profile /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <AppLayout><History /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppLayout><Settings /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
