import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth.jsx";
import ROUTES from "@/constants/routes";
import { cn } from "@/lib/utils";

const navLinks = [
  { key: "nav.classes", href: ROUTES.CLASSES },
  { key: "nav.packages", href: ROUTES.PACKAGES },
  { key: "nav.wellness", href: ROUTES.WELLNESS },
];

export default function Navbar() {
  const { t } = useTranslation("common");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    setMobileOpen(false);
    await logout();
    navigate(ROUTES.HOME);
  }

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()
    : "";

  // Logo destination: authenticated users always go to /app (which smart-redirects clients to /account)
  const logoHref = user ? ROUTES.ADMIN : ROUTES.HOME;

  return (
    <header
      className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-warm-gray-dark/50"
      style={{ boxShadow: "var(--shadow-nav)" }}
    >
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to={logoHref} className="flex items-center gap-2 shrink-0">
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
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "text-sage bg-sage-muted/50"
                      : "text-charcoal-muted hover:text-charcoal hover:bg-warm-gray",
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
                  aria-label={t("nav.userMenu")}
                >
                  <Avatar className="h-8 w-8 hover:ring-2 hover:ring-sage/40 transition-all">
                    <AvatarFallback className="text-xs bg-sage-muted text-sage-darker font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="leading-tight">
                  <span className="block font-semibold text-charcoal">
                    {user.full_name || `${user.first_name} ${user.last_name}`}
                  </span>
                  <span className="block text-charcoal-subtle font-normal truncate max-w-45">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.email_verified && (
                  <DropdownMenuItem asChild>
                    <Link to={ROUTES.ADMIN} className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4 text-charcoal-muted" />
                      {t("nav.goToApp")}
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.email_verified && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 hover:bg-red-50 focus:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to={ROUTES.LOGIN}>{t("nav.login")}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to={ROUTES.CLASSES}>{t("actions.bookClass")}</Link>
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
              <img
                src="/logo.png"
                alt="Omzone"
                className="h-7 w-auto object-contain"
              />
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
                      "block px-3 py-3 rounded-xl text-sm font-medium transition-colors duration-150",
                      isActive
                        ? "bg-sage-muted text-sage-darker"
                        : "text-charcoal hover:bg-warm-gray",
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
                {/* User info */}
                <div className="flex items-center gap-3 px-3 py-2">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="text-xs bg-sage-muted text-sage-darker font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-charcoal truncate">
                      {user.full_name || `${user.first_name} ${user.last_name}`}
                    </p>
                    <p className="text-xs text-charcoal-subtle truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <Separator className="my-1" />

                {user.email_verified && (
                  <SheetClose asChild>
                    <Link
                      to={ROUTES.ADMIN}
                      className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm text-charcoal hover:bg-warm-gray"
                    >
                      <LayoutDashboard className="w-4 h-4 text-charcoal-muted" />
                      {t("nav.goToApp")}
                    </Link>
                  </SheetClose>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <SheetClose asChild>
                  <Link to={ROUTES.LOGIN}>
                    <Button variant="outline" className="w-full">
                      {t("nav.login")}
                    </Button>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to={ROUTES.CLASSES}>
                    <Button className="w-full">{t("actions.bookClass")}</Button>
                  </Link>
                </SheetClose>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
