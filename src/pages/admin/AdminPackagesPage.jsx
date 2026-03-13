/**
 * AdminPackagesPage — gestión de paquetes.
 * Ruta: /app/packages
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Star } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminPackages, useTogglePackage } from '@/hooks/useAdmin'
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

export default function AdminPackagesPage() {
  const { t } = useTranslation('admin')
  const [pendingId, setPendingId] = useState(null)

  const { data: packages, isLoading } = useAdminPackages()
  const togglePackage = useTogglePackage()

  function handleToggle(pkg) {
    setPendingId(pkg.$id)
    togglePackage.mutate(
      { packageId: pkg.$id, enabled: !pkg.enabled },
      {
        onSuccess: () => { setPendingId(null); toast.success(pkg.enabled ? 'Paquete deshabilitado' : 'Paquete habilitado') },
        onError: () => { setPendingId(null); toast.error('Error al actualizar') },
      }
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 animate-fade-in-up">
      <AdminPageHeader
        title={t('packages.title')}
        subtitle={t('packages.subtitle')}
      />
      {isLoading
        ? <div className="grid sm:grid-cols-2 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}</div>
        : (
          <div className="grid sm:grid-cols-2 gap-4">
            {packages?.map((pkg, idx) => (
              <Card
                key={pkg.$id}
                className={`animate-fade-in-up transition-opacity ${!pkg.enabled ? 'opacity-60' : ''}`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-semibold text-charcoal leading-tight">{resolveField(pkg, 'name')}</p>
                    {pkg.is_featured && <Badge variant="outline" className="text-[10px] border-amber-400 text-amber-500 shrink-0">★ Destacado</Badge>}
                  </div>
                  <p className="text-2xl font-display font-bold text-sage mb-3">{formatMXN(pkg.price)}</p>
                  {pkg.items_json?.length > 0 && (
                    <ul className="space-y-1 mb-4">
                      {pkg.items_json.map((item, i) => (
                        <li key={i} className="text-xs text-charcoal-muted flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-olive shrink-0" />
                          {resolveField(item, 'label')}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-warm-gray-dark/20">
                    <span className="text-xs text-charcoal-muted">{t('packages.fields.enabled')}</span>
                    <Toggle
                      enabled={pkg.enabled}
                      onChange={() => handleToggle(pkg)}
                      loading={pendingId === pkg.$id}
                    />
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
