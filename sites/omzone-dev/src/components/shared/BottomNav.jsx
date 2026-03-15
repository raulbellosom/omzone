/**
 * BottomNav — navegación inferior móvil para el área de cliente.
 * Solo visible en pantallas pequeñas (md:hidden).
 */
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, Calendar, ShoppingBag, CreditCard, User } from 'lucide-react'
import ROUTES from '@/constants/routes'
import { cn } from '@/lib/utils'

const items = [
  { icon: LayoutDashboard, key: 'nav.dashboard', href: ROUTES.ACCOUNT_DASHBOARD },
  { icon: Calendar, key: 'nav.bookings', href: ROUTES.ACCOUNT_BOOKINGS },
  { icon: ShoppingBag, key: 'nav.orders', href: ROUTES.ACCOUNT_ORDERS },
  { icon: CreditCard, key: 'nav.membership', href: ROUTES.ACCOUNT_MEMBERSHIP },
  { icon: User, key: 'nav.profile', href: ROUTES.ACCOUNT_PROFILE },
]

export default function BottomNav() {
  const { t } = useTranslation('customer')

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-sm border-t border-warm-gray-dark/60 safe-area-bottom">
      <ul className="flex">
        {items.map(({ icon: Icon, key, href }) => (
          <li key={href} className="flex-1">
            <NavLink
              to={href}
              end={href === ROUTES.ACCOUNT_DASHBOARD}
              className={({ isActive }) =>
                cn(
                  'relative flex flex-col items-center gap-0.5 py-2.5 px-1 text-[10px] font-medium',
                  'transition-colors duration-150',
                  isActive ? 'text-sage' : 'text-charcoal-subtle hover:text-charcoal-muted'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Indicador activo */}
                  <span className={cn(
                    'absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-sage',
                    'transition-[width,opacity] duration-300',
                    isActive ? 'w-5 opacity-100' : 'w-0 opacity-0'
                  )} />
                  <Icon className={cn(
                    'w-5 h-5 transition-all duration-200',
                    isActive ? 'scale-110' : 'scale-100'
                  )} />
                  <span>{t(key)}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
