/**
 * Utilidad para resolver campos bilingües de datos del backend.
 *
 * Los modelos de Appwrite tienen campos como `title_es` / `title_en`.
 * Esta función elige el campo correcto según el locale activo.
 *
 * Uso:
 *   import { resolveField } from '@/lib/i18n-data'
 *   const title = resolveField(cls, 'title')  // → cls.title_es o cls.title_en
 */
import i18n from '@/i18n/index.js'

/**
 * @param {Object} obj       — el objeto de datos (clase, plan, producto…)
 * @param {string} fieldBase — el nombre base del campo, sin sufijo de idioma
 * @returns {string}
 */
export function resolveField(obj, fieldBase) {
  if (!obj) return ''
  const lang = i18n.language?.startsWith('en') ? 'en' : 'es'
  return obj[`${fieldBase}_${lang}`] ?? obj[`${fieldBase}_es`] ?? ''
}

/**
 * Atajo para obtener el locale activo como 'es' | 'en'.
 */
export function getActiveLang() {
  return i18n.language?.startsWith('en') ? 'en' : 'es'
}
