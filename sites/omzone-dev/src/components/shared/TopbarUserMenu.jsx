import { useTranslation } from "react-i18next";
import { User, Globe, LogOut, LayoutDashboard } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth.jsx";
import { getAvatarUrl } from "@/services/appwrite/profileService";
import ROUTES from "@/constants/routes";

/**
 * Reusable user avatar + dropdown for topbars.
 *
 * @param {"admin"|"client"} context
 *   "admin"  → cross-area link goes to /zone (Mi área de cliente)
 *   "client" → cross-area link goes to /app  (Panel de admin), only shown for admin/root
 */
export default function TopbarUserMenu({ context = "client" }) {
  const { t, i18n } = useTranslation("common");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const currentLang = (i18n.resolvedLanguage ?? i18n.language ?? "es").slice(0, 2);
  const nextLang = currentLang === "es" ? "en" : "es";
  const langLabel = currentLang === "es" ? "English" : "Español";

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()
    : "U";

  const avatarUrl = user?.avatar_id ? getAvatarUrl(user.avatar_id, 64) : null;

  const isAdminOrRoot = user?.role_key === "admin" || user?.role_key === "root";

  const showAdminLink = context === "client" && isAdminOrRoot;
  const showClientLink = context === "admin";

  async function handleLogout() {
    await logout();
    navigate(ROUTES.HOME);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
          aria-label={t("nav.userMenu")}
        >
          <p className="hidden sm:block text-xs font-medium text-charcoal">
            {user?.first_name ?? ""}
          </p>
          <Avatar className="h-8 w-8 hover:ring-2 hover:ring-sage/40 transition-all">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={user?.first_name} />}
            <AvatarFallback className="text-xs bg-sage-muted text-sage-darker font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="leading-tight">
          <span className="block font-semibold text-charcoal">
            {user?.full_name || `${user?.first_name ?? ""} ${user?.last_name ?? ""}`}
          </span>
          <span className="block text-charcoal-subtle font-normal truncate max-w-45">
            {user?.email}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            to={context === "admin" ? ROUTES.ZONE_PROFILE : ROUTES.ZONE_PROFILE}
            className="flex items-center gap-2"
          >
            <User className="w-4 h-4 text-charcoal-muted" />
            {t("nav.myProfile")}
          </Link>
        </DropdownMenuItem>

        {showClientLink && (
          <DropdownMenuItem asChild>
            <Link to={ROUTES.ZONE_DASHBOARD} className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-charcoal-muted" />
              Mi área de cliente
            </Link>
          </DropdownMenuItem>
        )}

        {showAdminLink && (
          <DropdownMenuItem asChild>
            <Link to={ROUTES.ADMIN_DASHBOARD} className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-charcoal-muted" />
              {t("nav.adminPanel", { defaultValue: "Panel de administración" })}
            </Link>
          </DropdownMenuItem>
        )}

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
  );
}
