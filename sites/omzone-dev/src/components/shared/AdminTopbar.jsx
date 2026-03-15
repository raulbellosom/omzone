import { useTranslation } from 'react-i18next'
import { Bell, Search } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth.jsx'

export default function AdminTopbar() {
  const { t } = useTranslation('admin')
  const { user } = useAuth()

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
    : 'A'

  return (
    <header className="h-16 bg-white border-b border-warm-gray-dark/60 flex items-center justify-between px-4 md:px-6 gap-4 shrink-0">
      {/* Búsqueda */}
      <div className="relative w-full max-w-xs hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-subtle" />
        <Input
          className="pl-9 h-9 bg-warm-gray border-transparent focus:bg-white"
          placeholder={t('common.search')}
        />
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2 ml-auto">
        <button className="p-2 rounded-lg hover:bg-warm-gray transition-colors text-charcoal-muted relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sage" />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-warm-gray-dark/60">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-charcoal leading-tight">
              {user?.first_name ?? 'Admin'}
            </p>
            <p className="text-[10px] text-charcoal-subtle capitalize">{user?.role_key}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
