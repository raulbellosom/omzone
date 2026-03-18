/**
 * ClassCard — tarjeta de clase con diseño hero de imagen de fondo.
 *
 * Variantes (prop `layout`):
 *   "overlay"   — imagen a pantalla completa con texto sobre gradiente (default)
 *   "split"     — imagen superior 55 % + contenido en blanco debajo
 *   "compact"   — fila horizontal compacta (sidebar / listas)
 *
 * La imagen de fondo viene de `session.cover_image_id` (primero) o
 * `cls.cover_image_id` (fallback), con gradiente de tipo como último recurso.
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
  Users,
  Waves,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DifficultyBadge from "./DifficultyBadge";
import { useCurrency } from "@/hooks/useCurrency";
import { formatDuration } from "@/lib/dates";
import { getPreviewUrl } from "@/lib/media";
import { BUCKET_PUBLIC_MEDIA } from "@/env";
import { resolveField } from "@/lib/i18n-data";
import { useAuth } from "@/hooks/useAuth";
import ROUTES from "@/constants/routes";
import { cn } from "@/lib/utils";

// ── Paleta por tipo de clase ──────────────────────────────────────────────────

const TYPE_GRADIENT = {
  vinyasa: "from-teal-900 via-teal-800 to-emerald-900",
  restorative: "from-stone-800 via-stone-700 to-neutral-800",
  power: "from-slate-900 via-slate-800 to-zinc-900",
  yin: "from-indigo-950 via-violet-900 to-slate-900",
  hatha: "from-amber-900 via-orange-900 to-stone-900",
  meditation: "from-violet-950 via-indigo-900 to-slate-950",
  default: "from-zinc-900 via-neutral-800 to-stone-900",
};

const TYPE_ACCENT = {
  vinyasa: "from-teal-500/30 to-emerald-500/20",
  restorative: "from-amber-500/20 to-orange-500/10",
  power: "from-blue-500/30 to-cyan-500/20",
  yin: "from-violet-500/25 to-indigo-500/15",
  hatha: "from-orange-500/25 to-amber-500/15",
  meditation: "from-purple-500/25 to-violet-500/15",
  default: "from-sage/20 to-sage/10",
};

const TYPE_ICON = {
  vinyasa: Waves,
  restorative: Heart,
  power: Zap,
  yin: Moon,
  hatha: Sun,
  meditation: Sparkles,
  default: Activity,
};

// ── Componente principal ──────────────────────────────────────────────────────

export default function ClassCard({
  cls,
  session,
  layout = "overlay",
  compact = false,
}) {
  const { t } = useTranslation("classes");
  if (!cls) return null;

  // compact prop = backwards-compat
  if (compact || layout === "compact")
    return <ClassCardCompact cls={cls} session={session} t={t} />;
  if (layout === "split")
    return <ClassCardSplit cls={cls} session={session} t={t} />;
  return <ClassCardOverlay cls={cls} session={session} t={t} />;
}

// ── Datos compartidos ─────────────────────────────────────────────────────────

function useCardData(cls, session) {
  const { formatPrice } = useCurrency();
  const typeSlug = cls.class_type?.slug ?? "default";
  const gradient = TYPE_GRADIENT[typeSlug] ?? TYPE_GRADIENT.default;
  const accent = TYPE_ACCENT[typeSlug] ?? TYPE_ACCENT.default;
  const TypeIcon = TYPE_ICON[typeSlug] ?? TYPE_ICON.default;

  const title = resolveField(cls, "title");
  const summary = resolveField(cls, "summary");
  const typeLabel = resolveField(cls.class_type, "name") || typeSlug;

  // Imagen: sesión → clase → null (usa gradiente)
  const imgFileId = session?.cover_image_id || cls.cover_image_id || null;
  const imgBucket =
    (session?.cover_image_id
      ? session.cover_image_bucket
      : cls.cover_image_bucket) ?? null;
  const imgUrl = imgFileId
    ? getPreviewUrl(imgFileId, imgBucket ?? BUCKET_PUBLIC_MEDIA, 900, 1200, 85)
    : null;

  const spotsLeft = session
    ? session.capacity_total - session.capacity_taken
    : null;
  const isFull = session?.status === "full" || spotsLeft === 0;
  const price = formatPrice(session?.price_override ?? cls.base_price);

  return {
    typeSlug,
    gradient,
    accent,
    TypeIcon,
    title,
    summary,
    typeLabel,
    imgUrl,
    spotsLeft,
    isFull,
    price,
  };
}

// ── OVERLAY — imagen a pantalla completa, todo el texto encima ────────────────

function ClassCardOverlay({ cls, session, t }) {
  const {
    gradient,
    accent,
    TypeIcon,
    title,
    summary,
    typeLabel,
    imgUrl,
    spotsLeft,
    isFull,
    price,
  } = useCardData(cls, session);
  const { user } = useAuth();

  return (
    <article className="group relative overflow-hidden rounded-3xl cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 aspect-3/4">
      {/* ── Fondo: imagen real o gradiente ── */}
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
          <div
            className={cn(
              "absolute inset-0 bg-linear-to-tr opacity-60",
              accent,
            )}
          />
          <TypeIcon
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 text-white/6"
            aria-hidden="true"
          />
        </>
      )}

      {/* ── Gradiente de legibilidad (abajo → oscuro) ── */}
      <div className="absolute inset-0 bg-linear-to-t from-black/92 via-black/25 to-transparent pointer-events-none" />
      {/* Vignette lateral muy sutil */}
      <div className="absolute inset-0 bg-linear-to-r from-black/10 via-transparent to-black/10 pointer-events-none" />

      {/* ── Badges superiores (glass) ── */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2 z-10 pointer-events-none">
        <span
          className="text-[10px] uppercase tracking-widest font-semibold text-white
                         bg-white/12 backdrop-blur-md border border-white/15
                         rounded-full px-3 py-1 leading-none"
        >
          {typeLabel}
        </span>
        <span className="pointer-events-auto">
          <DifficultyBadge
            difficulty={cls.difficulty}
            className="bg-white/12 backdrop-blur-md border border-white/15 text-white/90 rounded-full text-[10px] shrink-0"
          />
        </span>
      </div>

      {/* ── Clase llena ── */}
      {isFull && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 pointer-events-none">
          <span
            className="text-white font-bold text-base uppercase tracking-[0.2em]
                           border border-white/40 rounded-full px-6 py-2 backdrop-blur-sm"
          >
            {t("card.fullClass")}
          </span>
        </div>
      )}

      {/* ── Contenido inferior ── */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10 space-y-3">
        <h3 className="text-white text-xl font-bold leading-tight line-clamp-2 drop-shadow-sm">
          {title}
        </h3>

        {summary && (
          <p className="text-white/60 text-sm leading-relaxed line-clamp-2">
            {summary}
          </p>
        )}

        {/* Duración · spots · precio */}
        <div className="flex items-center justify-between text-xs text-white/55 pt-0.5">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              {formatDuration(cls.duration_min)}
            </span>
            {spotsLeft !== null && !isFull && (
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" aria-hidden="true" />
                {t("card.spots", { count: spotsLeft })}
              </span>
            )}
          </div>
          {user && (
            <span className="text-base font-bold text-white">{price}</span>
          )}
        </div>

        {/* CTA — link normal para no romper el hover del artículo */}
        <Link
          to={ROUTES.CLASS_DETAIL(cls.slug)}
          className={cn(
            "relative z-20 flex w-full items-center justify-center gap-2 rounded-2xl py-3",
            "text-sm font-semibold transition-all duration-200 active:scale-[0.98]",
            isFull
              ? "bg-white/10 text-white/40 pointer-events-none"
              : "bg-white text-charcoal hover:bg-white/90 shadow-sm",
          )}
        >
          {isFull ? t("card.noSpots") : t("card.book")}
          {!isFull && <ArrowRight className="w-4 h-4" />}
        </Link>
      </div>
    </article>
  );
}

