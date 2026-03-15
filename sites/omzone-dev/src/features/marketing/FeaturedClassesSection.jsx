import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import ClassCard from '@/features/classes/ClassCard'
import { useClasses } from '@/hooks/useClasses'
import ROUTES from '@/constants/routes'

export default function FeaturedClassesSection() {
  const { t } = useTranslation('landing')
  const { data: classes, isLoading } = useClasses({ featured: true })

  return (
    <section
      aria-labelledby="featured-classes-heading"
      className="bg-cream py-20 md:py-28"
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="max-w-lg">
            <h2
              id="featured-classes-heading"
              className="font-display text-3xl md:text-4xl text-charcoal font-semibold mb-3 text-balance"
            >
              {t('classes.title')}
            </h2>
            <p className="text-charcoal-muted">{t('classes.subtitle')}</p>
          </div>
          <Button asChild variant="outline" className="shrink-0 self-start sm:self-auto">
            <Link to={ROUTES.CLASSES}>
              {t('classes.cta')}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <Skeleton className="h-44 rounded-none" />
                <div className="p-4 space-y-2 bg-white">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes?.map((cls) => (
              <ClassCard key={cls.$id} cls={cls} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
