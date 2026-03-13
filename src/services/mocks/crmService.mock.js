/**
 * crmService.mock.js
 * Adapter para leads y clientes (CRM básico).
 */
import { delay } from './_delay'

const leads = [
  { $id: 'lead_001', full_name: 'Patricia Ramos', email: 'patricia@example.com', phone: '+52 55 1111 2222', interest_type: 'membership', notes: 'Interesada en plan ilimitado.', status: 'new', $createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { $id: 'lead_002', full_name: 'Roberto Juárez', email: 'roberto@example.com', phone: '+52 55 3333 4444', interest_type: 'class', notes: 'Quiere probar clase antes de suscribirse.', status: 'contacted', $createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { $id: 'lead_003', full_name: 'Daniela Cruz', email: 'daniela@example.com', phone: null, interest_type: 'package', notes: null, status: 'qualified', $createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { $id: 'lead_004', full_name: 'Miguel Torres', email: 'miguel@example.com', phone: '+52 55 5555 6666', interest_type: 'membership', notes: 'Viene referido de Valeria.', status: 'won', $createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
  { $id: 'lead_005', full_name: 'Laura Vega', email: 'laura@example.com', phone: null, interest_type: 'product', notes: null, status: 'lost', $createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
]

const customers = [
  { $id: 'user_customer_1', first_name: 'Valeria', last_name: 'Morales', email: 'valeria@example.com', phone: '+52 55 1234 5678', status: 'active', membership: 'plan_8', total_orders: 2, joined: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  { $id: 'user_customer_2', first_name: 'Carlos', last_name: 'Ramírez', email: 'carlos@example.com', phone: null, status: 'active', membership: 'pkg_yoga_nutrition', total_orders: 1, joined: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
  { $id: 'user_customer_3', first_name: 'Sofía', last_name: 'López', email: 'sofia@example.com', phone: '+52 55 7777 8888', status: 'active', membership: 'plan_unlimited', total_orders: 4, joined: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
  { $id: 'user_customer_4', first_name: 'Andrés', last_name: 'García', email: 'andres@example.com', phone: null, status: 'inactive', membership: null, total_orders: 1, joined: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() },
]

export async function getLeads({ status } = {}) {
  await delay()
  let result = [...leads]
  if (status) result = result.filter((l) => l.status === status)
  return result
}

export async function getCustomers({ hasActiveMembership } = {}) {
  await delay()
  let result = [...customers]
  if (hasActiveMembership === true) result = result.filter((c) => !!c.membership)
  if (hasActiveMembership === false) result = result.filter((c) => !c.membership)
  return result
}

export async function submitLead(data) {
  await delay(500)
  return { $id: `lead_${Date.now()}`, ...data, status: 'new', $createdAt: new Date().toISOString() }
}

export async function updateLeadStatus(leadId, status) {
  await delay(400)
  const lead = leads.find((l) => l.$id === leadId)
  if (!lead) throw new Error('Lead not found')
  lead.status = status
  return { ...lead }
}

export async function addLeadNote(leadId, note) {
  await delay(400)
  const lead = leads.find((l) => l.$id === leadId)
  if (!lead) throw new Error('Lead not found')
  lead.notes = note
  return { ...lead }
}
