import { Client, Databases, ID, Query, Users } from "node-appwrite";

function parseBody(raw) {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      throw new Error("Invalid JSON body");
    }
  }
  return raw;
}

function toBoolean(value, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toNullableNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toNullableString(value) {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str.length > 0 ? str : null;
}

function firstFilled(...values) {
  return (
    values.find(
      (value) => typeof value === "string" && value.trim().length > 0,
    ) ?? ""
  );
}

function slugify(value, maxLength = 150) {
  const base = String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return (base || `item-${Date.now()}`).slice(0, maxLength);
}

function nowISO() {
  return new Date().toISOString();
}

async function countDocuments(db, databaseId, collectionId, queries = []) {
  const result = await db.listDocuments(databaseId, collectionId, [
    ...queries,
    Query.limit(1),
  ]);
  return result.total;
}

async function requireAdmin(users, userId) {
  const user = await users.get(userId);
  const labels = user.labels ?? [];
  if (!labels.includes("admin") && !labels.includes("root")) {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }
  return user;
}

function readEnv() {
  const env = {
    endpoint: process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
    projectId: process.env.APPWRITE_PROJECT_ID,
    apiKey: process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID,
    collections: {
      offerings: process.env.APPWRITE_COLLECTION_OFFERINGS_ID,
      slots: process.env.APPWRITE_COLLECTION_OFFERING_SLOTS_ID,
      rules: process.env.APPWRITE_COLLECTION_OFFERING_AVAILABILITY_RULES_ID,
      blocks: process.env.APPWRITE_COLLECTION_AVAILABILITY_BLOCKS_ID,
      sections: process.env.APPWRITE_COLLECTION_CONTENT_SECTIONS_ID,
      bookings: process.env.APPWRITE_COLLECTION_BOOKINGS_ID,
    },
  };

  const missing = [];
  if (!env.projectId) missing.push("APPWRITE_PROJECT_ID");
  if (!env.apiKey) missing.push("APPWRITE_API_KEY");
  if (!env.databaseId) missing.push("APPWRITE_DATABASE_ID");
  if (!env.collections.offerings)
    missing.push("APPWRITE_COLLECTION_OFFERINGS_ID");
  if (!env.collections.slots)
    missing.push("APPWRITE_COLLECTION_OFFERING_SLOTS_ID");
  if (!env.collections.blocks)
    missing.push("APPWRITE_COLLECTION_AVAILABILITY_BLOCKS_ID");
  if (!env.collections.sections)
    missing.push("APPWRITE_COLLECTION_CONTENT_SECTIONS_ID");
  if (!env.collections.bookings)
    missing.push("APPWRITE_COLLECTION_BOOKINGS_ID");

  if (missing.length > 0) {
    throw Object.assign(
      new Error(`Missing environment variables: ${missing.join(", ")}`),
      { status: 500 },
    );
  }

  return env;
}

// ── Offerings ────────────────────────────────────────────────────────────────

async function offeringCreate(db, cfg, p) {
  return db.createDocument(cfg.databaseId, cfg.collections.offerings, ID.unique(), {
    slug: slugify(firstFilled(p.slug, p.title_es, p.title_en)),
    titleEs: p.title_es,
    titleEn: p.title_en,
    summaryEs: toNullableString(p.summary_es),
    summaryEn: toNullableString(p.summary_en),
    descriptionEs: toNullableString(p.description_es),
    descriptionEn: toNullableString(p.description_en),
    category: p.category,
    type: p.type,
    yogaStyle: toNullableString(p.yoga_style),
    bookingMode: p.booking_mode,
    pricingMode: p.pricing_mode,
    basePrice: toNullableNumber(p.base_price),
    currency: p.currency || "MXN",
    durationMin: toNullableNumber(p.duration_min),
    minGuests: toNumber(p.min_guests, 1),
    maxGuests: toNumber(p.max_guests, 1),
    locationLabel: toNullableString(p.location_label),
    coverImageId: toNullableString(p.cover_image_id),
    coverImageBucket: toNullableString(p.cover_image_bucket),
    ctaLabelEs: toNullableString(p.cta_label_es),
    ctaLabelEn: toNullableString(p.cta_label_en),
    badgesJson: toNullableString(p.badges_json),
    isFeatured: toBoolean(p.is_featured, false),
    showOnHome: toBoolean(p.show_on_home, false),
    displayOrder: toNumber(p.display_order, 0),
    status: p.status || "draft",
    enabled: toBoolean(p.enabled, true),
    createdAt: nowISO(),
    updatedAt: nowISO(),
  });
}

async function offeringUpdate(db, cfg, p) {
  if (!p.offering_id)
    throw Object.assign(new Error("offering_id is required"), { status: 400 });

  const u = {};
  if (p.slug !== undefined) u.slug = slugify(firstFilled(p.slug, p.title_es, p.title_en));
  if (p.title_es !== undefined) u.titleEs = p.title_es;
  if (p.title_en !== undefined) u.titleEn = p.title_en;
  if (p.summary_es !== undefined) u.summaryEs = toNullableString(p.summary_es);
  if (p.summary_en !== undefined) u.summaryEn = toNullableString(p.summary_en);
  if (p.description_es !== undefined) u.descriptionEs = toNullableString(p.description_es);
  if (p.description_en !== undefined) u.descriptionEn = toNullableString(p.description_en);
  if (p.category !== undefined) u.category = p.category;
  if (p.type !== undefined) u.type = p.type;
  if (p.yoga_style !== undefined) u.yogaStyle = toNullableString(p.yoga_style);
  if (p.booking_mode !== undefined) u.bookingMode = p.booking_mode;
  if (p.pricing_mode !== undefined) u.pricingMode = p.pricing_mode;
  if (p.base_price !== undefined) u.basePrice = toNullableNumber(p.base_price);
  if (p.currency !== undefined) u.currency = p.currency;
  if (p.duration_min !== undefined) u.durationMin = toNullableNumber(p.duration_min);
  if (p.min_guests !== undefined) u.minGuests = toNumber(p.min_guests, 1);
  if (p.max_guests !== undefined) u.maxGuests = toNumber(p.max_guests, 1);
  if (p.location_label !== undefined) u.locationLabel = toNullableString(p.location_label);
  if (p.cover_image_id !== undefined) u.coverImageId = toNullableString(p.cover_image_id);
  if (p.cover_image_bucket !== undefined) u.coverImageBucket = toNullableString(p.cover_image_bucket);
  if (p.cta_label_es !== undefined) u.ctaLabelEs = toNullableString(p.cta_label_es);
  if (p.cta_label_en !== undefined) u.ctaLabelEn = toNullableString(p.cta_label_en);
  if (p.badges_json !== undefined) u.badgesJson = toNullableString(p.badges_json);
  if (p.is_featured !== undefined) u.isFeatured = toBoolean(p.is_featured, false);
  if (p.show_on_home !== undefined) u.showOnHome = toBoolean(p.show_on_home, false);
  if (p.display_order !== undefined) u.displayOrder = toNumber(p.display_order, 0);
  if (p.status !== undefined) u.status = p.status;
  if (p.enabled !== undefined) u.enabled = toBoolean(p.enabled, true);
  u.updatedAt = nowISO();

  return db.updateDocument(cfg.databaseId, cfg.collections.offerings, p.offering_id, u);
}

async function offeringToggle(db, cfg, p) {
  if (!p.offering_id)
    throw Object.assign(new Error("offering_id is required"), { status: 400 });

  return db.updateDocument(cfg.databaseId, cfg.collections.offerings, p.offering_id, {
    enabled: toBoolean(p.enabled, true),
    updatedAt: nowISO(),
  });
}

async function offeringDelete(db, cfg, p) {
  if (!p.offering_id)
    throw Object.assign(new Error("offering_id is required"), { status: 400 });

  const slotsCount = await countDocuments(db, cfg.databaseId, cfg.collections.slots, [
    Query.equal("offeringId", p.offering_id),
  ]);
  if (slotsCount > 0)
    throw Object.assign(
      new Error("No se puede eliminar el offering porque tiene slots asociados."),
      { status: 409 },
    );

  const bookingsCount = await countDocuments(db, cfg.databaseId, cfg.collections.bookings, [
    Query.equal("offeringId", p.offering_id),
  ]);
  if (bookingsCount > 0)
    throw Object.assign(
      new Error("No se puede eliminar el offering porque tiene reservas asociadas."),
      { status: 409 },
    );

  await db.deleteDocument(cfg.databaseId, cfg.collections.offerings, p.offering_id);
  return { $id: p.offering_id };
}

// ── Offering Slots ───────────────────────────────────────────────────────────

async function slotCreate(db, cfg, p) {
  if (!p.offering_id)
    throw Object.assign(new Error("offering_id is required"), { status: 400 });
  if (!p.start_at)
    throw Object.assign(new Error("start_at is required"), { status: 400 });

  return db.createDocument(cfg.databaseId, cfg.collections.slots, ID.unique(), {
    offeringId: p.offering_id,
    startAt: p.start_at,
    endAt: p.end_at || null,
    dateLabel: toNullableString(p.date_label),
    capacityTotal: toNumber(p.capacity_total, 0),
    capacityTaken: toNumber(p.capacity_taken, 0),
    priceOverride: toNullableNumber(p.price_override),
    status: p.status || "open",
    locationLabel: toNullableString(p.location_label),
    notes: toNullableString(p.notes),
    enabled: toBoolean(p.enabled, true),
  });
}

async function slotUpdate(db, cfg, p) {
  if (!p.slot_id)
    throw Object.assign(new Error("slot_id is required"), { status: 400 });

  const u = {};
  if (p.offering_id !== undefined) u.offeringId = p.offering_id;
  if (p.start_at !== undefined) u.startAt = p.start_at;
  if (p.end_at !== undefined) u.endAt = p.end_at || null;
  if (p.date_label !== undefined) u.dateLabel = toNullableString(p.date_label);
  if (p.capacity_total !== undefined) u.capacityTotal = toNumber(p.capacity_total, 0);
  if (p.capacity_taken !== undefined) u.capacityTaken = toNumber(p.capacity_taken, 0);
  if (p.price_override !== undefined) u.priceOverride = toNullableNumber(p.price_override);
  if (p.status !== undefined) u.status = p.status;
  if (p.location_label !== undefined) u.locationLabel = toNullableString(p.location_label);
  if (p.notes !== undefined) u.notes = toNullableString(p.notes);
  if (p.enabled !== undefined) u.enabled = toBoolean(p.enabled, true);

  return db.updateDocument(cfg.databaseId, cfg.collections.slots, p.slot_id, u);
}

async function slotToggle(db, cfg, p) {
  if (!p.slot_id)
    throw Object.assign(new Error("slot_id is required"), { status: 400 });

  return db.updateDocument(cfg.databaseId, cfg.collections.slots, p.slot_id, {
    enabled: toBoolean(p.enabled, true),
  });
}

async function slotCancel(db, cfg, p) {
  if (!p.slot_id)
    throw Object.assign(new Error("slot_id is required"), { status: 400 });

  return db.updateDocument(cfg.databaseId, cfg.collections.slots, p.slot_id, {
    status: "cancelled",
  });
}

async function slotDelete(db, cfg, p) {
  if (!p.slot_id)
    throw Object.assign(new Error("slot_id is required"), { status: 400 });

  const bookingsCount = await countDocuments(db, cfg.databaseId, cfg.collections.bookings, [
    Query.equal("slotId", p.slot_id),
  ]);
  if (bookingsCount > 0)
    throw Object.assign(
      new Error("No se puede eliminar el slot porque tiene reservas asociadas."),
      { status: 409 },
    );

  await db.deleteDocument(cfg.databaseId, cfg.collections.slots, p.slot_id);
  return { $id: p.slot_id };
}

// ── Availability Blocks ──────────────────────────────────────────────────────

async function blockCreate(db, cfg, p) {
  if (!p.start_at)
    throw Object.assign(new Error("start_at is required"), { status: 400 });
  if (!p.end_at)
    throw Object.assign(new Error("end_at is required"), { status: 400 });

  return db.createDocument(cfg.databaseId, cfg.collections.blocks, ID.unique(), {
    offeringId: toNullableString(p.offering_id),
    startAt: p.start_at,
    endAt: p.end_at,
    reason: toNullableString(p.reason),
    blockType: p.block_type || "custom",
    enabled: toBoolean(p.enabled, true),
  });
}

async function blockUpdate(db, cfg, p) {
  if (!p.block_id)
    throw Object.assign(new Error("block_id is required"), { status: 400 });

  const u = {};
  if (p.offering_id !== undefined) u.offeringId = toNullableString(p.offering_id);
  if (p.start_at !== undefined) u.startAt = p.start_at;
  if (p.end_at !== undefined) u.endAt = p.end_at;
  if (p.reason !== undefined) u.reason = toNullableString(p.reason);
  if (p.block_type !== undefined) u.blockType = p.block_type;
  if (p.enabled !== undefined) u.enabled = toBoolean(p.enabled, true);

  return db.updateDocument(cfg.databaseId, cfg.collections.blocks, p.block_id, u);
}

async function blockDelete(db, cfg, p) {
  if (!p.block_id)
    throw Object.assign(new Error("block_id is required"), { status: 400 });

  await db.deleteDocument(cfg.databaseId, cfg.collections.blocks, p.block_id);
  return { $id: p.block_id };
}

// ── Content Sections ─────────────────────────────────────────────────────────

async function contentCreate(db, cfg, p) {
  if (!p.section_key)
    throw Object.assign(new Error("section_key is required"), { status: 400 });

  return db.createDocument(cfg.databaseId, cfg.collections.sections, ID.unique(), {
    sectionKey: p.section_key,
    titleEs: toNullableString(p.title_es),
    titleEn: toNullableString(p.title_en),
    subtitleEs: toNullableString(p.subtitle_es),
    subtitleEn: toNullableString(p.subtitle_en),
    bodyEs: toNullableString(p.body_es),
    bodyEn: toNullableString(p.body_en),
    ctaLabelEs: toNullableString(p.cta_label_es),
    ctaLabelEn: toNullableString(p.cta_label_en),
    ctaUrl: toNullableString(p.cta_url),
    imageId: toNullableString(p.image_id),
    imageBucket: toNullableString(p.image_bucket),
    displayOrder: toNumber(p.display_order, 0),
    enabled: toBoolean(p.enabled, true),
  });
}

async function contentUpdate(db, cfg, p) {
  if (!p.section_id)
    throw Object.assign(new Error("section_id is required"), { status: 400 });

  const u = {};
  if (p.section_key !== undefined) u.sectionKey = p.section_key;
  if (p.title_es !== undefined) u.titleEs = toNullableString(p.title_es);
  if (p.title_en !== undefined) u.titleEn = toNullableString(p.title_en);
  if (p.subtitle_es !== undefined) u.subtitleEs = toNullableString(p.subtitle_es);
  if (p.subtitle_en !== undefined) u.subtitleEn = toNullableString(p.subtitle_en);
  if (p.body_es !== undefined) u.bodyEs = toNullableString(p.body_es);
  if (p.body_en !== undefined) u.bodyEn = toNullableString(p.body_en);
  if (p.cta_label_es !== undefined) u.ctaLabelEs = toNullableString(p.cta_label_es);
  if (p.cta_label_en !== undefined) u.ctaLabelEn = toNullableString(p.cta_label_en);
  if (p.cta_url !== undefined) u.ctaUrl = toNullableString(p.cta_url);
  if (p.image_id !== undefined) u.imageId = toNullableString(p.image_id);
  if (p.image_bucket !== undefined) u.imageBucket = toNullableString(p.image_bucket);
  if (p.display_order !== undefined) u.displayOrder = toNumber(p.display_order, 0);
  if (p.enabled !== undefined) u.enabled = toBoolean(p.enabled, true);

  return db.updateDocument(cfg.databaseId, cfg.collections.sections, p.section_id, u);
}

async function contentToggle(db, cfg, p) {
  if (!p.section_id)
    throw Object.assign(new Error("section_id is required"), { status: 400 });

  return db.updateDocument(cfg.databaseId, cfg.collections.sections, p.section_id, {
    enabled: toBoolean(p.enabled, true),
  });
}

async function contentDelete(db, cfg, p) {
  if (!p.section_id)
    throw Object.assign(new Error("section_id is required"), { status: 400 });

  await db.deleteDocument(cfg.databaseId, cfg.collections.sections, p.section_id);
  return { $id: p.section_id };
}

// ── Operation dispatch ───────────────────────────────────────────────────────

const operationHandlers = {
  "offering.create": offeringCreate,
  "offering.update": offeringUpdate,
  "offering.toggle": offeringToggle,
  "offering.delete": offeringDelete,
  "slot.create": slotCreate,
  "slot.update": slotUpdate,
  "slot.toggle": slotToggle,
  "slot.cancel": slotCancel,
  "slot.delete": slotDelete,
  "block.create": blockCreate,
  "block.update": blockUpdate,
  "block.delete": blockDelete,
  "content.create": contentCreate,
  "content.update": contentUpdate,
  "content.toggle": contentToggle,
  "content.delete": contentDelete,
};

export default async ({ req, res, log, error }) => {
  try {
    if ((req.method || "POST").toUpperCase() !== "POST") {
      return res.json({ ok: false, message: "Method not allowed" }, 405);
    }

    const callerUserId = req.headers?.["x-appwrite-user-id"];
    if (!callerUserId) {
      return res.json({ ok: false, message: "Unauthorized" }, 401);
    }

    const cfg = readEnv();

    const client = new Client()
      .setEndpoint(cfg.endpoint)
      .setProject(cfg.projectId)
      .setKey(cfg.apiKey);

    const db = new Databases(client);
    const users = new Users(client);

    await requireAdmin(users, callerUserId);

    const body = parseBody(req.body);
    const operation = body.operation;
    const payload = body.payload ?? {};

    const handler = operationHandlers[operation];
    if (!handler) {
      return res.json({ ok: false, message: "Unsupported operation" }, 400);
    }

    const data = await handler(db, cfg, payload);
    log(`[admin-write-offerings] ${operation} by ${callerUserId}`);
    return res.json({ ok: true, operation, data }, 200);
  } catch (err) {
    const status = err?.status || 500;
    const message = status >= 500 ? "Internal server error" : err.message;
    error(`[admin-write-offerings] ${err?.message || "Unknown error"}`);
    return res.json({ ok: false, message }, status);
  }
};
