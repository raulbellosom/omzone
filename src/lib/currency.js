/**
 * Formatea un número como moneda MXN.
 * @param {number} amount
 * @param {string} [currency='MXN']
 * @param {string} [locale='es-MX']
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'MXN', locale = 'es-MX') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Formatea como MXN con símbolo compacto: "$1,490"
 */
export function formatMXN(amount) {
  return formatCurrency(amount, 'MXN', 'es-MX')
}
