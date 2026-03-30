/**
 * useAdmin - admin data hooks.
 *
 * Legacy classes/wellness hooks were removed in the offerings-only cut.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as admin from "@/services/appwrite/adminService";
import {
  listStockImages,
  uploadStockImage,
  deleteStockImage,
} from "@/lib/media";

export function useAdminOverview() {
  return useQuery({
    queryKey: ["adminOverview"],
    queryFn: admin.getDashboardMetrics,
  });
}

export function useAdminCustomers() {
  return useQuery({
    queryKey: ["adminCustomers"],
    queryFn: admin.listClients,
  });
}

export function useAdminLeads() {
  return useQuery({
    queryKey: ["adminLeads"],
    queryFn: admin.listLeads,
  });
}

export function useUpdateLeadStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, status }) => admin.updateLeadStatus(leadId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminLeads"] }),
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => admin.createLead(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminLeads"] }),
  });
}

export function useAdminOrders() {
  return useQuery({
    queryKey: ["adminOrders"],
    queryFn: admin.listOrders,
  });
}

export function useAdminBookings() {
  return useQuery({
    queryKey: ["adminBookings"],
    queryFn: admin.listBookings,
  });
}

export function useAdminPasses({ clientUserId, status } = {}) {
  return useQuery({
    queryKey: ["adminPasses", clientUserId, status],
    queryFn: () => admin.listPasses({ clientUserId, status }),
  });
}

export function useCancelPass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (passId) => admin.cancelPass(passId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminPasses"] }),
  });
}

export function useAppSettings() {
  return useQuery({
    queryKey: ["appSettings"],
    queryFn: admin.getAppSettings,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpsertAppSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => admin.upsertAppSettings(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appSettings"] }),
  });
}

export function useAdminOfferings(options = {}) {
  return useQuery({
    queryKey: ["adminOfferings", options],
    queryFn: () => admin.listOfferings(options),
  });
}

export function useCreateOffering() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => admin.createOffering(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminOfferings"] }),
  });
}

export function useUpdateOffering() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ offeringId, data }) => admin.updateOffering(offeringId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminOfferings"] }),
  });
}

export function useToggleOffering() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ offeringId, enabled }) =>
      admin.toggleOffering(offeringId, enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminOfferings"] }),
  });
}

export function useDeleteOffering() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (offeringId) => admin.deleteOffering(offeringId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminOfferings"] }),
  });
}

export function useAdminSlots(options = {}) {
  return useQuery({
    queryKey: ["adminSlots", options],
    queryFn: () => admin.listSlots(options),
  });
}

export function useAdminEvents(options = {}) {
  return useQuery({
    queryKey: ["adminEvents", options],
    queryFn: () => admin.listEvents(options),
  });
}

export function useAdminLocationProfiles(options = {}) {
  return useQuery({
    queryKey: ["adminLocationProfiles", options],
    queryFn: () => admin.listLocationProfiles(options),
  });
}

export function useCreateLocationProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => admin.createLocationProfile(data),
    onSuccess: (location) => {
      qc.setQueriesData({ queryKey: ["adminLocationProfiles"] }, (prev) => {
        if (!Array.isArray(prev)) return prev;
        if (prev.some((item) => item.$id === location.$id)) return prev;
        return [...prev, location].sort((a, b) =>
          (a.name || "").localeCompare(b.name || ""),
        );
      });
      qc.invalidateQueries({ queryKey: ["adminLocationProfiles"] });
      qc.invalidateQueries({ queryKey: ["adminOfferings"] });
      qc.invalidateQueries({ queryKey: ["adminSlots"] });
      qc.invalidateQueries({ queryKey: ["adminEvents"] });
    },
  });
}

export function useUpdateLocationProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ locationProfileId, data }) =>
      admin.updateLocationProfile(locationProfileId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminLocationProfiles"] });
      qc.invalidateQueries({ queryKey: ["adminOfferings"] });
      qc.invalidateQueries({ queryKey: ["adminSlots"] });
      qc.invalidateQueries({ queryKey: ["adminEvents"] });
    },
  });
}

export function useDeleteLocationProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (locationProfileId) =>
      admin.deleteLocationProfile(locationProfileId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminLocationProfiles"] });
      qc.invalidateQueries({ queryKey: ["adminOfferings"] });
      qc.invalidateQueries({ queryKey: ["adminSlots"] });
      qc.invalidateQueries({ queryKey: ["adminEvents"] });
    },
  });
}

export function useCreateSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => admin.createSlot(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminSlots"] });
      qc.invalidateQueries({ queryKey: ["adminEvents"] });
    },
  });
}

export function useUpdateSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slotId, data }) => admin.updateSlot(slotId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminSlots"] });
      qc.invalidateQueries({ queryKey: ["adminEvents"] });
    },
  });
}

export function useToggleSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slotId, enabled }) => admin.toggleSlot(slotId, enabled),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminSlots"] });
      qc.invalidateQueries({ queryKey: ["adminEvents"] });
    },
  });
}

export function useCancelSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slotId) => admin.cancelSlot(slotId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminSlots"] });
      qc.invalidateQueries({ queryKey: ["adminEvents"] });
    },
  });
}

export function useDeleteSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slotId) => admin.deleteSlot(slotId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminSlots"] });
      qc.invalidateQueries({ queryKey: ["adminEvents"] });
    },
  });
}

export function useCreateEvent() {
  return useCreateSlot();
}

export function useUpdateEvent() {
  return useUpdateSlot();
}

export function useToggleEvent() {
  return useToggleSlot();
}

export function useCancelEvent() {
  return useCancelSlot();
}

export function useDeleteEvent() {
  return useDeleteSlot();
}

export function useAdminBlocks(options = {}) {
  return useQuery({
    queryKey: ["adminBlocks", options],
    queryFn: () => admin.listBlocks(options),
  });
}

export function useCreateBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => admin.createBlock(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminBlocks"] }),
  });
}

export function useUpdateBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ blockId, data }) => admin.updateBlock(blockId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminBlocks"] }),
  });
}

export function useDeleteBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (blockId) => admin.deleteBlock(blockId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminBlocks"] }),
  });
}

export function useAdminAvailabilityRules(options = {}) {
  return useQuery({
    queryKey: ["adminAvailabilityRules", options],
    queryFn: () => admin.listAvailabilityRules(options),
  });
}

export function useCreateAvailabilityRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => admin.createAvailabilityRule(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminAvailabilityRules"] }),
  });
}

export function useUpdateAvailabilityRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId, data }) => admin.updateAvailabilityRule(ruleId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminAvailabilityRules"] }),
  });
}

export function useDeleteAvailabilityRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ruleId) => admin.deleteAvailabilityRule(ruleId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminAvailabilityRules"] }),
  });
}

export function useAdminDailyInventory(options = {}) {
  return useQuery({
    queryKey: ["adminDailyInventory", options],
    queryFn: () => admin.listDailyInventory(options),
  });
}

export function useUpsertDailyInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => admin.upsertDailyInventory(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminDailyInventory"] }),
  });
}

export function useBulkUpsertDailyInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items) => admin.bulkUpsertDailyInventory(items),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminDailyInventory"] }),
  });
}

export function useMaterializeDailyInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => admin.materializeDailyInventory(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminDailyInventory"] }),
  });
}

export function useDeleteDailyInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inventoryId) => admin.deleteDailyInventory(inventoryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminDailyInventory"] }),
  });
}

export function useAdminContentSections(options = {}) {
  return useQuery({
    queryKey: ["adminContentSections", options],
    queryFn: () => admin.listContentSections(options),
  });
}

export function useCreateContentSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => admin.createContentSection(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminContentSections"] }),
  });
}

export function useUpdateContentSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, data }) => admin.updateContentSection(sectionId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminContentSections"] }),
  });
}

export function useToggleContentSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, enabled }) =>
      admin.toggleContentSection(sectionId, enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminContentSections"] }),
  });
}

export function useDeleteContentSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sectionId) => admin.deleteContentSection(sectionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminContentSections"] }),
  });
}

export function useStockImages() {
  return useQuery({
    queryKey: ["stockImages"],
    queryFn: listStockImages,
    staleTime: 1000 * 60 * 2,
  });
}

export function useUploadStockImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file) => uploadStockImage(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stockImages"] }),
  });
}

export function useDeleteStockImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fileId) => deleteStockImage(fileId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stockImages"] }),
  });
}
