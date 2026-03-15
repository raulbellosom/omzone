/**
 * SEO helper central — genera metadata por página.
 *
 * Uso:
 *   import { buildPageMeta } from '@/lib/seo'
 *   const meta = buildPageMeta({ title: 'Morning Flow', description: '...' })
 */

const SITE_NAME = 'Omzone'
const BASE_URL = import.meta.env.VITE_APP_BASE_URL ?? 'https://omzone.com'
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`

/**
 * @typedef {Object} PageMetaConfig
 * @property {string} title             — Título de la página (sin sufijo de marca)
 * @property {string} [description]     — Meta description (max ~160 chars)
 * @property {string} [canonical]       — URL canónica completa
 * @property {string} [ogImage]         — URL de imagen OG (1200×630)
 * @property {string} [ogType]          — 'website' | 'article' | 'product'
 * @property {boolean} [noIndex]        — true para noindex,nofollow (áreas privadas)
 * @property {string} [locale]          — 'es' | 'en'
 * @property {Object} [structured]      — Datos JSON-LD adicionales
 */

/**
 * Construye el objeto de metadata completo para una página.
 * @param {PageMetaConfig} config
 */
export function buildPageMeta(config) {
  const {
    title,
    description = 'Clases de yoga, membresías y complementos wellness en un solo lugar.',
    canonical,
    ogImage = DEFAULT_OG_IMAGE,
    ogType = 'website',
    noIndex = false,
    locale = 'es',
    structured = null,
  } = config

  const fullTitle = title
    ? `${title} · ${SITE_NAME}`
    : `${SITE_NAME} · Yoga & Wellness Kitchen`

  const ogLocale = locale === 'en' ? 'en_US' : 'es_MX'

  return {
    title: fullTitle,
    description,
    canonical: canonical ?? BASE_URL,
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    og: {
      title: fullTitle,
      description,
      type: ogType,
      image: ogImage,
      url: canonical ?? BASE_URL,
      siteName: SITE_NAME,
      locale: ogLocale,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      image: ogImage,
    },
    structured,
  }
}

/**
 * Genera JSON-LD para una clase de yoga (schema.org/Event o Course).
 */
export function buildClassStructuredData(cls, session) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: cls.title_es,
    description: cls.description_es,
    startDate: session?.session_date,
    endDate: session?.end_date,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: session?.location_label ?? 'Omzone Studio',
    },
    offers: {
      '@type': 'Offer',
      price: session?.price_override ?? cls.base_price,
      priceCurrency: 'MXN',
      availability: 'https://schema.org/InStock',
      url: `${BASE_URL}/classes/${cls.slug}`,
    },
    organizer: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: BASE_URL,
    },
  }
}

/**
 * Genera JSON-LD para un plan de membresía (schema.org/Offer).
 */
export function buildMembershipStructuredData(plan) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: plan.name_es,
    description: plan.description_es,
    price: plan.price,
    priceCurrency: 'MXN',
    priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    availability: 'https://schema.org/InStock',
    url: `${BASE_URL}/memberships`,
  }
}
