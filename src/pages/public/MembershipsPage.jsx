import { useTranslation } from 'react-i18next'
import PageMeta from '@/components/seo/PageMeta'
import StructuredData from '@/components/seo/StructuredData'
import PricingCard from '@/features/memberships/PricingCard'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { useMembershipPlans } from '@/hooks/useMemberships'
import { resolveField } from '@/lib/i18n-data'

const BASE_URL = import.meta.env.VITE_APP_BASE_URL ?? 'https://omzone.com'

export default function MembershipsPage() {
  const { t } = useTranslation('memberships')
  const { data: plans, isLoading } = useMembershipPlans()

  const faqItems = [
    t('faq.cancel', { returnObjects: true }),
    t('faq.pause',  { returnObjects: true }),
    t('faq.upgrade',{ returnObjects: true }),
  ]

  // Structured data — ItemList de ofertas
  const itemListSchema = plans
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Membresías y planes de yoga Omzone',
        itemListElement: plans.map((plan, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Offer',
            name: resolveField(plan, 'name'),
            description: resolveField(plan, 'description'),
            price: plan.price,
            priceCurrency: 'MXN',
            url: `${BASE_URL}/memberships`,
            availability: 'https://schema.org/InStock',
          },
        })),
      }
    : null

  return (
    <>
      <PageMeta
        title="Membresías y Planes de Yoga"
        description="Elige el plan de yoga perfecto para ti. Clases individuales, paquetes de 8 clases o yoga ilimitado mensual. Precios claros, sin sorpresas. Cancela cuando quieras."
        canonical={`${BASE_URL}/memberships`}
        locale="es"
      />
      {itemListSchema && <StructuredData data={itemListSchema} />}

      <main className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <header className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block text-xs uppercase tracking-widest font-medium text-sage bg-sage-muted px-3 py-1 rounded-full mb-4">
            {t('page.badge')}
          </span>
          <h1 className="font-display text-3xl md:text-5xl text-charcoal font-semibold mb-4 text-balance">
            {t('page.title')}
          </h1>
          <p className="text-charcoal-muted text-lg">{t('page.subtitle')}</p>
        </header>

        {/* Planes */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-96 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch mb-20">
            {plans?.map((plan) => (
              <PricingCard key={plan.$id} plan={plan} featured={plan.is_featured} />
            ))}
          </div>
        )}

        {/* Nota de confianza */}
        <div className="flex flex-wrap justify-center gap-8 py-10 border-y border-warm-gray-dark/50 mb-20">
          {(t('trust', { returnObjects: true }) ?? []).map(({ title, desc }) => (
            <div key={title} className="text-center max-w-[180px]">
              <p className="text-sm font-semibold text-charcoal mb-1">{title}</p>
              <p className="text-xs text-charcoal-muted">{desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ de membresías */}
        <section aria-labelledby="memberships-faq-heading" className="max-w-2xl mx-auto">
          <h2
            id="memberships-faq-heading"
            className="font-display text-2xl md:text-3xl text-charcoal font-semibold text-center mb-8"
          >
            {t('faq.title')}
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>
    </>
  )
}
