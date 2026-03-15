import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Package, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatMXN } from '@/lib/currency'
import { resolveField } from '@/lib/i18n-data'
import ROUTES from '@/constants/routes'

const TYPE_ICON = { membership: '🧘', product: '🌿', class: '📅' }
const TYPE_COLORS = {
  membership: 'bg-sage-muted text-sage-darker',
  product:    'bg-sand text-charcoal',
  class:      'bg-warm-gray text-charcoal',
}

export default function PackageCard({ pkg }) {
  const { t } = useTranslation('packages')
  if (!pkg) return null

  const name        = resolveField(pkg, 'name')
  const description = resolveField(pkg, 'description')
  const items       = pkg.items_json ?? []

  return (
    <Card className="group flex flex-col overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300">
      {/* Header visual */}
      <div className="h-3 bg-gradient-to-r from-sage to-olive" aria-hidden="true" />

      <CardContent className="flex flex-col flex-1 p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-sage-muted flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-sage" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-charcoal leading-tight">{name}</h3>
            <p className="text-sm text-charcoal-muted mt-0.5">{description}</p>
          </div>
        </div>

        {/* Contenido del paquete */}
        <div className="mb-5">
          <p className="text-xs font-medium text-charcoal-muted uppercase tracking-wider mb-2">
            {t('card.includes')}
          </p>
          <ul className="flex flex-col gap-1.5">
            {items.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-charcoal">
                <span className="text-base" aria-hidden="true">{TYPE_ICON[item.type] ?? '•'}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[item.type] ?? 'bg-warm-gray text-charcoal'}`}>
                  {item.label_es ?? t(`items.${item.type}`)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Precio + CTA */}
        <div className="mt-auto pt-4 border-t border-warm-gray-dark/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-bold text-charcoal font-display">
              {formatMXN(pkg.price)}
            </span>
            {pkg.is_featured && (
              <Badge variant="sage">{t('card.savings', { amount: '' }).trim() || 'Mejor valor'}</Badge>
            )}
          </div>
          <Button asChild className="w-full" size="lg">
            <Link to={ROUTES.CHECKOUT} state={{ packageId: pkg.$id }}>
              {t('card.buy')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
