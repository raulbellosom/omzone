/**
 * commerceService.mock.js
 * Adapter para órdenes, reservas y checkout.
 */
import { delay } from './_delay'

const orders = [
  {
    $id: 'order_001',
    order_no: 'OMZ-2024-001',
    customer_user_id: 'user_customer_1',
    customer_email: 'valeria@example.com',
    currency: 'MXN',
    subtotal: 990,
    discount_total: 0,
    tax_total: 0,
    grand_total: 990,
    payment_status: 'paid',
    fulfillment_state: 'confirmed',
    promo_code: null,
    notes: null,
    paid_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    $createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { $id: 'oi_001', item_type: 'membership', reference_id: 'plan_8', title_snapshot: '8 clases por mes', quantity: 1, unit_price: 990, line_total: 990 },
    ],
  },
  {
    $id: 'order_002',
    order_no: 'OMZ-2024-002',
    customer_user_id: 'user_customer_1',
    customer_email: 'valeria@example.com',
    currency: 'MXN',
    subtotal: 275,
    discount_total: 0,
    tax_total: 0,
    grand_total: 275,
    payment_status: 'paid',
    fulfillment_state: 'completed',
    promo_code: null,
    notes: null,
    paid_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    $createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { $id: 'oi_002', item_type: 'class_session', reference_id: 'sess_mf_1', title_snapshot: 'Morning Flow', quantity: 1, unit_price: 180, line_total: 180 },
      { $id: 'oi_003', item_type: 'product', reference_id: 'prod_smoothie_green', title_snapshot: 'Smoothie Green Balance', quantity: 1, unit_price: 95, line_total: 95 },
    ],
  },
  {
    $id: 'order_003',
    order_no: 'OMZ-2024-003',
    customer_user_id: 'user_customer_1',
    customer_email: 'valeria@example.com',
    currency: 'MXN',
    subtotal: 1690,
    discount_total: 0,
    tax_total: 0,
    grand_total: 1690,
    payment_status: 'paid',
    fulfillment_state: 'completed',
    promo_code: null,
    notes: null,
    paid_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    $createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { $id: 'oi_004', item_type: 'package', reference_id: 'pkg_bienestar_total', title_snapshot: 'Bienestar Total', quantity: 1, unit_price: 1690, line_total: 1690 },
    ],
  },
  {
    $id: 'order_004',
    order_no: 'OMZ-2024-004',
    customer_user_id: 'user_customer_1',
    customer_email: 'valeria@example.com',
    currency: 'MXN',
    subtotal: 95,
    discount_total: 0,
    tax_total: 0,
    grand_total: 95,
    payment_status: 'paid',
    fulfillment_state: 'completed',
    promo_code: null,
    notes: null,
    paid_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    $createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { $id: 'oi_005', item_type: 'product', reference_id: 'prod_smoothie_green', title_snapshot: 'Smoothie Green Balance', quantity: 1, unit_price: 95, line_total: 95 },
    ],
  },
  {
    $id: 'order_005',
    order_no: 'OMZ-2024-005',
    customer_user_id: 'user_customer_1',
    customer_email: 'valeria@example.com',
    currency: 'MXN',
    subtotal: 320,
    discount_total: 0,
    tax_total: 0,
    grand_total: 320,
    payment_status: 'pending',
    fulfillment_state: 'pending',
    promo_code: null,
    notes: null,
    paid_at: null,
    $createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    items: [
      { $id: 'oi_006', item_type: 'product', reference_id: 'prod_supplement_detox', title_snapshot: 'Suplemento Detox 30 días', quantity: 1, unit_price: 320, line_total: 320 },
    ],
  },
]

