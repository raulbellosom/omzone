/**
 * offeringService.js — Public queries for the unified offerings model.
 *
 * Covers: offerings, offering_slots, content_sections, search.
 */
import { Query } from "appwrite";
import { databases } from "./client";
import {
  APPWRITE_DATABASE_ID,
  COL_OFFERINGS,
  COL_OFFERING_SLOTS,
  COL_CONTENT_SECTIONS,
} from "@/env";

const DB = APPWRITE_DATABASE_ID;

// ── Normalizers ───────────────────────────────────────────────────────────────

export function normalizeOffering(doc) {
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
    category: doc.category,
    type: doc.type,
    yoga_style: doc.yogaStyle ?? null,
    booking_mode: doc.bookingMode,
    pricing_mode: doc.pricingMode,
    base_price: doc.basePrice ?? null,
    currency: doc.currency ?? "MXN",
    duration_min: doc.durationMin ?? null,
    min_guests: doc.minGuests ?? 1,
    max_guests: doc.maxGuests ?? 1,
    location_label: doc.locationLabel ?? null,
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

export function normalizeSlot(doc, offering = null) {
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
    location_label: doc.locationLabel ?? null,
    notes: doc.notes ?? null,
    enabled: doc.enabled ?? true,
    offering: offering ? normalizeOffering(offering) : null,
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
    display_order: doc.displayOrder ?? 0,
    enabled: doc.enabled ?? true,
  };
}

// ── Offerings ─────────────────────────────────────────────────────────────────

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
  return res.documents.map(normalizeOffering);
}

export async function getOfferingBySlug(slug) {
  const res = await databases.listDocuments(DB, COL_OFFERINGS, [
    Query.equal("slug", slug),
    Query.limit(1),
  ]);
  return res.documents.length > 0 ? normalizeOffering(res.documents[0]) : null;
}

export async function getOfferingById(id) {
  const doc = await databases.getDocument(DB, COL_OFFERINGS, id);
  return normalizeOffering(doc);
}

// ── Offering Slots ────────────────────────────────────────────────────────────

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

  const res = await databases.listDocuments(DB, COL_OFFERING_SLOTS, q);
  return res.documents.map((d) => normalizeSlot(d));
}

export async function getSlotById(slotId) {
  const doc = await databases.getDocument(DB, COL_OFFERING_SLOTS, slotId);

  let offering = null;
  if (doc.offeringId) {
    try {
      const offeringDoc = await databases.getDocument(
        DB,
        COL_OFFERINGS,
        doc.offeringId,
      );
      offering = offeringDoc;
    } catch {
      /* offering may have been deleted */
    }
  }

  return normalizeSlot(doc, offering);
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

  // Batch-fetch parent offerings
  const offeringIds = [...new Set(res.documents.map((d) => d.offeringId))];
  const offeringsMap = {};

  for (const id of offeringIds) {
    try {
      const doc = await databases.getDocument(DB, COL_OFFERINGS, id);
      offeringsMap[id] = doc;
    } catch {
      /* skip deleted */
    }
  }

  let slots = res.documents.map((d) =>
    normalizeSlot(d, offeringsMap[d.offeringId] ?? null),
  );

  // Filter by category if specified (post-fetch since slots don't store category)
  if (category) {
    slots = slots.filter((s) => s.offering?.category === category);
  }

  return slots;
}

// ── Content Sections ──────────────────────────────────────────────────────────

export async function getContentSections({ enabled = true } = {}) {
  const q = [Query.orderAsc("displayOrder"), Query.limit(100)];
  if (enabled) q.push(Query.equal("enabled", true));

  const res = await databases.listDocuments(DB, COL_CONTENT_SECTIONS, q);
  return res.documents.map(normalizeContentSection);
}

// ── Search ────────────────────────────────────────────────────────────────────

export async function searchOfferings(term, { locale = "es", limit = 20 } = {}) {
  if (!term || term.length < 2) return [];

  const titleField = locale === "en" ? "titleEn" : "titleEs";

  const res = await databases.listDocuments(DB, COL_OFFERINGS, [
    Query.equal("enabled", true),
    Query.equal("status", "published"),
    Query.contains(titleField, term),
    Query.limit(limit),
  ]);

  return res.documents.map(normalizeOffering);
}
