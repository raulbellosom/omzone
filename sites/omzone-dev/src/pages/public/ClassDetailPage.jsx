import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Clock,
  Users,
  ArrowRight,
  MapPin,
  Calendar,
  ChevronLeft,
  Plus,
  Check,
  Waves,
  Heart,
  Zap,
  Moon,
  Sun,
  Sparkles,
  Activity,
  Lock,
} from "lucide-react";
import { useState } from "react";
import PageMeta from "@/components/seo/PageMeta";
import StructuredData from "@/components/seo/StructuredData";
import DifficultyBadge from "@/features/classes/DifficultyBadge";
import InstructorMini from "@/features/shared/InstructorMini";
import ProductCard from "@/features/wellness/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useClassBySlug, useSessionsByClass } from "@/hooks/useClasses";
import { useClassExtras } from "@/hooks/useWellness";
import { useAuth } from "@/hooks/useAuth";
import { resolveField } from "@/lib/i18n-data";
import { formatMXN } from "@/lib/currency";
import { formatDateTime, formatDuration } from "@/lib/dates";
import { getMediaPreviewUrl } from "@/lib/media";
import ROUTES from "@/constants/routes";
import { cn } from "@/lib/utils";
import { buildClassStructuredData } from "@/lib/seo";
import { APP_BASE_URL } from "@/env";

const BASE_URL = APP_BASE_URL;

const TYPE_GRADIENTS = {
  vinyasa: "from-sage-muted to-sage-light",
  restorative: "from-sand to-sand-light",
  power: "from-olive-light to-sage-muted",
  yin: "from-sage-muted to-cream-dark",
  hatha: "from-sand-dark to-sand",
  meditation: "from-sage-light to-cream",
};
const TYPE_ICON = {
  vinyasa: Waves,
  restorative: Heart,
  power: Zap,
  yin: Moon,
  hatha: Sun,
  meditation: Sparkles,
};

