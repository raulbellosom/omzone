/**
 * AdminOrdersPage — historial de órdenes de todos los clientes.
 * Ruta: /app/orders
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import {
  ChevronDown,
  ChevronRight,
  ShoppingBag,
  Leaf,
  Package,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminOrders } from "@/hooks/useAdmin";
import { useCurrency } from "@/hooks/useCurrency";
import AdminPageHeader from "@/components/shared/AdminPageHeader";

const PAYMENT_BADGE = {
  paid: "sage",
  pending: "default",
  failed: "destructive",
  refunded: "outline",
};
const FULFILL_BADGE = {
  confirmed: "sage",
  completed: "outline",
  cancelled: "destructive",
  pending: "default",
};
const TYPE_ICON = {
  class_session: ShoppingBag,
  product: Leaf,
  package: Package,
};

function OrderRow({ order, t, dateFnsLocale }) {
  const [open, setOpen] = useState(false);
  const { formatPrice } = useCurrency();
  const Icon = open ? ChevronDown : ChevronRight;
  return (
    <li>
      <button
        className="w-full flex items-center justify-between px-5 py-3.5 gap-3 hover:bg-cream/60 transition-colors text-left"
        onClick={() => setOpen((p) => !p)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon className="w-4 h-4 text-charcoal-subtle shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-mono text-charcoal-subtle">
              {order.order_no}
            </p>
            <p className="text-sm text-charcoal font-medium truncate">
              {order.customer_email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline text-xs text-charcoal-muted">
            {format(new Date(order.$createdAt), "d MMM yyyy", {
              locale: dateFnsLocale,
            })}
          </span>
          <Badge
            variant={PAYMENT_BADGE[order.payment_status] ?? "default"}
            className="text-[10px]"
          >
            {t(`orders.paymentStatus.${order.payment_status}`)}
          </Badge>
          <Badge
            variant={FULFILL_BADGE[order.fulfillment_state] ?? "default"}
            className="text-[10px]"
          >
            {t(`orders.fulfillment.${order.fulfillment_state}`)}
          </Badge>
          <span className="font-semibold text-charcoal text-sm">
            {formatPrice(order.grand_total)}
          </span>
        </div>
      </button>
      {open && (
        <ul className="bg-cream/60 border-t border-warm-gray-dark/20 px-5 py-3 space-y-2">
          {order.items.map((item) => {
            const ItemIcon = TYPE_ICON[item.item_type] ?? ShoppingBag;
            return (
              <li
                key={item.$id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ItemIcon className="w-3.5 h-3.5 text-charcoal-subtle shrink-0" />
                  <span className="text-charcoal truncate">
                    {item.title_snapshot}
                  </span>
                  <span className="text-charcoal-muted text-xs shrink-0">
                    ×{item.quantity}
                  </span>
                </div>
                <span className="font-medium text-charcoal shrink-0">
                  {formatPrice(item.line_total)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

export default function AdminOrdersPage() {
  const { t, i18n } = useTranslation("admin");
  const dateFnsLocale = i18n.language === "es" ? es : enUS;
  const { data: orders, isLoading } = useAdminOrders();

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 animate-fade-in-up">
      <AdminPageHeader title={t("orders.title")} />
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : orders?.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-warm-gray-dark/20">
              {orders.map((o) => (
                <OrderRow
                  key={o.$id}
                  order={o}
                  t={t}
                  dateFnsLocale={dateFnsLocale}
                />
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-10 text-center">
            <ShoppingBag className="w-10 h-10 text-charcoal-subtle mx-auto mb-3" />
            <p className="text-sm text-charcoal-muted">{t("common.noData")}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
