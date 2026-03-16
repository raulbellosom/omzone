/**
 * customerService.js — Appwrite data layer para el área privada del cliente.
 *
 * Cubre: órdenes, reservas, cancelación de reservas, creación de órdenes.
 */
import { Query, ID } from 'appwrite'
import { databases } from './client'
import {
  APPWRITE_DATABASE_ID,
  COL_ORDERS,
  COL_ORDER_ITEMS,
  COL_BOOKINGS,
  COL_CLASS_SESSIONS,
  COL_CLASSES,
} from '@/env'

const DB = APPWRITE_DATABASE_ID

// ── Normalizers ───────────────────────────────────────────────────────────────

function normalizeOrderItem(doc) {
  if (!doc) return null
  return {
    $id: doc.$id,
    order_id: doc.orderId,
    item_type: doc.itemType,
    reference_id: doc.referenceId,
    title_snapshot: doc.titleSnapshot,
    quantity: doc.quantity ?? 1,
    unit_price: doc.unitPrice ?? 0,
    line_total: doc.lineTotal ?? 0,
  }
}

function normalizeOrder(doc, items) {
  if (!doc) return null
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    order_no: doc.orderNo,
    client_user_id: doc.clientUserId,
    customer_email: doc.clientEmail,
    currency: doc.currency ?? 'MXN',
    subtotal: doc.subtotal ?? 0,
    discount_total: doc.discountTotal ?? 0,
    tax_total: doc.taxTotal ?? 0,
    grand_total: doc.grandTotal ?? 0,
    payment_status: doc.paymentStatus ?? 'pending',
    fulfillment_state: doc.fulfillmentState ?? 'pending',
    promo_code: doc.promoCode,
    notes: doc.notes,
    paid_at: doc.paidAt,
    items: items ?? [],
  }
}

function normalizeBooking(doc, sessionDoc, classDoc) {
  if (!doc) return null
  const session = sessionDoc
    ? {
        $id: sessionDoc.$id,
        session_date: sessionDoc.sessionDate,
        location_label: sessionDoc.locationLabel,
        class: classDoc
          ? {
              $id: classDoc.$id,
              title_es: classDoc.titleEs,
              title_en: classDoc.titleEn,
              cover_image_id: classDoc.coverImageId,
              duration_min: classDoc.durationMin,
              difficulty: classDoc.difficulty,
            }
          : null,
      }
    : null
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    client_user_id: doc.clientUserId,
    session_id: doc.sessionId,
    order_id: doc.orderId,
    booking_code: doc.bookingCode,
    status: doc.status ?? 'confirmed',
    unit_price: doc.unitPrice ?? 0,
    extras_json: doc.extrasJson ? _parseJson(doc.extrasJson) : null,
    reserved_at: doc.reservedAt,
    session,
  }
}

function _parseJson(str) {
  if (!str) return null
  try { return JSON.parse(str) } catch { return null }
}

function _padOrderNo(n) {
  return String(n).padStart(6, '0')
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function getMyOrders(userId) {
  const [ordersRes, itemsRes] = await Promise.all([
    databases.listDocuments(DB, COL_ORDERS, [
      Query.equal('clientUserId', userId),
      Query.orderDesc('$createdAt'),
      Query.limit(50),
    ]),
    databases.listDocuments(DB, COL_ORDER_ITEMS, [
      Query.orderAsc('$createdAt'),
      Query.limit(200),
    ]),
  ])

  const itemsByOrder = {}
  for (const item of itemsRes.documents) {
    if (!itemsByOrder[item.orderId]) itemsByOrder[item.orderId] = []
    itemsByOrder[item.orderId].push(normalizeOrderItem(item))
  }

  return ordersRes.documents.map(o =>
    normalizeOrder(o, itemsByOrder[o.$id] ?? [])
  )
}

// ── Bookings ──────────────────────────────────────────────────────────────────

export async function getMyBookings(userId) {
  const res = await databases.listDocuments(DB, COL_BOOKINGS, [
    Query.equal('clientUserId', userId),
    Query.orderDesc('$createdAt'),
    Query.limit(100),
  ])
  const bookings = res.documents

  // Batch-fetch sessions
  const sessionIds = [...new Set(bookings.map(b => b.sessionId).filter(Boolean))]
  let sessionMap = {}
  if (sessionIds.length > 0) {
    const sessRes = await databases.listDocuments(DB, COL_CLASS_SESSIONS, [
      Query.equal('$id', sessionIds),
      Query.limit(sessionIds.length),
    ])
    sessionMap = Object.fromEntries(sessRes.documents.map(s => [s.$id, s]))
  }

  // Batch-fetch classes
  const classIds = [
    ...new Set(Object.values(sessionMap).map(s => s.classId).filter(Boolean)),
  ]
  let classMap = {}
  if (classIds.length > 0) {
    const classRes = await databases.listDocuments(DB, COL_CLASSES, [
      Query.equal('$id', classIds),
      Query.limit(classIds.length),
    ])
    classMap = Object.fromEntries(classRes.documents.map(c => [c.$id, c]))
  }

  return bookings.map(b => {
    const session = sessionMap[b.sessionId] ?? null
    const classDoc = session ? (classMap[session.classId] ?? null) : null
    return normalizeBooking(b, session, classDoc)
  })
}

export async function cancelBooking(bookingId) {
  const doc = await databases.updateDocument(DB, COL_BOOKINGS, bookingId, {
    status: 'cancelled',
  })
  return normalizeBooking(doc, null, null)
}

// ── Checkout — Create Order ───────────────────────────────────────────────────

/**
 * Creates an order and its line items in Appwrite.
 * @param {Object} data
 * @param {Array}  data.items          — [{ id, title, price, ... }]
 * @param {string} data.customer_email
 * @param {number} data.grand_total
 * @param {string} data.intent         — 'booking' | 'package' | 'product'
 * @param {string} [data.user_id]
 * @param {string} [data.promo_code]
 */
export async function createOrder(data) {
  const orderId = ID.unique()
  const orderNo = _padOrderNo(Math.floor(Math.random() * 999999) + 1)

  const order = await databases.createDocument(DB, COL_ORDERS, orderId, {
    orderNo,
    clientUserId: data.user_id ?? null,
    clientEmail: data.customer_email,
    currency: 'MXN',
    subtotal: data.grand_total,
    discountTotal: 0,
    taxTotal: 0,
    grandTotal: data.grand_total,
    paymentStatus: 'pending',
    fulfillmentState: 'pending',
    promoCode: data.promo_code ?? null,
    notes: null,
    paidAt: null,
  })

  // Create order items
  await Promise.all(
    (data.items ?? []).map(item =>
      databases.createDocument(DB, COL_ORDER_ITEMS, ID.unique(), {
        orderId,
        itemType: data.intent ?? 'product',
        referenceId: item.id ?? null,
        titleSnapshot: item.title,
        quantity: 1,
        unitPrice: item.price,
        lineTotal: item.price,
      })
    )
  )

  return normalizeOrder(order, [])
}

/**
 * Marks an order as paid and confirmed.
 */
export async function confirmOrder(orderId) {
  const doc = await databases.updateDocument(DB, COL_ORDERS, orderId, {
    paymentStatus: 'paid',
    fulfillmentState: 'confirmed',
    paidAt: new Date().toISOString(),
  })
  return normalizeOrder(doc, [])
}
