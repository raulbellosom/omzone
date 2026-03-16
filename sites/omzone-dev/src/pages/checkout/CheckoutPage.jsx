/**
 * CheckoutPage — checkout unificado para booking, paquetes y productos.
 * Ruta: /checkout
 * Recibe via location.state:
 *   - Booking:  { intent:'booking', items, customerInfo, total }
 *   - Paquete:  { packageId }
 *   - Producto: { productId }
 */
import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShieldCheck, Lock, ArrowLeft, CreditCard, Headphones } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import PageMeta from '@/components/seo/PageMeta'
import { useWellnessPackageById, useWellnessProductById } from '@/hooks/useWellness'
import { createOrder, confirmOrder } from '@/services/appwrite/customerService'
import { useAuth } from '@/hooks/useAuth.jsx'
import { resolveField } from '@/lib/i18n-data'
import { formatMXN } from '@/lib/currency'
import ROUTES from '@/constants/routes'
import { cn } from '@/lib/utils'

function fmtCard(v) { return v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim() }
function fmtExp(v)  {
  const d = v.replace(/\D/g,'').slice(0,4)
  return d.length >= 3 ? `${d.slice(0,2)} / ${d.slice(2)}` : d
}

function validateForm(billing, card, tv) {
  const b = {}, c = {}
  if (!billing.firstName.trim()) b.firstName = tv('required')
  if (!billing.lastName.trim())  b.lastName  = tv('required')
  if (!billing.email.trim())     b.email     = tv('required')
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billing.email)) b.email = tv('email')
  if (!card.holder.trim())                          c.holder = tv('required')
  if (card.number.replace(/\s/g,'').length < 16)   c.number = tv('cardNumber')
  if (!/^\d{2} \/ \d{2}$/.test(card.expiry))       c.expiry = tv('expiry')
  if (card.cvv.length < 3)                          c.cvv    = tv('cvv')
  return (Object.keys(b).length || Object.keys(c).length) ? { b, c } : null
}