// ── SPLIT — imagen arriba, contenido en blanco abajo ─────────────────────────

function ClassCardSplit({ cls, session, t }) {
  const {
    gradient,
    accent,
    TypeIcon,
    title,
    summary,
    typeLabel,
    imgUrl,
    spotsLeft,
    isFull,
    price,
  } = useCardData(cls, session);
  const { user } = useAuth();

  return (
    <article className="group rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-400 hover:-translate-y-0.5 flex flex-col bg-white border border-warm-gray-dark/30">
      {/* ── Imagen ── */}
      <Link
        to={ROUTES.CLASS_DETAIL(cls.slug)}
        className="relative block overflow-hidden shrink-0"
        style={{ aspectRatio: "16/9" }}
        tabIndex={-1}
        aria-hidden="true"
      >
        {imgUrl ? (
          <img
            src={imgUrl}
            alt=""
            className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-105"
          />
        ) : (
          <>
            <div className={cn("absolute inset-0 bg-linear-to-br", gradient)} />
            <div
              className={cn(
                "absolute inset-0 bg-linear-to-tr opacity-50",
                accent,
              )}
            />
            <TypeIcon
              className="absolute inset-0 m-auto w-14 h-14 text-white/15"
              aria-hidden="true"
            />
          </>
        )}
        <span
          className="absolute top-3 left-3 text-[10px] uppercase tracking-widest font-semibold
                         text-white bg-black/35 backdrop-blur-md border border-white/15
                         rounded-full px-3 py-1 leading-none"
        >
          {typeLabel}
        </span>
        {isFull && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="charcoal">{t("card.fullClass")}</Badge>
          </div>
        )}
      </Link>

      {/* ── Contenido ── */}
      <div className="flex flex-col flex-1 p-5 gap-0">
        <Link to={ROUTES.CLASS_DETAIL(cls.slug)} className="block mb-2">
          <h3 className="text-lg font-bold text-charcoal leading-snug group-hover:text-sage transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>

        <DifficultyBadge
          difficulty={cls.difficulty}
          className="self-start mb-3"
        />

        {summary && (
          <p className="text-sm text-charcoal-muted line-clamp-2 mb-3 leading-relaxed">
            {summary}
          </p>
        )}

        <div className="mt-auto pt-3 border-t border-warm-gray-dark/50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-xs text-charcoal-muted min-w-0">
            <span className="flex items-center gap-1.5 shrink-0">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(cls.duration_min)}
            </span>
            {spotsLeft !== null && !isFull && (
              <span className="flex items-center gap-1.5 shrink-0">
                <Users className="w-3.5 h-3.5" />
                {t("card.spots", { count: spotsLeft })}
              </span>
            )}
          </div>
          {user && (
            <span className="font-bold text-sage text-sm shrink-0">
              {price}
            </span>
          )}
        </div>

        <Button
          asChild
          size="sm"
          variant={isFull ? "sand" : "default"}
          disabled={isFull}
          className="mt-3 w-full"
        >
          <Link to={ROUTES.CLASS_DETAIL(cls.slug)}>
            {isFull ? t("card.noSpots") : t("card.book")}
            {!isFull && <ArrowRight className="w-3.5 h-3.5" />}
          </Link>
        </Button>
      </div>
    </article>
  );
}

