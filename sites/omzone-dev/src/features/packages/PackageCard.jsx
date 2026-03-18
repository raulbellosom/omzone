import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Package, ArrowRight, Leaf, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/hooks/useCurrency";
import { resolveField } from "@/lib/i18n-data";
import { useAuth } from "@/hooks/useAuth";
import ROUTES from "@/constants/routes";
import { getPreviewUrl } from "@/lib/media";
import { BUCKET_PUBLIC_MEDIA } from "@/env";

const TYPE_ICON = { product: Leaf, class: Calendar };
const TYPE_COLORS = {
  product: "bg-sand text-charcoal",
  class: "bg-warm-gray text-charcoal",
};

export default function PackageCard({ pkg }) {
  const { t } = useTranslation("packages");
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  if (!pkg) return null;

  const name = resolveField(pkg, "name");
  const description = resolveField(pkg, "description");
  const items = pkg.items_json ?? [];

  return (
    <Card className="group flex flex-col overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300">
      {/* Header visual */}
      {pkg.cover_image_id ? (
        <div className="relative h-44 overflow-hidden bg-sand">
          <img
            src={getPreviewUrl(
              pkg.cover_image_id,
              pkg.cover_image_bucket ?? BUCKET_PUBLIC_MEDIA,
              600,
              350,
              80,
            )}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="h-3 bg-linear-to-r from-sage to-olive" aria-hidden="true" />
      )}

      <CardContent className="flex flex-col flex-1 p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-sage-muted flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-sage" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-charcoal leading-tight">
              {name}
            </h3>
            <p className="text-sm text-charcoal-muted mt-0.5">{description}</p>
          </div>
        </div>

        {/* Contenido del paquete */}
        <div className="mb-5">
          <p className="text-xs font-medium text-charcoal-muted uppercase tracking-wider mb-2">
            {t("card.includes")}
          </p>
          <ul className="flex flex-col gap-1.5">
            {items.map((item, i) => {
              const ItemIcon = TYPE_ICON[item.type];
              return (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-charcoal"
                >
                  {ItemIcon ? (
                    <ItemIcon
                      className="w-3.5 h-3.5 text-charcoal-muted shrink-0"
                      aria-hidden="true"
                    />
                  ) : (
                    <span className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  )}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[item.type] ?? "bg-warm-gray text-charcoal"}`}
                  >
                    {item.label_es ?? t(`items.${item.type}`)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Precio + CTA */}
        <div className="mt-auto pt-4 border-t border-warm-gray-dark/50">
          <div className="flex items-center justify-between mb-3">
            {user && (
              <span className="text-2xl font-bold text-charcoal font-display">
                {formatPrice(pkg.price)}
              </span>
            )}
            {pkg.is_featured && (
              <Badge variant="sage">
                {t("card.savings", { amount: "" }).trim() || "Mejor valor"}
              </Badge>
            )}
          </div>
          <Button asChild className="w-full" size="lg">
            <Link to={ROUTES.CHECKOUT} state={{ packageId: pkg.$id }}>
              {t("card.buy")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
