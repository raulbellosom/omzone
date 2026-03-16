/**
 * AdminPassesPage — gestión de pases QR de acceso físico.
 * Ruta: /app/passes
 */
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { QrCode, ChevronDown, X } from 'lucide-react'
import { toast } from 'sonner'
import { QRCodeSVG } from 'qrcode.react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAdminPasses, useCancelPass } from '@/hooks/useAdmin'
import AdminPageHeader from '@/components/shared/AdminPageHeader'

const STATUS_BADGE = {
  active: 'sage',
  used: 'outline',
  expired: 'default',
  cancelled: 'destructive',
}

const STATUSES = ['all', 'active', 'used', 'expired', 'cancelled']

function PassRow({ pass, t, dateFnsLocale }) {
  const [open, setOpen] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const cancelPass = useCancelPass()

  function handleCancel() {
    cancelPass.mutate(pass.$id, {
      onSuccess: () => { setConfirmCancel(false); toast.success(t('passes.cancelSuccess', 'Pase cancelado')) },
      onError: () => toast.error('Error al cancelar'),
    })
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    try {
      return format(new Date(dateStr), 'd MMM yyyy', { locale: dateFnsLocale })
    } catch { return '—' }
  }

  return (
    <Card className={`animate-fade-in-up transition-opacity ${pass.status === 'cancelled' ? 'opacity-50' : ''}`}>
      <CardContent className="p-0">
        {/* Row */}
        <button
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-cream/40 transition-colors"
          onClick={() => setOpen((p) => !p)}
        >
          <div className="w-8 h-8 rounded-lg bg-sage/10 flex items-center justify-center shrink-0">
            <QrCode className="w-4 h-4 text-sage" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-charcoal font-medium truncate max-w-[120px]">
                {pass.$id}
              </span>
              <Badge variant={STATUS_BADGE[pass.status] ?? 'default'} className="text-[10px]">
                {t(`passes.status.${pass.status}`, pass.status)}
              </Badge>
              {pass.pass_type && (
                <Badge variant="outline" className="text-[10px]">
                  {pass.pass_type}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-charcoal-muted flex-wrap">
              <span className="truncate max-w-[120px]">{pass.client_user_id}</span>
              {pass.valid_from && <span>Desde {formatDate(pass.valid_from)}</span>}
              {pass.valid_until && <span>Hasta {formatDate(pass.valid_until)}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {pass.status === 'active' && (
              confirmCancel ? (
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <span className="text-xs text-charcoal-muted hidden sm:block">
                    {t('passes.cancelConfirm', '¿Cancelar?')}
                  </span>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-6 text-[10px] px-2"
                    onClick={handleCancel}
                    disabled={cancelPass.isPending}
                  >
                    {t('common.yes', 'Sí')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[10px] px-2"
                    onClick={() => setConfirmCancel(false)}
                  >
                    {t('common.no', 'No')}
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-charcoal-subtle hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => { e.stopPropagation(); setConfirmCancel(true) }}
                  title={t('passes.cancel', 'Cancelar pase')}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              )
            )}
            <ChevronDown className={`w-4 h-4 text-charcoal-subtle transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Expanded QR detail */}
        {open && (
          <div className="px-4 pb-4 pt-0 border-t border-warm-gray-dark/20">
            <div className="flex flex-col sm:flex-row gap-4 mt-3">
              {/* QR code */}
              {pass.qr_token ? (
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="p-3 bg-white border border-sand rounded-xl">
                    <QRCodeSVG value={pass.qr_token} size={120} />
                  </div>
                  <span className="font-mono text-[10px] text-charcoal-muted text-center break-all max-w-[150px]">
                    {pass.qr_token}
                  </span>
                </div>
              ) : (
                <div className="w-[150px] h-[150px] flex items-center justify-center bg-warm-gray rounded-xl text-xs text-charcoal-muted">
                  Sin token
                </div>
              )}

              {/* Details */}
              <div className="flex-1 space-y-2 text-xs text-charcoal-muted">
                <div>
                  <span className="font-medium text-charcoal">{t('passes.fields.clientId', 'Cliente')}: </span>
                  <span className="font-mono">{pass.client_user_id ?? '—'}</span>
                </div>
                <div>
                  <span className="font-medium text-charcoal">{t('passes.fields.type', 'Tipo')}: </span>
                  {pass.pass_type ?? '—'}
                </div>
                {pass.reference_id && (
                  <div>
                    <span className="font-medium text-charcoal">Ref: </span>
                    <span className="font-mono">{pass.reference_id}</span>
                  </div>
                )}
                {pass.used_at && (
                  <div>
                    <span className="font-medium text-charcoal">{t('passes.fields.usedAt', 'Usado el')}: </span>
                    {formatDate(pass.used_at)}
                  </div>
                )}
                {pass.notes && (
                  <div>
                    <span className="font-medium text-charcoal">{t('passes.fields.notes', 'Notas')}: </span>
                    {pass.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function AdminPassesPage() {
  const { t, i18n } = useTranslation('admin')
  const dateFnsLocale = i18n.language === 'es' ? es : enUS
  const [search, setSearch] = useState('')
  const [activeStatus, setActiveStatus] = useState('all')

  const statusFilter = activeStatus === 'all' ? undefined : activeStatus
  const { data: passes, isLoading } = useAdminPasses({ status: statusFilter })

  const filtered = useMemo(() => {
    if (!passes) return []
    if (!search) return passes
    const q = search.toLowerCase()
    return passes.filter(
      (p) =>
        p.$id.toLowerCase().includes(q) ||
        p.client_user_id?.toLowerCase().includes(q) ||
        p.qr_token?.toLowerCase().includes(q)
    )
  }, [passes, search])

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 animate-fade-in-up">
      <AdminPageHeader
        title={t('passes.title', 'Pases de Acceso')}
        subtitle={t('passes.subtitle', 'QR de entrada física por usuario.')}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.search', 'Buscar por ID, cliente o token...')}
            className="text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeStatus === s
                  ? 'bg-sage text-white'
                  : 'bg-white border border-warm-gray-dark/40 text-charcoal hover:border-sage/50'
              }`}
            >
              {s === 'all' ? t('common.all', 'Todos') : t(`passes.status.${s}`, s)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((pass, idx) => (
            <div key={pass.$id} style={{ animationDelay: `${idx * 30}ms` }}>
              <PassRow pass={pass} t={t} dateFnsLocale={dateFnsLocale} />
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-10 text-center">
            <QrCode className="w-10 h-10 text-charcoal-subtle mx-auto mb-3" />
            <p className="text-sm text-charcoal-muted">
              {activeStatus !== 'all'
                ? t('passes.noPassesStatus', 'No hay pases con ese estado.')
                : t('passes.noPasses', 'No hay pases de acceso registrados.')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
