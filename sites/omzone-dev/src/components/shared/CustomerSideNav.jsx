import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, CalendarCheck, ShoppingBag, ArrowLeft } from 'lucide-react'
import ROUTES from '@/constants/routes'
import { useSidebar } from '@/contexts/SidebarContext'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: ROUTES.ZONE_DASHBOARD, icon: LayoutDashboard, key: 'dashboard' },
  { to: ROUTES.ZONE_BOOKINGS,  icon: CalendarCheck,   key: 'bookings'  },
  { to: ROUTES.ZONE_ORDERS,    icon: ShoppingBag,     key: 'orders'    },
]

export default function CustomerSideNav({ className }) {
  const { t } = useTranslation('customer')
  const sidebar = useSidebar()
  const filterPanel = sidebar?.filterPanel

  // Filter mode: a page has injected its own filter panel
  if (filterPanel) {
    return (
      <aside className={cn('hidden md:flex flex-col w-64 shrink-0', className)}>
        <div className="px-4 pt-4 pb-3 border-b border-warm-gray-dark/20">
          <NavLink
            to={ROUTES.ZONE_DASHBOARD}
            className="flex items-center gap-2 text-sm text-charcoal-muted hover:text-charcoal transition-colors"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            {t('nav.dashboard')}
          </NavLink>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {filterPanel}
        </div>
      </aside>
    )
  }

  // Default nav mode
  return (
    <aside className={cn('hidden md:flex flex-col w-56 shrink-0', className)}>
      <nav className="flex flex-col gap-0.5 px-3 pt-6">
        {NAV_ITEMS.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            end
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
