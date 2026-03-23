/**
 * AdminDashboardPage — resumen KPI + listas recientes.
 * Ruta: /app
 */
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import {
  TrendingUp,
  CalendarCheck,
  Users,
  Award,
  ShoppingBag,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminOverview,
  useAdminOrders,
  useAdminLeads,
  useAdminSlots,
  useAdminOfferings,
} from "@/hooks/useAdmin";
import { useCurrency } from "@/hooks/useCurrency";
import { resolveField } from "@/lib/i18n-data";
import AdminPageHeader from "@/components/shared/AdminPageHeader";
import ROUTES from "@/constants/routes";

function KpiCard({ icon: Icon, label, value, loading, accent = "sage" }) {
  const colors = {
    sage: "bg-sage-muted text-sage",
    olive: "bg-olive-light/30 text-olive",
    charcoal: "bg-sand text-charcoal",
  };
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors[accent] ?? colors.sage}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          {loading ? (
            <>
              <Skeleton className="h-5 w-20 mb-1" />
              <Skeleton className="h-3.5 w-28" />
            </>
          ) : (
            <>
              <p className="font-bold text-charcoal font-display leading-tight">
                {value}
              </p>
              <p className="text-xs text-charcoal-muted mt-0.5">{label}</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const STATUS_COLORS = {
  new: "default",
  read: "outline",
  archived: "sage",
};

const PAYMENT_COLORS = {
  paid: "sage",
  pending: "default",
  failed: "destructive",
  refunded: "outline",
};

export default function AdminDashboardPage() {
  const { t, i18n } = useTranslation("admin");
  const { formatPrice } = useCurrency();
  const dateFnsLocale = i18n.language === "es" ? es : enUS;

  const { data: metrics, isLoading: lMetrics } = useAdminOverview();
  const { data: orders, isLoading: lOrders } = useAdminOrders();
  const { data: leads, isLoading: lLeads } = useAdminLeads();
  const { data: slots, isLoading: lSlots } = useAdminSlots({ status: "open" });
  const { data: offerings = [] } = useAdminOfferings();

  const recentOrders = orders?.slice(0, 4) ?? [];
  const recentLeads = leads?.slice(0, 4) ?? [];
  const offeringMap = Object.fromEntries(offerings.map((o) => [o.$id, o]));
  const upcomingSlots =
    slots?.filter((slot) => slot.status !== "cancelled").slice(0, 4) ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 animate-fade-in-up">
      <AdminPageHeader
        title={t("dashboard.title")}
        subtitle={t("dashboard.subtitle")}
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <KpiCard
          icon={TrendingUp}
          label={t("dashboard.metrics.salesToday")}
          value={metrics?.sales_today ?? "—"}
          loading={lMetrics}
          accent="sage"
        />
        <KpiCard
          icon={CalendarCheck}
          label={t("dashboard.metrics.bookingsToday")}
          value={metrics?.bookings_today ?? "—"}
          loading={lMetrics}
          accent="sage"
        />
        <KpiCard
          icon={Users}
          label={t("dashboard.metrics.newCustomers")}
          value={metrics?.new_customers ?? "—"}
          loading={lMetrics}
          accent="olive"
        />
        <KpiCard
          icon={Award}
          label={t("dashboard.metrics.activePackages")}
          value={metrics?.active_offerings ?? metrics?.active_packages ?? "—"}
          loading={lMetrics}
          accent="olive"
        />
        <KpiCard
          icon={ShoppingBag}
          label={t("dashboard.metrics.revenue")}
          value={metrics ? formatPrice(metrics.revenue_month) : "—"}
          loading={lMetrics}
          accent="charcoal"
        />
        <KpiCard
          icon={Zap}
          label={t("dashboard.metrics.revenueToday")}
          value={metrics ? formatPrice(metrics.revenue_today) : "—"}
          loading={lMetrics}
          accent="charcoal"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Recent orders */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-charcoal text-sm">
              {t("dashboard.recentOrders")}
            </h2>
            <Link
              to={ROUTES.ADMIN_ORDERS}
              className="text-xs text-sage hover:underline font-medium flex items-center gap-1"
            >
              {t("dashboard.viewAll")} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {lOrders ? (
            <Skeleton className="h-48 rounded-2xl" />
          ) : (
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y divide-warm-gray-dark/20">
                  {recentOrders.map((o) => (
                    <li
                      key={o.$id}
                      className="flex items-center justify-between px-5 py-3.5 gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-[10px] font-mono text-charcoal-subtle">
                          {o.order_no}
                        </p>
                        <p className="text-sm text-charcoal font-medium truncate">
                          {o.customer_email}
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        <Badge
                          variant={
                            PAYMENT_COLORS[o.payment_status] ?? "default"
                          }
                          className="text-[10px]"
                        >
                          {t(`orders.paymentStatus.${o.payment_status}`)}
                        </Badge>
                        <span className="font-semibold text-charcoal text-sm">
                          {formatPrice(o.grand_total)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Recent messages */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-charcoal text-sm">
              {t("dashboard.recentMessages")}
            </h2>
            <Link
              to={ROUTES.ADMIN_LEADS}
              className="text-xs text-sage hover:underline font-medium flex items-center gap-1"
            >
              {t("dashboard.viewAll")} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {lLeads ? (
            <Skeleton className="h-48 rounded-2xl" />
          ) : (
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y divide-warm-gray-dark/20">
                  {recentLeads.map((l) => (
                    <li
                      key={l.$id}
                      className="flex items-center justify-between px-5 py-3.5 gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-charcoal font-medium truncate">
                          {l.full_name}
                        </p>
                        <p className="text-[10px] text-charcoal-muted">
                          {l.subject || l.email}
                        </p>
                      </div>
                      <Badge
                        variant={STATUS_COLORS[l.status] ?? "default"}
                        className="text-[10px] shrink-0"
                      >
                        {t(`messages.status.${l.status}`)}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </section>
      </div>

      {/* Upcoming sessions */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-charcoal text-sm">
            {t("dashboard.upcomingSessions")}
          </h2>
          <Link
            to={ROUTES.ADMIN_AGENDA}
            className="text-xs text-sage hover:underline font-medium flex items-center gap-1"
          >
            {t("dashboard.viewAll")} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {lSlots ? (
          <Skeleton className="h-32 rounded-2xl" />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {upcomingSlots.map((slot) => {
              const offering = offeringMap[slot.offering_id] ?? null;
              const pct = Math.round(
                slot.capacity_total > 0
                  ? (slot.capacity_taken / slot.capacity_total) * 100
                  : 0,
              );
              return (
                <Card key={slot.$id}>
                  <CardContent className="p-4">
                    <p className="text-sm font-semibold text-charcoal leading-tight mb-1">
                      {resolveField(offering, "title") ||
                        offering?.slug ||
                        t("offerings.fallbackLabel")}
                    </p>
                    <p className="text-[10px] text-charcoal-muted mb-3">
                      {format(new Date(slot.start_at), "EEE d MMM · HH:mm", {
                        locale: dateFnsLocale,
                      })}
                    </p>
                    <div className="w-full h-1.5 bg-warm-gray rounded-full overflow-hidden mb-1">
                      <div
                        className={`h-full rounded-full transition-[width] duration-500 ${pct >= 90 ? "bg-amber-400" : "bg-sage"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-charcoal-muted">
                      {slot.capacity_taken}/{slot.capacity_total}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
