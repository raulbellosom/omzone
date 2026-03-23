/**
 * customerService.js - Appwrite data layer for customer area.
 *
 * Scope: orders, bookings, cancellation and checkout writes for offerings.
 */
import { Query, ID } from "appwrite";
import { databases, functions } from "./client";
import {
  APPWRITE_DATABASE_ID,
  COL_ORDERS,
  COL_ORDER_ITEMS,
  COL_BOOKINGS,
  COL_OFFERINGS,
  COL_OFFERING_SLOTS,
  COL_LOCATION_PROFILES,
  FN_ADMIN_WRITE_OFFERINGS,
} from "@/env";

const DB = APPWRITE_DATABASE_ID;

function parseJsonSafe(value) {
  if (!value) return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizeOrderItem(doc) {
  if (!doc) return null;
  return {
    $id: doc.$id,
    order_id: doc.orderId,
    item_type: doc.itemType,
    reference_id: doc.referenceId,
    title_snapshot: doc.titleSnapshot,
    quantity: doc.quantity ?? 1,
    unit_price: doc.unitPrice ?? 0,
    line_total: doc.lineTotal ?? 0,
  };
}

function normalizeOrder(doc, items) {
  if (!doc) return null;
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    order_no: doc.orderNo,
    client_user_id: doc.clientUserId,
    customer_email: doc.clientEmail,
    currency: doc.currency ?? "MXN",
    subtotal: doc.subtotal ?? 0,
    discount_total: doc.discountTotal ?? 0,
    tax_total: doc.taxTotal ?? 0,
    grand_total: doc.grandTotal ?? 0,
    payment_status: doc.paymentStatus ?? "pending",
    fulfillment_state: doc.fulfillmentState ?? "pending",
    promo_code: doc.promoCode,
    notes: doc.notes,
    paid_at: doc.paidAt,
    items: items ?? [],
  };
}

function normalizeOfferingForBooking(doc, locationProfile = null) {
  if (!doc) return null;
  const flowConfig = parseJsonSafe(doc.flowConfig) ?? {};
  return {
    $id: doc.$id,
    slug: doc.slug,
    title_es: doc.titleEs,
    title_en: doc.titleEn,
    category: doc.category,
    type: doc.type,
    currency: doc.currency ?? "MXN",
    flow_key: doc.flowKey ?? null,
    flow_config: flowConfig,
    terms_config: parseJsonSafe(doc.termsConfig),
    duration_min: flowConfig?.schedule?.duration_min ?? null,
    location_label: locationProfile?.name ?? locationProfile?.address ?? null,
    cover_image_id: doc.coverImageId ?? null,
    cover_image_bucket: doc.coverImageBucket ?? null,
  };
}

function normalizeSlotForBooking(doc, locationProfile = null) {
  if (!doc) return null;
  return {
    $id: doc.$id,
    start_at: doc.startAt,
    end_at: doc.endAt ?? null,
    location_profile_id: doc.locationProfileId ?? null,
    location_label: locationProfile?.name ?? locationProfile?.address ?? null,
    capacity_total: doc.capacityTotal ?? 0,
    capacity_taken: doc.capacityTaken ?? 0,
    status: doc.status ?? "open",
  };
}

function normalizeBooking(doc, { offeringDoc, slotDoc, slotLocation, defaultLocation } = {}) {
  if (!doc) return null;
  const offering = normalizeOfferingForBooking(offeringDoc, defaultLocation);
  const slot = normalizeSlotForBooking(slotDoc, slotLocation);

  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    client_user_id: doc.clientUserId,
    order_id: doc.orderId,
    booking_code: doc.bookingCode,
    status: doc.status ?? "confirmed",
    unit_price: doc.unitPrice ?? 0,
    quantity: doc.quantity ?? 1,
    offering_id: doc.offeringId ?? null,
    slot_id: doc.slotId ?? null,
    booking_type: doc.bookingType ?? null,
    guest_count: doc.guestCount ?? doc.quantity ?? 1,
    extras_json: parseJsonSafe(doc.extrasJson),
    request_data_json: parseJsonSafe(doc.requestDataJson),
    pricing_snapshot_json: parseJsonSafe(doc.pricingSnapshotJson),
    custom_answers_json: parseJsonSafe(doc.customAnswersJson),
    reserved_at: doc.reservedAt,
    confirmed_at: doc.confirmedAt ?? null,
    offering,
    slot,
  };
}

function padOrderNo(n) {
  return String(n).padStart(6, "0");
}

async function listByIds(collectionId, ids) {
  const unique = [...new Set((ids ?? []).filter(Boolean))];
  if (unique.length === 0) return [];
  const res = await databases.listDocuments(DB, collectionId, [
    Query.equal("$id", unique),
    Query.limit(unique.length),
  ]);
  return res.documents;
}

export async function getMyOrders(userId) {
  const ordersRes = await databases.listDocuments(DB, COL_ORDERS, [
    Query.equal("clientUserId", userId),
    Query.orderDesc("$createdAt"),
    Query.limit(50),
  ]);

  const orders = ordersRes.documents;
  if (orders.length === 0) return [];

  const orderIds = orders.map((o) => o.$id);
  const itemsRes = await databases.listDocuments(DB, COL_ORDER_ITEMS, [
    Query.equal("orderId", orderIds),
    Query.orderAsc("$createdAt"),
    Query.limit(500),
  ]);

  const itemsByOrder = {};
  for (const item of itemsRes.documents) {
    if (!itemsByOrder[item.orderId]) itemsByOrder[item.orderId] = [];
    itemsByOrder[item.orderId].push(normalizeOrderItem(item));
  }

  return orders.map((order) => normalizeOrder(order, itemsByOrder[order.$id] ?? []));
}

