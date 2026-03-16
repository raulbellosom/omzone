/**
 * useMemberships — no hay colección de planes de membresía en Appwrite.
 * Los paquetes prepagados con créditos se gestionan en wellness_packages.
 * Estos hooks devuelven vacío para no romper páginas que los consumen.
 */
import { useQuery } from '@tanstack/react-query'

const empty = () => Promise.resolve([])
const emptyOne = () => Promise.resolve(null)

export function useMembershipPlans() {
  return useQuery({ queryKey: ['membershipPlans'], queryFn: empty })
}

export function useMembershipPlanBySlug() {
  return useQuery({ queryKey: ['membershipPlan', 'slug'], queryFn: emptyOne })
}

export function useMembershipPlanById() {
  return useQuery({ queryKey: ['membershipPlan', 'id'], queryFn: emptyOne })
}
