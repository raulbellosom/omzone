/**
 * offeringService.js - Public queries for offerings model.
 *
 * Covers: offerings, offering_slots, location_profiles, content_sections, search.
 */
import { Query } from "appwrite";
import { databases } from "./client";
import {
  APPWRITE_DATABASE_ID,
  COL_OFFERINGS,
  COL_OFFERING_SLOTS,
  COL_LOCATION_PROFILES,
  COL_CONTENT_SECTIONS,
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

export function normalizeLocationProfile(doc) {
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

export function normalizeOffering(doc, locationProfile = null) {
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
    currency: doc.currency ?? "MXN",
    flow_key: flow.flow_key,
    flow_version: flow.flow_version,
    flow_config: flow.flow_config,
    terms_config: flow.terms_config,
    default_location_profile_id:
      doc.defaultLocationProfileId ?? derived.location_profile_id ?? null,
    booking_mode: derived.booking_mode,
    pricing_mode: derived.pricing_mode,
    base_price: derived.base_price,
    duration_min: derived.duration_min,
    min_guests: derived.min_guests,
    max_guests: derived.max_guests,
    requires_schedule: derived.requires_schedule,
    supports_date_range: derived.supports_date_range,
    location_label:
      locationProfile?.name ??
      locationProfile?.address ??
      derived.location_label ??
      null,
    location_profile: normalizeLocationProfile(locationProfile),
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
    created_at: doc.createdAt ?? doc.$createdAt,
    updated_at: doc.updatedAt ?? null,
  };
}

export function normalizeSlot(doc, offering = null, locationProfile = null) {
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
    location_profile: normalizeLocationProfile(locationProfile),
    notes: doc.notes ?? null,
    enabled: doc.enabled ?? true,
    offering,
  };
}

export function normalizeContentSection(doc) {
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
    image_id: doc.imageId ?? null,
    image_bucket: doc.imageBucket ?? null,
    scope: doc.scope ?? "global",
    offering_id: doc.offeringId ?? null,
    display_order: doc.displayOrder ?? 0,
    enabled: doc.enabled ?? true,
  };
}

async function fetchLocationMap(ids = []) {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return {};
  const res = await databases.listDocuments(DB, COL_LOCATION_PROFILES, [
    Query.equal("$id", unique),
    Query.limit(unique.length),
  ]);
  return Object.fromEntries(res.documents.map((doc) => [doc.$id, doc]));
}

export async function getOfferings({
  category,
  type,
  featured,
  showOnHome,
  limit = 100,
} = {}) {
  const q = [
    Query.equal("enabled", true),
    Query.equal("status", "published"),
    Query.orderAsc("displayOrder"),
    Query.limit(limit),
  ];
  if (category) q.push(Query.equal("category", category));
  if (type) q.push(Query.equal("type", type));
  if (featured) q.push(Query.equal("isFeatured", true));
  if (showOnHome) q.push(Query.equal("showOnHome", true));

  const res = await databases.listDocuments(DB, COL_OFFERINGS, q);
  const locationMap = await fetchLocationMap(
    res.documents.map((d) => d.defaultLocationProfileId),
  );
  return res.documents.map((doc) =>
    normalizeOffering(doc, locationMap[doc.defaultLocationProfileId] ?? null),
  );
}

export async function getOfferingBySlug(slug, { publicOnly = true } = {}) {
  const q = [Query.equal("slug", slug), Query.limit(1)];
  if (publicOnly) {
    q.push(Query.equal("enabled", true));
    q.push(Query.equal("status", "published"));
  }
  const res = await databases.listDocuments(DB, COL_OFFERINGS, q);
  if (res.documents.length === 0) return null;

  const doc = res.documents[0];
  const locationMap = await fetchLocationMap([doc.defaultLocationProfileId]);
  return normalizeOffering(doc, locationMap[doc.defaultLocationProfileId] ?? null);
}

export async function getOfferingById(id) {
  const doc = await databases.getDocument(DB, COL_OFFERINGS, id);
  const locationMap = await fetchLocationMap([doc.defaultLocationProfileId]);
  return normalizeOffering(doc, locationMap[doc.defaultLocationProfileId] ?? null);
}

