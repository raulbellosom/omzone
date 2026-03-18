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

function slugify(value, maxLength = 120) {
  const base = String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return (base || `item-${Date.now()}`).slice(0, maxLength);
}

function resolveClassSlug(data) {
  return slugify(firstFilled(data.slug, data.title_es, data.title_en), 120);
}

function resolveInstructorSlug(data) {
  return slugify(firstFilled(data.slug, data.full_name), 100);
}

function resolveClassTypeSlug(data) {
  return slugify(firstFilled(data.slug, data.name_es, data.name_en), 80);
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
      classes: process.env.APPWRITE_COLLECTION_CLASSES_ID,
      sessions: process.env.APPWRITE_COLLECTION_CLASS_SESSIONS_ID,
      classTypes: process.env.APPWRITE_COLLECTION_CLASS_TYPES_ID,
      instructors: process.env.APPWRITE_COLLECTION_INSTRUCTORS_ID,
      bookings: process.env.APPWRITE_COLLECTION_BOOKINGS_ID,
    },
  };

  const missing = [];
  if (!env.projectId) missing.push("APPWRITE_PROJECT_ID");
  if (!env.apiKey) missing.push("APPWRITE_API_KEY");
  if (!env.databaseId) missing.push("APPWRITE_DATABASE_ID");
  if (!env.collections.classes) missing.push("APPWRITE_COLLECTION_CLASSES_ID");
  if (!env.collections.sessions)
    missing.push("APPWRITE_COLLECTION_CLASS_SESSIONS_ID");
  if (!env.collections.classTypes)
    missing.push("APPWRITE_COLLECTION_CLASS_TYPES_ID");
  if (!env.collections.instructors)
    missing.push("APPWRITE_COLLECTION_INSTRUCTORS_ID");
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

async function classCreate(db, cfg, payload) {
  return db.createDocument(
    cfg.databaseId,
    cfg.collections.classes,
    ID.unique(),
    {
      slug: resolveClassSlug(payload),
      titleEs: payload.title_es,
      titleEn: payload.title_en,
      summaryEs: toNullableString(payload.summary_es),
      summaryEn: toNullableString(payload.summary_en),
      descriptionEs: toNullableString(payload.description_es),
      descriptionEn: toNullableString(payload.description_en),
      classTypeId: payload.class_type_id,
      difficulty: payload.difficulty,
      durationMin: toNumber(payload.duration_min, 0),
      basePrice: toNumber(payload.base_price, 0),
      coverImageId: toNullableString(payload.cover_image_id),
      coverImageBucket: toNullableString(payload.cover_image_bucket),
      isFeatured: toBoolean(payload.is_featured, false),
      enabled: toBoolean(payload.enabled, true),
    },
  );
}

async function classUpdate(db, cfg, payload) {
  if (!payload.class_id) {
    throw Object.assign(new Error("class_id is required"), { status: 400 });
  }

  const update = {};
  if (payload.slug !== undefined) update.slug = resolveClassSlug(payload);
  if (payload.title_es !== undefined) update.titleEs = payload.title_es;
  if (payload.title_en !== undefined) update.titleEn = payload.title_en;
  if (payload.summary_es !== undefined)
    update.summaryEs = toNullableString(payload.summary_es);
  if (payload.summary_en !== undefined)
    update.summaryEn = toNullableString(payload.summary_en);
  if (payload.description_es !== undefined)
    update.descriptionEs = toNullableString(payload.description_es);
  if (payload.description_en !== undefined)
    update.descriptionEn = toNullableString(payload.description_en);
  if (payload.class_type_id !== undefined)
    update.classTypeId = payload.class_type_id;
  if (payload.difficulty !== undefined) update.difficulty = payload.difficulty;
  if (payload.duration_min !== undefined)
    update.durationMin = toNumber(payload.duration_min, 0);
  if (payload.base_price !== undefined)
    update.basePrice = toNumber(payload.base_price, 0);
  if (payload.cover_image_id !== undefined)
    update.coverImageId = toNullableString(payload.cover_image_id);
  if (payload.cover_image_bucket !== undefined)
    update.coverImageBucket = toNullableString(payload.cover_image_bucket);
  if (payload.is_featured !== undefined)
    update.isFeatured = toBoolean(payload.is_featured, false);
  if (payload.enabled !== undefined)
    update.enabled = toBoolean(payload.enabled, true);

  return db.updateDocument(
    cfg.databaseId,
    cfg.collections.classes,
    payload.class_id,
    update,
  );
}

