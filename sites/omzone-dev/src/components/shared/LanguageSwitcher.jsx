/**
 * LanguageSwitcher — toggle button que muestra el idioma al que cambia.
 * Si estás en ES muestra "EN", si estás en EN muestra "ES".
 * Persiste en localStorage automáticamente vía i18next LanguageDetector.
 * i18n.changeLanguage() actualiza solo los componentes suscritos — no recarga la página.
 */
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export default function LanguageSwitcher({ className }) {
  const { i18n } = useTranslation()
  const current = (i18n.resolvedLanguage ?? i18n.language ?? 'es').slice(0, 2)
  const next = current === 'es' ? 'en' : 'es'
  const label = current === 'es' ? 'EN' : 'ES'

  return (
    <button
      onClick={() => i18n.changeLanguage(next)}
      className={cn(
        'px-2.5 py-1 rounded-full text-[11px] font-semibold leading-none',
        'bg-warm-gray text-charcoal-muted hover:bg-warm-gray-dark/60 hover:text-charcoal',
        'transition-colors duration-200 cursor-pointer select-none',
        className
      )}
      aria-label={`Cambiar idioma a ${label}`}
    >
      {label}
    </button>
  )
}
