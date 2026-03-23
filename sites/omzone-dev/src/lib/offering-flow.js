/**
 * offering-flow.js
 *
 * Canonical dynamic flow templates for offerings.
 * Each offering stores a core document + flowKey + flowConfig + termsConfig.
 */

const DEFAULT_TERMS = {
  cancellation_policy_es: "",
  cancellation_policy_en: "",
  booking_terms_es: "",
  booking_terms_en: "",
  included_es: "",
  included_en: "",
};

const DEFAULT_FLOW = {
  booking: {
    mode: "request_only",
    requires_schedule: false,
    supports_date_range: false,
  },
  pricing: {
    mode: "request_quote",
    base_price: null,
  },
  schedule: {
    duration_min: null,
  },
  guest_policy: {
    min_per_booking: 1,
    max_per_booking: 1,
  },
  location: {
    default_location_profile_id: null,
    fallback_label: null,
  },
  custom_answers: [],
};

const FLOW_TEMPLATES = {
  "wellness_studio:session": {
    flow_key: "wellness_studio.session",
    flow_version: 1,
    booking: {
      mode: "scheduled",
      requires_schedule: true,
      supports_date_range: false,
    },
    pricing: { mode: "fixed_price", base_price: 0 },
    schedule: { duration_min: 60 },
    guest_policy: { min_per_booking: 1, max_per_booking: 8 },
    toggles: {
      supports_duration: true,
      supports_guest_policy: true,
      supports_location: true,
      supports_custom_answers: true,
    },
  },
  "wellness_studio:program": {
    flow_key: "wellness_studio.program",
    flow_version: 1,
    booking: {
      mode: "scheduled",
      requires_schedule: true,
      supports_date_range: true,
    },
    pricing: { mode: "from_price", base_price: 0 },
    schedule: { duration_min: 90 },
    guest_policy: { min_per_booking: 1, max_per_booking: 12 },
    toggles: {
      supports_duration: true,
      supports_guest_policy: true,
      supports_location: true,
      supports_custom_answers: true,
    },
  },
  "immersion:immersion": {
    flow_key: "immersion.immersion",
    flow_version: 1,
    booking: {
      mode: "scheduled",
      requires_schedule: true,
      supports_date_range: true,
    },
    pricing: { mode: "from_price", base_price: 0 },
    schedule: { duration_min: 180 },
    guest_policy: { min_per_booking: 1, max_per_booking: 20 },
    toggles: {
      supports_duration: true,
      supports_guest_policy: true,
      supports_location: true,
      supports_custom_answers: true,
    },
  },
  "service:service": {
    flow_key: "service.service",
    flow_version: 1,
    booking: {
      mode: "request_only",
      requires_schedule: false,
      supports_date_range: true,
    },
    pricing: { mode: "request_quote", base_price: null },
    schedule: { duration_min: null },
    guest_policy: { min_per_booking: 1, max_per_booking: 6 },
    toggles: {
      supports_duration: false,
      supports_guest_policy: true,
      supports_location: true,
      supports_custom_answers: true,
    },
  },
  "stay:stay": {
    flow_key: "stay.stay",
    flow_version: 1,
    booking: {
      mode: "date_range",
      requires_schedule: false,
      supports_date_range: true,
    },
    pricing: { mode: "from_price", base_price: 0 },
    schedule: { duration_min: null },
    guest_policy: { min_per_booking: 1, max_per_booking: 12 },
    toggles: {
      supports_duration: false,
      supports_guest_policy: true,
      supports_location: true,
      supports_custom_answers: true,
    },
  },
  "experience:experience": {
    flow_key: "experience.experience",
    flow_version: 1,
    booking: {
      mode: "request_only",
      requires_schedule: false,
      supports_date_range: true,
    },
    pricing: { mode: "from_price", base_price: 0 },
    schedule: { duration_min: null },
    guest_policy: { min_per_booking: 1, max_per_booking: 10 },
    toggles: {
      supports_duration: false,
      supports_guest_policy: true,
      supports_location: true,
      supports_custom_answers: true,
    },
  },
};

