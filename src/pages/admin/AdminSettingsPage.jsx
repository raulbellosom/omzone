/**
 * AdminSettingsPage — configuración del estudio.
 * Ruta: /app/settings
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import AdminPageHeader from '@/components/shared/AdminPageHeader'

const INITIAL = {
  studioName: 'Omzone Studio',
  address: 'Colonia Condesa, CDMX',
  phone: '+52 55 1234 5678',
  email: 'hola@omzone.mx',
  instagram: '@omzonestudio',
  website: 'https://omzone.mx',
  timezone: 'America/Mexico_City',
  currency: 'MXN',
  defaultLang: 'es',
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-charcoal-muted">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} type={type} className="text-sm" />
    </div>
  )
}

function SectionHeader({ title }) {
  return (
    <h3 className="font-semibold text-charcoal text-sm pb-3 mb-4 border-b border-warm-gray-dark/20">{title}</h3>
  )
}

function simulateSave() {
  return new Promise((resolve) => setTimeout(resolve, 800))
}

export default function AdminSettingsPage() {
  const { t } = useTranslation('admin')
  const [settings, setSettings] = useState(INITIAL)
  const [saving, setSaving] = useState(false)

  function set(key) {
    return (value) => setSettings((s) => ({ ...s, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    await simulateSave()
    setSaving(false)
    toast.success(t('settings.saved'))
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 animate-fade-in-up">
      <AdminPageHeader title={t('settings.title')} />

      <div className="space-y-6">
        {/* Studio info */}
        <Card>
          <CardContent className="p-6">
            <SectionHeader title={t('settings.studio')} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label={t('settings.fields.studioName')} value={settings.studioName} onChange={set('studioName')} />
              </div>
              <div className="sm:col-span-2">
                <Field label={t('settings.fields.address')} value={settings.address} onChange={set('address')} />
              </div>
              <Field label={t('settings.fields.phone')} value={settings.phone} onChange={set('phone')} type="tel" />
              <Field label={t('settings.fields.email')} value={settings.email} onChange={set('email')} type="email" />
            </div>
          </CardContent>
        </Card>

        {/* Social */}
        <Card>
          <CardContent className="p-6">
            <SectionHeader title={t('settings.branding')} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={t('settings.fields.instagram')} value={settings.instagram} onChange={set('instagram')} />
              <Field label={t('settings.fields.website')} value={settings.website} onChange={set('website')} type="url" />
            </div>
          </CardContent>
        </Card>

        {/* Localization */}
        <Card>
          <CardContent className="p-6">
            <SectionHeader title={t('settings.localization')} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label={t('settings.fields.timezone')} value={settings.timezone} onChange={set('timezone')} />
              <Field label={t('settings.fields.currency')} value={settings.currency} onChange={set('currency')} />
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-charcoal-muted">{t('settings.fields.defaultLang')}</Label>
                <select
                  value={settings.defaultLang}
                  onChange={(e) => set('defaultLang')(e.target.value)}
                  className="w-full text-sm rounded-xl border border-warm-gray-dark/40 bg-white px-3 py-2 h-10 focus:outline-none focus:ring-2 focus:ring-sage/30"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {saving ? t('settings.saving') : t('settings.save')}
          </Button>
        </div>
      </div>
    </div>
  )
}
