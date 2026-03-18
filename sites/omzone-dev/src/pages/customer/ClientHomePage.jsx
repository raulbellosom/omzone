/**
 * ClientHomePage — innovative dashboard / landing page for authenticated clients.
 *
 * Sections:
 *   1. Hero welcome with personalized greeting + quick stats
 *   2. Featured classes carousel
 *   3. Four pillars expanded section (with stock images)
 *   4. Packages preview
 *   5. Wellness Kitchen preview
 *   6. About section with studio / brand info
 */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  CalendarCheck,
  ShoppingBag,
  Award,
  Sparkles,
  Waves,
  Leaf,
  Sun,
  Mountain,
  Heart,
  BookOpen,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useClasses, useClassTypes } from "@/hooks/useClasses";
import { useWellnessProducts, useWellnessPackages } from "@/hooks/useWellness";
import { useMyBookings, useMyOrders } from "@/hooks/useCustomer";
import { resolveField } from "@/lib/i18n-data";
import { useCurrency } from "@/hooks/useCurrency";
import { getStockPreviewUrl, STOCK } from "@/lib/stock-images";
import ROUTES from "@/constants/routes";
import ClassCard from "@/features/classes/ClassCard";
import PackageCard from "@/features/packages/PackageCard";
import ProductCard from "@/features/wellness/ProductCard";
import { cn } from "@/lib/utils";

/* ── Pillar data ────────────────────────────────────────────────────────────── */
const PILLARS = [
  {
    icon: Waves,
    color: "from-sage/20 to-sage/5",
    accent: "bg-sage",
    image: STOCK.YOGA_BEACH_TWO_GIRLS,
  },
  {
    icon: Sun,
    color: "from-amber-100 to-amber-50",
    accent: "bg-amber-500",
    image: STOCK.SURF_SUNSET_NATURE,
  },
  {
    icon: Mountain,
    color: "from-sky-100 to-sky-50",
    accent: "bg-sky-500",
    image: STOCK.SURF_LOS_ARCOS,
  },
  {
    icon: Leaf,
    color: "from-emerald-100 to-emerald-50",
    accent: "bg-emerald-500",
    image: STOCK.YOGA_NATURE_TWO,
  },
];

