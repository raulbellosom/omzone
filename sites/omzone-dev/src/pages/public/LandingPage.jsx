import PageMeta from '@/components/seo/PageMeta'
import StructuredData from '@/components/seo/StructuredData'
import HeroSection from '@/features/marketing/HeroSection'
import BenefitsSection from '@/features/marketing/BenefitsSection'
import FeaturedClassesSection from '@/features/marketing/FeaturedClassesSection'
import PackagesPreviewSection from '@/features/marketing/PackagesPreviewSection'
import WellnessPreviewSection from '@/features/marketing/WellnessPreviewSection'
import TestimonialsSection from '@/features/marketing/TestimonialsSection'
import StudioSection from '@/features/marketing/StudioSection'
import FaqSection from '@/features/marketing/FaqSection'
import CtaSection from '@/features/marketing/CtaSection'

const BASE_URL = import.meta.env.VITE_APP_BASE_URL ?? 'https://omzone.com'

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Omzone',
  description:
    'Plataforma de yoga y wellness kitchen. Clases, membresías y complementos de bienestar en un solo lugar.',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    availableLanguage: ['Spanish', 'English'],
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Omzone',
  url: BASE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${BASE_URL}/classes?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

export default function LandingPage() {
  return (
    <>
      <PageMeta
        title={null}
        description="Clases de yoga, membresías y complementos wellness en un solo lugar. Reserva tu clase, elige tu plan y transforma tu bienestar con Omzone."
        canonical={BASE_URL}
        locale="es"
      />
      <StructuredData data={organizationSchema} />
      <StructuredData data={websiteSchema} />

      <main>
        <HeroSection />
        <BenefitsSection />
        <StudioSection />
        <FeaturedClassesSection />
        <PackagesPreviewSection />
        <WellnessPreviewSection />
        <TestimonialsSection />
        <FaqSection />
        <CtaSection />
      </main>
    </>
  )
}
