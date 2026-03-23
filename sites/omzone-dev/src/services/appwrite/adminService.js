/**
 * adminService.js - Appwrite data layer for admin panel.
 *
 * Legacy classes/wellness flows were removed. This service now operates only on
 * active resources and the offerings model.
 */
import { Query, ID } from "appwrite";
import { databases, functions } from "./client";
import {
  APPWRITE_DATABASE_ID,
  COL_CONTACT_LEADS,
  COL_USERS_PROFILE,
  COL_ORDERS,
  COL_ORDER_ITEMS,
  COL_BOOKINGS,
  COL_ACCESS_PASSES,
  COL_APP_SETTINGS,
  COL_OFFERINGS,
  COL_OFFERING_SLOTS,
  COL_LOCATION_PROFILES,
  COL_AVAILABILITY_BLOCKS,
  COL_CONTENT_SECTIONS,
  FN_ADMIN_WRITE_OFFERINGS,
} from "@/env";
import { ensureOfferingFlow, offeringDerivedFields } from "@/lib/offering-flow";

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

function normalizeLead(doc) {
  if (!doc) return null;
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    full_name: doc.fullName,
    email: doc.email,
    phone: doc.phone,
    subject: doc.subject ?? "",
    message: doc.message,
    status: doc.status ?? "new",
  };
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

function normalizeOrder(doc, items = []) {
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
    items,
  };
}

function normalizePass(doc) {
  if (!doc) return null;
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    client_user_id: doc.clientUserId,
    pass_type: doc.passType,
    reference_id: doc.referenceId,
    qr_token: doc.qrToken,
    status: doc.status ?? "active",
    valid_from: doc.validFrom,
    valid_until: doc.validUntil,
    used_at: doc.usedAt,
    used_by: doc.usedBy,
    notes: doc.notes,
  };
}

function normalizeClient(doc, totalOrders = 0) {
  if (!doc) return null;
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    first_name: doc.firstName ?? "",
    last_name: doc.lastName ?? "",
    full_name: doc.fullName ?? "",
    email: doc.email,
    phone: doc.phone ?? null,
    role_key: doc.roleKey,
    status: doc.status ?? (doc.enabled === false ? "inactive" : "active"),
    locale: doc.locale,
    enabled: doc.enabled,
    avatar_id: doc.avatarId,
    joined: doc.$createdAt,
    total_orders: totalOrders,
  };
}

function normalizeAdminLocationProfile(doc) {
  if (!doc) return null;
  return {
    $id: doc.$id,
    name: doc.name ?? null,
    address: doc.address ?? null,
    map_url: doc.mapUrl ?? null,
    geo_json: parseJsonSafe(doc.geoJson),
    notes: doc.notes ?? null,
    capacity_hints_json: parseJsonSafe(doc.capacityHintsJson),
    enabled: doc.enabled ?? true,
  };
}

function normalizeAdminOffering(doc, defaultLocation = null) {
  if (!doc) return null;

  const flow = ensureOfferingFlow({
    category: doc.category,
    type: doc.type,
    flow_key: doc.flowKey,
    flow_version: doc.flowVersion,
    flow_config: doc.flowConfig,
    terms_config: doc.termsConfig,
  });
  const derived = offeringDerivedFields({
    category: doc.category,
    type: doc.type,
    flow_key: flow.flow_key,
    flow_version: flow.flow_version,
    flow_config: flow.flow_config,
    terms_config: flow.terms_config,
  });

  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    slug: doc.slug,
    title_es: doc.titleEs,
    title_en: doc.titleEn,
    summary_es: doc.summaryEs,
    summary_en: doc.summaryEn,
    description_es: doc.descriptionEs,
    description_en: doc.descriptionEn,
    category: doc.category,
    type: doc.type,
    yoga_style: doc.yogaStyle ?? null,
    flow_key: flow.flow_key,
    flow_version: flow.flow_version,
    flow_config: flow.flow_config,
    terms_config: flow.terms_config,
    booking_mode: derived.booking_mode,
    pricing_mode: derived.pricing_mode,
    base_price: derived.base_price,
    currency: doc.currency ?? "MXN",
    duration_min: derived.duration_min,
    min_guests: derived.min_guests,
    max_guests: derived.max_guests,
    requires_schedule: derived.requires_schedule,
    supports_date_range: derived.supports_date_range,
    default_location_profile_id:
      doc.defaultLocationProfileId ?? derived.location_profile_id ?? null,
    location_label:
      defaultLocation?.name ??
      defaultLocation?.address ??
      derived.location_label ??
      null,
    // Multi-image support: use imagesJson if available, otherwise fall back to legacy fields
    images_json: doc.imagesJson ?? null,
    // Legacy compat: still expose cover_image_id/bucket for components not yet updated
    cover_image_id: doc.coverImageId ?? null,
    cover_image_bucket: doc.coverImageBucket ?? null,
    cta_label_es: doc.ctaLabelEs ?? null,
    cta_label_en: doc.ctaLabelEn ?? null,
    badges_json: doc.badgesJson ?? null,
    is_featured: doc.isFeatured ?? false,
    show_on_home: doc.showOnHome ?? false,
    display_order: doc.displayOrder ?? 0,
    status: doc.status ?? "draft",
    enabled: doc.enabled ?? true,
  };
}

