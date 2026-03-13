/**
 * AdminClassesPage — gestión de clases de yoga.
 * Ruta: /app/classes
 */
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { useAdminClasses, useToggleClass } from '@/hooks/useAdmin'
import { resolveField } from '@/lib/i18n-data'
import { formatMXN } from '@/lib/currency'
import AdminPageHeader from '@/components/shared/AdminPageHeader'

const DIFFICULTY_BADGE = {
  beginner: 'sage',
  intermediate: 'default',
  advanced: 'destructive',
  all_levels: 'outline',
}

function Toggle({ enabled, onChange, loading }) {
  return (
    <button
      onClick={onChange}
      disabled={loading}
      className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 shrink-0 ${enabled ? 'bg-sage' : 'bg-warm-gray-dark/40'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-checked={enabled}
      role="switch"
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? 'translate-x-4' : 'translate-x-0'}`}
      />
    </button>
  )
}

export default function AdminClassesPage() {
  const { t } = useTranslation('admin')
  const [search, setSearch] = useState('')
  const [pendingId, setPendingId] = useState(null)

  const { data: classes, isLoading } = useAdminClasses()
  const toggleMutation = useToggleClass()

  const filtered = useMemo(() => {
    if (!classes) return []
    const q = search.toLowerCase()
    return classes.filter((c) =>
      c.title_es?.toLowerCase().includes(q) ||
      c.title_en?.toLowerCase().includes(q) ||
      c.instructor?.full_name?.toLowerCase().includes(q)
    )
  }, [classes, search])

  function handleToggle(cls) {
    setPendingId(cls.$id)
    toggleMutation.mutate(
      { classId: cls.$id, enabled: !cls.enabled },
      {
        onSuccess: () => { setPendingId(null); toast.success(cls.enabled ? 'Clase deshabilitada' : 'Clase habilitada') },
        onError: () => { setPendingId(null); toast.error('Error al actualizar') },
      }
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 animate-fade-in-up">
      <AdminPageHeader title={t('classes.title')} />

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-subtle" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('common.search')}
          className="pl-9"
        />
      </div>

      {isLoading
        ? <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
        : filtered.length > 0
          ? (
            <div className="space-y-3">
              {filtered.map((cls, idx) => (
                <Card
                  key={cls.$id}
                  className={`transition-opacity duration-300 animate-fade-in-up ${!cls.enabled ? 'opacity-60' : ''}`}
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-charcoal text-sm">{resolveField(cls, 'title')}</p>
                        {cls.is_featured && (
                          <Badge variant="outline" className="text-[10px] border-olive text-olive">★ {t('classes.fields.featured')}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap text-xs text-charcoal-muted">
                        <span>{cls.instructor?.full_name}</span>
                        <span>·</span>
                        <span>{resolveField(cls.class_type ?? {}, 'name')}</span>
                        <span>·</span>
                        <span>{cls.duration_min} min</span>
                        <span>·</span>
                        <span>{formatMXN(cls.base_price)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant={DIFFICULTY_BADGE[cls.difficulty] ?? 'default'} className="text-[10px] hidden sm:inline-flex">
                        {cls.difficulty?.replace('_', ' ')}
                      </Badge>
                      <Toggle
                        enabled={cls.enabled}
                        onChange={() => handleToggle(cls)}
                        loading={pendingId === cls.$id}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
          : (
            <Card>
              <CardContent className="p-10 text-center">
                <p className="text-sm text-charcoal-muted">{t('common.noData')}</p>
              </CardContent>
            </Card>
          )
      }
    </div>
  )
}
