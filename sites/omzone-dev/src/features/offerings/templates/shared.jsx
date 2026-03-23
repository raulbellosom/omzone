/**
 * Shared components for offering templates.
 *
 * Reusable pieces used across all template layouts:
 * - BookingCTA: Primary call-to-action button
 * - InfoBadges: Duration, location, capacity badges
 * - PriceDisplay: Formatted price with mode support
 * - SectionRenderer: Renders content_sections with templates
 */
import { Link } from "react-router-dom";
import { ArrowRight, Clock, MapPin, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/hooks/useCurrency";
import { formatDuration } from "@/lib/dates";
import { resolveField } from "@/lib/i18n-data";
import { getPreviewUrl } from "@/lib/media";
import ROUTES from "@/constants/routes";
import { cn } from "@/lib/utils";

// ── Booking CTA ─────────────────────────────────────────────────────────────

export function BookingCTA({ offering, t, className, variant = "default" }) {
  const ctaLabel = resolveField(offering, "cta_label");
  const label =
    ctaLabel ||
    (offering.booking_mode === "scheduled"
      ? t("card.book")
      : offering.booking_mode === "request_only"
        ? t("card.requestInfo")
        : t("card.viewDetails"));

  const href =
    offering.booking_mode === "scheduled"
      ? ROUTES.BOOKING(offering.$id)
      : ROUTES.SERVICE_DETAIL(offering.slug);

  const variants = {
    default:
      "bg-sage text-white hover:bg-sage-dark shadow-lg shadow-sage/20 rounded-full px-8 py-4 text-base font-semibold",
    outline:
      "border-2 border-white text-white hover:bg-white/10 rounded-full px-8 py-4 text-base font-semibold",
    minimal:
      "text-sage hover:text-sage-dark underline underline-offset-4 font-medium",
  };

  return (
    <Button asChild className={cn(variants[variant], className)}>
      <Link to={href}>
        {label}
        <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
      </Link>
    </Button>
  );
}

// ── Info Badges ─────────────────────────────────────────────────────────────

export function InfoBadges({ offering, t, className, variant = "dark" }) {
  const variants = {
    dark: "text-white/80",
    light: "text-charcoal-muted",
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-4 text-sm", className)}>
      {offering.duration_min && (
        <span className={cn("flex items-center gap-2", variants[variant])}>
          <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
          {formatDuration(offering.duration_min)}
        </span>
      )}
      {offering.location_label && (
        <span className={cn("flex items-center gap-2", variants[variant])}>
          <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
          {offering.location_label}
        </span>
      )}
      {offering.max_guests && (
        <span className={cn("flex items-center gap-2", variants[variant])}>
          <Users className="w-4 h-4 shrink-0" aria-hidden="true" />
          {t("detail.guests")}: {offering.max_guests}
        </span>
      )}
    </div>
  );
}

// ── Price Display ────────────────────────────────────────────────────────────

export function PriceDisplay({ offering, t, className }) {
  const { formatPrice } = useCurrency();

  if (!offering.base_price && offering.pricing_mode !== "request_quote") {
    return null;
  }

  let content;
  if (offering.pricing_mode === "fixed_price") {
    content = formatPrice(offering.base_price, offering.currency);
  } else if (offering.pricing_mode === "from_price") {
    content = (
      <>
        <span className="text-sm font-normal opacity-70">{t("card.from")}</span>{" "}
        {formatPrice(offering.base_price, offering.currency)}
      </>
    );
  }
  // request_quote mode: don't display price, only CTA button from offering

  if (!content) return null;

  return (
    <span className={cn("text-2xl font-bold text-charcoal", className)}>
      {content}
    </span>
  );
}

// ── Category Badge ───────────────────────────────────────────────────────────

export function CategoryBadge({ offering, t, className, variant = "dark" }) {
  const categoryLabel = t(`categories.${offering.category}`, {
    defaultValue: offering.category,
  });

  const variants = {
    dark: "bg-white/10 backdrop-blur-xl border border-white/20 text-white",
    light: "bg-sage-muted/50 text-sage-dark border border-sage/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] font-semibold rounded-full px-4 py-2",
        variants[variant],
        className,
      )}
    >
      <Sparkles className="w-3 h-3" aria-hidden="true" />
      {categoryLabel}
    </span>
  );
}

// ── Content Section Block ────────────────────────────────────────────────────

export function ContentSectionBlock({ section, index, className }) {
  const title = resolveField(section, "title");
  const subtitle = resolveField(section, "subtitle");
  const body = resolveField(section, "body");
  const ctaLabel = resolveField(section, "cta_label");
  const ctaUrl = section.cta_url;

  const imageUrl =
    section.image_id && section.image_bucket
      ? getPreviewUrl(section.image_id, section.image_bucket, 1000, 700, 85)
      : null;

  const template = section.template_key ?? "centered-minimal";
  const isReversed =
    template === "story-right" ||
    (template === "story-left" && index % 2 === 1);

  if (template === "centered-minimal") {
    return (
      <div className={cn("py-16 md:py-24 bg-cream", className)}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          {title && (
            <h3 className="font-display text-3xl md:text-4xl text-charcoal font-semibold mb-4">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-lg text-sage font-medium mb-6">{subtitle}</p>
          )}
          {body && (
            <div className="prose prose-lg prose-charcoal max-w-none text-charcoal-muted leading-relaxed whitespace-pre-line">
              {body}
            </div>
          )}
          {ctaLabel && ctaUrl && (
            <Link
              to={ctaUrl}
              className="inline-flex items-center gap-2 mt-8 bg-charcoal text-white rounded-full px-6 py-3 font-semibold hover:bg-charcoal/90 transition-colors"
            >
              {ctaLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    );
  }

  // story-left and story-right
  return (
    <div
      className={cn(
        "py-16 md:py-24",
        index % 2 === 0 ? "bg-cream" : "bg-white",
        className,
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div
          className={cn(
            "grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center",
            isReversed && "lg:flex-row-reverse",
          )}
        >
          {/* Image */}
          {imageUrl && (
            <div
              className={cn(
                "relative rounded-3xl overflow-hidden aspect-4/3",
                isReversed && "lg:order-2",
              )}
            >
              <img
                src={imageUrl}
                alt={title ?? ""}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Text */}
          <div className={cn(isReversed && "lg:order-1")}>
            {title && (
              <h3 className="font-display text-3xl md:text-4xl text-charcoal font-semibold mb-4 leading-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sage text-lg font-medium mb-4">{subtitle}</p>
            )}
            {body && (
              <div className="prose prose-charcoal max-w-none text-charcoal-muted leading-relaxed whitespace-pre-line mb-6">
                {body}
              </div>
            )}
            {ctaLabel && ctaUrl && (
              <Link
                to={ctaUrl}
                className="inline-flex items-center gap-2 bg-charcoal text-white rounded-full px-6 py-3 font-semibold hover:bg-charcoal/90 transition-colors"
              >
                {ctaLabel}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Section Renderer ─────────────────────────────────────────────────────────

export function SectionRenderer({ sections, className }) {
  if (!sections || sections.length === 0) return null;

  return (
    <div className={className}>
      {sections.map((section, index) => (
        <ContentSectionBlock
          key={section.$id}
          section={section}
          index={index}
        />
      ))}
    </div>
  );
}
