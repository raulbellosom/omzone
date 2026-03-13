import { NavLink, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, Users, UserCheck, BookOpen, Calendar,
  CreditCard, Package, Leaf, ShoppingCart, BookMarked,
  FileText, Settings, ChevronLeft,
} from 'lucide-react'
import ROUTES from '@/constants/routes'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const navItems = [
  { icon: LayoutDashboard, key: 'nav.dashboard', href: ROUTES.ADMIN_DASHBOARD },
  { icon: Users, key: 'nav.leads', href: ROUTES.ADMIN_LEADS },
  { icon: UserCheck, key: 'nav.customers', href: ROUTES.ADMIN_CUSTOMERS },
  null, // separator
  { icon: BookOpen, key: 'nav.classes', href: ROUTES.ADMIN_CLASSES },
  { icon: Calendar, key: 'nav.sessions', href: ROUTES.ADMIN_SESSIONS },
  null,
  { icon: CreditCard, key: 'nav.memberships', href: ROUTES.ADMIN_MEMBERSHIPS },
  { icon: Package, key: 'nav.packages', href: ROUTES.ADMIN_PACKAGES },
  { icon: Leaf, key: 'nav.products', href: ROUTES.ADMIN_PRODUCTS },
  null,
  { icon: ShoppingCart, key: 'nav.orders', href: ROUTES.ADMIN_ORDERS },
  { icon: BookMarked, key: 'nav.bookings', href: ROUTES.ADMIN_BOOKINGS },
  null,
  { icon: FileText, key: 'nav.content', href: ROUTES.ADMIN_CONTENT },
  { icon: Settings, key: 'nav.settings', href: ROUTES.ADMIN_SETTINGS },
]

export default function AdminSidebar() {
  const { t } = useTranslation('admin')
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col bg-white border-r border-warm-gray-dark/60 shrink-0 overflow-hidden',
        'transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Logo + toggle */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-warm-gray-dark/60 shrink-0">
        <div className={cn(
          'overflow-hidden transition-[opacity,max-width] duration-200',
          collapsed ? 'max-w-0 opacity-0' : 'max-w-[140px] opacity-100'
        )}>
          <Link to={ROUTES.ADMIN_DASHBOARD} tabIndex={collapsed ? -1 : 0}>
            <img src="/logo.png" alt="Omzone" className="h-7 w-auto object-contain" />
          </Link>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-warm-gray transition-colors text-charcoal-muted ml-auto shrink-0"
          aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          <ChevronLeft className={cn(
            'w-4 h-4 transition-transform duration-300',
            collapsed && 'rotate-180'
          )} />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="space-y-0.5">
          {navItems.map((item, idx) => {
            if (item === null) {
              return <li key={`sep-${idx}`} className="my-2 border-t border-warm-gray-dark/40" />
            }
            const { icon: Icon, key, href } = item
            return (
              <li key={href}>
                <NavLink
                  to={href}
                  end={href === ROUTES.ADMIN_DASHBOARD}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium',
                      'transition-colors duration-150',
                      isActive
                        ? 'bg-sage-muted/70 text-sage-darker'
                        : 'text-charcoal-muted hover:bg-warm-gray hover:text-charcoal'
                    )
                  }
                  title={collapsed ? t(key) : undefined}
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={cn(
                        'w-4 h-4 shrink-0 transition-transform duration-200',
                        isActive && 'scale-110'
                      )} />
                      <span className={cn(
                        'overflow-hidden whitespace-nowrap leading-none',
                        'transition-[opacity,max-width] duration-200',
                        collapsed ? 'max-w-0 opacity-0' : 'max-w-[120px] opacity-100'
                      )}>
                        {t(key)}
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
