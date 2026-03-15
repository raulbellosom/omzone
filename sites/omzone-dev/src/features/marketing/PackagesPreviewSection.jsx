import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import PackageCard from '@/features/packages/PackageCard'
import { useWellnessPackages } from '@/hooks/useWellness'
import ROUTES from '@/constants/routes'

export default function PackagesPreviewSection() {
  const { t } = useTranslation('landing')
  const { data: packages, isLoading } = useWellnessPackages({ featuredOnly: true })

  return (
    <section
      aria-labelledby="packages-preview-heading"
      className="bg-white py-24 md:py-32"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="max-w-lg">
            <p className="text-sage text-xs font-semibold uppercase tracking-widest mb-3">
              {t('packages.eyebrow')}
            </p>
            <h2
              id="packages-preview-heading"
              className="font-display text-4xl md:text-5xl text-charcoal font-semibold mb-3 text-balance leading-[1.05]"
            >
              {t('packages.title')}
            </h2>
            <p className="text-charcoal-muted">{t('packages.subtitle')}</p>
          </div>
          <Button asChild variant="outline" className="shrink-0 self-start sm:self-auto">
            <Link to={ROUTES.PACKAGES}>
              {t('packages.cta')}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {packages?.map((pkg) => (
              <PackageCard key={pkg.$id} pkg={pkg} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
