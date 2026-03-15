import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Check, Infinity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatMXN } from '@/lib/currency'
import { resolveField } from '@/lib/i18n-data'
import ROUTES from '@/constants/routes'
import { cn } from '@/lib/utils'

export default function PricingCard({ plan, featured = false }) {
  const { t } = useTranslation('memberships')
  if (!plan) return null

  const name        = resolveField(plan, 'name')
  const description = resolveField(plan, 'description')
  const includes    = plan.includes_json ?? []

  return (
    <Card className={cn(
      'relative flex flex-col overflow-hidden transition-all duration-300',
      featured
        ? 'border-sage shadow-lg scale-[1.02] ring-2 ring-sage/30'
        : 'hover:shadow-card-hover hover:-translate-y-0.5'
    )}>
      {/* Badge destacado */}
      {featured && (
        <div className="absolute top-0 inset-x-0 h-1 bg-sage" aria-hidden="true" />
      )}
      {featured && (
        <div className="absolute top-4 right-4">
          <Badge variant="sage">{t('plan.featured')}</Badge>
        </div>
      )}

      <CardContent className="flex flex-col flex-1 p-6">
        {/* Nombre + precio */}
        <div className="mb-5">
          <h3 className="text-base font-semibold text-charcoal mb-1">{name}</h3>
          <p className="text-sm text-charcoal-muted mb-4">{description}</p>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold text-charcoal font-display">
              {formatMXN(plan.price)}
            </span>
            <span className="text-sm text-charcoal-muted pb-1">
              {t(`billing.${plan.billing_period === 'monthly' ? 'perMonth' : 'perQuarter'}`)}
            </span>
          </div>
          {plan.is_unlimited ? (
            <p className="flex items-center gap-1 text-sm text-sage mt-1 font-medium">
              <Infinity className="w-4 h-4" />
              {t('plan.unlimited')}
            </p>
          ) : (
            <p className="text-sm text-charcoal-muted mt-1">
              {t('plan.classesPerCycle', { count: plan.classes_per_cycle })}
            </p>
          )}
        </div>

        {/* Lista de beneficios */}
        <ul className="flex flex-col gap-2 mb-6 flex-1" aria-label={t('plan.includes')}>
          {includes.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-charcoal">
              <Check className="w-4 h-4 text-sage shrink-0 mt-0.5" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Button
          asChild
          variant={featured ? 'default' : 'outline'}
          size="lg"
          className="w-full"
        >
          <Link to={ROUTES.CHECKOUT} state={{ planId: plan.$id }}>
            {t('plan.subscribe')}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
