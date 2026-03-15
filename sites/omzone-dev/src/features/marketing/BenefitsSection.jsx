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
      className="bg-white py-20 md:py-28"
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2
            id="benefits-heading"
            className="font-display text-3xl md:text-4xl text-charcoal font-semibold mb-4 text-balance"
          >
            {t('benefits.title')}
          </h2>
          <p className="text-charcoal-muted text-lg">{t('benefits.subtitle')}</p>
        </div>

        {/* Grid de beneficios */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.isArray(items) && items.map((item, i) => {
            const Icon = ICON_MAP[item.icon] ?? Leaf
            return (
              <article key={i} className="flex flex-col items-start p-6 rounded-2xl bg-cream hover:bg-sand-light/50 transition-colors duration-200">
                <div className="w-11 h-11 rounded-xl bg-sage-muted flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-sage" aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold text-charcoal mb-2">{item.title}</h3>
                <p className="text-sm text-charcoal-muted leading-relaxed">{item.description}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
