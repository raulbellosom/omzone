/**
 * OfferingFilters — filter bar for offering listing pages.
 *
 * Supports filtering by yoga style (for wellness_studio category).
 * Extensible for type or other facets.
 */
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const YOGA_STYLES = [
  "vinyasa",
  "hatha",
  "yin",
  "restorative",
  "power",
  "breathwork",
  "meditation",
];

export default function OfferingFilters({
  yogaStyle,
  onYogaStyleChange,
  showYogaStyles = false,
}) {
  const { t } = useTranslation("offerings");

  if (!showYogaStyles) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterPill
        active={!yogaStyle}
        onClick={() => onYogaStyleChange(null)}
        label={t("filters.allStyles")}
      />
      {YOGA_STYLES.map((style) => (
        <FilterPill
          key={style}
          active={yogaStyle === style}
          onClick={() =>
            onYogaStyleChange(yogaStyle === style ? null : style)
          }
          label={style.charAt(0).toUpperCase() + style.slice(1)}
        />
      ))}
    </div>
  );
}

function FilterPill({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
        active
          ? "bg-sage text-white shadow-sm"
          : "bg-warm-gray text-charcoal-muted hover:bg-warm-gray-dark/20 hover:text-charcoal",
      )}
    >
      {label}
    </button>
  );
}
