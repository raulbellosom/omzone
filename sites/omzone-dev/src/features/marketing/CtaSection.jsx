import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";

// Placeholder — swap for a real studio/class photo before production
const CTA_IMAGE =
  "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=800&h=1000&fit=crop&crop=center&q=80";

export default function CtaSection() {
  const { t } = useTranslation("landing");

  return (
    <section
      aria-labelledby="cta-heading"
      className="relative bg-charcoal overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 min-h-120">
          {/* ── Text column ────────────────────────────────────── */}
          <div className="relative z-10 flex flex-col justify-center py-20 md:py-28 pr-0 lg:pr-16">
            {/* Decorative blob */}
            <div
              className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-sage/15 blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            <p className="relative text-sage-light text-xs font-semibold uppercase tracking-widest mb-4">
              Empieza hoy
            </p>
            <h2
              id="cta-heading"
              className="relative font-display text-4xl md:text-5xl lg:text-6xl text-white font-semibold mb-5 text-balance leading-none"
            >
              {t("cta_section.title")}
            </h2>
            <p className="relative text-white/60 text-lg mb-10 max-w-md">
              {t("cta_section.subtitle")}
            </p>

            <div className="relative flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="xl"
                className="bg-sage hover:bg-sage-dark text-white group shadow-lg shadow-sage/25"
              >
                <Link to={ROUTES.CLASSES}>
                  {t("cta_section.ctaMain")}
                  <ArrowRight
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </Button>
              <Button
                asChild
                size="xl"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/8"
              >
                <Link to={ROUTES.PACKAGES}>
                  {t("cta_section.ctaSecondary")}
                </Link>
              </Button>
            </div>

            {/* Trust note */}
            <p className="relative text-white/30 text-xs mt-8">
              Sin compromisos · Cancela cuando quieras · Primera clase flexible
            </p>
          </div>

          {/* ── Image column ───────────────────────────────────── */}
          <div className="hidden lg:block relative">
            <img
              src={CTA_IMAGE}
              alt="Clase de yoga en Omzone"
              className="absolute inset-0 w-full h-full object-cover object-center"
              loading="lazy"
            />
            {/* Fade into dark on the left edge */}
            <div className="absolute inset-0 bg-linear-to-r from-charcoal via-charcoal/20 to-transparent" />
            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-charcoal to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
