import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useProfileStore } from './stores/useProfileStore'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import MealPlan from './pages/MealPlan'
import Nutrients from './pages/Nutrients'
import Profile from './pages/Profile'
import History from './pages/History'
import Settings from './pages/Settings'
import BottomNav from './components/layout/BottomNav'

function AppLayout({ children }) {
  return (
    <div className="flex justify-center min-h-screen bg-gray-950">
      <div className="relative w-full max-w-[480px] min-h-screen bg-gray-950 flex flex-col">
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
