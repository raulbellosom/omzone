/**
 * ClientNavbar — top navigation for authenticated client experience.
 *
 * Desktop: logo + search bar inline + notification bell + user dropdown (zone links).
 *          Hamburger hidden on desktop.
 * Mobile:  logo + search icon (opens SearchModal) + hamburger (opens filter sheet).
 */
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  Bell,
  Menu,
  User,
  CalendarCheck,
  ShoppingBag,
  LayoutDashboard,
  Globe,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { getAvatarUrl } from "@/services/appwrite/profileService";
import { useAuth } from "@/hooks/useAuth.jsx";
import ROUTES from "@/constants/routes";
import { cn } from "@/lib/utils";
import SearchModal from "@/components/shared/SearchModal";

const ZONE_LINKS = [
  { icon: LayoutDashboard, key: "nav.dashboard", href: ROUTES.ZONE_DASHBOARD },
  { icon: CalendarCheck, key: "nav.bookings", href: ROUTES.ZONE_BOOKINGS },
  { icon: ShoppingBag, key: "nav.orders", href: ROUTES.ZONE_ORDERS },
  { icon: User, key: "nav.profile", href: ROUTES.ZONE_PROFILE },
];

export default function ClientNavbar({ onMenuClick }) {
  const { t, i18n } = useTranslation("common");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  const currentLang = (i18n.resolvedLanguage ?? i18n.language ?? "es").slice(
    0,
    2,
  );
  const nextLang = currentLang === "es" ? "en" : "es";
  const langLabel = currentLang === "es" ? "English" : "Español";

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()
    : "U";
  const avatarUrl = user?.avatar_id ? getAvatarUrl(user.avatar_id, 64) : null;
  const isAdminOrRoot = user?.role_key === "admin" || user?.role_key === "root";

  async function handleLogout() {
    await logout();
    navigate(ROUTES.HOME);
  }

  return (
    <>
      <header
        className="sticky top-0 z-40 border-b border-warm-gray-dark/50 bg-white/80 backdrop-blur-xl"
        style={{ boxShadow: "var(--shadow-nav)" }}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 lg:px-6">
          {/* Left: hamburger (mobile) + logo */}
          <div className="flex items-center gap-2">
            <button
              className="p-2 -ml-1 rounded-lg hover:bg-warm-gray transition-colors text-charcoal-muted lg:hidden"
              onClick={onMenuClick}
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link
              to={ROUTES.ZONE_DASHBOARD}
              className="flex shrink-0 items-center"
            >
              <img
                src="/logo.png"
                alt="Omzone"
                className="h-8 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Center: search bar — desktop only */}
          <div className="hidden md:block relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-subtle pointer-events-none" />
            <Input
              className="pl-9 h-9 bg-warm-gray border-transparent focus:bg-white rounded-full"
              placeholder={t("actions.search")}
              onClick={() => setSearchOpen(true)}
              readOnly
            />
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1.5">
            {/* Search icon — mobile only */}
            <button
              className="p-2 rounded-lg hover:bg-warm-gray transition-colors text-charcoal-muted md:hidden"
              onClick={() => setSearchOpen(true)}
              aria-label={t("actions.search")}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notification bell */}
            <button className="p-2 rounded-lg hover:bg-warm-gray transition-colors text-charcoal-muted relative">
              <Bell className="w-[18px] h-[18px]" />
            </button>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-full px-1.5 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
                  aria-label={t("nav.userMenu")}
                >
                  <span className="hidden lg:block text-sm font-medium text-charcoal">
                    {user?.first_name}
                  </span>
                  <Avatar className="h-8 w-8 hover:ring-2 hover:ring-sage/40 transition-all">
                    {avatarUrl && (
                      <AvatarImage src={avatarUrl} alt={user?.first_name} />
                    )}
                    <AvatarFallback className="bg-sage-muted text-xs font-semibold text-sage-darker">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="leading-tight">
                  <span className="block font-semibold text-charcoal">
                    {user?.full_name ||
                      `${user?.first_name ?? ""} ${user?.last_name ?? ""}`}
                  </span>
                  <span className="block text-charcoal-subtle font-normal truncate max-w-48 text-xs">
                    {user?.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Zone links */}
                {ZONE_LINKS.map(({ icon: Icon, key, href }) => (
                  <DropdownMenuItem key={href} asChild>
                    <Link to={href} className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-charcoal-muted" />
                      {t(key, { defaultValue: key })}
                    </Link>
                  </DropdownMenuItem>
                ))}

                {/* Admin panel link */}
                {isAdminOrRoot && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        to={ROUTES.ADMIN}
                        className="flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4 text-charcoal-muted" />
                        {t("nav.adminPanel", { defaultValue: "Panel admin" })}
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => i18n.changeLanguage(nextLang)}
                  className="flex items-center gap-2"
                >
                  <Globe className="w-4 h-4 text-charcoal-muted" />
                  {langLabel}
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 hover:bg-red-50 focus:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </header>

      {/* Search modal (mobile + desktop click) */}
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
