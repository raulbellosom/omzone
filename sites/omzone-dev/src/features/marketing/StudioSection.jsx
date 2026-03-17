import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

const STUDIO_IMAGES = [
  {
    title: "Yoga clásico",
    alt: "Mujer practicando yoga clásico en un estudio iluminado",
    src: "https://images.pexels.com/photos/7597247/pexels-photo-7597247.jpeg?cs=srgb&dl=pexels-pavel-danilyuk-7597247.jpg&fm=jpg",
    wrapperClassName: "row-span-2 h-full min-h-72",
  },
  {
    title: "Surf yoga",
    alt: "Mujer practicando surf yoga sobre una paddle board en el mar",
    src: "https://images.pexels.com/photos/8591038/pexels-photo-8591038.jpeg?cs=srgb&dl=pexels-olegprachuk-8591038.jpg&fm=jpg",
    wrapperClassName: "h-48 mt-8",
  },
  {
    title: "Yoga acrobático",
    alt: "Pareja practicando yoga acrobático en la playa",
    src: "https://images.pexels.com/photos/35441491/pexels-photo-35441491.jpeg?cs=srgb&dl=pexels-ashwani-sharma-2153169983-35441491.jpg&fm=jpg",
    wrapperClassName: "h-48",
  },
];

export default function StudioSection() {
  const { t } = useTranslation("landing");
  const features = t("studio.features", { returnObjects: true });

  return (
    <section
      aria-labelledby="studio-heading"
      className="overflow-hidden bg-cream py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className="order-2 grid grid-cols-2 gap-3 lg:order-1">
            {STUDIO_IMAGES.map((image) => (
              <figure
                key={image.title}
                className={`relative overflow-hidden rounded-3xl ${image.wrapperClassName}`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </figure>
            ))}
          </div>

          <div className="order-1 lg:order-2">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sage">
              {t("studio.eyebrow")}
            </p>
            <h2
              id="studio-heading"
              className="mb-5 font-display text-4xl font-semibold leading-[1.05] text-balance text-charcoal md:text-5xl"
            >
              {t("studio.title")}
            </h2>
            <p className="mb-10 text-lg leading-relaxed text-charcoal-muted">
              {t("studio.description")}
            </p>

            <ul className="space-y-3" role="list">
              {Array.isArray(features) &&
                features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3">
                    <div
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage-muted"
                      aria-hidden="true"
                    >
                      <Check
                        className="h-3 w-3 text-sage-darker"
                        strokeWidth={2.5}
                      />
                    </div>
                    <span className="text-sm text-charcoal-muted">{feat}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
