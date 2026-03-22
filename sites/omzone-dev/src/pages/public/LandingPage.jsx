import PageMeta from "@/components/seo/PageMeta";
import StructuredData from "@/components/seo/StructuredData";
import HeroSection from "@/features/marketing/HeroSection";
import FourPillarsSection from "@/features/marketing/FourPillarsSection";
import BenefitsSection from "@/features/marketing/BenefitsSection";
import FeaturedOfferingsSection from "@/features/marketing/FeaturedOfferingsSection";
import EditorialSection from "@/features/marketing/EditorialSection";
import StudioSection from "@/features/marketing/StudioSection";
import FaqSection from "@/features/marketing/FaqSection";
import ContactFormSection from "@/features/marketing/ContactFormSection";
import CtaSection from "@/features/marketing/CtaSection";
import { APP_BASE_URL } from "@/env";

const BASE_URL = APP_BASE_URL;

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Omzone",
  description:
    "Plataforma de bienestar integral. Sesiones, inmersiones, estancias y experiencias en un solo lugar.",
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    availableLanguage: ["Spanish", "English"],
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Omzone",
  url: BASE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${BASE_URL}/sessions?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function LandingPage() {
  return (
    <>
      <PageMeta
        title={null}
        description="Sesiones de yoga, inmersiones, estancias y experiencias de bienestar en un solo lugar. Reserva tu sesión y transforma tu bienestar con Omzone."
        canonical={BASE_URL}
        locale="es"
      />
      <StructuredData data={organizationSchema} />
      <StructuredData data={websiteSchema} />

      <main>
        <HeroSection />
        <FourPillarsSection />
        <StudioSection />
        <FeaturedOfferingsSection />
        <EditorialSection />
        <FaqSection />
        <BenefitsSection />
        <ContactFormSection />
        <CtaSection />
      </main>
    </>
  );
}
