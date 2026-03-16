import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { SlidersHorizontal, SearchX } from 'lucide-react'
import PageMeta from '@/components/seo/PageMeta'
import StructuredData from '@/components/seo/StructuredData'
import ClassCard from '@/features/classes/ClassCard'
import ClassFilters from '@/features/classes/ClassFilters'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useClasses, useClassTypes } from '@/hooks/useClasses'
import { resolveField } from '@/lib/i18n-data'
import { APP_BASE_URL } from '@/env'

const BASE_URL = APP_BASE_URL

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
      if (filters.level    && cls.difficulty       !== filters.level)    return false
      if (filters.typeSlug && cls.class_type?.slug !== filters.typeSlug) return false
      return true
    })
  }, [classes, filters])

  const hasActiveFilters = !!(filters.search || filters.level || filters.typeSlug)

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

      {/* ── Page hero ──────────────────────────────────────────── */}
      <div className="bg-white border-b border-warm-gray-dark/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <p className="text-sage text-xs font-semibold uppercase tracking-widest mb-3">
            {t('catalog.eyebrow')}
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-charcoal font-semibold mb-3 text-balance leading-[1.05]">
            {t('catalog.title')}
          </h1>
          <p className="text-charcoal-muted text-lg max-w-xl">
            {t('catalog.subtitle')}
          </p>
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">

          {/* ── Filters sidebar ──────────────────────────────── */}
          <aside
            aria-label={t('filters.title')}
            className="bg-white rounded-3xl p-6 border border-warm-gray-dark/40 shadow-card lg:sticky lg:top-24"
          >
            <div className="flex items-center gap-2 mb-6">
              <SlidersHorizontal className="w-4 h-4 text-charcoal-muted" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-charcoal">{t('filters.title')}</h2>
            </div>
            <ClassFilters
              filters={filters}
              onChange={setFilters}
              classTypes={classTypes ?? []}
            />
          </aside>

          {/* ── Results ──────────────────────────────────────── */}
          <section aria-label="Resultados de clases">

            {/* Count row */}
            <div className="flex items-center justify-between mb-6 min-h-7">
              {!isLoading && (
                <p className="text-sm text-charcoal-muted">
                  <span className="font-semibold text-charcoal">{filtered.length}</span>
                  {' '}{filtered.length === 1 ? 'clase encontrada' : 'clases encontradas'}
                  {hasActiveFilters && (
                    <button
                      onClick={() => setFilters({ search: '', level: '', typeSlug: '' })}
                      className="ml-3 text-sage hover:underline font-medium"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </p>
              )}
            </div>

            {/* Skeletons */}
            {isLoading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden bg-white border border-warm-gray-dark/30">
                    <Skeleton className="aspect-16/10 rounded-none" />
                    <div className="p-5 space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-9 w-full mt-2" />
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
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-warm-gray-dark/30">
                <div className="w-14 h-14 rounded-2xl bg-warm-gray flex items-center justify-center mb-4">
                  <SearchX className="w-6 h-6 text-charcoal-subtle" aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold text-charcoal mb-2">
                  Sin resultados
                </h3>
                <p className="text-charcoal-muted text-sm max-w-xs mb-5">
                  No encontramos clases con esos filtros. Intenta con otros criterios.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ search: '', level: '', typeSlug: '' })}
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  )
}
