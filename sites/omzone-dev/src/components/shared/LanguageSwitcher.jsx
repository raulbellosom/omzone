/**
 * LanguageSwitcher — segmented control ES / EN
 * Persiste en localStorage automáticamente vía i18next LanguageDetector.
 */
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

const LANGS = [
  { code: 'es', short: 'ES' },
  { code: 'en', short: 'EN' },
]

export default function LanguageSwitcher({ className }) {
  const { i18n } = useTranslation()
  const current = (i18n.resolvedLanguage ?? i18n.language ?? 'es').slice(0, 2)

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 bg-warm-gray rounded-full p-0.5',
        className
      )}
      role="group"
      aria-label="Idioma / Language"
    >
      {LANGS.map(({ code, short }) => {
        const active = current === code
        return (
          <button
            key={code}
            onClick={() => { if (!active) i18n.changeLanguage(code) }}
            aria-pressed={active}
            className={cn(
              'px-2.5 py-1 rounded-full text-[11px] font-semibold leading-none',
              'transition-all duration-200 cursor-pointer select-none',
              active
                ? 'bg-white text-charcoal shadow-sm'
                : 'text-charcoal-muted hover:text-charcoal'
            )}
          >
            {short}
          </button>
        )
      })}
    </div>
  )
}
