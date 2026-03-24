/**
 * useOfferings — TanStack Query hooks for the unified offerings model.
 * Wraps offeringService.js public queries.
 */
import { useQuery } from "@tanstack/react-query";
import {
  getOfferings,
  getOfferingBySlug,
  getOfferingById,
  getOfferingSlots,
  getSlotById,
  getAllUpcomingSlots,
  getContentSections,
  searchOfferings,
} from "@/services/appwrite/offeringService";

export function useOfferings(options = {}) {
  const { category, type, enabled } = options;
  return useQuery({
    queryKey: ["offerings", category, type, enabled],
    queryFn: () => getOfferings(options),
    staleTime: 1000 * 60 * 2,
  });
}

export function useOfferingBySlug(slug) {
  return useQuery({
    queryKey: ["offering", slug],
    queryFn: () => getOfferingBySlug(slug),
    enabled: !!slug,
  });
}

export function useOfferingById(id) {
  return useQuery({
    queryKey: ["offering", id],
    queryFn: () => getOfferingById(id),
    enabled: !!id,
  });
}

export function useOfferingSlots(offeringId, options = {}) {
  const { fromDate, status, limit } = options;
  return useQuery({
    queryKey: ["offeringSlots", offeringId, fromDate, status, limit],
    queryFn: () => getOfferingSlots(offeringId, options),
    enabled: !!offeringId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useSlotById(slotId) {
  return useQuery({
    queryKey: ["slot", slotId],
    queryFn: () => getSlotById(slotId),
    enabled: !!slotId,
    retry: false, // Don't retry on 404 - fallback to offering lookup is expected
  });
}

export function useAllUpcomingSlots(options = {}) {
  const { category, limit } = options;
  return useQuery({
    queryKey: ["upcomingSlots", category, limit],
    queryFn: () => getAllUpcomingSlots(options),
    staleTime: 1000 * 60 * 2,
  });
}

export function useContentSections(options = {}) {
  return useQuery({
    queryKey: ["contentSections", options],
    queryFn: () => getContentSections(options),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSearchOfferings(term, { locale = "es" } = {}) {
  const trimmed = term?.trim() ?? "";
  return useQuery({
    queryKey: ["searchOfferings", trimmed, locale],
    queryFn: () => searchOfferings(trimmed, { locale }),
    enabled: trimmed.length >= 2,
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  });
}
