export function getLocalizedOtherType(product, language = "es") {
  if (!product) return "";

  const normalizedLanguage = String(language ?? "es").toLowerCase();
  const preferEnglish = normalizedLanguage.startsWith("en");

  const preferred = preferEnglish
    ? product.other_type_en || product.other_type_es
    : product.other_type_es || product.other_type_en;

  return typeof preferred === "string" ? preferred.trim() : "";
}
