import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

// Placeholder images — swap for real studio photos before production
const IMAGES = [
  {
    seed: "yoga-room-a",
    alt: "Sala de yoga",
    className: "row-span-2 h-full min-h-72",
  },
  { seed: "yoga-room-b", alt: "Wellness Kitchen", className: "h-48" },
  { seed: "yoga-room-c", alt: "Meditación", className: "h-48" },
];

export default function StudioSection() {
  const { t } = useTranslation("landing");
  const features = t("studio.features", { returnObjects: true });

  return (
    <section
      aria-labelledby="studio-heading"
      className="bg-cream py-24 md:py-32 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* ── Photo gallery ──────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3 order-2 lg:order-1">
            {/* Tall left image */}
            <div className="row-span-2">
              <img
                src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=500&h=700&fit=crop&crop=center&q=80"
                alt="Sala de yoga"
                className="w-full h-full object-cover rounded-3xl"
                loading="lazy"
              />
            </div>
            {/* Two stacked images on the right */}
            <img
              src="https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=500&h=340&fit=crop&crop=center&q=80"
              alt="Wellness Kitchen"
              className="w-full h-48 object-cover rounded-3xl mt-8"
              loading="lazy"
            />
            <img
              src="https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=500&h=340&fit=crop&crop=center&q=80"
              alt="Clase en grupo"
              className="w-full h-48 object-cover rounded-3xl"
              loading="lazy"
            />
          </div>

          {/* ── Text content ───────────────────────────────────── */}
          <div className="order-1 lg:order-2">
            <p className="text-sage text-xs font-semibold uppercase tracking-widest mb-3">
              {t("studio.eyebrow")}
            </p>
            <h2
              id="studio-heading"
              className="font-display text-4xl md:text-5xl text-charcoal font-semibold mb-5 text-balance leading-[1.05]"
            >
              {t("studio.title")}
            </h2>
            <p className="text-charcoal-muted text-lg leading-relaxed mb-10">
              {t("studio.description")}
            </p>

            {/* Feature checklist */}
            <ul className="space-y-3" role="list">
              {Array.isArray(features) &&
                features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded-full bg-sage-muted flex items-center justify-center shrink-0 mt-0.5"
                      aria-hidden="true"
                    >
                      <Check
                        className="w-3 h-3 text-sage-darker"
                        strokeWidth={2.5}
                      />
                    </div>
                    <span className="text-charcoal-muted text-sm">{feat}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
