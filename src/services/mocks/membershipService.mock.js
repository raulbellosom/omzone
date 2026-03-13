/**
 * membershipService.mock.js
 * Adapter para planes de membresía.
 */
import { delay } from './_delay'

const membershipPlans = [
  {
    $id: 'plan_single',
    slug: 'single-class',
    name_es: 'Clase individual',
    name_en: 'Single class',
    description_es: 'Acceso a una clase de tu elección. Sin compromiso.',
    description_en: 'Access to one class of your choice. No commitment.',
    billing_period: 'monthly',
    price: 180,
    classes_per_cycle: 1,
    is_unlimited: false,
    includes_json: ['1 clase', 'Acceso al estudio', 'Ducha post-clase'],
    enabled: true,
    is_featured: false,
  },
  {
    $id: 'plan_4',
    slug: 'four-classes',
    name_es: '4 clases por mes',
    name_en: '4 classes per month',
    description_es: 'Para practicantes casuales que quieren constancia sin sobrecomprometerse.',
    description_en: 'For casual practitioners who want consistency without over-committing.',
    billing_period: 'monthly',
    price: 640,
    classes_per_cycle: 4,
    is_unlimited: false,
    includes_json: ['4 reservas mensuales', 'Acceso al estudio', 'Ducha post-clase'],
    enabled: true,
    is_featured: false,
  },
  {
    $id: 'plan_8',
    slug: 'eight-classes',
    name_es: '8 clases por mes',
    name_en: '8 classes per month',
    description_es: 'Ideal para práctica constante: 2 clases por semana a un precio justo.',
    description_en: 'Ideal for consistent practice: 2 classes per week at a fair price.',
    billing_period: 'monthly',
    price: 990,
    classes_per_cycle: 8,
    is_unlimited: false,
    includes_json: ['8 reservas mensuales', 'Acceso al estudio', 'Ducha post-clase', 'Descuento 10% en extras'],
    enabled: true,
    is_featured: true,
  },
  {
    $id: 'plan_unlimited',
    slug: 'monthly-unlimited',
    name_es: 'Yoga ilimitado mensual',
    name_en: 'Monthly unlimited yoga',
    description_es: 'La mejor experiencia Omzone. Sin límites, sin contar clases. Simplemente practica.',
    description_en: 'The best Omzone experience. No limits, no counting classes. Just practice.',
    billing_period: 'monthly',
    price: 1490,
    classes_per_cycle: null,
    is_unlimited: true,
    includes_json: [
      'Clases ilimitadas',
      'Reserva prioritaria',
      'Acceso al estudio',
      'Ducha post-clase',
      'Descuento 15% en extras',
      'Acceso a clases especiales',
    ],
    enabled: true,
    is_featured: true,
  },
]

export async function getMembershipPlans({ featuredOnly } = {}) {
  await delay()
  let result = membershipPlans.filter((p) => p.enabled)
  if (featuredOnly) result = result.filter((p) => p.is_featured)
  return result
}

export async function getMembershipPlanBySlug(slug) {
  await delay()
  const plan = membershipPlans.find((p) => p.slug === slug && p.enabled)
  if (!plan) throw new Error('Plan not found')
  return plan
}

export async function getMembershipPlanById(id) {
  await delay()
  const plan = membershipPlans.find((p) => p.$id === id && p.enabled)
  if (!plan) throw new Error('Plan not found')
  return plan
}

// ── API Admin ─────────────────────────────────────────────────────────────────

export async function adminGetAllPlans() {
  await delay()
  return membershipPlans
}

export async function adminTogglePlan(planId, enabled) {
  await delay(400)
  const plan = membershipPlans.find((p) => p.$id === planId)
  if (!plan) throw new Error('Plan not found')
  plan.enabled = enabled
  return { ...plan }
}

export async function adminToggleFeatured(planId, featured) {
  await delay(400)
  const plan = membershipPlans.find((p) => p.$id === planId)
  if (!plan) throw new Error('Plan not found')
  plan.is_featured = featured
  return { ...plan }
}
