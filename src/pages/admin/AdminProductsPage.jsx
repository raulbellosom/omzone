/**
 * AdminProductsPage — Wellness Kitchen: gestión de productos.
 * Ruta: /app/products
 */
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminProducts, useToggleProduct } from '@/hooks/useAdmin'
import { resolveField } from '@/lib/i18n-data'
import { formatMXN } from '@/lib/currency'
import AdminPageHeader from '@/components/shared/AdminPageHeader'

const ALL_TYPES = ['all', 'smoothie', 'snack', 'supplement', 'plan', 'addon']

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

export default function AdminProductsPage() {
  const { t } = useTranslation('admin')
  const [activeType, setActiveType] = useState('all')
  const [pendingId, setPendingId] = useState(null)

  const { data: products, isLoading } = useAdminProducts()
  const toggleProduct = useToggleProduct()

  const filtered = useMemo(() => {
    if (!products) return []
    if (activeType === 'all') return products
    return products.filter((p) => p.product_type === activeType)
  }, [products, activeType])

  function handleToggle(product) {
    setPendingId(product.$id)
    toggleProduct.mutate(
      { productId: product.$id, enabled: !product.enabled },
      {
        onSuccess: () => { setPendingId(null); toast.success(product.enabled ? 'Producto deshabilitado' : 'Producto habilitado') },
        onError: () => { setPendingId(null); toast.error('Error al actualizar') },
      }
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 animate-fade-in-up">
      <AdminPageHeader
        title={t('products.title')}
        subtitle={t('products.subtitle')}
      />

      {/* Type filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ALL_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 ${
              activeType === type
                ? 'bg-sage text-white'
                : 'bg-white border border-warm-gray-dark/40 text-charcoal hover:border-sage/50'
            }`}
          >
            {t(`products.types.${type}`)}
          </button>
        ))}
      </div>

      {isLoading
        ? <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
        : filtered.length > 0
          ? (
            <div className="space-y-3">
              {filtered.map((product, idx) => (
                <Card
                  key={product.$id}
                  className={`animate-fade-in-up transition-opacity ${!product.enabled ? 'opacity-60' : ''}`}
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-charcoal text-sm">{resolveField(product, 'name')}</p>
                        {product.is_featured && <Badge variant="outline" className="text-[10px] border-amber-400 text-amber-500">★</Badge>}
                        {product.is_addon_only && <Badge variant="outline" className="text-[10px]">Add-on</Badge>}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-charcoal-muted">
                        <Badge variant="default" className="text-[10px]">{t(`products.types.${product.product_type}`)}</Badge>
                        <span>{formatMXN(product.price)}</span>
                      </div>
                    </div>
                    <Toggle
                      enabled={product.enabled}
                      onChange={() => handleToggle(product)}
                      loading={pendingId === product.$id}
                    />
                  </CardContent>
                </Card>
              ))}
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