function parseJsonMaybe(value, fallback) {
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

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function getFlowTemplate(category, type) {
  const key = `${category ?? ""}:${type ?? ""}`;
  const template = FLOW_TEMPLATES[key] ?? FLOW_TEMPLATES["service:service"];
  return {
    flow_key: template.flow_key,
    flow_version: template.flow_version,
    flow_config: {
      ...clone(DEFAULT_FLOW),
      booking: mergeSection(DEFAULT_FLOW.booking, template.booking),
      pricing: mergeSection(DEFAULT_FLOW.pricing, template.pricing),
      schedule: mergeSection(DEFAULT_FLOW.schedule, template.schedule),
      guest_policy: mergeSection(DEFAULT_FLOW.guest_policy, template.guest_policy),
      location: mergeSection(DEFAULT_FLOW.location, template.location),
      custom_answers: Array.isArray(template.custom_answers)
        ? [...template.custom_answers]
        : [],
      toggles: { ...(template.toggles ?? {}) },
    },
    terms_config: clone(DEFAULT_TERMS),
  };
}

export function ensureOfferingFlow({
  category,
  type,
  flow_key,
  flow_version,
  flow_config,
  terms_config,
} = {}) {
  const template = getFlowTemplate(category, type);
  const parsedFlow = parseJsonMaybe(flow_config, {});
  const parsedTerms = parseJsonMaybe(terms_config, {});

  const normalizedFlow = {
    ...template.flow_config,
    booking: mergeSection(template.flow_config.booking, parsedFlow.booking),
    pricing: mergeSection(template.flow_config.pricing, parsedFlow.pricing),
    schedule: mergeSection(template.flow_config.schedule, parsedFlow.schedule),
    guest_policy: mergeSection(
      template.flow_config.guest_policy,
      parsedFlow.guest_policy,
    ),
    location: mergeSection(template.flow_config.location, parsedFlow.location),
    custom_answers: Array.isArray(parsedFlow.custom_answers)
      ? parsedFlow.custom_answers
      : template.flow_config.custom_answers,
    toggles: mergeSection(template.flow_config.toggles, parsedFlow.toggles),
  };

  return {
    flow_key: flow_key || template.flow_key,
    flow_version: Number(flow_version) || template.flow_version,
    flow_config: normalizedFlow,
    terms_config: mergeSection(template.terms_config, parsedTerms),
  };
}

export function offeringDerivedFields(offering) {
  const ensured = ensureOfferingFlow({
    category: offering?.category,
    type: offering?.type,
    flow_key: offering?.flow_key,
    flow_version: offering?.flow_version,
    flow_config: offering?.flow_config,
    terms_config: offering?.terms_config,
  });

  const bookingMode = ensured.flow_config.booking?.mode ?? "request_only";
  const pricingMode = ensured.flow_config.pricing?.mode ?? "request_quote";

  const basePriceRaw = ensured.flow_config.pricing?.base_price;
  const basePrice =
    basePriceRaw === null || basePriceRaw === undefined || basePriceRaw === ""
      ? null
      : Number(basePriceRaw);

  const durationMinRaw = ensured.flow_config.schedule?.duration_min;
  const durationMin =
    durationMinRaw === null || durationMinRaw === undefined || durationMinRaw === ""
      ? null
      : Number(durationMinRaw);

  const minGuestsRaw = ensured.flow_config.guest_policy?.min_per_booking;
  const maxGuestsRaw = ensured.flow_config.guest_policy?.max_per_booking;

  const minGuests = Number.isFinite(Number(minGuestsRaw))
    ? Math.max(1, Number(minGuestsRaw))
    : 1;
  const maxGuests = Number.isFinite(Number(maxGuestsRaw))
    ? Math.max(minGuests, Number(maxGuestsRaw))
    : minGuests;

  return {
    flow_key: ensured.flow_key,
    flow_version: ensured.flow_version,
    flow_config: ensured.flow_config,
    terms_config: ensured.terms_config,
    booking_mode: bookingMode,
    pricing_mode: pricingMode,
    base_price: Number.isFinite(basePrice) ? basePrice : null,
    duration_min: Number.isFinite(durationMin) ? durationMin : null,
    min_guests: minGuests,
    max_guests: maxGuests,
    requires_schedule:
      ensured.flow_config.booking?.requires_schedule === true,
    supports_date_range:
      ensured.flow_config.booking?.supports_date_range === true,
    location_profile_id:
      ensured.flow_config.location?.default_location_profile_id ?? null,
    location_label: ensured.flow_config.location?.fallback_label ?? null,
  };
}

export function buildFlowKey(category, type) {
  return getFlowTemplate(category, type).flow_key;
}

export function getFlowOptions(category, type) {
  const template = getFlowTemplate(category, type);
  const supports = template.flow_config?.toggles ?? {};

  const bookingModes = template.flow_key.startsWith("wellness_studio")
    ? ["scheduled", "request_only"]
    : template.flow_key.startsWith("stay")
      ? ["date_range", "request_only"]
      : ["request_only", "always_available", "date_range", "scheduled"];

  const pricingModes =
    template.flow_key === "service.service"
      ? ["request_quote", "fixed_price", "from_price"]
      : ["fixed_price", "from_price", "request_quote"];

  return {
    supports_duration: supports.supports_duration === true,
    supports_guest_policy: supports.supports_guest_policy !== false,
    supports_location: supports.supports_location !== false,
    supports_custom_answers: supports.supports_custom_answers === true,
    booking_modes: bookingModes,
    pricing_modes: pricingModes,
    requires_schedule: template.flow_config.booking.requires_schedule === true,
  };
}
