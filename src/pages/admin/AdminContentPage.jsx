/**
 * AdminContentPage — mock CMS: Hero, FAQs, Testimonios.
 * Ruta: /app/content
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Save, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import AdminPageHeader from '@/components/shared/AdminPageHeader'

function SectionCard({ title, children, onSave, saving }) {
  const [open, setOpen] = useState(true)
  return (
    <Card className="overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-cream/40 transition-colors"
        onClick={() => setOpen((p) => !p)}
      >
        <h3 className="font-semibold text-charcoal text-sm">{title}</h3>
        <ChevronDown className={`w-4 h-4 text-charcoal-subtle transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <CardContent className="px-6 pb-6 pt-0 border-t border-warm-gray-dark/20">
          <div className="space-y-4 mt-4">
            {children}
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={onSave} disabled={saving} size="sm" className="flex items-center gap-2">
              <Save className="w-3.5 h-3.5" />
              {saving ? '...' : 'Guardar'}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

function Field({ label, value, onChange, multiline = false }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-charcoal-muted">{label}</Label>
      {multiline
        ? <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="w-full text-sm rounded-xl border border-warm-gray-dark/40 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage/30 resize-none"
          />
        : <Input value={value} onChange={(e) => onChange(e.target.value)} className="text-sm" />
      }
    </div>
  )
}

const INITIAL_HERO = { headline_es: 'Tu práctica. Tu ritmo. Tu espacio.', headline_en: 'Your practice. Your rhythm. Your space.', subheadline_es: 'Clases de yoga premium en un espacio diseñado para transformarte.', subheadline_en: 'Premium yoga classes in a space designed to transform you.', cta_es: 'Reserva tu clase', cta_en: 'Book your class' }
const INITIAL_FAQS = [
  { question_es: '¿Necesito experiencia previa?', question_en: 'Do I need prior experience?', answer_es: 'No, tenemos clases para todos los niveles.', answer_en: 'No, we have classes for all levels.' },
  { question_es: '¿Qué debo traer?', question_en: 'What should I bring?', answer_es: 'Ropa cómoda y mat (si tienes). Nosotros tenemos disponibles.', answer_en: 'Comfortable clothes and a mat (if you have one). We have mats available.' },
]
const INITIAL_TESTIMONIALS = [
  { author: 'Valeria M.', role_es: 'Clienta frecuente', role_en: 'Regular customer', quote_es: 'Omzone cambió mi relación con el movimiento. Es más que yoga.', quote_en: 'Omzone changed my relationship with movement. It\'s more than yoga.' },
  { author: 'Carlos R.', role_es: 'Miembro ilimitado', role_en: 'Unlimited member', quote_es: 'El espacio, los instructores y la comunidad son únicos.', quote_en: 'The space, instructors and community are unique.' },
]

function simulateSave() {
  return new Promise((resolve) => setTimeout(resolve, 800))
}

export default function AdminContentPage() {
  const { t } = useTranslation('admin')
  const [hero, setHero] = useState(INITIAL_HERO)
  const [faqs] = useState(INITIAL_FAQS)
  const [testimonials] = useState(INITIAL_TESTIMONIALS)
  const [saving, setSaving] = useState(null)

  async function handleSave(section) {
    setSaving(section)
    await simulateSave()
    setSaving(null)
    toast.success(t('content.saved'))
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 animate-fade-in-up">
      <AdminPageHeader
        title={t('content.title')}
        subtitle={t('content.subtitle')}
      />
      <div className="space-y-4">
        {/* Hero */}
        <SectionCard title={t('content.hero')} onSave={() => handleSave('hero')} saving={saving === 'hero'}>
          <Field label={`${t('content.fields.headline')} (ES)`} value={hero.headline_es} onChange={(v) => setHero((h) => ({ ...h, headline_es: v }))} />
          <Field label={`${t('content.fields.headline')} (EN)`} value={hero.headline_en} onChange={(v) => setHero((h) => ({ ...h, headline_en: v }))} />
          <Field label={`${t('content.fields.subheadline')} (ES)`} value={hero.subheadline_es} onChange={(v) => setHero((h) => ({ ...h, subheadline_es: v }))} multiline />
          <Field label={`${t('content.fields.subheadline')} (EN)`} value={hero.subheadline_en} onChange={(v) => setHero((h) => ({ ...h, subheadline_en: v }))} multiline />
          <div className="grid grid-cols-2 gap-4">
            <Field label={`${t('content.fields.cta')} (ES)`} value={hero.cta_es} onChange={(v) => setHero((h) => ({ ...h, cta_es: v }))} />
            <Field label={`${t('content.fields.cta')} (EN)`} value={hero.cta_en} onChange={(v) => setHero((h) => ({ ...h, cta_en: v }))} />
          </div>
        </SectionCard>

        {/* FAQs */}
        <SectionCard title={t('content.faqs')} onSave={() => handleSave('faqs')} saving={saving === 'faqs'}>
          {faqs.map((faq, i) => (
            <div key={i} className="p-4 bg-cream/60 rounded-xl space-y-3">
              <p className="text-xs font-medium text-charcoal-muted">Pregunta {i + 1}</p>
              <Field label={`${t('content.fields.question')} (ES)`} value={faq.question_es} onChange={() => {}} />
              <Field label={`${t('content.fields.answer')} (ES)`} value={faq.answer_es} onChange={() => {}} multiline />
            </div>
          ))}
        </SectionCard>

        {/* Testimonials */}
        <SectionCard title={t('content.testimonials')} onSave={() => handleSave('testimonials')} saving={saving === 'testimonials'}>
          {testimonials.map((test, i) => (
            <div key={i} className="p-4 bg-cream/60 rounded-xl space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label={t('content.fields.author')} value={test.author} onChange={() => {}} />
                <Field label={`${t('content.fields.role')} (ES)`} value={test.role_es} onChange={() => {}} />
              </div>
              <Field label={`${t('content.fields.quote')} (ES)`} value={test.quote_es} onChange={() => {}} multiline />
            </div>
          ))}
        </SectionCard>
      </div>
    </div>
  )
}
