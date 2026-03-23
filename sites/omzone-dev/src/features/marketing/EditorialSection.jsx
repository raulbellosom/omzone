/**
 * EditorialSection — renders dynamic content_sections from the DB.
 * Each section can have title, subtitle, body, CTA, and images (up to 3).
 * Respects the template_key field for layout selection.
 */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { useContentSections } from "@/hooks/useOfferings";
import { resolveField } from "@/lib/i18n-data";
import { getImageUrls } from "@/lib/media";
import { cn } from "@/lib/utils";

export default function EditorialSection() {
  const { t } = useTranslation("landing");
  const { data: sections } = useContentSections({ scope: "global" });

  if (!sections || sections.length === 0) return null;

  return (
    <section aria-label={t("editorial.defaultTitle")}>
      {sections.map((section, index) => (
        <EditorialBlock key={section.$id} section={section} index={index} />
      ))}
    </section>
  );
}

function EditorialBlock({ section, index }) {
  const title = resolveField(section, "title");
  const subtitle = resolveField(section, "subtitle");
  const body = resolveField(section, "body");
  const ctaLabel = resolveField(section, "cta_label");
  const ctaUrl = section.cta_url;

  const imageUrls = getImageUrls(section.images_json, 1000, 700, 85);
  const template = section.template_key ?? "centered-minimal";

  if (!title && !body) return null;

  // ── Centered minimal: no image column, text centered ──
  if (template === "centered-minimal") {
    return (
      <div
        className={cn(
          "py-16 md:py-24",
          index % 2 === 0 ? "bg-cream" : "bg-white",
        )}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          {title && (
            <h3 className="font-display text-3xl md:text-4xl text-charcoal font-semibold mb-4">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-lg text-sage font-medium mb-6">{subtitle}</p>
          )}
          {body && (
            <div className="prose prose-lg prose-charcoal max-w-none text-charcoal-muted leading-relaxed whitespace-pre-line mb-6">
              {body}
            </div>
          )}
          {imageUrls.length > 0 && (
            <div className="mt-8">
              <ImageGrid images={imageUrls} alt={title ?? ""} />
            </div>
          )}
          {ctaLabel && ctaUrl && (
            <Link
              to={ctaUrl}
              className="inline-flex items-center gap-2 mt-8 bg-charcoal text-white rounded-full px-6 py-3 font-semibold hover:bg-charcoal/90 transition-colors"
            >
              {ctaLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    );
  }

  // ── Story left / Story right: image + text side by side ──
  const isReversed = template === "story-right";

  return (
    <div
      className={cn(
        "py-16 md:py-24",
        index % 2 === 0 ? "bg-cream" : "bg-white",
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center",
            isReversed && "lg:[direction:rtl] lg:*:[direction:ltr]",
          )}
        >
          {/* Images */}
          {imageUrls.length > 0 && (
            <ImageGrid images={imageUrls} alt={title ?? ""} />
          )}

          {/* Text */}
          <div>
            {title && (
              <h3 className="font-display text-3xl md:text-4xl text-charcoal font-semibold mb-4 leading-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-charcoal-muted text-lg mb-6 leading-relaxed">
                {subtitle}
              </p>
            )}
            {body && (
              <div className="prose prose-charcoal max-w-none text-charcoal-muted leading-relaxed whitespace-pre-line mb-6">
                {body}
              </div>
            )}
            {ctaLabel && ctaUrl && (
              <Link
                to={ctaUrl}
                className="inline-flex items-center gap-2 bg-charcoal text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-charcoal/85 transition-all duration-200"
              >
                {ctaLabel}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Dynamic image grid based on image count */
function ImageGrid({ images, alt }) {
  const count = images.length;

  if (count === 1) {
    return (
      <div className="relative rounded-3xl overflow-hidden aspect-4/3">
        <img
          src={images[0]}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {images.map((url, i) => (
          <div
            key={i}
            className="relative rounded-2xl overflow-hidden aspect-3/4"
          >
            <img
              src={url}
              alt={`${alt} ${i + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    );
  }

  // Three images: 1 large + 2 small
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="row-span-2 relative rounded-2xl overflow-hidden aspect-3/4">
        <img
          src={images[0]}
          alt={`${alt} 1`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="relative rounded-2xl overflow-hidden aspect-4/3">
        <img
          src={images[1]}
          alt={`${alt} 2`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="relative rounded-2xl overflow-hidden aspect-4/3">
        <img
          src={images[2]}
          alt={`${alt} 3`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    </div>
  );
}
