import { Helmet } from 'react-helmet-async'

/**
 * PageMeta — aplica metadata SEO por página usando react-helmet-async.
 *
 * Uso:
 *   <PageMeta
 *     title="Morning Flow"
 *     description="Clase de yoga para despertar el cuerpo..."
 *     canonical="https://omzone.mx/classes/morning-flow"
 *   />
 *
 * Props directas (alternativa al helper buildPageMeta):
 */
export default function PageMeta({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'website',
  noIndex = false,
  locale = 'es',
  children,
}) {
  const siteName = 'Omzone'
  const baseUrl = import.meta.env.VITE_APP_BASE_URL ?? 'https://omzone.mx'
  const defaultOgImage = `${baseUrl}/og-image.jpg`

  const fullTitle = title
    ? `${title} · ${siteName}`
    : `${siteName} · Yoga & Wellness Kitchen`

  const metaDescription =
    description ??
    'Clases de yoga, membresías y complementos wellness en un solo lugar.'

  const metaImage = ogImage ?? defaultOgImage
  const metaCanonical = canonical ?? baseUrl
  const ogLocale = locale === 'en' ? 'en_US' : 'es_MX'

  return (
    <Helmet>
      <html lang={locale} />
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={metaCanonical} />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={metaCanonical} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={ogLocale} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* JSON-LD u otros hijos adicionales */}
      {children}
    </Helmet>
  )
}
