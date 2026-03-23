/**
 * Offering Templates Registry
 *
 * Maps templateKey to React component for full-page offering layouts.
 * Each template receives: { offering, sections, t, locale }
 *
 * Note: templateKey attribute couldn't be added to offerings collection
 * due to Appwrite's attribute limit. We use category-based defaults instead.
 */
import ZenHeroTemplate from "./ZenHeroTemplate";
import SplitJourneyTemplate from "./SplitJourneyTemplate";
import NatureImmersiveTemplate from "./NatureImmersiveTemplate";

export const OFFERING_TEMPLATES = {
  "zen-hero": ZenHeroTemplate,
  "split-journey": SplitJourneyTemplate,
  "nature-immersive": NatureImmersiveTemplate,
};

/**
 * Default template mapping by category.
 * Used when offering doesn't have a template_key set.
 */
const CATEGORY_DEFAULT_TEMPLATES = {
  wellness_studio: "zen-hero", // Meditation, yoga sessions
  immersion: "split-journey", // Multi-day immersions
  stay: "nature-immersive", // Retreat stays
  service: "zen-hero", // Spa services
  experience: "split-journey", // Custom experiences
};

/**
 * Get the template component for an offering.
 * Uses template_key if set, otherwise falls back to category default.
 */
export function getOfferingTemplate(templateKey, category) {
  // If explicit templateKey provided, use it
  if (templateKey && OFFERING_TEMPLATES[templateKey]) {
    return OFFERING_TEMPLATES[templateKey];
  }

  // Otherwise, use category-based default
  const defaultKey = CATEGORY_DEFAULT_TEMPLATES[category] ?? "zen-hero";
  return OFFERING_TEMPLATES[defaultKey];
}

export { ZenHeroTemplate, SplitJourneyTemplate, NatureImmersiveTemplate };
