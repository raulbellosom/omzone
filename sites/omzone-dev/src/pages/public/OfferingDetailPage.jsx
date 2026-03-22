/**
 * OfferingDetailPage — generic detail page that adapts per category.
 *
 * Layout sections:
 *   1. Hero with cover image
 *   2. Info sidebar (price, duration, location, guests, style)
 *   3. Description (localized)
 *   4. Schedule section (for scheduled offerings) or request CTA
 *   5. Related offerings (same category)
 */
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Clock,
  MapPin,
  Users,
  ArrowRight,
  Calendar,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import PageMeta from "@/components/seo/PageMeta";
import StructuredData from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import {
  useOfferingBySlug,
  useOfferingSlots,
  useOfferings,
} from "@/hooks/useOfferings";
import { resolveField, getActiveLang } from "@/lib/i18n-data";
import { getPreviewUrl } from "@/lib/media";
import { BUCKET_PUBLIC_MEDIA, APP_BASE_URL } from "@/env";
import { useCurrency } from "@/hooks/useCurrency";
import { formatDuration, formatDateTime } from "@/lib/dates";
import { offeringHref } from "@/features/offerings/OfferingCard";
import OfferingCard from "@/features/offerings/OfferingCard";
import ROUTES from "@/constants/routes";
import { cn } from "@/lib/utils";

/** Map category → listing route for "back" link */
const CATEGORY_LISTING = {
  wellness_studio: ROUTES.SESSIONS,
  immersion: ROUTES.IMMERSIONS,
  stay: ROUTES.STAYS,
  service: ROUTES.SERVICES,
  experience: ROUTES.EXPERIENCES,
};

