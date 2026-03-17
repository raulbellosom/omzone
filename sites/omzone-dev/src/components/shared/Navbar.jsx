import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, LogOut, LayoutDashboard, Globe, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { getAvatarUrl } from "@/services/appwrite/profileService";
import { useAuth } from "@/hooks/useAuth.jsx";
import ROUTES from "@/constants/routes";
import { cn } from "@/lib/utils";

const navLinks = [
  { key: "nav.classes", href: ROUTES.CLASSES },
  { key: "nav.packages", href: ROUTES.PACKAGES },
  { key: "nav.wellness", href: ROUTES.WELLNESS },
];

export default function Navbar() {
  const { t, i18n } = useTranslation("common");
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);

  const currentLang = (i18n.resolvedLanguage ?? i18n.language ?? "es").slice(
    0,
    2,
  );
  const nextLang = currentLang === "es" ? "en" : "es";
  const langLabel = currentLang === "es" ? "English" : "Español";
  const isLanding = location.pathname === ROUTES.HOME;
  const isOverlay = isLanding && isAtTop;

  useEffect(() => {
    if (!isLanding) {
      setIsAtTop(false);
      return;
    }

    const handleScroll = () => {
      setIsAtTop(window.scrollY < 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLanding]);

  async function handleLogout() {
    setMobileOpen(false);
    await logout();
    navigate(ROUTES.HOME);
  }

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()
    : "";

  const avatarUrl = user?.avatar_id ? getAvatarUrl(user.avatar_id, 64) : null;

  const logoHref = !user
    ? ROUTES.HOME
    : user.role_key === "client"
      ? ROUTES.ZONE_DASHBOARD
      : ROUTES.ADMIN;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300",
        isOverlay
          ? "border-white/10 bg-white/8 backdrop-blur-sm"
          : "border-warm-gray-dark/50 bg-white/80 backdrop-blur-xl",
      )}
      style={{ boxShadow: isOverlay ? "none" : "var(--shadow-nav)" }}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to={logoHref} className="flex shrink-0 items-center gap-2">
          <img
            src="/logo.png"
            alt="Omzone"
            className={cn(
              "h-8 w-auto object-contain transition duration-300",
              isOverlay &&
                "brightness-0 invert drop-shadow-[0_4px_18px_rgba(0,0,0,0.28)]",
            )}
          />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ key, href }) => (
            <li key={href}>
              <NavLink
                to={href}
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? isOverlay
                        ? "bg-white/14 text-white"
                        : "bg-sage-muted/50 text-sage"
                      : isOverlay
                        ? "text-white/78 hover:bg-white/10 hover:text-white"
                        : "text-charcoal-muted hover:bg-warm-gray hover:text-charcoal",
                  )
                }
              >
                {t(key)}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-2 rounded-full px-1.5 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage",
                    isOverlay
                      ? "border border-white/10 bg-white/8 focus-visible:ring-offset-0"
                      : "focus-visible:ring-offset-2",
                  )}
                  aria-label={t("nav.userMenu")}
                >
                  <span
                    className={cn(
                      "hidden text-sm font-medium lg:block",
                      isOverlay ? "text-white" : "text-charcoal",
                    )}
                  >
                    {user.first_name}
                  </span>
                  <Avatar className="h-8 w-8 transition-all hover:ring-2 hover:ring-sage/40">
                    {avatarUrl && (
                      <AvatarImage src={avatarUrl} alt={user.first_name} />
                    )}
                    <AvatarFallback className="bg-sage-muted text-xs font-semibold text-sage-darker">
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
                  <span className="block max-w-45 truncate font-normal text-charcoal-subtle">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to={ROUTES.ZONE_PROFILE}
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4 text-charcoal-muted" />
                    {t("nav.myProfile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => i18n.changeLanguage(nextLang)}
                  className="flex items-center gap-2"
                >
                  <Globe className="h-4 w-4 text-charcoal-muted" />
                  {langLabel}
                </DropdownMenuItem>
                {(user.role_key === "admin" || user.role_key === "root") && (
                  <DropdownMenuSeparator />
                )}
                {(user.role_key === "admin" || user.role_key === "root") && (
                  <DropdownMenuItem asChild>
                    <Link to={ROUTES.ADMIN} className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4 text-charcoal-muted" />
                      {t("nav.goToApp")}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 hover:bg-red-50 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => i18n.changeLanguage(nextLang)}
                className={cn(
                  "min-w-11 px-3 font-semibold tracking-wide",
                  isOverlay && "text-white hover:bg-white/10 hover:text-white",
                )}
              >
                {nextLang.toUpperCase()}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  isOverlay && "text-white hover:bg-white/10 hover:text-white",
                )}
              >
                <Link to={ROUTES.LOGIN}>{t("nav.login")}</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className={cn(
                  isOverlay &&
                    "bg-white/92 text-charcoal shadow-lg shadow-charcoal/10 hover:bg-white",
                )}
              >
                <Link to={ROUTES.CLASSES}>{t("actions.bookClass")}</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className={cn(
            "rounded-lg p-2 transition-colors md:hidden",
            isOverlay ? "hover:bg-white/10" : "hover:bg-warm-gray",
          )}
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menú"
        >
          <Menu
            className={cn("h-5 w-5", isOverlay ? "text-white" : "text-charcoal")}
          />
        </button>
      </nav>

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

          <div className="flex flex-col gap-1 px-5 py-4">
            {navLinks.map(({ key, href }) => (
              <SheetClose asChild key={href}>
                <NavLink
                  to={href}
                  className={({ isActive }) =>
                    cn(
                      "block rounded-xl px-3 py-3 text-sm font-medium transition-colors duration-150",
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
          </div>

          <Separator />

          <div className="flex flex-col gap-2 px-5 py-4">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2">
                  <Avatar className="h-9 w-9 shrink-0">
                    {avatarUrl && (
                      <AvatarImage src={avatarUrl} alt={user.first_name} />
                    )}
                    <AvatarFallback className="bg-sage-muted text-xs font-semibold text-sage-darker">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-charcoal">
                      {user.full_name || `${user.first_name} ${user.last_name}`}
                    </p>
                    <p className="truncate text-xs text-charcoal-subtle">
                      {user.email}
                    </p>
                  </div>
                </div>

                <Separator className="my-1" />

                <SheetClose asChild>
                  <Link
                    to={ROUTES.ZONE_PROFILE}
                    className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm text-charcoal hover:bg-warm-gray"
                  >
                    <User className="h-4 w-4 text-charcoal-muted" />
                    {t("nav.myProfile")}
                  </Link>
                </SheetClose>
                <button
                  onClick={() => i18n.changeLanguage(nextLang)}
                  className="flex items-center gap-2 rounded-xl px-3 py-3 text-left text-sm text-charcoal hover:bg-warm-gray"
                >
                  <Globe className="h-4 w-4 text-charcoal-muted" />
                  {langLabel}
                </button>
                {(user.role_key === "admin" || user.role_key === "root") && (
                  <SheetClose asChild>
                    <Link
                      to={ROUTES.ADMIN}
                      className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm text-charcoal hover:bg-warm-gray"
                    >
                      <LayoutDashboard className="h-4 w-4 text-charcoal-muted" />
                      {t("nav.goToApp")}
                    </Link>
                  </SheetClose>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-xl px-3 py-3 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => i18n.changeLanguage(nextLang)}
                  className="rounded-xl px-3 py-3 text-left text-sm font-semibold tracking-wide text-charcoal hover:bg-warm-gray"
                >
                  {nextLang.toUpperCase()}
                </button>
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
