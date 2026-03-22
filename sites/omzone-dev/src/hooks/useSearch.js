import { useQuery } from "@tanstack/react-query";
import { searchOfferings } from "@/services/appwrite/offeringService";

/**
 * useSearch — debounced offerings search.
 * @param {string} query - Search term (min 2 chars to trigger)
 * @param {object} options - { locale }
 */
export function useSearch(query, { locale = "es" } = {}) {
  const trimmed = query?.trim() ?? "";

  return useQuery({
    queryKey: ["search", trimmed, locale],
    queryFn: () => searchOfferings(trimmed, { locale }),
    enabled: trimmed.length >= 2,
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  });
}
