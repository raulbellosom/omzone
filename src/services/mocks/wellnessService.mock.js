/**
 * wellnessService.mock.js
 * Adapter para productos wellness y paquetes.
 */
import { delay } from './_delay'

const wellnessProducts = [
  {
    $id: 'prod_smoothie_green',
    slug: 'green-balance-smoothie',
    name_es: 'Smoothie Green Balance',
    name_en: 'Green Balance Smoothie',
    description_es: 'Smoothie funcional de espinaca, manzana verde, jengibre y proteína vegetal. Perfecto para complementar tu práctica matutina.',
    description_en: 'Functional smoothie with spinach, green apple, ginger and plant protein. Perfect for your morning practice.',
    product_type: 'smoothie',
    price: 95,
    cover_image_id: null,
    is_addon_only: false,
    enabled: true,
    is_featured: true,
  },
  {
    $id: 'prod_smoothie_golden',
    slug: 'golden-restore-smoothie',
    name_es: 'Smoothie Golden Restore',
    name_en: 'Golden Restore Smoothie',
    description_es: 'Cúrcuma, coco, plátano y leche de almendra. Anti-inflamatorio y reconstituyente post-clase.',
    description_en: 'Turmeric, coconut, banana and almond milk. Anti-inflammatory and restorative post-class.',
    product_type: 'smoothie',
    price: 105,
    cover_image_id: null,
    is_addon_only: false,
    enabled: true,
    is_featured: true,
  },
  {
    $id: 'prod_nutrition_plan',
    slug: 'nutrition-mini-plan',
    name_es: 'Mini plan nutricional',
    name_en: 'Nutrition mini plan',
    description_es: 'Guía de 7 días de alimentación consciente diseñada para complementar tu práctica de yoga. Incluye recetas, porciones y consejos.',
    description_en: 'A 7-day mindful nutrition guide designed to complement your yoga practice. Includes recipes, portions and tips.',
    product_type: 'plan',
    price: 290,
    cover_image_id: null,
    is_addon_only: false,
    enabled: true,
    is_featured: true,
  },
  {
    $id: 'prod_supplement_mag',
    slug: 'magnesium-recovery',
    name_es: 'Magnesio Recovery',
    name_en: 'Magnesium Recovery',
    description_es: 'Suplemento de magnesio bisglicinato de alta absorción. Apoya la recuperación muscular y mejora la calidad del sueño.',
    description_en: 'High-absorption bisglycinate magnesium supplement. Supports muscle recovery and improves sleep quality.',
    product_type: 'supplement',
    price: 380,
    cover_image_id: null,
    is_addon_only: false,
    enabled: true,
    is_featured: false,
  },
  {
    $id: 'prod_snack_bar',
    slug: 'energy-wellness-bar',
    name_es: 'Barra Energy Wellness',
    name_en: 'Energy Wellness Bar',
    description_es: 'Barra de dátiles, almendras y cacao. Sin azúcar añadida, sin gluten. Energía limpia para antes o después de tu clase.',
    description_en: 'Dates, almonds and cacao bar. No added sugar, gluten-free. Clean energy before or after your class.',
    product_type: 'snack',
    price: 65,
    cover_image_id: null,
    is_addon_only: false,
    enabled: true,
    is_featured: false,
  },
  {
    $id: 'prod_consulting',
    slug: 'wellness-consulting',
    name_es: 'Asesoría wellness privada',
    name_en: 'Private wellness consultation',
    description_es: 'Sesión de 45 minutos con nuestro equipo de bienestar para diseñar tu rutina ideal de yoga + nutrición + hábitos.',
    description_en: '45-minute session with our wellness team to design your ideal yoga + nutrition + habits routine.',
    product_type: 'addon',
    price: 650,
    cover_image_id: null,
    is_addon_only: false,
    enabled: true,
    is_featured: false,
  },
  {
    $id: 'prod_welcome_kit',
    slug: 'welcome-kit',
    name_es: 'Kit de bienvenida',
    name_en: 'Welcome kit',
    description_es: 'Incluye toalla de yoga, bolsita de té relajante y guía de inicio para nuevos practicantes.',
    description_en: 'Includes yoga towel, relaxing tea bag and beginner starter guide.',
    product_type: 'addon',
    price: 450,
    cover_image_id: null,
    is_addon_only: false,
    enabled: true,
    is_featured: true,
  },
]

