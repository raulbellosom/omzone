/**
 * AdminCustomersPage — tabla de clientes con búsqueda y filtro por estado.
 * Ruta: /app/customers
 */
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { Search, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { useAdminCustomers } from '@/hooks/useAdmin'
import AdminPageHeader from '@/components/shared/AdminPageHeader'

const TABS = ['all', 'active', 'inactive']

export default function AdminCustomersPage() {
  const { t, i18n } = useTranslation('admin')
  const dateFnsLocale = i18n.language === 'es' ? es : enUS
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')

  const { data: customers, isLoading } = useAdminCustomers()

  const filtered = useMemo(() => {
    if (!customers) return []
    let result = customers
    if (tab === 'active')   result = result.filter((c) => c.status === 'active' && c.membership)
    if (tab === 'inactive') result = result.filter((c) => c.status === 'inactive' || !c.membership)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((c) =>
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      )
    }
    return result
  }, [customers, tab, search])

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 animate-fade-in-up">
      <AdminPageHeader title={t('customers.title')} />

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-1 p-1 bg-white border border-warm-gray-dark/30 rounded-xl w-fit">
          {TABS.map((tabId) => (
            <button
              key={tabId}
              onClick={() => setTab(tabId)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === tabId ? 'bg-sage text-white' : 'text-charcoal-muted hover:text-charcoal'}`}
            >
              {tabId === 'all' ? t('customers.tabs.all') : tabId === 'active' ? t('customers.tabs.active') : t('customers.tabs.registered')}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-subtle" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('common.search')} className="pl-9" />
        </div>
      </div>

      {isLoading
        ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
        : filtered.length > 0
          ? (
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y divide-warm-gray-dark/20">
                  {filtered.map((c, idx) => (
                    <li
                      key={c.$id}
                      className="flex items-center justify-between px-5 py-3.5 gap-3 animate-fade-in-up"
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-sage-muted flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-sage">
                            {c.first_name[0]}{c.last_name[0]}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-charcoal truncate">{c.first_name} {c.last_name}</p>
                          <p className="text-xs text-charcoal-muted truncate">{c.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-charcoal-muted hidden sm:inline">
                          {t('customers.fields.joined')}: {format(new Date(c.joined), 'd MMM yyyy', { locale: dateFnsLocale })}
                        </span>
                        <Badge variant={c.membership ? 'sage' : 'outline'} className="text-[10px]">
                          {c.membership ? t('customers.fields.membership') : t('common.noData')}
                        </Badge>
                        <span className="text-xs text-charcoal-muted hidden md:inline">
                          {c.total_orders} {t('customers.fields.orders')}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
          : (
            <Card>
              <CardContent className="p-10 text-center">
                <Users className="w-8 h-8 text-charcoal-subtle mx-auto mb-3" />
                <p className="text-sm text-charcoal-muted">{t('common.noData')}</p>
              </CardContent>
            </Card>
          )
      }
    </div>
  )
}
