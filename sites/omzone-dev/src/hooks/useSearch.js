import { useQuery } from "@tanstack/react-query";
import { searchCatalog } from "@/services/appwrite/catalogService";

/**
 * useSearch — debounced catalog search across classes, products, packages.
 * @param {string} query - Search term (min 2 chars to trigger)
 * @param {object} options - { locale }
 */
export function useSearch(query, { locale = "es" } = {}) {
  const trimmed = query?.trim() ?? "";

  return useQuery({
    queryKey: ["search", trimmed, locale],
    queryFn: () => searchCatalog(trimmed, { locale }),
    enabled: trimmed.length >= 2,
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  });
}
