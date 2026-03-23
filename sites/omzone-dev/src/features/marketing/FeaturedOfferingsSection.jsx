/**
 * FeaturedOfferingsSection — full-width editorial sections for featured offerings.
 * Displays each featured offering as its own alternating section (not cards).
 */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Clock, MapPin, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useOfferings } from "@/hooks/useOfferings";
import { useCurrency } from "@/hooks/useCurrency";
import { resolveField } from "@/lib/i18n-data";
import { getPreviewUrl, getFirstImageUrl, getImageUrls } from "@/lib/media";
import { BUCKET_PUBLIC_MEDIA } from "@/env";
import { formatDuration } from "@/lib/dates";
import { offeringHref } from "@/features/offerings/OfferingCard";
import ROUTES from "@/constants/routes";
import { cn } from "@/lib/utils";

export default function FeaturedOfferingsSection() {
  const { t } = useTranslation("landing");
  const { t: tOfferings } = useTranslation("offerings");
  const { data: offerings, isLoading } = useOfferings({ showOnHome: true });

  if (!isLoading && (!offerings || offerings.length === 0)) return null;

  return (
    <section aria-labelledby="featured-offerings-heading">
      {/* Section intro */}
      <div className="bg-charcoal py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-sage font-semibold mb-4">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            {t("featured.badge", { defaultValue: "Destacados" })}
          </span>
          <h2
            id="featured-offerings-heading"
            className="font-display text-4xl md:text-5xl lg:text-6xl text-white font-semibold mb-5 text-balance leading-tight"
          >
            {t("featured.title")}
          </h2>
          <p className="text-white/60 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            {t("featured.subtitle")}
          </p>
        </div>
      </div>

      {/* Offerings as alternating full-width sections */}
      {isLoading ? (
        <div className="bg-cream py-20">
          <div className="max-w-6xl mx-auto px-4 space-y-8">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-80 w-full rounded-3xl" />
            ))}
          </div>
        </div>
      ) : (
        <div>
          {offerings.map((offering, index) => (
            <FeaturedSection
              key={offering.$id}
              offering={offering}
              index={index}
              t={tOfferings}
            />
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="bg-sage py-14 md:py-18">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-white/80 text-lg mb-6">
            {t("featured.exploreMore", {
              defaultValue: "Descubre todas nuestras experiencias",
            })}
          </p>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white/10 rounded-full px-8"
          >
            <Link to={ROUTES.SESSIONS}>
              {t("featured.cta")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ── Individual Featured Section ──────────────────────────────────────────────

function FeaturedSection({ offering, index, t }) {
  const { formatPrice } = useCurrency();
  const title = resolveField(offering, "title");
  const summary = resolveField(offering, "summary");
  const href = offeringHref(offering);

  // Get images: prefer images_json, fall back to legacy cover_image fields
  const imageUrls = getImageUrls(offering.images_json, 1400, 900, 85);
  const coverUrl =
    imageUrls.length > 0
      ? imageUrls[0]
      : offering.cover_image_id
        ? getPreviewUrl(
            offering.cover_image_id,
            offering.cover_image_bucket ?? BUCKET_PUBLIC_MEDIA,
            1400,
            900,
            85,
          )
        : null;

  // Price display
  let priceLabel = null;
  if (offering.pricing_mode === "fixed_price" && offering.base_price) {
    priceLabel = formatPrice(offering.base_price, offering.currency);
  } else if (offering.pricing_mode === "from_price" && offering.base_price) {
    priceLabel = `${t("card.from")} ${formatPrice(offering.base_price, offering.currency)}`;
  }

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
          <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-xl group">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 bg-linear-to-br from-sage via-sage-dark to-emerald-700" />
            )}
            <div className="absolute inset-0 bg-black/5 pointer-events-none" />

            {/* Category badge */}
            <span className="absolute top-5 left-5 text-[10px] uppercase tracking-[0.18em] font-semibold text-white bg-black/30 backdrop-blur-md border border-white/15 rounded-full px-4 py-2 leading-none">
              {categoryLabel}
            </span>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.22em] text-sage font-semibold">
              {categoryLabel}
            </p>

            <h3 className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal font-semibold leading-tight">
              {title}
            </h3>

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
