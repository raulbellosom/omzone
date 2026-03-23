/**
 * OfferingDetailPage — renders full-page offering using templates.
 *
 * Uses templateKey from offering data to select the appropriate
 * template component (zen-hero, split-journey, nature-immersive).
 */
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOfferingBySlug, useContentSections } from "@/hooks/useOfferings";
import { getActiveLang } from "@/lib/i18n-data";
import { getOfferingTemplate } from "@/features/offerings/templates";
import ROUTES from "@/constants/routes";

export default function OfferingDetailPage() {
  const { slug } = useParams();
  const { t } = useTranslation("offerings");
  const locale = getActiveLang();
  const { data: offering, isLoading } = useOfferingBySlug(slug);
  const { data: editorialSections = [] } = useContentSections(
    offering?.$id
      ? { offeringId: offering.$id, mergeOffering: true }
      : { scope: "global" },
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-sage animate-spin" />
      </div>
    );
  }

  // Not found state
  if (!offering) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-charcoal-muted text-lg">
          {t("search.noResults", { term: slug })}
        </p>
        <Button asChild variant="outline">
          <Link to={ROUTES.SESSIONS}>
            <ArrowLeft className="w-4 h-4" />
            {t("card.viewDetails")}
          </Link>
        </Button>
      </div>
    );
  }

  // Get the template component based on templateKey or category default
  const TemplateComponent = getOfferingTemplate(
    offering.template_key,
    offering.category,
  );

  // Render the template
  return (
    <TemplateComponent
      offering={offering}
      sections={editorialSections}
      t={t}
      locale={locale}
    />
  );
}
