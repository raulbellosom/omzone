/**
 * SplitJourneyTemplate — Side-by-side hero with journey progression.
 *
 * Layout:
 *   1. Split hero: Large image on left/right, content on the other side
 *   2. Journey narrative with alternating image/text blocks
 *   3. What's included section with icons
 *   4. Dynamic content sections
 *   5. Booking CTA
 *
 * Best for: Transformative experiences, immersions, multi-day programs.
 */
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sunrise,
  Sunset,
  Moon,
  Star,
} from "lucide-react";
import PageMeta from "@/components/seo/PageMeta";
import { resolveField } from "@/lib/i18n-data";
import { getPreviewUrl } from "@/lib/media";
import { BUCKET_PUBLIC_MEDIA } from "@/env";
import ROUTES from "@/constants/routes";
import { cn } from "@/lib/utils";
import {
  BookingCTA,
  InfoBadges,
  PriceDisplay,
  CategoryBadge,
  SectionRenderer,
} from "./shared";

const CATEGORY_BACK_ROUTES = {
  wellness_studio: ROUTES.SESSIONS,
  immersion: ROUTES.IMMERSIONS,
  stay: ROUTES.STAYS,
  service: ROUTES.SERVICES,
  experience: ROUTES.EXPERIENCES,
};

// Journey icons for visual storytelling
const JOURNEY_ICONS = [Sunrise, Star, Moon, Sunset];

export default function SplitJourneyTemplate({
  offering,
  sections,
  t,
  locale,
}) {
  const title = resolveField(offering, "title");
  const summary = resolveField(offering, "summary");
  const description = resolveField(offering, "description");
  const backRoute = CATEGORY_BACK_ROUTES[offering.category] ?? ROUTES.SESSIONS;

  const coverUrl = offering.cover_image_id
    ? getPreviewUrl(
        offering.cover_image_id,
        offering.cover_image_bucket ?? BUCKET_PUBLIC_MEDIA,
        1400,
        900,
        85,
      )
    : null;

  // Parse included items from termsConfig if available
  let includedItems = [];
  try {
    const terms = JSON.parse(offering.terms_config || "{}");
    includedItems = terms.includes || [];
  } catch {
    // ignore
  }

  return (
    <>
      <PageMeta title={title} description={summary} locale={locale} />

      {/* ── Split Hero ────────────────────────────────────────────────── */}
      <section className="min-h-screen bg-cream">
        <div className="grid lg:grid-cols-2 min-h-screen">
          {/* Image side */}
          <div className="relative h-[50vh] lg:h-auto lg:sticky lg:top-0">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-sage-dark via-sage to-emerald-600" />
            )}

            {/* Category badge overlay */}
            <CategoryBadge
              offering={offering}
              t={t}
              className="absolute top-20 lg:top-28 left-6"
            />
          </div>

          {/* Content side */}
          <div className="flex flex-col justify-center px-6 md:px-12 lg:px-16 py-16 lg:py-24">
            {/* Back link */}
            <Link
              to={backRoute}
              className="inline-flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-charcoal transition-colors mb-8 self-start"
            >
              <ArrowLeft className="w-4 h-4" />
              {t(`categories.${offering.category}`)}
            </Link>

            {/* Title */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-charcoal font-semibold leading-[0.95] tracking-tight mb-6">
              {title}
            </h1>

            {/* Summary */}
            {summary && (
              <p className="text-charcoal-muted text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
                {summary}
              </p>
            )}

            {/* Info badges */}
            <InfoBadges
              offering={offering}
              t={t}
              variant="light"
              className="mb-8"
            />

            {/* Price + CTA */}
            <div className="flex flex-wrap items-center gap-4">
              <PriceDisplay offering={offering} t={t} />
              <BookingCTA offering={offering} t={t} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Journey/Story Section ─────────────────────────────────────── */}
      {description && (
        <section className="bg-white py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl md:text-4xl text-charcoal font-semibold mb-4">
                {t("detail.yourJourney", { defaultValue: "Tu viaje" })}
              </h2>
              <p className="text-charcoal-muted text-lg">
                {t("detail.journeySubtitle", {
                  defaultValue: "Un camino de transformación personal",
                })}
              </p>
            </div>

            {/* Description as journey narrative */}
            <div className="prose prose-lg prose-charcoal max-w-none text-charcoal-muted leading-relaxed whitespace-pre-line">
              {description}
            </div>
          </div>
        </section>
      )}

      {/* ── What's Included ───────────────────────────────────────────── */}
      {includedItems.length > 0 && (
        <section className="bg-sage-muted/30 py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="font-display text-3xl md:text-4xl text-charcoal font-semibold mb-12 text-center">
              {t("detail.whatsIncluded", { defaultValue: "¿Qué incluye?" })}
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {includedItems.map((item, i) => {
                const Icon = JOURNEY_ICONS[i % JOURNEY_ICONS.length];
                return (
                  <div
                    key={i}
                    className="flex items-start gap-4 bg-white rounded-2xl p-6 shadow-sm"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-full bg-sage-muted flex items-center justify-center">
                      <Icon className="w-5 h-5 text-sage-dark" />
                    </div>
                    <p className="text-charcoal font-medium">{item}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Dynamic Content Sections ──────────────────────────────────── */}
      <SectionRenderer sections={sections} />

      {/* ── Final CTA Section ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-sage-dark via-sage to-emerald-600 py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl text-white font-semibold mb-4">
            {t("detail.beginJourney", { defaultValue: "Comienza tu viaje" })}
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            {t("detail.beginSubtitle", {
              defaultValue:
                "No esperes más para transformar tu vida. Reserva hoy.",
            })}
          </p>
          <BookingCTA offering={offering} t={t} variant="outline" />
        </div>
      </section>
    </>
  );
}