export default function ClientHomePage() {
  const { t, i18n } = useTranslation("customer");
  const tc = (k, opts) => i18n.getFixedT(i18n.language, "common")(k, opts);
  const tl = (k, opts) => i18n.getFixedT(i18n.language, "landing")(k, opts);
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  const { data: bookings, isLoading: lBookings } = useMyBookings();
  const { data: orders, isLoading: lOrders } = useMyOrders();
  const { data: classes, isLoading: lClasses } = useClasses();
  const { data: packages, isLoading: lPkgs } = useWellnessPackages();
  const { data: products, isLoading: lProducts } = useWellnessProducts();

  const upcomingBookings =
    bookings?.filter((b) => b.status === "confirmed") ?? [];
  const featuredClasses = classes?.slice(0, 4) ?? [];
  const featuredPackages = packages?.slice(0, 3) ?? [];
  const featuredProducts = products?.slice(0, 4) ?? [];

  // Pillar items from i18n
  const pillarItems = tl("pillars.items", { returnObjects: true });
  const pillarsArray = Array.isArray(pillarItems) ? pillarItems : [];

  return (
    <div className="animate-fade-in-up">
      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1 — Welcome hero
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={getStockPreviewUrl(STOCK.GIRL_BEACH_SUNSET, 1920, 800, 75)}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0 bg-linear-to-r from-charcoal/88 via-charcoal/60 to-charcoal/25" />
          <div className="absolute inset-0 bg-linear-to-t from-charcoal/40 via-transparent to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 lg:px-6 py-16 md:py-24">
          <div className="max-w-2xl">
            {/* Greeting badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-sage-light shrink-0" />
              {t("dashboard.greeting", { name: user?.first_name ?? "" })}
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-white font-semibold leading-[0.95] tracking-tight mb-4">
              {t("home.heroTitle", { defaultValue: "Tu espacio de bienestar" })}
            </h1>
            <p className="text-white/60 text-lg leading-relaxed max-w-lg mb-8">
              {t("home.heroSubtitle", {
                defaultValue:
                  "Explora clases, paquetes y productos diseñados para transformar tu bienestar integral.",
              })}
            </p>

            {/* Quick stat cards */}
            <div className="flex flex-wrap gap-3">
              <QuickStat
                icon={CalendarCheck}
                label={t("dashboard.nextClass")}
                value={
                  lBookings
                    ? "..."
                    : upcomingBookings.length > 0
                      ? String(upcomingBookings.length)
                      : "0"
                }
                to={ROUTES.ZONE_BOOKINGS}
              />
              <QuickStat
                icon={ShoppingBag}
                label={t("dashboard.totalOrders")}
                value={lOrders ? "..." : String(orders?.length ?? 0)}
                to={ROUTES.ZONE_ORDERS}
              />
              <QuickStat
                icon={Award}
                label={tc("nav.packages")}
                value={lPkgs ? "..." : String(featuredPackages.length)}
                to={ROUTES.PACKAGES}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2 — Featured Classes
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-16 md:py-20">
        <SectionHeader
          eyebrow={tc("nav.classes")}
          title={t("home.classesTitle", { defaultValue: "Clases destacadas" })}
          subtitle={t("home.classesSubtitle", {
            defaultValue:
              "Encuentra la práctica perfecta para tu nivel e intención.",
          })}
          href={ROUTES.CLASSES}
          cta={tc("actions.viewAll")}
        />

        {lClasses ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredClasses.map((cls) => (
              <ClassCard key={cls.$id} cls={cls} />
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 3 — Four Pillars / Axes
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-charcoal py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sage-light text-xs font-semibold uppercase tracking-widest mb-4">
              {tl("pillars.eyebrow", { defaultValue: "Nuestros ejes" })}
            </p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white font-semibold leading-[0.92] tracking-tight mb-4">
              {tl("pillars.title", {
                defaultValue: "Cuatro ejes de transformación",
              })}
            </h2>
            <p className="text-white/45 text-lg leading-relaxed">
              {tl("pillars.subtitle", {
                defaultValue:
                  "Cada eje está diseñado para nutrir una dimensión diferente de tu bienestar.",
              })}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pillarsArray.slice(0, 4).map((item, i) => {
              const pillar = PILLARS[i] || PILLARS[0];
              const Icon = pillar.icon;
              return (
                <article
                  key={item.id || i}
                  className="group relative overflow-hidden rounded-3xl h-[420px] sm:h-[480px] cursor-pointer"
                >
                  {/* Background */}
                  <img
                    src={getStockPreviewUrl(pillar.image, 600, 800, 75)}
                    alt={item.label || ""}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-charcoal/90 via-charcoal/40 to-charcoal/10" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
                        pillar.accent,
                      )}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs text-sage-light/80 uppercase tracking-widest font-medium mb-1">
                      {item.tagline || `Eje ${i + 1}`}
                    </span>
                    <h3 className="font-display text-2xl text-white font-semibold mb-2 leading-tight">
                      {item.label || `Pilar ${i + 1}`}
                    </h3>
                    <p className="text-sm text-white/55 leading-relaxed line-clamp-3 transition-all duration-500 group-hover:text-white/70">
                      {item.description || ""}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 4 — Packages
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-16 md:py-20">
        <SectionHeader
          eyebrow={tc("nav.packages")}
          title={t("home.packagesTitle", { defaultValue: "Planes y paquetes" })}
          subtitle={t("home.packagesSubtitle", {
            defaultValue:
              "Ahorra más con nuestros paquetes combinados de yoga y wellness.",
          })}
          href={ROUTES.PACKAGES}
          cta={tc("actions.viewAll")}
        />

        {lPkgs ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPackages.map((pkg) => (
              <PackageCard key={pkg.$id} pkg={pkg} />
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 5 — Wellness Kitchen
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-y border-warm-gray-dark/30">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-16 md:py-20">
          <SectionHeader
            eyebrow="Wellness Kitchen"
            title={t("home.wellnessTitle", {
              defaultValue: "Complementos de bienestar",
            })}
            subtitle={t("home.wellnessSubtitle", {
              defaultValue:
                "Smoothies funcionales, suplementos y planes nutricionales para potenciar tu práctica.",
            })}
            href={ROUTES.WELLNESS}
            cta={tc("actions.viewAll")}
          />

          {lProducts ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredProducts.map((product) => (
                <ProductCard key={product.$id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 6 — About / Studio
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Image */}
          <div className="relative rounded-3xl overflow-hidden aspect-[4/3]">
            <img
              src={getStockPreviewUrl(STOCK.YOGA_NATURE_TWO, 900, 680, 80)}
              alt="Yoga en la naturaleza"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-linear-to-t from-charcoal/30 to-transparent" />
          </div>

          {/* Text */}
          <div>
            <p className="text-sage text-xs font-semibold uppercase tracking-widest mb-4">
              {t("home.aboutEyebrow", { defaultValue: "Nuestro espacio" })}
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-charcoal font-semibold leading-tight mb-6">
              {t("home.aboutTitle", {
                defaultValue:
                  "Un lugar donde el bienestar es un estilo de vida",
              })}
            </h2>
            <p className="text-charcoal-muted leading-relaxed mb-6">
              {t("home.aboutDescription", {
                defaultValue:
                  "En Omzone combinamos prácticas ancestrales de yoga con nutrición moderna y experiencias inmersivas en la naturaleza. Nuestro enfoque integral transforma cuerpo, mente y alma a través de cuatro ejes: movimiento consciente, nutrición funcional, inmersiones en la naturaleza y experiencias de reconexión.",
              })}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to={ROUTES.CLASSES}>
                  {tc("actions.bookClass")}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to={ROUTES.PACKAGES}>{tc("actions.explorePlans")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────────── */

function QuickStat({ icon: Icon, label, value, to }) {
  const inner = (
    <div className="flex items-center gap-3 bg-white/12 backdrop-blur-md border border-white/18 rounded-2xl px-4 py-3 min-w-[140px] transition-all duration-200 hover:bg-white/18">
      <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-xl font-bold text-white leading-none">{value}</p>
        <p className="text-[11px] text-white/50 mt-0.5">{label}</p>
      </div>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

function SectionHeader({ eyebrow, title, subtitle, href, cta }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
      <div className="max-w-xl">
        <p className="text-sage text-xs font-semibold uppercase tracking-widest mb-2">
          {eyebrow}
        </p>
        <h2 className="font-display text-3xl md:text-4xl text-charcoal font-semibold leading-tight mb-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-charcoal-muted text-base leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {href && cta && (
        <Link
          to={href}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-sage hover:text-sage-dark transition-colors shrink-0"
        >
          {cta}
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
