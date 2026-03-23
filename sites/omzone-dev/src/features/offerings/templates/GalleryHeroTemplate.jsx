/**
 * GalleryHeroTemplate — Modern gallery-focused layout with sticky booking.
 *
 * Layout:
 *   1. Full-width hero carousel
 *   2. Compact header bar with title + CTA
 *   3. Two-column layout: main content + sticky booking sidebar
 *   4. Image gallery grid (all images clickable for lightbox)
 *   5. Journey/description sections
 *   6. What's included grid
 *   7. Dynamic content sections
 *   8. Final CTA
 *
 * Best for: Immersions, multi-day programs, experiences, detailed offerings.
 */
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  Clock,
  MapPin,
  Calendar,
  Sparkles,
  Check,
  Star,
  Images,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PageMeta from "@/components/seo/PageMeta";
import { resolveField } from "@/lib/i18n-data";
import { getImageUrls } from "@/lib/media";
import { formatDuration } from "@/lib/dates";
import { useCurrency } from "@/hooks/useCurrency";
import ROUTES from "@/constants/routes";
import { cn } from "@/lib/utils";
import {
  HeroCarousel,
  BookingCTA,
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

// ── Image Gallery Lightbox ───────────────────────────────────────────────────

function ImageLightbox({ images, initialIndex = 0, onClose }) {
  const [current, setCurrent] = useState(initialIndex);
  const count = images.length;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setCurrent((p) => (p - 1 + count) % count);
      if (e.key === "ArrowRight") setCurrent((p) => (p + 1) % count);
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [count, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <span className="text-sm font-medium">
          {current + 1} / {count}
        </span>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main image */}
      <div className="flex-1 relative flex items-center justify-center px-4 pb-4">
        <img
          src={images[current]}
          alt=""
          className="max-h-full max-w-full object-contain rounded-lg"
        />

        {/* Navigation */}
        {count > 1 && (
          <>
            <button
              onClick={() => setCurrent((p) => (p - 1 + count) % count)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrent((p) => (p + 1) % count)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {count > 1 && (
        <div className="px-4 pb-4 overflow-x-auto">
          <div className="flex gap-2 justify-center">
            {images.map((url, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  "shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                  i === current
                    ? "border-white opacity-100"
                    : "border-transparent opacity-50 hover:opacity-75",
                )}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Gallery Grid Component ───────────────────────────────────────────────────

function GalleryGrid({ images, onImageClick, t }) {
  const count = images.length;

  if (count === 0) return null;

  // Show max 5 images in grid, with "show all" button
  const visibleImages = images.slice(0, 5);
  const hasMore = count > 5;

  if (count === 1) {
    return (
      <div className="relative rounded-2xl overflow-hidden aspect-video">
        <img
          src={images[0]}
          alt=""
          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
          onClick={() => onImageClick(0)}
        />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
        {images.map((url, i) => (
          <div key={i} className="relative aspect-4/3">
            <img
              src={url}
              alt=""
              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
              onClick={() => onImageClick(i)}
            />
          </div>
        ))}
      </div>
    );
  }

  // 3+ images: main large + grid of smaller
  return (
    <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-100 md:h-125">
      {/* Main large image */}
      <div className="col-span-2 row-span-2 relative">
        <img
          src={visibleImages[0]}
          alt=""
          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
          onClick={() => onImageClick(0)}
        />
      </div>

      {/* Secondary images */}
      {visibleImages.slice(1, 5).map((url, i) => (
        <div key={i} className="relative">
          <img
            src={url}
            alt=""
            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
            onClick={() => onImageClick(i + 1)}
          />
          {/* Show all button on last visible image */}
          {hasMore && i === 3 && (
            <button
              onClick={() => onImageClick(0)}
              className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold gap-2 hover:bg-black/60 transition-colors"
            >
              <Images className="w-5 h-5" />
              {t("detail.showAllPhotos", {
                defaultValue: `Ver las ${count} fotos`,
              })}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main Template ────────────────────────────────────────────────────────────

export default function GalleryHeroTemplate({ offering, sections, t, locale }) {
  const title = resolveField(offering, "title");
  const summary = resolveField(offering, "summary");
  const description = resolveField(offering, "description");
  const backRoute = CATEGORY_BACK_ROUTES[offering.category] ?? ROUTES.SESSIONS;
  const { formatPrice } = useCurrency();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);

  const heroRef = useRef(null);

  // Get all images - multiple sizes for different uses
  const heroImages = getImageUrls(offering.images_json, 1920, 1080, 85);
  const galleryImages = getImageUrls(offering.images_json, 1200, 800, 85);

  // Parse included items from termsConfig
  let includedItems = [];
  try {
    const terms = JSON.parse(offering.terms_config || "{}");
    includedItems = terms.includes || [];
  } catch {
    // ignore
  }

  // Sticky header on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom;
        setIsHeaderSticky(heroBottom < 0);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <PageMeta title={title} description={summary} locale={locale} />

      {/* ── Sticky Header Bar (appears on scroll) ─────────────────────── */}
      <div
        className={cn(
          "fixed top-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-warm-gray-dark/10 transition-all duration-300",
          isHeaderSticky
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none",
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold text-charcoal truncate">
              {title}
            </h2>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            {offering.base_price && (
              <span className="text-lg font-bold text-charcoal hidden sm:block">
                {formatPrice(offering.base_price, offering.currency)}
              </span>
            )}
            <BookingCTA offering={offering} t={t} className="py-2.5! px-6!" />
          </div>
        </div>
      </div>

      {/* ── Hero Section with Gallery ─────────────────────────────────── */}
      <section ref={heroRef} className="bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-8">
          {/* Back link */}
          <Link
            to={backRoute}
            className="inline-flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-charcoal transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t(`categories.${offering.category}`)}
          </Link>

          {/* Title area */}
          <div className="mb-6">
            <CategoryBadge
              offering={offering}
              t={t}
              variant="light"
              className="mb-3"
            />
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-charcoal font-semibold leading-[1.1] tracking-tight mb-3">
              {title}
            </h1>
            {summary && (
              <p className="text-charcoal-muted text-lg md:text-xl max-w-3xl">
                {summary}
              </p>
            )}
          </div>

          {/* Gallery Grid */}
          <GalleryGrid
            images={galleryImages}
            onImageClick={openLightbox}
            t={t}
          />
        </div>
      </section>

      {/* ── Main Content with Sticky Sidebar ──────────────────────────── */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Quick Info Bar */}
              <div className="flex flex-wrap items-center gap-6 pb-8 border-b border-warm-gray-dark/10">
                {offering.duration_min && (
                  <div className="flex items-center gap-2 text-charcoal">
                    <Clock className="w-5 h-5 text-sage" />
                    <span>{formatDuration(offering.duration_min)}</span>
                  </div>
                )}
                {offering.max_guests && (
                  <div className="flex items-center gap-2 text-charcoal">
                    <Users className="w-5 h-5 text-sage" />
                    <span>
                      {t("detail.guests")}: {offering.max_guests}
                    </span>
                  </div>
                )}
                {offering.location_label && (
                  <div className="flex items-center gap-2 text-charcoal">
                    <MapPin className="w-5 h-5 text-sage" />
                    <span>{offering.location_label}</span>
                  </div>
                )}
              </div>

              {/* Description Section */}
              {description && (
                <div>
                  <h2 className="font-display text-2xl md:text-3xl text-charcoal font-semibold mb-6">
                    {t("detail.yourJourney", { defaultValue: "Tu viaje" })}
                  </h2>
                  <p className="text-sm text-sage font-medium mb-4">
                    {t("detail.journeySubtitle", {
                      defaultValue: "Un camino de transformación personal",
                    })}
                  </p>
                  <div className="prose prose-lg prose-charcoal max-w-none text-charcoal-muted leading-relaxed whitespace-pre-line">
                    {description}
                  </div>
                </div>
              )}

              {/* What's Included */}
              {includedItems.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl md:text-3xl text-charcoal font-semibold mb-6">
                    {t("detail.whatsIncluded", {
                      defaultValue: "¿Qué incluye?",
                    })}
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {includedItems.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-4 bg-sage-muted/30 rounded-xl"
                      >
                        <div className="shrink-0 w-6 h-6 rounded-full bg-sage flex items-center justify-center mt-0.5">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-charcoal">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-warm-gray-dark/10">
                  {/* Price */}
                  {offering.base_price && (
                    <div className="mb-6">
                      {offering.pricing_mode === "from_price" && (
                        <span className="text-sm text-charcoal-muted">
                          {t("card.from")}
                        </span>
                      )}
                      <div className="text-3xl font-bold text-charcoal">
                        {formatPrice(offering.base_price, offering.currency)}
                      </div>
                      {offering.type === "immersion" && (
                        <span className="text-sm text-charcoal-muted">
                          {t("detail.perPerson", {
                            defaultValue: "por persona",
                          })}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Quick stats */}
                  <div className="space-y-4 mb-6 pb-6 border-b border-warm-gray-dark/10">
                    {offering.duration_min && (
                      <div className="flex items-center gap-3 text-sm text-charcoal-muted">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(offering.duration_min)}</span>
                      </div>
                    )}
                    {offering.max_guests && (
                      <div className="flex items-center gap-3 text-sm text-charcoal-muted">
                        <Users className="w-4 h-4" />
                        <span>
                          {t("detail.maxGuests", {
                            defaultValue: "Máximo",
                          })}{" "}
                          {offering.max_guests}{" "}
                          {t("detail.people", { defaultValue: "personas" })}
                        </span>
                      </div>
                    )}
                    {offering.location_label && (
                      <div className="flex items-center gap-3 text-sm text-charcoal-muted">
                        <MapPin className="w-4 h-4" />
                        <span>{offering.location_label}</span>
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <BookingCTA
                    offering={offering}
                    t={t}
                    className="w-full justify-center py-4!"
                  />

                  {/* Trust signals */}
                  <div className="mt-6 flex items-center justify-center gap-2 text-sm text-charcoal-muted">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>
                      {t("detail.cancellation", {
                        defaultValue: "Cancelación flexible hasta 48h antes",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dynamic Content Sections ──────────────────────────────────── */}
      <SectionRenderer sections={sections} />

      {/* ── Final CTA Section ─────────────────────────────────────────── */}
      <section className="bg-linear-to-br from-sage-dark via-sage to-emerald-600 py-20 md:py-28">
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

      {/* ── Lightbox ──────────────────────────────────────────────────── */}
      {lightboxOpen && (
        <ImageLightbox
          images={galleryImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
