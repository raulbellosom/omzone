import { useTranslation } from 'react-i18next'
import PageMeta from '@/components/seo/PageMeta'
import StructuredData from '@/components/seo/StructuredData'
import PackageCard from '@/features/packages/PackageCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useWellnessPackages } from '@/hooks/useWellness'
import { resolveField } from '@/lib/i18n-data'

const BASE_URL = import.meta.env.VITE_APP_BASE_URL ?? 'https://omzone.com'

export default function PackagesPage() {
  const { t } = useTranslation('packages')
  const { data: packages, isLoading } = useWellnessPackages()

  const itemListSchema = packages
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Paquetes wellness yoga y nutrición Omzone',
        itemListElement: packages.map((pkg, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Offer',
            name: resolveField(pkg, 'name'),
            description: resolveField(pkg, 'description'),
            price: pkg.price,
            priceCurrency: 'MXN',
            url: `${BASE_URL}/packages`,
            availability: 'https://schema.org/InStock',
          },
        })),
      }
    : null

  return (
    <>
      <PageMeta
        title="Paquetes Wellness · Yoga + Nutrición"
        description="Paquetes combinados de yoga y bienestar en Omzone. Nutrición, suplementos y clases en un solo plan. El mejor valor para tu transformación integral."
        canonical={`${BASE_URL}/packages`}
        locale="es"
      />
      {itemListSchema && <StructuredData data={itemListSchema} />}

      <main className="max-w-5xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <header className="text-center max-w-xl mx-auto mb-14">
          <span className="inline-block text-xs uppercase tracking-widest font-medium text-sage bg-sage-muted px-3 py-1 rounded-full mb-4">
            {t('page.badge')}
          </span>
          <h1 className="font-display text-3xl md:text-5xl text-charcoal font-semibold mb-4 text-balance">
            {t('page.title')}
          </h1>
          <p className="text-charcoal-muted text-lg">{t('page.subtitle')}</p>
        </header>

        {/* Paquetes */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages?.map((pkg) => (
              <PackageCard key={pkg.$id} pkg={pkg} />
            ))}
          </div>
        )}

        {/* Bloque informativo */}
        <aside className="mt-16 bg-sage-muted/40 rounded-2xl p-8 text-center max-w-2xl mx-auto">
          <h2 className="font-display text-xl text-charcoal font-semibold mb-2">
            {t('cta.title')}
          </h2>
          <p className="text-charcoal-muted text-sm leading-relaxed">
            {t('cta.description')}
          </p>
        </aside>
      </main>
    </>
  )
}
