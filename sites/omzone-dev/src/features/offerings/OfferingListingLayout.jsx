/**
 * OfferingListingLayout — reusable layout for offering category pages.
 *
 * Renders hero header + filter bar + responsive grid of OfferingCards.
 */
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import PageMeta from "@/components/seo/PageMeta";
import OfferingCard from "./OfferingCard";
import OfferingFilters from "./OfferingFilters";
import { useOfferings } from "@/hooks/useOfferings";
import { getActiveLang } from "@/lib/i18n-data";

export default function OfferingListingLayout({
  category,
  pageKey,
  showYogaStyles = false,
  cardLayout = "split",
}) {
  const { t } = useTranslation("offerings");
  const locale = getActiveLang();
  const [yogaStyle, setYogaStyle] = useState(null);
  const { data: offerings, isLoading } = useOfferings({ category });

  const filtered = useMemo(() => {
    if (!offerings) return [];
    if (!yogaStyle) return offerings;
    return offerings.filter((o) => o.yoga_style === yogaStyle);
  }, [offerings, yogaStyle]);

  return (
    <>
      <PageMeta
        title={t(`pages.${pageKey}.metaTitle`)}
        description={t(`pages.${pageKey}.metaDescription`)}
        locale={locale}
      />

      {/* Hero header */}
      <section className="bg-charcoal pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white font-semibold leading-tight mb-4">
            {t(`pages.${pageKey}.title`)}
          </h1>
          <p className="text-white/55 text-lg max-w-xl">
            {t(`pages.${pageKey}.subtitle`)}
          </p>
        </div>
      </section>

      {/* Filters + grid */}
      <section className="bg-cream py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {showYogaStyles && (
            <div className="mb-8">
              <OfferingFilters
                yogaStyle={yogaStyle}
                onYogaStyleChange={setYogaStyle}
                showYogaStyles
              />
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-sage animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-charcoal-muted text-lg">
                {t("agenda.noUpcoming")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((offering) => (
                <OfferingCard
                  key={offering.$id}
                  offering={offering}
                  layout={cardLayout}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