async function classToggle(db, cfg, payload) {
  if (!payload.class_id) {
    throw Object.assign(new Error("class_id is required"), { status: 400 });
  }

  return db.updateDocument(
    cfg.databaseId,
    cfg.collections.classes,
    payload.class_id,
    {
      enabled: toBoolean(payload.enabled, true),
    },
  );
}

async function classDelete(db, cfg, payload) {
  if (!payload.class_id) {
    throw Object.assign(new Error("class_id is required"), { status: 400 });
  }

  const sessionsCount = await countDocuments(
    db,
    cfg.databaseId,
    cfg.collections.sessions,
    [Query.equal("classId", payload.class_id)],
  );

  if (sessionsCount > 0) {
    throw Object.assign(
      new Error(
        "No se puede eliminar la clase porque tiene sesiones asociadas.",
      ),
      { status: 409 },
    );
  }

  await db.deleteDocument(
    cfg.databaseId,
    cfg.collections.classes,
    payload.class_id,
  );
  return { $id: payload.class_id };
}

async function instructorCreate(db, cfg, payload) {
  return db.createDocument(
    cfg.databaseId,
    cfg.collections.instructors,
    ID.unique(),
    {
      slug: resolveInstructorSlug(payload),
      fullName: payload.full_name,
      shortBio: toNullableString(payload.short_bio),
      photoId: toNullableString(payload.photo_id),
      specialties: toNullableString(payload.specialties),
      displayOrder: toNumber(payload.display_order, 0),
      enabled: toBoolean(payload.enabled, true),
    },
  );
}

async function instructorUpdate(db, cfg, payload) {
  if (!payload.instructor_id) {
    throw Object.assign(new Error("instructor_id is required"), {
      status: 400,
    });
  }

  const update = {};
  if (payload.slug !== undefined) update.slug = resolveInstructorSlug(payload);
  if (payload.full_name !== undefined) update.fullName = payload.full_name;
  if (payload.short_bio !== undefined)
    update.shortBio = toNullableString(payload.short_bio);
  if (payload.photo_id !== undefined)
    update.photoId = toNullableString(payload.photo_id);
  if (payload.specialties !== undefined)
    update.specialties = toNullableString(payload.specialties);
  if (payload.display_order !== undefined)
    update.displayOrder = toNumber(payload.display_order, 0);
  if (payload.enabled !== undefined)
    update.enabled = toBoolean(payload.enabled, true);

  return db.updateDocument(
    cfg.databaseId,
    cfg.collections.instructors,
    payload.instructor_id,
    update,
  );
}

async function instructorToggle(db, cfg, payload) {
  if (!payload.instructor_id) {
    throw Object.assign(new Error("instructor_id is required"), {
      status: 400,
    });
  }

  return db.updateDocument(
    cfg.databaseId,
    cfg.collections.instructors,
    payload.instructor_id,
    {
      enabled: toBoolean(payload.enabled, true),
    },
  );
}

async function instructorDelete(db, cfg, payload) {
  if (!payload.instructor_id) {
    throw Object.assign(new Error("instructor_id is required"), {
      status: 400,
    });
  }

  const sessionsCount = await countDocuments(
    db,
    cfg.databaseId,
    cfg.collections.sessions,
    [Query.equal("instructorId", payload.instructor_id)],
  );

  if (sessionsCount > 0) {
    throw Object.assign(
      new Error(
        "No se puede eliminar el instructor porque esta asociado a sesiones activas.",
      ),
      { status: 409 },
    );
  }

  await db.deleteDocument(
    cfg.databaseId,
    cfg.collections.instructors,
    payload.instructor_id,
  );
  return { $id: payload.instructor_id };
}

