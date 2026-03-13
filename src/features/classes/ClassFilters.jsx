import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const LEVELS = ['beginner', 'intermediate', 'advanced', 'all_levels']

export default function ClassFilters({ filters, onChange, classTypes = [] }) {
  const { t } = useTranslation('classes')
  const { t: tc } = useTranslation('common')

  function set(key, value) {
    onChange({ ...filters, [key]: value })
  }

  function clear() {
    onChange({ search: '', level: '', typeSlug: '' })
  }

  const hasActiveFilters = filters.level || filters.typeSlug

  return (
    <div className="flex flex-col gap-4">
      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-subtle" />
        <Input
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          placeholder={t('catalog.searchPlaceholder')}
          className="pl-10"
        />
        {filters.search && (
          <button
            onClick={() => set('search', '')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-subtle hover:text-charcoal transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filtros por nivel */}
      <div>
        <p className="text-xs font-medium text-charcoal-muted uppercase tracking-wider mb-2">
          {t('filters.level')}
        </p>
        <div className="flex flex-wrap gap-2">
          <FilterPill
            active={!filters.level}
            onClick={() => set('level', '')}
          >
            {t('filters.allLevels')}
          </FilterPill>
          {LEVELS.map((lvl) => (
            <FilterPill
              key={lvl}
              active={filters.level === lvl}
              onClick={() => set('level', lvl)}
            >
              {tc(`difficulty.${lvl}`)}
            </FilterPill>
          ))}
        </div>
      </div>

      {/* Filtros por tipo */}
      {classTypes.length > 0 && (
        <div>
          <p className="text-xs font-medium text-charcoal-muted uppercase tracking-wider mb-2">
            {t('filters.type')}
          </p>
          <div className="flex flex-wrap gap-2">
            <FilterPill
              active={!filters.typeSlug}
              onClick={() => set('typeSlug', '')}
            >
              {t('filters.allTypes')}
            </FilterPill>
            {classTypes.map((type) => (
              <FilterPill
                key={type.$id}
                active={filters.typeSlug === type.slug}
                onClick={() => set('typeSlug', type.slug)}
              >
                {type.name_es}
              </FilterPill>
            ))}
          </div>
        </div>
      )}

      {/* Limpiar filtros */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clear} className="self-start text-charcoal-muted">
          <X className="w-3.5 h-3.5" />
          {tc('actions.clearFilters')}
        </Button>
      )}
    </div>
  )
}

function FilterPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150',
        active
          ? 'bg-sage text-white border-sage shadow-sm'
          : 'bg-white text-charcoal-muted border-warm-gray-dark hover:border-sage hover:text-sage'
      )}
    >
      {children}
    </button>
  )
}
