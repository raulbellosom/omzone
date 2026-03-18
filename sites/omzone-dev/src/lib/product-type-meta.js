const OTHER_TYPE_META_PREFIX = "[[other-type:";
const OTHER_TYPE_META_SUFFIX = "]]";

export function parseDescriptionWithOtherType(rawDescription) {
  const description = typeof rawDescription === "string" ? rawDescription : "";

  if (!description.startsWith(OTHER_TYPE_META_PREFIX)) {
    return { description, otherType: "" };
  }

  const suffixIndex = description.indexOf(
    OTHER_TYPE_META_SUFFIX,
    OTHER_TYPE_META_PREFIX.length,
  );

  if (suffixIndex === -1) {
    return { description, otherType: "" };
  }

  const encodedOtherType = description.slice(
    OTHER_TYPE_META_PREFIX.length,
    suffixIndex,
  );

  let otherType = encodedOtherType;
  try {
    otherType = decodeURIComponent(encodedOtherType);
  } catch {
    otherType = encodedOtherType;
  }

  const cleanDescription = description
    .slice(suffixIndex + OTHER_TYPE_META_SUFFIX.length)
    .replace(/^\r?\n/, "");

  return {
    description: cleanDescription,
    otherType: otherType.trim(),
  };
}

export function buildDescriptionWithOtherType(rawDescription, rawOtherType) {
  const { description } = parseDescriptionWithOtherType(rawDescription);
  const otherType = typeof rawOtherType === "string" ? rawOtherType.trim() : "";

  if (!otherType) return description;

  return `${OTHER_TYPE_META_PREFIX}${encodeURIComponent(otherType)}${OTHER_TYPE_META_SUFFIX}\n${description}`;
}