export default function OfferingDetailPage() {
  const { slug } = useParams();
  const { t } = useTranslation("offerings");
  const locale = getActiveLang();
  const { data: offering, isLoading } = useOfferingBySlug(slug);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-sage animate-spin" />
      </div>
    );
  }

  if (!offering) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-charcoal-muted text-lg">
          {t("search.noResults", { term: slug })}
        </p>
        <Button asChild variant="outline">
          <Link to={ROUTES.SESSIONS}>
            <ArrowLeft className="w-4 h-4" />
            {t("card.viewDetails")}
          </Link>
        </Button>
      </div>
    );
  }

  const title = resolveField(offering, "title");
  const summary = resolveField(offering, "summary");
  const description = resolveField(offering, "description");
  const backRoute =
    CATEGORY_LISTING[offering.category] ?? ROUTES.SESSIONS;

  const coverUrl = offering.cover_image_id
    ? getPreviewUrl(
        offering.cover_image_id,
        offering.cover_image_bucket ?? BUCKET_PUBLIC_MEDIA,
        1600,
        900,
        85,
      )
    : null;

  const structuredData = buildOfferingStructuredData(offering, locale);

  return (
    <>
      <PageMeta
        title={title}
        description={summary}
        locale={locale}
        ogType="product"
      />
      <StructuredData data={structuredData} />

      {/* Hero */}
      <section className="relative bg-charcoal">
        {coverUrl && (
          <img
            src={coverUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-charcoal via-charcoal/60 to-charcoal/30" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 md:pt-36 md:pb-20">
          <Link
            to={backRoute}
            className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t(`categories.${offering.category}`)}
          </Link>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white font-semibold leading-tight mb-4 max-w-3xl">
            {title}
          </h1>
          {summary && (
            <p className="text-white/60 text-lg max-w-xl">{summary}</p>
          )}
        </div>
      </section>

      {/* Body */}
      <section className="bg-cream py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-10 lg:gap-14">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-10">
              {/* Description */}
              {description && (
                <div>
                  <h2 className="text-xl font-semibold text-charcoal mb-4">
                    {t("detail.about")}
                  </h2>
                  <div className="prose prose-charcoal max-w-none text-charcoal-muted leading-relaxed whitespace-pre-line">
                    {description}
                  </div>
                </div>
              )}

              {/* Schedule — only for scheduled offerings */}
              {offering.booking_mode === "scheduled" && (
                <ScheduleSection offering={offering} t={t} locale={locale} />
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <InfoSidebar offering={offering} t={t} locale={locale} />
            </div>
          </div>

          {/* Related offerings */}
          <RelatedOfferings offering={offering} t={t} />
        </div>
      </section>
    </>
  );
}

// ── Info Sidebar ────────────────────────────────────────────────────────────

function InfoSidebar({ offering, t, locale }) {
  const { formatPrice } = useCurrency();

  const price = offering.base_price;
  const ctaLabel = resolveField(offering, "cta_label");
  const href =
    offering.booking_mode === "scheduled"
      ? null
      : offeringHref(offering);

  let priceDisplay = null;
  if (offering.pricing_mode === "fixed_price" && price) {
    priceDisplay = formatPrice(price);
  } else if (offering.pricing_mode === "from_price" && price) {
    priceDisplay = `${t("card.from")} ${formatPrice(price)}`;
  } else if (offering.pricing_mode === "request_quote") {
    priceDisplay = t("card.requestQuote");
  }

  let ctaText = ctaLabel;
  if (!ctaText) {
    switch (offering.booking_mode) {
      case "scheduled":
        ctaText = t("detail.bookNow");
        break;
      case "request_only":
        ctaText = t("detail.requestBooking");
        break;
      case "always_available":
        ctaText = t("detail.contactUs");
        break;
      case "date_range":
        ctaText = t("detail.selectDate");
        break;
      default:
        ctaText = t("detail.bookNow");
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-warm-gray-dark/30 p-6 space-y-5 sticky top-24">
      {/* Price */}
      {priceDisplay && (
        <div>
          <p className="text-xs text-charcoal-subtle uppercase tracking-widest mb-1">
            {t("detail.price")}
          </p>
          <p className="text-3xl font-bold text-charcoal">{priceDisplay}</p>
          {offering.pricing_mode === "from_price" && (
            <p className="text-xs text-charcoal-muted mt-0.5">
              {t("card.perPerson")}
            </p>
          )}
        </div>
      )}

      {/* Details list */}
      <div className="space-y-3 pt-3 border-t border-warm-gray-dark/30">
        {offering.duration_min && (
          <InfoRow
            icon={Clock}
            label={t("detail.duration")}
            value={formatDuration(offering.duration_min)}
          />
        )}
        {offering.location_label && (
          <InfoRow
            icon={MapPin}
            label={t("detail.location")}
            value={offering.location_label}
          />
        )}
        {offering.max_guests > 1 && (
          <InfoRow
            icon={Users}
            label={t("detail.guests")}
            value={`${offering.min_guests}–${offering.max_guests}`}
          />
        )}
        {offering.yoga_style && (
          <InfoRow
            icon={Calendar}
            label={t("detail.yogaStyle")}
            value={
              offering.yoga_style.charAt(0).toUpperCase() +
              offering.yoga_style.slice(1)
            }
          />
        )}
      </div>

      {/* CTA */}
      {offering.booking_mode !== "scheduled" && (
        <Button asChild size="lg" className="w-full mt-4">
          <Link to={ROUTES.BOOKING(offering.$id)}>
            {ctaText}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-charcoal-subtle shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-charcoal-subtle">{label}</p>
        <p className="text-sm font-medium text-charcoal">{value}</p>
      </div>
    </div>
  );
}

// ── Schedule Section ────────────────────────────────────────────────────────

function ScheduleSection({ offering, t, locale }) {
  const now = new Date().toISOString();
  const { data: slots, isLoading } = useOfferingSlots(offering.$id, {
    fromDate: now,
    status: "open",
  });
  const { formatPrice } = useCurrency();

  return (
    <div>
      <h2 className="text-xl font-semibold text-charcoal mb-4">
        {t("detail.schedule")}
      </h2>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-sage animate-spin" />
        </div>
      ) : !slots || slots.length === 0 ? (
        <p className="text-charcoal-muted py-6">{t("detail.noSlots")}</p>
      ) : (
        <div className="space-y-3">
          {slots.map((slot) => {
            const spotsLeft =
              slot.capacity_total > 0
                ? slot.capacity_total - slot.capacity_taken
                : null;
            const isFull = spotsLeft === 0;
            const price = slot.price_override ?? offering.base_price;

            return (
              <div
                key={slot.$id}
                className={cn(
                  "flex items-center justify-between gap-4 bg-white rounded-xl border border-warm-gray-dark/30 p-4",
                  isFull && "opacity-60",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-charcoal">
                    {formatDateTime(slot.start_at, locale)}
                  </p>
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
                <div className="shrink-0 flex items-center gap-3">
                  {price && (
                    <span className="text-sm font-bold text-sage">
                      {formatPrice(price)}
                    </span>
                  )}
                  <Button
                    asChild
                    size="sm"
                    disabled={isFull}
                    variant={isFull ? "outline" : "default"}
                  >
                    <Link to={ROUTES.BOOKING(slot.$id)}>
                      {isFull ? t("card.full") : t("detail.bookNow")}
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Related Offerings ───────────────────────────────────────────────────────

function RelatedOfferings({ offering, t }) {
  const { data: related } = useOfferings({
    category: offering.category,
    limit: 4,
  });

  const filtered = related?.filter((o) => o.$id !== offering.$id).slice(0, 3);
  if (!filtered || filtered.length === 0) return null;

  return (
    <div className="mt-16 pt-12 border-t border-warm-gray-dark/30">
      <h2 className="text-xl font-semibold text-charcoal mb-6">
        {t("detail.relatedOfferings")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((o) => (
          <OfferingCard key={o.$id} offering={o} layout="split" />
        ))}
      </div>
    </div>
  );
}

// ── Structured Data ─────────────────────────────────────────────────────────

function buildOfferingStructuredData(offering, locale) {
  const title = resolveField(offering, "title");
  const description = resolveField(offering, "description");

  return {
    "@context": "https://schema.org",
    "@type":
      offering.category === "stay" ? "LodgingBusiness" : "Event",
    name: title,
    description: description || resolveField(offering, "summary"),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode:
      "https://schema.org/OfflineEventAttendanceMode",
    location: offering.location_label
      ? { "@type": "Place", name: offering.location_label }
      : undefined,
    offers: offering.base_price
      ? {
          "@type": "Offer",
          price: offering.base_price,
          priceCurrency: offering.currency ?? "MXN",
          availability: "https://schema.org/InStock",
        }
      : undefined,
    organizer: {
      "@type": "Organization",
      name: "Omzone",
      url: APP_BASE_URL,
    },
  };
}
