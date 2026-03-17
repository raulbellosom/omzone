import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
import ROUTES from "@/constants/routes";

/**
 * Visual config per pillar — image URL, route, and top-corner accent tint.
 * Images from Unsplash (free to use).
 */
const PILLAR_VISUALS = [
  {
    // Wellness Studio — yoga movement, natural light
    image:
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=900&h=1100&fit=crop&crop=center&q=80",
    href: ROUTES.CLASSES,
    tint: "from-sage/25",
    cardHeight: "h-[600px]",
  },
  {
    // Immersions — retreat, deep reconnection in nature
    image:
      "https://appwrite.racoondevs.com/v1/storage/buckets/stock-images/files/69b8efed000a9f40df28/view?project=69b37e1f001cce5d19cc&mode=admin",
    href: ROUTES.PACKAGES,
    tint: "from-indigo-900/30",
    cardHeight: "h-[460px]",
  },
  {
    // Stays — luxury private retreat, serenity
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&h=1100&fit=crop&crop=center&q=80",
    href: ROUTES.WELLNESS,
    tint: "from-amber-800/25",
    cardHeight: "h-[460px]",
  },
  {
    // Experiences — surf, ocean, nature
    image:
      "https://appwrite.racoondevs.com/v1/storage/buckets/stock-images/files/69b8ec0e00107c7915ca/view?project=69b37e1f001cce5d19cc&mode=admin",
    href: ROUTES.WELLNESS,
    tint: "from-sky-900/30",
    cardHeight: "h-[600px]",
  },
];

export default function FourPillarsSection() {
  const { t } = useTranslation("landing");
  const items = t("pillars.items", { returnObjects: true });

  const col1 = Array.isArray(items) ? [items[0], items[2]] : [];
  const col2 = Array.isArray(items) ? [items[1], items[3]] : [];

  return (
    <section
      aria-labelledby="pillars-heading"
      className="bg-charcoal pt-24 pb-28 md:pt-28 md:pb-32"
    >
      {/* ── Section header ─────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 md:mb-20">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div className="max-w-xl">
            <p className="text-sage-light text-xs font-semibold uppercase tracking-widest mb-5">
              {t("pillars.eyebrow")}
            </p>
            <h2
              id="pillars-heading"
              className="font-display text-5xl md:text-6xl lg:text-7xl text-white font-semibold leading-[0.92] tracking-tight text-balance"
            >
              {t("pillars.title")}
            </h2>
          </div>
          <p className="text-white/45 text-base lg:text-lg leading-relaxed lg:max-w-sm lg:text-right">
            {t("pillars.subtitle")}
          </p>
        </div>

        {/* Decorative divider */}
        <div
          className="mt-12 h-px bg-linear-to-r from-transparent via-white/15 to-transparent"
          aria-hidden="true"
        />
      </div>

      {/* ── Staggered 2-column card layout ─────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile: single column stack */}
        <div className="flex flex-col gap-3 sm:hidden">
          {Array.isArray(items) &&
            items.map((item, i) => (
              <PillarCard
                key={item.id}
                item={item}
                visual={PILLAR_VISUALS[i]}
                mobileHeight="h-[480px]"
                cta={t("pillars.cta")}
              />
            ))}
        </div>

        {/* sm–lg: regular 2-column grid */}
        <div className="hidden sm:grid lg:hidden grid-cols-2 gap-3">
          {Array.isArray(items) &&
            items.map((item, i) => (
              <PillarCard
                key={item.id}
                item={item}
                visual={{ ...PILLAR_VISUALS[i], cardHeight: "h-[440px]" }}
                cta={t("pillars.cta")}
              />
            ))}
        </div>

        {/* lg+: staggered 2-column layout (col-2 offset down) */}
        <div className="hidden lg:flex gap-4">
          {/* Column 1 — starts at normal position */}
          <div className="flex-1 flex flex-col gap-4">
            {col1.map((item, ci) => {
              const i = ci * 2; // indices 0, 2
              return (
                <PillarCard
                  key={item.id}
                  item={item}
                  visual={PILLAR_VISUALS[i]}
                  cta={t("pillars.cta")}
                />
              );
            })}
          </div>

          {/* Column 2 — offset down by 80px for stagger effect */}
          <div className="flex-1 flex flex-col gap-4 mt-20">
            {col2.map((item, ci) => {
              const i = ci * 2 + 1; // indices 1, 3
              return (
                <PillarCard
                  key={item.id}
                  item={item}
                  visual={PILLAR_VISUALS[i]}
                  cta={t("pillars.cta")}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function PillarCard({ item, visual, cta, mobileHeight }) {
  const heightClass = mobileHeight || visual.cardHeight;
  return (
    <article
      className={`relative ${heightClass} overflow-hidden rounded-3xl group cursor-pointer`}
    >
      {/* Background image with zoom on hover */}
      <img
        src={visual.image}
        alt={item.label}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.07]"
        loading="lazy"
      />

      {/* Gradient overlays */}
      {/* Deep dark fade from bottom → main readability layer */}
      <div className="absolute inset-0 bg-linear-to-t from-charcoal/95 via-charcoal/40 to-charcoal/5" />
      {/* Subtle color tint from top-left corner */}
      <div
        className={`absolute inset-0 bg-linear-to-br ${visual.tint} to-transparent opacity-80`}
      />

      {/* ── Card content ─────────────────────────────────────────── */}
      <div className="absolute inset-0 flex flex-col justify-between p-7 md:p-8">
        {/* Top row: large decorative number + category pill */}
        <div className="flex items-start justify-between">
          <span
            className="font-display text-[7rem] leading-none font-semibold select-none text-white/[0.07] -mt-4 -ml-2 transition-colors duration-500 group-hover:text-white/12"
            aria-hidden="true"
          >
            {item.id}
          </span>

          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/55 border border-white/15 px-3 py-1.5 rounded-full backdrop-blur-sm bg-white/5 shrink-0">
            Eje {item.id}
          </span>
        </div>

        {/* Bottom: tagline, title, description, CTA */}
        <div>
          {/* Tagline — subtle sage accent */}
          <p className="text-xs text-sage-light/75 uppercase tracking-widest font-medium mb-2">
            {item.tagline}
          </p>

          {/* Axis name — big, impactful */}
          <h3 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4 leading-tight">
            {item.label}
          </h3>

          {/* Description — visible, slides up slightly on hover */}
          <p className="text-sm text-white/55 leading-relaxed mb-6 max-w-[28ch] transition-all duration-500 translate-y-1 group-hover:translate-y-0 group-hover:text-white/70">
            {item.description}
          </p>

          {/* CTA */}
          <Link
            to={visual.href}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 border border-white/20 hover:border-white/70 hover:text-white hover:bg-white/10 px-5 py-2.5 rounded-full transition-all duration-300 backdrop-blur-sm group/btn"
            onClick={(e) => e.stopPropagation()}
          >
            {cta}
            <ArrowUpRight
              className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}
