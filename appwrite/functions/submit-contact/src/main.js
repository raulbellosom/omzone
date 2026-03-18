/**
 * submit-contact — Appwrite Function
 *
 * Surface:  public (no auth required)
 * Runtime:  node-20.0
 * Scopes:   databases.read, databases.write
 *
 * Receives a contact form submission, validates input, applies basic
 * rate-limiting by email, and inserts into the `contact_leads` collection.
 *
 * Environment variables (Appwrite Console Global Variables):
 *   APPWRITE_ENDPOINT
 *   APPWRITE_PROJECT_ID
 *   APPWRITE_API_KEY
 *   APPWRITE_DATABASE_ID
 *   APPWRITE_COLLECTION_CONTACT_LEADS_ID
 */

import { Client, Databases, ID, Query } from "node-appwrite";

const DB_ID = process.env.APPWRITE_DATABASE_ID ?? "main";
const COL_ID =
  process.env.APPWRITE_COLLECTION_CONTACT_LEADS_ID ?? "contact_leads";

/** Max submissions per email in a 1-hour window. */
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

/** Simple email regex — not exhaustive, Appwrite validates on insert. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Sanitize a string: trim, collapse whitespace, limit length.
 */
function sanitize(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

export default async ({ req, res, log, error }) => {
  // Only accept POST
  if (req.method !== "POST") {
    return res.json({ ok: false, message: "Method not allowed" }, 405);
  }

  // ── Init SDK ─────────────────────────────────────────────────────────────
  const client = new Client()
    .setEndpoint(
      process.env.APPWRITE_FUNCTION_API_ENDPOINT ??
        process.env.APPWRITE_ENDPOINT,
    )
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY ?? "");

  const db = new Databases(client);

  // ── Parse & validate input ───────────────────────────────────────────────
  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.json({ ok: false, message: "Invalid JSON" }, 400);
  }

  const fullName = sanitize(body?.fullName, 120);
  const email = sanitize(body?.email, 320).toLowerCase();
  const phone = sanitize(body?.phone, 20);
  const subject = sanitize(body?.subject, 200);
  const message = sanitize(body?.message, 4000);

  // Required fields
  if (!fullName || fullName.length < 2) {
    return res.json(
      { ok: false, message: "fullName is required (min 2 chars)" },
      400,
    );
  }
  if (!email || !EMAIL_RE.test(email)) {
    return res.json({ ok: false, message: "A valid email is required" }, 400);
  }
  if (!message || message.length < 10) {
    return res.json(
      { ok: false, message: "message is required (min 10 chars)" },
      400,
    );
  }

  // ── Rate limiting by email ───────────────────────────────────────────────
  try {
    const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
    const recent = await db.listDocuments(DB_ID, COL_ID, [
      Query.equal("email", email),
      Query.greaterThanEqual("$createdAt", since),
      Query.limit(RATE_LIMIT),
    ]);

    if (recent.total >= RATE_LIMIT) {
      log(`Rate limit hit for ${email} (${recent.total} in window)`);
      return res.json(
        { ok: false, message: "Too many submissions. Please try again later." },
        429,
      );
    }
  } catch (err) {
    // Non-fatal: if rate check fails, allow the submission
    error(`Rate limit check failed: ${err.message}`);
  }

  // ── Insert document ──────────────────────────────────────────────────────
  try {
    const doc = await db.createDocument(DB_ID, COL_ID, ID.unique(), {
      fullName,
      email,
      phone: phone || null,
      subject: subject || null,
      message,
      status: "new",
    });

    log(`Contact message created: ${doc.$id} from ${email}`);
    return res.json({ ok: true, id: doc.$id });
  } catch (err) {
    error(`Failed to create contact message: ${err.message}`);
    return res.json({ ok: false, message: "Could not submit message" }, 500);
  }
};
