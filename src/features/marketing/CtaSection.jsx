import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ROUTES from '@/constants/routes'

export default function CtaSection() {
  const { t } = useTranslation('landing')

  return (
    <section
      aria-labelledby="cta-heading"
      className="relative overflow-hidden bg-sage py-20 md:py-28"
    >
      {/* Blobs decorativos */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-sage-dark/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-olive/20 blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 text-center">
        <h2
          id="cta-heading"
          className="font-display text-3xl md:text-5xl text-white font-semibold mb-4 text-balance"
        >
          {t('cta_section.title')}
        </h2>
        <p className="text-white/80 text-lg mb-10">{t('cta_section.subtitle')}</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="xl" className="bg-white text-sage hover:bg-cream group">
            <Link to={ROUTES.CLASSES}>
              {t('cta_section.ctaMain')}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="xl" variant="outline" className="border-white/40 text-white hover:bg-white/10">
            <Link to={ROUTES.MEMBERSHIPS}>
              {t('cta_section.ctaSecondary')}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
