/**
 * CustomerOrdersPage — historial de compras del cliente.
 * Ruta: /account/orders
 */
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { ShoppingBag, Award, Dumbbell, Package, Leaf } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useMyOrders } from '@/hooks/useCustomer'
import { formatMXN } from '@/lib/currency'
import ROUTES from '@/constants/routes'
import { cn } from '@/lib/utils'

const TYPE_ICON = {
  membership:    Award,
  class_session: Dumbbell,
  product:       Leaf,
  package:       Package,
}

const PAYMENT_BADGE = {
  paid:     'sage',
  pending:  'warm',
  refunded: 'outline',
  failed:   'destructive',
}

function OrderCard({ order, t, dateFnsLocale }) {
  const PrimaryIcon = TYPE_ICON[order.items[0]?.item_type] ?? ShoppingBag
  const badgeVariant = PAYMENT_BADGE[order.payment_status] ?? 'outline'

  return (
    <Card className="overflow-hidden animate-fade-in">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-warm-gray-dark/30 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-sage-muted flex items-center justify-center shrink-0">
              <PrimaryIcon className="w-4 h-4 text-sage" />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[11px] text-charcoal-subtle">{order.order_no}</p>
              <p className="text-xs text-charcoal-muted">
                {format(new Date(order.$createdAt), 'd MMM yyyy', { locale: dateFnsLocale })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Badge variant={badgeVariant} className="text-[10px]">
              {t(`orders.paymentStatus.${order.payment_status}`)}
            </Badge>
            <span className="font-bold text-charcoal font-display">{formatMXN(order.grand_total)}</span>
          </div>
        </div>

        {/* Items */}
        <ul className="divide-y divide-warm-gray-dark/20">
          {order.items.map((item) => {
            const ItemIcon = TYPE_ICON[item.item_type] ?? ShoppingBag
            return (
              <li key={item.$id} className="flex items-center justify-between px-5 py-3 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <ItemIcon className="w-3.5 h-3.5 text-charcoal-subtle shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-charcoal font-medium leading-tight truncate">
                      {item.title_snapshot}
                    </p>
                    <p className="text-[10px] text-charcoal-subtle mt-0.5 capitalize">
                      {t(`orders.types.${item.item_type}`)}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-charcoal shrink-0">
                  {formatMXN(item.line_total)}
                </span>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

export default function CustomerOrdersPage() {
  const { t, i18n } = useTranslation('customer')
  const dateFnsLocale = i18n.language === 'es' ? es : enUS

  const { data: orders, isLoading } = useMyOrders()

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 animate-fade-in-up">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-semibold text-charcoal">
          {t('orders.title')}
        </h1>
        {!isLoading && orders && (
          <p className="text-charcoal-muted mt-1 text-sm">
            {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
          </p>
        )}
      </div>

      {isLoading
        ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
          </div>
        )
        : !orders || orders.length === 0
          ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-10 h-10 text-charcoal-subtle mx-auto mb-4" />
              <p className="text-charcoal-muted mb-6">{t('orders.empty')}</p>
              <Button asChild size="sm">
                <Link to={ROUTES.CLASSES}>{t('common:actions.bookClass')}</Link>
              </Button>
            </div>
          )
          : (
            <div className="space-y-4">
              {orders.map((order, i) => (
                <div key={order.$id} style={{ animationDelay: `${i * 60}ms` }}>
                  <OrderCard order={order} t={t} dateFnsLocale={dateFnsLocale} />
                </div>
              ))}
            </div>
          )
      }
    </div>
  )
}
