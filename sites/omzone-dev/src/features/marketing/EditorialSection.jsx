/**
 * EditorialSection — renders dynamic content_sections from the DB.
 * Each section can have title, subtitle, body, CTA, and images (up to 3).
 */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { useContentSections } from "@/hooks/useOfferings";
import { resolveField } from "@/lib/i18n-data";
import { getFirstImageUrl, getImageUrls } from "@/lib/media";

export default function EditorialSection() {
  const { t } = useTranslation("landing");
  const { data: sections } = useContentSections({ scope: "global" });

  if (!sections || sections.length === 0) return null;

  return (
    <section
      aria-label={t("editorial.defaultTitle")}
      className="bg-cream py-20 md:py-28"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-16">
        {sections.map((section) => (
          <EditorialBlock key={section.$id} section={section} />
        ))}
      </div>
    </section>
  );
}

function EditorialBlock({ section }) {
  const title = resolveField(section, "title");
  const subtitle = resolveField(section, "subtitle");
  const body = resolveField(section, "body");
  const ctaLabel = resolveField(section, "cta_label");
  const ctaUrl = section.cta_url;

  // Get all image URLs from images_json
  const imageUrls = getImageUrls(section.images_json, 1000, 600, 80);
  const imageCount = imageUrls.length;

  if (!title && !body) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
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
            className="inline-flex items-center gap-2 bg-charcoal text-white rounded-2xl px-6 py-3 text-sm font-semibold hover:bg-charcoal/85 transition-all duration-200"
          >
            {ctaLabel}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        )}
      </div>

      {/* Images - dynamic layout based on count */}
      {imageCount > 0 && <ImageGrid images={imageUrls} alt={title ?? ""} />}
    </div>
  );
}

/** Dynamic image grid based on image count */
function ImageGrid({ images, alt }) {
  const count = images.length;

  // Single image: full size
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

  // Two images: side by side
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
