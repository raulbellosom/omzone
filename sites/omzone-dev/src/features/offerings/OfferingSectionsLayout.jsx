/**
 * OfferingSectionsLayout — Full-page sections layout for category pages.
 *
 * Instead of a card grid, renders each offering as a full-width section
 * with alternating layouts. Each section acts as a mini-page with:
 * - Hero/image
 * - Title and description
 * - Price and booking CTA
 *
 * Best for: creating immersive category pages that feel like a magazine.
 */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Loader2, Clock, MapPin } from "lucide-react";
import PageMeta from "@/components/seo/PageMeta";
import { Button } from "@/components/ui/button";
import { useOfferings } from "@/hooks/useOfferings";
import { resolveField, getActiveLang } from "@/lib/i18n-data";
import { getPreviewUrl } from "@/lib/media";
import { BUCKET_PUBLIC_MEDIA } from "@/env";
import { useCurrency } from "@/hooks/useCurrency";
import { formatDuration } from "@/lib/dates";
import ROUTES from "@/constants/routes";
import { cn } from "@/lib/utils";

// Route mapping for offering CTAs
const CATEGORY_DETAIL_ROUTES = {
  wellness_studio: (slug) => ROUTES.SESSION_DETAIL(slug),
  immersion: (slug) => ROUTES.IMMERSION_DETAIL(slug),
  stay: (slug) => ROUTES.STAY_DETAIL(slug),
  service: (slug) => ROUTES.SERVICE_DETAIL(slug),
  experience: (slug) => ROUTES.EXPERIENCE_DETAIL(slug),
};

export default function OfferingSectionsLayout({
  category,
  pageKey,
  heroVariant = "dark",
}) {
  const { t } = useTranslation("offerings");
  const locale = getActiveLang();
  const { data: offerings, isLoading } = useOfferings({ category });

  return (
    <>
      <PageMeta
        title={t(`pages.${pageKey}.metaTitle`)}
        description={t(`pages.${pageKey}.metaDescription`)}
        locale={locale}
      />

      {/* Hero header */}
      <section
        className={cn(
          "relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden",
          heroVariant === "dark" ? "bg-charcoal" : "bg-cream",
        )}
      >
        {/* Decorative elements */}
        <div
          className={cn(
            "absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3",
            heroVariant === "dark" ? "bg-sage/10" : "bg-sage/20",
          )}
          aria-hidden="true"
        />
        <div
          className={cn(
            "absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3",
            heroVariant === "dark" ? "bg-amber-500/5" : "bg-amber-200/30",
          )}
          aria-hidden="true"
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1
            className={cn(
              "font-display text-5xl md:text-6xl lg:text-7xl font-semibold leading-[0.92] tracking-tight mb-6 max-w-4xl",
              heroVariant === "dark" ? "text-white" : "text-charcoal",
            )}
          >
            {t(`pages.${pageKey}.title`)}
          </h1>
          <p
            className={cn(
              "text-xl md:text-2xl leading-relaxed max-w-2xl",
              heroVariant === "dark" ? "text-white/60" : "text-charcoal-muted",
            )}
          >
            {t(`pages.${pageKey}.subtitle`)}
          </p>
        </div>
      </section>

      {/* Offerings as full sections */}
      {isLoading ? (
        <div className="flex items-center justify-center py-32 bg-cream">
          <Loader2 className="w-10 h-10 text-sage animate-spin" />
        </div>
      ) : !offerings || offerings.length === 0 ? (
        <div className="text-center py-32 bg-cream">
          <p className="text-charcoal-muted text-lg">
            {t("agenda.noUpcoming")}
          </p>
        </div>
      ) : (
        <div>
          {offerings.map((offering, index) => (
            <OfferingSection
              key={offering.$id}
              offering={offering}
              index={index}
              t={t}
            />
          ))}
        </div>
      )}

      {/* Bottom CTA section */}
      <section className="bg-sage py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl text-white font-semibold mb-4">
            {t(`pages.${pageKey}.ctaTitle`, {
              defaultValue: "¿Tienes preguntas?",
            })}
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            {t(`pages.${pageKey}.ctaSubtitle`, {
              defaultValue:
                "Estamos aquí para ayudarte a encontrar la experiencia perfecta.",
            })}
          </p>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white/10"
          >
            <Link to="/#contacto">
              {t("common.contactUs", { defaultValue: "Contactar" })}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}

// ── Individual Offering Section ──────────────────────────────────────────────

function OfferingSection({ offering, index, t }) {
  const { formatPrice } = useCurrency();
  const title = resolveField(offering, "title");
  const summary = resolveField(offering, "summary");

  const coverUrl = offering.cover_image_id
    ? getPreviewUrl(
        offering.cover_image_id,
        offering.cover_image_bucket ?? BUCKET_PUBLIC_MEDIA,
        1200,
        800,
        85,
      )
    : null;

  const getDetailRoute = CATEGORY_DETAIL_ROUTES[offering.category];
  const href = getDetailRoute
    ? getDetailRoute(offering.slug)
    : ROUTES.SESSION_DETAIL(offering.slug);

  // Price display - only show actual prices, not labels
  let priceLabel = null;
  if (offering.pricing_mode === "fixed_price" && offering.base_price) {
    priceLabel = formatPrice(offering.base_price, offering.currency);
  } else if (offering.pricing_mode === "from_price" && offering.base_price) {
    priceLabel = `${t("card.from")} ${formatPrice(offering.base_price, offering.currency)}`;
  }
  // request_quote mode: no price shown, only the CTA button from offering

  // CTA label - use offering field only, fallback to view details
  const ctaLabel = resolveField(offering, "cta_label") || t("card.viewDetails");

  const categoryLabel = t(`categories.${offering.category}`, {
    defaultValue: offering.category,
  });

  // Alternate layout direction
  const isReversed = index % 2 === 1;

  return (
    <section
      className={cn(
        "py-16 md:py-24",
        index % 2 === 0 ? "bg-cream" : "bg-white",
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center",
            isReversed && "lg:[direction:rtl] lg:*:[direction:ltr]",
          )}
        >
          {/* Image */}
          <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-xl">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 bg-linear-to-br from-sage via-sage-dark to-emerald-700" />
            )}

            {/* Category badge on image */}
            <span className="absolute top-5 left-5 text-[10px] uppercase tracking-[0.18em] font-semibold text-white bg-black/30 backdrop-blur-md border border-white/15 rounded-full px-4 py-2 leading-none">
              {categoryLabel}
            </span>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Category label */}
            <p className="text-xs uppercase tracking-[0.22em] text-sage font-semibold">
              {categoryLabel}
            </p>

            {/* Title */}
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal font-semibold leading-tight">
              {title}
            </h2>

            {/* Summary */}
            {summary && (
              <p className="text-charcoal-muted text-lg leading-relaxed">
                {summary}
              </p>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-charcoal-subtle">
              {offering.duration_min && (
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {formatDuration(offering.duration_min)}
                </span>
              )}
              {offering.location_label && (
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {offering.location_label}
                </span>
              )}
            </div>

            {/* Price + CTA */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              {priceLabel && (
                <span className="text-2xl font-bold text-charcoal">
                  {priceLabel}
                </span>
              )}
              <Button asChild size="lg" className="shadow-lg shadow-sage/20">
                <Link to={href}>
                  {ctaLabel}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