async function classTypeCreate(db, cfg, payload) {
  return db.createDocument(
    cfg.databaseId,
    cfg.collections.classTypes,
    ID.unique(),
    {
      slug: resolveClassTypeSlug(payload),
      nameEs: payload.name_es,
      nameEn: payload.name_en,
      description: toNullableString(payload.description),
      enabled: toBoolean(payload.enabled, true),
    },
  );
}

async function classTypeUpdate(db, cfg, payload) {
  if (!payload.class_type_id) {
    throw Object.assign(new Error("class_type_id is required"), {
      status: 400,
    });
  }

  const update = {};
  if (payload.slug !== undefined) update.slug = resolveClassTypeSlug(payload);
  if (payload.name_es !== undefined) update.nameEs = payload.name_es;
  if (payload.name_en !== undefined) update.nameEn = payload.name_en;
  if (payload.description !== undefined)
    update.description = toNullableString(payload.description);
  if (payload.enabled !== undefined)
    update.enabled = toBoolean(payload.enabled, true);

  return db.updateDocument(
    cfg.databaseId,
    cfg.collections.classTypes,
    payload.class_type_id,
    update,
  );
}

async function classTypeToggle(db, cfg, payload) {
  if (!payload.class_type_id) {
    throw Object.assign(new Error("class_type_id is required"), {
      status: 400,
    });
  }

  return db.updateDocument(
    cfg.databaseId,
    cfg.collections.classTypes,
    payload.class_type_id,
    {
      enabled: toBoolean(payload.enabled, true),
    },
  );
}

async function classTypeDelete(db, cfg, payload) {
  if (!payload.class_type_id) {
    throw Object.assign(new Error("class_type_id is required"), {
      status: 400,
    });
  }

  const classesCount = await countDocuments(
    db,
    cfg.databaseId,
    cfg.collections.classes,
    [Query.equal("classTypeId", payload.class_type_id)],
  );

  if (classesCount > 0) {
    throw Object.assign(
      new Error(
        "No se puede eliminar el tipo porque todavia hay clases que lo usan.",
      ),
      { status: 409 },
    );
  }

  await db.deleteDocument(
    cfg.databaseId,
    cfg.collections.classTypes,
    payload.class_type_id,
  );
  return { $id: payload.class_type_id };
}

async function sessionCreate(db, cfg, payload) {
  if (!payload.class_id) {
    throw Object.assign(new Error("class_id is required"), { status: 400 });
  }
  if (!payload.session_date) {
    throw Object.assign(new Error("session_date is required"), { status: 400 });
  }

  return db.createDocument(
    cfg.databaseId,
    cfg.collections.sessions,
    ID.unique(),
    {
      classId: payload.class_id,
      sessionDate: payload.session_date,
      endDate: payload.end_date || null,
      capacityTotal: toNumber(payload.capacity_total, 0),
      capacityTaken: toNumber(payload.capacity_taken, 0),
      priceOverride: toNullableNumber(payload.price_override),
      instructorId: toNullableString(payload.instructor_id),
      maxPerBooking: toNumber(payload.max_per_booking, 6),
      coverImageId: toNullableString(payload.cover_image_id),
      coverImageBucket: toNullableString(payload.cover_image_bucket),
      status: payload.status || "scheduled",
      locationLabel: toNullableString(payload.location_label),
      enabled: toBoolean(payload.enabled, true),
    },
  );
}

