import { useQuery } from '@tanstack/react-query'
import {
  getMembershipPlans,
  getMembershipPlanBySlug,
  getMembershipPlanById,
} from '@/services/mocks/membershipService.mock'

export function useMembershipPlans(options = {}) {
  return useQuery({
    queryKey: ['membershipPlans', options],
    queryFn: () => getMembershipPlans(options),
  })
}

export function useMembershipPlanBySlug(slug) {
  return useQuery({
    queryKey: ['membershipPlan', slug],
    queryFn: () => getMembershipPlanBySlug(slug),
    enabled: !!slug,
  })
}

export function useMembershipPlanById(planId) {
  return useQuery({
    queryKey: ['membershipPlan', 'id', planId],
    queryFn: () => getMembershipPlanById(planId),
    enabled: !!planId,
  })
}
