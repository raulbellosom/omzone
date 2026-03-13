import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Clock, Users, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import DifficultyBadge from './DifficultyBadge'
import { formatMXN } from '@/lib/currency'
import { formatDuration, formatDateTime } from '@/lib/dates'
import { resolveField } from '@/lib/i18n-data'
import ROUTES from '@/constants/routes'
import { cn } from '@/lib/utils'

// Gradientes únicos por tipo de clase — sin imágenes reales
const TYPE_GRADIENTS = {
  vinyasa:    'from-sage-muted to-sage-light',
  restorative:'from-sand to-sand-light',
  power:      'from-olive-light to-sage-muted',
  yin:        'from-sage-muted to-cream-dark',
  hatha:      'from-sand-dark to-sand',
  meditation: 'from-sage-light to-cream',
  default:    'from-warm-gray to-sand-light',
}

// Decoración textual del tipo en el visual
const TYPE_SYMBOL = {
  vinyasa:    '◎',
  restorative:'❋',
  power:      '△',
  yin:        '◐',
  hatha:      '○',
  meditation: '✦',
  default:    '◌',
}

export default function ClassCard({ cls, session, compact = false }) {
  const { t } = useTranslation('classes')
  if (!cls) return null

  const typeSlug = cls.class_type?.slug ?? 'default'
  const gradient = TYPE_GRADIENTS[typeSlug] ?? TYPE_GRADIENTS.default
  const symbol   = TYPE_SYMBOL[typeSlug]    ?? TYPE_SYMBOL.default

  const title       = resolveField(cls, 'title')
  const summary     = resolveField(cls, 'summary')
  const typeLabel   = resolveField(cls.class_type, 'name') || typeSlug
  const instName    = cls.instructor?.full_name ?? ''

  const spotsLeft   = session ? session.capacity_total - session.capacity_taken : null
  const isFull      = session?.status === 'full' || spotsLeft === 0

  return (
    <Card className={cn(
      'group overflow-hidden hover:shadow-card-hover transition-all duration-300 cursor-pointer',
      compact && 'flex flex-row h-28'
    )}>
      {/* Visual superior / lateral en compact */}
      <Link
        to={ROUTES.CLASS_DETAIL(cls.slug)}
        className={cn(
          'block relative overflow-hidden shrink-0',
          compact ? 'w-28 h-full' : 'h-44'
        )}
        aria-label={title}
      >
        <div className={cn(
          'absolute inset-0 bg-gradient-to-br',
          gradient,
          'transition-transform duration-500 group-hover:scale-105'
        )} />
        {/* Símbolo decorativo */}
        <span className="absolute inset-0 flex items-center justify-center text-white/30 font-display select-none"
          style={{ fontSize: compact ? '2rem' : '3.5rem' }}
          aria-hidden="true"
        >
          {symbol}
        </span>
        {/* Badge de tipo */}
        <span className="absolute top-3 left-3">
          <Badge variant="charcoal" className="text-[10px] uppercase tracking-wider">
            {typeLabel}
          </Badge>
        </span>
        {/* Badge lleno */}
        {isFull && (
          <span className="absolute inset-0 bg-charcoal/50 flex items-center justify-center">
            <Badge variant="charcoal">{t('card.fullClass')}</Badge>
          </span>
        )}
      </Link>

      {/* Contenido */}
      <CardContent className={cn('flex flex-col flex-1', compact ? 'p-3 justify-center' : 'p-4 pt-3')}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link to={ROUTES.CLASS_DETAIL(cls.slug)}>
            <h3 className={cn(
              'font-semibold text-charcoal leading-tight group-hover:text-sage transition-colors',
              compact ? 'text-sm' : 'text-base'
            )}>
              {title}
            </h3>
          </Link>
          <DifficultyBadge difficulty={cls.difficulty} />
        </div>

        {!compact && summary && (
          <p className="text-sm text-charcoal-muted line-clamp-2 mb-3">{summary}</p>
        )}

        {instName && (
          <p className="text-xs text-charcoal-subtle mb-2">
            {t('card.by', { name: instName })}
          </p>
        )}

        <div className={cn('flex items-center gap-3 text-xs text-charcoal-muted', compact ? 'mt-1' : 'mt-auto pt-3 border-t border-warm-gray-dark/50')}>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(cls.duration_min)}
          </span>
          {spotsLeft !== null && !isFull && (
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {t('card.spots', { count: spotsLeft })}
            </span>
          )}
          {!compact && (
            <span className="ml-auto font-semibold text-sage text-sm">
              {formatMXN(session?.price_override ?? cls.base_price)}
            </span>
          )}
        </div>

        {!compact && (
          <Button
            asChild
            size="sm"
            variant={isFull ? 'sand' : 'default'}
            disabled={isFull}
            className="mt-3 w-full"
          >
            <Link to={ROUTES.CLASS_DETAIL(cls.slug)}>
              {isFull ? t('card.noSpots') : t('card.book')}
              {!isFull && <ArrowRight className="w-3.5 h-3.5" />}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
