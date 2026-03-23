/**
 * CustomerBookingsPage — historial de reservas del cliente.
 * Ruta: /account/bookings
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import CustomerPageLayout from "@/components/shared/CustomerPageLayout";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import {
  CalendarCheck,
  MapPin,
  Clock,
  X,
  CheckCircle,
  Ban,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useMyBookings, useCancelBooking } from "@/hooks/useCustomer";
import { resolveField } from "@/lib/i18n-data";
import { useCurrency } from "@/hooks/useCurrency";
import ROUTES from "@/constants/routes";
import { cn } from "@/lib/utils";

const STATUS_BADGE = {
  confirmed: "sage",
  completed: "warm",
  cancelled: "outline",
  pending: "warm",
};

const STATUS_ICON = {
  confirmed: CheckCircle,
  completed: CheckCircle,
  cancelled: Ban,
  pending: Clock,
};

function BookingCard({ booking, t, dateFnsLocale, onCancel, cancelling }) {
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const { formatPrice } = useCurrency();
  const offering = booking.offering ?? null;
  const title = resolveField(offering, "title");
  const startsAt = booking.slot?.start_at || booking.reserved_at || null;
  const locationLabel =
    booking.slot?.location_label ||
    offering?.location_label ||
    "-";
  const guestCount = booking.guest_count ?? booking.quantity ?? 1;
  const totalPrice = (booking.unit_price ?? 0) * guestCount;
  const isUpcoming = booking.status === "confirmed";
  const StatusIcon = STATUS_ICON[booking.status] ?? CheckCircle;

  async function handleCancel() {
    if (!confirmingCancel) {
      setConfirmingCancel(true);
      return;
    }
    await onCancel(booking.$id);
    setConfirmingCancel(false);
  }

  return (
    <Card className="overflow-hidden animate-fade-in">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Franja de color izquierda */}
          <div
            className={cn(
              "sm:w-1.5 h-1.5 sm:h-auto rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none shrink-0",
              booking.status === "confirmed"
                ? "bg-sage"
                : booking.status === "completed"
                  ? "bg-sand"
                  : "bg-warm-gray-dark",
            )}
          />

          <div className="flex-1 p-5">
            {/* Cabecera */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="font-semibold text-charcoal leading-tight">
                  {title || "Booking"}
                </h3>
                <p className="text-[10px] font-mono text-charcoal-subtle mt-0.5 uppercase tracking-wider">
                  {t("bookings.code")}: {booking.booking_code}
                </p>
              </div>
              <Badge
                variant={STATUS_BADGE[booking.status] ?? "outline"}
                className="text-[10px] shrink-0 flex items-center gap-1"
              >
                <StatusIcon className="w-3 h-3" />
                {t(`bookings.status.${booking.status}`)}
              </Badge>
            </div>

            {/* Detalles */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mb-4 text-sm">
              {startsAt && (
                <div className="flex items-center gap-2 text-charcoal-muted">
                  <CalendarCheck className="w-3.5 h-3.5 text-sage shrink-0" />
                  <span>
                    {format(new Date(startsAt), "d MMM, HH:mm", {
                      locale: dateFnsLocale,
                    })}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-charcoal-muted">
                <MapPin className="w-3.5 h-3.5 text-sage shrink-0" />
                <span>{locationLabel}</span>
              </div>
              {offering?.duration_min && (
                <div className="flex items-center gap-2 text-charcoal-muted">
                  <Clock className="w-3.5 h-3.5 text-sage shrink-0" />
                  <span>
                    {offering.duration_min} {t("bookings.min")}
                  </span>
                </div>
              )}
            </div>

            {/* Extras */}
            {booking.extras_json?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {booking.extras_json.map((ex) => (
                  <span
                    key={ex.product_id}
                    className="text-[10px] bg-sand/60 text-charcoal-muted px-2 py-0.5 rounded-full"
                  >
                    {ex.name} · {formatPrice(ex.price)}
                  </span>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-warm-gray-dark/30">
              <span className="text-xs text-charcoal-subtle">
                {t("bookings.total")}:{" "}
                <span className="font-semibold text-charcoal">
                  {formatPrice(totalPrice)}
                </span>
              </span>
              {isUpcoming && (
                <div className="flex gap-2">
                  {confirmingCancel ? (
                    <>
                      <span className="text-xs text-charcoal-muted self-center">
                        {t("bookings.confirmCancel")}
                      </span>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="text-xs h-7"
                      >
                        {cancelling ? (
                          t("bookings.cancelling")
                        ) : (
                          <>
                            <X className="w-3 h-3 mr-1" />
                            {t("bookings.cancel")}
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-7"
                        onClick={() => setConfirmingCancel(false)}
                      >
                        No
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
                      onClick={() => setConfirmingCancel(true)}
                    >
                      <X className="w-3 h-3 mr-1" />
                      {t("bookings.cancel")}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CustomerBookingsPage() {
  const { t, i18n } = useTranslation("customer");
  const dateFnsLocale = i18n.language === "es" ? es : enUS;
  const [tab, setTab] = useState("upcoming");

  const { data: bookings, isLoading } = useMyBookings();
  const { mutateAsync: cancelBooking, isPending: cancelling } =
    useCancelBooking();

  const upcoming = bookings?.filter((b) => b.status === "confirmed") ?? [];
  const past = bookings?.filter((b) => b.status !== "confirmed") ?? [];
  const current = tab === "upcoming" ? upcoming : past;

  async function handleCancel(bookingId) {
    try {
      await cancelBooking(bookingId);
      toast.success(t("bookings.cancelSuccess"));
    } catch {
      toast.error(t("common:errors.generic"));
    }
  }

  return (
    <CustomerPageLayout title={t("bookings.title")}>
      {/* Tabs */}
      <div className="flex gap-1 bg-warm-gray rounded-xl p-1 w-fit mb-6">
        {["upcoming", "past"].map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150",
              tab === tabKey
                ? "bg-white text-charcoal shadow-sm"
                : "text-charcoal-muted hover:text-charcoal",
            )}
          >
            {t(`bookings.${tabKey}`)}
            <span
              className={cn(
                "ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded-full",
                tab === tabKey
                  ? "bg-sage-muted text-sage"
                  : "bg-warm-gray-dark/50 text-charcoal-subtle",
              )}
            >
              {tabKey === "upcoming" ? upcoming.length : past.length}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : current.length === 0 ? (
        <div className="text-center py-16">
          <CalendarCheck className="w-10 h-10 text-charcoal-subtle mx-auto mb-4" />
          <p className="text-charcoal-muted mb-6">
            {tab === "upcoming" ? t("bookings.empty") : t("bookings.emptyPast")}
          </p>
          {tab === "upcoming" && (
            <Button asChild size="sm">
              <Link to={ROUTES.CLASSES}>{t("dashboard.bookOne")}</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4" key={tab}>
          {current.map((booking, i) => (
            <div key={booking.$id} style={{ animationDelay: `${i * 60}ms` }}>
              <BookingCard
                booking={booking}
                t={t}
                dateFnsLocale={dateFnsLocale}
                onCancel={handleCancel}
                cancelling={cancelling}
              />
            </div>
          ))}
        </div>
      )}
    </CustomerPageLayout>
  );
}
