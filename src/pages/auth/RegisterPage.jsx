/**
 * RegisterPage — formulario de registro (mock, no crea usuario real).
 * Ruta: /register
 * En producción: conectar con Appwrite Auth.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PageMeta from '@/components/seo/PageMeta'
import ROUTES from '@/constants/routes'
import { cn } from '@/lib/utils'

function validate(form, t) {
  const tv   = (k, p) => t(k, { ns: 'validation', ...p })
  const errs = {}
  if (!form.firstName.trim()) errs.firstName = tv('required')
  if (!form.lastName.trim())  errs.lastName  = tv('required')
  if (!form.email.trim())     errs.email     = tv('required')
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = tv('email')
  if (!form.password)                   errs.password = tv('required')
  else if (form.password.length < 8)    errs.password = tv('minLength', { min: 8 })
  if (form.confirm !== form.password)   errs.confirm  = tv('passwordMatch')
  return errs
}

export default function RegisterPage() {
  const { t } = useTranslation('common')

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirm: '', phone: '',
  })
  const [showPass,   setShowPass]   = useState(false)
  const [showConf,   setShowConf]   = useState(false)
  const [errors,     setErrors]     = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success,    setSuccess]    = useState(false)

  function setField(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(form, t)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 800))
    setSubmitting(false)
    setSuccess(true)
  }

  // Estado de éxito
  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sage-muted mb-6">
            <CheckCircle className="w-8 h-8 text-sage" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-display font-semibold text-charcoal mb-2">¡Cuenta creada!</h2>
          <p className="text-charcoal-muted mb-8">{t('auth.register.success')}</p>
          <Button asChild size="lg" className="w-full max-w-xs">
            <Link to={ROUTES.LOGIN}>{t('auth.register.signIn')}</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageMeta
        title={`${t('auth.register.title')} — Omzone`}
        description="Crea tu cuenta Omzone y empieza tu viaje wellness."
        noindex
      />

      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to={ROUTES.HOME}>
              <img src="/logo.png" alt="Omzone" className="h-10 w-auto object-contain mx-auto mb-4" />
            </Link>
            <h1 className="text-2xl font-display font-semibold text-charcoal">{t('auth.register.title')}</h1>
            <p className="text-sm text-charcoal-muted mt-1">{t('auth.register.subtitle')}</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-warm-gray-dark/40 shadow-card p-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Nombre + Apellido */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { k: 'firstName', label: t('auth.register.firstName'), ac: 'given-name' },
                  { k: 'lastName',  label: t('auth.register.lastName'),  ac: 'family-name' },
                ].map(({ k, label, ac }) => (
                  <div key={k}>
                    <Label htmlFor={k}>{label}</Label>
                    <Input id={k} value={form[k]} onChange={(e) => setField(k, e.target.value)}
                      autoComplete={ac} className={cn('mt-1.5', errors[k] && 'border-red-400')} />
                    {errors[k] && <p className="text-xs text-red-500 mt-1 animate-fade-in">{errors[k]}</p>}
                  </div>
                ))}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="reg-email">{t('auth.register.email')}</Label>
                <Input id="reg-email" type="email" value={form.email}
                  onChange={(e) => setField('email', e.target.value)} autoComplete="email"
                  className={cn('mt-1.5', errors.email && 'border-red-400')} />
                {errors.email && <p className="text-xs text-red-500 mt-1 animate-fade-in">{errors.email}</p>}
              </div>

              {/* Teléfono (opcional) */}
              <div>
                <Label htmlFor="reg-phone">{t('auth.register.phone')}</Label>
                <Input id="reg-phone" type="tel" value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)} autoComplete="tel"
                  className="mt-1.5" />
              </div>

              {/* Contraseña */}
              <div>
                <Label htmlFor="reg-pass">{t('auth.register.password')}</Label>
                <div className="relative mt-1.5">
                  <Input id="reg-pass" type={showPass ? 'text' : 'password'} value={form.password}
                    onChange={(e) => setField('password', e.target.value)} autoComplete="new-password"
                    className={cn('pr-11', errors.password && 'border-red-400')} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-subtle hover:text-charcoal transition-colors"
                    aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1 animate-fade-in">{errors.password}</p>}
              </div>

              {/* Confirmar */}
              <div>
                <Label htmlFor="reg-confirm">{t('auth.register.confirmPassword')}</Label>
                <div className="relative mt-1.5">
                  <Input id="reg-confirm" type={showConf ? 'text' : 'password'} value={form.confirm}
                    onChange={(e) => setField('confirm', e.target.value)} autoComplete="new-password"
                    className={cn('pr-11', errors.confirm && 'border-red-400')} />
                  <button type="button" onClick={() => setShowConf(!showConf)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-subtle hover:text-charcoal transition-colors"
                    aria-label={showConf ? 'Ocultar confirmación' : 'Mostrar confirmación'}>
                    {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirm && <p className="text-xs text-red-500 mt-1 animate-fade-in">{errors.confirm}</p>}
              </div>

              {/* Términos */}
              <p className="text-xs text-charcoal-subtle leading-relaxed">{t('auth.register.terms')}</p>

              <Button type="submit" size="lg" disabled={submitting} className="w-full mt-1">
                {submitting ? t('auth.register.submitting') : t('auth.register.submit')}
              </Button>
            </form>
          </div>

          {/* Login link */}
          <p className="text-sm text-center text-charcoal-muted mt-6">
            {t('auth.register.hasAccount')}{' '}
            <Link to={ROUTES.LOGIN} className="text-sage font-medium hover:underline">
              {t('auth.register.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
