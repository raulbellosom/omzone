/**
 * BookingPage — wizard de reserva de clase (4 pasos).
 * Ruta: /booking/:sessionId
 * Recibe via location.state: { classId, extraIds }
 * Al finalizar, navega a /checkout con el estado de la reserva.
 */
import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, MapPin, Clock, Users, Check, ShoppingCart, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import StepIndicator from '@/components/shared/StepIndicator'
import PageMeta from '@/components/seo/PageMeta'
import { useSessionById, useSessionsByClass } from '@/hooks/useClasses'
import { useClassExtras } from '@/hooks/useWellness'
import { useAuth } from '@/hooks/useAuth.jsx'
import { resolveField } from '@/lib/i18n-data'
import { formatMXN } from '@/lib/currency'
import { formatDate, formatTime } from '@/lib/dates'
import ROUTES from '@/constants/routes'
import { cn } from '@/lib/utils'

// ── Utilidad de validación ────────────────────────────────────────────────────
function validateStep3(info, t) {
  const errs = {}
  if (!info.firstName.trim()) errs.firstName = t('required', { ns: 'validation' })
  if (!info.lastName.trim())  errs.lastName  = t('required', { ns: 'validation' })
  if (!info.email.trim())     errs.email     = t('required', { ns: 'validation' })
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) errs.email = t('email', { ns: 'validation' })
  return errs
}

