/**
 * catalogService.js — Appwrite data layer para las páginas públicas y de cliente.
 *
 * Cubre: clases, sesiones, instructores, tipos de clase,
 *        productos wellness, paquetes wellness.
 */
import { Query } from 'appwrite'
import { databases } from './client'
import {
  APPWRITE_DATABASE_ID,
  COL_CLASSES,
  COL_CLASS_SESSIONS,
  COL_CLASS_TYPES,
  COL_INSTRUCTORS,
  COL_WELLNESS_PRODUCTS,
  COL_WELLNESS_PACKAGES,
} from '@/env'

const DB = APPWRITE_DATABASE_ID

// ── Normalizers ───────────────────────────────────────────────────────────────

function normalizeClass(doc) {
  if (!doc) return null
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
  }
}

function normalizeSession(doc, classDoc) {
  if (!doc) return null
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
    status: doc.status ?? 'scheduled',
    location_label: doc.locationLabel,
    enabled: doc.enabled ?? true,
    class: classDoc ? normalizeClass(classDoc) : null,
  }
}

function normalizeInstructor(doc) {
  if (!doc) return null
  return {
    $id: doc.$id,
    slug: doc.slug,
    full_name: doc.fullName,
    short_bio: doc.shortBio,
    photo_id: doc.photoId,
    specialties: doc.specialties,
    display_order: doc.displayOrder,
    enabled: doc.enabled ?? true,
  }
}

function normalizeClassType(doc) {
  if (!doc) return null
  return {
    $id: doc.$id,
    slug: doc.slug,
    name_es: doc.nameEs,
    name_en: doc.nameEn,
    description: doc.description,
    enabled: doc.enabled ?? true,
  }
}

function normalizeProduct(doc) {
  if (!doc) return null
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
  }
}

function normalizePackage(doc) {
  if (!doc) return null
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
    items_json: doc.itemsJson ? _parseJson(doc.itemsJson) : [],
    is_featured: doc.isFeatured ?? false,
    enabled: doc.enabled ?? true,
  }
}

function _parseJson(str) {
  if (!str) return null
  try { return JSON.parse(str) } catch { return null }
}

// ── Classes ───────────────────────────────────────────────────────────────────

export async function getClasses({ featured, classTypeId, limit = 50 } = {}) {
  const queries = [
    Query.equal('enabled', true),
    Query.orderAsc('titleEs'),
    Query.limit(limit),
  ]
  if (featured) queries.push(Query.equal('isFeatured', true))
  if (classTypeId) queries.push(Query.equal('classTypeId', classTypeId))
  const res = await databases.listDocuments(DB, COL_CLASSES, queries)
  return res.documents.map(normalizeClass)
}

export async function getClassBySlug(slug) {
  const res = await databases.listDocuments(DB, COL_CLASSES, [
    Query.equal('slug', slug),
    Query.limit(1),
  ])
  return res.documents.length > 0 ? normalizeClass(res.documents[0]) : null
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export async function getSessionsByClass(classId) {
  const res = await databases.listDocuments(DB, COL_CLASS_SESSIONS, [
    Query.equal('classId', classId),
    Query.equal('status', 'scheduled'),
    Query.orderAsc('sessionDate'),
    Query.limit(50),
  ])
  // Fetch the parent class once
  let classDoc = null
  if (res.documents.length > 0) {
    classDoc = await databases
      .getDocument(DB, COL_CLASSES, classId)
      .catch(() => null)
  }
  return res.documents.map(s => normalizeSession(s, classDoc))
}

export async function getSessionById(sessionId) {
  const doc = await databases.getDocument(DB, COL_CLASS_SESSIONS, sessionId)
  const classDoc = doc.classId
    ? await databases.getDocument(DB, COL_CLASSES, doc.classId).catch(() => null)
    : null
  return normalizeSession(doc, classDoc)
}

export async function getAllSessions({ limit = 100 } = {}) {
  const now = new Date().toISOString()
  const res = await databases.listDocuments(DB, COL_CLASS_SESSIONS, [
    Query.equal('status', 'scheduled'),
    Query.greaterThanEqual('sessionDate', now),
    Query.orderAsc('sessionDate'),
    Query.limit(limit),
  ])
  const sessions = res.documents

  // Batch-fetch classes
  const classIds = [...new Set(sessions.map(s => s.classId).filter(Boolean))]
  let classMap = {}
  if (classIds.length > 0) {
    const classRes = await databases.listDocuments(DB, COL_CLASSES, [
      Query.equal('$id', classIds),
      Query.limit(classIds.length),
    ])
    classMap = Object.fromEntries(classRes.documents.map(c => [c.$id, c]))
  }

  return sessions.map(s => normalizeSession(s, classMap[s.classId] ?? null))
}

// ── Instructors & Class Types ─────────────────────────────────────────────────

export async function getInstructors() {
  const res = await databases.listDocuments(DB, COL_INSTRUCTORS, [
    Query.equal('enabled', true),
    Query.orderAsc('displayOrder'),
    Query.limit(50),
  ])
  return res.documents.map(normalizeInstructor)
}

export async function getClassTypes() {
  const res = await databases.listDocuments(DB, COL_CLASS_TYPES, [
    Query.equal('enabled', true),
    Query.orderAsc('slug'),
    Query.limit(50),
  ])
  return res.documents.map(normalizeClassType)
}

// ── Wellness Products ─────────────────────────────────────────────────────────

export async function getWellnessProducts({ featured, productType, limit = 50 } = {}) {
  const queries = [
    Query.equal('enabled', true),
    Query.orderAsc('nameEs'),
    Query.limit(limit),
  ]
  if (featured) queries.push(Query.equal('isFeatured', true))
  if (productType) queries.push(Query.equal('productType', productType))
  const res = await databases.listDocuments(DB, COL_WELLNESS_PRODUCTS, queries)
  return res.documents.map(normalizeProduct)
}

export async function getWellnessProductById(productId) {
  const doc = await databases.getDocument(DB, COL_WELLNESS_PRODUCTS, productId)
  return normalizeProduct(doc)
}

export async function getClassExtras() {
  const res = await databases.listDocuments(DB, COL_WELLNESS_PRODUCTS, [
    Query.equal('enabled', true),
    Query.equal('isAddonOnly', true),
    Query.orderAsc('nameEs'),
    Query.limit(50),
  ])
  return res.documents.map(normalizeProduct)
}

// ── Wellness Packages ─────────────────────────────────────────────────────────

export async function getWellnessPackages({ featured, limit = 50 } = {}) {
  const queries = [
    Query.equal('enabled', true),
    Query.orderAsc('nameEs'),
    Query.limit(limit),
  ]
  if (featured) queries.push(Query.equal('isFeatured', true))
  const res = await databases.listDocuments(DB, COL_WELLNESS_PACKAGES, queries)
  return res.documents.map(normalizePackage)
}

export async function getWellnessPackageById(packageId) {
  const doc = await databases.getDocument(DB, COL_WELLNESS_PACKAGES, packageId)
  return normalizePackage(doc)
}
