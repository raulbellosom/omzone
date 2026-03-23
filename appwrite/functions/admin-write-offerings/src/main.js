import { Client, Databases, ID, Query, Users } from "node-appwrite";

const FLOW_CONFIG_MAX_LENGTH = 3000;
const TERMS_CONFIG_MAX_LENGTH = 1700;

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

function toJsonString(value, fallback = null) {
  if (value === undefined) return fallback;
  if (value === null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
}

function toBoundedJsonString(
  value,
  { fallback = null, maxLength = 0, field = "json" } = {},
) {
  const serialized = toJsonString(value, fallback);
  if (
    typeof serialized === "string" &&
    Number.isFinite(maxLength) &&
    maxLength > 0 &&
    serialized.length > maxLength
  ) {
    throw Object.assign(
      new Error(`${field} exceeds maximum allowed length (${maxLength}).`),
      { status: 400 },
    );
  }
  return serialized;
}

function parseJsonMaybe(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  if (typeof value !== "string") return fallback;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function mergeSection(base = {}, override = {}) {
  return { ...base, ...(override ?? {}) };
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

function defaultFlowTemplate(category, type) {
  const byKey = {
    "wellness_studio:session": {
      flow_key: "wellness_studio.session",
      booking: {
        mode: "scheduled",
        requires_schedule: true,
        supports_date_range: false,
      },
      pricing: { mode: "fixed_price", base_price: 0 },
      schedule: { duration_min: 60 },
      guest_policy: { min_per_booking: 1, max_per_booking: 8 },
    },
    "wellness_studio:program": {
      flow_key: "wellness_studio.program",
      booking: {
        mode: "scheduled",
        requires_schedule: true,
        supports_date_range: true,
      },
      pricing: { mode: "from_price", base_price: 0 },
      schedule: { duration_min: 90 },
      guest_policy: { min_per_booking: 1, max_per_booking: 12 },
    },
    "immersion:immersion": {
      flow_key: "immersion.immersion",
      booking: {
        mode: "scheduled",
        requires_schedule: true,
        supports_date_range: true,
      },
      pricing: { mode: "from_price", base_price: 0 },
      schedule: { duration_min: 180 },
      guest_policy: { min_per_booking: 1, max_per_booking: 20 },
    },
    "service:service": {
      flow_key: "service.service",
      booking: {
        mode: "request_only",
        requires_schedule: false,
        supports_date_range: true,
      },
      pricing: { mode: "request_quote", base_price: null },
      schedule: { duration_min: null },
      guest_policy: { min_per_booking: 1, max_per_booking: 6 },
    },
    "stay:stay": {
      flow_key: "stay.stay",
      booking: {
        mode: "date_range",
        requires_schedule: false,
        supports_date_range: true,
      },
      pricing: { mode: "from_price", base_price: 0 },
      schedule: { duration_min: null },
      guest_policy: { min_per_booking: 1, max_per_booking: 12 },
    },
    "experience:experience": {
      flow_key: "experience.experience",
      booking: {
        mode: "request_only",
        requires_schedule: false,
        supports_date_range: true,
      },
      pricing: { mode: "from_price", base_price: 0 },
      schedule: { duration_min: null },
      guest_policy: { min_per_booking: 1, max_per_booking: 10 },
    },
  };

  const fallback = byKey["service:service"];
  const template = byKey[`${category ?? ""}:${type ?? ""}`] ?? fallback;

  return {
    flow_key: template.flow_key,
    flow_version: 1,
    flow_config: {
      booking: template.booking,
      pricing: template.pricing,
      schedule: template.schedule,
      guest_policy: template.guest_policy,
      location: {
        default_location_profile_id: null,
        fallback_label: null,
      },
      custom_answers: [],
    },
    terms_config: {
      cancellation_policy_es: "",
      cancellation_policy_en: "",
      booking_terms_es: "",
      booking_terms_en: "",
      included_es: "",
      included_en: "",
    },
  };
}

function normalizeFlowPayload(payload, currentDoc = null) {
  const core = payload.core ?? payload;
  const flow = payload.flow ?? {};
  const category = core.category ?? currentDoc?.category ?? null;
  const type = core.type ?? currentDoc?.type ?? null;
  const template = defaultFlowTemplate(category, type);

  const currentFlowConfig = parseJsonMaybe(currentDoc?.flowConfig, {});
  const currentTermsConfig = parseJsonMaybe(currentDoc?.termsConfig, {});

  const incomingFlowConfig =
    flow.flow_config ??
    core.flow_config ??
    (core.flowConfig ? parseJsonMaybe(core.flowConfig, {}) : {}) ??
    {};

  const incomingTermsConfig =
    flow.terms_config ??
    core.terms_config ??
    (core.termsConfig ? parseJsonMaybe(core.termsConfig, {}) : {}) ??
    {};

  const legacyBookingMode = core.booking_mode ?? currentDoc?.bookingMode;
  const legacyPricingMode = core.pricing_mode ?? currentDoc?.pricingMode;
  const legacyBasePrice =
    core.base_price ?? core.basePrice ?? currentDoc?.basePrice ?? null;
  const legacyDuration =
    core.duration_min ?? core.durationMin ?? currentDoc?.durationMin ?? null;
  const legacyMinGuests =
    core.min_guests ?? core.minGuests ?? currentDoc?.minGuests ?? null;
  const legacyMaxGuests =
    core.max_guests ?? core.maxGuests ?? currentDoc?.maxGuests ?? null;
  const legacyLocationLabel =
    core.location_label ??
    core.locationLabel ??
    currentDoc?.locationLabel ??
    null;

  const normalizedFlowConfig = {
    ...template.flow_config,
    ...currentFlowConfig,
    ...incomingFlowConfig,
    booking: mergeSection(
      mergeSection(template.flow_config.booking, currentFlowConfig.booking),
      incomingFlowConfig.booking,
    ),
    pricing: mergeSection(
      mergeSection(template.flow_config.pricing, currentFlowConfig.pricing),
      incomingFlowConfig.pricing,
    ),
    schedule: mergeSection(
      mergeSection(template.flow_config.schedule, currentFlowConfig.schedule),
      incomingFlowConfig.schedule,
    ),
    guest_policy: mergeSection(
      mergeSection(
        template.flow_config.guest_policy,
        currentFlowConfig.guest_policy,
      ),
      incomingFlowConfig.guest_policy,
    ),
    location: mergeSection(
      mergeSection(template.flow_config.location, currentFlowConfig.location),
      incomingFlowConfig.location,
    ),
    custom_answers: Array.isArray(incomingFlowConfig.custom_answers)
      ? incomingFlowConfig.custom_answers
      : Array.isArray(currentFlowConfig.custom_answers)
        ? currentFlowConfig.custom_answers
        : template.flow_config.custom_answers,
  };

  if (legacyBookingMode !== undefined && legacyBookingMode !== null) {
    normalizedFlowConfig.booking.mode = legacyBookingMode;
  }
  if (legacyPricingMode !== undefined && legacyPricingMode !== null) {
    normalizedFlowConfig.pricing.mode = legacyPricingMode;
  }
  if (legacyBasePrice !== undefined) {
    normalizedFlowConfig.pricing.base_price = toNullableNumber(legacyBasePrice);
  }
  if (legacyDuration !== undefined) {
    normalizedFlowConfig.schedule.duration_min =
      toNullableNumber(legacyDuration);
  }
  if (legacyMinGuests !== undefined && legacyMinGuests !== null) {
    normalizedFlowConfig.guest_policy.min_per_booking = Math.max(
      1,
      toNumber(legacyMinGuests, 1),
    );
  }
  if (legacyMaxGuests !== undefined && legacyMaxGuests !== null) {
    normalizedFlowConfig.guest_policy.max_per_booking = Math.max(
      normalizedFlowConfig.guest_policy.min_per_booking ?? 1,
      toNumber(
        legacyMaxGuests,
        normalizedFlowConfig.guest_policy.min_per_booking ?? 1,
      ),
    );
  }
  if (legacyLocationLabel !== undefined && legacyLocationLabel !== null) {
    normalizedFlowConfig.location.fallback_label =
      toNullableString(legacyLocationLabel);
  }

  const normalizedTerms = {
    ...template.terms_config,
    ...currentTermsConfig,
    ...incomingTermsConfig,
  };

  return {
    flowKey:
      flow.flow_key ??
      core.flow_key ??
      core.flowKey ??
      currentDoc?.flowKey ??
      template.flow_key,
    flowVersion: toNumber(
      flow.flow_version ??
        core.flow_version ??
        core.flowVersion ??
        currentDoc?.flowVersion,
      template.flow_version,
    ),
    flowConfig: normalizedFlowConfig,
    termsConfig: normalizedTerms,
    defaultLocationProfileId:
      core.default_location_profile_id ??
      core.defaultLocationProfileId ??
      normalizedFlowConfig.location?.default_location_profile_id ??
      currentDoc?.defaultLocationProfileId ??
      null,
  };
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
      locations: process.env.APPWRITE_COLLECTION_LOCATION_PROFILES_ID,
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
  if (!env.collections.locations)
    missing.push("APPWRITE_COLLECTION_LOCATION_PROFILES_ID");
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

// -- Offerings ----------------------------------------------------------------

async function offeringCreate(db, cfg, p) {
  const core = p.core ?? p;
  const flowPayload = normalizeFlowPayload(p, null);

  return db.createDocument(
    cfg.databaseId,
    cfg.collections.offerings,
    ID.unique(),
    {
      slug: slugify(firstFilled(core.slug, core.title_es, core.title_en)),
      titleEs: core.title_es,
      titleEn: core.title_en,
      summaryEs: toNullableString(core.summary_es),
      summaryEn: toNullableString(core.summary_en),
      descriptionEs: toNullableString(core.description_es),
      descriptionEn: toNullableString(core.description_en),
      category: core.category,
      type: core.type,
      yogaStyle: toNullableString(core.yoga_style),
      currency: core.currency || "MXN",
      ctaLabelEs: toNullableString(core.cta_label_es),
      ctaLabelEn: toNullableString(core.cta_label_en),
      badgesJson: toNullableString(core.badges_json),
      isFeatured: toBoolean(core.is_featured, false),
      showOnHome: toBoolean(core.show_on_home, false),
      displayOrder: toNumber(core.display_order, 0),
      status: core.status || "draft",
      enabled: toBoolean(core.enabled, true),
      flowKey: flowPayload.flowKey,
      flowVersion: flowPayload.flowVersion,
      flowConfig: toBoundedJsonString(flowPayload.flowConfig, {
        fallback: null,
        maxLength: FLOW_CONFIG_MAX_LENGTH,
        field: "flowConfig",
      }),
      termsConfig: toBoundedJsonString(flowPayload.termsConfig, {
        fallback: null,
        maxLength: TERMS_CONFIG_MAX_LENGTH,
        field: "termsConfig",
      }),
      defaultLocationProfileId: toNullableString(
        flowPayload.defaultLocationProfileId,
      ),
    },
  );
}

async function offeringUpdate(db, cfg, p) {
  const core = p.core ?? p;
  if (!core.offering_id)
    throw Object.assign(new Error("offering_id is required"), { status: 400 });

  const currentDoc = await db.getDocument(
    cfg.databaseId,
    cfg.collections.offerings,
    core.offering_id,
  );

  const flowPayload = normalizeFlowPayload(p, currentDoc);

  const u = {};
  if (core.slug !== undefined)
    u.slug = slugify(firstFilled(core.slug, core.title_es, core.title_en));
  if (core.title_es !== undefined) u.titleEs = core.title_es;
  if (core.title_en !== undefined) u.titleEn = core.title_en;
  if (core.summary_es !== undefined)
    u.summaryEs = toNullableString(core.summary_es);
  if (core.summary_en !== undefined)
    u.summaryEn = toNullableString(core.summary_en);
  if (core.description_es !== undefined)
    u.descriptionEs = toNullableString(core.description_es);
  if (core.description_en !== undefined)
    u.descriptionEn = toNullableString(core.description_en);
  if (core.category !== undefined) u.category = core.category;
  if (core.type !== undefined) u.type = core.type;
  if (core.yoga_style !== undefined)
    u.yogaStyle = toNullableString(core.yoga_style);
  if (core.currency !== undefined) u.currency = core.currency;
  if (core.cta_label_es !== undefined)
    u.ctaLabelEs = toNullableString(core.cta_label_es);
  if (core.cta_label_en !== undefined)
    u.ctaLabelEn = toNullableString(core.cta_label_en);
  if (core.badges_json !== undefined)
    u.badgesJson = toNullableString(core.badges_json);
  if (core.is_featured !== undefined)
    u.isFeatured = toBoolean(core.is_featured, false);
  if (core.show_on_home !== undefined)
    u.showOnHome = toBoolean(core.show_on_home, false);
  if (core.display_order !== undefined)
    u.displayOrder = toNumber(core.display_order, 0);
  if (core.status !== undefined) u.status = core.status;
  if (core.enabled !== undefined) u.enabled = toBoolean(core.enabled, true);

  if (
    p.flow !== undefined ||
    core.flow_config !== undefined ||
    core.flowConfig !== undefined ||
    core.flow_key !== undefined ||
    core.flowKey !== undefined ||
    core.default_location_profile_id !== undefined ||
    core.defaultLocationProfileId !== undefined ||
    core.terms_config !== undefined ||
    core.termsConfig !== undefined ||
    core.booking_mode !== undefined ||
    core.pricing_mode !== undefined ||
    core.base_price !== undefined ||
    core.duration_min !== undefined ||
    core.min_guests !== undefined ||
    core.max_guests !== undefined ||
    core.location_label !== undefined
  ) {
    u.flowKey = flowPayload.flowKey;
    u.flowVersion = flowPayload.flowVersion;
    u.flowConfig = toBoundedJsonString(flowPayload.flowConfig, {
      fallback: null,
      maxLength: FLOW_CONFIG_MAX_LENGTH,
      field: "flowConfig",
    });
    u.termsConfig = toBoundedJsonString(flowPayload.termsConfig, {
      fallback: null,
      maxLength: TERMS_CONFIG_MAX_LENGTH,
      field: "termsConfig",
    });
    u.defaultLocationProfileId = toNullableString(
      flowPayload.defaultLocationProfileId,
    );
  }

  return db.updateDocument(
    cfg.databaseId,
    cfg.collections.offerings,
    core.offering_id,
    u,
  );
}

async function offeringToggle(db, cfg, p) {
  const core = p.core ?? p;
  if (!core.offering_id)
    throw Object.assign(new Error("offering_id is required"), { status: 400 });

  return db.updateDocument(
    cfg.databaseId,
    cfg.collections.offerings,
    core.offering_id,
    {
      enabled: toBoolean(core.enabled, true),
    },
  );
}

async function offeringDelete(db, cfg, p) {
  const core = p.core ?? p;
  if (!core.offering_id)
    throw Object.assign(new Error("offering_id is required"), { status: 400 });

  const slotsCount = await countDocuments(
    db,
    cfg.databaseId,
    cfg.collections.slots,
    [Query.equal("offeringId", core.offering_id)],
  );
  if (slotsCount > 0)
    throw Object.assign(
      new Error(
        "No se puede eliminar el offering porque tiene slots asociados.",
      ),
      { status: 409 },
    );

  const bookingsCount = await countDocuments(
    db,
    cfg.databaseId,
    cfg.collections.bookings,
    [Query.equal("offeringId", core.offering_id)],
  );
  if (bookingsCount > 0)
    throw Object.assign(
      new Error(
        "No se puede eliminar el offering porque tiene reservas asociadas.",
      ),
      { status: 409 },
    );

  await db.deleteDocument(
    cfg.databaseId,
    cfg.collections.offerings,
    core.offering_id,
  );
  return { $id: core.offering_id };
}

// -- Offering Slots -----------------------------------------------------------

async function slotCreate(db, cfg, p) {
  const core = p.core ?? p;
  if (!core.offering_id)
    throw Object.assign(new Error("offering_id is required"), { status: 400 });
  if (!core.start_at)
    throw Object.assign(new Error("start_at is required"), { status: 400 });

  return db.createDocument(cfg.databaseId, cfg.collections.slots, ID.unique(), {
    offeringId: core.offering_id,
    startAt: core.start_at,
    endAt: core.end_at || null,
    dateLabel: toNullableString(core.date_label),
    capacityTotal: toNumber(core.capacity_total, 0),
    capacityTaken: toNumber(core.capacity_taken, 0),
    priceOverride: toNullableNumber(core.price_override),
    status: core.status || "open",
    locationProfileId: toNullableString(core.location_profile_id),
    notes: toNullableString(core.notes),
    enabled: toBoolean(core.enabled, true),
  });
}

async function slotUpdate(db, cfg, p) {
  const core = p.core ?? p;
  if (!core.slot_id)
    throw Object.assign(new Error("slot_id is required"), { status: 400 });

  const u = {};
  if (core.offering_id !== undefined) u.offeringId = core.offering_id;
  if (core.start_at !== undefined) u.startAt = core.start_at;
  if (core.end_at !== undefined) u.endAt = core.end_at || null;
  if (core.date_label !== undefined)
    u.dateLabel = toNullableString(core.date_label);
  if (core.capacity_total !== undefined)
    u.capacityTotal = toNumber(core.capacity_total, 0);
  if (core.capacity_taken !== undefined)
    u.capacityTaken = toNumber(core.capacity_taken, 0);
  if (core.price_override !== undefined)
    u.priceOverride = toNullableNumber(core.price_override);
  if (core.status !== undefined) u.status = core.status;
  if (core.location_profile_id !== undefined)
    u.locationProfileId = toNullableString(core.location_profile_id);
  if (core.notes !== undefined) u.notes = toNullableString(core.notes);
  if (core.enabled !== undefined) u.enabled = toBoolean(core.enabled, true);

  return db.updateDocument(
    cfg.databaseId,
    cfg.collections.slots,
    core.slot_id,
    u,
  );
}

async function slotToggle(db, cfg, p) {
  const core = p.core ?? p;
  if (!core.slot_id)
    throw Object.assign(new Error("slot_id is required"), { status: 400 });

  return db.updateDocument(
    cfg.databaseId,
    cfg.collections.slots,
    core.slot_id,
    {
      enabled: toBoolean(core.enabled, true),
    },
  );
}

async function slotCancel(db, cfg, p) {
  const core = p.core ?? p;
  if (!core.slot_id)
    throw Object.assign(new Error("slot_id is required"), { status: 400 });

  return db.updateDocument(
    cfg.databaseId,
    cfg.collections.slots,
    core.slot_id,
    {
      status: "cancelled",
    },
  );
}

async function slotDelete(db, cfg, p) {
  const core = p.core ?? p;
  if (!core.slot_id)
    throw Object.assign(new Error("slot_id is required"), { status: 400 });

  const bookingsCount = await countDocuments(
    db,
    cfg.databaseId,
    cfg.collections.bookings,
    [Query.equal("slotId", core.slot_id)],
  );
  if (bookingsCount > 0)
    throw Object.assign(
      new Error(
        "No se puede eliminar el slot porque tiene reservas asociadas.",
      ),
      { status: 409 },
    );

  await db.deleteDocument(cfg.databaseId, cfg.collections.slots, core.slot_id);
  return { $id: core.slot_id };
}

// -- Location Profiles -------------------------------------------------------

async function locationCreate(db, cfg, p) {
  const core = p.core ?? p;
  return db.createDocument(
    cfg.databaseId,
    cfg.collections.locations,
    ID.unique(),
    {
      name: toNullableString(core.name),
      address: toNullableString(core.address),
      mapUrl: toNullableString(core.map_url),
      geoJson: toJsonString(core.geo_json, null),
      notes: toNullableString(core.notes),
      capacityHintsJson: toJsonString(core.capacity_hints_json, null),
      enabled: toBoolean(core.enabled, true),
    },
  );
}

async function locationUpdate(db, cfg, p) {
  const core = p.core ?? p;
  if (!core.location_profile_id) {
    throw Object.assign(new Error("location_profile_id is required"), {
      status: 400,
    });
  }

  const u = {};
  if (core.name !== undefined) u.name = toNullableString(core.name);
  if (core.address !== undefined) u.address = toNullableString(core.address);
  if (core.map_url !== undefined) u.mapUrl = toNullableString(core.map_url);
  if (core.geo_json !== undefined)
    u.geoJson = toJsonString(core.geo_json, null);
  if (core.notes !== undefined) u.notes = toNullableString(core.notes);
  if (core.capacity_hints_json !== undefined)
    u.capacityHintsJson = toJsonString(core.capacity_hints_json, null);
  if (core.enabled !== undefined) u.enabled = toBoolean(core.enabled, true);

  return db.updateDocument(
    cfg.databaseId,
    cfg.collections.locations,
    core.location_profile_id,
    u,
  );
}

async function locationDelete(db, cfg, p) {
  const core = p.core ?? p;
  if (!core.location_profile_id) {
    throw Object.assign(new Error("location_profile_id is required"), {
      status: 400,
    });
  }

  const offeringCount = await countDocuments(
    db,
    cfg.databaseId,
    cfg.collections.offerings,
    [Query.equal("defaultLocationProfileId", core.location_profile_id)],
  );

  const slotCount = await countDocuments(
    db,
    cfg.databaseId,
    cfg.collections.slots,
    [Query.equal("locationProfileId", core.location_profile_id)],
  );

  if (offeringCount > 0 || slotCount > 0) {
    throw Object.assign(
      new Error(
        "No se puede eliminar la ubicacion porque esta asociada a offerings o slots.",
      ),
      { status: 409 },
    );
  }

  await db.deleteDocument(
    cfg.databaseId,
    cfg.collections.locations,
    core.location_profile_id,
  );
  return { $id: core.location_profile_id };
}

// -- Availability Blocks ------------------------------------------------------

async function blockCreate(db, cfg, p) {
  const core = p.core ?? p;
  if (!core.start_at)
    throw Object.assign(new Error("start_at is required"), { status: 400 });
  if (!core.end_at)
    throw Object.assign(new Error("end_at is required"), { status: 400 });

  return db.createDocument(
    cfg.databaseId,
    cfg.collections.blocks,
    ID.unique(),
    {
      offeringId: toNullableString(core.offering_id),
      startAt: core.start_at,
      endAt: core.end_at,
      reason: toNullableString(core.reason),
      blockType: core.block_type || "custom",
      enabled: toBoolean(core.enabled, true),
    },
  );
}

async function blockUpdate(db, cfg, p) {
  const core = p.core ?? p;
  if (!core.block_id)
    throw Object.assign(new Error("block_id is required"), { status: 400 });

  const u = {};
  if (core.offering_id !== undefined)
    u.offeringId = toNullableString(core.offering_id);
  if (core.start_at !== undefined) u.startAt = core.start_at;
  if (core.end_at !== undefined) u.endAt = core.end_at;
  if (core.reason !== undefined) u.reason = toNullableString(core.reason);
  if (core.block_type !== undefined) u.blockType = core.block_type;
  if (core.enabled !== undefined) u.enabled = toBoolean(core.enabled, true);

  return db.updateDocument(
    cfg.databaseId,
    cfg.collections.blocks,
    core.block_id,
    u,
  );
}

async function blockDelete(db, cfg, p) {
  const core = p.core ?? p;
  if (!core.block_id)
    throw Object.assign(new Error("block_id is required"), { status: 400 });

  await db.deleteDocument(
    cfg.databaseId,
    cfg.collections.blocks,
    core.block_id,
  );
  return { $id: core.block_id };
}

// -- Content Sections ---------------------------------------------------------

async function contentCreate(db, cfg, p) {
  const core = p.core ?? p;
  if (!core.section_key)
    throw Object.assign(new Error("section_key is required"), { status: 400 });

  return db.createDocument(
    cfg.databaseId,
    cfg.collections.sections,
    ID.unique(),
    {
      sectionKey: core.section_key,
      titleEs: toNullableString(core.title_es),
      titleEn: toNullableString(core.title_en),
      subtitleEs: toNullableString(core.subtitle_es),
      subtitleEn: toNullableString(core.subtitle_en),
      bodyEs: toNullableString(core.body_es),
      bodyEn: toNullableString(core.body_en),
      ctaLabelEs: toNullableString(core.cta_label_es),
      ctaLabelEn: toNullableString(core.cta_label_en),
      ctaUrl: toNullableString(core.cta_url),
      imagesJson: toNullableString(core.images_json),
      scope: core.scope || "global",
      offeringId: toNullableString(core.offering_id),
      displayOrder: toNumber(core.display_order, 0),
      enabled: toBoolean(core.enabled, true),
    },
  );
}

async function contentUpdate(db, cfg, p) {
  const core = p.core ?? p;
  if (!core.section_id)
    throw Object.assign(new Error("section_id is required"), { status: 400 });

  const u = {};
  if (core.section_key !== undefined) u.sectionKey = core.section_key;
  if (core.title_es !== undefined) u.titleEs = toNullableString(core.title_es);
  if (core.title_en !== undefined) u.titleEn = toNullableString(core.title_en);
  if (core.subtitle_es !== undefined)
    u.subtitleEs = toNullableString(core.subtitle_es);
  if (core.subtitle_en !== undefined)
    u.subtitleEn = toNullableString(core.subtitle_en);
  if (core.body_es !== undefined) u.bodyEs = toNullableString(core.body_es);
  if (core.body_en !== undefined) u.bodyEn = toNullableString(core.body_en);
  if (core.cta_label_es !== undefined)
    u.ctaLabelEs = toNullableString(core.cta_label_es);
  if (core.cta_label_en !== undefined)
    u.ctaLabelEn = toNullableString(core.cta_label_en);
  if (core.cta_url !== undefined) u.ctaUrl = toNullableString(core.cta_url);
  if (core.images_json !== undefined)
    u.imagesJson = toNullableString(core.images_json);
  if (core.scope !== undefined) u.scope = core.scope || "global";
  if (core.offering_id !== undefined)
    u.offeringId = toNullableString(core.offering_id);
  if (core.display_order !== undefined)
    u.displayOrder = toNumber(core.display_order, 0);
  if (core.enabled !== undefined) u.enabled = toBoolean(core.enabled, true);

  return db.updateDocument(
    cfg.databaseId,
    cfg.collections.sections,
    core.section_id,
    u,
  );
}

async function contentToggle(db, cfg, p) {
  const core = p.core ?? p;
  if (!core.section_id)
    throw Object.assign(new Error("section_id is required"), { status: 400 });

  return db.updateDocument(
    cfg.databaseId,
    cfg.collections.sections,
    core.section_id,
    {
      enabled: toBoolean(core.enabled, true),
    },
  );
}

async function contentDelete(db, cfg, p) {
  const core = p.core ?? p;
  if (!core.section_id)
    throw Object.assign(new Error("section_id is required"), { status: 400 });

  await db.deleteDocument(
    cfg.databaseId,
    cfg.collections.sections,
    core.section_id,
  );
  return { $id: core.section_id };
}

// -- Booking -----------------------------------------------------------------

function nextBookingCode() {
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `BK-${Date.now().toString().slice(-6)}-${random}`;
}

async function bookingCreate(db, cfg, p, callerUserId) {
  const core = p.core ?? p;
  if (!core.offering_id) {
    throw Object.assign(new Error("offering_id is required"), { status: 400 });
  }

  const offering = await db.getDocument(
    cfg.databaseId,
    cfg.collections.offerings,
    core.offering_id,
  );

  const flowConfig = parseJsonMaybe(offering.flowConfig, {});
  const bookingMode = flowConfig?.booking?.mode ?? "request_only";
  const requiresSchedule = flowConfig?.booking?.requires_schedule === true;

  let slot = null;
  if (core.slot_id) {
    slot = await db.getDocument(
      cfg.databaseId,
      cfg.collections.slots,
      core.slot_id,
    );
    if (slot.offeringId !== core.offering_id) {
      throw Object.assign(new Error("slot_id does not belong to offering_id"), {
        status: 400,
      });
    }
    if (slot.status !== "open" || slot.enabled === false) {
      throw Object.assign(new Error("The selected slot is not available"), {
        status: 409,
      });
    }
  }

  if (requiresSchedule && !slot) {
    throw Object.assign(new Error("slot_id is required for this offering"), {
      status: 400,
    });
  }

  const guestCount = Math.max(1, toNumber(core.guest_count, 1));
  if (slot && slot.capacityTotal > 0) {
    const available = Math.max(
      0,
      slot.capacityTotal - (slot.capacityTaken ?? 0),
    );
    if (guestCount > available) {
      throw Object.assign(
        new Error("No hay cupo suficiente en el slot seleccionado."),
        {
          status: 409,
        },
      );
    }
  }

  const slotPrice = slot?.priceOverride ?? null;
  const flowBasePrice = toNullableNumber(flowConfig?.pricing?.base_price);
  const unitPrice =
    toNullableNumber(core.unit_price) ?? slotPrice ?? flowBasePrice ?? 0;

  const now = nowISO();
  const status =
    core.status ||
    (bookingMode === "request_only" || bookingMode === "date_range"
      ? "pending"
      : "confirmed");

  const pricingSnapshot = {
    booking_mode: bookingMode,
    pricing_mode: flowConfig?.pricing?.mode ?? null,
    flow_base_price: flowBasePrice,
    slot_price_override: slotPrice,
    unit_price: unitPrice,
    currency: offering.currency ?? "MXN",
    guest_count: guestCount,
    created_at: now,
    ...parseJsonMaybe(core.pricing_snapshot, {}),
  };

  const customAnswers =
    core.custom_answers ??
    parseJsonMaybe(core.custom_answers_json, null) ??
    null;

  const requestData = {
    ...parseJsonMaybe(core.request_data, {}),
    terms_snapshot: parseJsonMaybe(offering.termsConfig, {}),
  };

  const bookingDoc = await db.createDocument(
    cfg.databaseId,
    cfg.collections.bookings,
    ID.unique(),
    {
      clientUserId: callerUserId,
      sessionId: null,
      orderId: toNullableString(core.order_id),
      bookingCode: nextBookingCode(),
      status,
      quantity: guestCount,
      unitPrice: unitPrice,
      extrasJson: toJsonString(core.extras_json ?? null, null),
      reservedAt: now,
      offeringId: core.offering_id,
      slotId: slot?.$id ?? null,
      bookingType: core.booking_type || offering.type || "service",
      guestCount,
      requestDataJson: toJsonString(requestData, null),
      confirmedAt: status === "confirmed" ? now : null,
      pricingSnapshotJson: toJsonString(pricingSnapshot, null),
      customAnswersJson: toJsonString(customAnswers, null),
    },
    [
      `read(\"user:${callerUserId}\")`,
      `update(\"user:${callerUserId}\")`,
      `delete(\"user:${callerUserId}\")`,
      'read(\"label:admin\")',
      'update(\"label:admin\")',
      'read(\"label:root\")',
      'update(\"label:root\")',
    ],
  );

  if (slot && status === "confirmed") {
    const nextTaken = (slot.capacityTaken ?? 0) + guestCount;
    const nextStatus =
      slot.capacityTotal > 0 && nextTaken >= slot.capacityTotal
        ? "full"
        : slot.status;

    await db.updateDocument(cfg.databaseId, cfg.collections.slots, slot.$id, {
      capacityTaken: nextTaken,
      status: nextStatus,
    });
  }

  return bookingDoc;
}

// -- Operation dispatch -------------------------------------------------------

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
  "location.create": locationCreate,
  "location.update": locationUpdate,
  "location.delete": locationDelete,
  "block.create": blockCreate,
  "block.update": blockUpdate,
  "block.delete": blockDelete,
  "content.create": contentCreate,
  "content.update": contentUpdate,
  "content.toggle": contentToggle,
  "content.delete": contentDelete,
  "booking.create": bookingCreate,
};

const PUBLIC_OPERATIONS = new Set(["booking.create"]);

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

    const body = parseBody(req.body);
    const operation = body.operation;
    const payload = body.payload ?? {};

    const handler = operationHandlers[operation];
    if (!handler) {
      return res.json({ ok: false, message: "Unsupported operation" }, 400);
    }

    if (!PUBLIC_OPERATIONS.has(operation)) {
      await requireAdmin(users, callerUserId);
    }

    const data = await handler(db, cfg, payload, callerUserId);
    log(`[admin-write-offerings] ${operation} by ${callerUserId}`);
    return res.json({ ok: true, operation, data }, 200);
  } catch (err) {
    const status = err?.status || 500;
    const message = status >= 500 ? "Internal server error" : err.message;
    error(`[admin-write-offerings] ${err?.message || "Unknown error"}`);
    return res.json({ ok: false, message }, status);
  }
};