async function sessionUpdate(db, cfg, payload) {
  if (!payload.session_id) {
    throw Object.assign(new Error("session_id is required"), { status: 400 });
  }

  const update = {};
  if (payload.class_id !== undefined) update.classId = payload.class_id;
  if (payload.session_date !== undefined)
    update.sessionDate = payload.session_date;
  if (payload.end_date !== undefined) update.endDate = payload.end_date || null;
  if (payload.capacity_total !== undefined)
    update.capacityTotal = toNumber(payload.capacity_total, 0);
  if (payload.capacity_taken !== undefined)
    update.capacityTaken = toNumber(payload.capacity_taken, 0);
  if (payload.price_override !== undefined)
    update.priceOverride = toNullableNumber(payload.price_override);
  if (payload.instructor_id !== undefined)
    update.instructorId = toNullableString(payload.instructor_id);
  if (payload.max_per_booking !== undefined)
    update.maxPerBooking = toNumber(payload.max_per_booking, 6);
  if (payload.cover_image_id !== undefined)
    update.coverImageId = toNullableString(payload.cover_image_id);
  if (payload.cover_image_bucket !== undefined)
    update.coverImageBucket = toNullableString(payload.cover_image_bucket);
  if (payload.status !== undefined) update.status = payload.status;
  if (payload.location_label !== undefined)
    update.locationLabel = toNullableString(payload.location_label);
  if (payload.enabled !== undefined)
    update.enabled = toBoolean(payload.enabled, true);

  return db.updateDocument(
    cfg.databaseId,
    cfg.collections.sessions,
    payload.session_id,
    update,
  );
}

async function sessionToggle(db, cfg, payload) {
  if (!payload.session_id) {
    throw Object.assign(new Error("session_id is required"), { status: 400 });
  }

  return db.updateDocument(
    cfg.databaseId,
    cfg.collections.sessions,
    payload.session_id,
    {
      enabled: toBoolean(payload.enabled, true),
    },
  );
}

async function sessionCancel(db, cfg, payload) {
  if (!payload.session_id) {
    throw Object.assign(new Error("session_id is required"), { status: 400 });
  }

  return db.updateDocument(
    cfg.databaseId,
    cfg.collections.sessions,
    payload.session_id,
    {
      status: "cancelled",
    },
  );
}

async function sessionDelete(db, cfg, payload) {
  if (!payload.session_id) {
    throw Object.assign(new Error("session_id is required"), { status: 400 });
  }

  const bookingCount = await countDocuments(
    db,
    cfg.databaseId,
    cfg.collections.bookings,
    [Query.equal("sessionId", payload.session_id)],
  );

  if (bookingCount > 0) {
    throw Object.assign(
      new Error(
        "No se puede eliminar la sesion porque tiene reservas asociadas.",
      ),
      { status: 409 },
    );
  }

  await db.deleteDocument(
    cfg.databaseId,
    cfg.collections.sessions,
    payload.session_id,
  );
  return { $id: payload.session_id };
}

const operationHandlers = {
  "class.create": classCreate,
  "class.update": classUpdate,
  "class.toggle": classToggle,
  "class.delete": classDelete,
  "instructor.create": instructorCreate,
  "instructor.update": instructorUpdate,
  "instructor.toggle": instructorToggle,
  "instructor.delete": instructorDelete,
  "classType.create": classTypeCreate,
  "classType.update": classTypeUpdate,
  "classType.toggle": classTypeToggle,
  "classType.delete": classTypeDelete,
  "session.create": sessionCreate,
  "session.update": sessionUpdate,
  "session.toggle": sessionToggle,
  "session.cancel": sessionCancel,
  "session.delete": sessionDelete,
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
    log(`[admin-write-catalog] ${operation} by ${callerUserId}`);
    return res.json({ ok: true, operation, data }, 200);
  } catch (err) {
    const status = err?.status || 500;
    const message = status >= 500 ? "Internal server error" : err.message;
    error(`[admin-write-catalog] ${err?.message || "Unknown error"}`);
    return res.json({ ok: false, message }, status);
  }
};
