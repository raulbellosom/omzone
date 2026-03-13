/**
 * AdminSessionsPage — lista de sesiones con cupo y cancelación.
 * Ruta: /app/sessions
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useAdminSessions, useCancelSession } from '@/hooks/useAdmin'
import { resolveField } from '@/lib/i18n-data'
import AdminPageHeader from '@/components/shared/AdminPageHeader'

const STATUS_BADGE = {
  scheduled: 'sage',
  full: 'default',
  cancelled: 'destructive',
  completed: 'outline',
}

export default function AdminSessionsPage() {
  const { t, i18n } = useTranslation('admin')
  const dateFnsLocale = i18n.language === 'es' ? es : enUS
  const [confirmId, setConfirmId] = useState(null)

  const { data: sessions, isLoading } = useAdminSessions()
  const cancelMutation = useCancelSession()

  function handleCancel(sessionId) {
    cancelMutation.mutate(sessionId, {
      onSuccess: () => { setConfirmId(null); toast.success('Sesión cancelada') },
      onError: () => { setConfirmId(null); toast.error('Error al cancelar') },
    })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 animate-fade-in-up">
      <AdminPageHeader title={t('sessions.title')} />
      {isLoading
        ? <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
        : sessions?.length > 0
          ? (
            <div className="space-y-3">
              {sessions.map((s, idx) => {
                const pct = Math.round((s.capacity_taken / s.capacity_total) * 100)
                const isCancelled = s.status === 'cancelled'
                return (
                  <Card
                    key={s.$id}
                    className={`animate-fade-in-up ${isCancelled ? 'opacity-50' : ''}`}
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-charcoal text-sm">{resolveField(s.class ?? {}, 'title')}</p>
                          <Badge variant={STATUS_BADGE[s.status] ?? 'default'} className="text-[10px]">
                            {t(`sessions.status.${s.status}`)}
                          </Badge>
                        </div>
                        <p className="text-xs text-charcoal-muted mb-2">
                          {format(new Date(s.session_date), "EEEE d MMM · HH:mm", { locale: dateFnsLocale })}
                          {s.location_label && ` · ${s.location_label}`}
                        </p>
                        {/* Capacity bar */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-warm-gray rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-[width] duration-500 ${pct >= 90 ? 'bg-amber-400' : 'bg-sage'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-charcoal-muted shrink-0">
                            {s.capacity_taken}/{s.capacity_total}
                          </span>
                        </div>
                      </div>
                      {!isCancelled && (
                        <div className="shrink-0">
                          {confirmId === s.$id
                            ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-charcoal-muted">{t('common.cancelConfirm')}</span>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-7 text-xs"
                                  onClick={() => handleCancel(s.$id)}
                                  disabled={cancelMutation.isPending}
                                >
                                  {t('common.yes')}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs"
                                  onClick={() => setConfirmId(null)}
                                >
                                  {t('common.no')}
                                </Button>
                              </div>
                            )
                            : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-charcoal-subtle hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setConfirmId(s.$id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )
                          }
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )
          : (
            <Card>
              <CardContent className="p-10 text-center">
                <p className="text-sm text-charcoal-muted">{t('common.noData')}</p>
              </CardContent>
            </Card>
          )
      }
    </div>
  )
}
