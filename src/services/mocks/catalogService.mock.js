/**
 * catalogService.mock.js
 * Adapter de datos de catálogo (clases, sesiones, instructores, tipos).
 * Fuente: docs/mock-data/catalog/
 *
 * Interfaz idéntica a catalogService.js (API real con Appwrite).
 */
import { delay } from './_delay'

// ── Datos mock expandidos ────────────────────────────────────────────────────

const instructors = [
  {
    $id: 'instr_ana',
    slug: 'ana-luz',
    full_name: 'Ana Luz',
    short_bio: 'Instructora enfocada en yoga suave y respiración consciente.',
    photo_id: null,
    specialties: ['yin', 'breathwork'],
    display_order: 1,
    enabled: true,
  },
  {
    $id: 'instr_mario',
    slug: 'mario-zen',
    full_name: 'Mario Zen',
    short_bio: 'Clases dinámicas para fuerza, movilidad y enfoque.',
    photo_id: null,
    specialties: ['vinyasa', 'mobility'],
    display_order: 2,
    enabled: true,
  },
  {
    $id: 'instr_sofia',
    slug: 'sofia-roots',
    full_name: 'Sofía Roots',
    short_bio: 'Especialista en meditación, hatha y prácticas restaurativas.',
    photo_id: null,
    specialties: ['hatha', 'meditation'],
    display_order: 3,
    enabled: true,
  },
]

const classTypes = [
  { $id: 'ctype_vinyasa', slug: 'vinyasa', name_es: 'Vinyasa', name_en: 'Vinyasa', enabled: true },
  { $id: 'ctype_hatha', slug: 'hatha', name_es: 'Hatha', name_en: 'Hatha', enabled: true },
  { $id: 'ctype_restorative', slug: 'restorative', name_es: 'Restaurativo', name_en: 'Restorative', enabled: true },
  { $id: 'ctype_yin', slug: 'yin', name_es: 'Yin Yoga', name_en: 'Yin Yoga', enabled: true },
  { $id: 'ctype_power', slug: 'power', name_es: 'Power Yoga', name_en: 'Power Yoga', enabled: true },
  { $id: 'ctype_meditation', slug: 'meditation', name_es: 'Meditación', name_en: 'Meditation', enabled: true },
]

