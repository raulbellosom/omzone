import OfferingListingLayout from "@/features/offerings/OfferingListingLayout";

export default function ServicesPage() {
  return (
    <OfferingListingLayout
      category="service"
      pageKey="services"
      cardLayout="split"
    />
  );
}