function normalizeAdminSlot(doc, locationProfile = null) {
  if (!doc) return null;
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    offering_id: doc.offeringId,
    start_at: doc.startAt,
    end_at: doc.endAt ?? null,
    date_label: doc.dateLabel ?? null,
    capacity_total: doc.capacityTotal ?? 0,
    capacity_taken: doc.capacityTaken ?? 0,
    price_override: doc.priceOverride ?? null,
    status: doc.status ?? "open",
    location_profile_id: doc.locationProfileId ?? null,
    location_label: locationProfile?.name ?? locationProfile?.address ?? null,
    location_profile: normalizeAdminLocationProfile(locationProfile),
    notes: doc.notes ?? null,
    enabled: doc.enabled ?? true,
  };
}

function normalizeAdminBlock(doc) {
  if (!doc) return null;
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    offering_id: doc.offeringId ?? null,
    start_at: doc.startAt,
    end_at: doc.endAt,
    reason: doc.reason ?? null,
    block_type: doc.blockType,
    enabled: doc.enabled ?? true,
  };
}

function normalizeAdminContentSection(doc) {
  if (!doc) return null;
  return {
    $id: doc.$id,
    section_key: doc.sectionKey,
    title_es: doc.titleEs ?? null,
    title_en: doc.titleEn ?? null,
    subtitle_es: doc.subtitleEs ?? null,
    subtitle_en: doc.subtitleEn ?? null,
    body_es: doc.bodyEs ?? null,
    body_en: doc.bodyEn ?? null,
    cta_label_es: doc.ctaLabelEs ?? null,
    cta_label_en: doc.ctaLabelEn ?? null,
    cta_url: doc.ctaUrl ?? null,
    images_json: doc.imagesJson ?? null,
    scope: doc.scope ?? "global",
    offering_id: doc.offeringId ?? null,
    display_order: doc.displayOrder ?? 0,
    enabled: doc.enabled ?? true,
  };
}

function normalizeBooking(
  doc,
  { offeringDoc, slotDoc, slotLocation, defaultLocation } = {},
) {
  if (!doc) return null;
  const offering = offeringDoc
    ? normalizeAdminOffering(offeringDoc, defaultLocation)
    : null;
  const slot = slotDoc ? normalizeAdminSlot(slotDoc, slotLocation) : null;

  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    client_user_id: doc.clientUserId,
    order_id: doc.orderId,
    booking_code: doc.bookingCode,
    status: doc.status ?? "confirmed",
    quantity: doc.quantity ?? 1,
    unit_price: doc.unitPrice ?? 0,
    reserved_at: doc.reservedAt,
    confirmed_at: doc.confirmedAt ?? null,
    offering_id: doc.offeringId ?? null,
    slot_id: doc.slotId ?? null,
    booking_type: doc.bookingType ?? null,
    guest_count: doc.guestCount ?? doc.quantity ?? 1,
    extras_json: parseJsonSafe(doc.extrasJson),
    request_data_json: parseJsonSafe(doc.requestDataJson),
    pricing_snapshot_json: parseJsonSafe(doc.pricingSnapshotJson),
    custom_answers_json: parseJsonSafe(doc.customAnswersJson),
    offering,
    slot,
  };
}