const wellnessPackages = [
  {
    $id: 'pkg_yoga_nutrition',
    slug: 'yoga-nutrition',
    name_es: 'Yoga + Nutrición',
    name_en: 'Yoga + Nutrition',
    description_es: 'La combinación perfecta para transformar tu cuerpo y hábitos alimenticios. Incluye membresía de 8 clases mensuales + mini plan nutricional de 7 días.',
    description_en: 'The perfect combination to transform your body and eating habits. Includes 8-class monthly membership + 7-day nutrition mini plan.',
    price: 1690,
    items_json: [
      { type: 'membership', ref: 'plan_8', label_es: '8 clases/mes', label_en: '8 classes/month' },
      { type: 'product', ref: 'prod_nutrition_plan', label_es: 'Mini plan nutricional', label_en: 'Nutrition mini plan' },
    ],
    enabled: true,
    is_featured: true,
  },
  {
    $id: 'pkg_wellness_full',
    slug: 'wellness-full',
    name_es: 'Wellness Completo',
    name_en: 'Full Wellness',
    description_es: 'Todo lo que necesitas para una transformación integral. Membresía ilimitada + plan nutricional + smoothie semanal + asesoría wellness.',
    description_en: 'Everything you need for a complete transformation. Unlimited membership + nutrition plan + weekly smoothie + wellness consultation.',
    price: 2490,
    items_json: [
      { type: 'membership', ref: 'plan_unlimited', label_es: 'Yoga ilimitado mensual', label_en: 'Monthly unlimited yoga' },
      { type: 'product', ref: 'prod_nutrition_plan', label_es: 'Mini plan nutricional', label_en: 'Nutrition mini plan' },
      { type: 'product', ref: 'prod_smoothie_green', label_es: 'Smoothie x4', label_en: 'Smoothie x4' },
      { type: 'product', ref: 'prod_consulting', label_es: 'Asesoría wellness', label_en: 'Wellness consultation' },
    ],
    enabled: true,
    is_featured: true,
  },
  {
    $id: 'pkg_starter',
    slug: 'starter-pack',
    name_es: 'Paquete Starter',
    name_en: 'Starter Pack',
    description_es: 'Ideal para comenzar tu viaje wellness. Incluye 4 clases, kit de bienvenida y un smoothie de tu elección.',
    description_en: 'Ideal to start your wellness journey. Includes 4 classes, welcome kit and a smoothie of your choice.',
    price: 890,
    items_json: [
      { type: 'membership', ref: 'plan_4', label_es: '4 clases', label_en: '4 classes' },
      { type: 'product', ref: 'prod_welcome_kit', label_es: 'Kit de bienvenida', label_en: 'Welcome kit' },
      { type: 'product', ref: 'prod_smoothie_green', label_es: 'Smoothie', label_en: 'Smoothie' },
    ],
    enabled: true,
    is_featured: false,
  },
]

// ── API ───────────────────────────────────────────────────────────────────────

export async function getWellnessProducts({ type, featuredOnly } = {}) {
  await delay()
  let result = wellnessProducts.filter((p) => p.enabled)
  if (type) result = result.filter((p) => p.product_type === type)
  if (featuredOnly) result = result.filter((p) => p.is_featured)
  return result
}

export async function getWellnessProductBySlug(slug) {
  await delay()
  const product = wellnessProducts.find((p) => p.slug === slug && p.enabled)
  if (!product) throw new Error('Product not found')
  return product
}

export async function getWellnessPackages({ featuredOnly } = {}) {
  await delay()
  let result = wellnessPackages.filter((p) => p.enabled)
  if (featuredOnly) result = result.filter((p) => p.is_featured)
  return result
}

export async function getWellnessPackageById(packageId) {
  await delay()
  const pkg = wellnessPackages.find((p) => p.$id === packageId && p.enabled)
  if (!pkg) throw new Error('Package not found')
  return pkg
}

export async function getWellnessProductById(productId) {
  await delay()
  const product = wellnessProducts.find((p) => p.$id === productId && p.enabled)
  if (!product) throw new Error('Product not found')
  return product
}

/** Extras recomendados para mostrar al reservar una clase */
export async function getClassExtras() {
  await delay()
  return wellnessProducts.filter(
    (p) => p.enabled && ['smoothie', 'snack', 'plan', 'addon'].includes(p.product_type)
  )
}

// ── API Admin ─────────────────────────────────────────────────────────────────

export async function adminGetAllProducts() {
  await delay()
  return wellnessProducts
}

export async function adminToggleProduct(productId, enabled) {
  await delay(400)
  const product = wellnessProducts.find((p) => p.$id === productId)
  if (!product) throw new Error('Product not found')
  product.enabled = enabled
  return { ...product }
}

export async function adminGetAllPackages() {
  await delay()
  return wellnessPackages
}

export async function adminTogglePackage(packageId, enabled) {
  await delay(400)
  const pkg = wellnessPackages.find((p) => p.$id === packageId)
  if (!pkg) throw new Error('Package not found')
  pkg.enabled = enabled
  return { ...pkg }
}
