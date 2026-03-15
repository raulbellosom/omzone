import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// ── Español ──────────────────────────────────────────────────────────────────
import esCommon from './locales/es/common.json'
import esLanding from './locales/es/landing.json'
import esClasses from './locales/es/classes.json'
import esBooking from './locales/es/booking.json'
import esCheckout from './locales/es/checkout.json'
import esMemberships from './locales/es/memberships.json'
import esPackages from './locales/es/packages.json'
import esWellness from './locales/es/wellness.json'
import esCustomer from './locales/es/customer.json'
import esAdmin from './locales/es/admin.json'
import esValidation from './locales/es/validation.json'

// ── English ───────────────────────────────────────────────────────────────────
import enCommon from './locales/en/common.json'
import enLanding from './locales/en/landing.json'
import enClasses from './locales/en/classes.json'
import enBooking from './locales/en/booking.json'
import enCheckout from './locales/en/checkout.json'
import enMemberships from './locales/en/memberships.json'
import enPackages from './locales/en/packages.json'
import enWellness from './locales/en/wellness.json'
import enCustomer from './locales/en/customer.json'
import enAdmin from './locales/en/admin.json'
import enValidation from './locales/en/validation.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        common: esCommon,
        landing: esLanding,
        classes: esClasses,
        booking: esBooking,
        checkout: esCheckout,
        memberships: esMemberships,
        packages: esPackages,
        wellness: esWellness,
        customer: esCustomer,
        admin: esAdmin,
        validation: esValidation,
      },
      en: {
        common: enCommon,
        landing: enLanding,
        classes: enClasses,
        booking: enBooking,
        checkout: enCheckout,
        memberships: enMemberships,
        packages: enPackages,
        wellness: enWellness,
        customer: enCustomer,
        admin: enAdmin,
        validation: enValidation,
      },
    },
    defaultNS: 'common',
    fallbackLng: 'es',
    supportedLngs: ['es', 'en'],
    detection: {
      order: ['localStorage'],      // solo localStorage; sin navigator → browser language nunca override ES
      cacheUserLanguage: true,
    },
    interpolation: {
      escapeValue: false, // React ya hace escaping
    },
  })

export default i18n
