/**
 * ZenHeroTemplate — Full-viewport meditative hero template.
 *
 * Layout:
 *   1. Full-screen hero with cover image, soft gradient, centered text
 *   2. About/description section with floating sidebar
 *   3. Dynamic content sections
 *   4. Booking CTA section
 *   5. Related offerings
 *
 * Best for: Meditation sessions, breathwork, restorative yoga.
 */
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, ChevronDown } from "lucide-react";
import PageMeta from "@/components/seo/PageMeta";
import StructuredData from "@/components/seo/StructuredData";
import { resolveField } from "@/lib/i18n-data";
import { getPreviewUrl, getFirstImageUrl, getImageUrls } from "@/lib/media";
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

export default function ZenHeroTemplate({ offering, sections, t, locale }) {
  const title = resolveField(offering, "title");
  const summary = resolveField(offering, "summary");
  const description = resolveField(offering, "description");
  const backRoute = CATEGORY_BACK_ROUTES[offering.category] ?? ROUTES.SESSIONS;

  // Get images: prefer images_json, fall back to legacy cover_image fields
  const imageUrls = getImageUrls(offering.images_json, 1920, 1080, 85);
  const coverUrl =
    imageUrls.length > 0
      ? imageUrls[0]
      : offering.cover_image_id
        ? getPreviewUrl(
            offering.cover_image_id,
            offering.cover_image_bucket ?? BUCKET_PUBLIC_MEDIA,
            1920,
            1080,
            85,
          )
        : null;

  return (
    <>
      <PageMeta title={title} description={summary} locale={locale} />

      {/* ── Full-screen Hero ──────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col"
        style={{ minHeight: "100dvh" }}
      >
        {/* Background */}
        {coverUrl && (
          <img
            src={coverUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center"
            loading="eager"
          />
        )}

        {/* Gradient overlays for zen feel */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-charcoal/20 to-charcoal/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/30 via-transparent to-charcoal/30" />

        {/* Content */}
        <div className="relative flex-1 flex flex-col justify-center items-center text-center px-4 py-20 md:py-28">
          {/* Back link */}
          <Link
            to={backRoute}
            className="absolute top-24 left-4 md:left-8 inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t(`categories.${offering.category}`)}
          </Link>

          {/* Category badge */}
          <CategoryBadge offering={offering} t={t} className="mb-6" />

          {/* Title */}
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-semibold leading-[0.95] tracking-tight mb-6 max-w-4xl">
            {title}
          </h1>

          {/* Summary */}
          {summary && (
            <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-2xl mb-8">
              {summary}
            </p>
          )}

          {/* Info badges */}
          <InfoBadges offering={offering} t={t} className="mb-10" />

          {/* CTA */}
          <BookingCTA offering={offering} t={t} />
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 animate-bounce">
          <span className="text-xs uppercase tracking-widest">
            {t("detail.scrollToExplore", { defaultValue: "Explora" })}
          </span>
          <ChevronDown className="w-5 h-5" />
        </div>
      </section>

      {/* ── About Section ─────────────────────────────────────────────── */}
      {description && (
        <section className="bg-cream py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
              {/* Main content */}
              <div className="lg:col-span-2">
                <h2 className="font-display text-3xl md:text-4xl text-charcoal font-semibold mb-6">
                  {t("detail.about")}
                </h2>
                <div className="prose prose-lg prose-charcoal max-w-none text-charcoal-muted leading-relaxed whitespace-pre-line">
                  {description}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 bg-white rounded-3xl p-8 shadow-sm border border-warm-gray-dark/20">
                  <PriceDisplay
                    offering={offering}
                    t={t}
                    className="block mb-6"
                  />

                  <InfoBadges
                    offering={offering}
                    t={t}
                    variant="light"
                    className="flex-col items-start gap-3 mb-8"
                  />

                  <BookingCTA
                    offering={offering}
                    t={t}
                    className="w-full justify-center"
                  />

                  {offering.yoga_style && (
                    <p className="text-center text-sm text-charcoal-muted mt-4">
                      {t("detail.yogaStyle")}: {offering.yoga_style}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Dynamic Content Sections ──────────────────────────────────── */}
      <SectionRenderer sections={sections} />

      {/* ── Final CTA Section ─────────────────────────────────────────── */}
      <section className="bg-charcoal py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl text-white font-semibold mb-4">
            {t("detail.readyTitle", { defaultValue: "¿Listo para comenzar?" })}
          </h2>
          <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
            {t("detail.readySubtitle", {
              defaultValue:
                "Reserva tu lugar y comienza tu viaje de transformación.",
            })}
          </p>
          <BookingCTA offering={offering} t={t} variant="outline" />
        </div>
      </section>
    </>
  );
}
