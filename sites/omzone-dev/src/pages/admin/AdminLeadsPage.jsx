/**
 * AdminLeadsPage — lista de leads con inline status change y notas.
 * Ruta: /app/leads
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { ChevronDown, MessageSquare, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAdminLeads, useUpdateLeadStatus, useAddLeadNote, useCreateLead } from '@/hooks/useAdmin'
import AdminPageHeader from '@/components/shared/AdminPageHeader'
import AdminFormDialog from '@/components/admin/AdminFormDialog'

const EMPTY_LEAD = { full_name: '', email: '', phone: '', interest_type: 'class', notes: '' }

const STATUSES = ['new', 'contacted', 'qualified', 'won', 'lost']
const STATUS_BADGE = {
  new: 'default',
  contacted: 'outline',
  qualified: 'sage',
  won: 'sage',
  lost: 'destructive',
}

function LeadCard({ lead, t, dateFnsLocale }) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState(lead.notes ?? '')
  const [editingNote, setEditingNote] = useState(false)

  const updateStatus = useUpdateLeadStatus()
  const addNote = useAddLeadNote()

  function handleStatus(status) {
    updateStatus.mutate(
      { leadId: lead.$id, status },
      {
        onSuccess: () => toast.success(`Estado: ${t(`leads.status.${status}`)}`),
        onError: () => toast.error('Error al actualizar'),
      }
    )
  }

  function handleSaveNote() {
    addNote.mutate(
      { leadId: lead.$id, note },
      {
        onSuccess: () => { setEditingNote(false); toast.success('Nota guardada') },
        onError: () => toast.error('Error al guardar nota'),
      }
    )
  }

  return (
    <Card className="animate-fade-in-up">
      <CardContent className="p-0">
        {/* Header */}
        <button
          className="w-full flex items-center justify-between px-5 py-4 gap-3 hover:bg-cream/40 transition-colors text-left"
          onClick={() => setOpen((p) => !p)}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-sand flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-charcoal">{lead.full_name[0]}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-charcoal">{lead.full_name}</p>
              <p className="text-xs text-charcoal-muted truncate">{lead.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
              {t(`leads.interest.${lead.interest_type}`)}
            </Badge>
            <Badge variant={STATUS_BADGE[lead.status] ?? 'default'} className="text-[10px]">
              {t(`leads.status.${lead.status}`)}
            </Badge>
            <span className="text-xs text-charcoal-muted hidden md:inline">
              {format(new Date(lead.$createdAt), 'd MMM', { locale: dateFnsLocale })}
            </span>
            <ChevronDown className={`w-4 h-4 text-charcoal-subtle transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Expanded */}
        {open && (
          <div className="px-5 pb-5 pt-2 border-t border-warm-gray-dark/20 space-y-4">
            {/* Status selector */}
            <div>
              <p className="text-xs font-medium text-charcoal-muted mb-2">{t('leads.fields.status')}</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatus(s)}
                    disabled={lead.status === s || updateStatus.isPending}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                      lead.status === s
                        ? 'bg-sage text-white border-sage'
                        : 'border-warm-gray-dark/40 text-charcoal hover:border-sage/50'
                    } disabled:opacity-50`}
                  >
                    {t(`leads.status.${s}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-charcoal-muted flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> {t('leads.fields.notes')}
                </p>
                {!editingNote && (
                  <button className="text-xs text-sage hover:underline" onClick={() => setEditingNote(true)}>
                    {t('common.edit')}
                  </button>
                )}
              </div>
              {editingNote
                ? (
                  <div className="flex gap-2">
                    <Input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="flex-1 text-sm"
                      placeholder="Agregar nota..."
                    />
                    <Button size="sm" onClick={handleSaveNote} disabled={addNote.isPending} className="shrink-0">
                      {addNote.isPending ? '...' : t('common.save')}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingNote(false)} className="shrink-0">
                      {t('common.cancel')}
                    </Button>
                  </div>
                )
                : (
                  <p className="text-sm text-charcoal-muted italic">
                    {lead.notes ?? '—'}
                  </p>
                )
              }
            </div>

            {lead.phone && (
              <p className="text-xs text-charcoal-muted">{t('leads.fields.phone')}: {lead.phone}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function AdminLeadsPage() {
  const { t, i18n } = useTranslation('admin')
  const dateFnsLocale = i18n.language === 'es' ? es : enUS
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_LEAD)

  const { data: leads, isLoading } = useAdminLeads()
  const createLead = useCreateLead()

  function handleCreate() {
    createLead.mutate(form, {
      onSuccess: () => { setDialogOpen(false); setForm(EMPTY_LEAD); toast.success('Lead creado') },
      onError: () => toast.error('Error al crear lead'),
    })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 animate-fade-in-up">
      <AdminPageHeader
        title={t('leads.title')}
        subtitle={t('leads.subtitle')}
        action={
          <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-1.5">
            <Plus className="w-4 h-4" />
            {t('leads.newLead', 'Nuevo Lead')}
          </Button>
        }
      />
      {isLoading
        ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
        : leads?.length > 0
          ? (
            <div className="space-y-3">
              {leads.map((lead, idx) => (
                <div key={lead.$id} style={{ animationDelay: `${idx * 40}ms` }}>
                  <LeadCard lead={lead} t={t} dateFnsLocale={dateFnsLocale} />
                </div>
              ))}
            </div>
          )
          : (
            <Card>
              <CardContent className="p-10 text-center">
                <MessageSquare className="w-10 h-10 text-charcoal-subtle mx-auto mb-3" />
                <p className="text-sm text-charcoal-muted">{t('common.noData')}</p>
              </CardContent>
            </Card>
          )
      }

      <AdminFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={t('leads.newLead', 'Nuevo Lead')}
        onSubmit={handleCreate}
        isSubmitting={createLead.isPending}
      >
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>{t('leads.fields.name', 'Nombre completo')}</Label>
            <Input value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>{t('leads.fields.email', 'Email')}</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="space-y-1">
              <Label>{t('leads.fields.phone', 'Teléfono')}</Label>
              <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+52 55..." />
            </div>
          </div>
          <div className="space-y-1">
            <Label>{t('leads.fields.interestType', 'Interés')}</Label>
            <select
              className="w-full h-9 rounded-lg border border-sand bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage/30"
              value={form.interest_type}
              onChange={(e) => setForm(f => ({ ...f, interest_type: e.target.value }))}
            >
              <option value="class">{t('leads.interest.class', 'Clase')}</option>
              <option value="package">{t('leads.interest.package', 'Paquete')}</option>
              <option value="product">{t('leads.interest.product', 'Producto')}</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label>{t('leads.fields.notes', 'Notas')}</Label>
            <Input value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Comentarios opcionales..." />
          </div>
        </div>
      </AdminFormDialog>
    </div>
  )
}
