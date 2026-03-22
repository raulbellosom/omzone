/**
 * FeaturedOfferingsSection — editorial blocks for featured offerings.
 * Replaces FeaturedClassesSection with the unified offerings model.
 */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useOfferings } from "@/hooks/useOfferings";
import { resolveField } from "@/lib/i18n-data";
import { getPreviewUrl } from "@/lib/media";
import { BUCKET_PUBLIC_MEDIA } from "@/env";
import { formatDuration } from "@/lib/dates";
import { offeringHref } from "@/features/offerings/OfferingCard";
import ROUTES from "@/constants/routes";
import { cn } from "@/lib/utils";

const CATEGORY_GRADIENT = {
  wellness_studio: "from-teal-900 via-teal-800 to-emerald-900",
  immersion: "from-indigo-950 via-violet-900 to-slate-900",
  stay: "from-amber-900 via-orange-900 to-stone-900",
  service: "from-rose-900 via-pink-900 to-stone-900",
  experience: "from-sky-900 via-cyan-800 to-slate-900",
};

export default function FeaturedOfferingsSection() {
  const { t } = useTranslation("landing");
  const { data: offerings, isLoading } = useOfferings({ showOnHome: true });

  if (!isLoading && (!offerings || offerings.length === 0)) return null;

  return (
    <section
      aria-labelledby="featured-offerings-heading"
      className="bg-cream py-20 md:py-28"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div className="max-w-lg">
            <h2
              id="featured-offerings-heading"
              className="font-display text-3xl md:text-4xl text-charcoal font-semibold mb-3 text-balance"
            >
              {t("featured.title")}
            </h2>
            <p className="text-charcoal-muted leading-relaxed">
              {t("featured.subtitle")}
            </p>
          </div>
          <Link
            to={ROUTES.SESSIONS}
            className="inline-flex items-center gap-2 text-sm text-charcoal-muted hover:text-charcoal border border-warm-gray-dark/40 hover:border-charcoal/30 rounded-full px-5 py-2.5 transition-colors shrink-0 self-start sm:self-auto"
          >
            {t("featured.cta")}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Editorial blocks */}
        {isLoading ? (
          <div className="space-y-8">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-105 w-full rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {offerings.map((offering) => (
              <FeaturedBlock key={offering.$id} offering={offering} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FeaturedBlock({ offering }) {
  const { t } = useTranslation("offerings");
  const title = resolveField(offering, "title");
  const summary = resolveField(offering, "summary");
  const categoryLabel = t(`categories.${offering.category}`);
  const href = offeringHref(offering);

  const gradient =
    CATEGORY_GRADIENT[offering.category] ?? CATEGORY_GRADIENT.wellness_studio;

  const imgUrl = offering.cover_image_id
    ? getPreviewUrl(
        offering.cover_image_id,
        offering.cover_image_bucket ?? BUCKET_PUBLIC_MEDIA,
        1200,
        800,
        85,
      )
    : null;

  return (
    <article className="group grid grid-cols-1 md:grid-cols-[3fr_2fr] min-h-105 md:min-h-120 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500">
      {/* Image */}
      <div
        className="relative block overflow-hidden min-h-65 md:min-h-0"
        aria-hidden="true"
      >
        {imgUrl ? (
          <img
            src={imgUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className={cn("absolute inset-0 bg-linear-to-br", gradient)} />
        )}
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        <span className="absolute top-5 left-5 text-[10px] uppercase tracking-[0.18em] font-semibold text-white bg-black/30 backdrop-blur-md border border-white/15 rounded-full px-3 py-1.5 leading-none pointer-events-none">
          {categoryLabel}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center bg-white px-8 py-10 md:px-10 md:py-12">
        <p className="text-xs uppercase tracking-[0.22em] text-sage font-semibold mb-4">
          {categoryLabel}
        </p>

        <Link to={href} className="block mb-4">
          <h3 className="font-display text-2xl md:text-3xl lg:text-4xl text-charcoal font-bold leading-tight group-hover:text-sage transition-colors duration-300">
            {title}
          </h3>
        </Link>

        {summary && (
          <p className="text-charcoal-muted leading-relaxed mb-6 line-clamp-3 text-sm md:text-base">
            {summary}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-charcoal-subtle mb-8">
          {offering.duration_min && (
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
              {formatDuration(offering.duration_min)}
            </span>
          )}
          {offering.location_label && (
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
              {offering.location_label}
            </span>
          )}
        </div>

        <Link
          to={href}
          className="inline-flex items-center gap-2 self-start bg-charcoal text-white rounded-2xl px-7 py-3.5 text-sm font-semibold hover:bg-charcoal/85 active:scale-[0.98] transition-all duration-200"
        >
          {t("card.viewDetails")}
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
