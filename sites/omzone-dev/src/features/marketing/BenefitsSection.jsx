import { useTranslation } from 'react-i18next'
import { Calendar, Leaf, Star, Shield } from 'lucide-react'

const ICON_MAP = {
  calendar: Calendar,
  leaf:     Leaf,
  star:     Star,
  shield:   Shield,
}

export default function BenefitsSection() {
  const { t } = useTranslation('landing')
  const items = t('benefits.items', { returnObjects: true })

  return (
    <section
      aria-labelledby="benefits-heading"
      className="bg-white py-24 md:py-32"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header — left-aligned, editorial */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <div className="max-w-xl">
            <p className="text-sage text-xs font-semibold uppercase tracking-widest mb-3">
              ¿Por qué Omzone?
            </p>
            <h2
              id="benefits-heading"
              className="font-display text-4xl md:text-5xl text-charcoal font-semibold text-balance leading-[1.05]"
            >
              {t('benefits.title')}
            </h2>
          </div>
          <p className="text-charcoal-muted text-base lg:text-lg lg:max-w-xs lg:text-right">
            {t('benefits.subtitle')}
          </p>
        </div>

        {/* Benefits grid — divided layout */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-warm-gray-dark/30 border border-warm-gray-dark/30 rounded-3xl overflow-hidden">
          {Array.isArray(items) && items.map((item, i) => {
            const Icon = ICON_MAP[item.icon] ?? Leaf
            return (
              <article
                key={i}
                className="relative bg-white p-8 flex flex-col gap-6 hover:bg-cream transition-colors duration-300 group"
              >
                {/* Large decorative number */}
                <span
                  className="absolute top-5 right-6 font-display text-6xl font-semibold text-warm-gray-dark/25 leading-none select-none group-hover:text-sage/15 transition-colors duration-300"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* Icon */}
                <div className="w-12 h-12 rounded-2xl bg-sage-muted/50 flex items-center justify-center group-hover:bg-sage-muted transition-colors duration-300 shrink-0">
                  <Icon className="w-5 h-5 text-sage-darker" aria-hidden="true" />
                </div>

                {/* Text */}
                <div>
                  <h3 className="text-base font-semibold text-charcoal mb-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-charcoal-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