const classes = [
  {
    $id: 'class_morning_flow',
    slug: 'morning-flow',
    title_es: 'Morning Flow',
    title_en: 'Morning Flow',
    summary_es: 'Activa tu mañana con una práctica fluida y energizante.',
    summary_en: 'Start your day with an energizing flow.',
    description_es: 'Clase ideal para despertar el cuerpo con movimientos fluidos sincronizados con la respiración. Trabajarás fuerza, flexibilidad y enfoque mental en una sesión de 60 minutos diseñada para todos los que quieren empezar su día con energía y claridad.',
    description_en: 'Ideal class to wake up your body with fluid movements synchronized with breath. Build strength, flexibility and mental focus in 60 minutes.',
    class_type_id: 'ctype_vinyasa',
    instructor_id: 'instr_mario',
    difficulty: 'beginner',
    duration_min: 60,
    base_price: 180,
    cover_image_id: null,
    is_featured: true,
    enabled: true,
  },
  {
    $id: 'class_night_reset',
    slug: 'night-reset',
    title_es: 'Night Reset',
    title_en: 'Night Reset',
    summary_es: 'Relaja el sistema nervioso y termina el día con suavidad.',
    summary_en: 'Slow down and reset before sleep.',
    description_es: 'Sesión de yoga restaurativo con respiración profunda y estiramientos suaves. Perfecta para liberar la tensión acumulada y preparar el cuerpo para un descanso profundo.',
    description_en: 'Restorative yoga session with deep breathing and gentle stretches. Perfect for releasing tension and preparing for deep rest.',
    class_type_id: 'ctype_restorative',
    instructor_id: 'instr_ana',
    difficulty: 'all_levels',
    duration_min: 50,
    base_price: 160,
    cover_image_id: null,
    is_featured: true,
    enabled: true,
  },
  {
    $id: 'class_power_core',
    slug: 'power-core',
    title_es: 'Power Core',
    title_en: 'Power Core',
    summary_es: 'Fortalece tu centro y desarrolla resistencia física real.',
    summary_en: 'Build core strength and real physical endurance.',
    description_es: 'Clase intensa de yoga dinámico enfocada en activar y fortalecer el core. Posiciones desafiantes, secuencias de flujo y trabajo de resistencia para practicantes con experiencia previa.',
    description_en: 'Intense dynamic yoga class focused on activating and strengthening your core. Challenging poses and flow sequences for practitioners with prior experience.',
    class_type_id: 'ctype_power',
    instructor_id: 'instr_mario',
    difficulty: 'intermediate',
    duration_min: 75,
    base_price: 200,
    cover_image_id: null,
    is_featured: true,
    enabled: true,
  },
  {
    $id: 'class_yin_deep',
    slug: 'yin-deep-stretch',
    title_es: 'Yin Deep Stretch',
    title_en: 'Yin Deep Stretch',
    summary_es: 'Abre fascias y libera tensión profunda con posturas largas.',
    summary_en: 'Open fascia and release deep tension with long-held poses.',
    description_es: 'Práctica meditativa de Yin Yoga donde cada postura se mantiene de 3 a 5 minutos. Trabaja tejidos profundos, articulaciones y flexibilidad. Ideal para complementar prácticas más activas.',
    description_en: 'Meditative Yin Yoga practice where each pose is held for 3–5 minutes. Works deep tissues, joints and flexibility.',
    class_type_id: 'ctype_yin',
    instructor_id: 'instr_ana',
    difficulty: 'all_levels',
    duration_min: 70,
    base_price: 170,
    cover_image_id: null,
    is_featured: false,
    enabled: true,
  },
  {
    $id: 'class_hatha_basics',
    slug: 'hatha-basics',
    title_es: 'Hatha Basics',
    title_en: 'Hatha Basics',
    summary_es: 'La base del yoga: alineación, respiración y conciencia corporal.',
    summary_en: 'The foundation of yoga: alignment, breath and body awareness.',
    description_es: 'Clase fundamental de Hatha Yoga para aprender la alineación correcta de posturas clásicas. Perfecta para quienes comienzan su viaje en el yoga o quieren reforzar su base técnica.',
    description_en: 'Fundamental Hatha Yoga class to learn correct alignment in classic poses. Perfect for beginners or those wanting to reinforce their technical base.',
    class_type_id: 'ctype_hatha',
    instructor_id: 'instr_sofia',
    difficulty: 'beginner',
    duration_min: 60,
    base_price: 160,
    cover_image_id: null,
    is_featured: false,
    enabled: true,
  },
  {
    $id: 'class_meditation_am',
    slug: 'morning-meditation',
    title_es: 'Meditación matutina',
    title_en: 'Morning Meditation',
    summary_es: 'Centra tu mente y establece intención para el día.',
    summary_en: 'Center your mind and set intention for the day.',
    description_es: 'Sesión guiada de meditación y pranayama para comenzar el día desde la calma. 30 minutos de práctica contemplativa con técnicas de respiración y visualización.',
    description_en: 'Guided meditation and pranayama session to start the day from stillness. 30 minutes of contemplative practice with breathing and visualization techniques.',
    class_type_id: 'ctype_meditation',
    instructor_id: 'instr_sofia',
    difficulty: 'all_levels',
    duration_min: 30,
    base_price: 120,
    cover_image_id: null,
    is_featured: false,
    enabled: true,
  },
]

// Sesiones: 2–3 por clase
const now = new Date()
const d = (days, hours = 9, mins = 0) => {
  const date = new Date(now)
  date.setDate(date.getDate() + days)
  date.setHours(hours, mins, 0, 0)
  return date.toISOString()
}

