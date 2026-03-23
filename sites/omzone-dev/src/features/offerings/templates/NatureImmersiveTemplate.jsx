/**
 * NatureImmersiveTemplate — Organic, nature-inspired flowing layout.
 *
 * Layout:
 *   1. Full-width hero carousel with organic overlay
 *   2. Flowing text sections with nature-inspired curves
 *   3. Dynamic content sections
 *   4. Beach/nature themed footer CTA
 *
 * Best for: Retreats, stays, outdoor experiences, beach yoga.
 */
import { Link } from "react-router-dom";
import { ArrowLeft, Waves, Palmtree } from "lucide-react";
import PageMeta from "@/components/seo/PageMeta";
import { resolveField } from "@/lib/i18n-data";
import { getImageUrls } from "@/lib/media";
import ROUTES from "@/constants/routes";
import {
  HeroCarousel,
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

  const imageUrls = getImageUrls(offering.images_json, 1920, 1080, 85);

  return (
    <>
      <PageMeta title={title} description={summary} locale={locale} />

      {/* ── Full-width Hero Carousel ─────────────────────────────────── */}
      <section className="relative group">
        <HeroCarousel
          imageUrls={imageUrls}
          aspectClassName="aspect-[16/9] md:aspect-[21/9]"
          overlay={
            <>
              <div className="absolute inset-0 bg-linear-to-t from-charcoal/70 via-charcoal/20 to-charcoal/30" />
              {/* Decorative organic shapes */}
              <div
                className="absolute top-0 right-0 w-96 h-96 bg-sage/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"
                aria-hidden="true"
              />
              <div
                className="absolute bottom-0 left-0 w-80 h-80 bg-amber-200/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"
                aria-hidden="true"
              />
            </>
          }
        >
          {/* Content overlay */}
          <div className="absolute inset-0 z-10 flex items-end">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 md:pb-16 w-full">
              {/* Back link */}
              <Link
                to={backRoute}
                className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                {t(`categories.${offering.category}`)}
              </Link>

              <CategoryBadge
                offering={offering}
                t={t}
                className="mb-4 block w-fit"
              />

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-white font-semibold leading-[0.95] tracking-tight mb-4 max-w-3xl">
                {title}
              </h1>

              {summary && (
                <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-6 max-w-2xl">
                  {summary}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-6">
                <InfoBadges offering={offering} t={t} />
                <PriceDisplay
                  offering={offering}
                  t={t}
                  className="text-white!"
                />
                <BookingCTA offering={offering} t={t} />
              </div>
            </div>
          </div>
        </HeroCarousel>
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
      <section className="relative bg-linear-to-br from-amber-700 via-amber-600 to-orange-500 py-20 md:py-28 overflow-hidden">
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