async function listByIds(collectionId, ids = []) {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return [];
  const res = await databases.listDocuments(DB, collectionId, [
    Query.equal("$id", unique),
    Query.limit(unique.length),
  ]);
  return res.documents;
}

async function invokeAdminOfferingsWrite(operation, payload = {}) {
  if (!FN_ADMIN_WRITE_OFFERINGS) {
    throw new Error(
      "La Function admin-write-offerings no esta configurada en el entorno.",
    );
  }

  const execution = await functions.createExecution(
    FN_ADMIN_WRITE_OFFERINGS,
    JSON.stringify({ operation, payload }),
    false,
    "/",
    "POST",
    { "Content-Type": "application/json" },
  );

  let parsed = null;
  try {
    parsed = execution?.responseBody
      ? JSON.parse(execution.responseBody)
      : null;
  } catch {
    throw new Error("Respuesta invalida de admin-write-offerings.");
  }

  if (!parsed?.ok) {
    throw new Error(parsed?.message || "No se pudo completar la operacion.");
  }

  return parsed.data ?? null;
}

function startOfDayISO(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function startOfMonthISO(date = new Date()) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function getDashboardMetrics() {
  const startToday = startOfDayISO();
  const startMonth = startOfMonthISO();

  const [
    ordersToday,
    bookingsToday,
    newCustomers,
    activeOfferings,
    paidOrdersMonth,
    paidOrdersToday,
  ] = await Promise.all([
    databases.listDocuments(DB, COL_ORDERS, [
      Query.greaterThanEqual("$createdAt", startToday),
      Query.limit(1),
    ]),
    databases.listDocuments(DB, COL_BOOKINGS, [
      Query.greaterThanEqual("$createdAt", startToday),
      Query.limit(1),
    ]),
    databases.listDocuments(DB, COL_USERS_PROFILE, [
      Query.greaterThanEqual("$createdAt", startToday),
      Query.limit(1),
    ]),
    databases.listDocuments(DB, COL_OFFERINGS, [
      Query.equal("enabled", true),
      Query.limit(1),
    ]),
    databases.listDocuments(DB, COL_ORDERS, [
      Query.equal("paymentStatus", "paid"),
      Query.greaterThanEqual("$createdAt", startMonth),
      Query.limit(500),
    ]),
    databases.listDocuments(DB, COL_ORDERS, [
      Query.equal("paymentStatus", "paid"),
      Query.greaterThanEqual("$createdAt", startToday),
      Query.limit(500),
    ]),
  ]);

  const revenueMonth = paidOrdersMonth.documents.reduce(
    (sum, order) => sum + Number(order.grandTotal ?? 0),
    0,
  );
  const revenueToday = paidOrdersToday.documents.reduce(
    (sum, order) => sum + Number(order.grandTotal ?? 0),
    0,
  );

  return {
    sales_today: ordersToday.total,
    bookings_today: bookingsToday.total,
    new_customers: newCustomers.total,
    active_packages: activeOfferings.total,
    active_offerings: activeOfferings.total,
    revenue_month: revenueMonth,
    revenue_today: revenueToday,
  };
}

export async function listLeads() {
  const res = await databases.listDocuments(DB, COL_CONTACT_LEADS, [
    Query.orderDesc("$createdAt"),
    Query.limit(200),
  ]);
  return res.documents.map(normalizeLead);
}

export async function updateLeadStatus(leadId, status) {
  const doc = await databases.updateDocument(DB, COL_CONTACT_LEADS, leadId, {
    status,
  });
  return normalizeLead(doc);
}

export async function createLead(data) {
  const doc = await databases.createDocument(
    DB,
    COL_CONTACT_LEADS,
    ID.unique(),
    {
      fullName: data.full_name,
      email: data.email,
      phone: data.phone ?? null,
      subject: data.subject ?? null,
      message: data.message,
      status: data.status ?? "new",
    },
  );
  return normalizeLead(doc);
}

export async function listOrders() {
  const ordersRes = await databases.listDocuments(DB, COL_ORDERS, [
    Query.orderDesc("$createdAt"),
    Query.limit(200),
  ]);

  const orders = ordersRes.documents;
  if (orders.length === 0) return [];

  const orderIds = orders.map((o) => o.$id);
  const itemsRes = await databases.listDocuments(DB, COL_ORDER_ITEMS, [
    Query.equal("orderId", orderIds),
    Query.orderAsc("$createdAt"),
    Query.limit(1000),
  ]);

  const itemsByOrder = {};
  for (const item of itemsRes.documents) {
    if (!itemsByOrder[item.orderId]) itemsByOrder[item.orderId] = [];
    itemsByOrder[item.orderId].push(normalizeOrderItem(item));
  }

  return orders.map((order) =>
    normalizeOrder(order, itemsByOrder[order.$id] ?? []),
  );
}

export async function listBookings() {
  const res = await databases.listDocuments(DB, COL_BOOKINGS, [
    Query.orderDesc("$createdAt"),
    Query.limit(250),
  ]);

  const bookings = res.documents;
  if (bookings.length === 0) return [];

  const offeringIds = [
    ...new Set(bookings.map((b) => b.offeringId).filter(Boolean)),
  ];
  const slotIds = [...new Set(bookings.map((b) => b.slotId).filter(Boolean))];

  const [offeringDocs, slotDocs] = await Promise.all([
    listByIds(COL_OFFERINGS, offeringIds),
    listByIds(COL_OFFERING_SLOTS, slotIds),
  ]);

  const offeringMap = Object.fromEntries(offeringDocs.map((d) => [d.$id, d]));
  const slotMap = Object.fromEntries(slotDocs.map((d) => [d.$id, d]));

  const locationIds = [
    ...new Set(
      [
        ...offeringDocs.map((d) => d.defaultLocationProfileId),
        ...slotDocs.map((d) => d.locationProfileId),
      ].filter(Boolean),
    ),
  ];
  const locationDocs = await listByIds(COL_LOCATION_PROFILES, locationIds);
  const locationMap = Object.fromEntries(locationDocs.map((d) => [d.$id, d]));

  return bookings.map((booking) => {
    const offeringDoc = offeringMap[booking.offeringId] ?? null;
    const slotDoc = slotMap[booking.slotId] ?? null;
    const slotLocation = slotDoc?.locationProfileId
      ? (locationMap[slotDoc.locationProfileId] ?? null)
      : null;
    const defaultLocation = offeringDoc?.defaultLocationProfileId
      ? (locationMap[offeringDoc.defaultLocationProfileId] ?? null)
      : null;

    return normalizeBooking(booking, {
      offeringDoc,
      slotDoc,
      slotLocation,
      defaultLocation,
    });
  });
}

export async function listPasses({ clientUserId, status } = {}) {
  const queries = [Query.orderDesc("$createdAt"), Query.limit(200)];
  if (clientUserId) queries.push(Query.equal("clientUserId", clientUserId));
  if (status) queries.push(Query.equal("status", status));

  const res = await databases.listDocuments(DB, COL_ACCESS_PASSES, queries);
  return res.documents.map(normalizePass);
}

export async function cancelPass(passId) {
  const doc = await databases.updateDocument(DB, COL_ACCESS_PASSES, passId, {
    status: "cancelled",
  });
  return normalizePass(doc);
}

export async function listClients() {
  const [profilesRes, ordersRes] = await Promise.all([
    databases.listDocuments(DB, COL_USERS_PROFILE, [
      Query.orderDesc("$createdAt"),
      Query.limit(500),
    ]),
    databases.listDocuments(DB, COL_ORDERS, [Query.limit(1000)]),
  ]);

  const ordersByUser = {};
  for (const order of ordersRes.documents) {
    const userId = order.clientUserId;
    if (!userId) continue;
    ordersByUser[userId] = (ordersByUser[userId] ?? 0) + 1;
  }

  return profilesRes.documents.map((profile) =>
    normalizeClient(profile, ordersByUser[profile.$id] ?? 0),
  );
}

export async function getAppSettings() {
  const res = await databases.listDocuments(DB, COL_APP_SETTINGS, [
    Query.limit(1),
  ]);
  return res.documents[0] ?? null;
}

export async function upsertAppSettings(data) {
  const payload = {
    appName: data.app_name,
    defaultLocale: data.default_locale,
    defaultCurrency: data.default_currency,
    timezone: data.timezone,
    supportEmail: data.support_email,
    contactPhone: data.contact_phone,
    address: data.address,
    instagram: data.instagram,
    website: data.website,
    maintenanceMode: !!data.maintenance_mode,
  };

  const existing = await databases.listDocuments(DB, COL_APP_SETTINGS, [
    Query.limit(1),
  ]);

  if (existing.total > 0) {
    return databases.updateDocument(
      DB,
      COL_APP_SETTINGS,
      existing.documents[0].$id,
      payload,
    );
  }

  return databases.createDocument(DB, COL_APP_SETTINGS, ID.unique(), payload);
}

export async function listOfferings({ category, status } = {}) {
  const queries = [Query.orderAsc("displayOrder"), Query.limit(200)];
  if (category) queries.push(Query.equal("category", category));
  if (status) queries.push(Query.equal("status", status));

  const res = await databases.listDocuments(DB, COL_OFFERINGS, queries);
  const locationIds = [
    ...new Set(
      res.documents.map((doc) => doc.defaultLocationProfileId).filter(Boolean),
    ),
  ];
  const locationDocs = await listByIds(COL_LOCATION_PROFILES, locationIds);
  const locationMap = Object.fromEntries(
    locationDocs.map((doc) => [doc.$id, doc]),
  );

  return res.documents.map((doc) =>
    normalizeAdminOffering(
      doc,
      locationMap[doc.defaultLocationProfileId] ?? null,
    ),
  );
}

export async function createOffering(data) {
  const doc = await invokeAdminOfferingsWrite("offering.create", {
    core: data.core ?? data,
    flow: data.flow ?? {
      flow_key: data.flow_key,
      flow_version: data.flow_version,
      flow_config: data.flow_config,
      terms_config: data.terms_config,
    },
  });
  return normalizeAdminOffering(doc);
}

export async function updateOffering(offeringId, data) {
  const doc = await invokeAdminOfferingsWrite("offering.update", {
    core: {
      ...(data.core ?? data),
      offering_id: offeringId,
    },
    flow: data.flow ?? {
      flow_key: data.flow_key,
      flow_version: data.flow_version,
      flow_config: data.flow_config,
      terms_config: data.terms_config,
    },
  });
  return normalizeAdminOffering(doc);
}

export async function toggleOffering(offeringId, enabled) {
  const doc = await invokeAdminOfferingsWrite("offering.toggle", {
    offering_id: offeringId,
    enabled,
  });
  return normalizeAdminOffering(doc);
}

export async function deleteOffering(offeringId) {
  return invokeAdminOfferingsWrite("offering.delete", {
    offering_id: offeringId,
  });
}

export async function listSlots({ offeringId, status } = {}) {
  const queries = [Query.orderAsc("startAt"), Query.limit(300)];
  if (offeringId) queries.push(Query.equal("offeringId", offeringId));
  if (status) queries.push(Query.equal("status", status));

  const res = await databases.listDocuments(DB, COL_OFFERING_SLOTS, queries);
  const locationIds = [
    ...new Set(
      res.documents.map((doc) => doc.locationProfileId).filter(Boolean),
    ),
  ];
  const locationDocs = await listByIds(COL_LOCATION_PROFILES, locationIds);
  const locationMap = Object.fromEntries(
    locationDocs.map((doc) => [doc.$id, doc]),
  );

  return res.documents.map((doc) =>
    normalizeAdminSlot(doc, locationMap[doc.locationProfileId] ?? null),
  );
}

export async function listLocationProfiles({ enabled } = {}) {
  const queries = [Query.orderAsc("name"), Query.limit(300)];
  if (enabled !== undefined) queries.push(Query.equal("enabled", !!enabled));
  const res = await databases.listDocuments(DB, COL_LOCATION_PROFILES, queries);
  return res.documents.map(normalizeAdminLocationProfile);
}

export async function createLocationProfile(data) {
  const doc = await invokeAdminOfferingsWrite("location.create", {
    core: data,
  });
  return normalizeAdminLocationProfile(doc);
}

export async function updateLocationProfile(locationProfileId, data) {
  const doc = await invokeAdminOfferingsWrite("location.update", {
    core: {
      ...data,
      location_profile_id: locationProfileId,
    },
  });
  return normalizeAdminLocationProfile(doc);
}

export async function deleteLocationProfile(locationProfileId) {
  return invokeAdminOfferingsWrite("location.delete", {
    location_profile_id: locationProfileId,
  });
}

export async function createSlot(data) {
  const doc = await invokeAdminOfferingsWrite("slot.create", {
    core: data,
  });
  return normalizeAdminSlot(doc);
}

export async function updateSlot(slotId, data) {
  const doc = await invokeAdminOfferingsWrite("slot.update", {
    core: {
      ...data,
      slot_id: slotId,
    },
  });
  return normalizeAdminSlot(doc);
}

export async function toggleSlot(slotId, enabled) {
  const doc = await invokeAdminOfferingsWrite("slot.toggle", {
    slot_id: slotId,
    enabled,
  });
  return normalizeAdminSlot(doc);
}

export async function cancelSlot(slotId) {
  const doc = await invokeAdminOfferingsWrite("slot.cancel", {
    slot_id: slotId,
  });
  return normalizeAdminSlot(doc);
}

export async function deleteSlot(slotId) {
  return invokeAdminOfferingsWrite("slot.delete", { slot_id: slotId });
}

export async function listBlocks({ offeringId } = {}) {
  const queries = [Query.orderAsc("startAt"), Query.limit(200)];
  if (offeringId) queries.push(Query.equal("offeringId", offeringId));
  const res = await databases.listDocuments(
    DB,
    COL_AVAILABILITY_BLOCKS,
    queries,
  );
  return res.documents.map(normalizeAdminBlock);
}

export async function createBlock(data) {
  const doc = await invokeAdminOfferingsWrite("block.create", {
    core: data,
  });
  return normalizeAdminBlock(doc);
}

export async function updateBlock(blockId, data) {
  const doc = await invokeAdminOfferingsWrite("block.update", {
    core: {
      ...data,
      block_id: blockId,
    },
  });
  return normalizeAdminBlock(doc);
}

export async function deleteBlock(blockId) {
  return invokeAdminOfferingsWrite("block.delete", { block_id: blockId });
}

export async function listContentSections({ scope, offeringId } = {}) {
  const queries = [Query.orderAsc("displayOrder"), Query.limit(200)];
  if (scope) queries.push(Query.equal("scope", scope));
  if (offeringId) queries.push(Query.equal("offeringId", offeringId));
  const res = await databases.listDocuments(DB, COL_CONTENT_SECTIONS, queries);
  return res.documents.map(normalizeAdminContentSection);
}

export async function createContentSection(data) {
  const doc = await invokeAdminOfferingsWrite("content.create", {
    core: data,
  });
  return normalizeAdminContentSection(doc);
}

export async function updateContentSection(sectionId, data) {
  const doc = await invokeAdminOfferingsWrite("content.update", {
    core: {
      ...data,
      section_id: sectionId,
    },
  });
  return normalizeAdminContentSection(doc);
}

export async function toggleContentSection(sectionId, enabled) {
  const doc = await invokeAdminOfferingsWrite("content.toggle", {
    core: {
      section_id: sectionId,
      enabled,
    },
  });
  return normalizeAdminContentSection(doc);
}

export async function deleteContentSection(sectionId) {
  return invokeAdminOfferingsWrite("content.delete", {
    core: { section_id: sectionId },
  });
}
