import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingCart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatMXN } from '@/lib/currency'
import { resolveField } from '@/lib/i18n-data'
import ROUTES from '@/constants/routes'
import { cn } from '@/lib/utils'

const TYPE_VISUALS = {
  smoothie:   { gradient: 'from-sage-muted to-sage-light',   emoji: '🥤', label: 'Smoothie' },
  snack:      { gradient: 'from-sand to-sand-light',          emoji: '🍫', label: 'Snack' },
  supplement: { gradient: 'from-olive-light to-sage-muted',   emoji: '💊', label: 'Suplemento' },
  plan:       { gradient: 'from-cream-dark to-sand-light',    emoji: '📋', label: 'Plan' },
  addon:      { gradient: 'from-warm-gray to-sand',           emoji: '✨', label: 'Add-on' },
  other:      { gradient: 'from-warm-gray to-cream',          emoji: '🌿', label: 'Wellness' },
}

export default function ProductCard({ product, compact = false }) {
  const { t } = useTranslation('wellness')
  if (!product) return null

  const name        = resolveField(product, 'name')
  const description = resolveField(product, 'description')
  const visual      = TYPE_VISUALS[product.product_type] ?? TYPE_VISUALS.other

  return (
    <Card className={cn(
      'group overflow-hidden transition-all duration-300',
      compact
        ? 'flex flex-row h-24'
        : 'hover:shadow-card-hover hover:-translate-y-0.5'
    )}>
      {/* Área visual */}
      <div className={cn(
        'relative shrink-0 flex items-center justify-center',
        `bg-gradient-to-br ${visual.gradient}`,
        compact ? 'w-24 h-full' : 'h-36'
      )}>
        <span className={cn(
          'transition-transform duration-300 group-hover:scale-110 select-none',
          compact ? 'text-2xl' : 'text-4xl'
        )}
          role="img"
          aria-label={t(`types.${product.product_type}`)}
        >
          {visual.emoji}
        </span>
        {product.is_addon_only && !compact && (
          <div className="absolute top-2 right-2">
            <Badge variant="warm" className="text-[10px]">
              {t('card.addOnly')}
            </Badge>
          </div>
        )}
      </div>

      {/* Contenido */}
      <CardContent className={cn('flex flex-col', compact ? 'p-3 justify-center flex-1' : 'p-4')}>
        {/* Tipo */}
        {!compact && (
          <span className="text-[10px] uppercase tracking-wider font-medium text-charcoal-subtle mb-1">
            {t(`types.${product.product_type}`)}
          </span>
        )}

        <h3 className={cn(
          'font-semibold text-charcoal leading-tight mb-1',
          compact ? 'text-sm' : 'text-base'
        )}>
          {name}
        </h3>

        {!compact && description && (
          <p className="text-sm text-charcoal-muted line-clamp-2 mb-3">{description}</p>
        )}

        <div className={cn(
          'flex items-center',
          compact ? 'gap-2 mt-1' : 'justify-between mt-auto pt-3 border-t border-warm-gray-dark/50'
        )}>
          <span className={cn('font-bold text-charcoal font-display', compact ? 'text-base' : 'text-lg')}>
            {formatMXN(product.price)}
          </span>
          {!compact && !product.is_addon_only && (
            <Button
              size="sm"
              asChild
            >
              <Link
                to={ROUTES.CHECKOUT}
                state={{ productId: product.$id }}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                {t('card.buyAlone')}
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
