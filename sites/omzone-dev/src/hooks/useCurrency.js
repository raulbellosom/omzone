import { useAppSettings } from "@/hooks/useAdmin";
import { formatCurrency } from "@/lib/currency";

/**
 * Devuelve la moneda configurada en app_settings y una función formatPrice
 * que la usa. React Query sirve app_settings desde caché tras la primera carga,
 * por lo que llamar este hook en muchos componentes es gratuito.
 */
export function useCurrency() {
  const { data: settings } = useAppSettings();
  const currency =
    settings?.defaultCurrency ?? import.meta.env.VITE_DEFAULT_CURRENCY ?? "MXN";

  return {
    currency,
    formatPrice: (amount) => formatCurrency(amount, currency),
  };
}
