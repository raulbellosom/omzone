/**
 * publicService.js — Public data layer (no auth required).
 *
 * Functions callable by unauthenticated visitors.
 */
import { functions } from "./client";
import { FN_SUBMIT_CONTACT } from "@/env";

/**
 * Submit a contact message via the submit-contact Appwrite Function.
 * @param {{ fullName: string, email: string, phone?: string, subject?: string, message: string }} data
 */
export async function submitContact(data) {
  const execution = await functions.createExecution(
    FN_SUBMIT_CONTACT,
    JSON.stringify({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject || null,
      message: data.message,
    }),
    false,
    "/",
    "POST",
    { "Content-Type": "application/json" },
  );

  let parsed = null;
  try {
    parsed = execution?.responseBody
      ? JSON.parse(execution.responseBody)
      : null;
  } catch {
    throw new Error("Invalid response from submit-contact function.");
  }

  if (!parsed?.ok) {
    throw new Error(parsed?.message || "Could not submit contact message.");
  }

  return parsed;
}
