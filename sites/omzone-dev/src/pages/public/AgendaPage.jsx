/**
 * AgendaPage — calendar/list view of upcoming offering slots.
 * Groups slots by date, shows offering info per slot.
 */
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { parseISO, format, isToday, isTomorrow, isThisWeek } from "date-fns";
import { es, enUS } from "date-fns/locale";
import PageMeta from "@/components/seo/PageMeta";
import { Button } from "@/components/ui/button";
import { useAllUpcomingSlots } from "@/hooks/useOfferings";
import { offeringHref } from "@/features/offerings/OfferingCard";
import { resolveField, getActiveLang } from "@/lib/i18n-data";
import { formatTime, formatDuration } from "@/lib/dates";
import { useCurrency } from "@/hooks/useCurrency";
import { cn } from "@/lib/utils";

const CATEGORY_FILTER_OPTIONS = [
  "all",
  "wellness_studio",
  "immersion",
  "stay",
  "service",
  "experience",
];

export default function AgendaPage() {
  const { t } = useTranslation("offerings");
  const locale = getActiveLang();
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: slots, isLoading } = useAllUpcomingSlots(
    categoryFilter !== "all" ? { category: categoryFilter } : {},
  );

  // Group slots by date
  const grouped = useMemo(() => {
    if (!slots) return [];
    const map = new Map();
    for (const slot of slots) {
      const dateKey = slot.start_at
        ? format(parseISO(slot.start_at), "yyyy-MM-dd")
        : "unknown";
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey).push(slot);
    }
    return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
  }, [slots]);

  return (
    <>
      <PageMeta
        title={t("agenda.title") + " | Omzone"}
        description={t("agenda.subtitle")}
        locale={locale}
      />

      {/* Hero */}
      <section className="bg-charcoal pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white font-semibold leading-tight mb-4">
            {t("agenda.title")}
          </h1>
          <p className="text-white/55 text-lg max-w-xl">
            {t("agenda.subtitle")}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-cream py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORY_FILTER_OPTIONS.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  categoryFilter === cat
                    ? "bg-sage text-white shadow-sm"
                    : "bg-warm-gray text-charcoal-muted hover:bg-warm-gray-dark/20 hover:text-charcoal",
                )}
              >
                {t(`categories.${cat}`)}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-sage animate-spin" />
            </div>
          ) : grouped.length === 0 ? (
            <div className="text-center py-20">
              <Calendar
                className="w-12 h-12 text-charcoal-subtle mx-auto mb-4"
                aria-hidden="true"
              />
              <p className="text-charcoal-muted text-lg">
                {t("agenda.noUpcoming")}
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {grouped.map(({ date, items }) => (
                <DateGroup
                  key={date}
                  date={date}
                  slots={items}
                  locale={locale}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function DateGroup({ date, slots, locale, t }) {
  const parsed = parseISO(date);
  const dateFnsLocale = locale === "en" ? enUS : es;

  let label;
  if (isToday(parsed)) label = t("agenda.today");
  else if (isTomorrow(parsed)) label = t("agenda.tomorrow");
  else label = format(parsed, "EEEE d 'de' MMMM", { locale: dateFnsLocale });

  return (
    <div>
      <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-widest mb-4">
        {label}
      </h2>
      <div className="space-y-3">
        {slots.map((slot) => (
          <SlotRow key={slot.$id} slot={slot} locale={locale} />
        ))}
      </div>
    </div>
  );
}

function SlotRow({ slot, locale }) {
  const { t } = useTranslation("offerings");
  const { formatPrice } = useCurrency();
  const offering = slot.offering;
  if (!offering) return null;

  const title = resolveField(offering, "title");
  const href = offeringHref(offering);
  const spotsLeft =
    slot.capacity_total > 0
      ? slot.capacity_total - slot.capacity_taken
      : null;
  const price = slot.price_override ?? offering.base_price;
  const categoryLabel = t(`categories.${offering.category}`);

  return (
    <div className="flex items-center gap-4 bg-white rounded-2xl border border-warm-gray-dark/30 p-4 hover:shadow-md transition-shadow">
      {/* Time */}
      <div className="shrink-0 w-16 text-center">
        <p className="text-lg font-bold text-charcoal leading-none">
          {formatTime(slot.start_at, locale)}
        </p>
        {offering.duration_min && (
          <p className="text-xs text-charcoal-muted mt-1">
            {formatDuration(offering.duration_min)}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-12 bg-warm-gray-dark/30 shrink-0" />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-sage bg-sage/10 rounded-full px-2 py-0.5 leading-none">
            {categoryLabel}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-charcoal truncate">
          {title}
        </h3>
        <div className="flex items-center gap-3 mt-1 text-xs text-charcoal-muted">
          {(slot.location_label || offering.location_label) && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {slot.location_label || offering.location_label}
            </span>
          )}
          {spotsLeft !== null && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {t("detail.spotsAvailable", {
                available: spotsLeft,
                total: slot.capacity_total,
              })}
            </span>
          )}
        </div>
      </div>

      {/* Price + CTA */}
      <div className="shrink-0 text-right flex flex-col items-end gap-2">
        {price && (
          <span className="text-sm font-bold text-sage">
            {formatPrice(price, offering.currency)}
          </span>
        )}
        <Button asChild size="sm" variant="outline" className="text-xs">
          <Link to={href}>
            {t("card.book")}
            <ArrowRight className="w-3 h-3" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
