import { NavLink } from 'react-router-dom'
import { LayoutDashboard, UtensilsCrossed, Dna, User } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/meals',     icon: UtensilsCrossed, label: 'Meals'     },
  { to: '/nutrients', icon: Dna,             label: 'Nutrients' },
  { to: '/profile',   icon: User,            label: 'Profile'   },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-gray-900 border-t border-gray-800 z-50">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-2 transition-colors ${
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
  )
}
