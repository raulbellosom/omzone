/**
 * CustomerMembershipPage — estado y detalles de la membresía activa.
 * Ruta: /account/membership
 */
import { useTranslation } from 'react-i18next'
import { format, differenceInDays } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { Award, Check, Calendar, RefreshCw, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from 'react-router-dom'
import { useMyMembership } from '@/hooks/useCustomer'
import { resolveField } from '@/lib/i18n-data'
import { formatMXN } from '@/lib/currency'
import ROUTES from '@/constants/routes'
import { cn } from '@/lib/utils'

export default function CustomerMembershipPage() {
  const { t, i18n } = useTranslation('customer')
  const dateFnsLocale = i18n.language === 'es' ? es : enUS

  const { data: memb, isLoading } = useMyMembership()

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 space-y-4">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    )
  }

  if (!memb) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-display font-semibold text-charcoal mb-8">
          {t('membership.title')}
        </h1>
        <Card className="overflow-hidden">
          <CardContent className="p-10 text-center">
            <div className="inline-flex w-16 h-16 rounded-full bg-warm-gray items-center justify-center mb-6">
              <Award className="w-8 h-8 text-charcoal-subtle" />
            </div>
            <h2 className="text-lg font-semibold text-charcoal mb-2">{t('membership.noMembership')}</h2>
            <p className="text-charcoal-muted text-sm mb-8">
              {i18n.language === 'es'
                ? 'Accede a clases ilimitadas, reserva con anticipación y disfruta de beneficios exclusivos.'
                : 'Access unlimited classes, book in advance, and enjoy exclusive benefits.'}
            </p>
            <Button asChild>
              <Link to={ROUTES.MEMBERSHIPS}>{t('membership.noMembershipCta')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const daysLeft   = Math.max(0, differenceInDays(new Date(memb.ends_at), new Date()))
  const usagePct   = memb.is_unlimited ? 0 : Math.round((memb.classes_used / memb.classes_allowed) * 100)
  const planName   = resolveField(memb.plan, 'name')
  const benefits   = i18n.language === 'es' ? memb.plan.benefits_es : memb.plan.benefits_en

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 animate-fade-in-up space-y-6">
      {/* Header */}
      <h1 className="text-2xl md:text-3xl font-display font-semibold text-charcoal">
        {t('membership.title')}
      </h1>

      {/* Hero card */}
      <Card className="overflow-hidden">
        <div className="h-1.5 bg-linear-to-r from-sage to-olive" aria-hidden="true" />
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-xs text-charcoal-subtle uppercase tracking-wider mb-1">
                {t('membership.plan')}
              </p>
              <h2 className="text-xl font-display font-semibold text-charcoal">{planName}</h2>
              <p className="text-2xl font-bold text-sage font-display mt-1">
                {formatMXN(memb.plan.price)}
                <span className="text-sm font-normal text-charcoal-muted ml-1">/ {t('membership.monthly')}</span>
              </p>
            </div>
            <Badge variant="sage" className="text-xs shrink-0">{t('membership.active')}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-charcoal-muted">
              <Calendar className="w-4 h-4 text-sage shrink-0" />
              <div>
                <p className="text-[10px] text-charcoal-subtle uppercase tracking-wider">{t('membership.startedAt')}</p>
                <p className="font-medium text-charcoal">
                  {format(new Date(memb.started_at), 'd MMM yyyy', { locale: dateFnsLocale })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-charcoal-muted">
              <RefreshCw className="w-4 h-4 text-sage shrink-0" />
              <div>
                <p className="text-[10px] text-charcoal-subtle uppercase tracking-wider">{t('membership.renewsAt')}</p>
                <p className="font-medium text-charcoal">
                  {format(new Date(memb.renewal_at), 'd MMM yyyy', { locale: dateFnsLocale })}
                </p>
              </div>
            </div>
          </div>

          {daysLeft <= 7 && (
            <div className="mt-4 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-xl px-4 py-2.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {t('membership.daysLeft', { days: daysLeft })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uso de clases */}
      {!memb.is_unlimited && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-charcoal">{t('membership.classesUsed')}</h3>
              <span className="text-sm text-charcoal-muted">
                {t('membership.usageOf', { used: memb.classes_used, total: memb.classes_allowed })}
              </span>
            </div>
            <div className="w-full h-3 bg-warm-gray rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-[width] duration-700',
                  usagePct >= 90 ? 'bg-amber-400' : 'bg-sage'
                )}
                style={{ width: `${usagePct}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-charcoal-subtle">
              <span>0</span>
              <span>{memb.classes_allowed}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Beneficios */}
      {benefits?.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-charcoal mb-4">{t('membership.benefits')}</h3>
            <ul className="space-y-2.5">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-charcoal-muted animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="w-5 h-5 rounded-full bg-sage-muted flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-sage" />
                  </div>
                  {benefit}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Acciones */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-charcoal mb-4">{t('membership.billing')}</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild variant="outline" className="flex-1">
              <Link to={ROUTES.MEMBERSHIPS}>{t('membership.upgrade')}</Link>
            </Button>
            <Button
              variant="ghost"
              className="flex-1 text-charcoal-subtle hover:text-red-500 hover:bg-red-50"
              onClick={() => toast.info(i18n.language === 'es'
                ? 'Contacta a soporte para cancelar tu membresía.'
                : 'Contact support to cancel your membership.')}
            >
              {t('membership.cancel')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
