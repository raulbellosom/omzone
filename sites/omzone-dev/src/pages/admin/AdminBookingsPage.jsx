/**
 * AdminBookingsPage — reservas de todos los clientes.
 * Ruta: /app/bookings
 */
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { CalendarCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminBookings } from "@/hooks/useAdmin";
import { useCurrency } from "@/hooks/useCurrency";
import { resolveField } from "@/lib/i18n-data";
import AdminPageHeader from "@/components/shared/AdminPageHeader";

const STATUS_BADGE = {
  confirmed: "sage",
  completed: "outline",
  cancelled: "destructive",
  pending: "default",
};

export default function AdminBookingsPage() {
  const { t, i18n } = useTranslation("admin");
  const { formatPrice } = useCurrency();
  const dateFnsLocale = i18n.language === "es" ? es : enUS;
  const { data: bookings, isLoading } = useAdminBookings();

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 animate-fade-in-up">
      <AdminPageHeader
        title={t("bookings.title")}
        subtitle={t("bookings.subtitle")}
      />
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : bookings?.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-warm-gray-dark/20">
              {bookings.map((b, idx) => (
                <li
                  key={b.$id}
                  className="flex items-center justify-between px-5 py-4 gap-3 animate-fade-in-up"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-sage-muted flex items-center justify-center shrink-0">
                      <CalendarCheck className="w-4 h-4 text-sage" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-charcoal truncate">
                        {resolveField(b.offering ?? {}, "title") ||
                          b.offering?.slug ||
                          b.booking_type ||
                          t("offerings.fallbackLabel")}
                      </p>
                      <p className="text-[10px] font-mono text-charcoal-subtle">
                        {b.booking_code}
                      </p>
                      <p className="text-xs text-charcoal-muted">
                        {b.slot?.start_at
                          ? format(
                              new Date(b.slot.start_at),
                              "d MMM yyyy · HH:mm",
                              { locale: dateFnsLocale },
                            )
                          : "—"}
                        {(b.slot?.location_label || b.offering?.location_label) &&
                          ` · ${b.slot?.location_label || b.offering?.location_label}`}
                        {b.guest_count > 1 && ` � ${t("bookings.guestCount", { count: b.guest_count })}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={STATUS_BADGE[b.status] ?? "default"}
                      className="text-[10px]"
                    >
                      {t(`bookings.status.${b.status}`)}
                    </Badge>
                    <span className="font-semibold text-charcoal text-sm hidden sm:inline">
                      {formatPrice((b.unit_price ?? 0) * (b.guest_count ?? 1))}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-10 text-center">
            <CalendarCheck className="w-10 h-10 text-charcoal-subtle mx-auto mb-3" />
            <p className="text-sm text-charcoal-muted">{t("common.noData")}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

