import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Sparkles,
  ChevronDown,
  Waves,
  GlassWater,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";

// Hero carousel images — beach + yoga in Puerto Vallarta vibes
const HERO_IMAGES = [
  // 1. Playa tranquila atardecer
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=1080&fit=crop&crop=center&q=80",
  // 2. Yoga grupal en la playa
  "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=1920&h=1080&fit=crop&crop=center&q=80",
  // 3. Meditación playa al amanecer
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1920&h=1080&fit=crop&crop=center&q=80",
  // 4. Yoga pose frente al mar
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1920&h=1080&fit=crop&crop=center&q=80",
];

const SLIDE_INTERVAL = 6000;

export default function HeroSection() {
  const { t } = useTranslation("landing");

  const [current, setCurrent] = useState(0);

  const advance = useCallback(() => {
    setCurrent((prev) => (prev + 1) % HERO_IMAGES.length);
  }, []);

  useEffect(() => {
    const id = setInterval(advance, SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [advance]);

  return (
    <section
      aria-label="Bienvenida a Omzone"
      className="relative flex flex-col overflow-hidden"
      style={{ minHeight: "calc(100dvh - 4rem)" }}
    >
      {/* ── Background carousel ──────────────────────────────────── */}
      <div className="absolute inset-0">
        {HERO_IMAGES.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-[1800ms] ease-in-out"
            style={{ opacity: i === current ? 1 : 0 }}
            loading={i === 0 ? "eager" : "lazy"}
            fetchpriority={i === 0 ? "high" : undefined}
          />
        ))}
        {/* Ken Burns subtle zoom on active slide */}
        <div
          className="absolute inset-0 animate-hero-zoom pointer-events-none"
          key={current}
          aria-hidden="true"
        />
        {/* Left-to-right gradient: text is readable on left, image shows on right */}
        <div className="absolute inset-0 bg-linear-to-r from-charcoal/92 via-charcoal/65 to-charcoal/15" />
        {/* Bottom fade for scroll indicator */}
        <div className="absolute inset-0 bg-linear-to-t from-charcoal/50 via-transparent to-transparent" />
        {/* Subtle sage tint on the top-right */}
        <div
          className="absolute -top-32 right-0 w-150 h-150 rounded-full bg-sage/10 blur-3xl"
          aria-hidden="true"
        />
      </div>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="relative flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 md:py-20">
          <div className="max-w-2xl animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium px-4 py-2 rounded-full mb-8">
              <Sparkles
                className="w-4 h-4 text-sage-light shrink-0"
                aria-hidden="true"
              />
              {t("hero.badge")}
            </div>

            {/* H1 */}
            <h1 className="font-display text-6xl sm:text-7xl md:text-8xl text-white font-semibold leading-[0.92] tracking-tight mb-6">
              {t("hero.headline")
                .split("\n")
                .map((line, i) => (
                  <span
                    key={i}
                    className={i > 0 ? "block text-sage-light" : "block"}
                  >
                    {line}
                  </span>
                ))}
            </h1>

            <p className="text-white/65 text-lg sm:text-xl leading-relaxed max-w-lg mb-10">
              {t("hero.subheadline")}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                size="xl"
                className="group shadow-lg shadow-sage/30"
              >
                <Link to={ROUTES.CLASSES}>
                  {t("hero.ctaMain")}
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
                className="border-white/25 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                <Link to={ROUTES.PACKAGES}>{t("hero.ctaSecondary")}</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-12 pt-8 border-t border-white/12">
              <HeroStat value="+200" label="alumnos activos" />
              <div
                className="w-px h-8 bg-white/12 hidden sm:block"
                aria-hidden="true"
              />
              <HeroStat value="4.9★" label="valoración media" />
              <div
                className="w-px h-8 bg-white/12 hidden sm:block"
                aria-hidden="true"
              />
              <HeroStat value="6" label="tipos de clase" />
            </div>
          </div>
        </div>

        {/* Floating visual card — desktop only */}
        <div className="absolute right-8 lg:right-16 xl:right-24 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4 w-64 animate-fade-in">
          {/* Class card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-sage/80 flex items-center justify-center shrink-0">
                <Waves className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  Morning Flow
                </p>
                <p className="text-xs text-white/55">Mario Zen · 60 min</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/50 bg-white/10 px-2.5 py-1 rounded-full">
                7:00 AM
              </span>
              <span className="text-sm font-bold text-sage-light">$180</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
              <div className="h-full w-7/12 bg-sage-light rounded-full" />
            </div>
            <p className="text-xs text-white/40 mt-1">7 / 12 lugares</p>
          </div>

          {/* Package card */}
          <div className="bg-sage/80 backdrop-blur-md border border-sage-light/30 rounded-2xl p-4 shadow-xl ml-6">
            <p className="text-xs font-medium text-sage-light/80 uppercase tracking-wider mb-1">
              Paquete activo
            </p>
            <p className="text-sm font-semibold text-white">Yoga · 8 sesiones</p>
            <p className="text-xs text-white/55 mt-0.5">Vence en 18 días</p>
            <div className="flex gap-1 mt-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full bg-white/20 border border-white/30"
                  aria-hidden="true"
                />
              ))}
              <span className="text-xs text-white/50 ml-1 self-center">
                +12
              </span>
            </div>
          </div>

          {/* Wellness card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 shadow-xl flex items-center gap-3 -ml-2">
            <GlassWater
              className="w-5 h-5 text-white/60 shrink-0"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white truncate">
                Green Balance
              </p>
              <p className="text-xs text-white/45">Wellness Kitchen</p>
            </div>
            <span className="text-sm font-bold text-sage-light shrink-0">
              $95
            </span>
          </div>
        </div>
      </div>

      {/* ── Scroll indicator + slide dots ────────────────────────── */}
      <div
        className="relative flex flex-col items-center gap-3 pb-8"
        aria-hidden="true"
      >
        <div className="flex gap-2">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === current
                  ? "w-8 bg-white/80"
                  : "w-2 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Imagen ${i + 1}`}
            />
          ))}
        </div>
        <ChevronDown className="w-5 h-5 text-white/35 animate-bounce" />
      </div>
    </section>
  );
}

function HeroStat({ value, label }) {
  return (
    <div>
      <p className="text-xl font-bold text-white leading-none">{value}</p>
      <p className="text-xs text-white/45 mt-0.5">{label}</p>
    </div>
  );
}
