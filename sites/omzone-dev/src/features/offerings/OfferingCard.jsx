/**
 * OfferingCard — unified card for all offering categories.
 *
 * Layouts:
 *   "overlay"  — full-bleed image with text over gradient (default)
 *   "split"    — image top + white content below
 *   "compact"  — horizontal row (sidebar / lists)
 */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Clock,
  MapPin,
  Users,
  Sparkles,
  Waves,
  Compass,
  Home,
  Heart,
  Palmtree,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/hooks/useCurrency";
import { formatDuration } from "@/lib/dates";
import { getPreviewUrl } from "@/lib/media";
import { BUCKET_PUBLIC_MEDIA } from "@/env";
import { resolveField } from "@/lib/i18n-data";
import ROUTES from "@/constants/routes";
import { cn } from "@/lib/utils";

// ── Visual config per category ──────────────────────────────────────────────

const CATEGORY_GRADIENT = {
  wellness_studio: "from-teal-900 via-teal-800 to-emerald-900",
  immersion: "from-indigo-950 via-violet-900 to-slate-900",
  stay: "from-amber-900 via-orange-900 to-stone-900",
  service: "from-rose-900 via-pink-900 to-stone-900",
  experience: "from-sky-900 via-cyan-800 to-slate-900",
};

const CATEGORY_ICON = {
  wellness_studio: Waves,
  immersion: Compass,
  stay: Home,
  service: Heart,
  experience: Palmtree,
};

/** Map offering category → detail route */
function offeringHref(offering) {
  const slug = offering.slug;
  switch (offering.category) {
    case "wellness_studio":
      return ROUTES.SESSION_DETAIL(slug);
    case "immersion":
      return ROUTES.IMMERSION_DETAIL(slug);
    case "stay":
      return ROUTES.STAY_DETAIL(slug);
    case "service":
      return ROUTES.SERVICE_DETAIL(slug);
    case "experience":
      return ROUTES.EXPERIENCE_DETAIL(slug);
    default:
      return ROUTES.SESSION_DETAIL(slug);
  }
}

// ── Main component ──────────────────────────────────────────────────────────

export default function OfferingCard({ offering, layout = "overlay" }) {
  if (!offering) return null;
  if (layout === "compact") return <OfferingCardCompact offering={offering} />;
  if (layout === "split") return <OfferingCardSplit offering={offering} />;
  return <OfferingCardOverlay offering={offering} />;
}

// ── Shared data ─────────────────────────────────────────────────────────────

function useCardData(offering) {
  const { t } = useTranslation("offerings");
  const { formatPrice } = useCurrency();

  const gradient =
    CATEGORY_GRADIENT[offering.category] ?? CATEGORY_GRADIENT.wellness_studio;
  const CategoryIcon =
    CATEGORY_ICON[offering.category] ?? CATEGORY_ICON.wellness_studio;

  const title = resolveField(offering, "title");
  const summary = resolveField(offering, "summary");

  const imgUrl = offering.cover_image_id
    ? getPreviewUrl(
        offering.cover_image_id,
        offering.cover_image_bucket ?? BUCKET_PUBLIC_MEDIA,
        900,
        1200,
        85,
      )
    : null;

  const href = offeringHref(offering);

  // Price display - only show actual prices, not labels for request_quote
  let priceLabel = null;
  if (offering.pricing_mode === "fixed_price" && offering.base_price) {
    priceLabel = formatPrice(offering.base_price, offering.currency);
  } else if (offering.pricing_mode === "from_price" && offering.base_price) {
    priceLabel = `${t("card.from")} ${formatPrice(offering.base_price, offering.currency)}`;
  }
  // request_quote mode: no price shown, only CTA button from offering

  // CTA label - prioritize offering field
  let ctaLabel = resolveField(offering, "cta_label");
  if (!ctaLabel) {
    switch (offering.booking_mode) {
      case "scheduled":
        ctaLabel = t("card.book");
        break;
      case "request_only":
        ctaLabel = t("card.requestInfo");
        break;
      case "date_range":
        ctaLabel = t("card.checkAvailability");
        break;
      default:
        ctaLabel = t("card.viewDetails");
    }
  }

  // Category label
  const categoryLabel = t(`categories.${offering.category}`, {
    defaultValue: offering.category,
  });

  // Badges
  let badges = [];
  if (offering.badges_json) {
    try {
      badges = JSON.parse(offering.badges_json);
    } catch {
      /* ignore */
    }
  }

  return {
    gradient,
    CategoryIcon,
    title,
    summary,
    imgUrl,
    href,
    priceLabel,
    ctaLabel,
    categoryLabel,
    badges,
    t,
  };
}

// ── OVERLAY ─────────────────────────────────────────────────────────────────

