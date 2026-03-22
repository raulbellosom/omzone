/**
 * useAdmin — hooks de datos para el panel administrativo.
 * Conectado directamente a Appwrite vía adminService.js.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as admin from "@/services/appwrite/adminService";
import {
  listStockImages,
  uploadStockImage,
  deleteStockImage,
} from "@/lib/media";

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function useAdminOverview() {
  return useQuery({
    queryKey: ["adminOverview"],
    queryFn: admin.getDashboardMetrics,
  });
}

// ── Classes ───────────────────────────────────────────────────────────────────

export function useAdminClasses() {
  return useQuery({
    queryKey: ["adminClasses"],
    queryFn: admin.listClasses,
  });
}

export function useToggleClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, enabled }) => admin.toggleClass(classId, enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminClasses"] }),
  });
}

export function useCreateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => admin.createClass(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminClasses"] }),
  });
}

export function useUpdateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, data }) => admin.updateClass(classId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminClasses"] }),
  });
}

export function useDeleteClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (classId) => admin.deleteClass(classId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminClasses"] }),
  });
}

// ── Instructors & Class Types ─────────────────────────────────────────────────

export function useAdminInstructors() {
  return useQuery({
    queryKey: ["adminInstructors"],
    queryFn: admin.listInstructors,
  });
}

export function useCreateInstructor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => admin.createInstructor(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminInstructors"] });
      qc.invalidateQueries({ queryKey: ["adminClasses"] });
    },
  });
}

export function useUpdateInstructor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ instructorId, data }) =>
      admin.updateInstructor(instructorId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminInstructors"] });
      qc.invalidateQueries({ queryKey: ["adminClasses"] });
    },
  });
}

export function useToggleInstructor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ instructorId, enabled }) =>
      admin.toggleInstructor(instructorId, enabled),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminInstructors"] });
      qc.invalidateQueries({ queryKey: ["adminClasses"] });
    },
  });
}

export function useDeleteInstructor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (instructorId) => admin.deleteInstructor(instructorId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminInstructors"] });
      qc.invalidateQueries({ queryKey: ["adminClasses"] });
    },
  });
}

export function useAdminClassTypes() {
  return useQuery({
    queryKey: ["adminClassTypes"],
    queryFn: admin.listClassTypes,
  });
}

export function useCreateClassType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => admin.createClassType(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminClassTypes"] });
      qc.invalidateQueries({ queryKey: ["adminClasses"] });
    },
  });
}

export function useUpdateClassType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classTypeId, data }) =>
      admin.updateClassType(classTypeId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminClassTypes"] });
      qc.invalidateQueries({ queryKey: ["adminClasses"] });
    },
  });
}

export function useToggleClassType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classTypeId, enabled }) =>
      admin.toggleClassType(classTypeId, enabled),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminClassTypes"] });
      qc.invalidateQueries({ queryKey: ["adminClasses"] });
    },
  });
}

export function useDeleteClassType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (classTypeId) => admin.deleteClassType(classTypeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminClassTypes"] });
      qc.invalidateQueries({ queryKey: ["adminClasses"] });
    },
  });
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export function useAdminSessions() {
  return useQuery({
    queryKey: ["adminSessions"],
    queryFn: () => admin.listSessions(),
  });
}

export function useCancelSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId) => admin.cancelSession(sessionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminSessions"] }),
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => admin.createSession(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminSessions"] }),
  });
}

export function useUpdateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, data }) => admin.updateSession(sessionId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminSessions"] }),
  });
}

export function useToggleSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, enabled }) =>
      admin.toggleSession(sessionId, enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminSessions"] }),
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId) => admin.deleteSession(sessionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminSessions"] }),
  });
}

// ── Packages ──────────────────────────────────────────────────────────────────

export function useAdminPackages() {
  return useQuery({
    queryKey: ["adminPackages"],
    queryFn: admin.listPackages,
  });
}

export function useTogglePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ packageId, enabled }) =>
      admin.togglePackage(packageId, enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminPackages"] }),
  });
}

export function useCreatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => admin.createPackage(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminPackages"] }),
  });
}

export function useUpdatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ packageId, data }) => admin.updatePackage(packageId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminPackages"] }),
  });
}

// ── Products (Wellness) ───────────────────────────────────────────────────────

export function useAdminProducts() {
  return useQuery({
    queryKey: ["adminProducts"],
    queryFn: admin.listProducts,
  });
}

export function useToggleProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, enabled }) =>
      admin.toggleProduct(productId, enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminProducts"] }),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => admin.createProduct(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminProducts"] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, data }) => admin.updateProduct(productId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminProducts"] }),
  });
}

// ── Customers ─────────────────────────────────────────────────────────────────

export function useAdminCustomers() {
  return useQuery({
    queryKey: ["adminCustomers"],
    queryFn: admin.listClients,
  });
}

// ── Leads ─────────────────────────────────────────────────────────────────────

export function useAdminLeads() {
  return useQuery({
    queryKey: ["adminLeads"],
    queryFn: () => admin.listLeads(),
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

// ── Orders ────────────────────────────────────────────────────────────────────

export function useAdminOrders() {
  return useQuery({
    queryKey: ["adminOrders"],
    queryFn: admin.listOrders,
  });
}

// ── Bookings ──────────────────────────────────────────────────────────────────

export function useAdminBookings() {
  return useQuery({
    queryKey: ["adminBookings"],
    queryFn: admin.listBookings,
  });
}

// ── Access Passes ─────────────────────────────────────────────────────────────

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

// ── App Settings ──────────────────────────────────────────────────────────────

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

// ── Offerings ─────────────────────────────────────────────────────────────────

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
    mutationFn: ({ offeringId, data }) =>
      admin.updateOffering(offeringId, data),
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

// ── Offering Slots ────────────────────────────────────────────────────────────

export function useAdminSlots(options = {}) {
  return useQuery({
    queryKey: ["adminSlots", options],
    queryFn: () => admin.listSlots(options),
  });
}

export function useCreateSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => admin.createSlot(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminSlots"] }),
  });
}

export function useUpdateSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slotId, data }) => admin.updateSlot(slotId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminSlots"] }),
  });
}

export function useToggleSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slotId, enabled }) => admin.toggleSlot(slotId, enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminSlots"] }),
  });
}

export function useCancelSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slotId) => admin.cancelSlot(slotId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminSlots"] }),
  });
}

export function useDeleteSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slotId) => admin.deleteSlot(slotId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminSlots"] }),
  });
}

// ── Availability Blocks ──────────────────────────────────────────────────────

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

// ── Content Sections ─────────────────────────────────────────────────────────

export function useAdminContentSections() {
  return useQuery({
    queryKey: ["adminContentSections"],
    queryFn: admin.listContentSections,
  });
}

export function useCreateContentSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => admin.createContentSection(data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["adminContentSections"] }),
  });
}

export function useUpdateContentSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, data }) =>
      admin.updateContentSection(sectionId, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["adminContentSections"] }),
  });
}

export function useToggleContentSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, enabled }) =>
      admin.toggleContentSection(sectionId, enabled),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["adminContentSections"] }),
  });
}

export function useDeleteContentSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sectionId) => admin.deleteContentSection(sectionId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["adminContentSections"] }),
  });
}

// ── Stock Images (root-only) ──────────────────────────────────────────────────

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
