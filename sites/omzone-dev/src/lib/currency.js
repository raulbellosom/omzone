const CURRENCY_LOCALE_MAP = {
  MXN: "es-MX",
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  COP: "es-CO",
  ARS: "es-AR",
  CLP: "es-CL",
  BRL: "pt-BR",
};

/**
 * Formatea un número como moneda.
 * Si no se pasa `locale`, se resuelve automáticamente desde `currency`.
 */
export function formatCurrency(amount, currency = "MXN", locale) {
  const resolvedLocale = locale ?? CURRENCY_LOCALE_MAP[currency] ?? "es-MX";
  const formatted = new Intl.NumberFormat(resolvedLocale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted} ${currency}`;
}

export const CURRENCY_OPTIONS = [
  { value: "MXN", label: "MXN — Peso mexicano" },
  { value: "USD", label: "USD — Dólar estadounidense" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — Libra esterlina" },
  { value: "COP", label: "COP — Peso colombiano" },
  { value: "ARS", label: "ARS — Peso argentino" },
  { value: "CLP", label: "CLP — Peso chileno" },
  { value: "BRL", label: "BRL — Real brasileño" },
];

/** @deprecated Usar useCurrency().formatPrice para moneda dinámica */
export function formatMXN(amount) {
  return formatCurrency(amount, "MXN", "es-MX");
}
