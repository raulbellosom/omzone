/**
 * AdminMembershipsPage — gestión de planes de membresía.
 * Ruta: /app/memberships
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Star } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminMemberships, useTogglePlan, useTogglePlanFeatured } from '@/hooks/useAdmin'
import { resolveField } from '@/lib/i18n-data'
import { formatMXN } from '@/lib/currency'
import AdminPageHeader from '@/components/shared/AdminPageHeader'

function Toggle({ enabled, onChange, loading }) {
  return (
    <button
      onClick={onChange}
      disabled={loading}
      className={`relative w-10 h-6 rounded-full transition-colors duration-200 shrink-0 ${enabled ? 'bg-sage' : 'bg-warm-gray-dark/40'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-checked={enabled}
      role="switch"
    >
      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  )
}

export default function AdminMembershipsPage() {
  const { t } = useTranslation('admin')
  const [pendingId, setPendingId] = useState(null)

  const { data: plans, isLoading } = useAdminMemberships()
  const togglePlan = useTogglePlan()
  const toggleFeatured = useTogglePlanFeatured()

  function handleToggle(plan) {
    setPendingId(`${plan.$id}-enabled`)
    togglePlan.mutate(
      { planId: plan.$id, enabled: !plan.enabled },
      {
        onSuccess: () => { setPendingId(null); toast.success(plan.enabled ? 'Plan deshabilitado' : 'Plan habilitado') },
        onError: () => { setPendingId(null); toast.error('Error al actualizar') },
      }
    )
  }

  function handleFeatured(plan) {
    setPendingId(`${plan.$id}-featured`)
    toggleFeatured.mutate(
      { planId: plan.$id, featured: !plan.is_featured },
      {
        onSuccess: () => { setPendingId(null); toast.success(plan.is_featured ? 'Quitado de destacados' : 'Marcado como destacado') },
        onError: () => { setPendingId(null); toast.error('Error al actualizar') },
      }
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 animate-fade-in-up">
      <AdminPageHeader
        title={t('memberships.title')}
        subtitle={t('memberships.subtitle')}
      />
      {isLoading
        ? <div className="grid sm:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}</div>
        : (
          <div className="grid sm:grid-cols-2 gap-4">
            {plans?.map((plan, idx) => (
              <Card
                key={plan.$id}
                className={`animate-fade-in-up transition-opacity ${!plan.enabled ? 'opacity-60' : ''}`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-charcoal leading-tight">{resolveField(plan, 'name')}</p>
                      <p className="text-2xl font-display font-bold text-sage mt-1">{formatMXN(plan.price)}<span className="text-sm font-normal text-charcoal-muted">/mes</span></p>
                    </div>
                    {plan.is_unlimited && (
                      <Badge variant="sage" className="text-[10px] shrink-0">∞ Ilimitado</Badge>
                    )}
                  </div>
                  {plan.includes_json?.length > 0 && (
                    <ul className="space-y-1 mb-4">
                      {plan.includes_json.map((item, i) => (
                        <li key={i} className="text-xs text-charcoal-muted flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-sage shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-warm-gray-dark/20">
                    <button
                      onClick={() => handleFeatured(plan)}
                      disabled={pendingId === `${plan.$id}-featured`}
                      className={`flex items-center gap-1.5 text-xs transition-colors ${plan.is_featured ? 'text-amber-500' : 'text-charcoal-subtle hover:text-amber-400'} ${pendingId === `${plan.$id}-featured` ? 'opacity-50' : ''}`}
                    >
                      <Star className={`w-4 h-4 ${plan.is_featured ? 'fill-amber-400 text-amber-400' : ''}`} />
                      {t('memberships.fields.featured')}
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-charcoal-muted">{t('memberships.fields.enabled')}</span>
                      <Toggle
                        enabled={plan.enabled}
                        onChange={() => handleToggle(plan)}
                        loading={pendingId === `${plan.$id}-enabled`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      }
    </div>
  )
}