const classSessions = [
  { $id: 'sess_mf_1', class_id: 'class_morning_flow', session_date: d(1, 7, 0), end_date: d(1, 8, 0), capacity_total: 12, capacity_taken: 7, price_override: null, status: 'scheduled', location_label: 'Sala Principal', enabled: true },
  { $id: 'sess_mf_2', class_id: 'class_morning_flow', session_date: d(3, 7, 0), end_date: d(3, 8, 0), capacity_total: 12, capacity_taken: 3, price_override: null, status: 'scheduled', location_label: 'Sala Principal', enabled: true },
  { $id: 'sess_mf_3', class_id: 'class_morning_flow', session_date: d(5, 7, 0), end_date: d(5, 8, 0), capacity_total: 12, capacity_taken: 12, price_override: null, status: 'full', location_label: 'Sala Principal', enabled: true },
  { $id: 'sess_nr_1', class_id: 'class_night_reset', session_date: d(1, 20, 0), end_date: d(1, 20, 50), capacity_total: 10, capacity_taken: 4, price_override: null, status: 'scheduled', location_label: 'Sala Tranquila', enabled: true },
  { $id: 'sess_nr_2', class_id: 'class_night_reset', session_date: d(4, 20, 0), end_date: d(4, 20, 50), capacity_total: 10, capacity_taken: 1, price_override: null, status: 'scheduled', location_label: 'Sala Tranquila', enabled: true },
  { $id: 'sess_pc_1', class_id: 'class_power_core', session_date: d(2, 9, 0), end_date: d(2, 10, 15), capacity_total: 8, capacity_taken: 6, price_override: null, status: 'scheduled', location_label: 'Sala Dinámica', enabled: true },
  { $id: 'sess_pc_2', class_id: 'class_power_core', session_date: d(6, 9, 0), end_date: d(6, 10, 15), capacity_total: 8, capacity_taken: 0, price_override: null, status: 'scheduled', location_label: 'Sala Dinámica', enabled: true },
  { $id: 'sess_yin_1', class_id: 'class_yin_deep', session_date: d(2, 18, 30), end_date: d(2, 19, 40), capacity_total: 10, capacity_taken: 5, price_override: null, status: 'scheduled', location_label: 'Sala Tranquila', enabled: true },
  { $id: 'sess_hatha_1', class_id: 'class_hatha_basics', session_date: d(1, 11, 0), end_date: d(1, 12, 0), capacity_total: 15, capacity_taken: 8, price_override: null, status: 'scheduled', location_label: 'Sala Principal', enabled: true },
  { $id: 'sess_med_1', class_id: 'class_meditation_am', session_date: d(1, 6, 30), end_date: d(1, 7, 0), capacity_total: 20, capacity_taken: 11, price_override: null, status: 'scheduled', location_label: 'Sala Meditación', enabled: true },
]

// ── Helpers ──────────────────────────────────────────────────────────────────
function enrichClass(cls) {
  if (!cls) return null
  return {
    ...cls,
    instructor: instructors.find((i) => i.$id === cls.instructor_id) ?? null,
    class_type: classTypes.find((t) => t.$id === cls.class_type_id) ?? null,
  }
}

// ── API pública ───────────────────────────────────────────────────────────────

export async function getClasses({ featured } = {}) {
  await delay()
  let result = classes.filter((c) => c.enabled)
  if (featured) result = result.filter((c) => c.is_featured)
  return result.map(enrichClass)
}

export async function getClassBySlug(slug) {
  await delay()
  const cls = classes.find((c) => c.slug === slug && c.enabled)
  if (!cls) throw new Error('Class not found')
  return enrichClass(cls)
}

export async function getSessionsByClass(classId) {
  await delay()
  return classSessions.filter(
    (s) => s.class_id === classId && s.enabled && s.status !== 'cancelled'
  )
}

export async function getInstructors() {
  await delay()
  return instructors.filter((i) => i.enabled).sort((a, b) => a.display_order - b.display_order)
}

export async function getClassTypes() {
  await delay()
  return classTypes.filter((t) => t.enabled)
}

export async function getSessionById(sessionId) {
  await delay()
  const session = classSessions.find((s) => s.$id === sessionId && s.enabled)
  if (!session) throw new Error('Session not found')
  const cls = enrichClass(classes.find((c) => c.$id === session.class_id))
  return { ...session, class: cls }
}

export async function getAllSessions() {
  await delay()
  return classSessions
    .filter((s) => s.enabled)
    .map((s) => ({
      ...s,
      class: enrichClass(classes.find((c) => c.$id === s.class_id)),
    }))
}

// ── API Admin ─────────────────────────────────────────────────────────────────

export async function adminGetAllClasses() {
  await delay()
  return classes.map(enrichClass)
}

export async function adminToggleClass(classId, enabled) {
  await delay(400)
  const cls = classes.find((c) => c.$id === classId)
  if (!cls) throw new Error('Class not found')
  cls.enabled = enabled
  return enrichClass(cls)
}

export async function adminGetAllSessions() {
  await delay()
  return classSessions
    .map((s) => ({
      ...s,
      class: enrichClass(classes.find((c) => c.$id === s.class_id)),
    }))
    .sort((a, b) => new Date(a.session_date) - new Date(b.session_date))
}

export async function adminCancelSession(sessionId) {
  await delay(600)
  const session = classSessions.find((s) => s.$id === sessionId)
  if (!session) throw new Error('Session not found')
  session.status = 'cancelled'
  return { ...session }
}
