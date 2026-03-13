import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, CalendarCheck, ShoppingBag, Award, UserCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth.jsx'
import ROUTES from '@/constants/routes'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: ROUTES.ACCOUNT_DASHBOARD, icon: LayoutDashboard, key: 'dashboard', end: true },
  { to: ROUTES.ACCOUNT_BOOKINGS,  icon: CalendarCheck,   key: 'bookings',  end: false },
  { to: ROUTES.ACCOUNT_ORDERS,    icon: ShoppingBag,     key: 'orders',    end: false },
  { to: ROUTES.ACCOUNT_MEMBERSHIP,icon: Award,           key: 'membership',end: false },
  { to: ROUTES.ACCOUNT_PROFILE,   icon: UserCircle,      key: 'profile',   end: false },
]

export default function CustomerSideNav({ className }) {
  const { t } = useTranslation('customer')
  const { user } = useAuth()

  const initials = [user?.first_name?.[0], user?.last_name?.[0]].filter(Boolean).join('')

  return (
    <aside className={cn('hidden md:flex flex-col w-56 shrink-0', className)}>
      {/* Avatar + nombre */}
      <div className="px-4 pt-8 pb-6 border-b border-warm-gray-dark/30">
        <div className="w-10 h-10 rounded-full bg-sage-muted flex items-center justify-center mb-3">
          <span className="text-sage font-semibold text-sm select-none">{initials}</span>
        </div>
        <p className="font-semibold text-charcoal text-sm leading-tight">
          {user?.first_name} {user?.last_name}
        </p>
        <p className="text-xs text-charcoal-subtle truncate mt-0.5">{user?.email}</p>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-0.5 px-3 pt-4">
        {NAV_ITEMS.map(({ to, icon: Icon, key, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150',
              isActive
                ? 'bg-sage-muted text-sage'
                : 'text-charcoal-muted hover:bg-cream hover:text-charcoal'
            )}
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('w-4 h-4 shrink-0 transition-colors', isActive ? 'text-sage' : 'text-charcoal-subtle')} />
                {t(`nav.${key}`)}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
