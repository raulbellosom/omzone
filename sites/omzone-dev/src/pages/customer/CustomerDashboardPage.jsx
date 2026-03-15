/**
 * CustomerDashboardPage — resumen del área privada.
 * Ruta: /account
 */
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarCheck, ShoppingBag, Award, ArrowRight, BookOpen, Leaf, GlassWater } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth.jsx'
import { useMyBookings, useMyOrders, useMyMembership } from '@/hooks/useCustomer'
import { resolveField } from '@/lib/i18n-data'
import { formatMXN } from '@/lib/currency'
import ROUTES from '@/constants/routes'

function StatCard({ icon: Icon, label, value, loading, to }) {
  const inner = (
    <Card className="group overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover cursor-pointer">
      <CardContent className="p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-sage-muted flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-sage" />
        </div>
        <div className="min-w-0 flex-1">
          {loading
            ? <><Skeleton className="h-5 w-16 mb-1" /><Skeleton className="h-3.5 w-24" /></>
            : <>
                <p className="font-bold text-charcoal font-display leading-tight truncate">{value}</p>
                <p className="text-xs text-charcoal-muted mt-0.5">{label}</p>
              </>
          }
        </div>
        {to && <ArrowRight className="w-4 h-4 text-charcoal-subtle shrink-0 transition-transform group-hover:translate-x-0.5" />}
      </CardContent>
    </Card>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

export default function CustomerDashboardPage() {
  const { t, i18n } = useTranslation('customer')
  const { user } = useAuth()
  const dateFnsLocale = i18n.language === 'es' ? es : enUS

  const { data: bookings, isLoading: lBookings } = useMyBookings()
  const { data: orders,   isLoading: lOrders   } = useMyOrders()
  const { data: memb,     isLoading: lMemb     } = useMyMembership()

  const upcomingBookings = bookings?.filter((b) => b.status === 'confirmed') ?? []
  const nextBooking      = upcomingBookings[0] ?? null
  const recentOrders     = orders?.slice(0, 3) ?? []
  const daysLeft         = memb ? Math.max(0, differenceInDays(new Date(memb.ends_at), new Date())) : 0

  const membershipValue = memb
    ? (memb.is_unlimited
        ? t('dashboard.unlimited')
        : `${memb.classes_allowed - memb.classes_used} ${t('dashboard.of')} ${memb.classes_allowed}`)
    : t('dashboard.noMembership')

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-semibold text-charcoal">
          {t('dashboard.greeting', { name: user?.first_name ?? '' })}
        </h1>
        <p className="text-charcoal-muted mt-1">{t('dashboard.subtitle')}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={CalendarCheck}
          label={t('dashboard.nextClass')}
          value={nextBooking
            ? resolveField(nextBooking.session.class, 'title')
            : t('dashboard.noNextClass')}
          loading={lBookings}
          to={ROUTES.ACCOUNT_BOOKINGS}
        />
        <StatCard
          icon={Award}
          label={t('dashboard.classesUsed')}
          value={membershipValue}
          loading={lMemb}
          to={ROUTES.ACCOUNT_MEMBERSHIP}
        />
        <StatCard
          icon={ShoppingBag}
          label={t('dashboard.totalOrders')}
          value={orders?.length ?? '—'}
          loading={lOrders}
          to={ROUTES.ACCOUNT_ORDERS}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Próxima clase */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-charcoal">{t('dashboard.nextClass')}</h2>
            <Link to={ROUTES.ACCOUNT_BOOKINGS} className="text-xs text-sage hover:underline font-medium">
              {t('dashboard.viewAll')}
            </Link>
          </div>
          {lBookings
            ? <Skeleton className="h-40 rounded-2xl" />
            : nextBooking
              ? (
                <Card className="overflow-hidden">
                  <div className="h-1 bg-linear-to-r from-sage to-olive" aria-hidden="true" />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="font-semibold text-charcoal leading-tight">
                          {resolveField(nextBooking.session.class, 'title')}
                        </p>
                        <p className="text-sm text-charcoal-muted mt-0.5">
                          {nextBooking.session.class.instructor?.display_name}
                        </p>
                      </div>
                      <Badge variant="sage" className="shrink-0 text-[10px]">
                        {t('bookings.status.confirmed')}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-charcoal-muted mb-4">
                      <span>
                        {format(new Date(nextBooking.session.session_date), "EEEE d 'de' MMMM", { locale: dateFnsLocale })}
                        {' · '}{nextBooking.session.start_time}
                      </span>
                      <span>{nextBooking.session.location_label}</span>
                      <span>{nextBooking.session.class.duration_min} {t('bookings.min')}</span>
                    </div>
                    <p className="text-[10px] font-mono text-charcoal-subtle uppercase tracking-wider">
                      {t('dashboard.bookingCode')}: {nextBooking.booking_code}
                    </p>
                  </CardContent>
                </Card>
              )
              : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CalendarCheck className="w-8 h-8 text-charcoal-subtle mx-auto mb-3" />
                    <p className="text-sm text-charcoal-muted mb-4">{t('dashboard.noNextClass')}</p>
                    <Button size="sm" asChild>
                      <Link to={ROUTES.CLASSES}>{t('dashboard.bookOne')}</Link>
                    </Button>
                  </CardContent>
                </Card>
              )
          }
        </section>

        {/* Right column */}
        <div className="space-y-6">
          {/* Membresía mini */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-charcoal">{t('dashboard.activeMembership')}</h2>
              <Link to={ROUTES.ACCOUNT_MEMBERSHIP} className="text-xs text-sage hover:underline font-medium">
                {t('dashboard.viewAll')}
              </Link>
            </div>
            {lMemb
              ? <Skeleton className="h-28 rounded-2xl" />
              : memb
                ? (
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-medium text-charcoal text-sm">
                          {resolveField(memb.plan, 'name')}
                        </p>
                        <Badge variant="sage" className="text-[10px]">{t('membership.active')}</Badge>
                      </div>
                      {!memb.is_unlimited && (
                        <>
                          <div className="w-full h-1.5 bg-warm-gray rounded-full overflow-hidden mb-1">
                            <div
                              className="h-full bg-sage rounded-full transition-[width] duration-700"
                              style={{ width: `${(memb.classes_used / memb.classes_allowed) * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-charcoal-muted">
                            {t('membership.usageOf', { used: memb.classes_used, total: memb.classes_allowed })}
                          </p>
                        </>
                      )}
                      <p className="text-xs text-charcoal-subtle mt-2">
                        {t('dashboard.renewsIn', { days: daysLeft })}
                      </p>
                    </CardContent>
                  </Card>
                )
                : (
                  <Card>
                    <CardContent className="p-5 flex items-center gap-4">
                      <Award className="w-6 h-6 text-charcoal-subtle shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-charcoal-muted mb-2">{t('dashboard.noMembership')}</p>
                        <Link to={ROUTES.PACKAGES} className="text-xs text-sage font-medium hover:underline">
                          {t('dashboard.explorePlans')}
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
            }
          </section>

          {/* Pedidos recientes */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-charcoal">{t('dashboard.recentOrders')}</h2>
              <Link to={ROUTES.ACCOUNT_ORDERS} className="text-xs text-sage hover:underline font-medium">
                {t('dashboard.viewAll')}
              </Link>
            </div>
            {lOrders
              ? <Skeleton className="h-32 rounded-2xl" />
              : recentOrders.length > 0
                ? (
                  <Card>
                    <CardContent className="p-0">
                      <ul className="divide-y divide-warm-gray-dark/30">
                        {recentOrders.map((order) => (
                          <li key={order.$id} className="flex items-center justify-between px-5 py-3.5 gap-3">
                            <div className="min-w-0">
                              <p className="text-[10px] font-mono text-charcoal-subtle">{order.order_no}</p>
                              <p className="text-sm text-charcoal font-medium truncate">
                                {order.items[0]?.title_snapshot}
                                {order.items.length > 1 && ` +${order.items.length - 1}`}
                              </p>
                            </div>
                            <span className="font-semibold text-charcoal text-sm shrink-0">
                              {formatMXN(order.grand_total)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
                : (
                  <Card>
                    <CardContent className="p-5 text-center">
                      <p className="text-sm text-charcoal-muted">{t('dashboard.noRecentOrders')}</p>
                    </CardContent>
                  </Card>
                )
            }
          </section>
        </div>
      </div>

      {/* Quick actions */}
      <section className="mt-8">
        <h2 className="font-semibold text-charcoal mb-4">{t('dashboard.quickActions')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: t('common:actions.bookClass'), to: ROUTES.CLASSES, icon: CalendarCheck },
            { label: t('common:actions.explorePlans'), to: ROUTES.PACKAGES, icon: Award },
            { label: 'Wellness Kitchen', to: ROUTES.WELLNESS, icon: Leaf },
          ].map(({ label, to, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 bg-white rounded-xl border border-warm-gray-dark/40 px-4 py-3.5 text-sm font-medium text-charcoal hover:border-sage/50 hover:bg-sage-muted/30 transition-colors duration-150"
            >
              <Icon className="w-4 h-4 text-sage shrink-0" />
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* Recomendación */}
      <section className="mt-8">
        <h2 className="font-semibold text-charcoal mb-4">{t('dashboard.recommendations')}</h2>
        <Link to={ROUTES.WELLNESS}>
          <Card className="group hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200 overflow-hidden">
            <div className="h-1 bg-linear-to-r from-olive-light to-sage-muted" aria-hidden="true" />
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-sage-muted to-olive-light flex items-center justify-center shrink-0">
                <GlassWater className="w-5 h-5 text-sage-darker" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-charcoal text-sm">Smoothie Green Balance</p>
                <p className="text-xs text-charcoal-muted mt-0.5">El complemento perfecto después de tus clases.</p>
              </div>
              <ArrowRight className="w-4 h-4 text-charcoal-subtle shrink-0 transition-transform group-hover:translate-x-0.5" />
            </CardContent>
          </Card>
        </Link>
      </section>
    </div>
  )
}
