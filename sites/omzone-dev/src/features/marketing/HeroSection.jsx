import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ROUTES from '@/constants/routes'

export default function HeroSection() {
  const { t } = useTranslation('landing')

  return (
    <section
      aria-label="Bienvenida a Omzone"
      className="relative overflow-hidden bg-cream min-h-[88vh] md:min-h-[80vh] flex items-center"
    >
      {/* Blobs decorativos de fondo */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-sage-muted/40 blur-3xl" />
        <div className="absolute top-1/2 -translate-y-1/2 -left-32 w-80 h-80 rounded-full bg-sand/60 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-olive-light/20 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28 w-full">
        <div className="grid md:grid-cols-12 gap-12 items-center">

          {/* ── Columna texto ──────────────────────────────────────────── */}
          <div className="md:col-span-7 animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-sage-muted/60 text-sage-darker text-sm font-medium px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              {t('hero.badge')}
            </div>

            {/* H1 — máxima prioridad SEO */}
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-charcoal font-semibold leading-[1.05] tracking-tight text-balance mb-6">
              {t('hero.headline').split('\n').map((line, i) => (
                <span key={i} className={i > 0 ? 'block text-sage' : 'block'}>
                  {line}
                </span>
              ))}
            </h1>

            <p className="text-lg text-charcoal-muted leading-relaxed max-w-lg mb-8 text-pretty">
              {t('hero.subheadline')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="xl" className="group">
                <Link to={ROUTES.CLASSES}>
                  {t('hero.ctaMain')}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <Link to={ROUTES.MEMBERSHIPS}>
                  {t('hero.ctaSecondary')}
                </Link>
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 mt-10 pt-8 border-t border-warm-gray-dark/60">
              <Stat value="+200" label="alumnos activos" />
              <div className="w-px h-8 bg-warm-gray-dark/60" aria-hidden="true" />
              <Stat value="4.9★" label="valoración media" />
              <div className="w-px h-8 bg-warm-gray-dark/60" aria-hidden="true" />
              <Stat value="6" label="tipos de clase" />
            </div>
          </div>

          {/* ── Columna visual ─────────────────────────────────────────── */}
          <div className="md:col-span-5 hidden md:flex flex-col gap-4 animate-fade-in">
            {/* Card flotante principal */}
            <div className="bg-white rounded-2xl p-5 shadow-card border border-warm-gray-dark/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-muted to-sage-light flex items-center justify-center text-xl">
                  ◎
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal">Morning Flow</p>
                  <p className="text-xs text-charcoal-muted">con Mario Zen · 60 min</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-charcoal-muted bg-warm-gray px-2.5 py-1 rounded-full">Mañana · 7:00 AM</span>
                <span className="text-sm font-bold text-sage">$180</span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-warm-gray overflow-hidden">
                <div className="h-full w-7/12 bg-sage rounded-full" />
              </div>
              <p className="text-xs text-charcoal-subtle mt-1">7 de 12 lugares ocupados</p>
            </div>

            {/* Card membresía */}
            <div className="bg-sage rounded-2xl p-5 text-white self-end w-5/6">
              <p className="text-xs font-medium text-sage-light mb-2 uppercase tracking-wider">Membresía activa</p>
              <p className="text-base font-semibold">Yoga ilimitado mensual</p>
              <p className="text-xs text-sage-light/80 mt-1">Renueva en 18 días</p>
              <div className="mt-3 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-white/20 border-2 border-white/40" aria-hidden="true" />
                ))}
                <span className="text-xs text-sage-light ml-1">+12 este mes</span>
              </div>
            </div>

            {/* Card producto wellness */}
            <div className="bg-white rounded-2xl p-4 shadow-card border border-warm-gray-dark/30 flex items-center gap-3">
              <span className="text-2xl" role="img" aria-label="Smoothie">🥤</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-charcoal truncate">Smoothie Green Balance</p>
                <p className="text-xs text-charcoal-muted">Wellness Kitchen</p>
              </div>
              <span className="text-sm font-bold text-sage shrink-0">$95</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({ value, label }) {
  return (
    <div>
      <p className="text-lg font-bold text-charcoal leading-none">{value}</p>
      <p className="text-xs text-charcoal-muted mt-0.5">{label}</p>
    </div>
  )
}
