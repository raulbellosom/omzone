import { useTranslation } from 'react-i18next'
import { Bell, Search, Menu } from 'lucide-react'
import { Input } from '@/components/ui/input'
import TopbarUserMenu from '@/components/shared/TopbarUserMenu'

export default function CustomerTopbar({ onMenuClick }) {
  const { t } = useTranslation('customer')

  return (
    <header className="h-16 bg-white border-b border-warm-gray-dark/60 flex items-center justify-between px-4 md:px-6 gap-4 shrink-0">
      {/* Hamburger — mobile only */}
      <button
        className="md:hidden p-2 -ml-1 rounded-lg hover:bg-warm-gray transition-colors text-charcoal-muted"
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5" />
      </button>

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
        </button>

        <div className="pl-2 border-l border-warm-gray-dark/60">
          <TopbarUserMenu context="client" />
        </div>
      </div>
    </header>
  )
}