export async function getOfferingSlots(
  offeringId,
  { fromDate, status, limit = 100 } = {},
) {
  const q = [
    Query.equal("offeringId", offeringId),
    Query.equal("enabled", true),
    Query.orderAsc("startAt"),
    Query.limit(limit),
  ];
  if (fromDate) q.push(Query.greaterThanEqual("startAt", fromDate));
  if (status) q.push(Query.equal("status", status));

  const [res, offeringDoc] = await Promise.all([
    databases.listDocuments(DB, COL_OFFERING_SLOTS, q),
    databases.getDocument(DB, COL_OFFERINGS, offeringId),
  ]);

  const locationMap = await fetchLocationMap([
    ...res.documents.map((d) => d.locationProfileId),
    offeringDoc.defaultLocationProfileId,
  ]);
  const offering = normalizeOffering(
    offeringDoc,
    locationMap[offeringDoc.defaultLocationProfileId] ?? null,
  );

  return res.documents.map((doc) =>
    normalizeSlot(doc, offering, locationMap[doc.locationProfileId] ?? null),
  );
}

export async function getSlotById(slotId) {
  let doc = null;
  try {
    doc = await databases.getDocument(DB, COL_OFFERING_SLOTS, slotId);
  } catch {
    return null;
  }
  const [offeringDoc, locationMap] = await Promise.all([
    doc.offeringId
      ? databases.getDocument(DB, COL_OFFERINGS, doc.offeringId).catch(() => null)
      : Promise.resolve(null),
    fetchLocationMap([doc.locationProfileId]),
  ]);

  const offering = offeringDoc ? normalizeOffering(offeringDoc) : null;
  return normalizeSlot(doc, offering, locationMap[doc.locationProfileId] ?? null);
}

export async function getAllUpcomingSlots({ category, limit = 50 } = {}) {
  const now = new Date().toISOString();
  const q = [
    Query.equal("enabled", true),
    Query.equal("status", "open"),
    Query.greaterThanEqual("startAt", now),
    Query.orderAsc("startAt"),
    Query.limit(limit),
  ];

  const res = await databases.listDocuments(DB, COL_OFFERING_SLOTS, q);
  const offeringIds = [...new Set(res.documents.map((d) => d.offeringId).filter(Boolean))];
  const offeringDocs = await Promise.all(
    offeringIds.map((id) =>
      databases.getDocument(DB, COL_OFFERINGS, id).catch(() => null),
    ),
  );
  const offeringMap = Object.fromEntries(
    offeringDocs.filter(Boolean).map((doc) => [doc.$id, doc]),
  );

  const locationMap = await fetchLocationMap(
    res.documents.map((d) => d.locationProfileId),
  );

  let slots = res.documents.map((doc) =>
    normalizeSlot(doc, normalizeOffering(offeringMap[doc.offeringId] ?? null), locationMap[doc.locationProfileId] ?? null),
  );

  slots = slots.filter(
    (slot) => slot.offering && slot.offering.enabled && slot.offering.status === "published",
  );

  if (category) {
    slots = slots.filter((slot) => slot.offering?.category === category);
  }
  return slots;
}

export async function getContentSections({
  enabled = true,
  scope,
  offeringId,
  mergeOffering = false,
} = {}) {
  const base = [Query.orderAsc("displayOrder"), Query.limit(100)];
  if (enabled) base.push(Query.equal("enabled", true));

  if (offeringId && mergeOffering) {
    const [globalRes, offeringRes] = await Promise.all([
      databases.listDocuments(DB, COL_CONTENT_SECTIONS, [
        ...base,
        Query.equal("scope", "global"),
      ]),
      databases.listDocuments(DB, COL_CONTENT_SECTIONS, [
        ...base,
        Query.equal("scope", "offering"),
        Query.equal("offeringId", offeringId),
      ]),
    ]);
    const map = new Map();
    globalRes.documents.forEach((doc) => map.set(doc.sectionKey, normalizeContentSection(doc)));
    offeringRes.documents.forEach((doc) => map.set(doc.sectionKey, normalizeContentSection(doc)));
    return [...map.values()].sort((a, b) => a.display_order - b.display_order);
  }

  const q = [...base];
  if (scope) q.push(Query.equal("scope", scope));
  if (offeringId) q.push(Query.equal("offeringId", offeringId));
  const res = await databases.listDocuments(DB, COL_CONTENT_SECTIONS, q);
  return res.documents.map(normalizeContentSection);
}

export async function searchOfferings(term, { locale = "es", limit = 20 } = {}) {
  if (!term || term.length < 2) return [];
  const titleField = locale === "en" ? "titleEn" : "titleEs";
  const res = await databases.listDocuments(DB, COL_OFFERINGS, [
    Query.equal("enabled", true),
    Query.equal("status", "published"),
    Query.contains(titleField, term),
    Query.limit(limit),
  ]);
  return res.documents.map((doc) => normalizeOffering(doc));
}
