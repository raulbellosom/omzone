import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Leaf } from "lucide-react";
import PageMeta from "@/components/seo/PageMeta";
import StructuredData from "@/components/seo/StructuredData";
import ProductCard from "@/features/wellness/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useWellnessProducts } from "@/hooks/useWellness";
import { resolveField } from "@/lib/i18n-data";
import { getLocalizedOtherType } from "@/lib/product-types";
import { cn } from "@/lib/utils";
import { APP_BASE_URL } from "@/env";
import { useCurrency } from "@/hooks/useCurrency";

const BASE_URL = APP_BASE_URL;

const BASE_PRODUCT_TYPES = ["smoothie", "snack", "supplement", "plan", "addon"];

export default function WellnessPage() {
  const { t, i18n } = useTranslation("wellness");
  const { currency } = useCurrency();
  const [activeType, setActiveType] = useState("");

  const { data: products, isLoading } = useWellnessProducts();

  const filterOptions = useMemo(() => {
    const options = BASE_PRODUCT_TYPES.map((type) => ({
      key: type,
      label: t(`filters.${type}`),
      matches: (product) => product.product_type === type,
    }));

    if (!products?.length) {
      options.push({
        key: "other",
        label: t("filters.other"),
        matches: (product) => product.product_type === "other",
      });
      return options;
    }

    const otherProducts = products.filter(
      (product) => product.product_type === "other",
    );

    const localizedOtherTypes = [...new Set(
      otherProducts
        .map((product) =>
          getLocalizedOtherType(product, i18n.resolvedLanguage ?? "es"),
        )
        .filter(Boolean),
    )];

    const hasUnnamedOther = otherProducts.some(
      (product) =>
        !getLocalizedOtherType(product, i18n.resolvedLanguage ?? "es"),
    );

    if (hasUnnamedOther || localizedOtherTypes.length === 0) {
      options.push({
        key: "other",
        label: t("filters.other"),
        matches: (product) => product.product_type === "other",
      });
    }

    localizedOtherTypes.forEach((label) => {
      options.push({
        key: `other:${label.toLowerCase()}`,
        label,
        matches: (product) =>
          product.product_type === "other" &&
          getLocalizedOtherType(product, i18n.resolvedLanguage ?? "es") === label,
      });
    });

    return options;
  }, [products, i18n.resolvedLanguage, t]);

  const filtered = useMemo(() => {
    if (!products) return [];
    if (!activeType) return products;
    const activeOption = filterOptions.find((option) => option.key === activeType);
    return activeOption ? products.filter(activeOption.matches) : products;
  }, [products, activeType, filterOptions]);

  const itemListSchema = products
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Wellness Kitchen · Complementos de bienestar Omzone",
        itemListElement: products.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Product",
            name: resolveField(p, "name"),
            description: resolveField(p, "description"),
            offers: {
              "@type": "Offer",
              price: p.price,
              priceCurrency: currency,
              availability: "https://schema.org/InStock",
            },
          },
        })),
      }
    : null;

  return (
    <>
      <PageMeta
        title="Wellness Kitchen · Smoothies, Nutrición y Suplementos"
        description="Complementos wellness para potenciar tu práctica de yoga. Smoothies funcionales, planes nutricionales, suplementos y add-ons de bienestar. Compra solo o suma a tu clase."
        canonical={`${BASE_URL}/wellness`}
        locale="es"
      />
      {itemListSchema && <StructuredData data={itemListSchema} />}

      <main className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <header className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block text-xs uppercase tracking-widest font-medium text-sage bg-sage-muted px-3 py-1 rounded-full mb-4">
            {t("page.badge")}
          </span>
          <h1 className="font-display text-3xl md:text-5xl text-charcoal font-semibold mb-4 text-balance">
            {t("page.title")}
          </h1>
          <p className="text-charcoal-muted text-lg">{t("page.subtitle")}</p>
        </header>

        {/* Filtros de tipo */}
        <div
          className="flex flex-wrap justify-center gap-2 mb-10"
          role="group"
          aria-label="Filtrar por tipo"
        >
          <TypePill active={!activeType} onClick={() => setActiveType("")}>
            {t("filters.all")}
          </TypePill>
          {filterOptions.map((option) => (
            <TypePill
              key={option.key}
              active={activeType === option.key}
              onClick={() => setActiveType(option.key)}
            >
              {option.label}
            </TypePill>
          ))}
        </div>

        {/* Grid de productos */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product) => (
              <ProductCard key={product.$id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Leaf
              className="w-10 h-10 mb-3 mx-auto text-charcoal-subtle"
              aria-hidden="true"
            />
            <p className="text-charcoal-muted">{t("filters.empty")}</p>
          </div>
        )}

        {/* Bloque informativo Wellness Kitchen */}
        <section
          aria-labelledby="wellness-info-heading"
          className="mt-20 bg-cream border border-warm-gray-dark/40 rounded-2xl p-8 md:p-12 max-w-3xl mx-auto text-center"
        >
          <h2
            id="wellness-info-heading"
            className="font-display text-2xl md:text-3xl text-charcoal font-semibold mb-4"
          >
            {t("info.title")}
          </h2>
          <p className="text-charcoal-muted leading-relaxed">
            {t("info.description")}
          </p>
        </section>
      </main>
    </>
  );
}

function TypePill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150",
        active
          ? "bg-sage text-white border-sage shadow-sm"
          : "bg-white text-charcoal-muted border-warm-gray-dark hover:border-sage hover:text-sage",
      )}
    >
      {children}
    </button>
  );
}
