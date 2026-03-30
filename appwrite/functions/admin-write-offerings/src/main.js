import { Client, Databases, ID, Query, Users } from "node-appwrite";

const FLOW_CONFIG_MAX_LENGTH = 3000;
const TERMS_CONFIG_MAX_LENGTH = 1700;
const BOOKING_ENGINES = new Set([
  "events",
  "daily_range",
  "hybrid",
  "request_only",
  "date_range",
]);

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

function toBookingEngine(value, fallback = null) {
  if (value === null || value === undefined || value === "") return fallback;
  const normalized = String(value).trim();
  return BOOKING_ENGINES.has(normalized) ? normalized : fallback;
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
        engine: "events",
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
        engine: "events",
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
        engine: "events",
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
        engine: "daily_range",
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
        engine: "daily_range",
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
        mode: "scheduled",
        engine: "events",
        requires_schedule: true,
        supports_date_range: false,
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
  const legacyBookingEngine =
    core.booking_engine ??
    core.bookingEngine ??
    currentFlowConfig?.booking?.engine ??
    null;
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
  if (legacyBookingEngine !== undefined) {
    const inferredEngine =
      toBookingEngine(legacyBookingEngine) ??
      (normalizedFlowConfig.booking.mode === "scheduled"
        ? "events"
        : normalizedFlowConfig.booking.mode === "date_range"
          ? "daily_range"
          : "request_only");
    normalizedFlowConfig.booking.engine = inferredEngine;
  } else if (!normalizedFlowConfig.booking.engine) {
    normalizedFlowConfig.booking.engine =
      normalizedFlowConfig.booking.mode === "scheduled"
        ? "events"
        : normalizedFlowConfig.booking.mode === "date_range"
          ? "daily_range"
          : "request_only";
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
      events:
        process.env.APPWRITE_COLLECTION_SCHEDULE_EVENTS_ID ||
        process.env.APPWRITE_COLLECTION_OFFERING_SLOTS_ID,
      slots: process.env.APPWRITE_COLLECTION_OFFERING_SLOTS_ID,
      locations: process.env.APPWRITE_COLLECTION_LOCATION_PROFILES_ID,
      blocks: process.env.APPWRITE_COLLECTION_AVAILABILITY_BLOCKS_ID,
      sections: process.env.APPWRITE_COLLECTION_CONTENT_SECTIONS_ID,
      bookings: process.env.APPWRITE_COLLECTION_BOOKINGS_ID,
      availabilityRules:
        process.env.APPWRITE_COLLECTION_OFFERING_AVAILABILITY_RULES_ID || null,
      dailyInventory:
        process.env.APPWRITE_COLLECTION_OFFERING_DAILY_INVENTORY_ID || null,
    },
  };

  const missing = [];
  if (!env.projectId) missing.push("APPWRITE_PROJECT_ID");
  if (!env.apiKey) missing.push("APPWRITE_API_KEY");
  if (!env.databaseId) missing.push("APPWRITE_DATABASE_ID");
  if (!env.collections.offerings)
    missing.push("APPWRITE_COLLECTION_OFFERINGS_ID");
  if (!env.collections.events)
    missing.push(
      "APPWRITE_COLLECTION_SCHEDULE_EVENTS_ID or APPWRITE_COLLECTION_OFFERING_SLOTS_ID",
    );
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

function requireCollection(cfg, key, envHint) {
  const value = cfg.collections?.[key];
  if (!value) {
    throw Object.assign(
      new Error(`Missing environment variable: ${envHint}`),
      { status: 500 },
    );
  }
  return value;
}

