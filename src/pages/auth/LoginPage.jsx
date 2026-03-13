/**
 * LoginPage — formulario de inicio de sesión con mock auth.
 * Ruta: /login
 * Demo: valeria@example.com (cualquier contraseña)
 */
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PageMeta from '@/components/seo/PageMeta'
import { loginMock } from '@/services/mocks/userService.mock'
import { useAuth } from '@/hooks/useAuth.jsx'
import ROUTES from '@/constants/routes'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const { t }        = useTranslation('common')
  const { setUser }  = useAuth()
  const navigate     = useNavigate()
  const location     = useLocation()
  const from         = location.state?.from ?? ROUTES.ACCOUNT_DASHBOARD

  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [showPass,   setShowPass]   = useState(false)
  const [error,      setError]      = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return

    setError('')
    setSubmitting(true)
    try {
      const user = await loginMock(email.trim())
      setUser(user)
      navigate(from, { replace: true })
    } catch {
      setError(t('auth.login.error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageMeta
        title={`${t('auth.login.title')} — Omzone`}
        description="Inicia sesión en tu cuenta Omzone."
        noindex
      />

      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to={ROUTES.HOME}>
              <img src="/logo.png" alt="Omzone" className="h-10 w-auto object-contain mx-auto mb-4" />
            </Link>
            <h1 className="text-2xl font-display font-semibold text-charcoal">
              {t('auth.login.title')}
            </h1>
            <p className="text-sm text-charcoal-muted mt-1">{t('auth.login.subtitle')}</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-warm-gray-dark/40 shadow-card p-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Error global */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl animate-fade-in">
                  {error}
                </div>
              )}

              {/* Email */}
              <div>
                <Label htmlFor="email">{t('auth.login.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  autoComplete="email"
                  autoFocus
                  className="mt-1.5"
                  required
                />
              </div>

              {/* Contraseña */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="password">{t('auth.login.password')}</Label>
                  <button
                    type="button"
                    className="text-xs text-sage hover:underline"
                  >
                    {t('auth.login.forgotPassword')}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-subtle hover:text-charcoal transition-colors"
                    aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPass
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye     className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button type="submit" size="lg" disabled={submitting || !email.trim()} className="w-full">
                {submitting ? t('auth.login.submitting') : t('auth.login.submit')}
              </Button>
            </form>

            {/* Demo hint */}
            <p className="text-xs text-center text-charcoal-subtle mt-5 bg-warm-gray rounded-xl px-3 py-2">
              {t('auth.login.demoHint')}
            </p>
          </div>

          {/* Registro */}
          <p className="text-sm text-center text-charcoal-muted mt-6">
            {t('auth.login.noAccount')}{' '}
            <Link to={ROUTES.REGISTER} className="text-sage font-medium hover:underline">
              {t('auth.login.createAccount')}
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