function OfferingCardOverlay({ offering }) {
  const {
    gradient,
    CategoryIcon,
    title,
    summary,
    imgUrl,
    href,
    priceLabel,
    ctaLabel,
    categoryLabel,
  } = useCardData(offering);

  return (
    <article className="group relative overflow-hidden rounded-3xl cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 aspect-3/4">
      {/* Background: image or gradient */}
      {imgUrl ? (
        <img
          src={imgUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <>
          <div className={cn("absolute inset-0 bg-linear-to-br", gradient)} />
          <CategoryIcon
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 text-white/6"
            aria-hidden="true"
          />
        </>
      )}

      {/* Readability gradient */}
      <div className="absolute inset-0 bg-linear-to-t from-black/92 via-black/25 to-transparent pointer-events-none" />

      {/* Top badges */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2 z-10 pointer-events-none">
        <span className="text-[10px] uppercase tracking-widest font-semibold text-white bg-white/12 backdrop-blur-md border border-white/15 rounded-full px-3 py-1 leading-none">
          {categoryLabel}
        </span>
        {offering.yoga_style && (
          <span className="text-[10px] uppercase tracking-widest font-semibold text-white/80 bg-white/8 backdrop-blur-md border border-white/10 rounded-full px-2.5 py-1 leading-none">
            {offering.yoga_style}
          </span>
        )}
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10 space-y-3">
        <h3 className="text-white text-xl font-bold leading-tight line-clamp-2 drop-shadow-sm">
          {title}
        </h3>

        {summary && (
          <p className="text-white/60 text-sm leading-relaxed line-clamp-2">
            {summary}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center justify-between text-xs text-white/55 pt-0.5">
          <div className="flex items-center gap-3">
            {offering.duration_min && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                {formatDuration(offering.duration_min)}
              </span>
            )}
            {offering.location_label && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="truncate max-w-24">
                  {offering.location_label}
                </span>
              </span>
            )}
          </div>
          {priceLabel && (
            <span className="text-base font-bold text-white">{priceLabel}</span>
          )}
        </div>

        {/* CTA */}
        <Link
          to={href}
          className="relative z-20 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98] bg-white text-charcoal hover:bg-white/90 shadow-sm"
        >
          {ctaLabel}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}

// ── SPLIT ───────────────────────────────────────────────────────────────────

function OfferingCardSplit({ offering }) {
  const {
    gradient,
    CategoryIcon,
    title,
    summary,
    imgUrl,
    href,
    priceLabel,
    ctaLabel,
    categoryLabel,
  } = useCardData(offering);

  return (
    <article className="group rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-400 hover:-translate-y-0.5 flex flex-col bg-white border border-warm-gray-dark/30">
      {/* Image */}
      <Link
        to={href}
        className="relative block overflow-hidden shrink-0"
        style={{ aspectRatio: "16/9" }}
        tabIndex={-1}
        aria-hidden="true"
      >
        {imgUrl ? (
          <img
            src={imgUrl}
            alt=""
            className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <>
            <div className={cn("absolute inset-0 bg-linear-to-br", gradient)} />
            <CategoryIcon
              className="absolute inset-0 m-auto w-14 h-14 text-white/15"
              aria-hidden="true"
            />
          </>
        )}
        <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest font-semibold text-white bg-black/35 backdrop-blur-md border border-white/15 rounded-full px-3 py-1 leading-none">
          {categoryLabel}
        </span>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-0">
        <Link to={href} className="block mb-2">
          <h3 className="text-lg font-bold text-charcoal leading-snug group-hover:text-sage transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>

        {summary && (
          <p className="text-sm text-charcoal-muted line-clamp-2 mb-3 leading-relaxed">
            {summary}
          </p>
        )}

        <div className="mt-auto pt-3 border-t border-warm-gray-dark/50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-xs text-charcoal-muted min-w-0">
            {offering.duration_min && (
              <span className="flex items-center gap-1.5 shrink-0">
                <Clock className="w-3.5 h-3.5" />
                {formatDuration(offering.duration_min)}
              </span>
            )}
            {offering.max_guests > 1 && (
              <span className="flex items-center gap-1.5 shrink-0">
                <Users className="w-3.5 h-3.5" />
                {offering.min_guests}–{offering.max_guests}
              </span>
            )}
          </div>
          {priceLabel && (
            <span className="font-bold text-sage text-sm shrink-0">
              {priceLabel}
            </span>
          )}
        </div>

        <Button asChild size="sm" className="mt-3 w-full">
          <Link to={href}>
            {ctaLabel}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

// ── COMPACT ─────────────────────────────────────────────────────────────────

function OfferingCardCompact({ offering }) {
  const { gradient, CategoryIcon, title, imgUrl, href, priceLabel } =
    useCardData(offering);

  return (
    <article className="group flex flex-row h-20 rounded-2xl overflow-hidden bg-white border border-warm-gray-dark/30 hover:shadow-card-hover transition-all duration-300 cursor-pointer">
      <Link
        to={href}
        className="relative w-20 shrink-0 overflow-hidden"
        aria-label={title}
        tabIndex={-1}
      >
        {imgUrl ? (
          <img
            src={imgUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className={cn("absolute inset-0 bg-linear-to-br", gradient)}>
            <CategoryIcon
              className="absolute inset-0 m-auto w-7 h-7 text-white/20"
              aria-hidden="true"
            />
          </div>
        )}
      </Link>
      <div className="flex flex-col justify-center px-3 py-2 min-w-0 flex-1">
        <Link to={href} className="block">
          <h3 className="text-sm font-semibold text-charcoal truncate group-hover:text-sage transition-colors">
            {title}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-charcoal-muted">
          {offering.duration_min && (
            <>
              <Clock className="w-3 h-3" />
              <span>{formatDuration(offering.duration_min)}</span>
            </>
          )}
          {priceLabel && (
            <span className="font-semibold text-sage ml-auto">
              {priceLabel}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export { offeringHref };