// ── Resumen lateral ───────────────────────────────────────────────────────────
function BookingSidebar({ session, cls, selectedExtras, extraItems, t }) {
  if (!session || !cls) return null

  const basePrice   = session.price_override ?? cls.base_price ?? 0
  const extrasTotal = selectedExtras.reduce((sum, id) => {
    const extra = extraItems.find((e) => e.$id === id)
    return sum + (extra?.price ?? 0)
  }, 0)
  const total = basePrice + extrasTotal

  return (
    <aside className="lg:sticky lg:top-24">
      <Card className="overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-sage to-olive" aria-hidden="true" />
        <CardContent className="p-5">
          <h3 className="font-semibold text-charcoal mb-4">{t('summary.title')}</h3>

          {/* Clase */}
          <div className="space-y-2 text-sm pb-4 border-b border-warm-gray-dark/50">
            <div className="flex justify-between gap-2">
              <span className="text-charcoal-muted">{t('summary.class')}</span>
              <span className="font-medium text-charcoal text-right">{resolveField(cls, 'title')}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-charcoal-muted">{t('summary.session')}</span>
              <span className="text-charcoal text-right">
                {formatDate(session.session_date)}, {formatTime(session.session_date)}
              </span>
            </div>
            {session.location_label && (
              <div className="flex items-center gap-1 text-charcoal-subtle">
                <MapPin className="w-3 h-3 shrink-0" />
                {session.location_label}
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-charcoal-muted">{t('summary.subtotal')}</span>
              <span className="font-medium">{formatMXN(basePrice)}</span>
            </div>
          </div>

          {/* Extras */}
          {selectedExtras.length > 0 && (
            <div className="space-y-1.5 py-3 border-b border-warm-gray-dark/50 text-sm">
              <p className="text-xs text-charcoal-subtle uppercase tracking-wider mb-2">
                {t('summary.extras')}
              </p>
              {selectedExtras.map((id) => {
                const extra = extraItems.find((e) => e.$id === id)
                if (!extra) return null
                return (
                  <div key={id} className="flex justify-between gap-2">
                    <span className="text-charcoal-muted">{resolveField(extra, 'name')}</span>
                    <span className="font-medium">{formatMXN(extra.price)}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center pt-3">
            <span className="font-bold text-charcoal">{t('summary.total')}</span>
            <span className="text-xl font-bold text-sage font-display">{formatMXN(total)}</span>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-charcoal-subtle text-center mt-3 leading-relaxed">
        {t('detail.noFees', { ns: 'classes' })}
      </p>
    </aside>
  )
}

// ── Paso 1 — Confirmar sesión ─────────────────────────────────────────────────
function Step1({ session, cls, allSessions, selectedSession, onSelect, t }) {
  if (!session || !cls) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
      </div>
    )
  }

  const sessions = allSessions ?? [session]

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold text-charcoal font-display">{t('step1.title')}</h2>
        <p className="text-sm text-charcoal-muted mt-1">{t('step1.subtitle')}</p>
      </div>

      {/* Info de la clase */}
      <div className="flex items-center gap-3 p-3 bg-sage-muted/30 rounded-xl text-sm">
        <div className="w-10 h-10 rounded-xl bg-sage-muted flex items-center justify-center shrink-0">
          <Activity className="w-5 h-5 text-sage" aria-hidden="true" />
        </div>
        <div>
          <p className="font-semibold text-charcoal">{resolveField(cls, 'title')}</p>
          <p className="text-charcoal-muted text-xs">{resolveField(cls, 'summary')}</p>
        </div>
      </div>

      {/* Selector de sesiones */}
      <fieldset>
        <legend className="sr-only">{t('step1.title')}</legend>
        <div className="space-y-2">
          {sessions.map((s) => {
            const isFull     = s.status === 'full' || (s.capacity_total - s.capacity_taken) === 0
            const isSelected = selectedSession?.$id === s.$id
            const spots      = s.capacity_total - s.capacity_taken

            return (
              <button
                key={s.$id}
                type="button"
                disabled={isFull}
                onClick={() => onSelect(s)}
                aria-pressed={isSelected}
                className={cn(
                  'w-full text-left p-4 rounded-xl border transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage',
                  isFull
                    ? 'opacity-50 cursor-not-allowed bg-warm-gray border-warm-gray-dark'
                    : isSelected
                      ? 'border-sage bg-sage-muted/30 shadow-sm'
                      : 'border-warm-gray-dark hover:border-sage/50 hover:bg-warm-gray/50 bg-white'
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-charcoal">
                        {formatDate(s.session_date)}
                      </span>
                      <span className="text-sm text-charcoal-muted">·</span>
                      <span className="text-sm text-charcoal-muted">{formatTime(s.session_date)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-charcoal-subtle">
                      {s.location_label && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {s.location_label}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {cls.duration_min} min
                      </span>
                      {!isFull && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {spots} lugares
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isFull
                      ? <Badge variant="warm">Llena</Badge>
                      : isSelected
                        ? <div className="w-5 h-5 rounded-full bg-sage flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        : <div className="w-5 h-5 rounded-full border-2 border-warm-gray-dark" />
                    }
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </fieldset>
    </div>
  )
}

// ── Paso 2 — Extras ───────────────────────────────────────────────────────────
function Step2({ extras, selectedExtras, onToggle, t }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold text-charcoal font-display">{t('step2.title')}</h2>
        <p className="text-sm text-charcoal-muted mt-1">{t('step2.subtitle')}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {extras.map((extra) => {
          const isSelected = selectedExtras.includes(extra.$id)
          const name       = resolveField(extra, 'name')
          const desc       = resolveField(extra, 'description')

          return (
            <button
              key={extra.$id}
              type="button"
              onClick={() => onToggle(extra.$id)}
              aria-pressed={isSelected}
              className={cn(
                'text-left p-4 rounded-xl border transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage',
                isSelected
                  ? 'border-sage bg-sage-muted/30 shadow-sm'
                  : 'border-warm-gray-dark hover:border-sage/40 hover:bg-warm-gray/40 bg-white'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-charcoal">{name}</p>
                  <p className="text-xs text-charcoal-muted mt-0.5 line-clamp-2">{desc}</p>
                  <p className="text-sm font-bold text-sage mt-2">{formatMXN(extra.price)}</p>
                </div>
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all duration-200',
                  isSelected ? 'border-sage bg-sage' : 'border-warm-gray-dark'
                )}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {extras.length === 0 && (
        <p className="text-sm text-charcoal-muted text-center py-6">{t('step2.skip')}</p>
      )}
    </div>
  )
}

// ── Paso 3 — Datos del cliente ────────────────────────────────────────────────
function Step3({ customerInfo, onChange, errors, user, t }) {
  const fields = [
    { key: 'firstName', label: t('step3.firstName'), autoComplete: 'given-name',  type: 'text'  },
    { key: 'lastName',  label: t('step3.lastName'),  autoComplete: 'family-name', type: 'text'  },
    { key: 'email',     label: t('step3.email'),     autoComplete: 'email',       type: 'email' },
    { key: 'phone',     label: t('step3.phone'),     autoComplete: 'tel',         type: 'tel'   },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold text-charcoal font-display">{t('step3.title')}</h2>
        <p className="text-sm text-charcoal-muted mt-1">{t('step3.subtitle')}</p>
      </div>

      {!user && (
        <p className="text-sm text-charcoal-muted bg-warm-gray rounded-xl px-4 py-3">
          {t('step3.loginPrompt')}{' '}
          <Link to={ROUTES.LOGIN} className="text-sage font-medium hover:underline">
            {t('step3.loginLink')}
          </Link>
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {fields.map(({ key, label, autoComplete, type }) => (
          <div key={key} className={key === 'email' ? 'sm:col-span-2' : ''}>
            <Label htmlFor={key} className="mb-1.5">{label}</Label>
            <Input
              id={key}
              type={type}
              autoComplete={autoComplete}
              value={customerInfo[key]}
              onChange={(e) => onChange(key, e.target.value)}
              className={errors[key] ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}
            />
            {errors[key] && (
              <p className="text-xs text-red-500 mt-1 animate-fade-in">{errors[key]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Paso 4 — Revisión final ───────────────────────────────────────────────────
function Step4({ session, cls, selectedExtras, extraItems, customerInfo, onEdit, t }) {
  const basePrice   = session?.price_override ?? cls?.base_price ?? 0
  const extrasTotal = selectedExtras.reduce((sum, id) => {
    const extra = extraItems.find((e) => e.$id === id)
    return sum + (extra?.price ?? 0)
  }, 0)

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold text-charcoal font-display">{t('step4.title')}</h2>
        <p className="text-sm text-charcoal-muted mt-1">{t('step4.subtitle')}</p>
      </div>

      {/* Sesión */}
      <div className="bg-white rounded-xl border border-warm-gray-dark/50 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-charcoal-subtle uppercase tracking-wider">
            {t('summary.session')}
          </p>
          <button onClick={() => onEdit(1)} className="text-xs text-sage hover:underline">
            {t('step4.editSession')}
          </button>
        </div>
        <p className="font-semibold text-charcoal">{resolveField(cls, 'title')}</p>
        <p className="text-sm text-charcoal-muted mt-0.5">
          {formatDate(session.session_date)} · {formatTime(session.session_date)} · {session.location_label}
        </p>
        <p className="text-sm font-medium text-sage mt-1">{formatMXN(basePrice)}</p>
      </div>

      {/* Extras */}
      {selectedExtras.length > 0 && (
        <div className="bg-white rounded-xl border border-warm-gray-dark/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-charcoal-subtle uppercase tracking-wider">
              {t('summary.extras')}
            </p>
            <button onClick={() => onEdit(2)} className="text-xs text-sage hover:underline">
              {t('step4.editExtras')}
            </button>
          </div>
          <ul className="space-y-1">
            {selectedExtras.map((id) => {
              const extra = extraItems.find((e) => e.$id === id)
              if (!extra) return null
              return (
                <li key={id} className="flex justify-between text-sm text-charcoal">
                  <span>{resolveField(extra, 'name')}</span>
                  <span className="font-medium">{formatMXN(extra.price)}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Datos */}
      <div className="bg-white rounded-xl border border-warm-gray-dark/50 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-charcoal-subtle uppercase tracking-wider">
            {t('step3.title')}
          </p>
          <button onClick={() => onEdit(3)} className="text-xs text-sage hover:underline">
            {t('step4.editInfo')}
          </button>
        </div>
        <p className="text-sm text-charcoal">
          {customerInfo.firstName} {customerInfo.lastName}
        </p>
        <p className="text-sm text-charcoal-muted">{customerInfo.email}</p>
        {customerInfo.phone && (
          <p className="text-sm text-charcoal-muted">{customerInfo.phone}</p>
        )}
      </div>

      {/* Total final */}
      <div className="flex items-center justify-between px-1">
        <span className="font-bold text-charcoal">{t('summary.total')}</span>
        <span className="text-2xl font-bold text-sage font-display">
          {formatMXN(basePrice + extrasTotal)}
        </span>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function BookingPage() {
  const { sessionId } = useParams()
  const location      = useLocation()
  const navigate      = useNavigate()
  const { t }         = useTranslation('booking')
  const { user }      = useAuth()

  const initialExtraIds = location.state?.extraIds ?? []

  // Datos remotos
  const { data: sessionData, isLoading: loadingSession } = useSessionById(sessionId)
  const { data: allSessionsForClass = [] }              = useSessionsByClass(sessionData?.class_id)
  const { data: extraItems = [], isLoading: loadingExtras } = useClassExtras()

  // Estado del wizard
  const [step,             setStep]            = useState(1)
  const [selectedSession,  setSelectedSession]  = useState(null)
  const [selectedExtras,   setSelectedExtras]   = useState(initialExtraIds)
  const [customerInfo,     setCustomerInfo]     = useState({
    firstName: user?.first_name ?? '',
    lastName:  user?.last_name  ?? '',
    email:     user?.email      ?? '',
    phone:     '',
  })
  const [errors, setErrors] = useState({})

  // Pre-cargar sesión cuando llega del backend
  useEffect(() => {
    if (sessionData && !selectedSession) setSelectedSession(sessionData)
  }, [sessionData])

  // Pre-cargar datos de usuario si está logueado
  useEffect(() => {
    if (user) {
      setCustomerInfo((prev) => ({
        firstName: prev.firstName || user.first_name || '',
        lastName:  prev.lastName  || user.last_name  || '',
        email:     prev.email     || user.email      || '',
        phone:     prev.phone,
      }))
    }
  }, [user])

  const cls = selectedSession?.class ?? sessionData?.class ?? null

  const stepLabels = [
    t('steps.schedule'),
    t('steps.extras'),
    t('steps.info'),
    t('step4.title'),
  ]

  // Navigación entre pasos
  function goNext() {
    if (step === 1 && !selectedSession) return
    if (step === 3) {
      const errs = validateStep3(customerInfo, t)
      if (Object.keys(errs).length > 0) { setErrors(errs); return }
      setErrors({})
    }
    if (step < 4) { setStep(step + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); return }

    // Paso 4 → ir a checkout
    const basePrice   = selectedSession.price_override ?? cls.base_price ?? 0
    const extrasTotal = selectedExtras.reduce((sum, id) => {
      const extra = extraItems.find((e) => e.$id === id)
      return sum + (extra?.price ?? 0)
    }, 0)

    const items = [
      {
        type:  'class_session',
        id:    selectedSession.$id,
        title: resolveField(cls, 'title'),
        price: basePrice,
      },
      ...selectedExtras.map((id) => {
        const extra = extraItems.find((e) => e.$id === id)
        return {
          type:  'product',
          id,
          title: resolveField(extra, 'name'),
          price: extra?.price ?? 0,
        }
      }),
    ]

    navigate(ROUTES.CHECKOUT, {
      state: {
        intent:       'booking',
        sessionId:    selectedSession.$id,
        classId:      cls.$id,
        items,
        customerInfo,
        total:        basePrice + extrasTotal,
      },
    })
  }

  function goBack() {
    if (step > 1) { setStep(step - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }
    else navigate(-1)
  }

  function toggleExtra(id) {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function setField(key, value) {
    setCustomerInfo((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const isLoading = loadingSession || loadingExtras
  const canNext   = step === 1 ? !!selectedSession : true

  return (
    <>
      <PageMeta
        title={`${t('title')} — Omzone`}
        description="Reserva tu clase de yoga en Omzone. Elige horario, complementos y confirma tu reserva."
        noindex
      />

      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12 min-h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-charcoal transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common:actions.back')}
          </button>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-charcoal">
            {t('title')}
          </h1>
        </div>

        {/* StepIndicator */}
        <StepIndicator steps={stepLabels} current={step} className="mb-8 md:mb-12" />

        {isLoading ? (
          <div className="grid lg:grid-cols-[1fr_340px] gap-8">
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
            {/* Contenido del paso */}
            <div key={step}>
              {step === 1 && (
                <Step1
                  session={sessionData}
                  cls={cls}
                  allSessions={allSessionsForClass}
                  selectedSession={selectedSession}
                  onSelect={setSelectedSession}
                  t={t}
                />
              )}
              {step === 2 && (
                <Step2
                  extras={extraItems}
                  selectedExtras={selectedExtras}
                  onToggle={toggleExtra}
                  t={t}
                />
              )}
              {step === 3 && (
                <Step3
                  customerInfo={customerInfo}
                  onChange={setField}
                  errors={errors}
                  user={user}
                  t={t}
                />
              )}
              {step === 4 && (
                <Step4
                  session={selectedSession}
                  cls={cls}
                  selectedExtras={selectedExtras}
                  extraItems={extraItems}
                  customerInfo={customerInfo}
                  onEdit={(s) => setStep(s)}
                  t={t}
                />
              )}

              {/* Navegación */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-warm-gray-dark/50">
                <Button variant="ghost" onClick={goBack} className="gap-1.5">
                  <ArrowLeft className="w-4 h-4" />
                  {t('common:actions.back')}
                </Button>
                <Button
                  onClick={goNext}
                  disabled={!canNext}
                  className="gap-1.5 min-w-[160px]"
                  size="lg"
                >
                  {step === 4 ? t('step4.proceedToPayment') : t('common:actions.next')}
                  {step < 4 && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <BookingSidebar
              session={selectedSession ?? sessionData}
              cls={cls}
              selectedExtras={selectedExtras}
              extraItems={extraItems}
              t={t}
            />
          </div>
        )}
      </main>
    </>
  )
}
