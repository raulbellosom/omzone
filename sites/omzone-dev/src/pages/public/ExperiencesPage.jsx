import OfferingSectionsLayout from "@/features/offerings/OfferingSectionsLayout";

const EXPERIENCE_FILTER_TAGS = [
  "yoga",
  "meditation",
  "breathwork",
  "nature",
  "sound_healing",
  "spa_wellness",
  "beginner",
];

export default function ExperiencesPage() {
  return (
    <OfferingSectionsLayout
      category="experience"
      pageKey="experiences"
      heroVariant="light"
      filterTags={EXPERIENCE_FILTER_TAGS}
    />
  );
}