export async function getMyBookings(userId) {
  const res = await databases.listDocuments(DB, COL_BOOKINGS, [
    Query.equal("clientUserId", userId),
    Query.orderDesc("$createdAt"),
    Query.limit(100),
  ]);

  const bookings = res.documents;
  if (bookings.length === 0) return [];

  const offeringIds = [...new Set(bookings.map((b) => b.offeringId).filter(Boolean))];
  const slotIds = [...new Set(bookings.map((b) => b.slotId).filter(Boolean))];

  const [offeringDocs, slotDocs] = await Promise.all([
    listByIds(COL_OFFERINGS, offeringIds),
    listByIds(COL_OFFERING_SLOTS, slotIds),
  ]);

  const offeringMap = Object.fromEntries(offeringDocs.map((d) => [d.$id, d]));
  const slotMap = Object.fromEntries(slotDocs.map((d) => [d.$id, d]));

  const locationIds = [
    ...new Set([
      ...offeringDocs.map((d) => d.defaultLocationProfileId),
      ...slotDocs.map((d) => d.locationProfileId),
    ].filter(Boolean)),
  ];

  const locationDocs = await listByIds(COL_LOCATION_PROFILES, locationIds);
  const locationMap = Object.fromEntries(locationDocs.map((d) => [d.$id, d]));

  return bookings.map((booking) => {
    const offeringDoc = offeringMap[booking.offeringId] ?? null;
    const slotDoc = slotMap[booking.slotId] ?? null;
    const slotLocation = slotDoc?.locationProfileId
      ? locationMap[slotDoc.locationProfileId] ?? null
      : null;
    const defaultLocation = offeringDoc?.defaultLocationProfileId
      ? locationMap[offeringDoc.defaultLocationProfileId] ?? null
      : null;

    return normalizeBooking(booking, {
      offeringDoc,
      slotDoc,
      slotLocation,
      defaultLocation,
    });
  });
}

export async function cancelBooking(bookingId) {
  const doc = await databases.updateDocument(DB, COL_BOOKINGS, bookingId, {
    status: "cancelled",
  });
  return normalizeBooking(doc);
}

/**
 * Create an order and order items for offerings checkout.
 */
export async function createOrder(data) {
  const orderId = ID.unique();
  const orderNo = padOrderNo(Math.floor(Math.random() * 999999) + 1);

  const order = await databases.createDocument(DB, COL_ORDERS, orderId, {
    orderNo,
    clientUserId: data.user_id ?? null,
    clientEmail: data.customer_email,
    currency: "MXN",
    subtotal: data.grand_total,
    discountTotal: 0,
    taxTotal: 0,
    grandTotal: data.grand_total,
    paymentStatus: "pending",
    fulfillmentState: "pending",
    promoCode: data.promo_code ?? null,
    notes: null,
    paidAt: null,
  });

  await Promise.all(
    (data.items ?? []).map((item) => {
      const quantity = Number(item.quantity ?? 1) || 1;
      const unitPrice = Number(item.price ?? 0) || 0;
      return databases.createDocument(DB, COL_ORDER_ITEMS, ID.unique(), {
        orderId,
        itemType: item.item_type ?? "offering",
        referenceId: item.id ?? null,
        titleSnapshot: item.title,
        quantity,
        unitPrice,
        lineTotal: unitPrice * quantity,
      });
    }),
  );

  return normalizeOrder(order, []);
}

export async function confirmOrder(orderId) {
  const doc = await databases.updateDocument(DB, COL_ORDERS, orderId, {
    paymentStatus: "paid",
    fulfillmentState: "confirmed",
    paidAt: new Date().toISOString(),
  });
  return normalizeOrder(doc, []);
}

export async function createOfferingBooking(data) {
  if (!FN_ADMIN_WRITE_OFFERINGS) {
    throw new Error("La Function admin-write-offerings no esta configurada en el entorno.");
  }

  const execution = await functions.createExecution(
    FN_ADMIN_WRITE_OFFERINGS,
    JSON.stringify({
      operation: "booking.create",
      payload: {
        offering_id: data.offering_id,
        slot_id: data.slot_id ?? null,
        order_id: data.order_id ?? null,
        booking_type: data.booking_type ?? null,
        guest_count: data.guest_count ?? 1,
        unit_price: data.unit_price ?? null,
        extras_json: data.extras_json ?? null,
        request_data: data.request_data ?? null,
        pricing_snapshot: data.pricing_snapshot ?? null,
        custom_answers: data.custom_answers ?? null,
      },
    }),
    false,
    "/",
    "POST",
    { "Content-Type": "application/json" },
  );

  let parsed = null;
  try {
    parsed = execution?.responseBody ? JSON.parse(execution.responseBody) : null;
  } catch {
    throw new Error("Respuesta invalida de admin-write-offerings.");
  }

  if (!parsed?.ok) {
    throw new Error(parsed?.message || "No se pudo crear la reserva.");
  }

  return parsed.data;
}
