/**
 * adminService.js — Appwrite data layer para el panel administrativo.
 *
 * Convierte documentos camelCase (Appwrite) → snake_case (UI).
 * Todos los writes aceptan snake_case y convierten internamente.
 *
 * Colecciones cubiertas:
 *   classes, class_sessions, instructors, class_types,
 *   wellness_products, wellness_packages,
 *   contact_leads, users_profile (read),
 *   orders, order_items, bookings,
 *   access_passes, site_content, app_settings
 *
 * Membresías/plans: gestionadas por mock únicamente (sin colección en schema).
 */
import { Query, ID } from "appwrite";
import { databases, functions } from "./client";
import {
  APPWRITE_DATABASE_ID,
  COL_CLASSES,
  COL_CLASS_SESSIONS,
  COL_CLASS_TYPES,
  COL_INSTRUCTORS,
  COL_WELLNESS_PRODUCTS,
  COL_WELLNESS_PACKAGES,
  COL_CONTACT_LEADS,
  COL_USERS_PROFILE,
  COL_ORDERS,
  COL_ORDER_ITEMS,
  COL_BOOKINGS,
  COL_ACCESS_PASSES,
  COL_SITE_CONTENT,
  COL_APP_SETTINGS,
  FN_ADMIN_WRITE_CATALOG,
} from "@/env";

const DB = APPWRITE_DATABASE_ID;

// ── Normalizers (camelCase Appwrite → snake_case UI) ─────────────────────────

function normalizeClass(doc, relations = {}) {
  if (!doc) return null;
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
    class_type_id: doc.classTypeId,
    instructor_id: doc.instructorId,
    difficulty: doc.difficulty,
    duration_min: doc.durationMin,
    base_price: doc.basePrice,
    cover_image_id: doc.coverImageId,
    is_featured: doc.isFeatured ?? false,
    enabled: doc.enabled ?? true,
    class_type: relations.classTypeDoc
      ? normalizeClassType(relations.classTypeDoc)
      : null,
    instructor: relations.instructorDoc
      ? normalizeInstructor(relations.instructorDoc)
      : null,
  };
}

function normalizeSession(doc, classDoc) {
  if (!doc) return null;
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    class_id: doc.classId,
    session_date: doc.sessionDate,
    end_date: doc.endDate,
    capacity_total: doc.capacityTotal ?? 0,
    capacity_taken: doc.capacityTaken ?? 0,
    price_override: doc.priceOverride ?? null,
    instructor_id: doc.instructorId,
    status: doc.status ?? "scheduled",
    location_label: doc.locationLabel,
    enabled: doc.enabled ?? true,
    class: classDoc ? normalizeClass(classDoc) : null,
  };
}

function normalizeInstructor(doc) {
  if (!doc) return null;
  return {
    $id: doc.$id,
    slug: doc.slug,
    full_name: doc.fullName,
    short_bio: doc.shortBio,
    photo_id: doc.photoId,
    specialties: doc.specialties,
    display_order: doc.displayOrder,
    enabled: doc.enabled ?? true,
  };
}

function normalizeClassType(doc) {
  if (!doc) return null;
  return {
    $id: doc.$id,
    slug: doc.slug,
    name_es: doc.nameEs,
    name_en: doc.nameEn,
    description: doc.description,
    enabled: doc.enabled ?? true,
  };
}

function normalizeProduct(doc) {
  if (!doc) return null;
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    slug: doc.slug,
    name_es: doc.nameEs,
    name_en: doc.nameEn,
    description_es: doc.descriptionEs,
    description_en: doc.descriptionEn,
    product_type: doc.productType,
    price: doc.price,
    cover_image_id: doc.coverImageId,
    is_addon_only: doc.isAddonOnly ?? false,
    is_featured: doc.isFeatured ?? false,
    enabled: doc.enabled ?? true,
  };
}

function normalizePackage(doc) {
  if (!doc) return null;
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    slug: doc.slug,
    name_es: doc.nameEs,
    name_en: doc.nameEn,
    description_es: doc.descriptionEs,
    description_en: doc.descriptionEn,
    price: doc.price,
    sale_price_enabled: doc.salePriceEnabled ?? false,
    sale_price: doc.salePrice ?? null,
    class_credits: doc.classCredits ?? 0,
    wellness_credits: doc.wellnessCredits ?? 0,
    expiration_days: doc.expirationDays ?? 0,
    rules_json: doc.rulesJson ? _parseJson(doc.rulesJson) : [],
    items_json: doc.itemsJson ? _parseJson(doc.itemsJson) : [],
    is_featured: doc.isFeatured ?? false,
    enabled: doc.enabled ?? true,
  };
}

