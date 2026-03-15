/**
 * AuthSidePanel — panel lateral inmersivo para login/register.
 * Imagen + overlays + frase inspiracional + decoratives.
 */
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";

const AUTH_BG =
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&h=1800&fit=crop&crop=center&q=80";

/** Mandala SVG decorativo */
function MandalaSvg({ className }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="100"
        cy="100"
        r="90"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.3"
      />
      <circle
        cx="100"
        cy="100"
        r="70"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.25"
      />
      <circle
        cx="100"
        cy="100"
        r="50"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.2"
      />
      <circle
        cx="100"
        cy="100"
        r="30"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.15"
      />
      {/* Petals */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <ellipse
          key={deg}
          cx="100"
          cy="40"
          rx="12"
          ry="30"
          stroke="currentColor"
          strokeWidth="0.4"
          opacity="0.15"
          transform={`rotate(${deg} 100 100)`}
        />
      ))}
      {/* Inner petals */}
      {[15, 75, 135, 195, 255, 315].map((deg) => (
        <ellipse
          key={`inner-${deg}`}
          cx="100"
          cy="60"
          rx="8"
          ry="20"
          stroke="currentColor"
          strokeWidth="0.3"
          opacity="0.12"
          transform={`rotate(${deg} 100 100)`}
        />
      ))}
    </svg>
  );
}

export default function AuthSidePanel({ variant = "login" }) {
  const { t } = useTranslation("common");

  const quoteKey =
    variant === "login"
      ? "auth.sidePanel.quoteLogin"
      : "auth.sidePanel.quoteRegister";
  const authorKey =
    variant === "login"
      ? "auth.sidePanel.authorLogin"
      : "auth.sidePanel.authorRegister";

  return (
    <div className="hidden lg:flex relative w-full lg:w-1/2 xl:w-[55%] min-h-screen overflow-hidden">
      {/* Background image */}
      <img
        src={AUTH_BG}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center scale-105"
        loading="eager"
        fetchpriority="high"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-linear-to-br from-charcoal/88 via-charcoal/60 to-sage-darker/40" />
      <div className="absolute inset-0 bg-linear-to-t from-charcoal/70 via-transparent to-transparent" />

      {/* Decorative sage glow — top right */}
      <div
        className="absolute -top-40 -right-40 w-125 h-125 rounded-full bg-sage/12 blur-3xl animate-pulse-soft"
        aria-hidden="true"
      />
      {/* Decorative sage glow — bottom left */}
      <div
        className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-sage-light/8 blur-3xl"
        aria-hidden="true"
      />

      {/* Mandala decorativo flotante */}
      <MandalaSvg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-105 h-105 text-white/6 animate-spin-very-slow pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between w-full p-10 xl:p-16">
        {/* Top — Brand */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Omzone"
            className="h-8 w-auto object-contain brightness-0 invert opacity-80"
          />
        </div>

        {/* Center — Inspirational quote */}
        <div className="max-w-md animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/12 text-white/70 text-xs font-medium px-3.5 py-1.5 rounded-full mb-6">
            <Sparkles
              className="w-3.5 h-3.5 text-sage-light shrink-0"
              aria-hidden="true"
            />
            <span>Yoga & Wellness Kitchen</span>
          </div>

          <blockquote className="font-display text-3xl xl:text-4xl text-white font-semibold leading-snug tracking-tight mb-4 text-balance">
            &ldquo;{t(quoteKey)}&rdquo;
          </blockquote>
          <p className="text-white/45 text-sm">— {t(authorKey)}</p>
        </div>

        {/* Bottom — Social proof */}
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-9 h-9 rounded-full bg-sage/40 border-2 border-charcoal/50 backdrop-blur-sm"
                aria-hidden="true"
              />
            ))}
          </div>
          <div>
            <p className="text-white/80 text-sm font-medium">+200 alumnos</p>
            <p className="text-white/35 text-xs">confían en Omzone</p>
          </div>
        </div>
      </div>
    </div>
  );
}
