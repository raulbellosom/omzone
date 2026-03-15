import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Clock, Users, ArrowRight, Waves, Heart, Zap, Moon, Sun, Sparkles, Activity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import DifficultyBadge from './DifficultyBadge'
import { formatMXN } from '@/lib/currency'
import { formatDuration } from '@/lib/dates'
import { resolveField } from '@/lib/i18n-data'
import ROUTES from '@/constants/routes'
import { cn } from '@/lib/utils'

const TYPE_GRADIENTS = {
  vinyasa:    'from-sage-muted to-sage-light',
  restorative:'from-sand to-sand-light',
  power:      'from-olive-light to-sage-muted',
  yin:        'from-sage-muted to-cream-dark',
  hatha:      'from-sand-dark to-sand',
  meditation: 'from-sage-light to-cream',
  default:    'from-warm-gray to-sand-light',
}

const TYPE_ICON = {
  vinyasa:    Waves,
  restorative:Heart,
  power:      Zap,
  yin:        Moon,
  hatha:      Sun,
  meditation: Sparkles,
  default:    Activity,
}

export default function ClassCard({ cls, session, compact = false }) {
  const { t } = useTranslation('classes')
  if (!cls) return null

  const typeSlug  = cls.class_type?.slug ?? 'default'
  const gradient  = TYPE_GRADIENTS[typeSlug] ?? TYPE_GRADIENTS.default
  const TypeIcon  = TYPE_ICON[typeSlug]      ?? TYPE_ICON.default

  const title     = resolveField(cls, 'title')
  const summary   = resolveField(cls, 'summary')
  const typeLabel = resolveField(cls.class_type, 'name') || typeSlug
  const instName  = cls.instructor?.full_name ?? ''

  const spotsLeft = session ? session.capacity_total - session.capacity_taken : null
  const isFull    = session?.status === 'full' || spotsLeft === 0
  const price     = formatMXN(session?.price_override ?? cls.base_price)

  /* ── Compact mode ─────────────────────────────────────────────── */
  if (compact) {
    return (
      <Card className="group overflow-hidden hover:shadow-card-hover transition-all duration-300 cursor-pointer flex flex-row h-24">
        <Link
          to={ROUTES.CLASS_DETAIL(cls.slug)}
          className="block relative overflow-hidden w-24 shrink-0"
          aria-label={title}
        >
          <div className={cn('absolute inset-0 bg-linear-to-br', gradient, 'transition-transform duration-500 group-hover:scale-105')} />
          <TypeIcon className="absolute inset-0 m-auto w-8 h-8 text-white/25" aria-hidden="true" />
        </Link>
        <CardContent className="flex flex-col p-3 justify-center flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-charcoal leading-snug truncate group-hover:text-sage transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-charcoal-muted">
            <Clock className="w-3 h-3" />
            <span>{formatDuration(cls.duration_min)}</span>
            {instName && <span className="truncate">· {instName}</span>}
          </div>
        </CardContent>
      </Card>
    )
  }

  /* ── Default mode ─────────────────────────────────────────────── */
  return (
    <Card className="group overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col">

      {/* ── Visual area ─────────────────────────────────────────── */}
      <Link
        to={ROUTES.CLASS_DETAIL(cls.slug)}
        className="block relative aspect-16/10 overflow-hidden shrink-0"
        aria-label={title}
        tabIndex={-1}
      >
        <div className={cn(
          'absolute inset-0 bg-linear-to-br',
          gradient,
          'transition-transform duration-500 group-hover:scale-105'
        )} />

        {/* Centered icon */}
        <TypeIcon
          className="absolute inset-0 m-auto w-12 h-12 text-white/20"
          aria-hidden="true"
        />

        {/* Type badge — top left */}
        <span className="absolute top-3 left-3 z-10">
          <Badge variant="charcoal" className="text-[10px] uppercase tracking-wider">
            {typeLabel}
          </Badge>
        </span>

        {/* Full overlay */}
        {isFull && (
          <div className="absolute inset-0 bg-charcoal/55 flex items-center justify-center z-10">
            <Badge variant="charcoal">{t('card.fullClass')}</Badge>
          </div>
        )}
      </Link>

      {/* ── Content ─────────────────────────────────────────────── */}
      <CardContent className="flex flex-col flex-1 p-5 gap-0">

        {/* Title — full width, no competing badge */}
        <Link to={ROUTES.CLASS_DETAIL(cls.slug)} className="block mb-2">
          <h3 className="text-base font-semibold text-charcoal leading-snug group-hover:text-sage transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>

        {/* Difficulty badge — its own row, won't break title */}
        <DifficultyBadge difficulty={cls.difficulty} className="self-start mb-3" />

        {/* Summary */}
        {summary && (
          <p className="text-sm text-charcoal-muted line-clamp-2 mb-3 leading-relaxed">
            {summary}
          </p>
        )}

        {/* Instructor */}
        {instName && (
          <p className="text-xs text-charcoal-subtle mb-4">
            {t('card.by', { name: instName })}
          </p>
        )}

        {/* Footer: duration / spots / price */}
        <div className="mt-auto pt-3 border-t border-warm-gray-dark/50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-xs text-charcoal-muted min-w-0">
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              {formatDuration(cls.duration_min)}
            </span>
            {spotsLeft !== null && !isFull && (
              <span className="flex items-center gap-1 shrink-0">
                <Users className="w-3.5 h-3.5" aria-hidden="true" />
                {t('card.spots', { count: spotsLeft })}
              </span>
            )}
          </div>
          <span className="font-bold text-sage text-sm shrink-0">{price}</span>
        </div>

        {/* Book CTA */}
        <Button
          asChild
          size="sm"
          variant={isFull ? 'sand' : 'default'}
          disabled={isFull}
          className="mt-3 w-full"
        >
          <Link to={ROUTES.CLASS_DETAIL(cls.slug)}>
            {isFull ? t('card.noSpots') : t('card.book')}
            {!isFull && <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
