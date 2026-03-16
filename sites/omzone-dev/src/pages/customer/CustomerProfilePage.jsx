/**
 * CustomerProfilePage — datos personales, contraseña y preferencias.
 * Ruta: /zone/profile
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, UserCircle, Camera } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth.jsx'
import { useUpdateProfile } from '@/hooks/useCustomer'
import { getAvatarUrl } from '@/services/appwrite/profileService'
import * as authService from '@/services/appwrite/authService'
import { cn } from '@/lib/utils'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

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
  const { t, i18n } = useTranslation('customer')
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
  const [sendingRecovery, setSendingRecovery] = useState(false)
  const [passErrors, setPassErrors] = useState({})
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  function setField(k, v) { setForm((p) => ({ ...p, [k]: v })) }
  function setPassField(k, v) {
    setPassForm((p) => ({ ...p, [k]: v }))
    if (passErrors[k]) setPassErrors((p) => ({ ...p, [k]: undefined }))
  }

  // ── Avatar ────────────────────────────────────────────────────────────────
  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(t('profile.avatarError'))
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error(t('profile.avatarError'))
      return
    }
    setUploadingAvatar(true)
    try {
      await updateProfile({ file })
      toast.success(t('profile.avatarSaved'))
    } catch {
      toast.error(t('common:errors.generic'))
    } finally {
      setUploadingAvatar(false)
      e.target.value = ''
    }
  }

  // ── Profile info ──────────────────────────────────────────────────────────
  async function handleSaveProfile(e) {
    e.preventDefault()
    try {
      await updateProfile(form)
      toast.success(t('profile.saved'))
    } catch {
      toast.error(t('common:errors.generic'))
    }
  }

  // ── Change password ───────────────────────────────────────────────────────
  async function handleSavePassword(e) {
    e.preventDefault()
    const errs = {}
    if (!passForm.current) errs.current = t('validation:required', { ns: 'validation' })
    if (!passForm.next || passForm.next.length < 8) errs.next = t('validation:minLength', { ns: 'validation', min: 8 })
    if (passForm.next !== passForm.confirm) errs.confirm = t('validation:passwordMatch', { ns: 'validation' })
    if (Object.keys(errs).length) { setPassErrors(errs); return }

    setSavingPass(true)
    try {
      await authService.updatePassword(passForm.next, passForm.current)
      setPassForm({ current: '', next: '', confirm: '' })
      toast.success(t('profile.passwordSaved'))
    } catch (err) {
      if (err?.code === 401) {
        setPassErrors({ current: t('profile.wrongPassword') })
      } else {
        toast.error(t('common:errors.generic'))
      }
    } finally {
      setSavingPass(false)
    }
  }

  async function handleForgotPassword() {
    setSendingRecovery(true)
    try {
      await authService.sendPasswordRecovery(user.email)
      toast.success(t('profile.recoverySent'))
    } catch {
      toast.error(t('common:errors.generic'))
    } finally {
      setSendingRecovery(false)
    }
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  const initials = [user?.first_name?.[0], user?.last_name?.[0]].filter(Boolean).join('')
  const avatarUrl = getAvatarUrl(user?.avatar_id, 128)

  const currentLang = (i18n.resolvedLanguage ?? i18n.language ?? 'es').slice(0, 2)
  const langName = currentLang === 'es' ? 'Español' : 'English'
  const nextLang = currentLang === 'es' ? 'en' : 'es'

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 animate-fade-in-up space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        {/* Avatar with upload overlay */}
        <label className={cn(
          'relative w-14 h-14 rounded-full cursor-pointer group shrink-0',
          uploadingAvatar && 'opacity-60 pointer-events-none'
        )}>
          {avatarUrl
            ? <img src={avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
            : (
              <div className="w-full h-full rounded-full bg-sage-muted flex items-center justify-center">
                {initials
                  ? <span className="text-sage font-semibold text-lg select-none">{initials}</span>
                  : <UserCircle className="w-7 h-7 text-sage" />}
              </div>
            )
          }
          {uploadingAvatar
            ? (
              <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )
            : (
              <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center
                              opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            )
          }
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="user"
            className="sr-only"
            onChange={handleAvatarChange}
          />
        </label>

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

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Button type="submit" variant="outline" disabled={savingPass} className="w-full sm:w-auto">
              {savingPass ? t('profile.passwordSaving') : t('profile.changePassword')}
            </Button>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={sendingRecovery}
              className="text-xs text-sage hover:underline disabled:opacity-50 transition-opacity"
            >
              {sendingRecovery ? t('profile.sendingRecovery') : t('profile.forgotPassword')}
            </button>
          </div>
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
          <Button variant="outline" size="sm" onClick={() => i18n.changeLanguage(nextLang)}>
            {langName}
          </Button>
        </div>
      </SectionCard>
    </div>
  )
}