// ── Summary sidebar ───────────────────────────────────────────────────────────
function OrderSummary({ items, t, loading }) {
  if (loading) return <Skeleton className="h-52 w-full rounded-2xl" />
  const total = items.reduce((s, i) => s + i.price, 0)
  return (
    <aside className="lg:sticky lg:top-24 space-y-4">
      <Card className="overflow-hidden">
        <div className="h-1.5 bg-linear-to-r from-sage to-olive" aria-hidden="true" />
        <CardContent className="p-5">
          <h3 className="font-semibold text-charcoal mb-4">{t('orderSummary')}</h3>
          <ul className="space-y-3 pb-4 border-b border-warm-gray-dark/50">
            {items.map((item, i) => (
              <li key={i} className="flex items-start justify-between gap-3 text-sm">
                <div className="flex-1">
                  <p className="font-medium text-charcoal leading-tight">{item.title}</p>
                  {item.subtitle && <p className="text-xs text-charcoal-muted mt-0.5 line-clamp-2">{item.subtitle}</p>}
                </div>
                <span className="font-semibold text-charcoal shrink-0">{formatMXN(item.price)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center pt-4">
            <span className="font-bold text-charcoal">{t('total')}</span>
            <span className="text-xl font-bold text-sage font-display">{formatMXN(total)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2 px-1">
        {[
          [Lock,         t('trust.secure')  ],
          [ShieldCheck,  t('trust.privacy') ],
          [Headphones,   t('trust.support') ],
        ].map(([Icon, label]) => (
          <p key={label} className="flex items-center gap-2 text-xs text-charcoal-muted">
            <Icon className="w-4 h-4 text-sage shrink-0" />{label}
          </p>
        ))}
      </div>
    </aside>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t }    = useTranslation('checkout')
  const tv       = (k) => t(k, { ns: 'validation' })
  const { user } = useAuth()
  const state    = location.state ?? {}

  const intentType = state.items ? 'booking'
    : state.packageId ? 'package'
    : state.productId ? 'product'
    : null

  const { data: pkg,   isLoading: lPkg  }  = useWellnessPackageById(state.packageId)
  const { data: prod,  isLoading: lProd }  = useWellnessProductById(state.productId)
  const isLoadingData = lPkg || lProd

  const items = (() => {
    if (intentType === 'booking')    return state.items ?? []
    if (intentType === 'package' && pkg)
      return [{ id: pkg.$id, title: resolveField(pkg, 'name'), subtitle: resolveField(pkg, 'description'), price: pkg.price }]
    if (intentType === 'product' && prod)
      return [{ id: prod.$id, title: resolveField(prod, 'name'), subtitle: resolveField(prod, 'description'), price: prod.price }]
    return []
  })()

  const [billing, setBilling] = useState({
    firstName: state.customerInfo?.firstName ?? user?.first_name ?? '',
    lastName:  state.customerInfo?.lastName  ?? user?.last_name  ?? '',
    email:     state.customerInfo?.email     ?? user?.email      ?? '',
    phone:     state.customerInfo?.phone     ?? '',
  })
  const [card,       setCard]       = useState({ holder: '', number: '', expiry: '', cvv: '' })
  const [promoCode,  setPromoCode]  = useState('')
  const [promoState, setPromoState] = useState(null)
  const [errs,       setErrs]       = useState({ b: {}, c: {} })
  const [submitting, setSubmitting] = useState(false)

  function onBilling(k, v) {
    setBilling((p) => ({ ...p, [k]: v }))
    if (errs.b[k]) setErrs((p) => ({ ...p, b: { ...p.b, [k]: undefined } }))
  }
  function onCard(k, v) {
    setCard((p) => ({ ...p, [k]: v }))
    if (errs.c[k]) setErrs((p) => ({ ...p, c: { ...p.c, [k]: undefined } }))
  }

  function applyPromo() {
    setPromoState(promoCode.toUpperCase() === 'WELLNESS20' ? 'applied' : 'invalid')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const v = validateForm(billing, card, tv)
    if (v) { setErrs(v); return }
    setSubmitting(true)
    try {
      const total = items.reduce((s, i) => s + i.price, 0)
      const order = await createOrder({ items, customer_email: billing.email, grand_total: total, intent: intentType })
      await confirmOrder(order.$id)
      navigate(ROUTES.CHECKOUT_CONFIRMATION, {
        replace: true,
        state: { orderNo: order.order_no, email: billing.email, items, total, intentType },
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!intentType) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <span className="text-4xl" aria-hidden="true">🛒</span>
        <p className="text-charcoal-muted">No hay ningún pedido activo.</p>
        <Button asChild variant="outline"><Link to={ROUTES.CLASSES}>Explorar clases</Link></Button>
      </div>
    )
  }

  return (
    <>
      <PageMeta title={`${t('title')} — Omzone`} description="Completa tu compra de forma segura." noindex />
      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12 min-h-[calc(100vh-4rem)]">
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-charcoal transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> {t('common:actions.back')}
          </button>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-charcoal">{t('title')}</h1>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
            <div className="space-y-6">
              {/* Datos de facturación */}
              <section className="bg-white rounded-2xl border border-warm-gray-dark/40 p-6 shadow-card space-y-4">
                <h3 className="font-semibold text-charcoal">{t('billing.title')}</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { k: 'firstName', label: t('billing.firstName'), ac: 'given-name' },
                    { k: 'lastName',  label: t('billing.lastName'),  ac: 'family-name' },
                  ].map(({ k, label, ac }) => (
                    <div key={k}>
                      <Label htmlFor={`b-${k}`}>{label}</Label>
                      <Input id={`b-${k}`} value={billing[k]} onChange={(e) => onBilling(k, e.target.value)}
                        autoComplete={ac} className={cn('mt-1.5', errs.b[k] && 'border-red-400 focus:border-red-400')} />
                      {errs.b[k] && <p className="text-xs text-red-500 mt-1 animate-fade-in">{errs.b[k]}</p>}
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <Label htmlFor="b-email">{t('billing.email')}</Label>
                    <Input id="b-email" type="email" value={billing.email} onChange={(e) => onBilling('email', e.target.value)}
                      autoComplete="email" className={cn('mt-1.5', errs.b.email && 'border-red-400 focus:border-red-400')} />
                    {errs.b.email && <p className="text-xs text-red-500 mt-1 animate-fade-in">{errs.b.email}</p>}
                  </div>
                </div>
              </section>

              {/* Pago */}
              <section className="bg-white rounded-2xl border border-warm-gray-dark/40 p-6 shadow-card space-y-4">
                <h3 className="font-semibold text-charcoal flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-sage" aria-hidden="true" />
                  {t('payment.title')}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {['VISA','MC','AMEX'].map((n) => (
                    <span key={n} className="px-2 py-0.5 rounded border border-warm-gray-dark text-[10px] font-bold tracking-widest text-charcoal-subtle">{n}</span>
                  ))}
                  <span className="text-xs text-charcoal-subtle">{t('payment.methods')}</span>
                </div>
                {/* Titular */}
                <div>
                  <Label htmlFor="cc-holder">{t('payment.cardHolder')}</Label>
                  <Input id="cc-holder" value={card.holder} onChange={(e) => onCard('holder', e.target.value)}
                    autoComplete="cc-name" placeholder="Nombre Apellido"
                    className={cn('mt-1.5', errs.c.holder && 'border-red-400')} />
                  {errs.c.holder && <p className="text-xs text-red-500 mt-1">{errs.c.holder}</p>}
                </div>
                {/* Número */}
                <div>
                  <Label htmlFor="cc-num">{t('payment.cardNumber')}</Label>
                  <Input id="cc-num" value={card.number} onChange={(e) => onCard('number', fmtCard(e.target.value))}
                    autoComplete="cc-number" placeholder="1234 5678 9012 3456" inputMode="numeric"
                    className={cn('mt-1.5 font-mono tracking-wider', errs.c.number && 'border-red-400')} />
                  {errs.c.number && <p className="text-xs text-red-500 mt-1">{errs.c.number}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cc-exp">{t('payment.expiry')}</Label>
                    <Input id="cc-exp" value={card.expiry} onChange={(e) => onCard('expiry', fmtExp(e.target.value))}
                      autoComplete="cc-exp" placeholder="MM / AA" inputMode="numeric"
                      className={cn('mt-1.5 font-mono', errs.c.expiry && 'border-red-400')} />
                    {errs.c.expiry && <p className="text-xs text-red-500 mt-1">{errs.c.expiry}</p>}
                  </div>
                  <div>
                    <Label htmlFor="cc-cvv">{t('payment.cvv')}</Label>
                    <Input id="cc-cvv" type="password" value={card.cvv} onChange={(e) => onCard('cvv', e.target.value.replace(/\D/g,'').slice(0,4))}
                      autoComplete="cc-csc" placeholder="•••"
                      className={cn('mt-1.5 font-mono', errs.c.cvv && 'border-red-400')} />
                    {errs.c.cvv && <p className="text-xs text-red-500 mt-1">{errs.c.cvv}</p>}
                  </div>
                </div>
                <p className="text-xs text-charcoal-subtle flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-sage" aria-hidden="true" /> {t('payment.secure')}
                </p>
              </section>

              {/* Código promo */}
              <section className="bg-white rounded-2xl border border-warm-gray-dark/40 p-5 shadow-card">
                <p className="text-sm font-medium text-charcoal mb-3">{t('promoCode.label')}</p>
                <div className="flex gap-2">
                  <Input value={promoCode} onChange={(e) => { setPromoCode(e.target.value); setPromoState(null) }}
                    placeholder={t('promoCode.placeholder')} className="flex-1" disabled={promoState === 'applied'} />
                  <Button type="button" variant="outline" size="md" onClick={applyPromo}
                    disabled={!promoCode.trim() || promoState === 'applied'}>
                    {t('promoCode.apply')}
                  </Button>
                </div>
                {promoState === 'applied' && <p className="text-xs text-sage mt-2 animate-fade-in">{t('promoCode.applied')}</p>}
                {promoState === 'invalid' && <p className="text-xs text-red-500 mt-2 animate-fade-in">{t('promoCode.invalid')}</p>}
              </section>

              {/* Botón pagar */}
              <Button type="submit" size="xl" disabled={submitting || isLoadingData} className="w-full">
                {submitting ? t('processing') : t('submit')}
              </Button>
            </div>

            <OrderSummary items={items} t={t} loading={isLoadingData} />
          </div>
        </form>
      </main>
    </>
  )
}
