import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Instagram, Youtube, Heart } from 'lucide-react'
import ROUTES from '@/constants/routes'

export default function Footer() {
  const { t } = useTranslation('common')
  const year = new Date().getFullYear()

  return (
    <footer className="bg-charcoal text-white/80 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Grid principal */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-white/10">
          {/* Marca */}
          <div className="col-span-2 md:col-span-1">
            <img src="/logo.png" alt="Omzone" className="h-8 w-auto object-contain brightness-0 invert mb-3" />
            <p className="text-sm text-white/60 leading-relaxed">{t('footer.tagline')}</p>
            <div className="flex gap-3 mt-4">
              <a href="#" aria-label="Instagram" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" aria-label="YouTube" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Plataforma */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">{t('footer.links.title')}</h3>
            <ul className="space-y-2 text-sm">
              {[
                [t('footer.links.classes'), ROUTES.CLASSES],
                [t('footer.links.packages'), ROUTES.PACKAGES],
                [t('footer.links.wellness'), ROUTES.WELLNESS],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mi cuenta */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">{t('footer.account.title')}</h3>
            <ul className="space-y-2 text-sm">
              {[
                [t('footer.account.dashboard'), ROUTES.ACCOUNT_DASHBOARD],
                [t('footer.account.bookings'), ROUTES.ACCOUNT_BOOKINGS],
                [t('footer.account.orders'), ROUTES.ACCOUNT_ORDERS],
                [t('footer.account.profile'), ROUTES.ACCOUNT_PROFILE],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">{t('footer.legal.title')}</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.legal.privacy')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.legal.terms')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.legal.cookies')}</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>{t('footer.copyright', { year })}</p>
          <p className="flex items-center gap-1">
            {t('footer.madeWith')} <Heart className="w-3 h-3 text-rose-400 fill-rose-400" aria-hidden="true" /> {t('footer.forWellness')}
          </p>
        </div>
      </div>
    </footer>
  )
}
