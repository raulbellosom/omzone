import { useTranslation } from 'react-i18next'
import { Star } from 'lucide-react'

function StarRow({ count = 5 }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} estrellas`}>
      {[...Array(count)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-sage text-sage" aria-hidden="true" />
      ))}
    </div>
  )
}

// Decorative initials avatar
function Avatar({ name }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2)
  return (
    <div
      className="w-10 h-10 rounded-full bg-sage-muted flex items-center justify-center text-sage-darker text-sm font-bold shrink-0"
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

export default function TestimonialsSection() {
  const { t } = useTranslation('landing')
  const items = t('testimonials.items', { returnObjects: true })

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="relative bg-charcoal py-24 md:py-32 overflow-hidden"
    >
      {/* Decorative blobs */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-sage/8 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-olive/8 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <p className="text-sage-light text-xs font-semibold uppercase tracking-widest mb-3">
            Testimonios
          </p>
          <h2
            id="testimonials-heading"
            className="font-display text-4xl md:text-5xl text-white font-semibold mb-4 text-balance leading-[1.05]"
          >
            {t('testimonials.title')}
          </h2>
          <p className="text-white/50">{t('testimonials.subtitle')}</p>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(items) && items.map((item, i) => (
            <blockquote
              key={i}
              className="relative bg-white/5 hover:bg-white/8 border border-white/10 rounded-3xl p-7 flex flex-col transition-colors duration-300"
            >
              {/* Stars */}
              <StarRow />

              {/* Quote text */}
              <p className="text-white/75 text-sm leading-relaxed flex-1 mt-5 mb-7">
                "{item.text}"
              </p>

              {/* Author */}
              <footer className="flex items-center gap-3 pt-5 border-t border-white/10">
                <Avatar name={item.name} />
                <div>
                  <cite className="text-white text-sm font-semibold not-italic block">
                    {item.name}
                  </cite>
                  <p className="text-white/40 text-xs">{item.role}</p>
                </div>
              </footer>

              {/* Decorative large quote mark */}
              <span
                className="absolute top-5 right-7 font-display text-7xl text-white/5 leading-none select-none"
                aria-hidden="true"
              >
                "
              </span>
            </blockquote>
          ))}
        </div>

        {/* Aggregate rating bar */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 text-white/40 text-sm">
          <StarRow />
          <span>4.9 de 5 · Basado en +120 reseñas verificadas</span>
        </div>
      </div>
    </section>
  )
}
