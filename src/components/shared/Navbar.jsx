import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, User, LogOut, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
import { useAuth } from '@/hooks/useAuth.jsx'
import { isAdmin } from '@/services/mocks/userService.mock'
import ROUTES from '@/constants/routes'
import { cn } from '@/lib/utils'

const navLinks = [
  { key: 'nav.classes', href: ROUTES.CLASSES },
  { key: 'nav.memberships', href: ROUTES.MEMBERSHIPS },
  { key: 'nav.packages', href: ROUTES.PACKAGES },
  { key: 'nav.wellness', href: ROUTES.WELLNESS },
]

export default function Navbar() {
  const { t } = useTranslation('common')
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogout() {
    setUser(null)
    navigate(ROUTES.HOME)
  }

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
    : ''

  return (
    <header
      className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-warm-gray-dark/50"
      style={{ boxShadow: 'var(--shadow-nav)' }}
    >
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to={ROUTES.HOME} className="flex items-center gap-2 shrink-0">
          <img
            src="/logo.png"
            alt="Omzone"
            className="h-8 w-auto object-contain"
          />
        </Link>

        {/* Nav desktop */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map(({ key, href }) => (
            <li key={href}>
              <NavLink
                to={href}
                className={({ isActive }) =>
                  cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'text-sage bg-sage-muted/50'
                      : 'text-charcoal-muted hover:text-charcoal hover:bg-warm-gray'
                  )
                }
              >
                {t(key)}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Selector de idioma — desktop */}
        <LanguageSwitcher className="hidden md:flex" />

        {/* Acciones desktop */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              {isAdmin(user) && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to={ROUTES.ADMIN_DASHBOARD}>
                    <ShieldCheck className="w-4 h-4" />
                    {t('nav.adminPanel')}
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="icon" asChild>
                <Link to={ROUTES.ACCOUNT_DASHBOARD}>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout} title={t('nav.logout')}>
                <LogOut className="w-4 h-4 text-charcoal-muted" />
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to={ROUTES.LOGIN}>{t('nav.login')}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to={ROUTES.CLASSES}>{t('actions.bookClass')}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Hamburger móvil */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-warm-gray transition-colors"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5 text-charcoal" />
        </button>
      </nav>

      {/* Mobile menu */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>
              <img src="/logo.png" alt="Omzone" className="h-7 w-auto object-contain" />
            </SheetTitle>
            <SheetDescription className="sr-only">
              Menú de navegación y acciones de cuenta.
            </SheetDescription>
          </SheetHeader>

          <div className="px-5 py-4 flex flex-col gap-1">
            {navLinks.map(({ key, href }) => (
              <SheetClose asChild key={href}>
                <NavLink
                  to={href}
                  className={({ isActive }) =>
                    cn(
                      'block px-3 py-3 rounded-xl text-sm font-medium transition-colors duration-150',
                      isActive
                        ? 'bg-sage-muted text-sage-darker'
                        : 'text-charcoal hover:bg-warm-gray'
                    )
                  }
                >
                  {t(key)}
                </NavLink>
              </SheetClose>
            ))}
            {/* Selector de idioma — móvil */}
            <div className="px-3 pt-2">
              <LanguageSwitcher />
            </div>
          </div>

          <Separator />

          <div className="px-5 py-4 flex flex-col gap-2">
            {user ? (
              <>
                {isAdmin(user) && (
                  <SheetClose asChild>
                    <Link
                      to={ROUTES.ADMIN_DASHBOARD}
                      className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm text-charcoal hover:bg-warm-gray"
                    >
                      <ShieldCheck className="w-4 h-4 text-sage" />
                      {t('nav.adminPanel')}
                    </Link>
                  </SheetClose>
                )}
                <SheetClose asChild>
                  <Link
                    to={ROUTES.ACCOUNT_DASHBOARD}
                    className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm text-charcoal hover:bg-warm-gray"
                  >
                    <User className="w-4 h-4 text-charcoal-muted" />
                    {t('nav.myAccount')}
                  </Link>
                </SheetClose>
                <button
                  onClick={() => { setMobileOpen(false); handleLogout() }}
                  className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm text-charcoal hover:bg-warm-gray text-left"
                >
                  <LogOut className="w-4 h-4 text-charcoal-muted" />
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <SheetClose asChild>
                  <Link to={ROUTES.LOGIN}>
                    <Button variant="outline" className="w-full">{t('nav.login')}</Button>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to={ROUTES.CLASSES}>
                    <Button className="w-full">{t('actions.bookClass')}</Button>
                  </Link>
                </SheetClose>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
