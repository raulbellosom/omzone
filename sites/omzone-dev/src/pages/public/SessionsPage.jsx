import OfferingListingLayout from "@/features/offerings/OfferingListingLayout";

export default function SessionsPage() {
  return (
    <OfferingListingLayout
      category="wellness_studio"
      pageKey="sessions"
      showYogaStyles
      cardLayout="split"
    />
  );
}
