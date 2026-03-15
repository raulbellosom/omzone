/**
 * useAdmin — hooks de datos para el panel administrativo.
 * Todos usan TanStack Query v5 + mocks centralizados.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  adminGetAllClasses,
  adminToggleClass,
  adminGetAllSessions,
  adminCancelSession,
} from '@/services/mocks/catalogService.mock'
import {
  adminGetAllPlans,
  adminTogglePlan,
  adminToggleFeatured,
} from '@/services/mocks/membershipService.mock'
import {
  adminGetAllProducts,
  adminToggleProduct,
  adminGetAllPackages,
  adminTogglePackage,
} from '@/services/mocks/wellnessService.mock'
import {
  getLeads,
  getCustomers,
  updateLeadStatus,
  addLeadNote,
} from '@/services/mocks/crmService.mock'
import {
  getAdminOrders,
  getAdminDashboardMetrics,
  getCustomerBookings,
} from '@/services/mocks/commerceService.mock'

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function useAdminOverview() {
  return useQuery({
    queryKey: ['adminOverview'],
    queryFn: getAdminDashboardMetrics,
  })
}

// ── Classes ───────────────────────────────────────────────────────────────────

export function useAdminClasses() {
  return useQuery({
    queryKey: ['adminClasses'],
    queryFn: adminGetAllClasses,
  })
}

export function useToggleClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ classId, enabled }) => adminToggleClass(classId, enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminClasses'] }),
  })
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export function useAdminSessions() {
  return useQuery({
    queryKey: ['adminSessions'],
    queryFn: adminGetAllSessions,
  })
}

export function useCancelSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sessionId) => adminCancelSession(sessionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminSessions'] }),
  })
}

// ── Memberships ───────────────────────────────────────────────────────────────

export function useAdminMemberships() {
  return useQuery({
    queryKey: ['adminMemberships'],
    queryFn: adminGetAllPlans,
  })
}

export function useTogglePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ planId, enabled }) => adminTogglePlan(planId, enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminMemberships'] }),
  })
}

export function useTogglePlanFeatured() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ planId, featured }) => adminToggleFeatured(planId, featured),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminMemberships'] }),
  })
}

// ── Packages ──────────────────────────────────────────────────────────────────

export function useAdminPackages() {
  return useQuery({
    queryKey: ['adminPackages'],
    queryFn: adminGetAllPackages,
  })
}

export function useTogglePackage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ packageId, enabled }) => adminTogglePackage(packageId, enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminPackages'] }),
  })
}

// ── Products (Wellness) ───────────────────────────────────────────────────────

export function useAdminProducts() {
  return useQuery({
    queryKey: ['adminProducts'],
    queryFn: adminGetAllProducts,
  })
}

export function useToggleProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, enabled }) => adminToggleProduct(productId, enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminProducts'] }),
  })
}

// ── Customers ─────────────────────────────────────────────────────────────────

export function useAdminCustomers() {
  return useQuery({
    queryKey: ['adminCustomers'],
    queryFn: () => getCustomers(),
  })
}

// ── Leads ─────────────────────────────────────────────────────────────────────

export function useAdminLeads() {
  return useQuery({
    queryKey: ['adminLeads'],
    queryFn: () => getLeads(),
  })
}

export function useUpdateLeadStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ leadId, status }) => updateLeadStatus(leadId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminLeads'] }),
  })
}

export function useAddLeadNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ leadId, note }) => addLeadNote(leadId, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminLeads'] }),
  })
}

// ── Orders ────────────────────────────────────────────────────────────────────

export function useAdminOrders() {
  return useQuery({
    queryKey: ['adminOrders'],
    queryFn: getAdminOrders,
  })
}

// ── Bookings (admin view — all users) ─────────────────────────────────────────

export function useAdminBookings() {
  return useQuery({
    queryKey: ['adminBookings'],
    queryFn: () => getCustomerBookings('user_customer_1'),
  })
}
