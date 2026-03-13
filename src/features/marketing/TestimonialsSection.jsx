import { useTranslation } from 'react-i18next'
import { Quote } from 'lucide-react'

export default function TestimonialsSection() {
  const { t } = useTranslation('landing')
  const items = t('testimonials.items', { returnObjects: true })

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="bg-charcoal py-20 md:py-28"
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2
            id="testimonials-heading"
            className="font-display text-3xl md:text-4xl text-white font-semibold mb-4 text-balance"
          >
            {t('testimonials.title')}
          </h2>
          <p className="text-white/60">{t('testimonials.subtitle')}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(items) && items.map((item, i) => (
            <blockquote
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col"
            >
              <Quote className="w-6 h-6 text-sage mb-4 shrink-0" aria-hidden="true" />
              <p className="text-white/80 text-sm leading-relaxed flex-1 mb-6">
                "{item.text}"
              </p>
              <footer className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full bg-sage-muted flex items-center justify-center text-sage-darker text-xs font-bold shrink-0"
                  aria-hidden="true"
                >
                  {item.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <cite className="text-white text-sm font-medium not-italic">{item.name}</cite>
                  <p className="text-white/40 text-xs">{item.role}</p>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
