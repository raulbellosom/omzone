import { NavLink, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  CalendarCheck,
  ShoppingBag,
  User,
  ChevronLeft,
  ArrowLeft,
  BookOpen,
  Package,
  Leaf,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import ROUTES from "@/constants/routes";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";
import { useState } from "react";

/** Discovery section — commercial offering */
const DISCOVER_ITEMS = [
  { to: ROUTES.CLASSES, icon: BookOpen, key: "nav.classes" },
  { to: ROUTES.PACKAGES, icon: Package, key: "nav.packages" },
  { to: ROUTES.WELLNESS, icon: Leaf, key: "nav.wellness" },
];

/** Personal area section */
const ZONE_ITEMS = [
  {
    to: ROUTES.ZONE_DASHBOARD,
    icon: LayoutDashboard,
    key: "nav.dashboard",
    exact: true,
  },
  { to: ROUTES.ZONE_BOOKINGS, icon: CalendarCheck, key: "nav.bookings" },
  { to: ROUTES.ZONE_ORDERS, icon: ShoppingBag, key: "nav.orders" },
  { to: ROUTES.ZONE_PROFILE, icon: User, key: "nav.profile" },
];

function NavItem({ to, icon: Icon, label, exact = false, onClick, collapsed }) {
  return (
    <li>
      <NavLink
        to={to}
        end={exact}
        onClick={onClick}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium",
            "transition-colors duration-150",
            isActive
              ? "bg-sage-muted/70 text-sage-darker"
              : "text-charcoal-muted hover:bg-warm-gray hover:text-charcoal",
          )
        }
        title={collapsed ? label : undefined}
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
                collapsed ? "max-w-0 opacity-0" : "max-w-40 opacity-100",
              )}
            >
              {label}
            </span>
          </>
        )}
      </NavLink>
    </li>
  );
}

function SectionLabel({ label, collapsed }) {
  if (collapsed)
    return <li className="my-2 border-t border-warm-gray-dark/40" />;
  return (
    <li className="pt-4 pb-1 px-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-charcoal-subtle">
        {label}
      </span>
    </li>
  );
}

/** Shared nav list — used in both desktop sidebar and mobile sheet */
function SidebarNavList({ t, onNavigate, collapsed = false }) {
  return (
    <ul className="space-y-0.5">
      <SectionLabel label={t("nav.section.discover")} collapsed={collapsed} />
      {DISCOVER_ITEMS.map(({ to, icon, key }) => (
        <NavItem
          key={to}
          to={to}
          icon={icon}
          label={t(key)}
          onClick={onNavigate}
          collapsed={collapsed}
        />
      ))}

      <SectionLabel label={t("nav.section.myzone")} collapsed={collapsed} />
      {ZONE_ITEMS.map(({ to, icon, key, exact }) => (
        <NavItem
          key={to}
          to={to}
          icon={icon}
          label={t(key)}
          exact={exact}
          onClick={onNavigate}
          collapsed={collapsed}
        />
      ))}
    </ul>
  );
}

export default function CustomerSideNav({ mobileOpen = false, onMobileClose }) {
  const { t } = useTranslation("customer");
  const [collapsed, setCollapsed] = useState(false);
  const sidebar = useSidebar();
  const filterPanel = sidebar?.filterPanel;

  // When a filter panel is injected, always show expanded
  const isFilterMode = !!filterPanel;

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-white border-r border-warm-gray-dark/60 shrink-0 overflow-hidden",
          "transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          collapsed && !isFilterMode ? "w-16" : "w-56",
        )}
      >
        {/* Logo + toggle */}
        <div className="h-16 flex items-center justify-between px-3 border-b border-warm-gray-dark/60 shrink-0">
          <div
            className={cn(
              "overflow-hidden transition-[opacity,max-width] duration-200",
              collapsed && !isFilterMode
                ? "max-w-0 opacity-0"
                : "max-w-35 opacity-100",
            )}
          >
            <Link
              to={ROUTES.ZONE_DASHBOARD}
              tabIndex={collapsed && !isFilterMode ? -1 : 0}
            >
              <img
                src="/logo.png"
                alt="Omzone"
                className="h-7 w-auto object-contain"
              />
            </Link>
          </div>
          {isFilterMode ? (
            <button
              onClick={() => sidebar.clearFilter()}
              className="p-1.5 rounded-lg hover:bg-warm-gray transition-colors text-charcoal-muted ml-auto shrink-0"
              aria-label="Volver a navegación"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
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
          )}
        </div>

        {/* Content: filter panel or nav */}
        {isFilterMode ? (
          <div className="flex-1 overflow-y-auto px-3 py-4">{filterPanel}</div>
        ) : (
          <nav className="flex-1 overflow-y-auto py-3 px-2">
            <SidebarNavList t={t} collapsed={collapsed} />
          </nav>
        )}
      </aside>

      {/* ── Mobile sidebar sheet ─────────────────────────────────────── */}
      <Sheet
        open={mobileOpen}
        onOpenChange={(open) => !open && onMobileClose?.()}
      >
        <SheetContent side="left" className="w-64 p-0 flex flex-col">
          <SheetHeader className="h-16 flex-row items-center px-4 border-b border-warm-gray-dark/60 shrink-0 space-y-0">
            <SheetTitle asChild>
              <Link to={ROUTES.ZONE_DASHBOARD} onClick={onMobileClose}>
                <img
                  src="/logo.png"
                  alt="Omzone"
                  className="h-7 w-auto object-contain"
                />
              </Link>
            </SheetTitle>
            <SheetDescription className="sr-only">
              Menú de navegación del área de cliente.
            </SheetDescription>
          </SheetHeader>
          <nav className="flex-1 overflow-y-auto py-3 px-2">
            <SidebarNavList t={t} onNavigate={onMobileClose} />
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
