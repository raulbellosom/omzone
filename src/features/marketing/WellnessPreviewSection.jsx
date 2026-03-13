import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import ProductCard from '@/features/wellness/ProductCard'
import { useWellnessProducts } from '@/hooks/useWellness'
import ROUTES from '@/constants/routes'

export default function WellnessPreviewSection() {
  const { t } = useTranslation('landing')
  const { data: products, isLoading } = useWellnessProducts({ featuredOnly: true })

  return (
    <section
      aria-labelledby="wellness-preview-heading"
      className="bg-cream py-20 md:py-28"
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="max-w-lg">
            {/* Pill decorativo */}
            <span className="inline-block text-xs uppercase tracking-widest font-medium text-sage mb-3 bg-sage-muted px-3 py-1 rounded-full">
              {t('wellness.title')}
            </span>
            <h2
              id="wellness-preview-heading"
              className="font-display text-3xl md:text-4xl text-charcoal font-semibold mb-3 text-balance"
            >
              {t('wellness.subtitle')}
            </h2>
          </div>
          <Button asChild variant="outline" className="shrink-0 self-start sm:self-auto">
            <Link to={ROUTES.WELLNESS}>
              {t('wellness.cta')}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products?.slice(0, 4).map((product) => (
              <ProductCard key={product.$id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
