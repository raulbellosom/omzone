import { NavLink, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  MessageSquare,
  UserCheck,
  Sparkles,
  CalendarDays,
  FileText,
  ShoppingCart,
  BookMarked,
  QrCode,
  Images,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth.jsx";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import ROUTES from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { icon: LayoutDashboard, key: "nav.dashboard", href: ROUTES.ADMIN_DASHBOARD },
  { icon: MessageSquare, key: "nav.messages", href: ROUTES.ADMIN_LEADS },
  { icon: UserCheck, key: "nav.customers", href: ROUTES.ADMIN_CLIENTS },
  null, // separator
  { icon: Sparkles, key: "nav.offerings", href: ROUTES.ADMIN_OFFERINGS },
  { icon: CalendarDays, key: "nav.agenda", href: ROUTES.ADMIN_AGENDA },
  { icon: FileText, key: "nav.content", href: ROUTES.ADMIN_CONTENT },
  null,
  { icon: ShoppingCart, key: "nav.orders", href: ROUTES.ADMIN_ORDERS },
  { icon: BookMarked, key: "nav.bookings", href: ROUTES.ADMIN_BOOKINGS },
  { icon: QrCode, key: "nav.passes", href: ROUTES.ADMIN_PASSES },
  null,
  {
    icon: Images,
    key: "nav.stockImages",
    href: ROUTES.ADMIN_STOCK_IMAGES,
    rootOnly: true,
  },
  {
    icon: Settings,
    key: "nav.settings",
    href: ROUTES.ADMIN_SETTINGS,
    rootOnly: true,
  },
];

/** Shared nav list used in both desktop sidebar and mobile sheet */
function SidebarNavList({ t, onNavigate, visibleItems }) {
  return (
    <ul className="space-y-0.5">
      {visibleItems.map((item, idx) => {
        if (item === null) {
          return (
            <li
              key={`sep-${idx}`}
              className="my-2 border-t border-warm-gray-dark/40"
            />
          );
        }
        const { icon: Icon, key, href } = item;
        return (
          <li key={href}>
            <NavLink
              to={href}
              end={href === ROUTES.ADMIN_DASHBOARD}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium",
                  "transition-colors duration-150",
                  isActive
                    ? "bg-sage-muted/70 text-sage-darker"
                    : "text-charcoal-muted hover:bg-warm-gray hover:text-charcoal",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-transform duration-200",
                      isActive && "scale-110",
                    )}
                  />
                  <span className="leading-none">{t(key)}</span>
                </>
              )}
            </NavLink>
          </li>
        );
      })}
    </ul>
  );
}

export default function AdminSidebar({ mobileOpen = false, onMobileClose }) {
  const { t } = useTranslation("admin");
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isRoot = user?.role_key === "root";
  const visibleNavItems = navItems.filter(
    (item) => item === null || !item.rootOnly || isRoot,
  );

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-white border-r border-warm-gray-dark/60 shrink-0 overflow-hidden",
          "transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          collapsed ? "w-16" : "w-56",
        )}
      >
        {/* Logo + toggle */}
        <div className="h-16 flex items-center justify-between px-3 border-b border-warm-gray-dark/60 shrink-0">
          <div
            className={cn(
              "overflow-hidden transition-[opacity,max-width] duration-200",
              collapsed ? "max-w-0 opacity-0" : "max-w-35 opacity-100",
            )}
          >
            <Link to={ROUTES.ADMIN_DASHBOARD} tabIndex={collapsed ? -1 : 0}>
              <img
                src="/logo.png"
                alt="Omzone"
                className="h-7 w-auto object-contain"
              />
            </Link>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-warm-gray transition-colors text-charcoal-muted ml-auto shrink-0"
            aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          >
            <ChevronLeft
              className={cn(
                "w-4 h-4 transition-transform duration-300",
                collapsed && "rotate-180",
              )}
            />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <ul className="space-y-0.5">
            {visibleNavItems.map((item, idx) => {
              if (item === null) {
                return (
                  <li
                    key={`sep-${idx}`}
                    className="my-2 border-t border-warm-gray-dark/40"
                  />
                );
              }
              const { icon: Icon, key, href } = item;
              return (
                <li key={href}>
                  <NavLink
                    to={href}
                    end={href === ROUTES.ADMIN_DASHBOARD}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium",
                        "transition-colors duration-150",
                        isActive
                          ? "bg-sage-muted/70 text-sage-darker"
                          : "text-charcoal-muted hover:bg-warm-gray hover:text-charcoal",
                      )
                    }
                    title={collapsed ? t(key) : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={cn(
                            "w-4 h-4 shrink-0 transition-transform duration-200",
                            isActive && "scale-110",
                          )}
                        />
                        <span
                          className={cn(
                            "overflow-hidden whitespace-nowrap leading-none",
                            "transition-[opacity,max-width] duration-200",
                            collapsed
                              ? "max-w-0 opacity-0"
                              : "max-w-30 opacity-100",
                          )}
                        >
                          {t(key)}
                        </span>
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* ── Mobile sidebar sheet ─────────────────────────────────────── */}
      <Sheet
        open={mobileOpen}
        onOpenChange={(open) => !open && onMobileClose?.()}
      >
        <SheetContent side="left" className="w-64 p-0 flex flex-col">
          <SheetHeader className="h-16 flex-row items-center px-4 border-b border-warm-gray-dark/60 shrink-0 space-y-0">
            <SheetTitle asChild>
              <Link to={ROUTES.ADMIN_DASHBOARD} onClick={onMobileClose}>
                <img
                  src="/logo.png"
                  alt="Omzone"
                  className="h-7 w-auto object-contain"
                />
              </Link>
            </SheetTitle>
            <SheetDescription className="sr-only">
              Menú de navegación del panel de administración.
            </SheetDescription>
          </SheetHeader>
          <nav className="flex-1 overflow-y-auto py-3 px-2">
            <SidebarNavList
              t={t}
              onNavigate={onMobileClose}
              visibleItems={visibleNavItems}
            />
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
