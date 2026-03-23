/**
 * NatureImmersiveTemplate — Organic, nature-inspired flowing layout.
 *
 * Layout:
 *   1. Asymmetric hero with multiple circular/organic image shapes
 *   2. Flowing text sections with nature-inspired curves
 *   3. Gallery-style image presentation
 *   4. Dynamic content sections
 *   5. Beach/nature themed footer CTA
 *
 * Best for: Retreats, stays, outdoor experiences, beach yoga.
 */
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Waves, Palmtree, Sun } from "lucide-react";
import PageMeta from "@/components/seo/PageMeta";
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

export default function NatureImmersiveTemplate({
  offering,
  sections,
  t,
  locale,
}) {
  const title = resolveField(offering, "title");
  const summary = resolveField(offering, "summary");
  const description = resolveField(offering, "description");
  const backRoute = CATEGORY_BACK_ROUTES[offering.category] ?? ROUTES.SESSIONS;

  // Get images: prefer images_json, fall back to legacy cover_image fields
  const imageUrls = getImageUrls(offering.images_json, 1200, 1200, 85);
  const coverUrl =
    imageUrls.length > 0
      ? imageUrls[0]
      : offering.cover_image_id
        ? getPreviewUrl(
            offering.cover_image_id,
            offering.cover_image_bucket ?? BUCKET_PUBLIC_MEDIA,
            1200,
            1200,
            85,
          )
        : null;

  // Secondary image from sections or fallback to second offering image
  const secondarySection = sections?.[0];
  const sectionImageUrls = getImageUrls(
    secondarySection?.images_json,
    800,
    800,
    85,
  );
  const secondaryUrl =
    sectionImageUrls.length > 0
      ? sectionImageUrls[0]
      : imageUrls.length > 1
        ? imageUrls[1]
        : null;

  return (
    <>
      <PageMeta title={title} description={summary} locale={locale} />

      {/* ── Organic Hero ──────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-cream via-sand/50 to-warm-gray/30 pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden">
        {/* Decorative organic shapes */}
        <div
          className="absolute top-0 right-0 w-96 h-96 bg-sage/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-0 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"
          aria-hidden="true"
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          {/* Back link */}
          <Link
            to={backRoute}
            className="inline-flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-charcoal transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {t(`categories.${offering.category}`)}
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text content */}
            <div>
              <CategoryBadge
                offering={offering}
                t={t}
                variant="light"
                className="mb-6"
              />

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-charcoal font-semibold leading-[0.95] tracking-tight mb-6">
                {title}
              </h1>

              {summary && (
                <p className="text-charcoal-muted text-lg md:text-xl leading-relaxed mb-8">
                  {summary}
                </p>
              )}

              <InfoBadges
                offering={offering}
                t={t}
                variant="light"
                className="mb-8"
              />

              <div className="flex flex-wrap items-center gap-4">
                <PriceDisplay offering={offering} t={t} />
                <BookingCTA offering={offering} t={t} />
              </div>
            </div>

            {/* Images - organic layout */}
            <div className="relative h-[450px] md:h-[550px]">
              {/* Main circular image */}
              {coverUrl && (
                <div className="absolute top-0 right-0 w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden shadow-2xl shadow-charcoal/10 border-4 border-white">
                  <img
                    src={coverUrl}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
              )}

              {/* Secondary organic shape */}
              {secondaryUrl && (
                <div className="absolute bottom-0 left-0 w-52 h-52 md:w-64 md:h-64 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] overflow-hidden shadow-xl shadow-charcoal/10 border-4 border-white">
                  <img
                    src={secondaryUrl}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Decorative elements */}
              <div
                className="absolute top-1/2 left-1/3 w-16 h-16 bg-sage-muted rounded-full flex items-center justify-center shadow-lg"
                aria-hidden="true"
              >
                <Waves className="w-8 h-8 text-sage-dark" />
              </div>

              <div
                className="absolute bottom-20 right-8 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center shadow-md"
                aria-hidden="true"
              >
                <Sun className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Wave divider ──────────────────────────────────────────────── */}
      <div className="bg-cream">
        <svg
          viewBox="0 0 1440 100"
          className="w-full h-12 md:h-16 text-white"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,50 C360,100 720,0 1080,50 C1260,75 1380,50 1440,50 L1440,100 L0,100 Z"
          />
        </svg>
      </div>

      {/* ── About Section ─────────────────────────────────────────────── */}
      {description && (
        <section className="bg-white py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-sage-muted rounded-full mb-6">
                <Palmtree className="w-7 h-7 text-sage-dark" />
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-charcoal font-semibold mb-4">
                {t("detail.theExperience", { defaultValue: "La experiencia" })}
              </h2>
            </div>

            <div className="prose prose-lg prose-charcoal max-w-none text-charcoal-muted leading-relaxed whitespace-pre-line text-center">
              {description}
            </div>
          </div>
        </section>
      )}

      {/* ── Wave divider (inverted) ───────────────────────────────────── */}
      <div className="bg-white">
        <svg
          viewBox="0 0 1440 100"
          className="w-full h-12 md:h-16 text-cream"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,50 C360,0 720,100 1080,50 C1260,25 1380,50 1440,50 L1440,100 L0,100 Z"
          />
        </svg>
      </div>

      {/* ── Dynamic Content Sections ──────────────────────────────────── */}
      <SectionRenderer sections={sections} />

      {/* ── Beach/Nature CTA Section ──────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-amber-700 via-amber-600 to-orange-500 py-20 md:py-28 overflow-hidden">
        {/* Decorative waves */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ffffff' d='M0,160L48,144C96,128,192,96,288,112C384,128,480,192,576,192C672,192,768,128,864,112C960,96,1056,128,1152,138.7C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat-x",
            backgroundPosition: "bottom",
            backgroundSize: "100% 100px",
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-8">
            <Waves className="w-8 h-8 text-white" />
          </div>

          <h2 className="font-display text-3xl md:text-4xl text-white font-semibold mb-4">
            {t("detail.escapeTitle", {
              defaultValue: "Escapa a la naturaleza",
            })}
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            {t("detail.escapeSubtitle", {
              defaultValue:
                "Reconecta con el mar, la tierra y tu ser interior.",
            })}
          </p>

          <BookingCTA offering={offering} t={t} variant="outline" />
        </div>
      </section>
    </>
  );
}