// ── COMPACT — fila horizontal (sidebar / listas) ──────────────────────────────

function ClassCardCompact({ cls, session, t }) {
  const { gradient, TypeIcon, title, imgUrl, price } = useCardData(
    cls,
    session,
  );
  const { user } = useAuth();

  return (
    <article className="group flex flex-row h-20 rounded-2xl overflow-hidden bg-white border border-warm-gray-dark/30 hover:shadow-card-hover transition-all duration-300 cursor-pointer">
      <Link
        to={ROUTES.CLASS_DETAIL(cls.slug)}
        className="relative w-20 shrink-0 overflow-hidden"
        aria-label={title}
        tabIndex={-1}
      >
        {imgUrl ? (
          <img
            src={imgUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className={cn("absolute inset-0 bg-linear-to-br", gradient)}>
            <TypeIcon
              className="absolute inset-0 m-auto w-7 h-7 text-white/20"
              aria-hidden="true"
            />
          </div>
        )}
      </Link>
      <div className="flex flex-col justify-center px-3 py-2 min-w-0 flex-1">
        <Link to={ROUTES.CLASS_DETAIL(cls.slug)} className="block">
          <h3 className="text-sm font-semibold text-charcoal truncate group-hover:text-sage transition-colors">
            {title}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-charcoal-muted">
          <Clock className="w-3 h-3" />
          <span>{formatDuration(cls.duration_min)}</span>
          {user && (
            <span className="font-semibold text-sage ml-auto">{price}</span>
          )}
        </div>
      </div>
    </article>
  );
}
