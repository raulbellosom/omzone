import { format, parseISO, isValid, formatDistanceToNow } from 'date-fns'
import { es, enUS } from 'date-fns/locale'

const LOCALES = { es, en: enUS }

/**
 * Formatea una fecha ISO como string legible.
 * @param {string|Date} date
 * @param {string} [pattern='d MMM yyyy']
 * @param {string} [locale='es']
 */
export function formatDate(date, pattern = 'd MMM yyyy', locale = 'es') {
  const parsed = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(parsed)) return ''
  return format(parsed, pattern, { locale: LOCALES[locale] ?? es })
}

/**
 * Formatea solo la hora: "10:00 AM"
 */
export function formatTime(date, locale = 'es') {
  return formatDate(date, 'h:mm a', locale)
}

/**
 * Formatea fecha + hora: "lun. 12 mar · 10:00 AM"
 */
export function formatDateTime(date, locale = 'es') {
  return formatDate(date, "EEE. d MMM · h:mm a", locale)
}

/**
 * "Hace 3 días", "en 2 horas"
 */
export function fromNow(date, locale = 'es') {
  const parsed = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(parsed)) return ''
  return formatDistanceToNow(parsed, { addSuffix: true, locale: LOCALES[locale] ?? es })
}

/**
 * Duración en texto: "60 min"
 */
export function formatDuration(minutes) {
  if (!minutes) return ''
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}
