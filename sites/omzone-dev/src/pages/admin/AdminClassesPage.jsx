/**
 * AdminClassesPage — gestión de clases de yoga.
 * Ruta: /app/classes
 */
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  useAdminClasses,
  useToggleClass,
  useCreateClass,
  useUpdateClass,
  useAdminInstructors,
  useAdminClassTypes,
} from '@/hooks/useAdmin'
import { resolveField } from '@/lib/i18n-data'
import { formatMXN } from '@/lib/currency'
import AdminPageHeader from '@/components/shared/AdminPageHeader'
import AdminFormDialog from '@/components/admin/AdminFormDialog'

const EMPTY_FORM = {
  title_es: '', title_en: '',
  summary_es: '', summary_en: '',
  description_es: '', description_en: '',
  class_type_id: '', instructor_id: '',
  difficulty: 'all_levels', duration_min: 60,
  base_price: 0, is_featured: false, enabled: true,
}

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
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null) // null = new, object = edit
  const [form, setForm] = useState(EMPTY_FORM)

  const { data: classes, isLoading } = useAdminClasses()
  const { data: instructors = [] } = useAdminInstructors()
  const { data: classTypes = [] } = useAdminClassTypes()
  const toggleMutation = useToggleClass()
  const createMutation = useCreateClass()
  const updateMutation = useUpdateClass()

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  function openEdit(cls) {
    setEditing(cls)
    setForm({
      title_es: cls.title_es ?? '', title_en: cls.title_en ?? '',
      summary_es: cls.summary_es ?? '', summary_en: cls.summary_en ?? '',
      description_es: cls.description_es ?? '', description_en: cls.description_en ?? '',
      class_type_id: cls.class_type_id ?? '', instructor_id: cls.instructor_id ?? '',
      difficulty: cls.difficulty ?? 'all_levels',
      duration_min: cls.duration_min ?? 60,
      base_price: cls.base_price ?? 0,
      is_featured: cls.is_featured ?? false,
      enabled: cls.enabled ?? true,
    })
    setDialogOpen(true)
  }

  function handleSubmit() {
    const mutation = editing ? updateMutation : createMutation
    const payload = editing
      ? { classId: editing.$id, data: form }
      : form
    mutation.mutate(payload, {
      onSuccess: () => {
        setDialogOpen(false)
        toast.success(editing ? 'Clase actualizada' : 'Clase creada')
      },
      onError: () => toast.error('Error al guardar'),
    })
  }

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

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 animate-fade-in-up">
      <AdminPageHeader
        title={t('classes.title')}
        action={
          <Button size="sm" onClick={openCreate} className="gap-1.5">
            <Plus className="w-4 h-4" />
            {t('classes.newClass', 'Nueva Clase')}
          </Button>
        }
      />

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
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-charcoal-subtle hover:text-charcoal"
                        onClick={() => openEdit(cls)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
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

      {/* Create / Edit dialog */}
      <AdminFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? t('classes.editClass', 'Editar Clase') : t('classes.newClass', 'Nueva Clase')}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>{t('classes.fields.titleEs', 'Título ES')}</Label>
            <Input value={form.title_es} onChange={(e) => setForm(f => ({ ...f, title_es: e.target.value }))} required />
          </div>
          <div className="space-y-1">
            <Label>{t('classes.fields.titleEn', 'Título EN')}</Label>
            <Input value={form.title_en} onChange={(e) => setForm(f => ({ ...f, title_en: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label>{t('classes.fields.summaryEs', 'Resumen ES')}</Label>
            <Input value={form.summary_es} onChange={(e) => setForm(f => ({ ...f, summary_es: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label>{t('classes.fields.summaryEn', 'Resumen EN')}</Label>
            <Input value={form.summary_en} onChange={(e) => setForm(f => ({ ...f, summary_en: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label>{t('classes.fields.classType', 'Tipo de clase')}</Label>
            <select
              className="w-full h-9 rounded-lg border border-sand bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage/30"
              value={form.class_type_id}
              onChange={(e) => setForm(f => ({ ...f, class_type_id: e.target.value }))}
              required
            >
              <option value="">— seleccionar —</option>
              {classTypes.map(ct => (
                <option key={ct.$id} value={ct.$id}>{ct.name_es}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>{t('classes.fields.instructor', 'Instructor')}</Label>
            <select
              className="w-full h-9 rounded-lg border border-sand bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage/30"
              value={form.instructor_id}
              onChange={(e) => setForm(f => ({ ...f, instructor_id: e.target.value }))}
              required
            >
              <option value="">— seleccionar —</option>
              {instructors.map(i => (
                <option key={i.$id} value={i.$id}>{i.full_name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>{t('classes.fields.difficulty', 'Dificultad')}</Label>
            <select
              className="w-full h-9 rounded-lg border border-sand bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage/30"
              value={form.difficulty}
              onChange={(e) => setForm(f => ({ ...f, difficulty: e.target.value }))}
            >
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
              <option value="all_levels">Todos los niveles</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label>{t('classes.fields.duration', 'Duración (min)')}</Label>
            <Input type="number" min="10" max="240" value={form.duration_min} onChange={(e) => setForm(f => ({ ...f, duration_min: Number(e.target.value) }))} />
          </div>
          <div className="space-y-1">
            <Label>{t('classes.fields.basePrice', 'Precio base')}</Label>
            <Input type="number" min="0" step="10" value={form.base_price} onChange={(e) => setForm(f => ({ ...f, base_price: Number(e.target.value) }))} />
          </div>
          <div className="flex items-center gap-3 pt-5">
            <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="accent-sage" />
              {t('classes.fields.featured', 'Destacada')}
            </label>
            <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
              <input type="checkbox" checked={form.enabled} onChange={(e) => setForm(f => ({ ...f, enabled: e.target.checked }))} className="accent-sage" />
              {t('common.enabled', 'Activa')}
            </label>
          </div>
        </div>
      </AdminFormDialog>
    </div>
  )
}
