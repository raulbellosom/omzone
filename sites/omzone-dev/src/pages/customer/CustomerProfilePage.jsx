/**
 * CustomerProfilePage — datos personales, contraseña y preferencias.
 * Ruta: /account/profile
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, UserCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
import { useAuth } from '@/hooks/useAuth.jsx'
import { useUpdateProfile } from '@/hooks/useCustomer'
import { cn } from '@/lib/utils'

function SectionCard({ title, children }) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="font-semibold text-charcoal mb-5">{title}</h2>
        {children}
      </CardContent>
    </Card>
  )
}

export default function CustomerProfilePage() {
  const { t } = useTranslation('customer')
  const { user } = useAuth()
  const { mutateAsync: updateProfile, isPending: saving } = useUpdateProfile()

  const [form, setForm] = useState({
    first_name: user?.first_name ?? '',
    last_name:  user?.last_name  ?? '',
    phone:      user?.phone      ?? '',
  })

  const [passForm, setPassForm] = useState({ current: '', next: '', confirm: '' })
  const [showPass, setShowPass] = useState({ current: false, next: false, confirm: false })
  const [savingPass, setSavingPass] = useState(false)
  const [passErrors, setPassErrors] = useState({})

  function setField(k, v) { setForm((p) => ({ ...p, [k]: v })) }
  function setPassField(k, v) {
    setPassForm((p) => ({ ...p, [k]: v }))
    if (passErrors[k]) setPassErrors((p) => ({ ...p, [k]: undefined }))
  }

  async function handleSaveProfile(e) {
    e.preventDefault()
    try {
      await updateProfile(form)
      toast.success(t('profile.saved'))
    } catch {
      toast.error(t('common:errors.generic'))
    }
  }

  async function handleSavePassword(e) {
    e.preventDefault()
    const errs = {}
    if (!passForm.current) errs.current = t('validation:required', { ns: 'validation' })
    if (!passForm.next || passForm.next.length < 8) errs.next = t('validation:minLength', { ns: 'validation', min: 8 })
    if (passForm.next !== passForm.confirm) errs.confirm = t('validation:passwordMatch', { ns: 'validation' })
    if (Object.keys(errs).length) { setPassErrors(errs); return }

    setSavingPass(true)
    await new Promise((r) => setTimeout(r, 800))
    setSavingPass(false)
    setPassForm({ current: '', next: '', confirm: '' })
    toast.success(t('profile.passwordSaved'))
  }

  const initials = [user?.first_name?.[0], user?.last_name?.[0]].filter(Boolean).join('')

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 animate-fade-in-up space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-14 h-14 rounded-full bg-sage-muted flex items-center justify-center shrink-0">
          {initials
            ? <span className="text-sage font-semibold text-lg select-none">{initials}</span>
            : <UserCircle className="w-7 h-7 text-sage" />
          }
        </div>
        <div>
          <h1 className="text-2xl font-display font-semibold text-charcoal">{t('profile.title')}</h1>
          <p className="text-sm text-charcoal-muted">{user?.email}</p>
        </div>
      </div>

      {/* Información personal */}
      <SectionCard title={t('profile.personalInfo')}>
        <form onSubmit={handleSaveProfile} noValidate className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="p-first">{t('profile.firstName')}</Label>
              <Input
                id="p-first"
                value={form.first_name}
                onChange={(e) => setField('first_name', e.target.value)}
                autoComplete="given-name"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="p-last">{t('profile.lastName')}</Label>
              <Input
                id="p-last"
                value={form.last_name}
                onChange={(e) => setField('last_name', e.target.value)}
                autoComplete="family-name"
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="p-email">{t('profile.email')}</Label>
            <Input
              id="p-email"
              type="email"
              value={user?.email ?? ''}
              readOnly
              disabled
              className="mt-1.5 opacity-60 cursor-not-allowed"
            />
            <p className="text-xs text-charcoal-subtle mt-1">{t('profile.emailNote')}</p>
          </div>

          <div>
            <Label htmlFor="p-phone">{t('profile.phone')}</Label>
            <Input
              id="p-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setField('phone', e.target.value)}
              autoComplete="tel"
              className="mt-1.5"
            />
          </div>

          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
            {saving ? t('profile.saving') : t('profile.save')}
          </Button>
        </form>
      </SectionCard>

      {/* Cambiar contraseña */}
      <SectionCard title={t('profile.changePassword')}>
        <form onSubmit={handleSavePassword} noValidate className="space-y-4">
          {[
            { key: 'current',  label: t('profile.currentPassword'), ac: 'current-password' },
            { key: 'next',     label: t('profile.newPassword'),     ac: 'new-password'     },
            { key: 'confirm',  label: t('profile.confirmPassword'), ac: 'new-password'     },
          ].map(({ key, label, ac }) => (
            <div key={key}>
              <Label htmlFor={`pp-${key}`}>{label}</Label>
              <div className="relative mt-1.5">
                <Input
                  id={`pp-${key}`}
                  type={showPass[key] ? 'text' : 'password'}
                  value={passForm[key]}
                  onChange={(e) => setPassField(key, e.target.value)}
                  autoComplete={ac}
                  className={cn('pr-11', passErrors[key] && 'border-red-400')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => ({ ...p, [key]: !p[key] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-subtle hover:text-charcoal transition-colors"
                  aria-label={showPass[key] ? 'Ocultar' : 'Mostrar'}
                >
                  {showPass[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passErrors[key] && (
                <p className="text-xs text-red-500 mt-1 animate-fade-in">{passErrors[key]}</p>
              )}
            </div>
          ))}

          <Button type="submit" variant="outline" disabled={savingPass} className="w-full sm:w-auto">
            {savingPass ? t('profile.passwordSaving') : t('profile.changePassword')}
          </Button>
        </form>
      </SectionCard>

      {/* Preferencias */}
      <SectionCard title={t('profile.preferences')}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-charcoal">{t('profile.language')}</p>
            <p className="text-xs text-charcoal-muted mt-0.5">
              {t('common:lang.switch')}
            </p>
          </div>
          <LanguageSwitcher />
        </div>
      </SectionCard>
    </div>
  )
}