function normalizeLead(doc) {
  if (!doc) return null;
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    full_name: doc.fullName,
    email: doc.email,
    phone: doc.phone,
    interest_type: doc.interestType,
    notes: doc.notes,
    status: doc.status ?? "new",
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

function normalizeBooking(doc, sessionDoc, classDoc) {
  if (!doc) return null;
  const session = sessionDoc
    ? {
        $id: sessionDoc.$id,
        session_date: sessionDoc.sessionDate,
        location_label: sessionDoc.locationLabel,
        class: classDoc ? normalizeClass(classDoc) : null,
      }
    : null;
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    client_user_id: doc.clientUserId,
    session_id: doc.sessionId,
    order_id: doc.orderId,
    booking_code: doc.bookingCode,
    status: doc.status ?? "confirmed",
    unit_price: doc.unitPrice ?? 0,
    extras_json: doc.extrasJson ? _parseJson(doc.extrasJson) : null,
    reserved_at: doc.reservedAt,
    session,
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

function normalizeClient(doc) {
  if (!doc) return null;
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    first_name: doc.firstName,
    last_name: doc.lastName,
    full_name: doc.fullName,
    email: doc.email,
    role_key: doc.roleKey,
    status: doc.status,
    locale: doc.locale,
    enabled: doc.enabled,
    avatar_id: doc.avatarId,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function _parseJson(str) {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function _slugify(value, maxLength = 120) {
  const base = String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return (base || `item-${Date.now()}`).slice(0, maxLength);
}

function _firstFilled(...values) {
  return (
    values.find(
      (value) => typeof value === "string" && value.trim().length > 0,
    ) ?? ""
  );
}

function _resolveClassSlug(data) {
  return _slugify(_firstFilled(data.slug, data.title_es, data.title_en), 120);
}

function _resolveInstructorSlug(data) {
  return _slugify(_firstFilled(data.slug, data.full_name), 100);
}

function _resolveClassTypeSlug(data) {
  return _slugify(_firstFilled(data.slug, data.name_es, data.name_en), 80);
}

/** Batch-fetch documents by $id array (max 100) */
async function _batchGetById(collectionId, ids) {
  if (!ids || ids.length === 0) return {};
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return {};
  const res = await databases.listDocuments(DB, collectionId, [
    Query.equal("$id", unique),
    Query.limit(unique.length),
  ]);
  return Object.fromEntries(res.documents.map((d) => [d.$id, d]));
}

async function _countDocuments(collectionId, queries = []) {
  const res = await databases.listDocuments(DB, collectionId, [
    ...queries,
    Query.limit(1),
  ]);
  return res.total;
}

async function _enrichClasses(docs) {
  if (!docs || docs.length === 0) return [];

  const [classTypes, instructors] = await Promise.all([
    _batchGetById(
      COL_CLASS_TYPES,
      docs.map((doc) => doc.classTypeId).filter(Boolean),
    ),
    _batchGetById(
      COL_INSTRUCTORS,
      docs.map((doc) => doc.instructorId).filter(Boolean),
    ),
  ]);

  return docs.map((doc) =>
    normalizeClass(doc, {
      classTypeDoc: classTypes[doc.classTypeId] ?? null,
      instructorDoc: instructors[doc.instructorId] ?? null,
    }),
  );
}

async function _invokeAdminCatalogWrite(operation, payload = {}) {
  if (!FN_ADMIN_WRITE_CATALOG) {
    throw new Error(
      "La Function admin-write-catalog no esta configurada en el entorno.",
    );
  }

  const execution = await functions.createExecution(
    FN_ADMIN_WRITE_CATALOG,
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
    throw new Error("Respuesta invalida de admin-write-catalog.");
  }

  if (!parsed?.ok) {
    throw new Error(parsed?.message || "No se pudo completar la operacion.");
  }

  return parsed.data ?? null;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

/**
 * Fetch KPI metrics for the admin dashboard.
 * Uses Query.limit(1) + response.total for efficient counting.
 */
export async function getDashboardMetrics() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  const [ordersToday, bookingsToday, newClients, clientPackages] =
    await Promise.all([
      databases.listDocuments(DB, COL_ORDERS, [
        Query.greaterThanEqual("$createdAt", todayIso),
        Query.limit(1),
      ]),
      databases.listDocuments(DB, COL_BOOKINGS, [
        Query.greaterThanEqual("$createdAt", todayIso),
        Query.limit(1),
      ]),
      databases.listDocuments(DB, COL_USERS_PROFILE, [
        Query.equal("roleKey", "client"),
        Query.greaterThanEqual("$createdAt", todayIso),
        Query.limit(1),
      ]),
      databases.listDocuments(DB, COL_ORDERS, [
        Query.equal("fulfillmentState", "confirmed"),
        Query.limit(1),
      ]),
    ]);

  // Revenue today: sum grandTotal from orders paid today (max 100)
  const paidToday = await databases.listDocuments(DB, COL_ORDERS, [
    Query.equal("paymentStatus", "paid"),
    Query.greaterThanEqual("$createdAt", todayIso),
    Query.limit(100),
  ]);
  const revenueToday = paidToday.documents.reduce(
    (sum, o) => sum + (o.grandTotal ?? 0),
    0,
  );

  // Revenue this month
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const paidMonth = await databases.listDocuments(DB, COL_ORDERS, [
    Query.equal("paymentStatus", "paid"),
    Query.greaterThanEqual("$createdAt", startOfMonth.toISOString()),
    Query.limit(100),
  ]);
  const revenueMonth = paidMonth.documents.reduce(
    (sum, o) => sum + (o.grandTotal ?? 0),
    0,
  );

  return {
    sales_today: ordersToday.total,
    bookings_today: bookingsToday.total,
    new_customers: newClients.total,
    active_packages: clientPackages.total,
    revenue_month: revenueMonth,
    revenue_today: revenueToday,
  };
}

// ── Classes ───────────────────────────────────────────────────────────────────

export async function listClasses() {
  const res = await databases.listDocuments(DB, COL_CLASSES, [
    Query.orderDesc("$createdAt"),
    Query.limit(100),
  ]);
  return _enrichClasses(res.documents);
}

export async function getClass(classId) {
  const doc = await databases.getDocument(DB, COL_CLASSES, classId);
  const [item] = await _enrichClasses([doc]);
  return item ?? null;
}

export async function createClass(data) {
  const doc = await _invokeAdminCatalogWrite("class.create", data);
  const [item] = await _enrichClasses([doc]);
  return item ?? null;
}

export async function updateClass(classId, data) {
  const doc = await _invokeAdminCatalogWrite("class.update", {
    class_id: classId,
    ...data,
  });
  const [item] = await _enrichClasses([doc]);
  return item ?? null;
}

export async function toggleClass(classId, enabled) {
  return updateClass(classId, { enabled });
}

export async function deleteClass(classId) {
  return _invokeAdminCatalogWrite("class.delete", { class_id: classId });
}

// ── Instructors & Class Types ─────────────────────────────────────────────────

export async function listInstructors() {
  const res = await databases.listDocuments(DB, COL_INSTRUCTORS, [
    Query.orderAsc("displayOrder"),
    Query.limit(50),
  ]);
  return res.documents.map(normalizeInstructor);
}

export async function createInstructor(data) {
  const doc = await _invokeAdminCatalogWrite("instructor.create", data);

  return normalizeInstructor(doc);
}

export async function updateInstructor(instructorId, data) {
  const doc = await _invokeAdminCatalogWrite("instructor.update", {
    instructor_id: instructorId,
    ...data,
  });

  return normalizeInstructor(doc);
}

export async function toggleInstructor(instructorId, enabled) {
  return updateInstructor(instructorId, { enabled });
}

export async function deleteInstructor(instructorId) {
  return _invokeAdminCatalogWrite("instructor.delete", {
    instructor_id: instructorId,
  });
}

export async function listClassTypes() {
  const res = await databases.listDocuments(DB, COL_CLASS_TYPES, [
    Query.orderAsc("slug"),
    Query.limit(50),
  ]);
  return res.documents.map(normalizeClassType);
}

export async function createClassType(data) {
  const doc = await _invokeAdminCatalogWrite("classType.create", data);

  return normalizeClassType(doc);
}

export async function updateClassType(classTypeId, data) {
  const doc = await _invokeAdminCatalogWrite("classType.update", {
    class_type_id: classTypeId,
    ...data,
  });

  return normalizeClassType(doc);
}

export async function toggleClassType(classTypeId, enabled) {
  return updateClassType(classTypeId, { enabled });
}

export async function deleteClassType(classTypeId) {
  return _invokeAdminCatalogWrite("classType.delete", {
    class_type_id: classTypeId,
  });
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export async function listSessions({ classId } = {}) {
  const queries = [Query.orderDesc("sessionDate"), Query.limit(200)];
  if (classId) queries.push(Query.equal("classId", classId));

  const res = await databases.listDocuments(DB, COL_CLASS_SESSIONS, queries);
  const sessions = res.documents;

  // Batch-fetch parent classes
  const classIds = [...new Set(sessions.map((s) => s.classId).filter(Boolean))];
  const classMap = await _batchGetById(COL_CLASSES, classIds);

  return sessions.map((s) => normalizeSession(s, classMap[s.classId] ?? null));
}

export async function createSession(data) {
  const doc = await _invokeAdminCatalogWrite("session.create", data);
  // Enrich with class
  const classDoc = doc?.classId
    ? await databases
        .getDocument(DB, COL_CLASSES, doc.classId)
        .catch(() => null)
    : null;
  return normalizeSession(doc, classDoc);
}

export async function updateSession(sessionId, data) {
  const doc = await _invokeAdminCatalogWrite("session.update", {
    session_id: sessionId,
    ...data,
  });
  const classDoc = doc?.classId
    ? await databases
        .getDocument(DB, COL_CLASSES, doc.classId)
        .catch(() => null)
    : null;
  return normalizeSession(doc, classDoc);
}

export async function toggleSession(sessionId, enabled) {
  const doc = await _invokeAdminCatalogWrite("session.toggle", {
    session_id: sessionId,
    enabled,
  });
  const classDoc = doc?.classId
    ? await databases
        .getDocument(DB, COL_CLASSES, doc.classId)
        .catch(() => null)
    : null;
  return normalizeSession(doc, classDoc);
}

export async function cancelSession(sessionId) {
  const doc = await _invokeAdminCatalogWrite("session.cancel", {
    session_id: sessionId,
  });
  const classDoc = doc?.classId
    ? await databases
        .getDocument(DB, COL_CLASSES, doc.classId)
        .catch(() => null)
    : null;
  return normalizeSession(doc, classDoc);
}

export async function deleteSession(sessionId) {
  return _invokeAdminCatalogWrite("session.delete", { session_id: sessionId });
}

// ── Wellness Products ─────────────────────────────────────────────────────────

export async function listProducts() {
  const res = await databases.listDocuments(DB, COL_WELLNESS_PRODUCTS, [
    Query.orderDesc("$createdAt"),
    Query.limit(100),
  ]);
  return res.documents.map(normalizeProduct);
}

export async function createProduct(data) {
  const doc = await databases.createDocument(
    DB,
    COL_WELLNESS_PRODUCTS,
    ID.unique(),
    {
      slug: data.slug,
      nameEs: data.name_es,
      nameEn: data.name_en,
      descriptionEs: data.description_es,
      descriptionEn: data.description_en,
      productType: data.product_type,
      price: data.price,
      isAddonOnly: data.is_addon_only ?? false,
      isFeatured: data.is_featured ?? false,
      enabled: data.enabled ?? true,
    },
  );
  return normalizeProduct(doc);
}

export async function updateProduct(productId, data) {
  const update = {};
  if (data.slug !== undefined) update.slug = data.slug;
  if (data.name_es !== undefined) update.nameEs = data.name_es;
  if (data.name_en !== undefined) update.nameEn = data.name_en;
  if (data.description_es !== undefined)
    update.descriptionEs = data.description_es;
  if (data.description_en !== undefined)
    update.descriptionEn = data.description_en;
  if (data.product_type !== undefined) update.productType = data.product_type;
  if (data.price !== undefined) update.price = data.price;
  if (data.is_addon_only !== undefined) update.isAddonOnly = data.is_addon_only;
  if (data.is_featured !== undefined) update.isFeatured = data.is_featured;
  if (data.enabled !== undefined) update.enabled = data.enabled;
  const doc = await databases.updateDocument(
    DB,
    COL_WELLNESS_PRODUCTS,
    productId,
    update,
  );
  return normalizeProduct(doc);
}

export async function toggleProduct(productId, enabled) {
  return updateProduct(productId, { enabled });
}

// ── Wellness Packages ─────────────────────────────────────────────────────────

export async function listPackages() {
  const res = await databases.listDocuments(DB, COL_WELLNESS_PACKAGES, [
    Query.orderDesc("$createdAt"),
    Query.limit(100),
  ]);
  return res.documents.map(normalizePackage);
}

export async function createPackage(data) {
  const doc = await databases.createDocument(
    DB,
    COL_WELLNESS_PACKAGES,
    ID.unique(),
    {
      slug: data.slug,
      nameEs: data.name_es,
      nameEn: data.name_en,
      descriptionEs: data.description_es,
      descriptionEn: data.description_en,
      price: data.price,
      salePriceEnabled: data.sale_price_enabled ?? false,
      salePrice: data.sale_price ?? null,
      classCredits: data.class_credits ?? 0,
      wellnessCredits: data.wellness_credits ?? 0,
      expirationDays: data.expiration_days ?? 0,
      itemsJson: data.items_json ? JSON.stringify(data.items_json) : null,
      rulesJson: data.rules_json ? JSON.stringify(data.rules_json) : null,
      isFeatured: data.is_featured ?? false,
      enabled: data.enabled ?? true,
    },
  );
  return normalizePackage(doc);
}

export async function updatePackage(packageId, data) {
  const update = {};
  if (data.slug !== undefined) update.slug = data.slug;
  if (data.name_es !== undefined) update.nameEs = data.name_es;
  if (data.name_en !== undefined) update.nameEn = data.name_en;
  if (data.description_es !== undefined)
    update.descriptionEs = data.description_es;
  if (data.description_en !== undefined)
    update.descriptionEn = data.description_en;
  if (data.price !== undefined) update.price = data.price;
  if (data.sale_price_enabled !== undefined)
    update.salePriceEnabled = data.sale_price_enabled;
  if (data.sale_price !== undefined) update.salePrice = data.sale_price;
  if (data.class_credits !== undefined)
    update.classCredits = data.class_credits;
  if (data.wellness_credits !== undefined)
    update.wellnessCredits = data.wellness_credits;
  if (data.expiration_days !== undefined)
    update.expirationDays = data.expiration_days;
  if (data.items_json !== undefined)
    update.itemsJson = data.items_json ? JSON.stringify(data.items_json) : null;
  if (data.rules_json !== undefined)
    update.rulesJson = data.rules_json ? JSON.stringify(data.rules_json) : null;
  if (data.is_featured !== undefined) update.isFeatured = data.is_featured;
  if (data.enabled !== undefined) update.enabled = data.enabled;
  const doc = await databases.updateDocument(
    DB,
    COL_WELLNESS_PACKAGES,
    packageId,
    update,
  );
  return normalizePackage(doc);
}

export async function togglePackage(packageId, enabled) {
  return updatePackage(packageId, { enabled });
}

// ── CRM — Leads ───────────────────────────────────────────────────────────────

export async function listLeads({ status } = {}) {
  const queries = [Query.orderDesc("$createdAt"), Query.limit(200)];
  if (status) queries.push(Query.equal("status", status));
  const res = await databases.listDocuments(DB, COL_CONTACT_LEADS, queries);
  return res.documents.map(normalizeLead);
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
      interestType: data.interest_type,
      notes: data.notes ?? null,
      status: data.status ?? "new",
    },
  );
  return normalizeLead(doc);
}

export async function updateLead(leadId, data) {
  const update = {};
  if (data.full_name !== undefined) update.fullName = data.full_name;
  if (data.email !== undefined) update.email = data.email;
  if (data.phone !== undefined) update.phone = data.phone;
  if (data.interest_type !== undefined)
    update.interestType = data.interest_type;
  if (data.notes !== undefined) update.notes = data.notes;
  if (data.status !== undefined) update.status = data.status;
  const doc = await databases.updateDocument(
    DB,
    COL_CONTACT_LEADS,
    leadId,
    update,
  );
  return normalizeLead(doc);
}

export async function updateLeadStatus(leadId, status) {
  return updateLead(leadId, { status });
}

export async function addLeadNote(leadId, note) {
  return updateLead(leadId, { notes: note });
}

// ── CRM — Clients ─────────────────────────────────────────────────────────────

export async function listClients() {
  const res = await databases.listDocuments(DB, COL_USERS_PROFILE, [
    Query.equal("roleKey", "client"),
    Query.orderDesc("$createdAt"),
    Query.limit(200),
  ]);
  return res.documents.map(normalizeClient);
}

// ── Commerce — Orders ─────────────────────────────────────────────────────────

export async function listOrders() {
  const [ordersRes, itemsRes] = await Promise.all([
    databases.listDocuments(DB, COL_ORDERS, [
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ]),
    databases.listDocuments(DB, COL_ORDER_ITEMS, [
      Query.orderAsc("$createdAt"),
      Query.limit(500),
    ]),
  ]);

  // Group items by orderId
  const itemsByOrder = {};
  for (const item of itemsRes.documents) {
    if (!itemsByOrder[item.orderId]) itemsByOrder[item.orderId] = [];
    itemsByOrder[item.orderId].push(normalizeOrderItem(item));
  }

  return ordersRes.documents.map((o) =>
    normalizeOrder(o, itemsByOrder[o.$id] ?? []),
  );
}

// ── Commerce — Bookings ────────────────────────────────────────────────────────

export async function listBookings() {
  const res = await databases.listDocuments(DB, COL_BOOKINGS, [
    Query.orderDesc("$createdAt"),
    Query.limit(200),
  ]);
  const bookings = res.documents;

  // Batch-fetch sessions
  const sessionIds = [
    ...new Set(bookings.map((b) => b.sessionId).filter(Boolean)),
  ];
  const sessionMap = await _batchGetById(COL_CLASS_SESSIONS, sessionIds);

  // Batch-fetch classes
  const classIds = [
    ...new Set(
      Object.values(sessionMap)
        .map((s) => s.classId)
        .filter(Boolean),
    ),
  ];
  const classMap = await _batchGetById(COL_CLASSES, classIds);

  return bookings.map((b) => {
    const session = sessionMap[b.sessionId] ?? null;
    const classDoc = session ? (classMap[session.classId] ?? null) : null;
    return normalizeBooking(b, session, classDoc);
  });
}

// ── Access Passes ─────────────────────────────────────────────────────────────

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

// ── Site Content ──────────────────────────────────────────────────────────────

/**
 * Get a site_content document by its contentKey.
 * Returns null if not found.
 */
export async function getSiteContent(contentKey) {
  try {
    const res = await databases.listDocuments(DB, COL_SITE_CONTENT, [
      Query.equal("contentKey", contentKey),
      Query.limit(10),
    ]);
    return res.documents.length > 0 ? res.documents[0] : null;
  } catch {
    return null;
  }
}

/**
 * Create or update a site_content entry (keyed by contentKey + locale).
 * metaJson stores the page-specific content as a JSON string.
 */
export async function upsertSiteContent(contentKey, locale, metaJson) {
  const existing = await databases.listDocuments(DB, COL_SITE_CONTENT, [
    Query.equal("contentKey", contentKey),
    Query.equal("locale", locale),
    Query.limit(1),
  ]);

  const payload = {
    contentKey,
    locale,
    metaJson:
      typeof metaJson === "string" ? metaJson : JSON.stringify(metaJson),
    enabled: true,
  };

  if (existing.documents.length > 0) {
    return databases.updateDocument(
      DB,
      COL_SITE_CONTENT,
      existing.documents[0].$id,
      payload,
    );
  }
  return databases.createDocument(DB, COL_SITE_CONTENT, ID.unique(), payload);
}

// ── App Settings ──────────────────────────────────────────────────────────────

/**
 * Fetch all app_settings as a flat object.
 */
export async function getAppSettings() {
  try {
    const res = await databases.listDocuments(DB, COL_APP_SETTINGS, [
      Query.limit(1),
    ]);
    if (res.documents.length > 0) return res.documents[0];
    return null;
  } catch {
    return null;
  }
}

/**
 * Create or update the single app_settings document.
 */
export async function upsertAppSettings(data) {
  const existing = await databases.listDocuments(DB, COL_APP_SETTINGS, [
    Query.limit(1),
  ]);

  const payload = {
    appName: data.app_name ?? data.appName,
    defaultLocale: data.default_locale ?? data.defaultLocale,
    defaultCurrency: data.default_currency ?? data.defaultCurrency,
    supportEmail: data.support_email ?? data.supportEmail,
    contactPhone: data.contact_phone ?? data.contactPhone,
    bookingNotice: data.booking_notice ?? data.bookingNotice,
    address: data.address,
    instagram: data.instagram,
    website: data.website,
    timezone: data.timezone,
  };
  // Remove undefined keys
  Object.keys(payload).forEach(
    (k) => payload[k] === undefined && delete payload[k],
  );

  if (existing.documents.length > 0) {
    return databases.updateDocument(
      DB,
      COL_APP_SETTINGS,
      existing.documents[0].$id,
      payload,
    );
  }
  return databases.createDocument(DB, COL_APP_SETTINGS, ID.unique(), payload);
}
