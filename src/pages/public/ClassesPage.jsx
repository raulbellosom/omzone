import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { SlidersHorizontal } from 'lucide-react'
import PageMeta from '@/components/seo/PageMeta'
import StructuredData from '@/components/seo/StructuredData'
import ClassCard from '@/features/classes/ClassCard'
import ClassFilters from '@/features/classes/ClassFilters'
import { Skeleton } from '@/components/ui/skeleton'
import { useClasses, useClassTypes } from '@/hooks/useClasses'
import { resolveField } from '@/lib/i18n-data'

const BASE_URL = import.meta.env.VITE_APP_BASE_URL ?? 'https://omzone.com'

export default function ClassesPage() {
  const { t } = useTranslation('classes')
  const [filters, setFilters] = useState({ search: '', level: '', typeSlug: '' })

  const { data: classes, isLoading } = useClasses()
  const { data: classTypes } = useClassTypes()

  const filtered = useMemo(() => {
    if (!classes) return []
    return classes.filter((cls) => {
      const title   = resolveField(cls, 'title').toLowerCase()
      const summary = resolveField(cls, 'summary').toLowerCase()
      const q       = filters.search.toLowerCase()
      if (q && !title.includes(q) && !summary.includes(q)) return false
      if (filters.level    && cls.difficulty          !== filters.level)    return false
      if (filters.typeSlug && cls.class_type?.slug    !== filters.typeSlug) return false
      return true
    })
  }, [classes, filters])

  const itemListSchema = classes
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Clases de yoga en Omzone',
        numberOfItems: classes.length,
        itemListElement: classes.map((cls, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: resolveField(cls, 'title'),
          description: resolveField(cls, 'summary'),
          url: `${BASE_URL}/classes/${cls.slug}`,
        })),
      }
    : null

  return (
    <>
      <PageMeta
        title="Clases de Yoga"
        description="Explora nuestro catálogo de clases de yoga. Vinyasa, Hatha, Yin, restaurativo y más. Todos los niveles, distintos horarios. Reserva hoy en Omzone."
        canonical={`${BASE_URL}/classes`}
        locale="es"
      />
      {itemListSchema && <StructuredData data={itemListSchema} />}

      <main className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <header className="mb-10">
          <h1 className="font-display text-3xl md:text-5xl text-charcoal font-semibold mb-3 text-balance">
            {t('catalog.title')}
          </h1>
          <p className="text-charcoal-muted text-lg max-w-xl">{t('catalog.subtitle')}</p>
        </header>

        <div className="grid lg:grid-cols-[260px_1fr] gap-8 items-start">
          {/* Filtros */}
          <aside
            aria-label={t('filters.title')}
            className="bg-white rounded-2xl p-5 border border-warm-gray-dark/40 shadow-card lg:sticky lg:top-24"
          >
            <div className="flex items-center gap-2 mb-5">
              <SlidersHorizontal className="w-4 h-4 text-charcoal-muted" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-charcoal">{t('filters.title')}</h2>
            </div>
            <ClassFilters filters={filters} onChange={setFilters} classTypes={classTypes ?? []} />
          </aside>

          {/* Resultados */}
          <section aria-label="Resultados de clases">
            {!isLoading && (
              <p className="text-sm text-charcoal-muted mb-5">
                {t('catalog.resultsCount', { count: filtered.length })}
              </p>
            )}

            {isLoading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden">
                    <Skeleton className="h-44 rounded-none" />
                    <div className="p-4 bg-white space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-9 w-full mt-3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((cls) => (
                  <ClassCard key={cls.$id} cls={cls} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <span className="text-5xl mb-4" aria-hidden="true">🔍</span>
                <h3 className="text-lg font-semibold text-charcoal mb-2">Sin resultados</h3>
                <p className="text-charcoal-muted text-sm max-w-xs">
                  {t('filters.allLevels')} — intenta con otros filtros.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  )
}
