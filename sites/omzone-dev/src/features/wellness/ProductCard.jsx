import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ShoppingCart,
  GlassWater,
  Cookie,
  Pill,
  FileText,
  Sparkles,
  Leaf,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/hooks/useCurrency";
import { resolveField } from "@/lib/i18n-data";
import { getLocalizedOtherType } from "@/lib/product-types";
import { useAuth } from "@/hooks/useAuth";
import ROUTES from "@/constants/routes";
import { cn } from "@/lib/utils";
import { getPreviewUrl } from "@/lib/media";
import { BUCKET_PUBLIC_MEDIA } from "@/env";

const TYPE_VISUALS = {
  smoothie: {
    gradient: "from-sage-muted to-sage-light",
    Icon: GlassWater,
    label: "Smoothie",
  },
  snack: { gradient: "from-sand to-sand-light", Icon: Cookie, label: "Snack" },
  supplement: {
    gradient: "from-olive-light to-sage-muted",
    Icon: Pill,
    label: "Suplemento",
  },
  plan: {
    gradient: "from-cream-dark to-sand-light",
    Icon: FileText,
    label: "Plan",
  },
  addon: {
    gradient: "from-warm-gray to-sand",
    Icon: Sparkles,
    label: "Add-on",
  },
  other: { gradient: "from-warm-gray to-cream", Icon: Leaf, label: "Wellness" },
};

export default function ProductCard({ product, compact = false }) {
  const { t, i18n } = useTranslation("wellness");
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  if (!product) return null;

  const name = resolveField(product, "name");
  const description = resolveField(product, "description");
  const visual = TYPE_VISUALS[product.product_type] ?? TYPE_VISUALS.other;
  const typeLabel =
    product.product_type === "other"
      ? getLocalizedOtherType(product, i18n.resolvedLanguage ?? "es") ||
        t("types.other")
      : t(`types.${product.product_type}`);

  return (
    <Card
      className={cn(
        "group overflow-hidden transition-all duration-300",
        compact
          ? "flex flex-row h-24"
          : "hover:shadow-card-hover hover:-translate-y-0.5",
      )}
    >
      {/* Área visual */}
      <div
        className={cn(
          "relative shrink-0 flex items-center justify-center overflow-hidden",
          `bg-linear-to-br ${visual.gradient}`,
          compact ? "w-24 h-full" : "h-36",
        )}
      >
        {product.cover_image_id ? (
          <img
            src={getPreviewUrl(
              product.cover_image_id,
              product.cover_image_bucket ?? BUCKET_PUBLIC_MEDIA,
              600,
              400,
              80,
            )}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <visual.Icon
            className={cn(
              "transition-transform duration-300 group-hover:scale-110 text-charcoal/40",
              compact ? "w-7 h-7" : "w-10 h-10",
            )}
            aria-hidden="true"
          />
        )}
        {product.is_addon_only && !compact && (
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="warm" className="text-[10px]">
              {t("card.addOnly")}
            </Badge>
          </div>
        )}
      </div>

      {/* Contenido */}
      <CardContent
        className={cn(
          "flex flex-col",
          compact ? "p-3 justify-center flex-1" : "p-4",
        )}
      >
        {/* Tipo */}
        {!compact && (
          <span className="text-[10px] uppercase tracking-wider font-medium text-charcoal-subtle mb-1">
            {typeLabel}
          </span>
        )}

        <h3
          className={cn(
            "font-semibold text-charcoal leading-tight mb-1",
            compact ? "text-sm" : "text-base",
          )}
        >
          {name}
        </h3>

        {!compact && description && (
          <p className="text-sm text-charcoal-muted line-clamp-2 mb-3">
            {description}
          </p>
        )}

        <div
          className={cn(
            "flex items-center",
            compact
              ? "gap-2 mt-1"
              : "justify-between mt-auto pt-3 border-t border-warm-gray-dark/50",
          )}
        >
          {user && (
            <span
              className={cn(
                "font-bold text-charcoal font-display",
                compact ? "text-base" : "text-lg",
              )}
            >
              {formatPrice(product.price)}
            </span>
          )}
          {!compact && !product.is_addon_only && (
            <Button size="sm" asChild>
              <Link to={ROUTES.CHECKOUT} state={{ productId: product.$id }}>
                <ShoppingCart className="w-3.5 h-3.5" />
                {t("card.buyAlone")}
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
