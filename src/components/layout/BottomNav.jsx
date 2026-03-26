import { NavLink } from 'react-router-dom'
import { LayoutDashboard, UtensilsCrossed, Dna, User, Clock, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/meals',     icon: UtensilsCrossed, label: 'Meals'     },
  { to: '/nutrients', icon: Dna,             label: 'Nutrients' },
  { to: '/history',   icon: Clock,           label: 'History'   },
  { to: '/profile',   icon: User,            label: 'Profile'   },
  { to: '/settings',  icon: Settings,        label: 'Settings'  },
]

export default function BottomNav() {
  return (
    <>
      {/* ── Mobile bottom nav (< lg) ──────────────────────────────────────── */}
      <nav className="fixed bottom-0 inset-x-0 bg-gray-900 border-t border-gray-800 z-50 lg:hidden">
        <div className="flex items-center justify-around h-16 max-w-xl mx-auto">
          {NAV_ITEMS.slice(0, 4).map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-2 transition-colors ${
                  isActive ? 'text-violet-400' : 'text-gray-500 hover:text-gray-300'
                }`
              }
            >
              <Icon size={22} strokeWidth={1.8} />
              <span className="text-[11px] font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* ── Desktop sidebar (lg+) ─────────────────────────────────────────── */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-56 bg-gray-900 border-r border-gray-800 flex-col z-50">
        {/* Logo */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-sm font-black text-white">N</div>
            <span className="text-lg font-black text-white tracking-tight">NutriFit</span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-violet-600/15 text-violet-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                }`
              }
            >
              <Icon size={20} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-800">
          <p className="text-[11px] text-gray-600">NutriFit v1.0</p>
        </div>
      </aside>
    </>
  )
}