const bookings = [
  {
    $id: 'booking_001',
    customer_user_id: 'user_customer_1',
    session_id: 'sess_mf_1',
    order_id: 'order_002',
    booking_code: 'OMZ-BK-8841',
    status: 'confirmed',
    unit_price: 180,
    extras_json: [{ product_id: 'prod_smoothie_green', name: 'Smoothie Green Balance', price: 95 }],
    reserved_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    session: {
      $id: 'sess_mf_1',
      session_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      start_time: '07:30',
      class: { title_es: 'Morning Flow', title_en: 'Morning Flow', slug: 'morning-flow', duration_min: 60, instructor: { display_name: 'Sofía Reyes' } },
      location_label: 'Sala Principal',
    },
  },
  {
    $id: 'booking_002',
    customer_user_id: 'user_customer_1',
    session_id: 'sess_as_2',
    order_id: null,
    booking_code: 'OMZ-BK-7732',
    status: 'confirmed',
    unit_price: 220,
    extras_json: [],
    reserved_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    session: {
      $id: 'sess_as_2',
      session_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      start_time: '09:00',
      class: { title_es: 'Ashtanga Profundo', title_en: 'Deep Ashtanga', slug: 'ashtanga-profundo', duration_min: 75, instructor: { display_name: 'Marco Rivera' } },
      location_label: 'Sala Zen',
    },
  },
  {
    $id: 'booking_003',
    customer_user_id: 'user_customer_1',
    session_id: 'sess_pv_1',
    order_id: 'order_003',
    booking_code: 'OMZ-BK-6621',
    status: 'completed',
    unit_price: 250,
    extras_json: [{ product_id: 'prod_snack_bar', name: 'Energy Bar', price: 65 }],
    reserved_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    session: {
      $id: 'sess_pv_1',
      session_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      start_time: '18:00',
      class: { title_es: 'Power Vinyasa', title_en: 'Power Vinyasa', slug: 'power-vinyasa', duration_min: 60, instructor: { display_name: 'Ana Gutiérrez' } },
      location_label: 'Sala Principal',
    },
  },
  {
    $id: 'booking_004',
    customer_user_id: 'user_customer_1',
    session_id: 'sess_yy_1',
    order_id: null,
    booking_code: 'OMZ-BK-5510',
    status: 'completed',
    unit_price: 180,
    extras_json: [],
    reserved_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    session: {
      $id: 'sess_yy_1',
      session_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      start_time: '19:30',
      class: { title_es: 'Yin Yoga', title_en: 'Yin Yoga', slug: 'yin-yoga', duration_min: 75, instructor: { display_name: 'Sofía Reyes' } },
      location_label: 'Sala Zen',
    },
  },
  {
    $id: 'booking_005',
    customer_user_id: 'user_customer_1',
    session_id: 'sess_mm_1',
    order_id: null,
    booking_code: 'OMZ-BK-4401',
    status: 'cancelled',
    unit_price: 180,
    extras_json: [],
    reserved_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    session: {
      $id: 'sess_mm_1',
      session_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      start_time: '07:00',
      class: { title_es: 'Mindful Morning', title_en: 'Mindful Morning', slug: 'mindful-morning', duration_min: 45, instructor: { display_name: 'Marco Rivera' } },
      location_label: 'Jardín',
    },
  },
]

const activeMembership = {
  $id: 'memb_001',
  customer_user_id: 'user_customer_1',
  plan_id: 'plan_8',
  order_id: 'order_001',
  status: 'active',
  started_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  ends_at: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
  renewal_at: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
  classes_used: 3,
  classes_allowed: 8,
  is_unlimited: false,
  cancel_reason: null,
  plan: {
    name_es: '8 clases por mes',
    name_en: '8 classes per month',
    price: 990,
    slug: 'eight-classes',
    benefits_es: [
      '8 clases presenciales por mes',
      'Reserva anticipada 72 horas',
      '10% de descuento en Wellness Kitchen',
      'Asesoría nutricional inicial',
      'Acceso a clases online grabadas',
    ],
    benefits_en: [
      '8 in-person classes per month',
      '72-hour early booking access',
      '10% discount at Wellness Kitchen',
      'Initial nutritional consultation',
      'Access to recorded online classes',
    ],
  },
}

// ── API ───────────────────────────────────────────────────────────────────────

export async function getCustomerOrders(userId) {
  await delay()
  return orders.filter((o) => o.customer_user_id === userId)
}

export async function getCustomerBookings(userId) {
  await delay()
  return bookings.filter((b) => b.customer_user_id === userId)
}

export async function getCustomerActiveMembership(userId) {
  await delay()
  return activeMembership?.customer_user_id === userId ? activeMembership : null
}

export async function cancelBookingMock(bookingId) {
  await delay(600)
  const booking = bookings.find((b) => b.$id === bookingId)
  if (!booking) throw new Error('Booking not found')
  booking.status = 'cancelled'
  return { ...booking }
}

export async function createOrder(payload) {
  await delay(600)
  const orderNo = `OMZ-${Date.now()}`
  return {
    $id: `order_${Date.now()}`,
    order_no: orderNo,
    ...payload,
    payment_status: 'pending',
    fulfillment_state: 'pending',
    $createdAt: new Date().toISOString(),
  }
}

export async function confirmOrder(orderId) {
  await delay(800)
  return { orderId, status: 'paid', confirmedAt: new Date().toISOString() }
}

// ── Admin ─────────────────────────────────────────────────────────────────────

const adminOrders = [
  ...orders,
  {
    $id: 'order_admin_001',
    order_no: 'OMZ-2024-006',
    customer_user_id: 'user_customer_2',
    customer_email: 'carlos@example.com',
    currency: 'MXN',
    subtotal: 1690,
    discount_total: 0,
    tax_total: 0,
    grand_total: 1690,
    payment_status: 'paid',
    fulfillment_state: 'confirmed',
    promo_code: null,
    notes: null,
    paid_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    $createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { $id: 'oi_admin_001', item_type: 'package', reference_id: 'pkg_bienestar_total', title_snapshot: 'Bienestar Total', quantity: 1, unit_price: 1690, line_total: 1690 },
    ],
  },
]

export async function getAdminOrders() {
  await delay()
  return adminOrders
}

export async function getAdminDashboardMetrics() {
  await delay()
  return {
    salesToday: 3,
    bookingsToday: 5,
    newCustomers: 2,
    activeMemberships: 18,
    revenueMonth: 24350,
    revenueToday: 1870,
  }
}
