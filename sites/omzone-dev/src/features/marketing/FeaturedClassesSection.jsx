/**
 * FeaturedClassesSection — cada clase destacada ocupa su propio bloque editorial:
 * imagen panorámica a la izquierda + contenido a la derecha (sin precio).
 */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Activity,
  ArrowRight,
  Clock,
  Heart,
  Moon,
  Sparkles,
  Sun,
  Waves,
  Zap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getMediaPreviewUrl } from "@/lib/media";
import { resolveField } from "@/lib/i18n-data";
import { formatDuration } from "@/lib/dates";
import { useClasses } from "@/hooks/useClasses";
import ROUTES from "@/constants/routes";
import { cn } from "@/lib/utils";

const GRADIENT = {
  vinyasa: "from-teal-900 via-teal-800 to-emerald-900",
  restorative: "from-stone-800 via-stone-700 to-neutral-800",
  power: "from-slate-900 via-slate-800 to-zinc-900",
  yin: "from-indigo-950 via-violet-900 to-slate-900",
  hatha: "from-amber-900 via-orange-900 to-stone-900",
  meditation: "from-violet-950 via-indigo-900 to-slate-950",
  default: "from-zinc-900 via-neutral-800 to-stone-900",
};

const ICON = {
  vinyasa: Waves,
  restorative: Heart,
  power: Zap,
  yin: Moon,
  hatha: Sun,
  meditation: Sparkles,
  default: Activity,
};

export default function FeaturedClassesSection() {
  const { t } = useTranslation("landing");
  const { data: classes, isLoading } = useClasses({ featured: true });

  return (
    <section
      aria-labelledby="featured-classes-heading"
      className="bg-cream py-20 md:py-28"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div className="max-w-lg">
            <h2
              id="featured-classes-heading"
              className="font-display text-3xl md:text-4xl text-charcoal font-semibold mb-3 text-balance"
            >
              {t("classes.title")}
            </h2>
            <p className="text-charcoal-muted leading-relaxed">
              {t("classes.subtitle")}
            </p>
          </div>
          <Link
            to={ROUTES.CLASSES}
            className="inline-flex items-center gap-2 text-sm text-charcoal-muted hover:text-charcoal border border-warm-gray-dark/40 hover:border-charcoal/30 rounded-full px-5 py-2.5 transition-colors shrink-0 self-start sm:self-auto"
          >
            {t("classes.cta")}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Editorial blocks */}
        {isLoading ? (
          <div className="space-y-8">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-105 w-full rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {classes?.map((cls) => (
              <FeaturedClassBlock key={cls.$id} cls={cls} t={t} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FeaturedClassBlock({ cls, t }) {
  const typeSlug = cls.class_type?.slug ?? "default";
  const gradient = GRADIENT[typeSlug] ?? GRADIENT.default;
  const TypeIcon = ICON[typeSlug] ?? ICON.default;
  const title = resolveField(cls, "title");
  const summary = resolveField(cls, "summary");
  const typeLabel = resolveField(cls.class_type, "name") || typeSlug;
  const imgUrl = cls.cover_image_id
    ? getMediaPreviewUrl(cls.cover_image_id, 1200, 800, 85)
    : null;

  return (
    <article className="group grid grid-cols-1 md:grid-cols-[3fr_2fr] min-h-105 md:min-h-120 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500">
      {/* ── Imagen (lado izquierdo en desktop, arriba en móvil) ── */}
      <div
        className="relative block overflow-hidden min-h-65 md:min-h-0"
        aria-hidden="true"
      >
        {imgUrl ? (
          <img
            src={imgUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <>
            <div className={cn("absolute inset-0 bg-linear-to-br", gradient)} />
            <TypeIcon
              className="absolute inset-0 m-auto w-28 h-28 text-white/8"
              aria-hidden="true"
            />
          </>
        )}

        {/* Overlay muy sutil para suavizar la imagen */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />

        {/* Badge tipo (sobre imagen) */}
        <span
          className="absolute top-5 left-5 text-[10px] uppercase tracking-[0.18em] font-semibold
                         text-white bg-black/30 backdrop-blur-md border border-white/15
                         rounded-full px-3 py-1.5 leading-none pointer-events-none"
        >
          {typeLabel}
        </span>
      </div>

      {/* ── Contenido (lado derecho en desktop, abajo en móvil) ── */}
      <div className="flex flex-col justify-center bg-white px-8 py-10 md:px-10 md:py-12">
        <p className="text-xs uppercase tracking-[0.22em] text-sage font-semibold mb-4">
          {typeLabel}
        </p>

        <Link to={ROUTES.CLASS_DETAIL(cls.slug)} className="block mb-4">
          <h3
            className="font-display text-2xl md:text-3xl lg:text-4xl text-charcoal font-bold
                         leading-tight group-hover:text-sage transition-colors duration-300"
          >
            {title}
          </h3>
        </Link>

        {summary && (
          <p className="text-charcoal-muted leading-relaxed mb-6 line-clamp-3 text-sm md:text-base">
            {summary}
          </p>
        )}

        <div className="flex items-center gap-2 text-sm text-charcoal-subtle mb-8">
          <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{formatDuration(cls.duration_min)}</span>
        </div>

        <Link
          to={ROUTES.CLASS_DETAIL(cls.slug)}
          className="inline-flex items-center gap-2 self-start bg-charcoal text-white
                     rounded-2xl px-7 py-3.5 text-sm font-semibold
                     hover:bg-charcoal/85 active:scale-[0.98] transition-all duration-200"
        >
          {t("classes.reserve", "Reservar")}
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