function toUTCDateStart(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function enumerateRangeDays(checkInValue, checkOutValue) {
  const checkIn = toUTCDateStart(checkInValue);
  const checkOut = toUTCDateStart(checkOutValue);

  if (!checkIn || !checkOut) {
    throw Object.assign(new Error("Invalid check-in/check-out range"), {
      status: 400,
    });
  }
  if (checkOut <= checkIn) {
    throw Object.assign(
      new Error("check_out_date must be greater than check_in_date"),
      { status: 400 },
    );
  }

  const dates = [];
  const cursor = new Date(checkIn);
  while (cursor < checkOut) {
    dates.push(cursor.toISOString());
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return {
    checkInIso: checkIn.toISOString(),
    checkOutIso: checkOut.toISOString(),
    dates,
    nights: dates.length,
  };
}

async function listActiveBlocksInRange(db, cfg, startIso, endIso, offeringId) {
  const res = await db.listDocuments(cfg.databaseId, cfg.collections.blocks, [
    Query.equal("enabled", true),
    Query.lessThan("startAt", endIso),
    Query.greaterThan("endAt", startIso),
    Query.limit(200),
  ]);

  return res.documents.filter((block) => {
    const blockOffering = block.offeringId ?? null;
    return blockOffering === null || blockOffering === offeringId;
  });
}

function parseJsonArray(value, fallback = []) {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

// -- Offerings ----------------------------------------------------------------

async function offeringCreate(db, cfg, p) {
  const core = p.core ?? p;
  const flowPayload = normalizeFlowPayload(p, null);

  // Store images_json inside flowConfig (offerings table has no imagesJson column)
  if (core.images_json !== undefined) {
    flowPayload.flowConfig.images_json = toNullableString(core.images_json);
  }

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

  // Store images_json inside flowConfig (offerings table has no imagesJson column)
  if (core.images_json !== undefined) {
    flowPayload.flowConfig.images_json = toNullableString(core.images_json);
  }

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
    core.booking_engine !== undefined ||
    core.bookingEngine !== undefined ||
    core.pricing_mode !== undefined ||
    core.base_price !== undefined ||
    core.duration_min !== undefined ||
    core.min_guests !== undefined ||
    core.max_guests !== undefined ||
    core.location_label !== undefined ||
    core.images_json !== undefined
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

  const eventsCollection = cfg.collections.events;
  const eventsCount = await countDocuments(
    db,
    cfg.databaseId,
    eventsCollection,
    [Query.equal("offeringId", core.offering_id)],
  );
  if (eventsCount > 0)
    throw Object.assign(
      new Error(
        "No se puede eliminar el offering porque tiene eventos asociados.",
      ),
      { status: 409 },
    );

  if (cfg.collections.slots && cfg.collections.slots !== eventsCollection) {
    const legacySlotsCount = await countDocuments(
      db,
      cfg.databaseId,
      cfg.collections.slots,
      [Query.equal("offeringId", core.offering_id)],
    );
    if (legacySlotsCount > 0) {
      throw Object.assign(
        new Error(
          "No se puede eliminar el offering porque tiene slots legacy asociados.",
        ),
        { status: 409 },
      );
    }
  }

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

// -- Schedule Events ----------------------------------------------------------

async function eventCreate(db, cfg, p) {
  const core = p.core ?? p;
  if (!core.offering_id)
    throw Object.assign(new Error("offering_id is required"), { status: 400 });
  if (!core.start_at)
    throw Object.assign(new Error("start_at is required"), { status: 400 });

  const minGuests = Math.max(1, toNumber(core.min_guests, 1));
  const maxGuests = Math.max(
    minGuests,
    toNumber(core.max_guests, minGuests),
  );

  return db.createDocument(cfg.databaseId, cfg.collections.events, ID.unique(), {
    offeringId: core.offering_id,
    title: toNullableString(core.title),
    instructorName: toNullableString(core.instructor_name),
    startAt: core.start_at,
    endAt: core.end_at || null,
    dateLabel: toNullableString(core.date_label),
    capacityTotal: toNumber(core.capacity_total, 0),
    capacityTaken: toNumber(core.capacity_taken, 0),
    pricingMode: core.pricing_mode || "fixed_price",
    unitPrice: toNullableNumber(core.unit_price ?? core.price_override),
    currency: toNullableString(core.currency) ?? "MXN",
    durationMin: toNullableNumber(core.duration_min),
    minGuests,
    maxGuests,
    status: core.status || "open",
    locationProfileId: toNullableString(core.location_profile_id),
    locationFallbackLabel: toNullableString(core.location_fallback_label),
    notes: toNullableString(core.notes),
    enabled: toBoolean(core.enabled, true),
  });
}

async function eventUpdate(db, cfg, p) {
  const core = p.core ?? p;
  if (!core.event_id)
    throw Object.assign(new Error("event_id is required"), { status: 400 });

  const u = {};
  if (core.offering_id !== undefined) u.offeringId = core.offering_id;
  if (core.title !== undefined) u.title = toNullableString(core.title);
  if (core.instructor_name !== undefined)
    u.instructorName = toNullableString(core.instructor_name);
  if (core.start_at !== undefined) u.startAt = core.start_at;
  if (core.end_at !== undefined) u.endAt = core.end_at || null;
  if (core.date_label !== undefined)
    u.dateLabel = toNullableString(core.date_label);
  if (core.capacity_total !== undefined)
    u.capacityTotal = toNumber(core.capacity_total, 0);
  if (core.capacity_taken !== undefined)
    u.capacityTaken = toNumber(core.capacity_taken, 0);
  if (core.pricing_mode !== undefined)
    u.pricingMode = core.pricing_mode || "fixed_price";
  if (core.unit_price !== undefined || core.price_override !== undefined)
    u.unitPrice = toNullableNumber(core.unit_price ?? core.price_override);
  if (core.currency !== undefined) u.currency = toNullableString(core.currency);
  if (core.duration_min !== undefined)
    u.durationMin = toNullableNumber(core.duration_min);
  if (core.min_guests !== undefined)
    u.minGuests = Math.max(1, toNumber(core.min_guests, 1));
  if (core.max_guests !== undefined) {
    const nextMin = u.minGuests ?? undefined;
    const fallbackMin = Number.isFinite(nextMin) ? nextMin : 1;
    u.maxGuests = Math.max(fallbackMin, toNumber(core.max_guests, fallbackMin));
  }
  if (core.status !== undefined) u.status = core.status;
  if (core.location_profile_id !== undefined)
    u.locationProfileId = toNullableString(core.location_profile_id);
  if (core.location_fallback_label !== undefined)
    u.locationFallbackLabel = toNullableString(core.location_fallback_label);
  if (core.notes !== undefined) u.notes = toNullableString(core.notes);
  if (core.enabled !== undefined) u.enabled = toBoolean(core.enabled, true);

  return db.updateDocument(
    cfg.databaseId,
    cfg.collections.events,
    core.event_id,
    u,
  );
}

async function eventToggle(db, cfg, p) {
  const core = p.core ?? p;
  if (!core.event_id)
    throw Object.assign(new Error("event_id is required"), { status: 400 });

  return db.updateDocument(
    cfg.databaseId,
    cfg.collections.events,
    core.event_id,
    {
      enabled: toBoolean(core.enabled, true),
    },
  );
}

async function eventCancel(db, cfg, p) {
  const core = p.core ?? p;
  if (!core.event_id)
    throw Object.assign(new Error("event_id is required"), { status: 400 });

  return db.updateDocument(
    cfg.databaseId,
    cfg.collections.events,
    core.event_id,
    {
      status: "cancelled",
    },
  );
}

async function eventDelete(db, cfg, p) {
  const core = p.core ?? p;
  if (!core.event_id)
    throw Object.assign(new Error("event_id is required"), { status: 400 });

  const bookingsByEventCount = await countDocuments(
    db,
    cfg.databaseId,
    cfg.collections.bookings,
    [Query.equal("eventId", core.event_id)],
  );
  const bookingsByLegacySlotCount = await countDocuments(
    db,
    cfg.databaseId,
    cfg.collections.bookings,
    [Query.equal("slotId", core.event_id)],
  );

  if (bookingsByEventCount + bookingsByLegacySlotCount > 0)
    throw Object.assign(
      new Error(
        "No se puede eliminar el evento porque tiene reservas asociadas.",
      ),
      { status: 409 },
    );

  await db.deleteDocument(cfg.databaseId, cfg.collections.events, core.event_id);
  return { $id: core.event_id };
}

// -- Legacy Slot aliases (Phase 1 compatibility) -----------------------------

async function slotCreate(db, cfg, p) {
  return eventCreate(db, cfg, p);
}

async function slotUpdate(db, cfg, p) {
  const core = p.core ?? p;
  return eventUpdate(db, cfg, {
    core: {
      ...core,
      event_id: core.slot_id,
    },
  });
}

async function slotToggle(db, cfg, p) {
  const core = p.core ?? p;
  return eventToggle(db, cfg, {
    core: {
      ...core,
      event_id: core.slot_id,
    },
  });
}

async function slotCancel(db, cfg, p) {
  const core = p.core ?? p;
  return eventCancel(db, cfg, {
    core: {
      ...core,
      event_id: core.slot_id,
    },
  });
}

async function slotDelete(db, cfg, p) {
  const core = p.core ?? p;
  return eventDelete(db, cfg, {
    core: {
      ...core,
      event_id: core.slot_id,
    },
  });
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

  const eventCount = await countDocuments(
    db,
    cfg.databaseId,
    cfg.collections.events,
    [Query.equal("locationProfileId", core.location_profile_id)],
  );
  let legacySlotCount = 0;
  if (cfg.collections.slots && cfg.collections.slots !== cfg.collections.events) {
    legacySlotCount = await countDocuments(
      db,
      cfg.databaseId,
      cfg.collections.slots,
      [Query.equal("locationProfileId", core.location_profile_id)],
    );
  }

  if (offeringCount > 0 || eventCount > 0 || legacySlotCount > 0) {
    throw Object.assign(
      new Error(
        "No se puede eliminar la ubicacion porque esta asociada a offerings o eventos.",
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

// -- Daily Availability Rules / Inventory ------------------------------------

async function availabilityRuleCreate(db, cfg, p) {
  const core = p.core ?? p;
  if (!core.offering_id) {
    throw Object.assign(new Error("offering_id is required"), { status: 400 });
  }
  const rulesCollection = requireCollection(
    cfg,
    "availabilityRules",
    "APPWRITE_COLLECTION_OFFERING_AVAILABILITY_RULES_ID",
  );

  return db.createDocument(cfg.databaseId, rulesCollection, ID.unique(), {
    offeringId: core.offering_id,
    name: toNullableString(core.name),
    ruleType: core.rule_type || "weekly",
    weekdaysJson: toJsonString(core.weekdays_json ?? core.weekdays ?? null),
    startDate: core.start_date || null,
    endDate: core.end_date || null,
    capacityTotal: toNumber(core.capacity_total, 0),
    unitPrice: toNullableNumber(core.unit_price),
    currency: toNullableString(core.currency) ?? "MXN",
    minGuests: Math.max(1, toNumber(core.min_guests, 1)),
    maxGuests: Math.max(1, toNumber(core.max_guests, 1)),
    minNights: Math.max(1, toNumber(core.min_nights, 1)),
    enabled: toBoolean(core.enabled, true),
  });
}

async function availabilityRuleUpdate(db, cfg, p) {
  const core = p.core ?? p;
  if (!core.rule_id) {
    throw Object.assign(new Error("rule_id is required"), { status: 400 });
  }
  const rulesCollection = requireCollection(
    cfg,
    "availabilityRules",
    "APPWRITE_COLLECTION_OFFERING_AVAILABILITY_RULES_ID",
  );

  const u = {};
  if (core.offering_id !== undefined) u.offeringId = core.offering_id;
  if (core.name !== undefined) u.name = toNullableString(core.name);
  if (core.rule_type !== undefined) u.ruleType = core.rule_type;
  if (core.weekdays_json !== undefined || core.weekdays !== undefined) {
    u.weekdaysJson = toJsonString(core.weekdays_json ?? core.weekdays ?? null);
  }
  if (core.start_date !== undefined) u.startDate = core.start_date || null;
  if (core.end_date !== undefined) u.endDate = core.end_date || null;
  if (core.capacity_total !== undefined)
    u.capacityTotal = toNumber(core.capacity_total, 0);
  if (core.unit_price !== undefined)
    u.unitPrice = toNullableNumber(core.unit_price);
  if (core.currency !== undefined) u.currency = toNullableString(core.currency);
  if (core.min_guests !== undefined)
    u.minGuests = Math.max(1, toNumber(core.min_guests, 1));
  if (core.max_guests !== undefined)
    u.maxGuests = Math.max(1, toNumber(core.max_guests, 1));
  if (core.min_nights !== undefined)
    u.minNights = Math.max(1, toNumber(core.min_nights, 1));
  if (core.enabled !== undefined) u.enabled = toBoolean(core.enabled, true);

  return db.updateDocument(cfg.databaseId, rulesCollection, core.rule_id, u);
}

async function availabilityRuleDelete(db, cfg, p) {
  const core = p.core ?? p;
  if (!core.rule_id) {
    throw Object.assign(new Error("rule_id is required"), { status: 400 });
  }
  const rulesCollection = requireCollection(
    cfg,
    "availabilityRules",
    "APPWRITE_COLLECTION_OFFERING_AVAILABILITY_RULES_ID",
  );

  await db.deleteDocument(cfg.databaseId, rulesCollection, core.rule_id);
  return { $id: core.rule_id };
}

async function upsertDailyInventoryRow(db, cfg, row) {
  const inventoryCollection = requireCollection(
    cfg,
    "dailyInventory",
    "APPWRITE_COLLECTION_OFFERING_DAILY_INVENTORY_ID",
  );

  if (!row.offering_id) {
    throw Object.assign(new Error("offering_id is required"), { status: 400 });
  }
  if (!row.date) {
    throw Object.assign(new Error("date is required"), { status: 400 });
  }

  const dateStart = toUTCDateStart(row.date);
  if (!dateStart) {
    throw Object.assign(new Error("date is invalid"), { status: 400 });
  }
  const dateIso = dateStart.toISOString();

  const existing = await db.listDocuments(cfg.databaseId, inventoryCollection, [
    Query.equal("offeringId", row.offering_id),
    Query.equal("date", dateIso),
    Query.limit(1),
  ]);

  const payload = {
    offeringId: row.offering_id,
    date: dateIso,
    status: row.status || "open",
    capacityTotal: toNumber(row.capacity_total, 0),
    capacityTaken: toNumber(row.capacity_taken, 0),
    unitPrice: toNullableNumber(row.unit_price),
    currency: toNullableString(row.currency) ?? "MXN",
    minGuests: Math.max(1, toNumber(row.min_guests, 1)),
    maxGuests: Math.max(1, toNumber(row.max_guests, 1)),
    sourceRuleId: toNullableString(row.source_rule_id),
    notes: toNullableString(row.notes),
    enabled: toBoolean(row.enabled, true),
  };

  if (existing.documents.length > 0) {
    return db.updateDocument(
      cfg.databaseId,
      inventoryCollection,
      existing.documents[0].$id,
      payload,
    );
  }
  return db.createDocument(cfg.databaseId, inventoryCollection, ID.unique(), payload);
}

async function availabilityInventoryUpsert(db, cfg, p) {
  const core = p.core ?? p;
  return upsertDailyInventoryRow(db, cfg, core);
}

async function availabilityInventoryBulkUpsert(db, cfg, p) {
  const core = p.core ?? p;
  const items = Array.isArray(core.items) ? core.items : [];
  if (items.length === 0) {
    return [];
  }
  const results = [];
  for (const item of items) {
    results.push(await upsertDailyInventoryRow(db, cfg, item));
  }
  return results;
}

function matchesRuleForDate(rule, date) {
  const start = rule.startDate ? toUTCDateStart(rule.startDate) : null;
  const end = rule.endDate ? toUTCDateStart(rule.endDate) : null;
  if (start && date < start) return false;
  if (end && date > end) return false;

  const weekdays = parseJsonArray(rule.weekdaysJson, null);
  if (Array.isArray(weekdays) && weekdays.length > 0) {
    const weekday = date.getUTCDay();
    return weekdays.includes(weekday);
  }
  return true;
}

function pickRuleForDate(rules, date) {
  const weighted = rules
    .filter((rule) => matchesRuleForDate(rule, date))
    .map((rule) => {
      const priority =
        rule.ruleType === "override"
          ? 3
          : rule.ruleType === "seasonal"
            ? 2
            : 1;
      return { rule, priority };
    })
    .sort((a, b) => b.priority - a.priority);
  return weighted[0]?.rule ?? null;
}

async function availabilityInventoryMaterialize(db, cfg, p) {
  const core = p.core ?? p;
  if (!core.offering_id) {
    throw Object.assign(new Error("offering_id is required"), { status: 400 });
  }
  if (!core.from_date || !core.to_date) {
    throw Object.assign(new Error("from_date and to_date are required"), {
      status: 400,
    });
  }

  const rulesCollection = requireCollection(
    cfg,
    "availabilityRules",
    "APPWRITE_COLLECTION_OFFERING_AVAILABILITY_RULES_ID",
  );

  const { dates } = enumerateRangeDays(core.from_date, core.to_date);

  const rulesRes = await db.listDocuments(cfg.databaseId, rulesCollection, [
    Query.equal("offeringId", core.offering_id),
    Query.equal("enabled", true),
    Query.limit(500),
  ]);

  const rules = rulesRes.documents;
  const results = [];
  for (const isoDay of dates) {
    const day = toUTCDateStart(isoDay);
    const matchedRule = pickRuleForDate(rules, day);
    const row = matchedRule
      ? {
          offering_id: core.offering_id,
          date: isoDay,
          status: "open",
          capacity_total: matchedRule.capacityTotal ?? 0,
          capacity_taken: 0,
          unit_price: matchedRule.unitPrice ?? null,
          currency: matchedRule.currency ?? "MXN",
          min_guests: matchedRule.minGuests ?? 1,
          max_guests: matchedRule.maxGuests ?? 1,
          source_rule_id: matchedRule.$id,
          enabled: true,
        }
      : {
          offering_id: core.offering_id,
          date: isoDay,
          status: "closed",
          capacity_total: 0,
          capacity_taken: 0,
          unit_price: null,
          currency: core.currency || "MXN",
          min_guests: 1,
          max_guests: 1,
          source_rule_id: null,
          enabled: true,
        };
    results.push(await upsertDailyInventoryRow(db, cfg, row));
  }

  return results;
}

async function availabilityInventoryDelete(db, cfg, p) {
  const core = p.core ?? p;
  if (!core.inventory_id) {
    throw Object.assign(new Error("inventory_id is required"), { status: 400 });
  }

  const inventoryCollection = requireCollection(
    cfg,
    "dailyInventory",
    "APPWRITE_COLLECTION_OFFERING_DAILY_INVENTORY_ID",
  );

  await db.deleteDocument(cfg.databaseId, inventoryCollection, core.inventory_id);
  return { $id: core.inventory_id };
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
      templateKey: core.template_key || "centered-minimal",
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
  if (core.template_key !== undefined)
    u.templateKey = core.template_key || "centered-minimal";
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
  const flowBookingEngine =
    toBookingEngine(flowConfig?.booking?.engine) ??
    (bookingMode === "scheduled"
      ? "events"
      : bookingMode === "date_range"
        ? "daily_range"
        : "request_only");

  const requestedBookingEngine =
    toBookingEngine(core.booking_engine ?? core.bookingEngine) ??
    flowBookingEngine;

  const eventId = toNullableString(core.event_id ?? core.slot_id);
  const checkInDateRaw = core.check_in_date ?? core.checkInDate ?? null;
  const checkOutDateRaw = core.check_out_date ?? core.checkOutDate ?? null;

  let bookingEngine = requestedBookingEngine;
  if (bookingEngine === "hybrid") {
    bookingEngine = eventId ? "events" : "daily_range";
  }

  const requiresSchedule =
    flowConfig?.booking?.requires_schedule === true || bookingMode === "scheduled";

  let eventDoc = null;
  let inventoryDocsToReserve = [];
  let checkInDate = null;
  let checkOutDate = null;
  let nights = null;

  const guestCount = Math.max(1, toNumber(core.guest_count, 1));
  const flowBasePrice = toNullableNumber(flowConfig?.pricing?.base_price);
  let unitPrice = toNullableNumber(core.unit_price) ?? null;

  if (bookingEngine === "events") {
    if (!eventId) {
      throw Object.assign(new Error("event_id is required for this offering"), {
        status: 400,
      });
    }

    eventDoc = await db.getDocument(cfg.databaseId, cfg.collections.events, eventId);
    if (eventDoc.offeringId !== core.offering_id) {
      throw Object.assign(
        new Error("event_id does not belong to offering_id"),
        { status: 400 },
      );
    }
    if (eventDoc.status !== "open" || eventDoc.enabled === false) {
      throw Object.assign(new Error("The selected event is not available"), {
        status: 409,
      });
    }

    const conflictingBlocks = await listActiveBlocksInRange(
      db,
      cfg,
      eventDoc.startAt,
      eventDoc.endAt ?? eventDoc.startAt,
      core.offering_id,
    );
    if (conflictingBlocks.length > 0) {
      throw Object.assign(
        new Error("No se puede reservar: el evento esta bloqueado en agenda."),
        { status: 409 },
      );
    }

    if (eventDoc.capacityTotal > 0) {
      const available = Math.max(
        0,
        eventDoc.capacityTotal - (eventDoc.capacityTaken ?? 0),
      );
      if (guestCount > available) {
        throw Object.assign(
          new Error("No hay cupo suficiente en el evento seleccionado."),
          { status: 409 },
        );
      }
    }

    const eventPrice = toNullableNumber(
      eventDoc.unitPrice ?? eventDoc.priceOverride ?? null,
    );
    unitPrice = unitPrice ?? eventPrice ?? flowBasePrice ?? 0;
  } else if (bookingEngine === "daily_range") {
    const inventoryCollection = requireCollection(
      cfg,
      "dailyInventory",
      "APPWRITE_COLLECTION_OFFERING_DAILY_INVENTORY_ID",
    );

    if (!checkInDateRaw || !checkOutDateRaw) {
      throw Object.assign(
        new Error(
          "check_in_date and check_out_date are required for daily range bookings",
        ),
        { status: 400 },
      );
    }

    const range = enumerateRangeDays(checkInDateRaw, checkOutDateRaw);
    checkInDate = range.checkInIso;
    checkOutDate = range.checkOutIso;
    nights = range.nights;

    const conflictingBlocks = await listActiveBlocksInRange(
      db,
      cfg,
      checkInDate,
      checkOutDate,
      core.offering_id,
    );
    if (conflictingBlocks.length > 0) {
      throw Object.assign(
        new Error("No se puede reservar: hay dias bloqueados en el rango."),
        { status: 409 },
      );
    }

    const inventoryRes = await db.listDocuments(cfg.databaseId, inventoryCollection, [
      Query.equal("offeringId", core.offering_id),
      Query.equal("date", range.dates),
      Query.limit(Math.max(100, range.dates.length + 10)),
    ]);
    const inventoryByDate = Object.fromEntries(
      inventoryRes.documents.map((doc) => [toUTCDateStart(doc.date)?.toISOString(), doc]),
    );

    for (const dayIso of range.dates) {
      const row = inventoryByDate[dayIso];
      if (!row) {
        throw Object.assign(
          new Error("No hay inventario configurado para todas las fechas del rango."),
          { status: 409 },
        );
      }
      if (row.enabled === false || row.status === "blocked" || row.status === "closed") {
        throw Object.assign(
          new Error("Una o mas fechas del rango no estan disponibles."),
          { status: 409 },
        );
      }
      if (row.capacityTotal > 0) {
        const available = Math.max(0, row.capacityTotal - (row.capacityTaken ?? 0));
        if (guestCount > available) {
          throw Object.assign(
            new Error("No hay cupo suficiente para una o mas fechas del rango."),
            { status: 409 },
          );
        }
      }
      inventoryDocsToReserve.push(row);
    }

    if (unitPrice === null) {
      unitPrice = inventoryDocsToReserve.reduce(
        (sum, row) => sum + Number(row.unitPrice ?? 0),
        0,
      );
    }
  } else {
    if (requiresSchedule && !eventId) {
      throw Object.assign(new Error("event_id is required for this offering"), {
        status: 400,
      });
    }
    unitPrice = unitPrice ?? flowBasePrice ?? 0;
  }

  const now = nowISO();
  const status =
    core.status ||
    (bookingEngine === "daily_range"
      ? "confirmed"
      : bookingMode === "request_only" || bookingMode === "date_range"
        ? "pending"
        : "confirmed");

  const pricingSnapshot = {
    booking_mode: bookingMode,
    booking_engine: bookingEngine,
    pricing_mode:
      eventDoc?.pricingMode ?? flowConfig?.pricing?.mode ?? core.pricing_mode ?? null,
    flow_base_price: flowBasePrice,
    event_unit_price: eventDoc?.unitPrice ?? null,
    unit_price: unitPrice,
    currency:
      eventDoc?.currency ??
      inventoryDocsToReserve[0]?.currency ??
      offering.currency ??
      "MXN",
    guest_count: guestCount,
    nights,
    check_in_date: checkInDate,
    check_out_date: checkOutDate,
    created_at: now,
    ...parseJsonMaybe(core.pricing_snapshot, {}),
  };

  const customAnswers =
    core.custom_answers ?? parseJsonMaybe(core.custom_answers_json, null) ?? null;

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
      slotId: eventDoc?.$id ?? toNullableString(core.slot_id),
      eventId: eventDoc?.$id ?? null,
      bookingType: core.booking_type || offering.type || "service",
      bookingEngine: bookingEngine,
      guestCount,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      nights: nights,
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

  if (status === "confirmed" && eventDoc) {
    const nextTaken = (eventDoc.capacityTaken ?? 0) + guestCount;
    const nextStatus =
      eventDoc.capacityTotal > 0 && nextTaken >= eventDoc.capacityTotal
        ? "full"
        : eventDoc.status;

    await db.updateDocument(cfg.databaseId, cfg.collections.events, eventDoc.$id, {
      capacityTaken: nextTaken,
      status: nextStatus,
    });
  }

  if (status === "confirmed" && inventoryDocsToReserve.length > 0) {
    const inventoryCollection = requireCollection(
      cfg,
      "dailyInventory",
      "APPWRITE_COLLECTION_OFFERING_DAILY_INVENTORY_ID",
    );
    for (const row of inventoryDocsToReserve) {
      const nextTaken = (row.capacityTaken ?? 0) + guestCount;
      const nextStatus =
        row.capacityTotal > 0 && nextTaken >= row.capacityTotal ? "full" : row.status;
      await db.updateDocument(cfg.databaseId, inventoryCollection, row.$id, {
        capacityTaken: nextTaken,
        status: nextStatus,
      });
    }
  }

  return bookingDoc;
}

// -- Operation dispatch -------------------------------------------------------

const operationHandlers = {
  "offering.create": offeringCreate,
  "offering.update": offeringUpdate,
  "offering.toggle": offeringToggle,
  "offering.delete": offeringDelete,
  "event.create": eventCreate,
  "event.update": eventUpdate,
  "event.toggle": eventToggle,
  "event.cancel": eventCancel,
  "event.delete": eventDelete,
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
  "availability.rule.create": availabilityRuleCreate,
  "availability.rule.update": availabilityRuleUpdate,
  "availability.rule.delete": availabilityRuleDelete,
  "availability.inventory.upsert": availabilityInventoryUpsert,
  "availability.inventory.bulk_upsert": availabilityInventoryBulkUpsert,
  "availability.inventory.materialize": availabilityInventoryMaterialize,
  "availability.inventory.delete": availabilityInventoryDelete,
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
