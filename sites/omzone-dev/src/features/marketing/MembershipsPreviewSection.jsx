import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import PricingCard from '@/features/memberships/PricingCard'
import { useMembershipPlans } from '@/hooks/useMemberships'
import ROUTES from '@/constants/routes'

export default function MembershipsPreviewSection() {
  const { t } = useTranslation('landing')
  const { data: plans, isLoading } = useMembershipPlans({ featuredOnly: true })

  return (
    <section
      aria-labelledby="memberships-preview-heading"
      className="bg-white py-20 md:py-28"
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="max-w-lg">
            <h2
              id="memberships-preview-heading"
              className="font-display text-3xl md:text-4xl text-charcoal font-semibold mb-3 text-balance"
            >
              {t('memberships.title')}
            </h2>
            <p className="text-charcoal-muted">{t('memberships.subtitle')}</p>
          </div>
          <Button asChild variant="outline" className="shrink-0 self-start sm:self-auto">
            <Link to={ROUTES.MEMBERSHIPS}>
              {t('memberships.cta')}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {plans?.map((plan) => (
              <PricingCard key={plan.$id} plan={plan} featured={plan.is_featured} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