export default function ClassDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("classes");
  const { t: tc } = useTranslation("common");
  const { user } = useAuth();

  const { data: cls, isLoading: loadingClass } = useClassBySlug(slug);
  const { data: sessions, isLoading: loadingSessions } = useSessionsByClass(
    cls?.$id,
  );
  const { data: extras } = useClassExtras();

  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);

  if (loadingClass) return <ClassDetailSkeleton />;
  if (!cls) return <NotFound />;

  const title = resolveField(cls, "title");
  const description = resolveField(cls, "description");
  const typeSlug = cls.class_type?.slug ?? "default";
  const gradient = TYPE_GRADIENTS[typeSlug] ?? "from-warm-gray to-sand";
  const TypeIcon = TYPE_ICON[typeSlug] ?? Activity;
  const typeLabel = resolveField(cls.class_type, "name");

  const activeSession = selectedSession ?? sessions?.[0];
  const price = activeSession?.price_override ?? cls.base_price;
  const spotsLeft = activeSession
    ? activeSession.capacity_total - activeSession.capacity_taken
    : null;

  // Imagen de portada: sesión activa → clase → null (usa gradiente)
  const coverFileId =
    activeSession?.cover_image_id || cls.cover_image_id || null;
  const coverImgUrl = coverFileId
    ? getMediaPreviewUrl(coverFileId, 1400, 640, 88)
    : null;

  // Precio total con extras seleccionados
  const extrasTotal = selectedExtras.reduce((sum, id) => {
    const p = extras?.find((e) => e.$id === id);
    return sum + (p?.price ?? 0);
  }, 0);

  function toggleExtra(id) {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleBookNow() {
    if (!activeSession || activeSession.status === "full") return;
    if (!user) {
      navigate(
        `${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.BOOKING(activeSession.$id))}`,
      );
      return;
    }
    navigate(ROUTES.BOOKING(activeSession.$id), {
      state: { classId: cls.$id, extras: selectedExtras },
    });
  }

  // Structured data
  const structuredData = buildClassStructuredData(cls, activeSession);

  return (
    <>
      <PageMeta
        title={`${title} · Clases de Yoga`}
        description={resolveField(cls, "summary") || description.slice(0, 155)}
        canonical={`${BASE_URL}/classes/${cls.slug}`}
        ogType="article"
        locale="es"
      />
      <StructuredData data={structuredData} />

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav aria-label="Navegación de ruta" className="mb-6">
          <Link
            to={ROUTES.CLASSES}
            className="inline-flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-sage transition-colors"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            {t("catalog.title")}
          </Link>
        </nav>

        <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
          {/* ── Columna principal ──────────────────────────────────────── */}
          <div>
            {/* Hero visual */}
            <div
              className={cn(
                "relative h-64 md:h-96 rounded-3xl overflow-hidden mb-6",
                !coverImgUrl && "bg-linear-to-br",
                !coverImgUrl && gradient,
              )}
            >
              {coverImgUrl ? (
                <img
                  src={coverImgUrl}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <TypeIcon
                  className="absolute inset-0 m-auto w-32 h-32 text-white/20"
                  aria-hidden="true"
                />
              )}
              {/* gradient overlay for readability of badges */}
              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge
                  variant="charcoal"
                  className="text-xs uppercase tracking-wider"
                >
                  {typeLabel}
                </Badge>
                {cls.is_featured && (
                  <Badge variant="sage">{tc("badges.featured")}</Badge>
                )}
              </div>
            </div>

            {/* Título e info rápida (sin precio — aparece en el panel de reserva) */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
              <div>
                <h1 className="font-display text-3xl md:text-4xl text-charcoal font-semibold mb-2">
                  {title}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <DifficultyBadge difficulty={cls.difficulty} />
                  <span className="text-sm text-charcoal-muted flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    {formatDuration(cls.duration_min)}
                  </span>
                  {spotsLeft !== null && (
                    <span
                      className={cn(
                        "text-sm flex items-center gap-1",
                        spotsLeft < 4
                          ? "text-amber-600"
                          : "text-charcoal-muted",
                      )}
                    >
                      <Users className="w-3.5 h-3.5" aria-hidden="true" />
                      {t("card.spots", { count: spotsLeft })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Descripción */}
            <section aria-labelledby="about-class-heading" className="mb-8">
              <h2
                id="about-class-heading"
                className="text-lg font-semibold text-charcoal mb-3"
              >
                {t("detail.about")}
              </h2>
              <p className="text-charcoal-muted leading-relaxed">
                {description}
              </p>
            </section>

            {/* Instructor */}
            {cls.instructor && (
              <section
                aria-labelledby="instructor-heading"
                className="bg-warm-gray rounded-2xl p-5 mb-8"
              >
                <h2
                  id="instructor-heading"
                  className="text-sm font-semibold text-charcoal mb-3"
                >
                  {t("detail.instructor")}
                </h2>
                <InstructorMini instructor={cls.instructor} />
                {cls.instructor.short_bio && (
                  <p className="text-sm text-charcoal-muted mt-2 ml-11">
                    {cls.instructor.short_bio}
                  </p>
                )}
              </section>
            )}

            {/* Sesiones / Horarios */}
            <section aria-labelledby="sessions-heading" className="mb-8">
              <h2
                id="sessions-heading"
                className="text-lg font-semibold text-charcoal mb-4"
              >
                {t("detail.schedule")}
              </h2>
              {loadingSessions ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 rounded-xl" />
                  <Skeleton className="h-16 rounded-xl" />
                </div>
              ) : sessions?.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {sessions.map((sess) => {
                    const spots = sess.capacity_total - sess.capacity_taken;
                    const full = sess.status === "full" || spots === 0;
                    const active = activeSession?.$id === sess.$id;
                    return (
                      <button
                        key={sess.$id}
                        onClick={() => !full && setSelectedSession(sess)}
                        disabled={full}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-150",
                          full
                            ? "border-warm-gray-dark bg-warm-gray opacity-60 cursor-not-allowed"
                            : active
                              ? "border-sage bg-sage-muted/30 shadow-sm"
                              : "border-warm-gray-dark bg-white hover:border-sage hover:bg-sage-muted/10",
                        )}
                        aria-pressed={active}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium text-charcoal flex items-center gap-2">
                            <Calendar
                              className="w-4 h-4 text-sage shrink-0"
                              aria-hidden="true"
                            />
                            {formatDateTime(sess.session_date)}
                          </span>
                          <span className="text-xs text-charcoal-muted flex items-center gap-1 ml-6">
                            <MapPin className="w-3 h-3" aria-hidden="true" />
                            {sess.location_label}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {full ? (
                            <Badge variant="warm">
                              {t("detail.sessionFull")}
                            </Badge>
                          ) : (
                            <>
                              <span
                                className={cn(
                                  "text-xs",
                                  spots < 4
                                    ? "text-amber-600 font-medium"
                                    : "text-charcoal-muted",
                                )}
                              >
                                {t("card.spots", { count: spots })}
                              </span>
                              {active && user && (
                                <span className="text-xs font-semibold text-sage">
                                  {formatMXN(
                                    sess.price_override ?? cls.base_price,
                                  )}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-charcoal-muted text-sm">
                  {t("detail.noSessions")}
                </p>
              )}
            </section>

            {/* Extras opcionales */}
            {extras?.length > 0 && (
              <section aria-labelledby="extras-heading" className="mb-8">
                <div className="mb-4">
                  <h2
                    id="extras-heading"
                    className="text-lg font-semibold text-charcoal"
                  >
                    {t("detail.extras")}
                  </h2>
                  <p className="text-sm text-charcoal-muted">
                    {t("detail.extrasDesc")}
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {extras.slice(0, 4).map((product) => {
                    const isSelected = selectedExtras.includes(product.$id);
                    return (
                      <div
                        key={product.$id}
                        className={cn(
                          "relative rounded-2xl border transition-all duration-150 cursor-pointer",
                          isSelected
                            ? "border-sage shadow-sm"
                            : "border-warm-gray-dark hover:border-sage/50",
                        )}
                        onClick={() => toggleExtra(product.$id)}
                        role="checkbox"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onKeyDown={(e) =>
                          e.key === " " && toggleExtra(product.$id)
                        }
                      >
                        {isSelected && (
                          <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-sage flex items-center justify-center z-10">
                            <Check
                              className="w-3 h-3 text-white"
                              aria-hidden="true"
                            />
                          </span>
                        )}
                        <ProductCard product={product} compact />
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* ── Sidebar de reserva (sticky) ────────────────────────────── */}
          <aside className="lg:sticky lg:top-24">
            {user ? (
              <div className="bg-white rounded-2xl border border-warm-gray-dark/50 shadow-card p-5">
                <h3 className="text-base font-semibold text-charcoal mb-4">
                  {t("detail.selectSession")}
                </h3>

                {/* Resumen de sesión seleccionada */}
                {activeSession && (
                  <div className="bg-cream rounded-xl p-3 mb-4 text-sm">
                    <p className="font-medium text-charcoal flex items-center gap-1.5">
                      <Calendar
                        className="w-4 h-4 text-sage"
                        aria-hidden="true"
                      />
                      {formatDateTime(activeSession.session_date)}
                    </p>
                    <p className="text-charcoal-muted text-xs mt-1 ml-5">
                      {activeSession.location_label} ·{" "}
                      {formatDuration(cls.duration_min)}
                    </p>
                  </div>
                )}

                {/* Desglose de precio */}
                <div className="space-y-2 py-4 border-y border-warm-gray-dark/50 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">{title}</span>
                    <span className="font-medium">{formatMXN(price)}</span>
                  </div>
                  {selectedExtras.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-muted">
                        {t("detail.extrasCount", {
                          count: selectedExtras.length,
                        })}
                      </span>
                      <span className="font-medium">
                        {formatMXN(extrasTotal)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-warm-gray-dark/40 text-base font-bold text-charcoal">
                    <span>{t("detail.total")}</span>
                    <span className="text-sage">
                      {formatMXN(price + extrasTotal)}
                    </span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  disabled={!activeSession || activeSession.status === "full"}
                  onClick={handleBookNow}
                >
                  {t("detail.bookNow")}
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Button>

                <p className="text-center text-xs text-charcoal-subtle mt-3">
                  {t("detail.noFees")}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-warm-gray-dark/50 shadow-card p-8 text-center space-y-5">
                <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center mx-auto">
                  <Lock
                    className="w-5 h-5 text-charcoal-subtle"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="font-semibold text-charcoal mb-1">
                    {t("detail.guestTitle", "Inicia sesión para reservar")}
                  </p>
                  <p className="text-sm text-charcoal-muted">
                    {t(
                      "detail.guestSubtitle",
                      "Crea una cuenta para ver precios y disponibilidad.",
                    )}
                  </p>
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <Button asChild size="lg" className="w-full">
                    <Link
                      to={`${ROUTES.LOGIN}?redirect=${encodeURIComponent(
                        activeSession
                          ? ROUTES.BOOKING(activeSession.$id)
                          : ROUTES.CLASSES,
                      )}`}
                    >
                      {t("auth.signIn", "Iniciar sesión")}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    <Link
                      to={`${ROUTES.REGISTER}?redirect=${encodeURIComponent(
                        activeSession
                          ? ROUTES.BOOKING(activeSession.$id)
                          : ROUTES.CLASSES,
                      )}`}
                    >
                      {t("auth.createAccount", "Crear cuenta")}
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </>
  );
}

function ClassDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Skeleton className="h-5 w-32 mb-6" />
      <div className="grid lg:grid-cols-[1fr_340px] gap-8">
        <div>
          <Skeleton className="h-80 rounded-2xl mb-6" />
          <Skeleton className="h-10 w-2/3 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}

function NotFound() {
  const { t } = useTranslation("common");
  return (
    <main className="max-w-lg mx-auto px-4 py-24 text-center">
      <Activity
        className="w-12 h-12 mb-4 mx-auto text-charcoal-subtle"
        aria-hidden="true"
      />
      <h1 className="text-2xl font-semibold text-charcoal mb-2">
        {t("errors.notFound")}
      </h1>
      <p className="text-charcoal-muted mb-6">{t("errors.generic")}</p>
      <Button asChild variant="outline">
        <Link to={ROUTES.CLASSES}>Ver todas las clases</Link>
      </Button>
    </main>
  );
}
