/**
 * ClientBottomNav — bottom tab bar for authenticated client mobile experience.
 *
 * Tabs:  Home | Clases | Paquetes | Wellness
 * Visible only on small screens (md:hidden).
 */
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, BookOpen, Package, Leaf } from "lucide-react";
import ROUTES from "@/constants/routes";
import { cn } from "@/lib/utils";

const items = [
  { icon: Home, key: "nav.home", href: ROUTES.ZONE },
  { icon: BookOpen, key: "nav.classes", href: ROUTES.CLASSES },
  { icon: Package, key: "nav.packages", href: ROUTES.PACKAGES },
  { icon: Leaf, key: "nav.wellness", href: ROUTES.WELLNESS },
];

export default function ClientBottomNav() {
  const { t } = useTranslation("common");
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-warm-gray-dark/50 safe-area-bottom">
      <ul className="flex">
        {items.map(({ icon: Icon, key, href }) => {
          const isActive =
            href === ROUTES.ZONE
              ? location.pathname === ROUTES.ZONE ||
                location.pathname === ROUTES.ZONE_DASHBOARD
              : location.pathname.startsWith(href);

          return (
            <li key={href} className="flex-1">
              <NavLink
                to={href}
                className="relative flex flex-col items-center gap-0.5 py-2.5 px-1 text-[10px] font-medium transition-colors duration-150"
              >
                {/* Active indicator */}
                <span
                  className={cn(
                    "absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-sage",
                    "transition-[width,opacity] duration-300",
                    isActive ? "w-5 opacity-100" : "w-0 opacity-0",
                  )}
                />
                <Icon
                  className={cn(
                    "w-5 h-5 transition-all duration-200",
                    isActive
                      ? "text-sage scale-110"
                      : "text-charcoal-subtle scale-100",
                  )}
                />
                <span
                  className={isActive ? "text-sage" : "text-charcoal-subtle"}
                >
                  {t(key, { defaultValue: key })}
                </span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
